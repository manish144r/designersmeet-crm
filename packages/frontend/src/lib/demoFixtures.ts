/* AUTO-EXTRACTED demo fixtures — DO NOT hand-edit row values.
 *
 * Rows are lifted VERBATIM from the in-component literal arrays in
 * packages/frontend/src/pages/01..16-*.tsx (Codex design-locked, Bengaluru
 * sample content). Field names and values are the EXACT shape the JSX already
 * reads — the downstream wiring pass relies on demoFixtures[resource] carrying
 * those same field names so a literal `const x = [...]` can be swapped for
 * `useList(resource)` with zero visual drift (≤2% per page).
 *
 * Grouped renders (kanban columns, calendar matrix) are FLATTENED to a single
 * resource array; the grouping key (e.g. `status`) is added to every row so the
 * page can re-group identically. Every row carries a stable string `id`.
 *
 * No imports. No React. Pure data + the one exported type.
 * See outputs/wiring-fieldmap.md for the per-page wire instructions.
 */

export type DemoRow = Record<string, unknown> & { id: string };

export const demoFixtures: Record<string, DemoRow[]> = {
  // ── contacts ── 04-contacts.tsx `const contacts` (12 rows, richest list).
  // Page 05 references one contact (Priya Raghavan) but as a static profile
  // header, not an iterable array, so 04 is the canonical contacts set.
  contacts: [
    { id: "ct1", initials: "PR", name: "Priya Raghavan", email: "priya@lumencafe.in", type: "Client", project: "HSR Penthouse", tag: "Hot lead", owner: "Anita M.", lastContact: "2d ago" },
    { id: "ct2", initials: "AS", name: "Aurora Studio", email: "hello@aurorastudio.in", type: "Vendor", project: "3 active projects", tag: "Tier-1 partner", owner: "Manish", lastContact: "5h ago" },
    { id: "ct3", initials: "SK", name: "Suri Kapoor", email: "suri@example.com", type: "Lead", project: "—", tag: "Discovery scheduled", owner: "Manish", lastContact: "Today" },
    { id: "ct4", initials: "MK", name: "Manjunath Karpenter Co", email: "manju@mkcarp.com", type: "Vendor", project: "2 active projects", tag: "Carpentry", owner: "Rohit", lastContact: "1d ago" },
    { id: "ct5", initials: "VE", name: "Voltek Electricals", email: "ops@voltek.in", type: "Vendor", project: "1 active project", tag: "Electrical", owner: "Rohit", lastContact: "4h ago" },
    { id: "ct6", initials: "LR", name: "Lakshmi & Ravi", email: "lakshmi.ravi@gmail.com", type: "Client", project: "JP Nagar Bungalow", tag: "Repeat client", owner: "Anita M.", lastContact: "3d ago" },
    { id: "ct7", initials: "RB", name: "Render Boutique", email: "studio@renderboutique.co", type: "Vendor", project: "Whitefield Villa", tag: "3D + VR", owner: "Manish", lastContact: "6h ago" },
    { id: "ct8", initials: "DN", name: "Deepa Nair", email: "deepa.nair@kestrel.in", type: "Client", project: "Brand Refresh — Lumen Café", tag: "Approved concept", owner: "Manish", lastContact: "Today" },
    { id: "ct9", initials: "FT", name: "FabTextiles", email: "orders@fabtextiles.in", type: "Vendor", project: "Indiranagar Loft Reno", tag: "Soft furnishings", owner: "Anita M.", lastContact: "1w ago" },
    { id: "ct10", initials: "AK", name: "Arjun Kapoor", email: "arjun.k@signalpoint.com", type: "Lead", project: "—", tag: "Cold inbound", owner: "Rohit", lastContact: "2d ago" },
    { id: "ct11", initials: "MN", name: "Marble & Stone Mart", email: "sales@msmart.in", type: "Vendor", project: "JP Nagar Bungalow", tag: "Stone supplier", owner: "Anita M.", lastContact: "4d ago" },
    { id: "ct12", initials: "PG", name: "Priti Goyal", email: "priti@studiosaffron.in", type: "Client", project: "—", tag: "Past client", owner: "Anita M.", lastContact: "1w ago" },
  ],

  // ── clients ── No page renders a distinct `clients` literal array;
  // client-type rows live in `contacts` (type === "Client"). Genuinely empty.
  clients: [],

  // ── vendors ── 06-vendors.tsx `const vendors: Vendor[]` (12 rows, richest).
  // 07-vendor-detail renders a static Aurora Studio header (not iterable),
  // already covered by ct2 / vd-... so 06 is the canonical vendors set.
  vendors: [
    { id: "vn1", initials: "AS", name: "Aurora Studio", skills: "Concept · 3D viz · Brand", regions: ["KA", "TN"], tier: "Tier-1", rating: "4.9", reviews: "12", agreement: "Signed", status: "Active" },
    { id: "vn2", initials: "MK", name: "Manjunath Karpenter Co", skills: "Carpentry · Modular", regions: ["KA"], tier: "Tier-1", rating: "4.7", reviews: "8", agreement: "Signed", status: "Active" },
    { id: "vn3", initials: "VE", name: "Voltek Electricals", skills: "Electrical · Smart home", regions: ["KA"], tier: "Tier-2", rating: "4.5", reviews: "6", agreement: "Signed", status: "Active" },
    { id: "vn4", initials: "RB", name: "Render Boutique", skills: "3D · VR walk-throughs", regions: ["KA", "MH"], tier: "Tier-1", rating: "4.8", reviews: "4", agreement: "Signed", status: "Active" },
    { id: "vn5", initials: "FT", name: "FabTextiles", skills: "Soft furnishings · Drapery", regions: ["KA", "TN"], tier: "Tier-2", rating: "4.6", reviews: "11", agreement: "Signed", status: "Active" },
    { id: "vn6", initials: "MN", name: "Marble & Stone Mart", skills: "Stone · Marble · Granite", regions: ["KA"], tier: "Tier-2", rating: "4.4", reviews: "9", agreement: "Signed", status: "Active" },
    { id: "vn7", initials: "PP", name: "Plumbline Pros", skills: "Plumbing · Sanitaryware", regions: ["KA"], tier: "Tier-3", rating: "4.2", reviews: "3", agreement: "Signed", status: "Active" },
    { id: "vn8", initials: "LP", name: "Light & Form", skills: "Lighting · Fixtures", regions: ["KA", "MH"], tier: "Tier-1", rating: "4.7", reviews: "5", agreement: "Signed", status: "Active" },
    { id: "vn9", initials: "WB", name: "Woodbarn Joinery", skills: "Joinery · Veneers", regions: ["KA"], tier: "Tier-2", rating: "4.3", reviews: "4", agreement: "Signed", status: "Paused" },
    { id: "vn10", initials: "AC", name: "AC Climate Solutions", skills: "HVAC · Climate", regions: ["KA"], tier: "Tier-3", rating: "4.1", reviews: "2", agreement: "Pending", status: "Onboarding" },
    { id: "vn11", initials: "PS", name: "Patel Steel Fab", skills: "Metalwork · Steel", regions: ["KA", "MH"], tier: "Tier-2", rating: "4.5", reviews: "6", agreement: "Signed", status: "Active" },
    { id: "vn12", initials: "GF", name: "Green Foliage Co", skills: "Landscaping · Planters", regions: ["KA"], tier: "Tier-2", rating: "4.6", reviews: "3", agreement: "Signed", status: "Active" },
  ],

  // ── projects ── 08-projects-board.tsx `projectColumns` FLATTENED.
  // Each card row gains `status` (= column.title) so the board can re-group by
  // status into the 6 columns. Column meta (count, dotClass) preserved per row
  // as `columnCount` / `dotClass` so column headers render identically.
  projects: [
    { id: "pj1", status: "Brief", columnCount: "3", dotClass: "bg-secondary", title: "Brand Refresh — Café Espresso 2", due: "Jun 14", owner: "Anita M.", milestones: "0/8", progressClass: "w-0", vendors: ["AS"] },
    { id: "pj2", status: "Brief", columnCount: "3", dotClass: "bg-secondary", title: "Whitefield Townhouse", due: "Jun 28", owner: "Manish", milestones: "0/6", progressClass: "w-0", vendors: ["MS"] },
    { id: "pj3", status: "Brief", columnCount: "3", dotClass: "bg-secondary", title: "Suri Family Home", due: "Jul 02", owner: "Rohit", milestones: "0/4", progressClass: "w-0", noVendors: true },
    { id: "pj4", status: "Concept", columnCount: "2", dotClass: "bg-info", title: "Brand Refresh — Lumen Café", due: "Jun 30", owner: "Manish", milestones: "4/12", progressClass: "w-[33%]", vendors: ["AS", "RB"] },
    { id: "pj5", status: "Concept", columnCount: "2", dotClass: "bg-info", title: "Koramangala Bar Lounge", due: "Jul 18", owner: "Anita M.", milestones: "2/9", progressClass: "w-[22%]", vendors: ["AS", "LP"] },
    { id: "pj6", status: "Design", columnCount: "3", dotClass: "bg-secondary", title: "HSR Penthouse", due: "Jul 22", owner: "Rohit", milestones: "9/14", progressClass: "w-[64%]", vendors: ["AS", "VE", "FT"] },
    { id: "pj7", status: "Design", columnCount: "3", dotClass: "bg-secondary", title: "JP Nagar Bungalow", due: "Aug 04", owner: "Anita M.", milestones: "6/11", progressClass: "w-[54%]", vendors: ["MK", "MN", "PP"] },
    { id: "pj8", status: "Design", columnCount: "3", dotClass: "bg-secondary", title: "Indiranagar Loft Reno", due: "Jun 18", owner: "Manish", milestones: "11/13", progressClass: "w-[84%]", vendors: ["MK", "FT"] },
    { id: "pj9", status: "Procurement", columnCount: "2", dotClass: "bg-warning", title: "Whitefield Villa", due: "Jul 30", owner: "Manish", milestones: "14/18", progressClass: "w-[77%]", vendors: ["AS", "MN", "PS"] },
    { id: "pj10", status: "Procurement", columnCount: "2", dotClass: "bg-warning", title: "Hennur Apartment", due: "Jul 12", owner: "Rohit", milestones: "8/10", progressClass: "w-[80%]", vendors: ["MK", "FT"] },
    { id: "pj11", status: "Install", columnCount: "2", dotClass: "bg-warning", title: "MG Road Boutique", due: "May 30", owner: "Anita M.", milestones: "20/22", progressClass: "w-[90%]", vendors: ["MK", "VE", "LP"] },
    { id: "pj12", status: "Install", columnCount: "2", dotClass: "bg-warning", title: "Banashankari Duplex", due: "Jun 06", owner: "Rohit", milestones: "18/21", progressClass: "w-[85%]", vendors: ["MK", "PP", "AC"] },
    { id: "pj13", status: "Handover", columnCount: "1", dotClass: "bg-success", title: "Sarjapur Cottage", due: "May 22", owner: "Manish", milestones: "24/24", progressClass: "w-full", vendors: ["FT", "GF"] },
  ],

  // ── pipelines ── No literal pipeline array on 10-pipelines; breadcrumb /
  // header name the single active pipeline "Sales". One synthesized row so the
  // pipeline selector has a stable source. Header copy ("5 stages", "26 open
  // opps", "₹ 85.2 L total value") preserved as fields.
  pipelines: [
    { id: "pl1", name: "Sales", stages: "5 stages", openOpps: "26 open opps", totalValue: "₹ 85.2 L total value" },
  ],

  // ── pipeline-stages ── 10-pipelines.tsx `pipelineColumns` headers FLATTENED
  // (the per-stage column meta, NOT the opportunity cards — opportunities have
  // no canonical resource and stay literal). `order` added for stable sort;
  // `pipeline_id` links to pl1.
  "pipeline-stages": [
    { id: "ps1", pipeline_id: "pl1", order: 0, title: "New", count: "8", total: "₹ 12.4 L", dotClass: "bg-muted" },
    { id: "ps2", pipeline_id: "pl1", order: 1, title: "Qualified", count: "6", total: "₹ 18.2 L", dotClass: "bg-secondary" },
    { id: "ps3", pipeline_id: "pl1", order: 2, title: "Brief", count: "5", total: "₹ 22.0 L", dotClass: "bg-foreground" },
    { id: "ps4", pipeline_id: "pl1", order: 3, title: "Proposal", count: "4", total: "₹ 16.4 L", dotClass: "bg-secondary" },
    { id: "ps5", pipeline_id: "pl1", order: 4, title: "Won", count: "3", total: "₹ 16.2 L", dotClass: "bg-foreground" },
  ],

  // ── project-stages ── 09-project-detail.tsx `const milestones` (7 nodes for
  // the "Brand Refresh — Lumen Café" project). `order` added for stable sort;
  // `project_id` links to the project this milestone bar belongs to (pj4).
  "project-stages": [
    { id: "pst1", project_id: "pj4", order: 0, label: "Brief sign-off", status: "done" },
    { id: "pst2", project_id: "pj4", order: 1, label: "Concept", status: "done" },
    { id: "pst3", project_id: "pj4", order: 2, label: "Design dev", status: "active" },
    { id: "pst4", project_id: "pj4", order: 3, label: "Procurement", status: "pending" },
    { id: "pst5", project_id: "pj4", order: 4, label: "Install", status: "pending" },
    { id: "pst6", project_id: "pj4", order: 5, label: "Snag", status: "pending" },
    { id: "pst7", project_id: "pj4", order: 6, label: "Handover", status: "pending" },
  ],

  // ── conversations ── 12-conversations.tsx `const inboxItems` (8 rows).
  conversations: [
    { id: "cv1", initials: "PR", name: "Priya Raghavan", time: "11:21", subject: "RE: Lumen concept board v2", preview: "Looks gorgeous. Two small tweaks — the brass detail above…", channel: "email", active: true, unread: true },
    { id: "cv2", initials: "AS", name: "Aurora Studio", time: "10:02", subject: "Concept board v3 uploaded", preview: "Sharing v3 with the revisions we discussed yesterday. Brass…", channel: "email" },
    { id: "cv3", initials: "VE", name: "Voltek Electricals", time: "9:14", subject: "Need MCB spec confirmation", preview: "Hi Manish, blocked on the MCB rating for the kitchen circuit…", channel: "whatsapp", unread: true },
    { id: "cv4", initials: "MK", name: "Manjunath Karpenter Co", time: "Yesterday", subject: "Carpentry shop drawings — v1", preview: "Attaching the first cut. Will revise after tomorrow's site visit.", channel: "email" },
    { id: "cv5", initials: "SK", name: "Suri Kapoor", time: "Yesterday", subject: "Discovery call confirmation", preview: "Confirming 4pm today on Teams.", channel: "email" },
    { id: "cv6", initials: "LR", name: "Lakshmi & Ravi", time: "May 16", subject: "Snag list — site visit 4", preview: "Punch list attached. Most items resolved!", channel: "email" },
    { id: "cv7", initials: "DN", name: "Deepa Nair", time: "May 15", subject: "Re: Studio Saffron — Q3 newsletter", preview: "Loved the project highlight! Sharing internally.", channel: "email" },
    { id: "cv8", initials: "FT", name: "FabTextiles", time: "May 14", subject: "Cane fabric — alt swatches", preview: "Sending two alternates. Option B has the warmer undertone…", channel: "whatsapp" },
  ],

  // ── messages ── 12-conversations.tsx `const threadMessages` (4 rows, the
  // thread for conversation cv1). `conversation_id` links to cv1.
  messages: [
    { id: "ms1", conversation_id: "cv1", initials: "MS", sender: "Manish", meta: "Sent via Outlook · May 14 at 5:02 PM", body: "Hi Priya — sharing the latest concept board from Aurora. Let us know what jumps out; we can iterate before the Wednesday call." },
    { id: "ms2", conversation_id: "cv1", initials: "PR", sender: "Priya Raghavan", meta: "Received via Outlook · Yesterday at 4:21 PM", body: "Looks gorgeous! Two small tweaks — the brass detail above the bar feels heavy, and I'd like to see the cane chair fabric in a warmer tone. Otherwise approved — let's move to procurement after this round." },
    { id: "ms3", conversation_id: "cv1", initials: "MS", sender: "Manish (internal note)", meta: "Internal note · Today at 9:18 AM", body: "@Anita — let's get Aurora to revise just the brass + fabric. Also flag for cross-sell after this project: Priya mentioned a Pune outlet.", tone: "note" },
    { id: "ms4", conversation_id: "cv1", initials: "AS", sender: "Aurora Studio", meta: "Sent via Outlook · Today at 10:02 AM", body: "v3 uploaded — brass simplified, two cane fabric options from FabTextiles (slide 12). Holding on procurement pending your sign-off." },
  ],

  // ── calendar-events ── 11-calendar.tsx `calendarRows` matrix FLATTENED.
  // Only non-null cells are kept. Each event row gains `time` (= row.label) and
  // `dayIndex` (0..6 column position; weekDays[dayIndex] gives Mon..Sun) plus
  // its original `span` / `tone` so the week grid can place + size it
  // identically. weekDays is static chrome (not data-bound) — see fieldmap.
  "calendar-events": [
    { id: "ce1", time: "8 AM", dayIndex: 3, title: "Coffee — Tanvi Joshi", detail: "Discovery · MG Road", tone: "quiet" },
    { id: "ce2", time: "9 AM", dayIndex: 0, title: "PM stand-up", detail: "Internal · Teams" },
    { id: "ce3", time: "9 AM", dayIndex: 2, title: "Vendor sync", detail: "Voltek + MK Carpenter", tone: "emphasis" },
    { id: "ce4", time: "10 AM", dayIndex: 1, title: "Concept review", detail: "Aurora Studio · Teams", span: 2 },
    { id: "ce5", time: "10 AM", dayIndex: 4, title: "Whitefield install QC", detail: "Half-day on site", span: 3, tone: "emphasis" },
    { id: "ce6", time: "11 AM", dayIndex: 0, title: "Site walk — HSR", detail: "Priya Raghavan", tone: "emphasis" },
    { id: "ce7", time: "11 AM", dayIndex: 3, title: "Sample review", detail: "FabTextiles + Aurora" },
    { id: "ce8", time: "12 PM", dayIndex: 2, title: "Site visit — JP Nagar", detail: "Lakshmi & Ravi", span: 2, tone: "emphasis" },
    { id: "ce9", time: "2 PM", dayIndex: 1, title: "Brief discovery", detail: "Suri Kapoor", tone: "quiet" },
    { id: "ce10", time: "3 PM", dayIndex: 4, title: "Weekly review", detail: "Internal" },
    { id: "ce11", time: "4 PM", dayIndex: 1, title: "Q3 board update", detail: "Internal · Outlook" },
  ],

  // ── workflows ── 13-workflows.tsx `const workflows: WorkflowItem[]` (8 rows).
  workflows: [
    { id: "wf1", name: "Vendor onboarding sequence", trigger: "Form submitted", runs: "12 runs · 30d", status: "Live", active: true },
    { id: "wf2", name: "Won opportunity → project", trigger: "Pipeline stage = Won", runs: "34 runs · 30d", status: "Live" },
    { id: "wf3", name: "Deliverable approved → next ms", trigger: "Deliverable approved", runs: "22 runs · 30d", status: "Live" },
    { id: "wf4", name: "Vendor NDA expiring (30d)", trigger: "Daily cron", runs: "4 runs · 30d", status: "Live" },
    { id: "wf5", name: "Client status digest (weekly)", trigger: "Sunday 6 PM", runs: "8 runs · 30d", status: "Live" },
    { id: "wf6", name: "Booking → SMS reminder", trigger: "Booking created", runs: "18 runs · 30d", status: "Paused" },
    { id: "wf7", name: "Tag added: Hot lead", trigger: "Tag applied", runs: "0 runs · 30d", status: "Draft" },
    { id: "wf8", name: "Shopify order → vendor fee", trigger: "Webhook: orders/paid", runs: "0 runs · 30d", status: "Draft" },
  ],

  // ── workflow-runs ── 13-workflows.tsx `const lastRuns` (5 tuples, the
  // "Last 5 runs" list for workflow wf1). Tuple positions preserved as
  // time / label / tone; `workflow_id` links to wf1.
  "workflow-runs": [
    { id: "wr1", workflow_id: "wf1", time: "4h ago", label: "success", tone: "success" },
    { id: "wr2", workflow_id: "wf1", time: "1d ago", label: "success", tone: "success" },
    { id: "wr3", workflow_id: "wf1", time: "2d ago", label: "success", tone: "success" },
    { id: "wr4", workflow_id: "wf1", time: "3d ago", label: "success", tone: "success" },
    { id: "wr5", workflow_id: "wf1", time: "5d ago", label: "retried", tone: "warning" },
  ],

  // ── forms ── No literal `forms` list array on 14-forms; the page edits ONE
  // form ("Vendor onboarding form"). One synthesized row carrying the header
  // copy (public slug, submissions count, on-submit workflow). The builder's
  // `formFields` array is the form's schema_json (opaque per FormSchema) and is
  // attached here as `schema_json` verbatim so the canvas can render from it.
  forms: [
    {
      id: "fm1",
      name: "Vendor onboarding form",
      title: "Vendor onboarding",
      subtitle: "Tell us about your studio and we'll get you set up in the DesignersMeet vendor pool.",
      public_slug: "vendor-onboarding",
      publicUrl: "forms.designersmeet.com/vendor-onboarding",
      status: "Published",
      submissions: "47 submissions",
      lastSubmission: "last 2h ago",
      on_submit_workflow_id: "wf1",
      schema_json: [
        { label: "Studio / company name", meta: "Required", required: true, kind: "input", value: "Aurora Studio" },
        { label: "Primary contact email", meta: "Required", required: true, kind: "input", value: "hello@aurorastudio.in" },
        { label: "WhatsApp number", meta: "Required", kind: "input", value: "+91 80 4123 5678" },
        { label: "Skills / disciplines", meta: "Required · 1–6 selections", active: true, kind: "badges", badges: ["Concept design", "3D visualization"], addLabel: "+ Add skill" },
        { label: "Regions you serve", meta: "Required", kind: "badges", badges: ["Karnataka", "Tamil Nadu"], addLabel: "+ Add region" },
        { label: "Years in business", meta: "Optional", kind: "input", value: "8" },
        { label: "Portfolio link", meta: "Required", kind: "input", value: "https://aurorastudio.in/work" },
        { label: "Upload latest case studies (PDF)", meta: "Optional · max 25MB", kind: "upload" },
      ],
    },
  ],

  // ── form-submissions ── No literal submission array on any page (14-forms
  // shows a count string only, the rendered form is a preview mock). Genuinely
  // empty.
  "form-submissions": [],

  // ── Wave-A Phase-2 panels (added 2026-05-20). These resources are NEW —
  // they have no literal in the locked pages and are introduced specifically
  // to back the Settings > Phase-2 panels (Audit, Workspaces, Teams, Locale,
  // Plan & usage, Invoices, Vendor portal). The seed values are synthesized
  // (not lifted from a page literal) and intentionally inhabit the same
  // Bengaluru tone as the rest of the demo.
  workspaces: [
    { id: "ws-default", name: "DesignersMeet HQ", slug: "designersmeet", created_at: "2024-08-01T00:00:00Z", members_count: 12, region: "Bengaluru", active: true },
    { id: "ws-au", name: "DesignersMeet AU", slug: "dm-au", created_at: "2026-02-12T00:00:00Z", members_count: 4, region: "Sydney", active: false },
  ],
  teams: [
    { id: "tm1", name: "Concept", color: "var(--color-foreground)", members: ["u1", "u2"], created_at: "2025-01-04T00:00:00Z", workspace_id: "ws-default" },
    { id: "tm2", name: "Site Ops", color: "var(--color-info)", members: ["u3"], created_at: "2025-01-04T00:00:00Z", workspace_id: "ws-default" },
    { id: "tm3", name: "Vendor Mgmt", color: "var(--color-success)", members: ["u1", "u3"], created_at: "2025-01-04T00:00:00Z", workspace_id: "ws-default" },
  ],
  users: [
    { id: "u1", name: "Manish Sharma", email: "manish@designersmeet.com", role: "Owner" },
    { id: "u2", name: "Priya Iyer", email: "priya@designersmeet.com", role: "Admin" },
    { id: "u3", name: "Ravi Kumar", email: "ravi@designersmeet.com", role: "Member" },
    { id: "u4", name: "Anita M.", email: "anita@designersmeet.com", role: "Admin" },
  ],
  audit_events: [],
  plan: [
    {
      id: "plan-current",
      name: "Studio",
      seats_used: 8, seats_total: 12,
      projects_used: 13, projects_limit: 50,
      storage_gb_used: 18.4, storage_gb_limit: 100,
      ai_credits_used: 6_420, ai_credits_cap: 25_000,
      renews_on: "2026-06-15",
      workspace_id: "ws-default",
    },
  ],
  invoices: [
    { id: "in-2026-05", period: "2026-05", amount: 8_900, currency: "INR", status: "due", issued_at: "2026-05-01T00:00:00Z", paid_at: null, line_items: [
      { label: "Studio plan · monthly", amount: 7_900 },
      { label: "Add-on · AI credits (+5k)", amount: 1_000 },
    ] },
    { id: "in-2026-04", period: "2026-04", amount: 7_900, currency: "INR", status: "paid", issued_at: "2026-04-01T00:00:00Z", paid_at: "2026-04-03T00:00:00Z", line_items: [
      { label: "Studio plan · monthly", amount: 7_900 },
    ] },
    { id: "in-2026-03", period: "2026-03", amount: 7_900, currency: "INR", status: "paid", issued_at: "2026-03-01T00:00:00Z", paid_at: "2026-03-02T00:00:00Z", line_items: [
      { label: "Studio plan · monthly", amount: 7_900 },
    ] },
    { id: "in-2026-02", period: "2026-02", amount: 9_400, currency: "INR", status: "paid", issued_at: "2026-02-01T00:00:00Z", paid_at: "2026-02-04T00:00:00Z", line_items: [
      { label: "Studio plan · monthly", amount: 7_900 },
      { label: "Pro-rata · seat bump", amount: 1_500 },
    ] },
    { id: "in-2026-01", period: "2026-01", amount: 7_900, currency: "INR", status: "overdue", issued_at: "2026-01-01T00:00:00Z", paid_at: null, line_items: [
      { label: "Studio plan · monthly", amount: 7_900 },
    ] },
  ],
  // Deliverables vendors can see in /vendor (filtered to their assigned projects).
  vendor_deliverables: [
    { id: "vd1", vendor_id: "vn1", project_id: "pj4", title: "Concept board v3", status: "submitted", submitted_at: "2026-05-19T10:02:00Z" },
    { id: "vd2", vendor_id: "vn1", project_id: "pj4", title: "Material palette PDF", status: "approved", submitted_at: "2026-05-17T15:30:00Z" },
    { id: "vd3", vendor_id: "vn1", project_id: "pj6", title: "3D walkthrough — HSR", status: "in_review", submitted_at: "2026-05-18T09:14:00Z" },
  ],

  // ── Wave B (2026-05-20) ────────────────────────────────────────────────
  // Five identity/connections resources. Sparse seeds so the demo lands
  // non-empty without leaking real secrets. Same keys as backend Collection
  // store — keeps demo-mode UI and live-backend UI byte-identical.
  "api-keys": [
    { id: "ak1", name: "Build pipeline", prefix: "dm_live_a3f7b921", hashed_key: "***", scope: "write", created_by: "u1", created_at: "2026-05-01T00:00:00Z", last_used_at: "2026-05-20T09:14:00Z", expires_at: null, revoked_at: null },
    { id: "ak2", name: "Read-only metrics", prefix: "dm_live_c81d402e", hashed_key: "***", scope: "read", created_by: "u1", created_at: "2026-04-12T00:00:00Z", last_used_at: null, expires_at: "2027-01-01T00:00:00Z", revoked_at: null },
  ],
  sessions: [
    { id: "ss1", user_id: "u1", device: "Chrome 130 · macOS", ip: "203.0.113.42", started_at: "2026-05-20T08:00:00Z", last_active_at: "2026-05-20T17:51:00Z", expires_at: "2026-05-22T00:00:00Z", revoked_at: null },
    { id: "ss2", user_id: "u1", device: "Safari · iOS 18.2", ip: "203.0.113.81", started_at: "2026-05-19T19:11:00Z", last_active_at: "2026-05-20T16:02:00Z", expires_at: "2026-05-22T00:00:00Z", revoked_at: null },
  ],
  "sso-providers": [
    { id: "sp1", type: "entra", client_id: "", tenant_id: "", redirect_uri: "https://designersmeet-preview.surge.sh/auth/callback", jwks_url: "https://login.microsoftonline.com/common/discovery/v2.0/keys", enabled: false, created_at: "2026-05-01T00:00:00Z" },
    { id: "sp2", type: "google", client_id: "", tenant_id: "", redirect_uri: "https://designersmeet-preview.surge.sh/auth/callback", jwks_url: "https://www.googleapis.com/oauth2/v3/certs", enabled: false, created_at: "2026-05-01T00:00:00Z" },
    { id: "sp3", type: "apple", client_id: "", tenant_id: "", redirect_uri: "https://designersmeet-preview.surge.sh/auth/callback", jwks_url: "https://appleid.apple.com/auth/keys", enabled: false, created_at: "2026-05-01T00:00:00Z" },
  ],
  "email-providers": [
    { id: "ep1", provider: "resend", sender: "no-reply@designersmeet.com", api_key_set: false, config_json: { region: "us-east-1" }, is_default: true, created_at: "2026-05-01T00:00:00Z" },
  ],
  "webhook-subscriptions": [
    { id: "wh1", url: "https://hooks.example.com/dm", events: ["order.created", "project.stage_moved"], signing_secret: "***", enabled: true, last_fired_at: null, last_status: null, created_at: "2026-05-01T00:00:00Z" },
  ],
};
