// Demo fixtures so the deployed static frontend renders real-looking data
// with no backend (VITE_DEMO_MODE=true). Mirrors packages/backend/src/crm/seed.ts.
export const demoData: Record<string, any[]> = {
  vendors: [
    { id: "v1", name: "Northwood Carpentry", email: "ops@northwood.co", tier: "preferred", skills: ["carpentry"], regions: ["VIC"], rating_avg: 4.8 },
    { id: "v2", name: "Lumen Electrical", email: "hello@lumen.elec", tier: "standard", skills: ["electrical"], regions: ["VIC", "NSW"], rating_avg: 4.4 },
    { id: "v3", name: "Pane & Co Glaziers", email: "studio@paneco.com", tier: "trial", skills: ["glazing"], regions: ["QLD"], rating_avg: 0 },
  ],
  clients: [
    { id: "c1", name: "Marlowe Residence", email: "anna@marlowe.house", company: "Marlowe Family" },
    { id: "c2", name: "Atrium Offices", email: "fitout@atrium.co", company: "Atrium Pty Ltd" },
  ],
  contacts: [
    { id: "ct1", type: "client", first_name: "Anna", last_name: "Marlowe", primary_email: "anna@marlowe.house" },
    { id: "ct2", type: "vendor", first_name: "Sam", last_name: "Northwood", primary_email: "ops@northwood.co" },
    { id: "ct3", type: "lead", first_name: "Priya", last_name: "Shah", primary_email: "priya@newleaf.co" },
  ],
  projects: [
    { id: "pr1", name: "Marlowe — Kitchen + Living", status: "design", budget_cents: 4200000 },
    { id: "pr2", name: "Atrium — Level 3 Fitout", status: "procurement", budget_cents: 18900000 },
  ],
  pipelines: [{ id: "p1", name: "Sales" }],
  conversations: [
    { id: "cv1", contact_id: "ct1", subject: "Stone selection", channel: "email", status: "open" },
    { id: "cv2", contact_id: "ct3", subject: "New enquiry", channel: "whatsapp", status: "open" },
  ],
  "calendar-events": [
    { id: "ce1", title: "Marlowe site visit", start_at: "2026-05-21T01:00:00Z", end_at: "2026-05-21T02:00:00Z" },
  ],
  workflows: [
    { id: "wf1", name: "Won opportunity → create project", status: "active" },
    { id: "wf2", name: "Deliverable approved → next milestone", status: "active" },
  ],
  forms: [
    { id: "f1", name: "Vendor onboarding", public_slug: "vendor-onboarding" },
    { id: "f2", name: "Client brief", public_slug: "client-brief" },
  ],
};

export const DEMO_MODE =
  (import.meta.env.VITE_DEMO_MODE ?? "true") === "true" ||
  (import.meta.env.VITE_AUTH_MODE ?? "dev") === "dev";
