# DesignersMeet CRM — Aider Pipeline Briefs
**Date:** 2026-05-21  
**Worktree:** `confident-archimedes-a4d918`  
**Frontend:** `packages/frontend/src/pages/` (design-locked — ZERO visual deviation)  
**Backend:** `packages/backend/src/` (memory mode, DATA_PROVIDER=memory)  

## Immutable Rules
- Every interactive element is wired or visibly disabled. Zero decorative buttons.
- Zero UI removal. Can ADD elements (e.g. sort chevron inside an existing `<th>`, a filter chip, an edit icon in a table row). Cannot remove or restructure existing elements.
- Zero colour literal changes. Zero layout restructuring. Use only existing design tokens.
- All sort/filter is client-side state against demoStore (already supports `sort`, `order`, and key-value params).
- All create/edit/delete flows go through `CrmModals` + `useUIStore.openCreate/openEdit/openConfirmDelete`. CrmModals is already mounted in `main.tsx`. Pages just need the `onClick` handlers.
- RBAC is enforced via a `usePermission(page, action)` hook that reads a `role-permissions` demoStore resource. Enforcement happens in the sidebar and at the top of each page component.

## Infrastructure Already Built (do NOT rebuild)
- `CrmModals` — global modal host, mounted in `main.tsx`, handles create/edit/delete for any REGISTRY resource
- `useUIStore` — has `modal`, `filters`, `selection`, `openCreate`, `openEdit`, `openConfirmDelete`
- `demoStore.list(resource, params)` — already supports `sort`, `order`, plus any key=value filter
- `DemoInteractionLayer` + `SidebarCollapseLayer` — mounted in `main.tsx` (NOT in App.tsx)
- `useList`, `useItem`, `useCreate`, `useUpdate`, `useRemove` — generic hooks in `hooks/useResource.ts`
- Contacts + Vendors search (`setQ` → `useList('...', { name: q })`) — already wired

---

## BRIEF-01 — App.tsx: Navigation + Sidebar Collapse [DONE]

**Status:** ✅ Fixed in this session  
**Files changed:**
- `packages/frontend/src/App.tsx` — imports + mounts `DemoInteractionLayer` and `SidebarCollapseLayer`
- `packages/frontend/src/pages/12-conversations.tsx` — `replyBody` state + wired Send button + ⌘+Enter

---

## BRIEF-02 — Contact Create/Edit Modal

**Context:** `04-contacts.tsx` renders a contacts list via `useList('contacts')`. The "+ New Contact" button opens a modal that is currently decorative (no form state, no submit).

**Task:** Wire the contact creation modal in `packages/frontend/src/pages/04-contacts.tsx`:
1. Add `useState` for `showModal` and `formData` (name, email, phone, company, role).
2. On "+ New Contact" click → `showModal = true`.
3. Modal form: name (required), email (required), phone, company, role (select: client/vendor/lead).
4. On submit → `useCreate('contacts').mutate(formData)` → close modal.
5. Inline edit: clicking a contact row's edit icon → same modal pre-filled + `useUpdate('contacts').mutate`.
6. Delete icon → `useRemove('contacts').mutate(id)` with a confirm dialog.
7. Keep all existing JSX structure, classNames, and visual tokens. No layout changes.

**Backend check:** `contacts` resource exists in `packages/backend/src/crm/types.ts` (ContactSchema). No changes needed.

---

## BRIEF-03 — Vendor Create/Edit Modal

**Context:** `06-vendors.tsx` renders vendors via `useList('vendors')`. Same pattern as contacts.

**Task:** Wire vendor CRUD in `packages/frontend/src/pages/06-vendors.tsx`:
1. "+ New Vendor" button → modal with fields: name, email, phone, portfolioUrl, rateMin, rateMax, availabilityStatus (select: available/busy/on_leave), country.
2. Submit → `useCreate('vendors').mutate(formData)`.
3. Edit icon → pre-filled modal + `useUpdate('vendors').mutate`.
4. Delete → `useRemove('vendors').mutate(id)` with confirm.
5. The availability badge colour is already driven by `availabilityStatus` field — keep as-is.

---

## BRIEF-04 — Projects Board: Drag-to-Move Status

**Context:** `08-projects-board.tsx` shows projects in kanban columns (new / in_progress / review / done). Cards are rendered but drag-drop does nothing (no status update).

**Task:** Wire drag-drop status change in `packages/frontend/src/pages/08-projects-board.tsx`:
1. Import `useMoveProjectStage` from `../hooks/useResource.js` (already exists).
2. On drag end with a valid destination column → call `useMoveProjectStage().mutate({ id: projectId, stage: destinationColumn })`.
3. If `@dnd-kit/core` is already imported but not wired, wire the `onDragEnd` handler.
4. If `@dnd-kit/core` is NOT imported, use a simpler approach: add a `<select>` status dropdown on each card that calls `useUpdate('projects').mutate({ id, patch: { status } })`.
5. "+ New Project" button → modal: title (required), clientName, description, status (default: new), dueDate. Submit → `useCreate('projects').mutate`.
6. No layout changes. No colour literal changes.

---

## BRIEF-05 — Calendar: Event Create + Click-to-Detail

**Context:** `11-calendar.tsx` renders events via `useList('calendar-events')`. Days with events show dots. Clicking a day does nothing.

