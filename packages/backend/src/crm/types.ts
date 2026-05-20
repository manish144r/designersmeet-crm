// CRM domain types — mirrors brief/spec.md §4 data model.
// 14 resources, each backed by a table (knex/mssql in prod) or the
// in-memory store (dev/demo). Zod schemas validate write payloads.
import { z } from "zod";

export const Id = z.string();

export const VendorSchema = z.object({
  id: Id.optional(),
  name: z.string(),
  email: z.string().email(),
  phone: z.string().optional().default(""),
  tier: z.enum(["preferred", "standard", "trial"]).default("standard"),
  skills: z.array(z.string()).default([]),
  regions: z.array(z.string()).default([]),
  rating_avg: z.number().min(0).max(5).default(0),
  nda_signed_at: z.string().nullable().default(null),
  msa_signed_at: z.string().nullable().default(null),
  rate_card_json: z.record(z.any()).default({}),
  last_project_at: z.string().nullable().default(null),
  created_at: z.string().optional(),
});

export const ClientSchema = z.object({
  id: Id.optional(),
  name: z.string(),
  email: z.string().email(),
  phone: z.string().optional().default(""),
  company: z.string().optional().default(""),
  owner_user_id: z.string().optional().default(""),
  created_at: z.string().optional(),
});

export const ContactSchema = z.object({
  id: Id.optional(),
  type: z.enum(["client", "vendor", "lead"]).default("lead"),
  first_name: z.string(),
  last_name: z.string().optional().default(""),
  primary_email: z.string().email(),
  primary_phone: z.string().optional().default(""),
  address: z.string().optional().default(""),
  custom_fields_json: z.record(z.any()).default({}),
  owner_user_id: z.string().optional().default(""),
  created_at: z.string().optional(),
});

export const PipelineSchema = z.object({
  id: Id.optional(),
  name: z.string(),
  created_at: z.string().optional(),
});
export const PipelineStageSchema = z.object({
  id: Id.optional(),
  pipeline_id: z.string(),
  name: z.string(),
  order: z.number().int().default(0),
});

export const ProjectSchema = z.object({
  id: Id.optional(),
  name: z.string(),
  contact_id: z.string().optional().default(""),
  status: z
    .enum(["brief", "concept", "design", "procurement", "install", "snag", "handover", "closed"])
    .default("brief"),
  manager_user_id: z.string().optional().default(""),
  designer_user_id: z.string().optional().default(""),
  start_date: z.string().nullable().default(null),
  target_end_date: z.string().nullable().default(null),
  budget_cents: z.number().int().default(0),
  created_at: z.string().optional(),
});
export const ProjectStageSchema = z.object({
  id: Id.optional(),
  project_id: z.string(),
  name: z.string(),
  order: z.number().int().default(0),
  status: z.enum(["pending", "in_review", "approved", "skipped"]).default("pending"),
});

export const ConversationSchema = z.object({
  id: Id.optional(),
  contact_id: z.string(),
  subject: z.string().optional().default(""),
  channel: z.enum(["email", "whatsapp", "sms", "webchat", "note"]).default("email"),
  status: z.enum(["open", "snoozed", "closed"]).default("open"),
  last_message_at: z.string().optional(),
  assigned_user_id: z.string().optional().default(""),
});
export const MessageSchema = z.object({
  id: Id.optional(),
  conversation_id: z.string(),
  channel: z.enum(["email", "whatsapp", "sms", "webchat", "note", "call"]).default("email"),
  direction: z.enum(["inbound", "outbound"]).default("inbound"),
  from_address: z.string().default(""),
  to_address: z.string().default(""),
  body: z.string().default(""),
  sent_at: z.string().optional(),
});

export const CalendarEventSchema = z.object({
  id: Id.optional(),
  title: z.string(),
  contact_id: z.string().optional().default(""),
  start_at: z.string(),
  end_at: z.string(),
  type: z.enum(["personal", "service_menu", "team_collective", "class"]).default("personal"),
  status: z.enum(["confirmed", "tentative", "cancelled"]).default("confirmed"),
});

