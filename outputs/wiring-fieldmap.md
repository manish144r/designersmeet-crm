# DesignersMeet — Demo Fixtures → Page Wiring Field Map

> Generated 2026-05-19. Source: `packages/frontend/src/pages/01..16-*.tsx` literals
> extracted verbatim into `packages/frontend/src/lib/demoFixtures.ts`.
>
> This drives an automated downstream wiring pass. Pages are pixel-locked
> (≤2% visual drift). Wiring = swap the literal array source for
> `demoFixtures[resource]` (or a `useList(resource)` hook resolving from it)
> while keeping the EXACT row/card JSX shape. Field names below are the keys
> the existing JSX already reads — do NOT rename them to Zod schema names at
> wire time; the fixture rows carry the literal field names on purpose.
>
> "STAYS LITERAL" = no clean canonical resource; leave the in-component array
> as-is to preserve pixels (see note at the bottom).

---

## 01 — signin (`01-signin.tsx`)

- Literal vars: `none` (only static marketing copy + nav-less auth screen).
- Resource key: `none`.
- Wire instruction: **No data wiring.** Auth only — `signIn(provider)` handlers
  via `auth/AuthProvider`. No `demoFixtures` key applies.

## 02 — onboarding (`02-onboarding.tsx`)

- Literal vars: `workspaceNavItems`, `surfaceNavItems` (sidebar chrome, static);
  the single "DesignersMeet HQ" workspace row is inline JSX, not an array.
- Resource key: `none` (no `workspaces` resource exists).
- Wire instruction: **No data wiring.** Keep the static HQ workspace row.
  Nav items stay literal chrome. M365 connect = domain OAuth redirect.

## 03 — dashboard (`03-dashboard.tsx`)

- Literal vars: `activities`, `deliverables`, `bookings`, `chartBars`,
  `workspaceNavItems`, `surfaceNavItems`.
- Resource keys: **none cleanly.** `bookings` ≈ `calendar-events` but the
  fields differ entirely (`time`/`period`/`title`/`detail`/`badge` vs the
  flattened calendar-events shape) and the dashboard shows a hand-curated
  "today" subset, not the calendar matrix.
- Wire instruction: **All four data arrays STAY LITERAL** (no `activity`,
  `deliverables` resources; `bookings`/KPI/chart numbers are aggregates with no
  backing resource). Optionally bind KPI counts from
  `demoFixtures.projects` / `demoFixtures.vendors` `.length` only if drift
  budget allows; the locked count strings ("9 / 12", "₹ 84.2 L") should stay.

## 04 — contacts (`04-contacts.tsx`)

- Literal vars: `const contacts = [...]` (12 rows); `savedFilters` (filter
  chips, static chrome).
- Resource key: `contacts` (canonical — this is the richest contacts list).
- Row fields used by JSX: `id, initials, name, email, type, project, tag,
  owner, lastContact`.
- Wire instruction: replace `const contacts = [...]` with
  `useList('contacts').data?.data` (resolves to `demoFixtures.contacts`).
  Keep the `key={`${contact.name}-${contact.email}`}` shape or switch to
  `contact.id`. **Do NOT rewrite** the footer "Showing 1–12 of 2,438" or the
  pager "204" — those are locked copy, not derived from `total`.

## 05 — contact-detail (`05-contact-detail.tsx`)

- Literal vars: `timelineItems`, `upcomingItems`, `attachments`, `propertyRows`
  (all card sub-lists); profile header is static Priya Raghavan JSX.
- Resource key: primary entity is `contacts` (single row via
  `useItem('contacts', id)` → `demoFixtures.contacts` find by id, e.g. `ct1`).
- Row fields the header reads (static today): name, type badge, email, phone,
  address, company, owner — present on `ct1` only as `name/email`; phone/
  address/company are NOT on the contacts fixture (mock-only) → keep static.
- Wire instruction: bind the profile header name/email from
  `useItem('contacts', id)` if an `:id` route resolves; **`timelineItems`,
  `upcomingItems`, `attachments`, `propertyRows` STAY LITERAL** (no timeline/
  files resource; `messages`/`calendar-events` shapes don't match these card
  layouts). The `/contact-detail` (no id) route must keep a static fallback.

## 06 — vendors (`06-vendors.tsx`)

- Literal vars: `const vendors: Vendor[] = [...]` (12 rows); `savedViews`
  (filter chips, static chrome).
- Resource key: `vendors` (canonical — richest vendors list).
- Row fields used by JSX: `id, initials, name, skills, regions[], tier,
  rating, reviews, agreement, status`.
- Wire instruction: replace `const vendors: Vendor[] = [...]` with
  `useList('vendors').data?.data` (→ `demoFixtures.vendors`). `regions` stays a
  string[] (`.map` in the Regions cell). Keep `tier`/`agreement`/`status` as
  the literal display strings ("Tier-1"/"Signed"/"Active") — render-time only,
  no schema-enum mapping. Footer "Showing 1–12 of 41" is locked copy.