**Task:**
1. Add `useState` for `selectedDate` and `showEventModal`.
2. Clicking a calendar day → `selectedDate = clicked date`, show event list for that day in the right panel (already structured in the HTML).
3. "+ New Event" button → modal: title (required), start (datetime-local), end (datetime-local), type (select: meeting/call/deadline/reminder), description. Submit → `useCreate('calendar-events').mutate`.
4. Clicking an existing event in the panel → show event detail (title, time, type, description) — can be same modal in read-only mode.
5. No layout changes.

---

## BRIEF-06 — Workflows: Run + Toggle Status

**Context:** `13-workflows.tsx` lists workflows via `useList('workflows')`. "Run" button and "Enable/Disable" toggle are decorative.

**Task:**
1. "Run" button on each workflow card → `useCreate('workflow-runs').mutate({ workflowId: id, triggeredBy: 'manual', status: 'running' })`. Show a toast "Workflow started".
2. Enable/Disable toggle → `useUpdate('workflows').mutate({ id, patch: { status: toggle ? 'active' : 'disabled' } })`.
3. "+ New Workflow" button → modal: name (required), trigger (select: manual/scheduled/webhook), description. Submit → `useCreate('workflows').mutate`.
4. Workflow-runs panel (if rendered) → filter by `workflowId` using `useList('workflow-runs')`, already wired.
5. No layout changes.

---

## BRIEF-07 — Forms: Submission Counter + Preview

**Context:** `14-forms.tsx` shows form header via `useItem('forms','fm1')`. The submission count and "Preview" button are decorative.

**Task:**
1. Wire submission count: `useList('form-responses', { formId: 'fm1' })?.data?.length ?? 0` displayed next to "Submissions".
2. "Preview" button → open an `<iframe>` or a modal showing the form fields rendered as inputs (read the `fields` array from the form item).
3. If `form-responses` resource doesn't exist in backend: add it to `packages/backend/src/crm/types.ts` with schema `{ id, formId, submittedAt, data: record }` and register in `RESOURCES`.
4. "+ New Form" button → modal: name (required), description. Submit → `useCreate('forms').mutate`.
5. No layout changes.

---

## BRIEF-08 — Settings Page: Wire All Active Controls

**Context:** `15-settings.tsx` has many controls. Some are wired (demo user displays correctly). Many sub-menu items are `data-disabled`. The Profile section, Password, Notifications, and Integrations sections need wiring.

**Task — Profile section:**
1. Load current user: `useAuth()` gives `{ user: { name, email } }`.
2. "Full Name" and "Email" fields → pre-fill from `user.name` and `user.email`.
3. "Save Profile" → `useUpdate('users').mutate({ id: user.sub, patch: { name, email } })`. (Add `users` resource if missing.)
4. Avatar: if no upload, show initials from name.

**Task — Notifications section:**
1. Toggle switches for Email / In-App / Push → each backed by `useState` (persisted to `localStorage` key `dm_notif_prefs`).
2. No backend call needed — local preference only.

**Task — Integrations section (Phase 1 only):**
1. Microsoft 365 card: show connected badge if `demoMode === true` (hardcoded for demo). "Connect" button opens a toast "M365 integration — coming in Phase 2".
2. Shopify card: same — "coming in Phase 2" toast.
3. Stripe card: same.
4. Do NOT build real OAuth flows — those are Phase 2.

**Task — Phase 2 items (mark disabled, not remove):**
1. All sub-menu items currently `data-disabled` → keep disabled. Ensure each shows a cursor-not-allowed style and tooltip "Coming soon".

---

## BRIEF-09 — Dashboard: Live Stats from Demo Store

**Context:** `03-dashboard.tsx` has hardcoded numbers (contacts: 48, vendors: 12, projects: 6, revenue: ₹2.4L). These don't reflect actual demo store.

**Task:**
1. Replace hardcoded counts with:
   - `useList('contacts').data?.total ?? 0`
   - `useList('vendors').data?.total ?? 0`
   - `useList('projects').data?.total ?? 0`
2. Revenue stat stays hardcoded (no billing resource in Phase 1).
3. Recent activity list → derive from `useList('conversations', { limit: 3, sort: 'updated_at:desc' })` — show conversation subject + contact name.
4. Keep all layout, colours, and icon choices unchanged.

---

## BRIEF-10 — Pipelines: Stage Cards Interactive

**Context:** `10-pipelines.tsx` shows pipeline stages via `useList('pipeline-stages')`. Cards are rendered but "+ Add Card" buttons are decorative.

**Task:**
1. Each stage column has an "+ Add Card" → opens mini-modal: contact name (text), value (number, INR), note. Submit → `useCreate('pipeline-stages').mutate({ ...formData, stageId: stage.id })`.
2. Actually, in the data model a pipeline card is a deal/lead — add `pipeline-deals` resource to backend if not present, schema: `{ id, pipelineStageId, contactName, value, currency, note, createdAt }`.
3. Wire card display: `useList('pipeline-deals', { pipelineStageId: stage.id })` in each column.
4. Drag deal to another column → `useUpdate('pipeline-deals').mutate({ id, patch: { pipelineStageId: newStageId } })`.
5. No layout changes.

---

## BRIEF-11 — Backend: Add Missing Resources

**File:** `packages/backend/src/crm/types.ts` and `packages/backend/src/crm/seed.ts`

