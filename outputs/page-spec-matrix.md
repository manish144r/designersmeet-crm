# DesignersMeet Vendor Platform — Page Behavior-Wiring Spec Matrix

> Audit date: 2026-05-19. Source of truth: `packages/frontend/src/pages/01..16-*.tsx` (Codex design-locked, **zero event handlers today**) + matching `brief/mockups/*.html`. The TSX files are verified 1:1 faithful renders of the HTML mockups (same DOM, same copy, same Bengaluru/India sample content). Pages are pixel-locked to ≤2% drift: **wiring must add handlers/state/refs ONLY — no DOM/CSS/copy/markup edits.**

---

## Backend contract (preamble)

**Generic CRUD router** (`packages/backend/src/crm/router.ts`), mounted at `/api`, one route group per resource in `RESOURCES` (`packages/backend/src/crm/types.ts`). 14 resources: `vendors`, `clients`, `contacts`, `pipelines`, `pipeline-stages`, `projects`, `project-stages`, `conversations`, `messages`, `calendar-events`, `workflows`, `workflow-runs`, `forms`, `form-submissions`.

Routes per resource:
- `GET /api/<resource>` — list. Accepts query params: `page`, `pageSize` (default 25, max 200), `sort`, `order` (`asc`/`desc`), and any field name as a substring filter (case-insensitive `includes`). Server returns `res.json({ data: { data:[…], page, pageSize, total } })`.
- `GET /api/<resource>/:id` — single row → `res.json({ data: row })`; 404 if missing.
- `POST /api/<resource>` — Zod-validated body → 201 `{ data: row }`. Validation = full schema.
- `PUT|PATCH /api/<resource>/:id` — Zod **partial** body → `{ data: row }`; 404 if missing.
- `DELETE /api/<resource>/:id` — 204 no content; 404 if missing.

**Response envelope after client unwrap** (`packages/frontend/src/api/client.ts` strips the outer `data`):
- **list** → `useList` receives the inner `PageEnvelope`: `{ data: T[], page, pageSize, total }`. Iterate `query.data?.data` for rows; `query.data?.total` for pagination text.
- **item / create / update** → the bare row object `T`.
- **delete** → `undefined` (204).

**Hooks** (`packages/frontend/src/hooks/useResource.ts`): `useList(resource, params)`, `useItem(resource, id)`, `useCreate(resource)`, `useUpdate(resource)` (`{id, patch}`), `useRemove(resource)`. All keyed by `[resource, …]`; mutations `invalidateQueries([resource])`. No domain (non-CRUD) hooks exist.

**Demo mode** (`packages/frontend/src/lib/demoData.ts`): `DEMO_MODE` is **true by default** (`VITE_DEMO_MODE ?? "true"` OR `VITE_AUTH_MODE ?? "dev" === "dev"`). When on, every hook resolves from the in-memory `demoData` map instead of `/api`: `useList`→`{data: demoData[resource]||[], page:1, pageSize:len, total:len}`; `useItem`→`demoData[resource].find(id)`; `useCreate`→echoes body + `id: demo-<ts>`; `useUpdate`→`{id,...patch}`; `useRemove`→`true`. `demoData` only seeds: `vendors, clients, contacts, projects, pipelines, conversations, calendar-events, workflows, forms` (NOT `pipeline-stages, project-stages, messages, workflow-runs, form-submissions` — those return `[]` in demo). Auth (`auth/AuthProvider.tsx`) is demo-bypassed: `signedIn` is true, `DEMO_USER` = admin.

**Cross-cutting wiring note:** Every page renders its own hardcoded sample arrays (e.g. `const contacts = [...]`, `const vendors = [...]`, `projectColumns`, `inboxItems`). Wiring = replace the literal array source with hook data while keeping the exact same row/card JSX shape. The mock data uses Bengaluru content (Aurora Studio, Priya Raghavan, HSR Penthouse); `demoData`/`seed.ts` use AU content (Northwood Carpentry, Marlowe Residence). Field names differ between the mock literals and the Zod schema — see per-page field maps. Sidebar nav items are plain `<div>`s with no `<a>`/router link; making them navigate requires adding `onClick`/`Link` wrappers (handlers/refs only, no markup restructure beyond wrapping).

**Domain endpoints the generic CRUD router does NOT cover (must be added or simulated):** sign-in/OAuth start, M365 tenant connect (onboarding), CSV import, Excel/CSV export, kanban stage move (it IS just `PATCH projects/:id {status}` — covered), opportunity→project conversion modal, calendar slot booking, conversation reply send (email/WhatsApp/note dispatch), conversation thread merge/assign/label/archive, form submission ingest + workflow fire, workflow test-run/pause/save-steps, deliverable "request approval", milestone "mark done", booking-link copy, `window.print()` (already wired on page 16). There is no `opportunities`, `deliverables`, `tasks`, `vendor-assignments`, `milestones`, `users`, `tags`, or `bookings` resource — pages that display those map onto the closest existing resource or need new endpoints (flagged per page).

---

## Page 01 — signin

1. **Page** — `01-signin.tsx`. Route: `/signin` (when signed-out, `path="*"` → SignIn; when signed-in `/signin`→`/dashboard`). Component `DesignersMeetSignIn`.
2. **Primary entities** — None (auth). No CRM resource. Touches `auth/AuthProvider` only.
3. **Buttons / controls:**
   - `Continue with Microsoft` (primary btn) → `useAuth().signIn("microsoft")`. Demo: sets demo user → redirect `/dashboard`. Prod: `window.location = /api/auth/microsoft/start`.
   - `Continue with Google` (outline btn) → `signIn("google")`.
   - `Continue with Apple` (outline btn) → `signIn("apple")`.
   - `Continue with SAML / OIDC` (outline btn) → SSO start (no provider kind; needs `/api/auth/saml/start` — **domain endpoint, not covered**).
   - Work-email `<Input type=email>` → controlled state, feeds SAML/OIDC discovery (no submit handler exists).
   - Links: `Request access`, `Terms`, `Privacy policy`, footer `Privacy`/`Security` — `href="#"`, navigate or open modal (out of scope; can stay inert).
