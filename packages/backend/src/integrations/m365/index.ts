// Microsoft Graph adapter — supports two auth modes:
//
//   App mode (server-to-server):
//     Enabled when GRAPH_ENABLED=true and GRAPH_ACCESS_TOKEN is set.
//     Used for system-initiated calls (e.g. notifications, background jobs).
//
//   User mode (on-behalf-of user):
//     Enabled by passing a user's Graph access token to makeUserGraphClient().
//     Used by /api/graph/* proxy routes when the user has signed in via MSAL.
//     The token originates from the frontend (MSAL acquireTokenSilent with Graph scopes).
//
// Disabled path returns stub shapes so crm.test.ts stays green with no credentials.

import { config } from "../../config.js";

export interface GraphHealth {
  ok: boolean;
  detail: string;
}

const BASE = "https://graph.microsoft.com/v1.0";

// ─── Core fetch helper ────────────────────────────────────────────────────────

async function graphFetch(
  path: string,
  token: string,
  options: RequestInit = {},
): Promise<Response> {
  const url = path.startsWith("http") ? path : `${BASE}${path}`;
  const headers = new Headers(options.headers as Record<string, string> | undefined);
  headers.set("Authorization", `Bearer ${token}`);
  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }
  const res = await fetch(url, { ...options, headers });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Graph ${options.method ?? "GET"} ${path} → ${res.status}: ${body}`);
  }
  return res;
}

// ─── User-context Graph client factory ───────────────────────────────────────
// Call makeUserGraphClient(req.graphToken) in route handlers.

export interface UserGraphClient {
  mail: {
    listInbox(top?: number, filter?: string): Promise<{ value: unknown[] }>;
    sendMail(to: string, subject: string, html: string, cc?: string): Promise<{ sent: boolean }>;
    getMessage(id: string): Promise<unknown>;
    markRead(id: string): Promise<void>;
    deleteMessage(id: string): Promise<void>;
  };
  calendar: {
    listEvents(from: string, to: string): Promise<{ value: unknown[] }>;
    createEvent(subject: string, start: string, end: string, opts?: {
      body?: string;
      attendees?: string[];
      location?: string;
    }): Promise<{ id: string }>;
    updateEvent(id: string, patch: Record<string, unknown>): Promise<void>;
    deleteEvent(id: string): Promise<void>;
  };
  contacts: {
    search(query: string): Promise<{ value: unknown[] }>;
    list(top?: number): Promise<{ value: unknown[] }>;
    create(contact: Record<string, unknown>): Promise<unknown>;
    update(id: string, patch: Record<string, unknown>): Promise<void>;
    delete(id: string): Promise<void>;
  };
  me: {
    getProfile(): Promise<unknown>;
  };
}

export function makeUserGraphClient(accessToken: string): UserGraphClient {
  const g = (path: string, opts?: RequestInit) => graphFetch(path, accessToken, opts);

  return {
    mail: {
      async listInbox(top = 25, filter?: string) {
        const params = new URLSearchParams({
          $top: String(top),
          $orderby: "receivedDateTime desc",
          $select: "id,subject,bodyPreview,from,receivedDateTime,isRead,hasAttachments,importance,webLink",
        });
        if (filter) params.set("$filter", filter);
        const res = await g(`/me/messages?${params.toString()}`);
        return res.json() as Promise<{ value: unknown[] }>;
      },

      async sendMail(to: string, subject: string, html: string, cc?: string) {
        const body = {
          message: {
            subject,
            body: { contentType: "HTML", content: html },
            toRecipients: [{ emailAddress: { address: to } }],
            ...(cc ? { ccRecipients: cc.split(",").map((a) => ({ emailAddress: { address: a.trim() } })) } : {}),
          },
          saveToSentItems: true,
        };
        await g("/me/sendMail", { method: "POST", body: JSON.stringify(body) });
        return { sent: true };
      },

      async getMessage(id: string) {
        const res = await g(`/me/messages/${id}`);
        return res.json();
      },

      async markRead(id: string) {
        await g(`/me/messages/${id}`, { method: "PATCH", body: JSON.stringify({ isRead: true }) });
      },

      async deleteMessage(id: string) {
        await g(`/me/messages/${id}`, { method: "DELETE" });
      },
    },

    calendar: {
      async listEvents(from: string, to: string) {
        const params = new URLSearchParams({
          startDateTime: from,
          endDateTime: to,
          $orderby: "start/dateTime",
          $top: "50",
          $select: "id,subject,start,end,location,bodyPreview,organizer,attendees,webLink,isOnlineMeeting,onlineMeetingUrl",
        });
        const res = await g(`/me/calendarView?${params.toString()}`);
        return res.json() as Promise<{ value: unknown[] }>;
      },

      async createEvent(subject: string, start: string, end: string, opts = {}) {
        const body: Record<string, unknown> = {
          subject,
          start: { dateTime: start, timeZone: "UTC" },
          end: { dateTime: end, timeZone: "UTC" },
        };
        if (opts.body) body.body = { contentType: "HTML", content: opts.body };
        if (opts.location) body.location = { displayName: opts.location };
        if (opts.attendees?.length) {
          body.attendees = opts.attendees.map((email) => ({
            emailAddress: { address: email },
            type: "required",
          }));
        }
        const res = await g("/me/events", { method: "POST", body: JSON.stringify(body) });
        const data = (await res.json()) as { id: string };
        return { id: data.id };
      },

      async updateEvent(id: string, patch: Record<string, unknown>) {
        await g(`/me/events/${id}`, { method: "PATCH", body: JSON.stringify(patch) });
      },

      async deleteEvent(id: string) {
        await g(`/me/events/${id}`, { method: "DELETE" });
      },
    },

    contacts: {
      async search(query: string) {
        const params = new URLSearchParams({
          $search: `"${query}"`,
          $select: "id,displayName,emailAddresses,phones,companyName,jobTitle",
          $top: "25",
        });
        // $search requires ConsistencyLevel: eventual header
        const res = await g(`/me/contacts?${params.toString()}`, {
          headers: { ConsistencyLevel: "eventual" },
        });
        return res.json() as Promise<{ value: unknown[] }>;
      },

      async list(top = 50) {
        const params = new URLSearchParams({
          $top: String(top),
          $select: "id,displayName,emailAddresses,phones,companyName,jobTitle,businessHomePage",
        });
        const res = await g(`/me/contacts?${params.toString()}`);
        return res.json() as Promise<{ value: unknown[] }>;
      },

      async create(contact: Record<string, unknown>) {
        const res = await g("/me/contacts", { method: "POST", body: JSON.stringify(contact) });
        return res.json();
      },

      async update(id: string, patch: Record<string, unknown>) {
        await g(`/me/contacts/${id}`, { method: "PATCH", body: JSON.stringify(patch) });
      },

      async delete(id: string) {
        await g(`/me/contacts/${id}`, { method: "DELETE" });
      },
    },

    me: {
      async getProfile() {
        const res = await g("/me?$select=id,displayName,mail,userPrincipalName,jobTitle,department,officeLocation,mobilePhone,businessPhones");
        return res.json();
      },
    },
  };
}

// ─── App-level (static token) Graph client — unchanged from original ──────────

function getAppToken(): string {
  const token = config.GRAPH_ACCESS_TOKEN;
  if (!token) throw new Error("GRAPH_ACCESS_TOKEN not set");
  return token;
}

export const m365 = {
  outlook: {
    async sendMail(to: string, subject: string, html: string) {
      if (!config.GRAPH_ENABLED || !config.GRAPH_ACCESS_TOKEN) {
        return { id: `graph-mail-stub-${Date.now()}`, sent: true };
      }
      const result = await makeUserGraphClient(getAppToken()).mail.sendMail(to, subject, html);
      return { id: `graph-mail-${Date.now()}`, sent: result.sent };
    },

    async listInbox(top = 25) {
      if (!config.GRAPH_ENABLED || !config.GRAPH_ACCESS_TOKEN) {
        return { value: [] as unknown[] };
      }
      return makeUserGraphClient(getAppToken()).mail.listInbox(top);
    },
  },

  calendar: {
    async listEvents(from: string, to: string) {
      if (!config.GRAPH_ENABLED || !config.GRAPH_ACCESS_TOKEN) {
        return { value: [] as unknown[] };
      }
      return makeUserGraphClient(getAppToken()).calendar.listEvents(from, to);
    },

    async createEvent(subject: string, start: string, end: string) {
      if (!config.GRAPH_ENABLED || !config.GRAPH_ACCESS_TOKEN) {
        return { id: `graph-event-stub-${Date.now()}` };
      }
      return makeUserGraphClient(getAppToken()).calendar.createEvent(subject, start, end);
    },
  },

  teams: {
    async postChannelMessage(teamId: string, channelId: string, text: string) {
      if (!config.GRAPH_ENABLED || !config.GRAPH_ACCESS_TOKEN) {
        return { id: `teams-msg-stub-${Date.now()}` };
      }
      const res = await graphFetch(
        `/teams/${teamId}/channels/${channelId}/messages`,
        getAppToken(),
        { method: "POST", body: JSON.stringify({ body: { content: text } }) },
      );
      const data = (await res.json()) as { id: string };
      return { id: data.id };
    },
  },

  sharepoint: {
    async listDriveItems(driveId: string) {
      if (!config.GRAPH_ENABLED || !config.GRAPH_ACCESS_TOKEN) {
        return { value: [] as unknown[] };
      }
      const res = await graphFetch(`/drives/${driveId}/root/children`, getAppToken());
      return res.json() as Promise<{ value: unknown[] }>;
    },
  },

  planner: {
    async createTask(planId: string, title: string, bucketId?: string) {
      if (!config.GRAPH_ENABLED || !config.GRAPH_ACCESS_TOKEN) {
        return { id: `planner-task-stub-${Date.now()}` };
      }
      const body: Record<string, unknown> = { planId, title };
      if (bucketId) body.bucketId = bucketId;
      const res = await graphFetch("/planner/tasks", getAppToken(), {
        method: "POST",
        body: JSON.stringify(body),
      });
      const data = (await res.json()) as { id: string };
      return { id: data.id };
    },
  },

  async status(): Promise<GraphHealth> {
    if (!config.GRAPH_ENABLED || !config.GRAPH_ACCESS_TOKEN) {
      return { ok: true, detail: "stub adapter — GRAPH_ENABLED=false" };
    }
    try {
      await graphFetch("/me?$select=id", getAppToken());
      return { ok: true, detail: "Microsoft Graph reachable" };
    } catch (err) {
      return { ok: false, detail: String(err) };
    }
  },
};