**Add these resources if not already present:**

```typescript
// pipeline-deals
const PipelineDealSchema = z.object({
  id: z.string(),
  pipelineStageId: z.string(),
  contactName: z.string(),
  value: z.number().default(0),
  currency: z.string().default("INR"),
  note: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// form-responses
const FormResponseSchema = z.object({
  id: z.string(),
  formId: z.string(),
  submittedAt: z.string(),
  data: z.record(z.unknown()),
});

// users (for settings profile save)
const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  role: z.string().default("admin"),
  avatarUrl: z.string().optional(),
  createdAt: z.string(),
});
```

**Register in RESOURCES and seed.ts with representative data:**
- 2 pipeline-deals per stage (Lumen Café deal, HSR Penthouse deal)
- 3 form-responses for fm1
- 1 user: `{ id: "u1", name: "Manish Sharma", email: "admin@designersmeet.com", role: "admin" }`

---

## BRIEF-12 — Vendor Detail: Full Data Wiring

**Context:** `07-vendor-detail.tsx` is mostly static. It should show the selected vendor's real data.

**Task:**
1. Read `vendorId` from route params: `const { id } = useParams()`.
2. `const vendor = useItem('vendors', id).data`.
3. Replace all static field literals (name, email, phone, rating, orders completed, AI tools, etc.) with `vendor?.fieldName ?? '—'`.
4. "Projects" tab → `useList('projects', { vendorId: id })` for the vendor's project list.
5. "Back" button → `navigate('/vendors')` (already handled by DemoInteractionLayer if sidebar nav is used, but the back button in the header needs wiring too).
6. No layout or colour changes.

---

## BRIEF-13 — Contact Detail: Full Data Wiring

**Context:** `05-contact-detail.tsx` is mostly static.

**Task:** Same pattern as BRIEF-12 but for contacts:
1. `const { id } = useParams()` → `useItem('contacts', id)`.
2. Replace static fields with live data.
3. Conversation thread → `useList('conversations', { contactId: id })` filtered.
4. "Edit" button in header → opens edit modal (reuse BRIEF-02 modal pattern).
5. No layout changes.

---

## BRIEF-14 — Project Detail: Milestone + Stage Management

**Context:** `09-project-detail.tsx` renders a project with stages. Stage checkboxes are decorative.

**Task:**
1. Stage checkbox toggle → `useUpdate('project-stages').mutate({ id: stageId, patch: { status: checked ? 'done' : 'pending' } })`.
2. "+ Add Milestone" button → modal: title (required), dueDate, assignee (free text). Submit → `useCreate('project-stages').mutate`.
3. Show overall project progress as `completedStages / totalStages * 100` in the progress bar.
4. "Back to Projects" → `navigate('/projects')`.
5. No layout changes.

---

---

## BRIEF-15 — Contact Detail: 7 Internal Tabs (all decorative)

**Context:** `05-contact-detail.tsx` has `<Tabs defaultValue="profile">` with 7 `<TabsTrigger>` but NO `<TabsContent>` panels. Clicking any tab does nothing — all content below the tab bar is always visible and hardcoded. The tab bar is purely cosmetic.

**Tabs to wire:** profile | timeline | conversations | opportunities | projects | files | custom-fields

