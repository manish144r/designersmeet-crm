// Pluggable email module (brief §8.3). The platform never calls a concrete
// ESP directly — everything goes through EmailProvider. Adapters are stubs;
// Aider fills in real transport per AIDER-HANDOFF.
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

function stubProvider(kind: EmailKind, trafficClass: TrafficClass): EmailProvider {
  return {
    kind,
    trafficClass,
    async send(draft) {
      return { id: `stub-${kind}-${Date.now()}`, accepted: true, provider: kind };
    },
    async status() {
      return { kind, ok: true, detail: "stub adapter — not yet wired (see AIDER-HANDOFF)" };
    },
  };
}

// V1 build order from the brief.
export const emailProviders: Record<EmailKind, EmailProvider> = {
  msgraph: stubProvider("msgraph", "human_outbound"),
  resend: stubProvider("resend", "system_transactional"),
  gmail: stubProvider("gmail", "human_outbound"),
  imap_smtp: stubProvider("imap_smtp", "human_outbound"),
  sendgrid: stubProvider("sendgrid", "system_transactional"),
  postmark: stubProvider("postmark", "system_transactional"),
  mailgun: stubProvider("mailgun", "system_transactional"),
  ses: stubProvider("ses", "system_transactional"),
};

export function resolveProvider(traffic: TrafficClass): EmailProvider {
  return traffic === "system_transactional"
    ? emailProviders.resend
    : emailProviders.msgraph;
}