export const WorkflowSchema = z.object({
  id: Id.optional(),
  name: z.string(),
  trigger_type: z.string(),
  trigger_filters_json: z.record(z.any()).default({}),
  steps_json: z.array(z.record(z.any())).default([]),
  status: z.enum(["active", "paused", "draft"]).default("draft"),
  created_at: z.string().optional(),
});
export const WorkflowRunSchema = z.object({
  id: Id.optional(),
  workflow_id: z.string(),
  status: z.enum(["queued", "running", "succeeded", "failed"]).default("queued"),
  started_at: z.string().optional(),
  completed_at: z.string().nullable().default(null),
  error_text: z.string().nullable().default(null),
});

export const FormSchema = z.object({
  id: Id.optional(),
  name: z.string(),
  schema_json: z.array(z.record(z.any())).default([]),
  public_slug: z.string(),
  on_submit_workflow_id: z.string().nullable().default(null),
  created_at: z.string().optional(),
});
export const FormSubmissionSchema = z.object({
  id: Id.optional(),
  form_id: z.string(),
  contact_id: z.string().nullable().default(null),
  payload_json: z.record(z.any()).default({}),
  submitted_at: z.string().optional(),
});

// ── Wave B (2026-05-20) ─────────────────────────────────────────────────────
// Five identity/connections entities promoted from "Coming in Phase 2" to
// real CRUD. Same generic-router treatment as the other 14 resources.
// Special endpoints (api-key plaintext-once, email-provider test-send) live in
// crm/router.ts as targeted overrides BEFORE the generic CRUD mounts.
export const ApiKeySchema = z.object({
  id: Id.optional(),
  name: z.string().min(1),
  prefix: z.string().default(""), // first 8 chars of plaintext (e.g. "dm_live_")
  hashed_key: z.string().default(""), // sha256(plaintext)
  scope: z.enum(["read", "write", "admin"]).default("read"),
  created_by: z.string().default("u1"),
  created_at: z.string().optional(),
  last_used_at: z.string().nullable().default(null),
  expires_at: z.string().nullable().default(null),
  revoked_at: z.string().nullable().default(null),
});

export const SessionSchema = z.object({
  id: Id.optional(),
  user_id: z.string().default("u1"),
  device: z.string().default(""),
  ip: z.string().default(""),
  started_at: z.string().optional(),
  last_active_at: z.string().optional(),
  expires_at: z.string().optional(),
  revoked_at: z.string().nullable().default(null),
});

export const SsoProviderSchema = z.object({
  id: Id.optional(),
  type: z.enum(["entra", "google", "okta", "apple"]).default("entra"),
  client_id: z.string().default(""),
  tenant_id: z.string().default(""),
  redirect_uri: z.string().default(""),
  jwks_url: z.string().default(""),
  enabled: z.boolean().default(false),
  created_at: z.string().optional(),
});

// EmailProvider: config_json is opaque — sender + (encrypted) api_key.
// "encrypted" in memory mode = stripped on read (write-only secret).
export const EmailProviderSchema = z.object({
  id: Id.optional(),
  provider: z.enum(["brevo", "resend", "ses", "postmark", "smtp", "msgraph"]).default("resend"),
  sender: z.string().default(""),
  api_key_set: z.boolean().default(false), // never returns plaintext
  config_json: z.record(z.any()).default({}),
  is_default: z.boolean().default(false),
  created_at: z.string().optional(),
});

export const WebhookSubscriptionSchema = z.object({
  id: Id.optional(),
  url: z.string().url(),
  events: z.array(z.string()).default([]),
  signing_secret: z.string().default(""), // generated server-side on create
  enabled: z.boolean().default(true),
  last_fired_at: z.string().nullable().default(null),
  last_status: z.string().nullable().default(null),
  created_at: z.string().optional(),
});

export const RESOURCES = {
  vendors: VendorSchema,
  clients: ClientSchema,
  contacts: ContactSchema,
  pipelines: PipelineSchema,
  "pipeline-stages": PipelineStageSchema,
  projects: ProjectSchema,
  "project-stages": ProjectStageSchema,
  conversations: ConversationSchema,
  messages: MessageSchema,
  "calendar-events": CalendarEventSchema,
  workflows: WorkflowSchema,
  "workflow-runs": WorkflowRunSchema,
  forms: FormSchema,
  "form-submissions": FormSubmissionSchema,
  // Wave B
  "api-keys": ApiKeySchema,
  sessions: SessionSchema,
  "sso-providers": SsoProviderSchema,
  "email-providers": EmailProviderSchema,
  "webhook-subscriptions": WebhookSubscriptionSchema,
} as const;

export type ResourceName = keyof typeof RESOURCES;