## 07 — vendor-detail (`07-vendor-detail.tsx`)

- Literal vars: `skills`, `rateRows`, `projectRows`, `complianceItems`,
  `teamContacts`, `profileTabs`; header is static Aurora Studio JSX.
- Resource key: primary entity `vendors` (single via `useItem('vendors', id)`
  → `demoFixtures.vendors` find `vn1` = Aurora Studio).
- Row fields header would read: `name`, `tier`, `rating` (on `vn1` as
  `name/tier/rating`); skills string differs from `vn1.skills`.
- Wire instruction: optionally bind header name/rating from
  `useItem('vendors','vn1')`. **`rateRows`, `projectRows`, `complianceItems`,
  `teamContacts`, `skills` STAY LITERAL** (rate_card_json opaque; no
  vendor-assignments / reviews / compliance resources).

## 08 — projects-board (`08-projects-board.tsx`)

- Literal var: `const projectColumns: ProjectColumn[] = [...]` (6 columns,
  13 cards nested).
- Resource key: `projects` (FLATTENED — fixture rows carry `status` =
  column title).
- Row fields used by card JSX: `id, title, due, owner, milestones,
  progressClass, vendors[]` (or `noVendors: true`). Column header reads
  `status` (title), `columnCount`, `dotClass`.
- Wire instruction: replace `const projectColumns = [...]` with grouping
  `useList('projects')` rows by `row.status` into the 6 columns
  (`["Brief","Concept","Design","Procurement","Install","Handover"]`, in that
  order). Derive each column's count from the grouped length OR keep
  `row.columnCount` (identical). `dotClass` is per-row (constant within a
  group). Drag-to-move = `PATCH projects/:id {status:<targetColumn>}` (needs a
  DnD lib added; card markup unchanged).

## 09 — project-detail (`09-project-detail.tsx`)

- Literal vars: `milestones` (→ resource), `deliverables`, `tasks`,
  `activities`, `vendors`, `comments`, `projectDetails`, `tabs`.
- Resource key: `project-stages` for `milestones` (fixture rows carry
  `project_id: "pj4"`, `order`, `label`, `status`). Header entity = `projects`
  single (`pj4` = "Brand Refresh — Lumen Café").
- Row fields used by milestone bar JSX: `label, status` (status ∈
  done|active|pending — already the literal values; no enum remap needed).
- Wire instruction: replace `const milestones = [...]` with
  `useList('project-stages')` filtered to `project_id === 'pj4'`, sorted by
  `order`; render each node by `row.status`. **`deliverables`, `tasks`,
  `activities`, `vendors`, `comments`, `projectDetails` STAY LITERAL** (no
  deliverables/tasks/activity/vendor-assignment/comments resources).

## 10 — pipelines (`10-pipelines.tsx`)

- Literal var: `const pipelineColumns: PipelineColumn[] = [...]` (5 columns,
  15 opportunity cards nested).
- Resource keys: `pipeline-stages` for the COLUMN headers; `pipelines` for the
  pipeline name. **Opportunity cards have NO resource → STAY LITERAL.**
- Column-header fields used by JSX: `title, count, total, dotClass` (fixture
  `pipeline-stages` carries these verbatim + `pipeline_id`, `order`).
- Wire instruction: bind column headers from `useList('pipeline-stages')`
  filtered to `pipeline_id === 'pl1'`, sorted by `order` — render
  `title`/`count`/`total`/`dotClass` unchanged. The pipeline name "Sales" comes
  from `demoFixtures.pipelines[0]`. **Keep `column.cards` (opportunities)
  literal** — copy the card arrays out of `pipelineColumns` into a local const
  if the column meta is hook-bound, since opportunities are not a resource.

## 11 — calendar (`11-calendar.tsx`)

- Literal vars: `calendarRows` (→ resource), `weekDays`, `bookingCalendarDays`,
  `availableTimes` (booking-page mock, static).
- Resource key: `calendar-events` (FLATTENED — only non-null cells; each row
  carries `time` = row.label and `dayIndex` = column 0..6, plus `span`/`tone`).
- Row fields used by event-block JSX: `title, detail, span?, tone?`; placement
  keyed by `time` (row) + `dayIndex` (column).
- Wire instruction: replace the `calendarRows` matrix with a placement pass:
  for each `time` label and each `dayIndex` 0..6, find
  `useList('calendar-events')` rows where `row.time === label &&
  row.dayIndex === col`, render `<CalendarEventBlock>` with that row (else
  `null`). Preserve the `grid-cols-[60px_repeat(7,1fr)]` structure and
  `span` height classes. `weekDays`, `bookingCalendarDays`, `availableTimes`
  **STAY LITERAL** (booking page is a visual mock).

## 12 — conversations (`12-conversations.tsx`)

