// Demo fixtures so the frontend renders real-looking data with no DB.
import { Collection } from "./store.js";
import type { ResourceName } from "./types.js";

const now = "2026-05-19T00:00:00.000Z";

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
    { id: "ct1", type: "client", first_name: "Anna", last_name: "Marlowe", primary_email: "anna@marlowe.house", primary_phone: "+61 400 111 222", address: "12 Hawthorn Rd, VIC", custom_fields_json: {}, owner_user_id: "u1", created_at: now },
    { id: "ct2", type: "vendor", first_name: "Sam", last_name: "Northwood", primary_email: "ops@northwood.co", primary_phone: "+61 412 880 113", address: "VIC", custom_fields_json: { skills: ["carpentry"] }, owner_user_id: "u1", created_at: now },
    { id: "ct3", type: "lead", first_name: "Priya", last_name: "Shah", primary_email: "priya@newleaf.co", primary_phone: "", address: "", custom_fields_json: {}, owner_user_id: "u1", created_at: now },
  ]),
  pipelines: new Collection([{ id: "p1", name: "Sales", created_at: now }]),
  "pipeline-stages": new Collection([
    { id: "ps1", pipeline_id: "p1", name: "New", order: 0 },
    { id: "ps2", pipeline_id: "p1", name: "Qualified", order: 1 },
    { id: "ps3", pipeline_id: "p1", name: "Brief", order: 2 },
    { id: "ps4", pipeline_id: "p1", name: "Proposal", order: 3 },
    { id: "ps5", pipeline_id: "p1", name: "Won", order: 4 },
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
  conversations: new Collection([
    { id: "cv1", contact_id: "ct1", subject: "Stone selection", channel: "email", status: "open", last_message_at: now, assigned_user_id: "u1" },
    { id: "cv2", contact_id: "ct3", subject: "New enquiry", channel: "whatsapp", status: "open", last_message_at: now, assigned_user_id: "u1" },
  ]),
  messages: new Collection([
    { id: "m1", conversation_id: "cv1", channel: "email", direction: "inbound", from_address: "anna@marlowe.house", to_address: "hello@designersmeet.com", body: "Can we see the Calacatta option?", sent_at: now },
    { id: "m2", conversation_id: "cv1", channel: "email", direction: "outbound", from_address: "hello@designersmeet.com", to_address: "anna@marlowe.house", body: "Sending three boards today.", sent_at: now },
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
  ]),
  "form-submissions": new Collection([
    { id: "fs1", form_id: "f2", contact_id: "ct3", payload_json: { Project: "Loft reno", Scope: "Full design" }, submitted_at: now },
  ]),
};
