/**
 * graphApi.ts — Frontend client for Microsoft Graph proxy routes.
 *
 * The backend exposes /api/graph/* endpoints that forward calls to Microsoft Graph
 * using the user's own access token. This file provides typed wrappers for those routes.
 *
 * Usage:
 *   const { getGraphToken } = useAuth();
 *   const messages = await graphApi.mail.listInbox(getGraphToken, { top: 25 });
 *
 * In demo mode, getGraphToken() returns "demo-graph-token" and the backend stubs
 * all responses — no real Graph calls are made.
 */

const BASE = (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "");

async function graphRequest<T>(
  path: string,
  getGraphToken: () => Promise<string | null>,
  options: RequestInit & { json?: unknown } = {},
): Promise<T> {
  const token = await getGraphToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) headers["X-Graph-Token"] = token;

  const { json, ...rest } = options;
  const res = await fetch(`${BASE}/api/graph${path}`, {
    ...rest,
    headers: { ...headers, ...(rest.headers as Record<string, string> | undefined) },
    body: json !== undefined ? JSON.stringify(json) : rest.body,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Graph proxy ${path} → HTTP ${res.status}: ${text}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

// ─── Mail ──────────────────────────────────────────────────────────────────────

export interface GraphMessage {
  id: string;
  subject: string;
  bodyPreview: string;
  from: { emailAddress: { name: string; address: string } };
  receivedDateTime: string;
  isRead: boolean;
  hasAttachments: boolean;
  importance: "low" | "normal" | "high";
  webLink: string;
}

export interface GraphMailListResponse {
  value: GraphMessage[];
  "@odata.nextLink"?: string;
}

export interface SendMailPayload {
  to: string;
  subject: string;
  html: string;
  /** CC recipients, comma-separated */
  cc?: string;
}

// ─── Calendar ─────────────────────────────────────────────────────────────────

export interface GraphCalendarEvent {
  id: string;
  subject: string;
  start: { dateTime: string; timeZone: string };
  end: { dateTime: string; timeZone: string };
  location?: { displayName: string };
  bodyPreview: string;
  organizer: { emailAddress: { name: string; address: string } };
  attendees: Array<{
    emailAddress: { name: string; address: string };
    status: { response: string };
  }>;
  webLink: string;
  isOnlineMeeting: boolean;
  onlineMeetingUrl?: string;
}

export interface CreateEventPayload {
  subject: string;
  start: string;  // ISO 8601
  end: string;    // ISO 8601
  body?: string;
  attendees?: string[];  // email addresses
  location?: string;
}

// ─── Contacts ─────────────────────────────────────────────────────────────────

export interface GraphContact {
  id: string;
  displayName: string;
  emailAddresses: Array<{ name: string; address: string }>;
  phones: Array<{ type: string; number: string }>;
  companyName?: string;
  jobTitle?: string;
  businessHomePage?: string;
}

// ─── Profile ──────────────────────────────────────────────────────────────────

export interface GraphUserProfile {
  id: string;
  displayName: string;
  mail: string;
  userPrincipalName: string;
  jobTitle?: string;
  department?: string;
  officeLocation?: string;
  mobilePhone?: string;
  businessPhones: string[];
}

// ─── Typed API surface ────────────────────────────────────────────────────────

export const graphApi = {
  mail: {
    /** List inbox messages. top defaults to 25. */
    listInbox(
      getGraphToken: () => Promise<string | null>,
      opts: { top?: number; filter?: string } = {},
    ): Promise<GraphMailListResponse> {
      const params = new URLSearchParams();
      if (opts.top) params.set("top", String(opts.top));
      if (opts.filter) params.set("filter", opts.filter);
      const qs = params.size ? `?${params.toString()}` : "";
      return graphRequest<GraphMailListResponse>(`/mail/inbox${qs}`, getGraphToken);
    },

    /** Send an email on behalf of the signed-in user. */
    sendMail(
      getGraphToken: () => Promise<string | null>,
      payload: SendMailPayload,
    ): Promise<{ sent: boolean }> {
      return graphRequest<{ sent: boolean }>("/mail/send", getGraphToken, {
        method: "POST",
        json: payload,
      });
    },
  },

  calendar: {
    /** List calendar events in a date range. */
    listEvents(
      getGraphToken: () => Promise<string | null>,
      from: string,
      to: string,
    ): Promise<{ value: GraphCalendarEvent[] }> {
      const params = new URLSearchParams({ from, to });
      return graphRequest<{ value: GraphCalendarEvent[] }>(
        `/calendar/events?${params.toString()}`,
        getGraphToken,
      );
    },

    /** Create a calendar event. */
    createEvent(
      getGraphToken: () => Promise<string | null>,
      payload: CreateEventPayload,
    ): Promise<{ id: string }> {
      return graphRequest<{ id: string }>("/calendar/events", getGraphToken, {
        method: "POST",
        json: payload,
      });
    },
  },

  contacts: {
    /** Search Outlook contacts by name or email. */
    search(
      getGraphToken: () => Promise<string | null>,
      query: string,
    ): Promise<{ value: GraphContact[] }> {
      const params = new URLSearchParams({ q: query });
      return graphRequest<{ value: GraphContact[] }>(
        `/contacts/search?${params.toString()}`,
        getGraphToken,
      );
    },

    /** Create an Outlook contact. */
    create(
      getGraphToken: () => Promise<string | null>,
      contact: Omit<GraphContact, "id">,
    ): Promise<GraphContact> {
      return graphRequest<GraphContact>("/contacts", getGraphToken, {
        method: "POST",
        json: contact,
      });
    },
  },

  me: {
    /** Get the signed-in user's profile from Graph. */
    getProfile(
      getGraphToken: () => Promise<string | null>,
    ): Promise<GraphUserProfile> {
      return graphRequest<GraphUserProfile>("/me", getGraphToken);
    },
  },
};