- Literal vars: `inboxItems` (→ resource), `threadMessages` (→ resource),
  `composerDefaultValue`; right-rail cards are inline static JSX.
- Resource keys: `conversations` for `inboxItems`; `messages` for
  `threadMessages` (rows carry `conversation_id: "cv1"`).
- `conversations` row fields used by InboxRow JSX: `id, initials, name, time,
  subject, preview, channel, active?, unread?`.
- `messages` row fields used by ThreadMessageItem JSX: `id, initials, sender,
  meta, body, tone?` (+ `conversation_id` for filtering).
- Wire instruction: replace `const inboxItems = [...]` with
  `useList('conversations').data?.data`; on row select, replace
  `const threadMessages = [...]` with `useList('messages')` filtered to the
  selected `conversation_id` (default `cv1`). Keep `composerDefaultValue` as
  the textarea's initial value (locked copy). Right-rail invoices/deliverables
  **STAY LITERAL** (no resource).

## 13 — workflows (`13-workflows.tsx`)

- Literal vars: `workflows` (→ resource), `lastRuns` (→ resource),
  `workflowSteps`, `variablesAvailable`; trigger/filter cards are inline JSX.
- Resource keys: `workflows` for the left list; `workflow-runs` for the
  inspector "Last 5 runs" (rows carry `workflow_id: "wf1"`).
- `workflows` row fields used by WorkflowCard JSX: `id, name, trigger, runs,
  status, active?`.
- `workflow-runs` row fields used by "Last 5 runs" JSX: `time, label, tone`
  (+ `workflow_id`).
- Wire instruction: replace `const workflows = [...]` with
  `useList('workflows').data?.data`; replace `const lastRuns = [...]` with
  `useList('workflow-runs')` filtered to selected `workflow_id` (default
  `wf1`). **`workflowSteps` (canvas) STAYS LITERAL** — `steps_json` is opaque
  per `WorkflowSchema`; the fixture stows the steps under `forms`-style
  opacity is N/A here, keep canvas literal. Status strings ("Live"/"Paused"/
  "Draft") are render-time only.

## 14 — forms (`14-forms.tsx`)

- Literal vars: `formFields` (→ stowed on the form row's `schema_json`),
  `fieldSections`, `inspectorOptions` (palette/inspector config, static).
- Resource key: `forms` (ONE row — `fm1` — the "Vendor onboarding form").
- Form-row fields available: `id, name, title, subtitle, public_slug,
  publicUrl, status, submissions, lastSubmission, on_submit_workflow_id,
  schema_json[]`. The canvas form cards iterate `schema_json` whose item shape
  is the literal `FormField` union (`label, meta, required?, active?, kind,
  value | badges/addLabel | (upload)`).
- Wire instruction: bind the header (`name`, `publicUrl`, `submissions`,
  `lastSubmission`) from `useItem('forms','fm1')`; replace
  `const formFields = [...]` with `form.schema_json`. **`fieldSections`,
  `inspectorOptions` STAY LITERAL** (static palette/inspector config, no
  resource). `form-submissions` is empty in fixtures (count string is locked
  copy).

## 15 — settings (`15-settings.tsx`)

- Literal vars: `integrations` (8 tiles), `settingsSections`,
  `workspaceNavItems`, `surfaceNavItems`.
- Resource key: `none` (no `integrations`/`sso`/`workspaces` resource).
- Wire instruction: **`integrations` STAYS LITERAL** (no backing resource;
  status/connected flags are locked). Wire only settings sub-nav routing and
  `Connect`/`Configure` → domain OAuth redirect stubs. No `demoFixtures` key.

## 16 — spec-sheet (`16-spec-sheet.tsx`)

- Literal vars: `screens` (15), `waves` (3).
- Resource key: `none` (internal documentation page).
- Wire instruction: **No wiring. Do not touch.** `Print` is already wired
  (`window.print()`). No `demoFixtures` key.

---

## Pages with NO cleanly-extractable canonical resource array

These render only sub-lists that have no canonical resource (opportunities,
deliverables, tasks, vendor-assignments, activity, files, invoices,
integrations, timeline, doc screens). Their data arrays **stay literal** at
wire time to preserve pixels:

- **01 signin**, **02 onboarding**, **16 spec-sheet** — no CRM data at all.
- **03 dashboard** — `activities`/`deliverables`/`bookings` have no resource.
- **05 contact-detail** — `timelineItems`/`upcomingItems`/`attachments`/
  `propertyRows` have no resource (header binds to one `contacts` row).
- **07 vendor-detail** — `rateRows`/`projectRows`/`complianceItems`/
  `teamContacts` have no resource (header binds to one `vendors` row).
- **15 settings** — `integrations` has no resource.

Pages **08, 10, 11, 12, 13** contribute flattened canonical arrays but ALSO
carry sibling literals (opportunity cards on 10, canvas steps on 13,
right-rail cards on 12, dashboard-style sub-cards on 09) that stay literal.
