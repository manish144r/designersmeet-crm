// Demo fixtures so the frontend renders real-looking data with no DB.
import { Collection } from "./store.js";
import type { ResourceName } from "./types.js";

const now = "2026-05-23T00:00:00.000Z";
const t = (h: number, m = 0) =>
  new Date(Date.UTC(2026, 4, 23, h, m)).toISOString();

export const stores: Record<ResourceName, Collection<{ id?: string }>> = {
  vendors: new Collection([
    { id: "v1", name: "Northwood Carpentry", email: "ops@northwood.co", phone: "+61 412 880 113", tier: "preferred", skills: ["carpentry", "joinery"], regions: ["VIC"], rating_avg: 4.8, nda_signed_at: now, msa_signed_at: now, rate_card_json: { day: 880 }, last_project_at: now, created_at: now },
    { id: "v2", name: "Lumen Electrical", email: "hello@lumen.elec", phone: "+61 401 220 904", tier: "standard", skills: ["electrical"], regions: ["VIC", "NSW"], rating_avg: 4.4, nda_signed_at: now, msa_signed_at: null, rate_card_json: { day: 760 }, last_project_at: now, created_at: now },
    { id: "v3", name: "Pane & Co Glaziers", email: "studio@paneco.com", phone: "+61 433 770 612", tier: "trial", skills: ["glazing", "fabrication"], regions: ["QLD"], rating_avg: 0, nda_signed_at: null, msa_signed_at: null, rate_card_json: {}, last_project_at: null, created_at: now },
  ]),
  clients: new Collection([
    { id: "c1", name: "Marlowe Residence", email: "anna@marlowe.house", phone: "+61 400 111 222", company: "Marlowe Family", owner_user_id: "u1", created_at: now },
    { id: "c2", name: "Atrium Offices", email: "fitout@atrium.co", phone: "+61 400 333 444", company: "Atrium Pty Ltd", owner_user_id: "u1", created_at: now },
  ]),
  contacts: new Collection([
    { id: "ct1", type: "client", first_name: "Anna", last_name: "Marlowe", primary_email: "anna@marlowe.house", primary_phone: "+61 400 111 222", address: "12 Hawthorn Rd, VIC", custom_fields_json: {}, tags: ["Client", "VIP"], owner_user_id: "u1", created_at: now },
    { id: "ct2", type: "vendor", first_name: "Sam", last_name: "Northwood", primary_email: "ops@northwood.co", primary_phone: "+61 412 880 113", address: "VIC", custom_fields_json: { skills: ["carpentry"] }, tags: ["Vendor", "Designer"], owner_user_id: "u1", created_at: now },
    { id: "ct3", type: "lead", first_name: "Priya", last_name: "Raghavan", primary_email: "priya@lumen.cafe", primary_phone: "+61 433 770 901", address: "Bengaluru", custom_fields_json: {}, tags: ["Lead", "Prospect", "VIP"], owner_user_id: "u1", created_at: now },
    { id: "ct4", type: "lead", first_name: "Arjun", last_name: "Kapoor", primary_email: "arjun@signal.work", primary_phone: "+61 412 555 022", address: "Indiranagar", custom_fields_json: {}, tags: ["Lead", "Cold"], owner_user_id: "u1", created_at: now },
    { id: "ct5", type: "client", first_name: "Tanvi", last_name: "Joshi", primary_email: "tanvi@joshi.studio", primary_phone: "+61 433 991 100", address: "MG Road", custom_fields_json: {}, tags: ["Client"], owner_user_id: "u1", created_at: now },
  ]),
  pipelines: new Collection([{ id: "p1", name: "Sales", created_at: now }]),
  "pipeline-stages": new Collection([
    { id: "ps1", pipeline_id: "p1", name: "New", order: 0 },
    { id: "ps2", pipeline_id: "p1", name: "Qualified", order: 1 },
    { id: "ps3", pipeline_id: "p1", name: "Brief", order: 2 },
    { id: "ps4", pipeline_id: "p1", name: "Proposal", order: 3 },
    { id: "ps5", pipeline_id: "p1", name: "Won", order: 4 },
  ]),
  "pipeline-deals": new Collection([
    { id: "pd1", pipeline_stage_id: "ps1", contact_name: "Suri Kapoor", contact_id: "", value: 240000, currency: "INR", note: "Residential · 3BHK · HSR", owner: "R", age: "4d", created_at: now, updated_at: now },
    { id: "pd2", pipeline_stage_id: "ps1", contact_name: "Arjun K. (Signal)", contact_id: "ct4", value: 580000, currency: "INR", note: "Co-work expansion · Indiranagar", owner: "A", age: "2d", created_at: now, updated_at: now },
    { id: "pd3", pipeline_stage_id: "ps1", contact_name: "Tanvi Joshi", contact_id: "ct5", value: 180000, currency: "INR", note: "Café fit-out · MG Road", owner: "M", age: "1d", created_at: now, updated_at: now },
    { id: "pd4", pipeline_stage_id: "ps2", contact_name: "Mehta Family", contact_id: "", value: 840000, currency: "INR", note: "Villa · Whitefield", owner: "A", age: "6d", created_at: now, updated_at: now },
    { id: "pd5", pipeline_stage_id: "ps2", contact_name: "Lumen Café (2)", contact_id: "ct3", value: 460000, currency: "INR", note: "Pune outlet expansion", owner: "M", age: "3d", created_at: now, updated_at: now },
    { id: "pd6", pipeline_stage_id: "ps3", contact_name: "Marlowe Residence", contact_id: "ct1", value: 920000, currency: "INR", note: "Kitchen + Living detail", owner: "M", age: "8d", created_at: now, updated_at: now },
    { id: "pd7", pipeline_stage_id: "ps4", contact_name: "Atrium Offices", contact_id: "", value: 1890000, currency: "INR", note: "Level 3 fitout proposal", owner: "M", age: "12d", created_at: now, updated_at: now },
    { id: "pd8", pipeline_stage_id: "ps5", contact_name: "HSR Penthouse", contact_id: "", value: 1260000, currency: "INR", note: "Closed — install Aug", owner: "A", age: "21d", created_at: now, updated_at: now },
  ]),
  projects: new Collection([
    { id: "pr1", name: "Marlowe — Kitchen + Living", contact_id: "ct1", status: "design", manager_user_id: "u1", designer_user_id: "u2", start_date: now, target_end_date: "2026-08-01", budget_cents: 4200000, created_at: now },
    { id: "pr2", name: "Atrium — Level 3 Fitout", contact_id: "c2", status: "procurement", manager_user_id: "u1", designer_user_id: "u2", start_date: now, target_end_date: "2026-09-15", budget_cents: 18900000, created_at: now },
  ]),
  "project-stages": new Collection([
    { id: "prs1", project_id: "pr1", name: "Concept", order: 0, status: "approved" },
    { id: "prs2", project_id: "pr1", name: "Design", order: 1, status: "in_review" },
    { id: "prs3", project_id: "pr1", name: "Install", order: 2, status: "pending" },
  ]),
  // Conversations — 3 email + 1 whatsapp + 2 sms. Each has subject, preview, channel, unread_count.
  conversations: new Collection([
    { id: "cv1", contact_id: "ct3", subject: "RE: Lumen concept board v2", channel: "email", status: "open", last_message_at: t(9, 30), assigned_user_id: "u1", unread_count: 0, starred: true, tags: ["client"], preview: "Sending three boards today." },
    { id: "cv2", contact_id: "ct1", subject: "Stone selection — Calacatta options", channel: "email", status: "open", last_message_at: t(8, 15), assigned_user_id: "u1", unread_count: 2, starred: false, tags: [], preview: "Can we see the Calacatta option?" },
    { id: "cv3", contact_id: "ct5", subject: "Atrium handover walk-through", channel: "email", status: "open", last_message_at: t(7, 0), assigned_user_id: "u2", unread_count: 1, starred: false, tags: [], preview: "We're booking the handover walk for next Thursday." },
    { id: "cv4", contact_id: "ct4", subject: "Indiranagar fitout enquiry", channel: "whatsapp", status: "open", last_message_at: t(6, 45), assigned_user_id: "u1", unread_count: 3, starred: false, tags: [], preview: "Hi! Got your card from Suri — can we chat about a fitout?" },
    { id: "cv5", contact_id: "ct1", subject: "Site arrival ETA", channel: "sms", status: "open", last_message_at: t(6, 0), assigned_user_id: "u1", unread_count: 0, starred: false, tags: [], preview: "On my way — 10 min." },
    { id: "cv6", contact_id: "ct5", subject: "Stone delivery confirm", channel: "sms", status: "open", last_message_at: t(5, 15), assigned_user_id: "u1", unread_count: 1, starred: false, tags: [], preview: "Truck loaded. ETA tomorrow 8 AM." },
  ]),
  messages: new Collection([
    // cv1 — Lumen Café (Priya)
    { id: "m1", conversation_id: "cv1", channel: "email", direction: "inbound", from_address: "priya@lumen.cafe", to_address: "manish@designersmeet.com", body: "Hey Manish — concept v2 looks great. Few small tweaks coming in the v3 brief.", sent_at: t(7, 0) },
    { id: "m2", conversation_id: "cv1", channel: "email", direction: "outbound", from_address: "manish@designersmeet.com", to_address: "priya@lumen.cafe", body: "Brilliant. Sending three boards today and locking procurement Friday.", sent_at: t(9, 30) },
    // cv2 — Marlowe (Anna)
    { id: "m3", conversation_id: "cv2", channel: "email", direction: "inbound", from_address: "anna@marlowe.house", to_address: "manish@designersmeet.com", body: "Can we see the Calacatta option vs the Carrara? Want to compare side by side.", sent_at: t(8, 0) },
    { id: "m4", conversation_id: "cv2", channel: "email", direction: "outbound", from_address: "manish@designersmeet.com", to_address: "anna@marlowe.house", body: "Of course. Sending two A3 boards by Friday afternoon.", sent_at: t(8, 15) },
    // cv3 — Atrium / Tanvi
    { id: "m5", conversation_id: "cv3", channel: "email", direction: "inbound", from_address: "tanvi@joshi.studio", to_address: "manish@designersmeet.com", body: "We're booking the handover walk for next Thursday. Bring snag list?", sent_at: t(7, 0) },
    // cv4 — Arjun (WhatsApp)
    { id: "m6", conversation_id: "cv4", channel: "whatsapp", direction: "inbound", from_address: "+61412555022", to_address: "DM", body: "Hi! Got your card from Suri — can we chat about a fitout?", sent_at: t(6, 30) },
    { id: "m7", conversation_id: "cv4", channel: "whatsapp", direction: "outbound", from_address: "DM", to_address: "+61412555022", body: "Hi Arjun! Sure — 4pm tomorrow work for a call?", sent_at: t(6, 35) },
    { id: "m8", conversation_id: "cv4", channel: "whatsapp", direction: "inbound", from_address: "+61412555022", to_address: "DM", body: "Perfect, talk then.", sent_at: t(6, 45) },
    // cv5 — Anna SMS
    { id: "m9", conversation_id: "cv5", channel: "sms", direction: "inbound", from_address: "+61400111222", to_address: "DM", body: "On my way — 10 min.", sent_at: t(6, 0) },
    { id: "m10", conversation_id: "cv5", channel: "sms", direction: "outbound", from_address: "DM", to_address: "+61400111222", body: "Cool, I'll be at the entrance.", sent_at: t(6, 5) },
    // cv6 — Tanvi SMS
    { id: "m11", conversation_id: "cv6", channel: "sms", direction: "inbound", from_address: "+61433991100", to_address: "DM", body: "Truck loaded. ETA tomorrow 8 AM.", sent_at: t(5, 15) },
  ]),
  "calendar-events": new Collection([
    { id: "ce1", title: "Marlowe site visit", contact_id: "ct1", start_at: "2026-05-21T01:00:00Z", end_at: "2026-05-21T02:00:00Z", type: "personal", status: "confirmed" },
    { id: "ce2", title: "Atrium handover walk", contact_id: "c2", start_at: "2026-05-23T03:00:00Z", end_at: "2026-05-23T04:00:00Z", type: "team_collective", status: "tentative" },
  ]),
  workflows: new Collection([
    { id: "wf1", name: "Won opportunity → create project", trigger_type: "opportunity.stage_changed", trigger_filters_json: { stage: "Won" }, steps_json: [{ action: "create_project" }, { action: "send_email" }], status: "active", created_at: now },
    { id: "wf2", name: "Deliverable approved → next milestone", trigger_type: "deliverable.approved", trigger_filters_json: {}, steps_json: [{ action: "unlock_milestone" }], status: "active", created_at: now },
  ]),
  "workflow-runs": new Collection([
    { id: "wr1", workflow_id: "wf1", status: "succeeded", started_at: now, completed_at: now, error_text: null },
  ]),
  forms: new Collection([
    { id: "f1", name: "Vendor onboarding", schema_json: [{ type: "text", label: "Business name" }, { type: "email", label: "Email" }], public_slug: "vendor-onboarding", on_submit_workflow_id: null, created_at: now },
    { id: "f2", name: "Client brief", schema_json: [{ type: "text", label: "Project" }, { type: "textarea", label: "Scope" }], public_slug: "client-brief", on_submit_workflow_id: "wf1", created_at: now },
    { id: "fm1", name: "Lead capture", schema_json: [{ type: "text", label: "Name" }, { type: "email", label: "Email" }, { type: "tel", label: "Phone" }], public_slug: "lead-capture", on_submit_workflow_id: null, created_at: now },
  ]),
  "form-submissions": new Collection([
    { id: "fs1", form_id: "f2", contact_id: "ct3", payload_json: { Project: "Loft reno", Scope: "Full design" }, submitted_at: now },
  ]),
  "form-responses": new Collection([
    { id: "fr1", form_id: "fm1", submitted_at: t(4, 30), data: { Name: "Suri Kapoor", Email: "suri@example.com", Phone: "+61 412 776 902" } },
    { id: "fr2", form_id: "fm1", submitted_at: t(6, 10), data: { Name: "Mehta Family", Email: "mehta@example.com", Phone: "+61 401 998 207" } },
    { id: "fr3", form_id: "fm1", submitted_at: t(7, 50), data: { Name: "Kotha Bros LLP", Email: "ops@kothabros.in", Phone: "+91 80 5566 7788" } },
  ]),
  users: new Collection([
    { id: "u1", name: "Manish Sharma", email: "admin@designersmeet.com", role: "admin", avatar_url: "", created_at: now },
    { id: "u2", name: "Riya Designer", email: "riya@designersmeet.com", role: "designer", avatar_url: "", created_at: now },
    { id: "u3", name: "Aarav PM", email: "aarav@designersmeet.com", role: "pm", avatar_url: "", created_at: now },
  ]),
  // RBAC defaults — admin has CRUD on everything; others scoped per BRIEF-24 matrix.
  "role-permissions": new Collection([
    ...["contacts","vendors","projects","pipelines","calendar","conversations","workflows","forms","settings","campaigns"].map((page) => ({
      id: `rp_admin_${page}`, role: "admin", page, can_view: true, can_create: true, can_edit: true, can_delete: true, updated_at: now,
    })),
    { id: "rp_pm_contacts", role: "pm", page: "contacts", can_view: true, can_create: true, can_edit: false, can_delete: false, updated_at: now },
    { id: "rp_pm_vendors", role: "pm", page: "vendors", can_view: true, can_create: true, can_edit: false, can_delete: false, updated_at: now },
    { id: "rp_pm_projects", role: "pm", page: "projects", can_view: true, can_create: true, can_edit: true, can_delete: true, updated_at: now },
    { id: "rp_pm_pipelines", role: "pm", page: "pipelines", can_view: true, can_create: true, can_edit: true, can_delete: true, updated_at: now },
    { id: "rp_pm_calendar", role: "pm", page: "calendar", can_view: true, can_create: true, can_edit: false, can_delete: false, updated_at: now },
    { id: "rp_pm_conversations", role: "pm", page: "conversations", can_view: true, can_create: true, can_edit: false, can_delete: false, updated_at: now },
    { id: "rp_pm_workflows", role: "pm", page: "workflows", can_view: true, can_create: true, can_edit: false, can_delete: false, updated_at: now },
    { id: "rp_pm_forms", role: "pm", page: "forms", can_view: true, can_create: true, can_edit: false, can_delete: false, updated_at: now },
    { id: "rp_pm_settings", role: "pm", page: "settings", can_view: true, can_create: false, can_edit: false, can_delete: false, updated_at: now },
    { id: "rp_pm_campaigns", role: "pm", page: "campaigns", can_view: true, can_create: true, can_edit: true, can_delete: false, updated_at: now },
    ...["contacts","vendors","projects","calendar","conversations"].map((page) => ({
      id: `rp_designer_${page}`, role: "designer", page, can_view: true, can_create: false, can_edit: false, can_delete: false, updated_at: now,
    })),
    ...["contacts","vendors","projects","pipelines","calendar","conversations"].map((page) => ({
      id: `rp_viewer_${page}`, role: "viewer", page, can_view: true, can_create: false, can_edit: false, can_delete: false, updated_at: now,
    })),
    { id: "rp_vendor_conversations", role: "vendor", page: "conversations", can_view: true, can_create: false, can_edit: false, can_delete: false, updated_at: now },
  ]),
  segments: new Collection([
    { id: "sg1", name: "VIP Clients", filter_json: { tags: ["VIP"] }, contact_count: 2, created_at: now },
    { id: "sg2", name: "Cold Leads", filter_json: { tags: ["Cold"] }, contact_count: 1, created_at: now },
    { id: "sg3", name: "Active Vendors", filter_json: { tags: ["Vendor"] }, contact_count: 1, created_at: now },
  ]),
  campaigns: new Collection([
    { id: "cm1", name: "May Newsletter", subject: "DM May update — new vendors, fresh case studies", body: "Hey {{first_name}},\n\nA quick update from the studio: three new projects on the boards, a new vendor onboarded in Pune, and a fresh look at our brand-refresh package.\n\nReply if you'd like a 20-min walk-through.\n\nManish", from_address: "hello@designersmeet.com", status: "active", target_tag: "Client", scheduled_at: null, sent_count: 5, open_rate: 0.62, click_rate: 0.21, created_at: t(0, 0) },
    { id: "cm2", name: "Cold Lead Re-engagement", subject: "Still thinking about that fitout?", body: "Hey {{first_name}},\n\nNoticed we never finished the chat about your fitout. Want a 15-min call this week?\n\nManish", from_address: "hello@designersmeet.com", status: "draft", target_tag: "Cold", scheduled_at: null, sent_count: 0, open_rate: 0, click_rate: 0, created_at: t(2, 0) },
  ]),
  "campaign-recipients": new Collection([
    { id: "cr1", campaign_id: "cm1", contact_id: "ct1", email: "anna@marlowe.house", status: "clicked", sent_at: t(0, 10), opened_at: t(0, 22), clicked_at: t(0, 25) },
    { id: "cr2", campaign_id: "cm1", contact_id: "ct3", email: "priya@lumen.cafe", status: "opened", sent_at: t(0, 10), opened_at: t(0, 18), clicked_at: null },
    { id: "cr3", campaign_id: "cm1", contact_id: "ct5", email: "tanvi@joshi.studio", status: "opened", sent_at: t(0, 10), opened_at: t(0, 30), clicked_at: null },
    { id: "cr4", campaign_id: "cm1", contact_id: "ct2", email: "ops@northwood.co", status: "sent", sent_at: t(0, 10), opened_at: null, clicked_at: null },
    { id: "cr5", campaign_id: "cm1", contact_id: "ct4", email: "arjun@signal.work", status: "bounced", sent_at: t(0, 10), opened_at: null, clicked_at: null },
    { id: "cr6", campaign_id: "cm2", contact_id: "ct4", email: "arjun@signal.work", status: "queued", sent_at: null, opened_at: null, clicked_at: null },
    { id: "cr7", campaign_id: "cm2", contact_id: "ct3", email: "priya@lumen.cafe", status: "queued", sent_at: null, opened_at: null, clicked_at: null },
  ]),
  // Wave B — seeded sparse so the demo UI lands non-empty without leaking real secrets.
  "api-keys": new Collection([
    { id: "ak1", name: "Build pipeline", prefix: "dm_live_a3f7b921", hashed_key: "***", scope: "write", created_by: "u1", created_at: now, last_used_at: now, expires_at: null, revoked_at: null },
    { id: "ak2", name: "Read-only metrics", prefix: "dm_live_c81d402e", hashed_key: "***", scope: "read", created_by: "u1", created_at: now, last_used_at: null, expires_at: "2027-01-01T00:00:00Z", revoked_at: null },
  ]),
  sessions: new Collection([
    { id: "ss1", user_id: "u1", device: "Chrome 130 · macOS", ip: "203.0.113.42", started_at: now, last_active_at: now, expires_at: "2026-05-30T00:00:00Z", revoked_at: null },
    { id: "ss2", user_id: "u1", device: "Safari · iOS 18.2", ip: "203.0.113.81", started_at: now, last_active_at: now, expires_at: "2026-05-30T00:00:00Z", revoked_at: null },
  ]),
  "sso-providers": new Collection([
    { id: "sp1", type: "entra", client_id: "", tenant_id: "", redirect_uri: "https://designersmeet-preview.surge.sh/auth/callback", jwks_url: "https://login.microsoftonline.com/common/discovery/v2.0/keys", enabled: false, created_at: now },
    { id: "sp2", type: "google", client_id: "", tenant_id: "", redirect_uri: "https://designersmeet-preview.surge.sh/auth/callback", jwks_url: "https://www.googleapis.com/oauth2/v3/certs", enabled: false, created_at: now },
    { id: "sp3", type: "apple", client_id: "", tenant_id: "", redirect_uri: "https://designersmeet-preview.surge.sh/auth/callback", jwks_url: "https://appleid.apple.com/auth/keys", enabled: false, created_at: now },
  ]),
  "email-providers": new Collection([
    { id: "ep1", provider: "resend", sender: "no-reply@designersmeet.com", api_key_set: false, config_json: { region: "us-east-1" }, is_default: true, created_at: now },
  ]),
  "webhook-subscriptions": new Collection([
    { id: "wh1", url: "https://hooks.example.com/dm", events: ["order.created", "project.stage_moved"], signing_secret: "***", enabled: true, last_fired_at: null, last_status: null, created_at: now },
  ]),
};