4. **Forms** — One email field only (`type=email`, optional, no Zod schema — auth, not a resource). No modal.
5. **Data displays** — None (static marketing aside).
6. **API routes needed** — `POST /api/auth/<provider>/start` (microsoft/google/apple/saml) — **DOMAIN, not in CRUD router**. In demo mode all resolve client-side via `AuthProvider`.
7. **Wiring risk** — Low. `signIn` already exists in context. SAML button has no provider arg in `signIn(via)` union (`microsoft|google|apple`) — wiring it needs a 4th branch or a no-op; do NOT add a visible element. Email input is uncontrolled; adding `value`/`onChange` is handler-only, safe.

---

## Page 02 — onboarding

1. **Page** — `02-onboarding.tsx`. Route: `/onboarding` (reachable signed-in and signed-out). Component `Onboarding`.
2. **Primary entities** — Conceptually `workspaces` (NOT a backend resource — no `workspaces` in `RESOURCES`). Step 3 "Import vendors" → `vendors`. No reads wired.
3. **Buttons / controls:**
   - `Skip for now` (ghost) → navigate `/dashboard`.
   - `Connect tenant` (primary, M365 card) → start M365 OAuth consent — **DOMAIN endpoint `/api/integrations/m365/connect`, not covered**.
   - `New workspace` (secondary) → open create-workspace modal — **no `workspaces` resource; needs new endpoint or inert**.
   - `Manage` (ghost, on HQ row) → navigate to Settings/workspace.
   - Sidebar nav items (Dashboard…Settings, Surfaces) — inert `<div>`s; wire to router.
   - Topbar: search input, Help, Notifications, profile chevron — global chrome (see cross-cutting).
   - 4-step progress tracker — display only, no controls.
4. **Forms** — No form fields on the page. "New workspace" implies a modal (name, slug) but no `workspaces` schema exists — flag as out-of-MVP / inert.
5. **Data displays** — Workspace list = single hardcoded "DesignersMeet HQ" row + empty state. No hook (no `workspaces` resource). 3 integration cards (Outlook/Calendar/SharePoint) static.
6. **API routes needed** — `/api/integrations/m365/connect` (DOMAIN, not covered). Optional `workspaces` resource — does not exist; recommend leaving inert or stubbing.
7. **Wiring risk** — Medium. No backing resource for the page's core concept (workspaces). Wiring is mostly nav + an external OAuth redirect. Keep static workspace row as-is (pixel-locked); do not data-bind it.

---

## Page 03 — dashboard

