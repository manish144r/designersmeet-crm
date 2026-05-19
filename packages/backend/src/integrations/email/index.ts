// Pluggable email module (brief §8.3).
// The platform never calls a concrete ESP directly — everything goes through EmailProvider.
// When EMAIL_ENABLED=true + EMAIL_API_KEY (+ EMAIL_FROM), real HTTP fetch is used.
// Disabled / no-key path returns the same stub-<kind> SendResult so crm.test stays green.
import { config } from "../../config.js";

export type EmailKind =
  | "msgraph"
  | "gmail"
  | "imap_smtp"
  | "resend"
  | "ses"
  | "sendgrid"
  | "postmark"
  | "mailgun";
export type TrafficClass = "human_outbound" | "system_transactional";

export interface EmailDraft {
  to: string;
  from?: string;
  subject: string;
  html: string;
}
export interface SendResult {
  id: string;
  accepted: boolean;
  provider: EmailKind;
}
export interface ProviderHealth {
  kind: EmailKind;
  ok: boolean;
  detail: string;
}

export interface EmailProvider {
  kind: EmailKind;
  trafficClass: TrafficClass;
  send(draft: EmailDraft): Promise<SendResult>;
  status(): Promise<ProviderHealth>;
}

// ─── helpers ────────────────────────────────────────────────────────────────

function isActive(kind: EmailKind): boolean {
  return config.EMAIL_ENABLED && config.EMAIL_PROVIDER === kind && !!config.EMAIL_API_KEY;
}

function stubProvider(kind: EmailKind, trafficClass: TrafficClass): EmailProvider {
  return {
    kind,
    trafficClass,
    async send(_draft) {
      return { id: `stub-${kind}-${Date.now()}`, accepted: true, provider: kind };
    },
    async status() {
      return { kind, ok: true, detail: "stub adapter — not yet wired (see AIDER-HANDOFF)" };
    },
  };
}

// ─── Resend ──────────────────────────────────────────────────────────────────

function makeResend(): EmailProvider {
  const kind: EmailKind = "resend";
  const trafficClass: TrafficClass = "system_transactional";
  return {
    kind,
    trafficClass,
    async send(draft) {
      if (!isActive(kind)) {
        return { id: `stub-${kind}-${Date.now()}`, accepted: true, provider: kind };
      }
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${config.EMAIL_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: draft.from ?? config.EMAIL_FROM,
          to: [draft.to],
          subject: draft.subject,
          html: draft.html,
        }),
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(`Resend send → ${res.status}: ${t}`);
      }
      const data = (await res.json()) as { id: string };
      return { id: data.id, accepted: true, provider: kind };
    },
    async status() {
      if (!isActive(kind)) return { kind, ok: true, detail: "stub adapter — not yet wired (see AIDER-HANDOFF)" };
      try {
        const res = await fetch("https://api.resend.com/emails", {
          method: "GET",
          headers: { Authorization: `Bearer ${config.EMAIL_API_KEY}` },
        });
        return { kind, ok: res.ok || res.status === 405, detail: `Resend HTTP ${res.status}` };
      } catch (err) {
        return { kind, ok: false, detail: String(err) };
      }
    },
  };
}

// ─── SendGrid ────────────────────────────────────────────────────────────────

function makeSendgrid(): EmailProvider {
  const kind: EmailKind = "sendgrid";
  const trafficClass: TrafficClass = "system_transactional";
  return {
    kind,
    trafficClass,
    async send(draft) {
      if (!isActive(kind)) {
        return { id: `stub-${kind}-${Date.now()}`, accepted: true, provider: kind };
      }
      const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${config.EMAIL_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: draft.to }] }],
          from: { email: draft.from ?? config.EMAIL_FROM },
          subject: draft.subject,
          content: [{ type: "text/html", value: draft.html }],
        }),
      });
      // SendGrid returns 202 with empty body on success
      if (!res.ok) {
        const t = await res.text();
        throw new Error(`SendGrid send → ${res.status}: ${t}`);
      }
      return { id: `sg-${Date.now()}`, accepted: true, provider: kind };
    },
    async status() {
      if (!isActive(kind)) return { kind, ok: true, detail: "stub adapter — not yet wired (see AIDER-HANDOFF)" };
      try {
        const res = await fetch("https://api.sendgrid.com/v3/user/profile", {
          headers: { Authorization: `Bearer ${config.EMAIL_API_KEY}` },
        });
        return { kind, ok: res.ok, detail: `SendGrid HTTP ${res.status}` };
      } catch (err) {
        return { kind, ok: false, detail: String(err) };
      }
    },
  };
}

// ─── Postmark ────────────────────────────────────────────────────────────────

