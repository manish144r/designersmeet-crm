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
} as const;

export type ResourceName = keyof typeof RESOURCES;