**Task:**
1. Wrap all existing hardcoded content below the `<Tabs>` block in a `<TabsContent value="profile">` — this becomes the Profile tab panel (currently it shows property rows, recent timeline, etc.).
2. Add `<TabsContent value="timeline">` — render a chronological activity feed using `useList('conversations', { contactId: id })` mapped to timeline events (date, action, summary). Empty state: "No timeline events yet".
3. Add `<TabsContent value="conversations">` — render `useList('conversations', { contactId: id })` as message thread previews. Reuse the `InboxItem` card structure from `12-conversations.tsx` (copy, don't import — design locked).
4. Add `<TabsContent value="opportunities">` — render `useList('pipeline-deals', { contactName: contact?.name })`. Each row: deal name, stage, value. "+ Add opportunity" → `useCreate('pipeline-deals').mutate`. Empty state card.
5. Add `<TabsContent value="projects">` — render `useList('projects', { clientName: contact?.name })` as project cards (title, status badge, due date). Link each to `/projects/:id`.
6. Add `<TabsContent value="files">` — render a placeholder grid: "File uploads arrive via email or manual upload — Phase 2". Style it with the same empty-state card pattern used elsewhere.
7. Add `<TabsContent value="custom-fields">` — render an editable key/value grid: 3 custom field rows (text inputs) pre-filled from `contact?.customFields ?? {}`. "Save" → `useUpdate('contacts').mutate` with the new customFields map.
8. Badge counts on tabs (42, 7, 2, 1, 14) → derive from actual data length where wired; keep hardcoded elsewhere.
9. Zero layout changes to the existing Profile content panel. Zero colour changes.

---

## BRIEF-16 — Vendor Detail: 7 Internal Tabs (all decorative)

**Context:** `07-vendor-detail.tsx` has `profileTabs` array with 7 items (Profile, Projects, Tasks, Deliverables, Conversations, Files, Reviews). `activeTab` state drives only the tab button styling — the content area below the tab bar is always the same hardcoded Profile panel regardless of which tab is active.

**Tabs to wire:** Profile | Projects | Tasks | Deliverables | Conversations | Files | Reviews

**Task:**
1. Wrap the existing content area (Skills card + Rate card + the 3-column metrics section) in `{activeTab === "Profile" && <> ... </>}`.
2. `activeTab === "Projects"` → `useList('projects', { vendorId: vid })` rendered as a table: title, status badge, client, due date, budget. Empty state card.
3. `activeTab === "Tasks"` → `useList('project-stages', { assignedVendorId: vid })` rendered as a checklist. Empty state: "No tasks assigned".
4. `activeTab === "Deliverables"` → reuse the `deliverables` const that's already in the file but add `useList('projects')` filter: show deliverables whose vendor name matches. Keep the `DeliverableCard` inner structure — don't change styling.
5. `activeTab === "Conversations"` → `useList('conversations', { vendorId: vid })` as thread previews. Empty state card.
6. `activeTab === "Files"` → Phase 2 placeholder (same pattern as BRIEF-15 files tab).
7. `activeTab === "Reviews"` → a read-only list of star ratings. Use hardcoded sample reviews for Phase 1 (vendor is design data): 3 review cards with rating (4-5 stars), reviewer initials, date, comment text. Each card uses existing `Card` + `CardContent` components. Badge count "12" stays.
8. No tab bar layout or colour changes. `activeTab` logic already works (border highlight) — do NOT touch the tab click handler or styling.

---

## BRIEF-17 — Project Detail: 6 Internal Tabs (all decorative)

**Context:** `09-project-detail.tsx` has `<Tabs defaultValue="overview">` with 6 triggers but NO `<TabsContent>`. All content below the tab bar is always rendered — it shows deliverables + tasks + activity + assigned vendors all stacked, regardless of which tab is selected.

**Tabs to wire:** Overview | Tasks | Deliverables | Vendors | Files | Activity

**Task:**
1. Wrap the existing 3-column content grid in `<TabsContent value="overview">` — this is the default and shows everything as currently designed.
2. Add `<TabsContent value="tasks">` — render `useList('project-stages', { projectId: pid })` as a full task list. Each row: checkbox (wired, BRIEF-14), title, assignee, due date, status badge. "+ New task" at the top → `useCreate('project-stages').mutate`.
3. Add `<TabsContent value="deliverables">` — render the `deliverables` const (already in file) as a larger `DeliverableCard` grid. Add a status filter row (All / In review / Approved / Pending). Filter is client-side state only.
4. Add `<TabsContent value="vendors">` — render `useList('vendors', { projectId: pid })` (or the 3 vendors already hardcoded in the right column). Each: avatar, name, role, status. "+ Assign vendor" → toast "Vendor assignment — Phase 2".
5. Add `<TabsContent value="files">` — Phase 2 placeholder.
6. Add `<TabsContent value="activity">` — render the `activities` const (already in file) as a full-height feed with the same `ActivityRow` component. Pipe `useList('conversations', { projectId: pid })` events into the top if any exist.
7. Counts on tabs (Tasks: 23, Deliverables: 12, Vendors: 3, Files: 47) stay hardcoded for Phase 1.
8. No layout or colour changes.

---

## BRIEF-18 — Conversations: Filter Badges + Folder Tree

**Context:** `12-conversations.tsx` has 3 `<FilterBadge>` chips (All / Unread / Assigned to me) and a left-column inbox list. The "All" badge has `active` hardcoded. No filter state — clicking Unread or Assigned to me does nothing.

**Task:**
1. Add `const [activeFilter, setActiveFilter] = useState<"all"|"unread"|"assigned">("all")`.
2. Each `FilterBadge` gets `onClick={() => setActiveFilter(...)}` and `active={activeFilter === ...}`.
3. Filter `inboxItems` based on `activeFilter`:
   - `"unread"` → items where `item.unreadCount > 0` (or add `unread: boolean` field to conversation fixture).
   - `"assigned"` → items where `item.assigned_user_id === "u1"` (the demo user).
4. If the left sidebar has any folder/channel links (Inbox, Sent, Drafts, Spam — check the markup for `<li>` or `<button>` items in the left column), wire them as a second filter: `activeChannel` state. Only show items matching that channel.
5. When `inboxItems` is filtered to 0 → show empty state: "No conversations match this filter".
6. No layout or colour changes. `FilterBadge` already handles the active class.

---

## BRIEF-19 — Settings: Wired Sub-Panels Audit + Data Hookup

**Context:** `15-settings.tsx` already has a full `activeItem` switch and named panel components. The settings navigation IS wired. However, several panels render static/hardcoded data that should come from the backend.

**Panels to wire with live data:**

**ApiKeysSlot** — `useList('api-keys')` → show key name, prefix, created date, "Revoke" button → `useRemove('api-keys').mutate(id)`. "+ New API key" → modal: name (required) → `useCreate('api-keys').mutate({ name, key: crypto.randomUUID() })`.

**SessionsSlot** — `useList('sessions')` → show device, IP (mock), last active, "Revoke" → `useRemove('sessions').mutate(id)`. For demo: seed 2 sessions in `packages/backend/src/crm/seed.ts`.

**WebhooksSlot** — `useList('webhook-subscriptions')` → show URL, events, status. "+ Add webhook" → modal: url (required), events (multi-select checkboxes for: order.created, contact.created, project.updated). Submit → `useCreate('webhook-subscriptions').mutate`. "Delete" → `useRemove`.

**EmailProvidersSlot** — `useList('email-providers')` → show provider name, from address, status badge. For demo: seed 1 Outlook provider with `{ name: "Microsoft 365", from: "admin@designersmeet.com", status: "connected" }`. No add/edit in Phase 1 — "Manage in Phase 2" toast.

**UsersRolesPanel** — `useList('users')` → show user rows: avatar initials, name, email, role badge. "Invite user" button → toast "Invitations land in Phase 2". "Change role" dropdown → `useUpdate('users').mutate({ id, patch: { role } })`.

**GeneralPanel** — Pre-fill workspace name, timezone, logo from a hardcoded `workspace` object. "Save" → toast "Workspace settings saved" (no backend call in Phase 1).

**All other panels** (Branding, Workspaces, Locale & time, Teams, SSO providers, Audit log, Plan & usage, Invoices, Vendor portal) → already functional OR already showing `Phase2Panel`. Do not change them.

---

## BRIEF-20 — Conversations: Left Panel Folder Tree

**Context:** Check if the conversations left panel has a folder/channel tree (Inbox / Sent / Drafts / Starred etc.). If present as static links, wire them.

**Task:**
1. Find all `<button>` or `<a>` elements in the left sidebar column of `12-conversations.tsx` that represent folders or channels.
2. Add `const [activeFolder, setActiveFolder] = useState("inbox")` and wire each folder button to set `activeFolder`.
3. Apply active styling (already has the pattern in `SidebarNavItem` — reuse its `data-active` pattern).
4. Filter `inboxItems`:
   - inbox → all
   - starred → items where `item.starred === true` (add field to fixture if needed)
   - sent → items where `item.direction === "outbound"`
5. Folder item count badges → derive from filtered length.
6. No layout changes.

---

## BRIEF-21 — Sort Headers on All Tables

**Context:** `demoStore.list()` already accepts `{ sort: "fieldName", order: "asc"|"desc" }`. No page currently passes these. Tables in 04-contacts, 06-vendors, and settings sub-panels all have `<th>` headers that are unstyled and non-interactive.

**Rule:** Add a sort chevron icon INSIDE the existing `<th>` text — do NOT change the `<th>` element itself or its className. Pattern: `<th className={...}>Name <SortChevron field="name" /></th>`.

**Task — implement once, apply everywhere:**

1. Create `packages/frontend/src/components/SortChevron.tsx`:
```tsx
// Minimal sort indicator — mounts inside an existing <th>.
// Adds onClick to the parent <th> via a wrapping span.
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
interface Props { field: string; sort: string; order: string; onSort: (f: string) => void; }
export function SortChevron({ field, sort, order, onSort }: Props) {
  const active = sort === field;
  return (
    <button type="button" onClick={() => onSort(field)}
      className="ml-1 inline-flex opacity-50 hover:opacity-100"
      aria-label={`Sort by ${field}`}>
      {!active ? <ChevronsUpDown size={12} /> : order === "asc" ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
    </button>
  );
}
```

2. **04-contacts.tsx** — add `sort` + `order` state. Pass to `useList('contacts', { name: q, sort, order })`. Add `<SortChevron>` inside `<th>` for: Name, Type, Last contact.

3. **06-vendors.tsx** — same pattern. Sort fields: Vendor (name), Rating (quality_rating), Status (availability_status).

4. **15-settings.tsx → UsersRolesPanel** — if it renders a table, add sort on: name, email, role.

5. **15-settings.tsx → ApiKeysSlot** — sort by: name, createdAt.

6. **15-settings.tsx → WebhooksSlot** — sort by: url, status.

7. No `<th>` className changes. No layout changes. The chevron button is the only addition.

---

## BRIEF-22 — Wire All Decorative Filter Badges + Saved Filters

**Context:** Multiple pages have filter UI that renders correctly but ignores state.

**04-contacts.tsx — Saved Filters:**
- `savedFilters` const has 3 entries + "+ Saved filter". Currently just renders buttons.
- Add `const [activeSavedFilter, setActiveSavedFilter] = useState<string|null>(null)`.
- Each saved filter `onClick` → sets `activeSavedFilter`. Pass to `useList('contacts', { name: q, type: activeSavedFilter ?? undefined })`. Active filter gets `bg-primary-tint text-primary` styling (add `data-active` attribute — already handled by CSS).
- "+ Saved filter" → toast "Save custom filters — Phase 2".

**08-projects-board.tsx — Filter Badges:**
- Badges shown: "All", "High priority", "Overdue", "My projects", "Blocked", "+ Add filter".
- Add `const [boardFilter, setBoardFilter] = useState<string>("all")`.
- Each badge `onClick` → `setBoardFilter(label.toLowerCase())`.
- Apply to project rows before grouping by column:
  - `"high priority"` → `row.priority === "high"`
  - `"overdue"` → `new Date(row.target_end_date) < new Date()`
  - `"my projects"` → `row.manager_user_id === "u1"`
  - `"blocked"` → `row.status === "blocked"`
  - `"all"` → unfiltered
- Active badge: set `tone="primary"` (already supported by the `FilterBadge` component).
- "+ Add filter" → toast "Custom filters — Phase 2".

**10-pipelines.tsx — Filter Badges:**
- Badges shown: "Owner: Anyone", "Source: Any", "Close date: This quarter", "Value: Any", "+ Add filter".
- These are pipeline-deal filters. Add `const [ownerFilter, setOwnerFilter] = useState("all")`.
- For demo (Phase 1), clicking any filter badge → toast "Filter: [badge label] — refine in Phase 2". Mark badge as active visually while "active". This is acceptable because pipeline deals are sparse in demo mode.
- "+ Add filter" → toast "Custom deal filters — Phase 2".

**13-workflows.tsx — Filter search:**
- The `<SearchField placeholder="Filter…" />` inside the workflow list panel is decorative.
- Add `const [wfQ, setWfQ] = useState("")` and wire `onChange` → `setWfQ`.
- Filter the workflows list: `const filteredWorkflows = workflows.filter(w => w.name.toLowerCase().includes(wfQ.toLowerCase()))`.

**11-calendar.tsx — Event Type Filter (ADD, not change):**
- The calendar header has a search field. Below it, ADD a small filter chip row (using existing `FilterBadge` or `Badge` components already imported) with: All | Meeting | Call | Deadline | Reminder.
- Add `const [typeFilter, setTypeFilter] = useState("all")`.
- Filter `calendarEvents` by `event.event_type === typeFilter` (or `"all"`).
- Chips go immediately below the month navigation row — inserted, not replacing anything.

---

## BRIEF-23 — CrmModals REGISTRY: Expand + Ensure Edit Wired on All Tables

**Context:** `CrmModals` is already mounted and working for contacts, vendors, projects, conversations, calendar-events, workflows, forms. But the REGISTRY in `packages/frontend/src/components/CrmModals.tsx` is missing several resources, and not every table row has the edit `onClick` hooked up.

**Task 1 — Expand REGISTRY in `CrmModals.tsx`:**

Add entries for:
```
"pipeline-deals": { title: "Deal", fields: [name/contactName, value (number), note, pipelineStageId] }
"project-stages": { title: "Milestone", fields: [name/title, status (text), dueDate (date), assignee] }
"api-keys": { title: "API Key", fields: [name] }  // key is auto-generated, not editable
"sessions": { title: "Session", fields: [] }  // read-only, no edit form — skip create/edit
"webhook-subscriptions": { title: "Webhook", fields: [url (text), events (text, comma-separated)] }
"email-providers": { title: "Email Provider", fields: [name, from_address] }
"users": { title: "User", fields: [name, email, role] }
"pipeline-stages": { title: "Pipeline Stage", fields: [name, order (number)] }
```

**Task 2 — Wire edit buttons on every table/list that is missing them:**

**04-contacts.tsx** — contact row already calls `useUIStore.getState().openEdit("contacts", contact.id)` on the pencil icon. Verify it's in EVERY row's action cell. If there's a "three-dot" or `MoreHorizontal` icon, wire it to open a dropdown: Edit / Delete.

**06-vendors.tsx** — vendor row's edit icon → `useUIStore.getState().openEdit("vendors", vendor.id)`. Delete icon → `useUIStore.getState().openConfirmDelete("vendors", vendor.id)`.

**10-pipelines.tsx** — each pipeline-deal card (when rendered from BRIEF-10) → `openEdit("pipeline-deals", deal.id)` on the card's edit icon.

**13-workflows.tsx** — the `WorkflowCard` component → add pencil icon that calls `openEdit("workflows", workflow.id)`. Don't add a full button — just a `<IconButton title="Edit">` inside the card's action row.

**14-forms.tsx** — each form row → edit icon → `openEdit("forms", form.id)`. Delete → `openConfirmDelete("forms", form.id)`.

**15-settings.tsx → UsersRolesPanel** — each user row → role `<select>` already wired OR add a "Change role" `<select>` inline. No `openEdit` for users — do inline role change.

**Task 3 — Add REGISTRY field type `"select"` support to `RecordForm`:**

Currently `RecordForm` only renders `<Input>`. Add a `type: "select"` with `options: string[]`:
```tsx
interface Field {
  name: string; label: string;
  type?: "text" | "email" | "number" | "date" | "select";
  options?: string[];
}
```
Render a `<select>` (using existing `<Input>` className for visual consistency) when `type === "select"`.

Update existing REGISTRY entries to use `type: "select"` for status/role fields:
- `contacts.type` → options: ["client", "vendor", "lead"]
- `vendors.tier` → options: ["preferred", "standard", "probation"]
- `workflows.status` → options: ["active", "paused", "disabled"]
- `users.role` → options: ["admin", "pm", "designer", "vendor", "viewer"]

---

## BRIEF-24 — Role-Based Access Control (RBAC)

**Scope:** Configure which pages + data actions each role can access. Enforced in sidebar navigation and at page entry. Configured from Settings → Users & Roles panel. Zero visual change to any page's content area.

### Part A — Backend: `role-permissions` resource

**File:** `packages/backend/src/crm/types.ts`

Add schema:
```typescript
const RolePermissionSchema = z.object({
  id: z.string(),                          // e.g. "perm_admin"
  role: z.enum(["admin","pm","designer","vendor","viewer"]),
  page: z.string(),                        // e.g. "contacts", "vendors", "settings"
  canView: z.boolean().default(true),
  canCreate: z.boolean().default(false),
  canEdit: z.boolean().default(false),
  canDelete: z.boolean().default(false),
  updatedAt: z.string(),
});
```

Register in `RESOURCES` and seed with sensible defaults in `packages/backend/src/crm/seed.ts`:

| role     | contacts | vendors | projects | pipelines | calendar | conversations | workflows | forms | settings |
|----------|----------|---------|----------|-----------|----------|---------------|-----------|-------|---------|
| admin    | CRUD     | CRUD    | CRUD     | CRUD      | CRUD     | CRUD          | CRUD      | CRUD  | CRUD    |
| pm       | CR       | CR      | CRUD     | CRUD      | CR       | CR            | CR        | CR    | view    |
| designer | view     | view    | view     | -         | view     | view          | -         | -     | -       |
| vendor   | -        | view(self)| view   | -         | -        | view          | -         | -     | -       |
| viewer   | view     | view    | view     | view      | view     | view          | -         | -     | -       |

### Part B — Frontend: `usePermission` hook

**File:** `packages/frontend/src/hooks/usePermission.ts` (new file)

```typescript
import { useAuth } from "../auth/AuthProvider.js";
import { useList } from "./useResource.js";

export type Action = "view" | "create" | "edit" | "delete";

export function usePermission(page: string, action: Action): boolean {
  const { user, demoMode } = useAuth();
  // Admin always has full access
  if (!user || user.roles.includes("admin")) return true;
  const { data } = useList("role-permissions", { role: user.roles[0], page });
  const perm = data?.data?.[0];
  if (!perm) return false;
  if (action === "view") return perm.canView;
  if (action === "create") return perm.canCreate;
  if (action === "edit") return perm.canEdit;
  if (action === "delete") return perm.canDelete;
  return false;
}
```

### Part C — Enforcement in sidebar

**File:** `packages/frontend/src/lib/demoInteractions.tsx`

The `NAV_ROUTES` map drives navigation. Add a guard: if `usePermission(pageName, "view")` returns false for a nav item, set `aria-disabled="true"` and `data-disabled="true"` on that sidebar nav item's DOM element. Use a `MutationObserver` or a one-time DOM scan after navigation to apply.

Actually, simpler: create `packages/frontend/src/components/NavGuard.tsx` — a component mounted in `main.tsx` (after `AuthProvider`) that:
1. Loads all role-permissions for the current user's role via `useList('role-permissions', { role: userRole })`.
2. On load, walks `document.querySelectorAll('[data-nav-label]')` (add `data-nav-label="contacts"` etc. to sidebar items in `demoInteractions.tsx`).
3. For each nav item whose page has `canView: false` → add `data-disabled="true"` + `aria-hidden="true"` to that element.
4. Remounts (via a key on role change) when user role changes.

Mount `<NavGuard />` in `main.tsx` between `<AuthProvider>` and `<BrowserRouter>` (wrapping both inside the provider).

### Part D — Page-level guard

**File:** `packages/frontend/src/components/PageGuard.tsx` (new file)

```tsx
import { usePermission } from "../hooks/usePermission.js";
export function PageGuard({ page, children }: { page: string; children: React.ReactNode }) {
  const canView = usePermission(page, "view");
  if (!canView) return (
    <div className="flex h-full items-center justify-center flex-col gap-3 text-secondary">
      <ShieldCheck size={32} />
      <p className="text-[14px]">You don't have access to this page.</p>
      <p className="text-[12px] text-muted">Ask your admin to update your role permissions.</p>
    </div>
  );
  return <>{children}</>;
}
```

Wrap each page's root `<div>` with `<PageGuard page="contacts">` etc. Import is at the top of each page file — NO layout change to the page's own JSX.

### Part E — Settings panel: Role Permissions UI

**File:** `packages/frontend/src/pages/15-settings.tsx`

Add a new settings section item to `settingsSections` under "People":
```typescript
{ label: "Role permissions", icon: ShieldCheck }
```

Add a `RolePermissionsPanel` function component and register it in the `activeItem` switch.

The panel renders:
1. A role selector: tab strip or `<select>` — choose between admin / pm / designer / vendor / viewer.
2. A permissions table: one row per page, columns: Page | View | Create | Edit | Delete — each a checkbox.
3. Checkboxes are wired: `onChange` → `useUpdate('role-permissions').mutate({ id: perm.id, patch: { canView, canCreate, canEdit, canDelete } })`.
4. Admin row is always fully checked and disabled (cannot be restricted).
5. Save is immediate (no "Save" button needed — each checkbox fires immediately).
6. Style: use existing `<table>` pattern from `AuditLogPanel`. Use existing `<Badge>` for the role tab. Use `<Checkbox>` from shadcn/ui components (already installed).

---

## Execution Order

Run briefs in this order (dependency chain):
1. **BRIEF-11** (backend: pipeline-deals, form-responses, users, role-permissions seed data)
2. **BRIEF-23 Part 1** (CrmModals REGISTRY expansion + select field type)
3. **BRIEF-02 + BRIEF-03** (contact + vendor CRUD modals — now use select fields)
4. **BRIEF-24 Parts A+B** (role-permissions backend resource + usePermission hook)
5. **BRIEF-21** (SortChevron component + wire to contacts, vendors, settings tables)
6. **BRIEF-22** (all decorative filter badges wired)
7. **BRIEF-04** (projects board drag + new project)
8. **BRIEF-05** (calendar event create + type filter)
9. **BRIEF-06** (workflows run + toggle)
10. **BRIEF-07** (forms counter + preview)
11. **BRIEF-09** (dashboard live stats)
12. **BRIEF-10** (pipelines deal cards)
13. **BRIEF-12 + BRIEF-13** (detail page header data wiring)
14. **BRIEF-14** (project stage checkboxes)
15. **BRIEF-15** (contact detail — 7 tabs wired)
16. **BRIEF-16** (vendor detail — 7 tabs wired)
17. **BRIEF-17** (project detail — 6 tabs wired)
18. **BRIEF-18 + BRIEF-20** (conversations filters + folder tree)
19. **BRIEF-19** (settings sub-panel live data — api-keys, sessions, webhooks, users)
20. **BRIEF-08** (settings profile + notifications)
21. **BRIEF-23 Part 2** (edit buttons on all remaining tables — do last, after all pages are wired)
22. **BRIEF-24 Parts C+D+E** (NavGuard + PageGuard + Role Permissions panel — final, after all pages exist)

## Aider Command Template

```powershell
$WT = "C:\Users\smani\CompanyWorkspaces\Designersmeet\crm-app\.claude\worktrees\confident-archimedes-a4d918"
cd $WT

# Always include the shared context files + the specific page(s) for the brief
# BRIEF-11 example:
aider --model claude-sonnet-4-5 `
  packages/backend/src/crm/types.ts `
  packages/backend/src/crm/seed.ts `
  --message "Apply BRIEF-11 from brief/aider-briefs-2026-05-21.md"

# BRIEF-24 (RBAC) example — include all new files it must create:
aider --model claude-sonnet-4-5 `
  packages/backend/src/crm/types.ts `
  packages/backend/src/crm/seed.ts `
  packages/frontend/src/hooks/usePermission.ts `
  packages/frontend/src/components/PageGuard.tsx `
  packages/frontend/src/components/NavGuard.tsx `
  packages/frontend/src/components/CrmModals.tsx `
  packages/frontend/src/stores/uiStore.ts `
  packages/frontend/src/pages/15-settings.tsx `
  packages/frontend/src/main.tsx `
  --message "Apply BRIEF-24 (all parts) from brief/aider-briefs-2026-05-21.md"
```

## Acceptance Criteria (all briefs)

- [ ] Every interactive element is wired or visibly disabled (`data-disabled` + `cursor-not-allowed` + `pointer-events-none`)
- [ ] Zero visual deviation: no colour literals changed, no layout restructuring, no element removal
- [ ] TypeScript: zero new errors (pre-existing errors in 12-conversations.tsx are known, ignore)
- [ ] `npm run build` passes for both `packages/backend` and `packages/frontend`
- [ ] Demo mode: all CRUD + sort + filter works against `demoStore` without a real backend
- [ ] RBAC: viewer role cannot see Settings; vendor role cannot see Contacts; admin sees everything
- [ ] Sort: clicking a column header twice reverses order (asc → desc)
- [ ] Console: zero unhandled promise rejections

---

## BRIEF-25 — Clerk Auth Integration

**Status:** DONE (implemented directly, not via Aider — infrastructure replacement)

**What changed:**
- `packages/frontend/src/auth/AuthProvider.tsx` → replaced MSAL with `@clerk/clerk-react`. Same `useAuth()` API surface preserved. Demo mode (no `VITE_CLERK_PUBLISHABLE_KEY`) works identically to before.
- `packages/backend/src/auth/authMiddleware.ts` → replaced JWKS/jose verification with `@clerk/backend` `verifyToken()` + `clerkClient.users.getUser()`. `AUTH_MODE=clerk` is the new production value.
- `packages/backend/src/config.ts` → added `CLERK_SECRET_KEY`, `CLERK_PUBLISHABLE_KEY`, `AUTH_MODE=clerk` enum value.

**Env vars to set in Vercel:**
```
# Frontend
VITE_CLERK_PUBLISHABLE_KEY=pk_live_...   ← from Clerk dashboard → API Keys

# Backend
CLERK_SECRET_KEY=sk_live_...             ← from Clerk dashboard → API Keys
AUTH_MODE=clerk

# Remove / leave unused (kept for Dataverse service principal):
# ENTRA_CLIENT_ID, ENTRA_TENANT_ID (still valid for Dataverse, not auth)
# VITE_MSAL_CLIENT_ID, VITE_MSAL_TENANT (no longer needed for auth)
```

**Clerk dashboard setup (one-time):**
1. Create app at clerk.com → name it "DesignersMeet CRM"
2. Enable social connections: Microsoft 365 + Google
3. For Microsoft — add Graph scopes: User.Read Mail.ReadWrite Mail.Send Calendars.ReadWrite Contacts.ReadWrite offline_access
4. Create JWT template named "microsoft-graph" (for getGraphToken() — optional, Graph proxy still stubs without it)
5. Add redirect URLs: https://designersmeet-crm-backend.vercel.app, http://localhost:5173

**Acceptance:**
- [ ] Sign in with Microsoft works → user lands on Dashboard
- [ ] Sign in with Google works → freelancer lands on Dashboard
- [ ] Demo mode (no VITE_CLERK_PUBLISHABLE_KEY) still works locally
- [ ] Backend rejects requests without a valid Clerk session token (401)