1. **Page** — `03-dashboard.tsx`. Route: `/dashboard` (also `/` and `/signin` redirect here). Component `Dashboard`.
2. **Primary entities** — Read-aggregate across `projects` (on-track count, "New project"), `pipelines`/`pipeline-stages` (pipeline-by-stage chart), `vendors` (utilization), `calendar-events` (today's bookings), plus deliverables/activity (**no `deliverables` or activity resource** — closest is `projects`/`project-stages`; activity has no resource).
3. **Buttons / controls:**
   - `Last 30 days` (secondary, date-range) → open range picker → re-query lists with date filter. No date filter param exists server-side beyond generic substring — **domain-ish; client-filter only**.
   - `Export` (secondary) → CSV export of dashboard data — **DOMAIN, not covered** (no export endpoint).
   - `New project` (primary) → open create-project modal → `useCreate("projects")` → `POST /api/projects`.
   - `See all` (Recent activity), `View all projects`, `Calendar` (Today's bookings), `Last 30 days`/kebab on chart card — navigate (`/projects`, `/calendar`) or open detail.
   - Sidebar nav + topbar chrome (cross-cutting).
4. **Forms** — None on page. "New project" modal would map to `ProjectSchema`: `name`(req), `contact_id`, `status`(enum, default `brief`), `manager_user_id`, `designer_user_id`, `start_date`, `target_end_date`, `budget_cents`(int). Modal does not exist in markup — must be added as a portal/Dialog (allowed: new overlay component, NOT editing the locked page body).
5. **Data displays:**
   - 4 KPI cards (Pipeline value ₹84.2L, Projects on track 9/12, Vendor utilization 68%, Deliverable cycle 3.2d) — derived/aggregate; no direct resource for these numbers. Wire from `useList("projects")`/`useList("vendors")` counts where possible; the rest stay as computed placeholders.
   - "Pipeline by stage" bar chart (5 bars New/Qualified/Brief/Proposal/Won) — feed from `pipeline-stages` (`useList("pipeline-stages")`) + opportunity sums (**no opportunities resource** — values are placeholders).
   - "Recent activity" list (5 items, actor/verb/target/meta) — **no activity resource**; leave static or map to `workflow-runs`.
   - "Upcoming deliveries this week" table (cols: Deliverable, Project, Vendor, Due, Status) — **no `deliverables` resource**; closest = `project-stages` (empty in demo). Likely stays static.
   - "Today's bookings" list (time, title, detail, badge) — feed from `useList("calendar-events")` filtered to today; map `title`, `start_at`→time, `contact_id`→detail.
   - No real filter/sort/search controls on the data (search box is global chrome).
6. **API routes needed** — `GET /api/projects`, `/api/vendors`, `/api/pipeline-stages`, `/api/calendar-events` (all CRUD-covered). `POST /api/projects` (covered). **NOT covered:** dashboard KPI aggregation endpoint, CSV export, date-range query semantics, activity feed, deliverables list.
7. **Wiring risk** — High for fidelity: most KPI/chart/table numbers have no backing resource (no opportunities/deliverables/activity). Binding only `projects`/`vendors`/`calendar-events` is safe; the rest must remain literal placeholders to preserve pixels. "New project" needs an added Dialog overlay (separate component, not body edit).

---

## Page 04 — contacts

1. **Page** — `04-contacts.tsx`. Route: `/contacts`. Component `Contacts`.
2. **Primary entities** — `contacts` (primary). Type filter (Client/Vendor/Lead) maps to `ContactSchema.type` enum (`client|vendor|lead`).
3. **Buttons / controls:**
   - `Import CSV` (secondary) → CSV upload → bulk create — **DOMAIN, not covered** (no import endpoint).
   - `Export` (secondary) → CSV export — **DOMAIN, not covered**.
   - `New contact` (primary) → create modal → `useCreate("contacts")` → `POST /api/contacts`.
   - Saved-filter chips: `All 2,438`, `Clients 312`, `Vendors 41`, `Open leads 89`, `Tier-1 partners 7`, `+ Saved filter` — each sets `useList("contacts", {type:…})` filter / saved view. `+ Saved filter` → save-view (no resource; client state).
   - Filter bar: `Filter contacts…` search input → `useList` `name` substring param; `Type: Any`, `Tag: Any`, `Owner: Anyone`, `Last seen: 30 days` dropdowns → list filter params (`type`, `owner_user_id`; `tag`/`last seen` have no schema field — client-only or no-op). `Add filter`, `Save view`, list/grid view toggle (2 icon btns).
   - Header checkbox (select-all) + per-row checkbox → bulk-select state → bulk actions (no bulk endpoint; loop deletes/updates).
   - Row click → navigate `/contacts/:id`.
   - Per-row kebab (`MoreHorizontal`) → row menu (edit/delete → `useUpdate`/`useRemove("contacts")`).
   - Pagination: prev (disabled), `1` `2` `3` … `204`, next → `useList("contacts", {page})`.
4. **Forms** — "New contact" modal (not in markup; add as overlay). Maps to `ContactSchema`: `type`(enum, default `lead`, req-ish), `first_name`(string, req), `last_name`(opt), `primary_email`(email, req), `primary_phone`(opt), `address`(opt), `custom_fields_json`(record), `owner_user_id`(opt).
5. **Data displays** — Table, 8 cols: checkbox, **Name**(initials+name+email→`first_name`/`last_name`/`primary_email`), **Type**(`type` badge), **Active project**(no contact→project link field; placeholder), **Tag**(no `tags` field on ContactSchema — placeholder/custom_fields), **Owner**(`owner_user_id`), **Last contact**(no field — placeholder), kebab. Feed: `useList("contacts")` → `query.data.data`. Footer "Showing 1–12 of 2,438" → `page`/`pageSize`/`total`.
6. **API routes needed** — `GET/POST/PATCH/DELETE /api/contacts` (covered). **NOT covered:** CSV import, CSV/Excel export, saved-filter persistence, bulk action endpoint, tags, last-contact computation.
7. **Wiring risk** — Medium. Demo `contacts` has only 3 rows; the page shows 12 — total/pagination text ("2,438", "204" pages) is hardcoded copy and pixel-locked: do NOT rewrite it from `total`, or accept it changes (drift). Recommend binding rows but leaving the count strings as static copy unless drift budget allows. Several columns (Active project, Tag, Last contact) have no schema field — keep as placeholder text.

---

## Page 05 — contact-detail

1. **Page** — `05-contact-detail.tsx`. Routes: `/contacts/:id` and `/contact-detail` (and `/contact-detail` legacy). Component `ContactDetail`.
2. **Primary entities** — `contacts` (primary, via `useItem("contacts", id)`). Tabs reference `conversations`, opportunities (**no resource**), `projects`, files (**no resource**).
3. **Buttons / controls:**
   - Header `Call` (secondary) → tel: / log call (no endpoint; could create `messages` w/ channel=call).
   - `Email` (secondary) → open composer (→ Conversations / `messages`).
   - `Log activity` (primary) → create activity (**no activity resource**; closest `messages`/note).
   - `More actions` kebab → edit/delete contact → `useUpdate`/`useRemove("contacts")`.
   - Tabs: Profile / Timeline(42) / Conversations(7) / Opportunities(2) / Projects(1) / Files(14) / Custom fields — `Tabs` is a shadcn primitive with `defaultValue="profile"` (state exists, no data wiring). Counts hardcoded.
   - Properties card `Edit` (ghost) → edit modal → `PATCH /api/contacts/:id`.
   - Timeline filter chips `All/Emails/Notes/Calls`, `Full timeline` → filter `messages` by channel (no timeline resource; map to `messages` of the contact's conversation).
   - Active project `Open project →` → navigate `/projects/:id`.
   - Attachments `Download` icon-buttons (×3) → file download — **no files resource; DOMAIN, not covered**.
   - Sidebar/topbar chrome.
4. **Forms** — Properties "Edit" → modal mapping to `ContactSchema` partial (PATCH): `first_name`, `last_name`, `primary_email`, `primary_phone`, `address`, `custom_fields_json`, `owner_user_id`. Modal not in markup → add overlay.
5. **Data displays:**
   - Profile header (PR avatar, name, Client badge, Active badge, email/phone/address/company) → `useItem("contacts", id)` (`first_name`/`last_name`, `primary_email`, `primary_phone`, `address`; `company`/role have no ContactSchema field — use `custom_fields_json` or static).
   - Properties grid (Lifecycle stage, Lead source, First/Last contact, Lifetime value, Birthday, Tags, Preferred channel) — almost all are **non-schema** fields; only loosely from `custom_fields_json`. Mostly static.
   - Recent timeline (5 items: Email/Call/File/Note/Meeting) → `useList("messages", {conversation_id})` for the contact's conversation; file/meeting items have no resource.
   - Active project card → `useList("projects", {contact_id: id})` first row (`name`, `status`, `start_date`/`target_end_date`).
   - Upcoming card (3 items) → `useList("calendar-events", {contact_id: id})`.
   - Attachments card (3 files) → **no resource**; static.
6. **API routes needed** — `GET /api/contacts/:id`, `PATCH /api/contacts/:id`, `GET /api/projects?contact_id=`, `GET /api/conversations?contact_id=` + `GET /api/messages?conversation_id=`, `GET /api/calendar-events?contact_id=` (all covered). **NOT covered:** activity/timeline aggregation, files, opportunities, lifecycle/lifetime-value fields.
7. **Wiring risk** — High. The route `/contact-detail` (no `:id`) has no id to fetch → `useItem` disabled, page would show nothing if data-bound; must keep static fallback. Tab counts and most Properties rows have no backing field — keep literal. `useItem` returns the bare row (not enveloped). Demo `contacts` lacks `company`/`address` richness.

---

## Page 06 — vendors

1. **Page** — `06-vendors.tsx`. Route: `/vendors`. Component `Vendors`.
2. **Primary entities** — `vendors` (primary). Maps to `VendorSchema`.
3. **Buttons / controls:**
   - `Import from old CRM` (secondary) → migration import — **DOMAIN, not covered**.
   - `Send onboarding form` (secondary) → send form link → triggers `forms` + email — **DOMAIN, not covered** (form-send/email dispatch).
   - `Invite vendor` (primary) → create/invite modal → `useCreate("vendors")` → `POST /api/vendors`.
   - Saved-view chips: `All vendors 41`, `Tier-1 partners 7`, `Active this month 28`, `Onboarding 3`, `NDA expiring < 30d 2` → `useList("vendors", {tier:…})` etc. (`tier` is a schema enum `preferred|standard|trial`; the chips say "Tier-1/2/3" — value mismatch, map carefully).
   - Filter bar: `Filter vendors…` search → `name` substring; `Skill: Any`(→`skills` array filter), `Region: Karnataka`(→`regions` array filter), `Tier: Any`(→`tier`), `Status: Any`(no `status` field on VendorSchema — derived; client-only). `Save view`.
   - Header + per-row checkbox → bulk select.
   - Row click → navigate `/vendors/:id`.
   - Per-row kebab → row menu (edit/delete → `useUpdate`/`useRemove("vendors")`).
   - Pagination `1 2 3 4` + next.
4. **Forms** — "Invite vendor" modal (add overlay). `VendorSchema`: `name`(req), `email`(email req), `phone`(opt), `tier`(enum default `standard`), `skills`(string[]), `regions`(string[]), `rating_avg`(0–5 default 0), `nda_signed_at`(nullable), `msa_signed_at`(nullable), `rate_card_json`(record), `last_project_at`(nullable).
5. **Data displays** — Table, 8 cols: checkbox, **Vendor**(initials+name+skills→`name`/`skills`), **Regions**(`regions[]` badges), **Tier**(`tier` badge — schema enum vs "Tier-1" display mismatch), **Rating**(star+`rating_avg`+reviews; "reviews" count has no field), **NDA/MSA**(`nda_signed_at`/`msa_signed_at` → "Signed"/"Pending"), **Status**(no schema field — derived/placeholder), kebab. Feed: `useList("vendors")`. Footer "Showing 1–12 of 41".
6. **API routes needed** — `GET/POST/PATCH/DELETE /api/vendors` (covered). **NOT covered:** old-CRM migration import, onboarding-form send, reviews count, vendor "status", saved views.
7. **Wiring risk** — Medium. `tier` enum (`preferred/standard/trial`) ≠ displayed "Tier-1/2/3" — a value-mapping decision, not a DOM change (safe via render-time map). "Status" and "reviews" have no fields → keep literal. Demo `vendors` = 3 rows vs 12 displayed; count copy ("41") is locked text.

---

## Page 07 — vendor-detail

1. **Page** — `07-vendor-detail.tsx`. Routes: `/vendors/:id` and `/vendor-detail`. Component `VendorDetail`.
2. **Primary entities** — `vendors` (primary, `useItem("vendors", id)`). Tabs: Projects, Tasks(no resource), Deliverables(no resource), Conversations, Files(no resource), Reviews(no resource).
3. **Buttons / controls:**
   - `WhatsApp` (secondary) → open WhatsApp compose — **DOMAIN, not covered** (Meta Cloud API send).
   - `Email` (secondary) → composer.
   - `Assign to project` (primary) → assignment modal — **no `vendor-assignments` resource; DOMAIN, not covered**.
   - `More` kebab → edit/delete vendor → `useUpdate`/`useRemove("vendors")`.
   - Profile tabs (Profile active / Projects 12 / Tasks 8 / Deliverables 47 / Conversations / Files / Reviews 12) — plain `<div>`s, NOT shadcn Tabs (no built-in state) — needs `useState` for active tab. Counts hardcoded.
   - Skills card `Edit` (ghost) → edit modal → `PATCH /api/vendors/:id` (`skills`).
   - Rate card `View MSA` (ghost) → open MSA doc — **no files; DOMAIN**.
   - Project history `All 12 →` → navigate / filter `projects`.
   - Portfolio `Open SharePoint folder →` (anchor) → external — **DOMAIN**.
4. **Forms** — Skills "Edit" → modal, `VendorSchema` partial: `skills[]`, plus stats (avg value / on-time / last assignment have no fields). Profile fields: `name`, `email`, `phone`; website/instagram have no VendorSchema field (custom_fields).
5. **Data displays:**
   - Header (AS avatar, Aurora Studio, Tier-1 badge, Active, 4.9 rating, 12 projects) → `useItem("vendors", id)` (`name`, `tier`, `rating_avg`; "12 projects"/"Active" derived).
   - Skills & specialization chips → `vendor.skills[]`. Stats grid (avg project value, on-time %, last assignment) — no fields; static/derived.
   - Rate card table (Deliverable/Unit/Rate/Notes) → `vendor.rate_card_json` (schema is `z.record(z.any())` — shape undefined; the table's 4-col structure is hardcoded — keep static unless rate_card_json shape agreed).
   - Project history table (Project/Role/Period/Fee/Status) → `useList("projects", {…})` but role/fee/period have no project↔vendor join (no vendor-assignments). Largely static.
   - Compliance card (NDA/MSA/GST/Insurance + status) → `nda_signed_at`/`msa_signed_at`; GST/Insurance no field.
   - Portfolio (4 placeholders) + Team contacts (3) — no resource; static.
6. **API routes needed** — `GET /api/vendors/:id`, `PATCH /api/vendors/:id` (covered). **NOT covered:** vendor-assignments (project history/fees), WhatsApp send, SharePoint/MSA files, reviews, GST/insurance compliance.
7. **Wiring risk** — High. Profile tab strip is custom `<div>` (no state primitive) — adding active-tab state is handler/state only. `/vendor-detail` (no id) → no fetch target. Most cards (rate card, project history, compliance, portfolio) have no backing fields/resources — must remain literal to preserve pixels. `rate_card_json` is opaque `record` — no safe column binding.

---

## Page 08 — projects-board

1. **Page** — `08-projects-board.tsx`. Route: `/projects`. Component `ProjectsBoard`.
2. **Primary entities** — `projects` (primary). Kanban columns = `ProjectSchema.status` enum: `brief|concept|design|procurement|install|snag|handover|closed`. Board shows 7 columns: Brief, Concept, Design, Procurement, Install, Handover (omits `snag`, `closed`).
3. **Buttons / controls:**
   - View toggle: `Board`(active) / `List` / `Timeline` (3 buttons) → switch view (client state).
   - `Filter` (secondary) → filter panel → `useList("projects", {…})`.
   - `Templates` (secondary) → templates modal — no `templates` resource (out of MVP / inert).
   - `New project` (primary) → create modal → `useCreate("projects")` → `POST /api/projects`.
   - Filter chips: `Active 13`, `My projects 5`, `Anita M. 4`, `Rohit 4`, `At risk 3`, `+ Add filter` → filter params (`manager_user_id`; "Active"/"At risk" derived).
   - `Group by: Status` (ghost) → grouping field selector.
   - Per-column `+` icon-button (`Add <Status> project`) → create project pre-set to that status → `POST /api/projects {status}`.
   - Per-card kebab (`Project menu`) → card menu (open/edit/delete).
   - **Drag card between columns** (`cursor-grab` on `ProjectCard`; no DnD lib wired) → **stage move = `PATCH /api/projects/:id {status:<targetColumn>}`** (this IS covered by generic PATCH — but a DnD library + onDragEnd handler must be added; no `@dnd-kit` import present).
   - Card click → navigate `/projects/:id`.
4. **Forms** — "New project" modal → `ProjectSchema` (see page 03). No inline form in markup.
5. **Data displays** — 6 kanban columns; each card: title(`name`), due(`target_end_date`), owner(`manager_user_id` — display "Anita M." has no users resource), milestones `X/Y`(**no milestones resource**; placeholder), progress bar, vendor avatars(**no vendor-assignments**; placeholder), msg/attach counts(placeholder). Feed: `useList("projects")` then group rows by `status` into columns. Column counts from grouped length.
6. **API routes needed** — `GET/POST/PATCH /api/projects` (covered — stage move = PATCH status). **NOT covered:** milestones progress, vendor-assignment avatars, project templates, "at risk" computation, users (owner names).
7. **Wiring risk** — High. Drag-to-move needs a DnD library + `onDragEnd` added (handlers/refs/state only — but `@dnd-kit` is not imported; adding the import + drag wiring without changing card markup is the tight constraint; the card already has `cursor-grab`). Milestones/vendors/counts per card have no data source → keep literal. Status enum has 8 values but board only renders 6 columns — projects in `snag`/`closed` would be invisible if strictly grouped (acceptable: they're filtered out by design).

---

## Page 09 — project-detail

1. **Page** — `09-project-detail.tsx`. Routes: `/projects/:id` and `/project-detail`. Component `ProjectDetail`.
2. **Primary entities** — `projects` (primary, `useItem("projects", id)`), `project-stages` (milestones), plus deliverables/tasks/activity/comments/vendor-assignments (**no resources**).
3. **Buttons / controls:**
   - Header `SharePoint` (secondary) → open SharePoint folder — **DOMAIN, not covered**.
   - `Teams channel` (secondary) → open Teams channel — **DOMAIN, not covered**.
   - `Mark milestone done` (primary) → advance milestone → `PATCH /api/project-stages/:id {status:"approved"}` (covered) — but "current milestone" id must be resolved.
   - `More actions` kebab → edit/delete project → `useUpdate`/`useRemove("projects")`.
   - Milestone bar (7 nodes, done/active/pending) → from `useList("project-stages", {project_id})`; node click could PATCH stage status.
   - Tabs (shadcn `Tabs` defaultValue="overview"): Overview / Tasks(23) / Deliverables(12) / Vendors(3) / Files(47) / Activity — state primitive present; counts hardcoded.
   - `New deliverable` (secondary) → create deliverable — **no `deliverables` resource; DOMAIN**.
   - Deliverable card `Request approval →` (hover btn) → **DOMAIN, send approval email; not covered**.
   - Task row checkbox (active/todo/blocked) → toggle task status — **no `tasks` resource; DOMAIN**.
   - `Full task list →`, Activity filter chips (All/Comments/Status), Assigned vendors `Invite` (→ vendor-assignment, no resource).
   - Comments composer: `<textarea>` + Attach/Mention icon-buttons + `Comment` button → post comment — **no comments resource; DOMAIN** (closest `messages`).
4. **Forms** — Comment composer (textarea, optional, no schema — no comments resource). "New deliverable" / "Invite vendor" modals → no backing schema. Project edit → `ProjectSchema` partial.
5. **Data displays:**
   - Header (Layers icon, name, Design status pill, On-track badge, "Priya Raghavan · PM Manish · Designer Anita M. · Target Jun 30 · 43 days") → `useItem("projects", id)` (`name`, `status`, `target_end_date`; contact/PM/designer names need joins to non-existent users/contacts-by-id).
   - Milestone bar → `project-stages` (`name`, `order`, `status`: pending/in_review/approved/skipped → map to done/active/pending).
   - Deliverables grid (4 cards: title, vendor·v3, status pill, "3 versions", request-approval) — **no resource**; static.
   - Next-up tasks (5 rows) — **no resource**; static.
   - Activity (5 rows) — **no resource**; static (or `workflow-runs`).
   - Assigned vendors (3 rows) — **no vendor-assignments**; static.
   - Comments (2) — static. Project details panel (Started/Target/Budget/Spent/Source) → `start_date`/`target_end_date`/`budget_cents`; Spent/Source have no field.
6. **API routes needed** — `GET /api/projects/:id`, `PATCH /api/projects/:id`, `GET /api/project-stages?project_id=`, `PATCH /api/project-stages/:id` (covered). **NOT covered:** deliverables, tasks, vendor-assignments, comments, activity, SharePoint/Teams provisioning, approval-email send.
7. **Wiring risk** — Very High (heaviest screen). Only `projects` + `project-stages` (latter empty in demo) are backable. Deliverables/tasks/vendors/comments/activity — the bulk of the page — have no resources; must stay literal. `/project-detail` (no id) → no fetch. Milestone-bar status enum maps (4 schema values → 3 visual states) at render only.

---

## Page 10 — pipelines

1. **Page** — `10-pipelines.tsx`. Route: `/pipelines`. Component `Pipelines`.
2. **Primary entities** — `pipelines` + `pipeline-stages` (columns). Cards = opportunities (**no `opportunities` resource** — closest backable: nothing; cards are placeholder).
3. **Buttons / controls:**
   - Pipeline-name dropdown chevron (ghost) → switch pipeline → `useList("pipelines")` selector.
   - View toggle: `Board`(active) / `List` / `Forecast` → client view state.
   - `Filter` (secondary) → filter panel.
   - `New opportunity` (primary) → create modal — **no `opportunities` resource; DOMAIN, not covered**.
   - Filter chips: `Owner: Anyone`, `Source: Any`, `Close date: This quarter`, `Value: Any`, `+ Add filter` → filter params (no opportunity resource).
   - Per-column `+` (`Add <Stage> opportunity`) → create opp in stage — **no resource**.
   - Per-card kebab (`Opportunity menu`) → card menu.
   - **Drag card between stages** (`cursor-grab`; no DnD lib) → stage move; **drop into "Won" → opportunity→project conversion modal** (DOMAIN: choose template, name, manager, designer, target end → `POST /api/projects`). The drag + conversion flow are **not covered** by CRUD; only the resulting `POST /api/projects` is.
4. **Forms** — "New opportunity" + Won-conversion modals — no `opportunities`/`templates` schema. Conversion modal output maps to `ProjectSchema`.
5. **Data displays** — 5 columns (New/Qualified/Brief/Proposal/Won) each with count, `Total value`, cards (title, detail, value ₹, age, owner avatar). Columns SHOULD come from `useList("pipeline-stages", {pipeline_id:"p1"})` (seed has ps1–ps5: New/Qualified/Brief/Proposal/Won — exact match). Cards have **no opportunities resource** → stay literal. Header badges "5 stages / 26 open opps / ₹85.2L".
6. **API routes needed** — `GET /api/pipelines`, `GET /api/pipeline-stages` (covered). **NOT covered:** `opportunities` (entire card dataset), opportunity→project conversion, forecast view, drag-move.
7. **Wiring risk** — Very High. The core entity (Opportunity) has no backend resource and is NOT in `demoData` (so even demo shows nothing if bound). Columns can bind to `pipeline-stages` (present in seed, but **empty in demo mode** since not in `demoData`). Cards must remain literal. DnD + Won-conversion are net-new flows requiring a modal overlay + drag lib.

---

## Page 11 — calendar

1. **Page** — `11-calendar.tsx`. Route: `/calendar`. Component `Calendar`.
2. **Primary entities** — `calendar-events` (primary). Maps to `CalendarEventSchema`. Booking page → would create `calendar-events` + a booking (no `bookings` resource).
3. **Buttons / controls:**
   - `New event` (primary) → create modal → `useCreate("calendar-events")` → `POST /api/calendar-events`.
   - `Previous week` / `Next week` icon-buttons + `Today` (ghost) → change visible week (client state → re-query with date range; no server date filter).
   - View toggle: `Day` / `Week`(active) / `Month` / `Agenda` → client view state.
   - `Booking link` (secondary) → copy/open public booking URL — **DOMAIN, not covered**.
   - Calendar grid event blocks (`cursor-pointer`) → open event detail/edit → `useUpdate("calendar-events")`.
   - Empty grid cell click → create event at that slot → `POST /api/calendar-events {start_at,end_at}` (slot-book; covered by CRUD but needs click-to-time mapping handler).
   - Booking page: month date cells (clickable) + time buttons (`9:30…5:00`) → select slot; `Confirm booking` (primary) → **slot-book DOMAIN flow** → creates `calendar-events` + notification (the create is covered; the booking semantics/emails are not).
   - "My calendars" checkboxes (5, e.g. Personal/Discovery/Site visits) → toggle calendar visibility (client filter; no `calendars` resource — `type` enum is closest).
   - Bookable services: `Copy` icon-buttons (×2: Discovery 30 min, Site walk 90 min) → copy booking link — **DOMAIN**.
4. **Forms** — "New event" modal → `CalendarEventSchema`: `title`(req), `contact_id`(opt), `start_at`(req), `end_at`(req), `type`(enum `personal|service_menu|team_collective|class`, default `personal`), `status`(enum `confirmed|tentative|cancelled`, default `confirmed`). Booking confirm → same schema (type=`service_menu`).
5. **Data displays** — Week grid (60px time col + 7 day cols, 8AM–6PM rows). Events placed by hardcoded `calendarRows` matrix → must map `useList("calendar-events")` rows by `start_at` day/hour into grid cells (non-trivial bucketing logic, handler/computation only). Booking sidebar = static mock. "My calendars" list static. Bookable services static.
6. **API routes needed** — `GET/POST/PATCH /api/calendar-events` (covered). **NOT covered:** booking-link generation/copy, slot-availability, public booking ingest, calendar visibility filter, reminder emails, M365 two-way sync.
7. **Wiring risk** — High. The week grid is a fixed `calendarRows` matrix (hardcoded positions/spans); binding live events to exact grid cells requires a placement algorithm without changing the grid DOM (computed cell content only — feasible but fiddly, must preserve the `grid-cols-[60px_repeat(7,1fr)]` structure and `span` height classes). Demo `calendar-events` = 1 row. Booking page is a visual mock with no resource — keep static.

---

## Page 12 — conversations

1. **Page** — `12-conversations.tsx`. Route: `/conversations`. Component `Conversations`.
2. **Primary entities** — `conversations` (inbox list) + `messages` (thread). Right rail references `projects`, invoices (no resource), `calendar-events`, deliverables (no resource).
3. **Buttons / controls:**
   - `Compose` (primary, inbox header) → new conversation/message composer → `useCreate("conversations")` + `useCreate("messages")`.
   - Inbox search `Search messages…` → `useList("conversations"/"messages", {subject…})`.
   - Filter chips: `All 137`(active), `Unread 12`, `Assigned to me 8` → filter (`status`; "unread"/"assigned" — `assigned_user_id`).
   - Inbox rows (`cursor-pointer`) → select conversation → load thread `useList("messages", {conversation_id})`.
   - Thread header: `Assign` (secondary) → assign user → `PATCH /api/conversations/:id {assigned_user_id}`; `Label` (secondary) → tag (no field); `Archive` icon → `PATCH /api/conversations/:id {status:"closed"}`; `More` kebab (incl. **thread merge** — DOMAIN, not covered).
   - Reply channel toggle: `📧 Email`(active) / `💬 WhatsApp` / `🟡 Internal note` → set `messages.channel`/`direction`.
   - Composer `<textarea>` + Attach/Link/Assist/Image icon-buttons.
   - `Save draft` (secondary) → persist draft (no draft resource; client/local).
   - `Send` (primary) → **send message: DOMAIN**. Email→MS Graph, WhatsApp→Meta, note→internal. Persisting = `POST /api/messages {conversation_id, channel, direction:"outbound", from/to, body}` (covered) but actual dispatch (Graph/Meta send) is **not covered**.
   - Right rail `Profile` / `Call` buttons → navigate `/contacts/:id` / tel.
4. **Forms** — Reply composer: `body`(textarea, req), implicit `channel`(enum from toggle), `conversation_id`, `direction="outbound"`, `from_address`/`to_address`. Maps to `MessageSchema` (`channel: email|whatsapp|sms|webchat|note|call`, `direction: inbound|outbound`). Compose modal → `ConversationSchema` (`contact_id` req, `subject`, `channel`, `status`).
5. **Data displays:**
   - Inbox list (8 rows: avatar, name, time, subject, preview, channel badge, unread dot) → `useList("conversations")` joined with last message; `subject`, `channel`, `status`. Demo has 2 conversations.
   - Thread (4 messages: sender, meta, body, note tone) → `useList("messages", {conversation_id})` (`from_address`/`direction`→sender, `sent_at`→meta, `body`, `channel==="note"`→note style).
   - Right rail: Active project (→`useList("projects", {contact_id})`), Open invoices (**no resource**; static), Recent deliverables (**no resource**; static), Upcoming (→`useList("calendar-events", {contact_id})`).
6. **API routes needed** — `GET/POST /api/conversations`, `GET/POST /api/messages`, `PATCH /api/conversations/:id` (covered). **NOT covered:** message dispatch (Graph/Meta/SMS send), thread merge, labels/tags, drafts, invoices, deliverables.
7. **Wiring risk** — High. "One conversation per contact" — inbox rows show sender names but conversations only store `contact_id` (need contact join, no batch endpoint). `Send` persists via `messages` POST but real delivery is a domain integration (out of CRUD). Composer has hardcoded `defaultValue` text (locked copy) — switching to controlled state must keep that initial value or it changes (drift). Note/WhatsApp channels exist in `MessageSchema` enum — safe.

---

## Page 13 — workflows

1. **Page** — `13-workflows.tsx`. Route: `/workflows`. Component `Workflows`.
2. **Primary entities** — `workflows` (list + selected), `workflow-runs` (run history / last-5-runs). Maps to `WorkflowSchema` / `WorkflowRunSchema`.
3. **Buttons / controls:**
   - `New` (primary, list header) → create workflow → `useCreate("workflows")` → `POST /api/workflows`.
   - List `Filter…` search → `useList("workflows", {name})`.
   - Workflow cards (`cursor-pointer`, 8 items) → select workflow → `useItem("workflows", id)` + load steps into canvas.
   - `Run history` (ghost) → open runs → `useList("workflow-runs", {workflow_id})`.
   - `Test run` (secondary) → trigger a run — **DOMAIN, not covered** (no run-trigger endpoint; closest = `POST /api/workflow-runs`).
   - `Pause` (secondary) → `PATCH /api/workflows/:id {status:"paused"}` (covered).
   - `Save` (primary) → persist edited steps → `PATCH /api/workflows/:id {steps_json,…}` (covered).
   - Trigger/Filter/Action nodes each have a `More` kebab → node edit/delete (mutates `steps_json` — PATCH covered).
   - `Add step` (secondary) → append a step to `steps_json`.
   - Inspector right rail: Email provider `<select>`, Template `<select>`, Subject `<Input>`, On-failure `<select>` → edit selected step config (writes to `steps_json` → `PATCH /api/workflows/:id`).
4. **Forms** — Inspector "step config" form: Email provider(select, enum: Resend/MS Graph/Postmark), Template(select), Subject(input, has `defaultValue` w/ `{{contact.first_name}}`), Variables(display chips), On failure(select). These serialize into `WorkflowSchema.steps_json` (`z.array(z.record(z.any()))` — opaque). Create-workflow → `WorkflowSchema`: `name`(req), `trigger_type`(string req), `trigger_filters_json`(record), `steps_json`(array), `status`(enum `active|paused|draft`, default `draft`).
5. **Data displays:**
   - Left list (8 workflow cards: name, trigger, runs, status badge) → `useList("workflows")` (`name`, `trigger_type`, `status`; "runs · 30d" needs `workflow-runs` count — no aggregate endpoint).
   - Canvas: Trigger card + Filter card + 7 action nodes — driven by selected workflow's `steps_json` (opaque shape; current render is fully hardcoded `workflowSteps` — binding requires agreeing a steps_json shape; otherwise keep literal).
   - Inspector "Last 5 runs" (time + success/retried badge) → `useList("workflow-runs", {workflow_id})` (`started_at`, `status`).
6. **API routes needed** — `GET/POST /api/workflows`, `PATCH /api/workflows/:id`, `GET/POST /api/workflow-runs` (covered). **NOT covered:** test-run execution engine, run-count aggregation, step config schema (steps_json is opaque).
7. **Wiring risk** — High. `steps_json` is `z.array(z.record(z.any()))` — no defined shape, so the canvas nodes & inspector can't be safely data-bound without a shape contract; recommend binding only the left list (name/trigger/status) + last-5-runs and keeping the canvas literal. `workflow-runs` is **empty in demo** (not in `demoData`). Status enum (`active|paused|draft`) vs displayed "Live/Paused/Draft" — render-time map only.

---

## Page 14 — forms

1. **Page** — `14-forms.tsx`. Route: `/forms`. Component `Forms`.
2. **Primary entities** — `forms` (the form being built; `FormSchema`). Submissions → `form-submissions`. On-submit → `workflows`.
3. **Buttons / controls:**
   - Header copy-link icon (`Copy link`) → copy `forms.designersmeet.com/<public_slug>` (client clipboard; `public_slug` from `FormSchema`).
   - Mode toggle: `Build`(active) / `Preview` / `Embed` / `Logic` → client view state.
   - `Save draft` (secondary) → `PATCH /api/forms/:id` (covered).
   - `Publish` (primary) → publish form → `PATCH /api/forms/:id` (status concept; FormSchema has no `status` field — "Published" badge is derived/placeholder).
   - Field-palette items (left, draggable, `cursor-grab`, 14 types) → drag into canvas → append to `FormSchema.schema_json`.
   - Form field cards: drag handle (`GripVertical`, hover), `Copy field` / `Delete field` icon-buttons → mutate `schema_json`.
   - Field cards inputs/badges/upload — preview render of `schema_json` entries.
   - Terms checkbox + `Submit application` (disabled) — this is the *public form preview*; on a live form it → **form submission ingest: DOMAIN** (`POST /api/form-submissions`, covered as CRUD, but the create-or-update-contact + workflow-fire side effects are NOT).
   - Workflow callout `Edit workflow →` (anchor) → navigate `/workflows` (selected = on_submit_workflow_id).
   - Inspector right rail: Label `<Input>`, Help text `<Input>`, Options list (`<Input>`×6 + drag handles), `Add option`, Required checkbox, Selection-limit `<Input>`×2, `Maps to contact field` `<select>` → edit selected field → writes `schema_json` → `PATCH /api/forms/:id`.
4. **Forms** — Two levels: (a) the **builder** edits `FormSchema`: `name`(req), `schema_json`(array of records, opaque), `public_slug`(req), `on_submit_workflow_id`(nullable). (b) The **rendered public form** (preview) collects vendor-onboarding fields (Studio name/email/WhatsApp/skills/regions/years/portfolio/upload) → on real submit maps to `FormSubmissionSchema`: `form_id`, `contact_id`(nullable), `payload_json`(record), `submitted_at`.
5. **Data displays:**
   - Field palette (14 types in 4 sections) — static config (Text/Contact/Choice/Other).
   - Canvas form (8 field cards) — should render from selected `forms.schema_json` (opaque array; current is hardcoded `formFields` — bind only if schema_json shape agreed). Header "47 submissions · last 2h" → needs `form-submissions` count (no aggregate).
   - Inspector — config of selected field (selected-field state, no data binding without schema_json shape).
6. **API routes needed** — `GET/POST/PATCH /api/forms`, `POST /api/form-submissions` (covered). **NOT covered:** form-submission → contact upsert, workflow trigger on submit, submission-count aggregation, embed snippet generation, public form hosting, schema_json shape.
7. **Wiring risk** — High. `schema_json` & field config are `z.array(z.record(z.any()))` — opaque; safe binding limited to `forms` list metadata (`name`, `public_slug`, `on_submit_workflow_id`). `form-submissions` **empty in demo**. The "public form" inside is a preview mock, not a live submission surface. Builder DnD (palette→canvas) needs a drag lib added without altering card markup.

---

## Page 15 — settings

1. **Page** — `15-settings.tsx`. Route: `/settings`. Component `Settings` (showing the **Integrations** sub-page).
2. **Primary entities** — None of the 14 CRM resources. Concerns: integrations, SSO, workspaces, email providers — **no `integrations`/`sso`/`workspaces`/`email-providers` resources exist**. Entirely settings-domain.
3. **Buttons / controls:**
   - Settings sub-nav (left, ~16 items: General/Workspaces/Branding/Locale; Users&roles/Teams/Vendor portal; SSO/Sessions/Audit log; Integrations(active)/Email providers/Webhooks/API keys; Plan&usage/Invoices) — inert `<div>`s; wire to sub-routes (no routes exist beyond `/settings`).
   - SSO card `Configure` (secondary) → SSO config — **DOMAIN, not covered**.
   - Workspaces card `New workspace` (secondary) → modal — no resource.
   - Workspace row `Manage` (ghost) → manage.
   - Per-integration card (8 tiles: M365, Resend, WhatsApp, Google, Shopify, Meta, Stripe, Power Automate): `Configure` + `Logs` (if connected) OR `Connect` (if not) → integration OAuth/config — **all DOMAIN, not covered**.
   - Sidebar/topbar chrome.
4. **Forms** — None on page (config modals would be domain-specific; no Zod schemas exist for integrations/SSO/workspaces).
5. **Data displays** — SSO card (3 providers: Entra/Google/Apple, all "Enabled") static. Workspaces card (1 HQ row) static. Integration grid (8 cards: name, description, scope detail, status badge, connected flag) — all hardcoded `integrations` array; **no resource** to bind. Status/connected are literal.
6. **API routes needed** — None covered by CRUD. **NOT covered (all DOMAIN):** integration connect/configure/logs, SSO config, workspace create, email-provider setup, webhooks, API keys, billing.
7. **Wiring risk** — Low data risk / High "nothing to wire" risk. There is **no backend resource for anything on this page**. Wiring is limited to settings sub-nav routing (routes don't exist) and external OAuth redirects. Recommend: keep the integration grid fully static (pixel-locked), wire only nav + `Connect`/`Configure` → redirect stubs. No CRUD hooks apply.

---

## Page 16 — spec-sheet

1. **Page** — `16-spec-sheet.tsx`. Route: `/spec`. Component `SpecSheet`.
2. **Primary entities** — None. Static internal documentation/spec sheet.
3. **Buttons / controls:**
   - `Print / save as PDF` (primary) → **already wired**: `onClick={() => window.print()}`. (The only pre-existing handler in all 16 pages.)
   - No other interactive controls (no sidebar, no nav, no forms).
4. **Forms** — None.
5. **Data displays** — Static screen-inventory grid (15 screen cards from a local `screens` const), color/typography sample tiles, wave summary. No resource, no hooks.
6. **API routes needed** — None.
7. **Wiring risk** — None. Page is complete as-is; no wiring required. Do not touch.

---

## Summary of domain (non-CRUD) endpoints required

| Domain capability | Pages | Covered by generic CRUD? |
|---|---|---|
| OAuth/SSO start (MS/Google/Apple/SAML) | 01, 02, 15 | No |
| M365 tenant connect | 02, 15 | No |
| CSV/Excel import + export | 03, 04, 06 | No |
| Kanban stage move | 08 (projects) | **Yes** (`PATCH /api/projects/:id {status}`) — but needs DnD lib + handler |
| Opportunity→Project conversion (drop on Won) | 10 | Partial (output `POST /api/projects` yes; opportunities resource + flow no) |
| Calendar slot booking / public booking ingest | 11 | Partial (`POST /api/calendar-events` yes; booking semantics/availability/reminders no) |
| Conversation reply dispatch (Graph/Meta/SMS) | 12 | Partial (`POST /api/messages` yes; actual send no) |
| Conversation thread merge / labels / drafts | 12 | No |
| Form submission side-effects (contact upsert + workflow fire) | 14 | Partial (`POST /api/form-submissions` yes; side-effects no) |
| Workflow test-run / execution engine | 13 | No |
| Deliverable "request approval" email | 09 | No |
| SharePoint / Teams provisioning | 09, 07 | No |
| Integration connect/configure/logs, webhooks, API keys, billing | 15 | No |

**Entities with NO backend resource (cards/tables that must stay literal to preserve pixels):** opportunities, deliverables, tasks, vendor-assignments, milestones (page 09 only — `project-stages` ≠ milestones display), users (owner names), tags, bookings, invoices, activity/timeline, workspaces, integrations, email-providers, files.
