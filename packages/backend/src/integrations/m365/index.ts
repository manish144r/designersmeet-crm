// Microsoft Graph adapter (brief §8.1).
// When GRAPH_ENABLED=true and GRAPH_ACCESS_TOKEN is set, uses real MS Graph REST.
// Disabled path returns the same stub shapes so crm.test.ts stays green.
import { config } from "../../config.js";

export interface GraphHealth {
  ok: boolean;
  detail: string;
}

const BASE = "https://graph.microsoft.com/v1.0";

async function graphFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const token = config.GRAPH_ACCESS_TOKEN;
  if (!token) throw new Error("GRAPH_ACCESS_TOKEN not set");
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

export const m365 = {
  outlook: {
    async sendMail(to: string, subject: string, html: string) {
      if (!config.GRAPH_ENABLED || !config.GRAPH_ACCESS_TOKEN) {
        return { id: `graph-mail-stub-${Date.now()}`, sent: true };
      }
      const body = {
        message: {
          subject,
          body: { contentType: "HTML", content: html },
          toRecipients: [{ emailAddress: { address: to } }],
        },
        saveToSentItems: true,
      };
      await graphFetch("/me/sendMail", { method: "POST", body: JSON.stringify(body) });
      return { id: `graph-mail-${Date.now()}`, sent: true };
    },

    async listInbox(top = 25) {
      if (!config.GRAPH_ENABLED || !config.GRAPH_ACCESS_TOKEN) {
        return { value: [] as unknown[] };
      }
      const res = await graphFetch(`/me/messages?$top=${top}&$orderby=receivedDateTime+desc`);
      return (await res.json()) as { value: unknown[] };
    },
  },

  calendar: {
    async listEvents(from: string, to: string) {
      if (!config.GRAPH_ENABLED || !config.GRAPH_ACCESS_TOKEN) {
        return { value: [] as unknown[] };
      }
      const params = new URLSearchParams({
        startDateTime: from,
        endDateTime: to,
        $orderby: "start/dateTime",
        $top: "50",
      });
      const res = await graphFetch(`/me/calendarView?${params.toString()}`);
      return (await res.json()) as { value: unknown[] };
    },

    async createEvent(subject: string, start: string, end: string) {
      if (!config.GRAPH_ENABLED || !config.GRAPH_ACCESS_TOKEN) {
        return { id: `graph-event-stub-${Date.now()}` };
      }
      const body = {
        subject,
        start: { dateTime: start, timeZone: "UTC" },
        end: { dateTime: end, timeZone: "UTC" },
      };
      const res = await graphFetch("/me/events", { method: "POST", body: JSON.stringify(body) });
      const data = (await res.json()) as { id: string };
      return { id: data.id };
    },
  },

  teams: {
    async postChannelMessage(teamId: string, channelId: string, text: string) {
      if (!config.GRAPH_ENABLED || !config.GRAPH_ACCESS_TOKEN) {
        return { id: `teams-msg-stub-${Date.now()}` };
      }
      const body = { body: { content: text } };
      const res = await graphFetch(`/teams/${teamId}/channels/${channelId}/messages`, {
        method: "POST",
        body: JSON.stringify(body),
      });
      const data = (await res.json()) as { id: string };
      return { id: data.id };
    },
  },

  sharepoint: {
    async listDriveItems(driveId: string) {
      if (!config.GRAPH_ENABLED || !config.GRAPH_ACCESS_TOKEN) {
        return { value: [] as unknown[] };
      }
      const res = await graphFetch(`/drives/${driveId}/root/children`);
      return (await res.json()) as { value: unknown[] };
    },
  },

  planner: {
    async createTask(planId: string, title: string, bucketId?: string) {
      if (!config.GRAPH_ENABLED || !config.GRAPH_ACCESS_TOKEN) {
        return { id: `planner-task-stub-${Date.now()}` };
      }
      const body: Record<string, unknown> = { planId, title };
      if (bucketId) body.bucketId = bucketId;
      const res = await graphFetch("/planner/tasks", { method: "POST", body: JSON.stringify(body) });
      const data = (await res.json()) as { id: string };
      return { id: data.id };
    },
  },

  async status(): Promise<GraphHealth> {
    if (!config.GRAPH_ENABLED || !config.GRAPH_ACCESS_TOKEN) {
      return { ok: true, detail: "stub adapter — GRAPH_ENABLED=false" };
    }
    try {
      await graphFetch("/me?$select=id");
      return { ok: true, detail: "Microsoft Graph reachable" };
    } catch (err) {
      return { ok: false, detail: String(err) };
    }
  },
};