function makePostmark(): EmailProvider {
  const kind: EmailKind = "postmark";
  const trafficClass: TrafficClass = "system_transactional";
  return {
    kind,
    trafficClass,
    async send(draft) {
      if (!isActive(kind)) {
        return { id: `stub-${kind}-${Date.now()}`, accepted: true, provider: kind };
      }
      const res = await fetch("https://api.postmarkapp.com/email", {
        method: "POST",
        headers: {
          "X-Postmark-Server-Token": config.EMAIL_API_KEY!,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          From: draft.from ?? config.EMAIL_FROM,
          To: draft.to,
          Subject: draft.subject,
          HtmlBody: draft.html,
          MessageStream: "outbound",
        }),
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(`Postmark send → ${res.status}: ${t}`);
      }
      const data = (await res.json()) as { MessageID: string };
      return { id: data.MessageID, accepted: true, provider: kind };
    },
    async status() {
      if (!isActive(kind)) return { kind, ok: true, detail: "stub adapter — not yet wired (see AIDER-HANDOFF)" };
      try {
        const res = await fetch("https://api.postmarkapp.com/server", {
          headers: {
            "X-Postmark-Server-Token": config.EMAIL_API_KEY!,
            Accept: "application/json",
          },
        });
        return { kind, ok: res.ok, detail: `Postmark HTTP ${res.status}` };
      } catch (err) {
        return { kind, ok: false, detail: String(err) };
      }
    },
  };
}

// ─── Mailgun ─────────────────────────────────────────────────────────────────

function makeMailgun(): EmailProvider {
  const kind: EmailKind = "mailgun";
  const trafficClass: TrafficClass = "system_transactional";
  return {
    kind,
    trafficClass,
    async send(draft) {
      if (!isActive(kind)) {
        return { id: `stub-${kind}-${Date.now()}`, accepted: true, provider: kind };
      }
      // Mailgun domain is inferred from EMAIL_FROM (user@domain.com → domain.com)
      const domain = (draft.from ?? config.EMAIL_FROM).split("@")[1] ?? "sandbox.mailgun.org";
      const body = new URLSearchParams({
        from: draft.from ?? config.EMAIL_FROM,
        to: draft.to,
        subject: draft.subject,
        html: draft.html,
      });
      const credentials = Buffer.from(`api:${config.EMAIL_API_KEY}`).toString("base64");
      const res = await fetch(`https://api.mailgun.net/v3/${domain}/messages`, {
        method: "POST",
        headers: {
          Authorization: `Basic ${credentials}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: body.toString(),
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(`Mailgun send → ${res.status}: ${t}`);
      }
      const data = (await res.json()) as { id: string };
      return { id: data.id, accepted: true, provider: kind };
    },
    async status() {
      if (!isActive(kind)) return { kind, ok: true, detail: "stub adapter — not yet wired (see AIDER-HANDOFF)" };
      try {
        const credentials = Buffer.from(`api:${config.EMAIL_API_KEY}`).toString("base64");
        const res = await fetch("https://api.mailgun.net/v3/domains", {
          headers: { Authorization: `Basic ${credentials}` },
        });
        return { kind, ok: res.ok, detail: `Mailgun HTTP ${res.status}` };
      } catch (err) {
        return { kind, ok: false, detail: String(err) };
      }
    },
  };
}

// ─── MS Graph (reuses m365 sendMail) ─────────────────────────────────────────

function makeMsgraph(): EmailProvider {
  const kind: EmailKind = "msgraph";
  const trafficClass: TrafficClass = "human_outbound";
  return {
    kind,
    trafficClass,
    async send(draft) {
      if (!config.EMAIL_ENABLED || config.EMAIL_PROVIDER !== kind || !config.GRAPH_ACCESS_TOKEN) {
        return { id: `stub-${kind}-${Date.now()}`, accepted: true, provider: kind };
      }
      // Lazy import to avoid circular dep — m365 is a peer module
      const { m365 } = await import("../m365/index.js");
      const result = await m365.outlook.sendMail(draft.to, draft.subject, draft.html);
      return { id: result.id, accepted: result.sent, provider: kind };
    },
    async status() {
      if (!config.EMAIL_ENABLED || config.EMAIL_PROVIDER !== kind || !config.GRAPH_ACCESS_TOKEN) {
        return { kind, ok: true, detail: "stub adapter — not yet wired (see AIDER-HANDOFF)" };
      }
      const { m365 } = await import("../m365/index.js");
      const h = await m365.status();
      return { kind, ok: h.ok, detail: h.detail };
    },
  };
}

// ─── Interface-only stubs (ses, gmail, imap_smtp) ────────────────────────────
// ses: AWS SDK required; gmail: OAuth2 flow not suitable for key-based; imap_smtp: nodemailer.
// All return stub shape consistently; no real transport.

// ─── Registry ────────────────────────────────────────────────────────────────

// V1 build order from the brief.
export const emailProviders: Record<EmailKind, EmailProvider> = {
  msgraph: makeMsgraph(),
  resend: makeResend(),
  gmail: stubProvider("gmail", "human_outbound"),
  imap_smtp: stubProvider("imap_smtp", "human_outbound"),
  sendgrid: makeSendgrid(),
  postmark: makePostmark(),
  mailgun: makeMailgun(),
  ses: stubProvider("ses", "system_transactional"),
};

export function resolveProvider(traffic: TrafficClass): EmailProvider {
  return traffic === "system_transactional"
    ? emailProviders.resend
    : emailProviders.msgraph;
}
