# DesignersMeet Vendor Platform — SPEC

**Status:** Draft v0.1 — spec only. Code build happens in waves after this document is approved.
**Author:** Manish (with research support).
**Date:** May 17, 2026.
**Replaces:** `C:\Users\smani\CompanyWorkspaces\Designersmeet\crm-app` (current DesignersMeet CRM).

---

## 1. Vision & scope

DesignersMeet Vendor Platform is an internal-use CRM and project-delivery system for an interior design firm that orchestrates a network of vendors (carpenters, electricians, fabricators, suppliers) against client projects. It clones the surface area of Go High Level — contacts, pipelines, calendars, conversations, workflows, reporting — and adds a first-class **Vendor Project Delivery** module that GHL does not have. It is published into the Microsoft 365 ecosystem on three surfaces (Outlook add-in, Teams app, Power Apps embed), uses an all-white visual theme, treats every email path as a pluggable provider (M365 Graph first, then Gmail, IMAP/SMTP, and transactional ESPs), and integrates Shopify for vendor e-commerce + social marketing. This is Manish's first launch; the spec is honest about which features ship in MVP and which ship in later waves.

---

## 2. Personas

**Internal Admin (Manish)** — Owns the workspace, manages billing, configures integrations, sets vendor approval policy, audits everything. One or two people in this seat.

**Project Manager (PM)** — Day-to-day operator. Converts leads into projects, assigns vendors, runs the delivery board, sends client status updates, signs off deliverables. Lives in the platform 6+ hours a day. The most demanding user.

**Designer** — Creative lead on a project. Uses the platform to view briefs, upload mood boards and design files (via SharePoint integration), respond to client revision requests, and hand off to vendors. Read-heavy on contacts; write-heavy on deliverables.

**Vendor** — The carpenter / electrician / supplier. Accesses a *scoped* portal (sees only their assigned projects), receives task lists, uploads completion photos and invoices, communicates via WhatsApp + email. Lower-frequency user, mobile-first.

**Client** — Optional persona in V1. Receives status updates, approves deliverables, signs off milestones. Could log into a thin client portal V1.1+; V1 they live entirely outside the app and consume update emails + approval links.

---

## 3. Information architecture / navigation

**Top-level modules (left sidebar):**

```
🏠  Dashboard
📇  Contacts
    ├─ Clients
    └─ Vendors
🪜  Pipelines
    └─ Opportunities (by pipeline)
🧱  Projects                  ← the differentiator
    ├─ Active
    ├─ Templates
    └─ Archive
📅  Calendar
💬  Conversations
📝  Forms
⚡  Workflows
📊  Reports
⚙️  Settings
    ├─ Workspace
    ├─ Users & Roles
    ├─ Integrations
    ├─ Email providers
    ├─ Branding
    └─ Audit log
```

**Top bar:** workspace switcher (single-workspace V1, dropdown for V1.1+), global search, notifications, profile.

**Project-detail tabs:** Overview · Tasks · Deliverables · Vendors · Files · Budget (V2) · Activity.

**Contact-detail tabs:** Profile · Timeline · Conversations · Opportunities · Projects · Files · Custom fields.

---

## 4. Data model

Primary entities, relationships, and the high-confidence fields. Foreign keys are `*_id`; many-to-many is via a join table.

**Workspace** (id, name, slug, created_at). One per tenant at V1, schema-ready for many.

**User** (id, workspace_id, email, name, role, sso_provider, sso_id, primary_email_provider_id, avatar_url). Roles: `admin | pm | designer | vendor | viewer`.

**Contact** (id, workspace_id, type, first_name, last_name, primary_email, primary_phone, address, custom_fields_json, owner_user_id, created_at). `type` ∈ {`client`, `vendor`, `lead`}.

**Vendor** (extends Contact for type=vendor) — fields stored on Contact's `custom_fields_json` initially; promoted to a Vendor table when the column count gets unmanageable: `skills[]`, `regions[]`, `rate_card_json`, `certifications[]`, `nda_signed_at`, `msa_signed_at`, `availability_calendar_id`, `rating_avg`, `last_project_at`, `portfolio_links[]`.

**Tag** (id, workspace_id, name, color) and **ContactTag** join table.

**Pipeline** (id, workspace_id, name, stages_json). Stages are ordered.

**Opportunity** (id, pipeline_id, contact_id, owner_user_id, name, value_cents, currency, stage, source, close_date_expected, closed_at, status). `status` ∈ {`open`, `won`, `lost`}.

**Project** (id, workspace_id, opportunity_id, contact_id, name, status, manager_user_id, designer_user_id, start_date, target_end_date, actual_end_date, budget_cents). `status` ∈ {`brief`, `concept`, `design`, `procurement`, `install`, `snag`, `handover`, `closed`}.

**VendorAssignment** (id, project_id, vendor_contact_id, role, scope_text, fee_cents, status). `role` ∈ {`carpenter`, `electrician`, `painter`, `supplier`, ...}, `status` ∈ {`invited`, `accepted`, `declined`, `active`, `completed`}.

**Task** (id, project_id, vendor_assignment_id?, assigned_user_id?, title, description, due_date, status, parent_task_id?). `status` ∈ {`todo`, `in_progress`, `blocked`, `done`}.

**Deliverable** (id, project_id, name, milestone_id?, current_version_id, client_approval_status, created_by_user_id). Has many **DeliverableVersion** (id, deliverable_id, version_number, sharepoint_file_url, uploaded_by_user_id, uploaded_at, client_feedback_text).

**Milestone** (id, project_id, name, order, status, unlocks_after_milestone_id?). `status` ∈ {`pending`, `in_review`, `approved`, `skipped`}.

**Calendar** (id, workspace_id, owner_user_id, type, name, m365_calendar_id, google_calendar_id). `type` ∈ {`personal`, `service_menu`, `team_collective`, `class`}.

**Booking** (id, calendar_id, contact_id, start_at, end_at, m365_event_id, status, reminder_sent_at).

**Form** (id, workspace_id, name, schema_json, on_submit_workflow_id, public_slug).

**FormSubmission** (id, form_id, contact_id?, payload_json, submitted_at).

**Workflow** (id, workspace_id, name, trigger_type, trigger_filters_json, steps_json, status).

**WorkflowRun** (id, workflow_id, trigger_payload_json, status, started_at, completed_at, error_text).

**Conversation** (id, workspace_id, contact_id, last_message_at, assigned_user_id, status). One per contact in V1.

**Message** (id, conversation_id, channel, direction, from_address, to_address, body, attachments_json, provider_id, provider_message_id, rfc_message_id, in_reply_to_rfc_id, sent_at). `channel` ∈ {`email`, `whatsapp`, `sms`, `webchat`, `fb`, `ig`, `gbm`, `call`}.

**EmailProviderConfig** (id, owner_user_id?, workspace_id, kind, traffic_class, settings_json, status). `kind` ∈ {`msgraph`, `gmail`, `imap_smtp`, `resend`, `ses`, `sendgrid`, `postmark`, `mailgun`}. `traffic_class` ∈ {`human_outbound`, `system_transactional`}.

**Integration** (id, workspace_id, kind, credentials_encrypted, status). `kind` ∈ {`m365`, `google`, `shopify`, `meta`, `stripe`, `twilio`, ...}.

**ActivityEvent** (id, workspace_id, entity_type, entity_id, actor_user_id?, kind, payload_json, at). The audit trail and the trigger source for Workflows.

**AuditLog** (id, workspace_id, actor_user_id, action, target_type, target_id, ip, user_agent, at). For compliance, separate from ActivityEvent.

Diagram (conceptual, not exhaustive):

```
Workspace
  └── User (n)
  └── Contact (n) ──── Tag (n via join)
        ├── Opportunity (n) ──── Pipeline
        ├── Project (n) ──── VendorAssignment (n) ──── Vendor (Contact)
        │     ├── Task (n)
        │     ├── Milestone (n) ──── Deliverable (n) ── DeliverableVersion (n)
        │     └── ActivityEvent (n)
        ├── Conversation (1) ──── Message (n)
        ├── Booking (n) ──── Calendar
        └── FormSubmission (n) ──── Form
  └── Workflow (n) ──── WorkflowRun (n)
  └── EmailProviderConfig (n)
  └── Integration (n)
  └── AuditLog (n)
```

---

## 5. MVP feature list — UX flow per feature

**(1) Workspaces & Multi-tenancy.** On first install the DB seeds a single `DesignersMeet HQ` workspace and the admin is added. Every entity is implicitly scoped by `workspace_id`. The top-bar workspace switcher exists but shows one option; schema-ready for the second workspace without migration.

**(2) Contacts & CRM.** Sidebar → Contacts → Clients/Vendors filter. List view with virtual-scroll table (sortable, filterable, saved filter = Smart List), bulk actions, CSV import, Excel export. Detail view = tabbed page (Profile, Timeline, Conversations, Opportunities, Projects, Files, Custom fields). Creating a Vendor from the form pre-loads richer fields (skills, regions, certifications); creating a Client uses the lighter shape.

**(3) Communications & Email Stack.** Settings → Email providers shows the user their primary provider (default: Microsoft Graph for Outlook users). Workflow nodes and one-off "Send email" actions resolve through the `EmailProvider` interface (see §8). System-sent emails (form notifications, project status digests, vendor onboarding sequences) route through the `TransactionalEmailProvider` (Resend at launch) using the `mail.designersmeet.com` sending domain. WhatsApp Business Cloud API is wired the same way: Settings → Integrations → WhatsApp, the user authenticates Meta, and template messages are managed in-app.

**(4) Forms & Surveys.** Sidebar → Forms → New. Drag-and-drop schema builder with field types (short text, long text, email, phone, number, single-select, multi-select, file upload, date, address). Forms expose a public slug (`forms.designersmeet.com/<slug>`) and an embed snippet. On submission: create/update Contact, fire the linked Workflow (e.g. "Vendor onboarding form → tag vendor, send WhatsApp welcome, create vendor profile draft"). V1 ships two seed forms: Vendor onboarding and Client brief.

**(5) Calendars & Booking.** Each user connects their Outlook calendar via M365 OAuth on first login. The platform creates a default Personal calendar bound to the user's M365 calendar via two-way sync (Graph `Calendars.ReadWrite`). PMs can create a Service Menu calendar (the bookable consultation page at `book.designersmeet.com/<slug>`). Client books a slot → Booking row created → M365 calendar event created on the PM's calendar (with the client added as attendee) → reminder email sent via the EmailProvider abstraction 24h and 1h before.

**(6) Pipelines & Opportunities.** Sidebar → Pipelines. V1 ships one pre-seeded "Sales" pipeline with stages New → Qualified → Brief → Proposal → Won/Lost. Kanban drag-and-drop; cards show contact name, value, owner, days-in-stage. On drop into "Won", the opportunity-to-project conversion modal appears: choose project template, project name, manager, designer, target end date. Confirming creates the Project (next feature).

**(7) Vendor Project Delivery — THE differentiator.** Sidebar → Projects. List view + Kanban-by-status view. Project detail = the heaviest screen in the app: header (name, status, manager, target date), tabs:
- *Overview:* milestones progress bar, next-milestone vendors, next-deliverable, recent activity.
- *Tasks:* list grouped by milestone or by vendor, inline status toggles, due-date sort, "add task" inline.
- *Deliverables:* card grid; each card shows current version thumbnail (PDF/image preview from SharePoint), version history, approval state, "request client approval" button (sends email through the EmailProvider with an approve/revise link).
- *Vendors:* roster of `VendorAssignment` rows with role, scope, fee, status; "invite vendor" opens a picker against the vendor DB.
- *Files:* embedded SharePoint folder view (via Graph Drive API).
- *Activity:* full chronological event log.

Vendor portal (separate scoped surface, accessible via vendor SSO): they see only assigned projects, their tasks, their deliverables upload box, and the project chat. No budgets, no other vendors' tasks.

**(8) Conversations Inbox.** Sidebar → Conversations. Three-pane: list (left) sorted by unread + last-message-at; thread (center) with channel badges per message; context (right) showing the contact's current project, open invoices, last-5 deliverables, upcoming calendar events. Reply composer is channel-aware: picks the channel the last message came in on by default, can be overridden. Email replies route through the user's primary provider. WhatsApp replies go through Meta Cloud API. Internal notes are a separate composer mode that never sends.

**(9) Workflows & Automations.** Sidebar → Workflows. V1 ships as **rule-based linear automations** (trigger + filters + ordered action list), not the full visual canvas. Trigger catalogue: form submitted, contact tag added, opportunity stage changed, project status changed, deliverable approved, vendor certification expiring (cron-based), booking created. Action catalogue: send email (via `EmailProvider` with traffic class), send WhatsApp template, post to Teams channel, create SharePoint folder, apply/remove tag, assign vendor to project, change project status, create calendar event, call webhook (so Power Automate can subscribe). Seed workflows ship installed: "Won opportunity → create project + welcome client + onboard vendor pool" and "Deliverable approved → unlock next milestone + status email to client".

**(10) Reporting & Dashboards.** Sidebar → Reports. V1 ships six fixed dashboards (no custom builder yet): Pipeline Value, Project Health (RAG by status), Vendor Utilization (% of vendors active this month), Deliverable Cycle Time (avg days from upload to approval), Overdue Tasks, This-Month Bookings. Each dashboard is a single Recharts-rendered page with date-range picker. Export to CSV on every widget. Auto-emailed weekly digest (Sunday 6pm) goes to the admin via the `TransactionalEmailProvider`.

---

## 6. Theme spec

**Background.** All-white. `#FFFFFF` page background. No dark mode default in V1; dark mode is a V2 setting (CSS variables prepared for it now to avoid refactor later).

**Surface elevation through neutrals.** White on white needs a clear hierarchy. Use:
- Page bg: `#FFFFFF`
- Card surface 1: `#FFFFFF` with `border: 1px solid #E5E7EB` (no shadow on cards by default)
- Card surface 2 (hover/active): `#F9FAFB` (very light gray)
- Page dividers / chrome lines: `#E5E7EB`
- Sidebar bg: `#FAFAFA` (a half-tone separation from page bg)
- Modal scrim: `rgba(0, 0, 0, 0.45)`

**Text.**
- Primary text: `#0F172A` (slate-900)
- Secondary text: `#475569` (slate-600)
- Muted / placeholder: `#94A3B8` (slate-400)
- Disabled: `#CBD5E1` (slate-300)

**Accent color.** Recommended: **Indigo 600 — `#4F46E5`.** Defense: indigo reads as calm, professional, and "software-y" — none of the warm-fashion connotations that a brown/terracotta would push (avoiding any "this looks like an interior-design Pinterest board" risk inside the operational tool). It has high enough chroma to flag status meaningfully in dashboards but is neutral enough to recede behind data. Tailwind ships matching shades 50–900 out of the box, and shadcn primitives use the design-token system that consumes this with one line of CSS variable change. Reserved palette:
- Primary action: `#4F46E5` (indigo-600). Hover `#4338CA`. Active `#3730A3`.
- Primary action text: `#FFFFFF`.
- Status — success: `#16A34A`. Warning: `#D97706`. Danger: `#DC2626`. Info: `#0284C7`.
- Pipeline-stage tints: indigo-100, sky-100, emerald-100, amber-100, rose-100 (background only, never bold).

**Typography.** Inter for UI (variable font, weights 400/500/600/700). System fallback `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto`. Sizes: 12 / 14 / 16 / 20 / 24 / 32 / 40 (use a 4-step scale).

**Spacing scale.** Tailwind default (4px base). Page horizontal padding: 32. Card padding: 24. Form-field vertical rhythm: 16.

**Component primitives (shadcn/ui).** Button, Input, Select, Combobox, Checkbox, Radio, Switch, Tabs, Dialog, Sheet, Popover, Tooltip, DropdownMenu, Toast, Avatar, Badge, Skeleton, Table, Pagination, Calendar, DatePicker, Command (cmd-K palette). Custom on top: KanbanColumn, KanbanCard, ProjectStatusPill, VendorChip, DeliverableCard, ChannelBadge.

**Density.** Default density is "comfortable" (44px target rows). A "compact" density toggle (32px rows) lives in user settings — non-MVP nice-to-have, V1.1.

**Iconography.** `lucide-react` exclusively. 16px in dense contexts, 20px in default contexts, 24px for primary nav.

---

## 7. Stack

**Framework: Next.js 15 (App Router).** Defense: React-based per the brief; App Router gives us server components for the heavy list views (Contacts table, Projects board) without a separate API layer; Route Handlers cover webhook endpoints (Graph subscriptions, Stripe webhooks); Server Actions cover form submissions cleanly; built-in Vercel deploy story is the path of least resistance for Phase 0; ISR/SSG would be useful if we ever build public marketing pages. Remix was the alternative — equally capable, smaller ecosystem, and no Vercel-grade hosting story. Next.js wins on talent availability and deploy ergonomics.

**Styling: Tailwind CSS v4 + shadcn/ui.** Defense: Tailwind keeps the all-white theme expressible as a tiny set of utility classes plus design tokens; v4 has CSS-first config so the indigo accent + neutrals live in `globals.css` as `@theme` block. shadcn/ui is owned-source (we copy components into the repo, not import from a versioned package) — that's the right model for a system we'll be modifying heavily, vs. Material UI or Chakra where overrides fight the library.

**State management: TanStack Query** for server state, **Zustand** for tiny client-state islands (the Kanban drag state, the inbox compose draft). No Redux. React Hook Form + Zod for forms.

**Data layer: Prisma + PostgreSQL.** Postgres on Neon (Phase 0) or Azure Database for PostgreSQL Flexible Server (when M365 tenant consolidation matters). Prisma migrations checked into git. Read-heavy queries can drop to raw SQL inside Prisma for performance. No ORM lock-in — we can swap Prisma for Drizzle if the bundle/perf math changes.

**Auth: NextAuth v5 (Auth.js).** Providers: Google, Microsoft Entra ID, Apple. Session strategy: database sessions (Prisma adapter) so we can revoke. The Microsoft provider is mandatory for the M365 integration path — its access token is what feeds Graph API calls. Per the brief's SSO playbook, all three providers are required at launch.

**Backend / API: Next.js Route Handlers + Server Actions** for in-app traffic. **Long-running jobs** (workflow runs, calendar sync, email subscription renewals, vendor digest generation) go to a job queue — **BullMQ on Redis** (Upstash Redis for managed). Cron triggers via Vercel Cron at first; migrate to a real scheduler when cron count exceeds Vercel's free quota.

**File storage: Microsoft SharePoint** (primary, per the M365 integration brief) for project files. Uploads from the UI go via Graph Drive API directly from the browser using a SAS-style upload URL fetched from the server. For platform-internal files (vendor avatars, form attachments under 5MB) we use **Azure Blob Storage** since we're in the Microsoft ecosystem.

**Hosting:**
- App: **Vercel** for Phase 0 (fastest deploy, great Next.js DX). Migrate to **Azure App Service** in Wave 4 if the M365 tenant compliance story requires it (audit logging, Conditional Access, data residency).
- Postgres: Neon at start, Azure Database for PostgreSQL Flexible Server long-term.
- Redis: Upstash.
- Background workers: Vercel + a dedicated Render/Fly worker process for BullMQ; long-term Azure Container Apps.

**Norton-friendliness.** Cloud-first design means no local install for users — they hit `app.designersmeet.com` in a browser or open the Outlook add-in. Reduces the attack surface that AV products like Norton react to. The Outlook add-in and Teams app are signed/packaged through Microsoft's distribution channels (AppSource or org-internal sideload), which adds an extra trust layer.

**AI / LLM (deferred to Wave 4):** Azure OpenAI Service (since we're in the M365 estate), with Anthropic Claude API as the alternative when we need higher reasoning quality. Hosted prompt management via PromptLayer or in-repo prompt files.

---

## 8. Integration map

### 8.1 Microsoft 365 (primary ecosystem)

| Capability | Graph API | Scopes (delegated) | Used by |
|---|---|---|---|
| Send mail as user | `POST /me/sendMail` | `Mail.Send` | EmailProvider (human outbound) |
| Read/list inbox | `GET /me/messages` | `Mail.Read`, `Mail.ReadWrite` | Conversations Inbox |
| Subscribe to inbox changes (webhook) | `POST /subscriptions` | `Mail.Read` | Conversations Inbox push |
| Calendar read/write | `/me/events` | `Calendars.ReadWrite` | Calendars & Booking |
| Subscribe to calendar changes | `POST /subscriptions` | `Calendars.Read` | Calendar sync |
| Drive (SharePoint/OneDrive) — upload, list, get | `/drives/{driveId}/items` | `Files.ReadWrite.All`, `Sites.ReadWrite.All` | Project Files tab |
| Teams channel post | `POST /teams/{id}/channels/{id}/messages` | `ChannelMessage.Send` (delegated) | Workflow "post to Teams" action, project chat cross-post |
| Provision Team for project | `POST /teams` | `Group.ReadWrite.All`, `Team.Create` | Project creation (auto-create channel) |
| Groups (workspaces ↔ M365 groups) | `/groups` | `Group.ReadWrite.All` | Workspace bootstrap |
| User profile | `/me`, `/users/{id}` | `User.Read` | Login / org sync |

Known caveat: Teams channel messaging does **not** support application-only tokens in normal runtime (only the migration-import scenario). The platform's "post to Teams" action runs under a delegated user context — the workflow records "act as" the workflow owner.

Power Automate hook: every Workflow trigger fires a webhook event (`POST workflow.designersmeet.com/hooks/{trigger}`) so Power Automate's "When a HTTP request is received" connector can subscribe and extend our automations with Microsoft's flow ecosystem (approvals, Excel updates, etc.). Reverse direction: Power Automate flows can call our public webhook endpoints to trigger CRM actions.

Sources: [Graph Mail overview](https://learn.microsoft.com/en-us/graph/outlook-mail-concept-overview) · [Graph Calendar](https://learn.microsoft.com/en-us/graph/outlook-calendar-concept-overview) · [Graph permissions reference](https://learn.microsoft.com/en-us/graph/permissions-reference) · [Graph webhooks](https://learn.microsoft.com/en-us/graph/webhooks) · [Channel post message](https://learn.microsoft.com/en-us/graph/api/channel-post-messages) · [Power Automate HTTP trigger](https://learn.microsoft.com/en-us/connectors/custom-connectors/create-webhook-trigger)

### 8.2 M365 distribution — three publishing surfaces

Per the publishing-surface decision: the platform ships as an **Outlook add-in**, a **Teams app**, and a **Power Apps embed** in the M365 launcher. Each surface gets its own manifest. The same Next.js web app backs all three; the manifests just point to different routes/iframes.

#### 8.2.1 Outlook Add-in (Unified Manifest for Microsoft 365)

Unified Manifest (JSON) is the 2026-recommended format; the older XML manifest is still accepted for backward compatibility but new submissions should be unified.

Capabilities: a task pane in the Outlook message read surface that shows "Is this contact in DesignersMeet? If so, here's their project status, last invoice, next milestone. One-click actions: log this email to the contact timeline · convert to opportunity · attach to project."

Manifest skeleton (Unified Manifest, JSON):

```json
{
  "$schema": "https://developer.microsoft.com/json-schemas/teams/vDevPreview/MicrosoftTeams.schema.json",
  "manifestVersion": "devPreview",
  "id": "<GUID>",
  "version": "1.0.0",
  "name": { "short": "DesignersMeet", "full": "DesignersMeet Vendor Platform" },
  "description": {
    "short": "Project + vendor CRM inside Outlook",
    "full": "Surface DesignersMeet contact + project context inside Outlook messages."
  },
  "developer": {
    "name": "DesignersMeet",
    "websiteUrl": "https://app.designersmeet.com",
    "privacyUrl": "https://app.designersmeet.com/legal/privacy",
    "termsOfUseUrl": "https://app.designersmeet.com/legal/terms"
  },
  "icons": { "color": "icon-color.png", "outline": "icon-outline.png" },
  "accentColor": "#4F46E5",
  "validDomains": ["app.designersmeet.com"],
  "extensions": [{
    "requirements": { "scopes": ["mail"], "capabilities": [{ "name": "Mailbox", "minVersion": "1.5" }] },
    "runtimes": [{
      "requirements": { "capabilities": [{ "name": "Mailbox", "minVersion": "1.5" }] },
      "id": "TaskPaneRuntime",
      "type": "general",
      "code": { "page": "https://app.designersmeet.com/outlook/taskpane" },
      "lifetime": "short",
      "actions": [{ "id": "ShowTaskPane", "type": "openPage", "view": "TaskPane" }]
    }],
    "ribbons": [{
      "contexts": ["mailRead"],
      "tabs": [{
        "builtInTabId": "TabDefault",
        "groups": [{
          "id": "msgReadGroup",
          "label": "DesignersMeet",
          "controls": [{
            "id": "msgReadOpenPaneButton",
            "type": "button",
            "label": "Open DesignersMeet",
            "icons": [{ "size": 16, "url": "icon-16.png" }, { "size": 32, "url": "icon-32.png" }],
            "supertip": { "title": "DesignersMeet", "description": "View this contact in DesignersMeet" },
            "actionId": "ShowTaskPane"
          }]
        }]
      }]
    }]
  }]
}
```

Distribution: org-internal sideload during V1 testing (admin uploads the manifest in the Microsoft 365 Admin Center → Integrated apps); AppSource submission deferred until the public DesignersMeet brand has a marketing motion.

Reference: [Unified manifest overview](https://learn.microsoft.com/en-us/office/dev/add-ins/develop/unified-manifest-overview) · [Sideload with unified manifest](https://learn.microsoft.com/en-us/office/dev/add-ins/testing/sideload-add-in-with-unified-manifest)

#### 8.2.2 Teams App (manifest.json)

Capabilities: a Teams personal app (shows in the left rail of Teams) plus a configurable tab that can be added to any Teams channel — auto-added to project channels the platform provisions.

Manifest skeleton (Teams app manifest.json, schema 1.17+):

```json
{
  "$schema": "https://developer.microsoft.com/en-us/json-schemas/teams/v1.17/MicrosoftTeams.schema.json",
  "manifestVersion": "1.17",
  "version": "1.0.0",
  "id": "<GUID>",
  "packageName": "com.designersmeet.vendorplatform",
  "developer": {
    "name": "DesignersMeet",
    "websiteUrl": "https://app.designersmeet.com",
    "privacyUrl": "https://app.designersmeet.com/legal/privacy",
    "termsOfUseUrl": "https://app.designersmeet.com/legal/terms"
  },
  "name": { "short": "DesignersMeet", "full": "DesignersMeet Vendor Platform" },
  "description": {
    "short": "Vendor + project CRM",
    "full": "Inside Teams, see and manage your DesignersMeet projects, conversations, and vendor pool."
  },
  "icons": { "color": "color.png", "outline": "outline.png" },
  "accentColor": "#4F46E5",
  "staticTabs": [
    { "entityId": "dashboard",     "name": "Dashboard",     "contentUrl": "https://app.designersmeet.com/teams/dashboard",     "scopes": ["personal"] },
    { "entityId": "projects",      "name": "Projects",      "contentUrl": "https://app.designersmeet.com/teams/projects",      "scopes": ["personal"] },
    { "entityId": "conversations", "name": "Conversations", "contentUrl": "https://app.designersmeet.com/teams/conversations", "scopes": ["personal"] }
  ],
  "configurableTabs": [{
    "configurationUrl": "https://app.designersmeet.com/teams/tab-config",
    "scopes": ["team", "groupChat"],
    "context": ["channelTab"]
  }],
  "permissions": ["identity", "messageTeamMembers"],
  "validDomains": ["app.designersmeet.com"],
  "webApplicationInfo": {
    "id": "<AAD_APP_ID>",
    "resource": "api://app.designersmeet.com/<AAD_APP_ID>"
  }
}
```

Channel-tab UX: when a Project is created and a Teams channel is auto-provisioned, our backend uses Graph `POST /teams/{id}/channels/{id}/tabs` to add a tab pointing at `/teams/projects/{projectId}` — so the project's chat channel has the live project view one click away.

Distribution: upload the `.zip` (manifest + icons) via Teams Admin Center → Manage apps for org-wide install; or per-user via Teams → Apps → Upload custom.

Reference: [Teams app manifest schema](https://learn.microsoft.com/en-us/microsoftteams/platform/resources/schema/manifest-schema) · [Configurable tabs](https://learn.microsoft.com/en-us/microsoftteams/platform/tabs/how-to/create-channel-group-tab)

#### 8.2.3 Power Apps embed in the M365 launcher

Capability: discoverable in the Microsoft 365 app launcher ("waffle menu") alongside Outlook/Teams/Word/Excel, so users find DesignersMeet without typing a URL. Two implementation paths:

- **Lightweight (V1):** a **Power Apps Canvas App** that's just an embedded iframe wrapper pointing to `https://app.designersmeet.com/embed`. The Canvas App is published to the env, shared with the tenant's users, and shows up in the launcher because Canvas Apps surface there automatically when an admin pins them via the M365 Admin Center → Org settings → Microsoft 365 → My organization's app launcher → Add custom tile. The "tile" we add is a simple URL tile to `app.designersmeet.com` — fastest path to "in the launcher" without a real Power Apps build.

- **Full (V2+):** a real **Model-driven Power App backed by Dataverse** that mirrors the core CRM entities (Contact, Opportunity, Project, Vendor) into Dataverse via the existing Graph + custom connectors. Power Apps is then the native M365 surface; the standalone web app is the "advanced view." This is a months-long migration and explicitly out of MVP scope. *Caveat: Microsoft retired model-driven Power Apps embedded as Teams tabs on May 1, 2026 — that retirement does NOT affect launcher tiles or standalone Power Apps usage, only the Teams-tab-of-a-model-app pattern.*

V1 manifest equivalent for the launcher tile (M365 Admin Center "Add custom tile" form fields):

```text
Tile name:        DesignersMeet
Tile URL:         https://app.designersmeet.com
Description:      Vendor + project CRM
Icon URL:         https://app.designersmeet.com/static/launcher-icon-128.png
```

Reference: [Add custom tiles to the M365 app launcher](https://learn.microsoft.com/en-us/microsoft-365/admin/manage/customize-the-app-launcher) · [Power Apps canvas apps in M365](https://learn.microsoft.com/en-us/power-apps/maker/canvas-apps/embed-canvas-app-in-microsoft-365) · [Power Pages](https://learn.microsoft.com/en-us/power-pages/) · [Dataverse for Power Apps](https://learn.microsoft.com/en-us/power-apps/maker/data-platform/data-platform-intro)

### 8.3 Email module (pluggable, provider-agnostic)

The platform never calls a concrete ESP directly. All email flows through:

```typescript
interface EmailProvider {
  kind: 'msgraph' | 'gmail' | 'imap_smtp' | 'resend' | 'ses' | 'sendgrid' | 'postmark' | 'mailgun'
  trafficClass: 'human_outbound' | 'system_transactional'
  send(draft: EmailDraft): Promise<SendResult>
  listInbox(query: InboxQuery): Promise<Message[]>
  watchInbox(callback: (msg: Message) => void): Subscription
  threadById(messageId: string): Promise<Thread>
  status(): Promise<ProviderHealth>
}
```

Concrete adapters (V1 build order):

1. **MicrosoftGraphEmailProvider** — primary for staff. Scopes: `Mail.ReadWrite`, `Mail.Send`. Webhook subscription on `/me/messages` for inbox push. Lifecycle renew at 4230 minutes (max for mail subscriptions is currently 4230 minutes ≈ 70.5 hours; auto-renew job).
2. **TransactionalEmailProvider — Resend** — system-sent. SPF, DKIM, DMARC configured on `mail.designersmeet.com`. Webhooks for delivered/bounce/open/click events normalized into `MessageEvent`.
3. **GmailEmailProvider** (V1.1) — for Workspace vendors. Gmail API `users.messages.send`, Pub/Sub push for `users.watch`.
4. **ImapSmtpEmailProvider** (V1.1) — for Zoho/Hostinger/Fastmail vendors. IMAP IDLE for inbox watch; SMTP for send. Connection pool with credential rotation; encrypt-at-rest credentials in `EmailProviderConfig.settings_json` via app-level AES.
5. **Fallback transactional** (V2 at scale) — AWS SES sub-adapter.

Routing rules at send time:
- Lookup `EmailProviderConfig` for the actor user where `traffic_class = 'human_outbound'`; if present, use it. Else default to workspace's transactional provider (`system_transactional`).
- System-sent traffic (workflow notifications, form responders, status digests) always uses `system_transactional`.
- Bounce/complaint events surface in Settings → Email providers with per-provider health dashboards.

Domain authentication walkthrough (in Settings → Email providers → Setup):
- Step 1: Verify domain (CNAME record `_resend.designersmeet.com` → ESP-provided value).
- Step 2: DKIM (CNAME records `resend._domainkey.mail.designersmeet.com` → ESP-provided keys).
- Step 3: SPF (TXT record `v=spf1 include:amazonses.com include:_spf.google.com -all`; combined include for whichever providers are wired).
- Step 4: DMARC (TXT `_dmarc.designersmeet.com` → `v=DMARC1; p=quarantine; rua=mailto:dmarc-reports@designersmeet.com; pct=100`; start at `p=quarantine`, monitor 2 weeks, then ramp to `p=reject`).
- Step 5: Inbox-placement check (Mail-tester.com or the ESP's built-in tool).

Sources: [Graph mail subscriptions](https://learn.microsoft.com/en-us/graph/api/resources/webhooks) · [Gmail users.messages](https://developers.google.com/gmail/api/reference/rest/v1/users.messages) · [Gmail push notifications (Pub/Sub)](https://developers.google.com/gmail/api/guides/push) · [Resend docs](https://resend.com/docs) · [Amazon SES domain auth](https://docs.aws.amazon.com/ses/latest/dg/send-email-authentication-spf.html) · [DMARC overview](https://dmarc.org/overview/)

### 8.4 Shopify

Two API surfaces are in scope:
- **Admin GraphQL API** for vendor product listings + order management. Endpoint pattern: `POST https://{store}.myshopify.com/admin/api/2026-04/graphql.json` with header `X-Shopify-Access-Token: {token}`. Used to: list products created by vendors, read orders that route to vendors, manage inventory levels per location.
- **Marketing Activities API** for registering marketing activities (so Shopify's marketing dashboard sees DesignersMeet's social posts and email campaigns reported back). Honest caveat: this is a **report-back** surface, not a "post to FB for you" surface — actual posting still goes through Meta Graph API.

Auth: as of Jan 1, 2026, custom apps can no longer be created in Shopify Admin; create via the Shopify Dev Dashboard. We provision one public OAuth-app per workspace.

Webhooks: orders/create, orders/paid, orders/cancelled, inventory_levels/update. Wire into a Workflow trigger so e.g. "Shopify order from vendor X paid → mark VendorAssignment fee status = invoiced".

Sources: [Shopify Admin GraphQL](https://shopify.dev/docs/api/admin-graphql/latest) · [Marketing Activities](https://shopify.dev/docs/api/marketing-activities) · [Webhooks](https://shopify.dev/docs/apps/build/webhooks)

### 8.5 Meta Graph API (Facebook + Instagram)

In scope: posting + reading insights for Manish's owned Pages.

- Page posts: `POST /{page-id}/feed` with `pages_manage_posts` (depends on `pages_read_engagement`, `pages_show_list`).
- Scheduled posts: `POST /{page-id}/scheduled_posts` or `scheduled_publish_time` parameter on a feed POST.
- Page insights: `GET /{page-id}/insights/{metric}` — **caveat**: a batch of Page Insights metrics is being deprecated June 15, 2026; re-verify each metric we cite before locking it in.
- Instagram (Business/Creator linked to a FB Page): two-step publish — `POST /{ig-user-id}/media` to create a container, then `POST /{ig-user-id}/media_publish`. Permissions: `instagram_business_basic`, `instagram_business_content_publish`.

App Review + Business Verification are required for production use of these scopes — plan multi-week lead time.

LinkedIn, X (Twitter), TikTok are explicitly **out of scope** until paid APIs are budgeted.

Sources: [Pages API](https://developers.facebook.com/docs/pages-api/) · [Scheduled posts](https://developers.facebook.com/docs/graph-api/reference/page/scheduled_posts/) · [Instagram Graph](https://developers.facebook.com/docs/instagram-api/) · [Permissions ref](https://developers.facebook.com/docs/permissions/)

### 8.6 Vendor database (existing DesignersMeet)

The existing CRM at `C:\Users\smani\CompanyWorkspaces\Designersmeet\crm-app` has the canonical vendor pool today. Migration plan:

1. **Inventory:** export current vendor table (CSV).
2. **Map fields** into the new `Contact` (type=vendor) shape; promote `skills[]`, `regions[]`, `rate_card_json` from custom_fields_json to first-class columns when count surpasses ~8 fields used regularly.
3. **One-time migration script** (Node) reads the CSV, idempotent upsert by email. Stored at `/scripts/migrate-vendors.ts`. Run in dry-run mode first; produce a diff report.
4. **Cutover:** new platform becomes write-master; old CRM goes read-only the same day; deprecated within 30 days.

No live API integration with the old CRM — one-shot migration is cleaner than synchronizing two systems that will diverge.

### 8.7 SSO (Google + Microsoft + Apple)

All three at launch via NextAuth v5.

- **Google Identity Services** — `accounts.google.com/gsi/client`. Scope: `openid email profile`.
- **Microsoft Entra ID** — `https://login.microsoftonline.com/{tenant}/oauth2/v2.0/authorize` + `/token`. Multi-tenant (`tenant=common`) for V1. This is the mandatory provider — it's the same OAuth flow that grants the Graph access tokens for the Outlook/Teams/SharePoint integrations.
- **Sign in with Apple** — Services ID + Apple-private-key-signed JWT client secret. JS button via `appleid.auth.signIn()`.

Account linking: a user signing in with both Google and Microsoft against the same email gets one User record with two `Identity` rows. Linking handled by NextAuth's account model.

Sources: [Google Identity Services](https://developers.google.com/identity/gsi/web/guides/overview) · [Entra ID OAuth v2](https://learn.microsoft.com/en-us/entra/identity-platform/v2-oauth2-auth-code-flow) · [Sign in with Apple JS](https://developer.apple.com/documentation/signinwithapplejs) · [Sign in with Apple REST](https://developer.apple.com/documentation/signinwithapplerestapi)

---

## 9. Phased build plan

**Phase 0 — Tonight (May 17, 2026). Status: DONE on completion of this document.**
- Deliverable: this SPEC.md + 20 concept files + mvp-selection.md.
- Success metric: stakeholder approves scope and a Wave 1 start date.

**Wave 1 — Days 1–5. Scaffold + auth + foundation.**
- Scope: Next.js 15 app scaffold; Tailwind v4 + shadcn/ui set up with the theme tokens; Postgres + Prisma schema for Workspace, User, Contact, Tag, ActivityEvent, AuditLog; NextAuth v5 with all three SSO providers; the `EmailProvider` interface + `MicrosoftGraphEmailProvider` stubbed; basic Vendor CRUD + Contact list view; Dashboard with five placeholder widgets; Settings → Email providers screen.
- Deliverable: deployable app, login works, you can create a vendor and a contact, you can send a "hello world" email through Graph as the logged-in user.
- Success metric: Manish logs in via Microsoft SSO, creates 10 vendor records imported from the CSV.

**Wave 2 — Days 6–12. Core CRM.**
- Scope: Pipelines + Opportunities (the Sales pipeline, kanban); Calendars & Booking with two-way Outlook sync; Contacts detail page with all tabs; Conversations Inbox V1 (email channel only; WhatsApp deferred 2 days to wave 2.5); Forms V1 with two seed forms (vendor onboarding, client brief); the opportunity-to-project conversion flow.
- Deliverable: full sales motion works in-platform — booking → contact → opportunity → won.
- Success metric: one real prospect runs end-to-end through the new system without falling back to Excel.

**Wave 3 — Days 13–21. The differentiator + comms.**
- Scope: **Vendor Project Delivery module** — projects, milestones, tasks, deliverables (with SharePoint integration for file storage), vendor assignments, vendor portal. WhatsApp Cloud API integration. Workflows V1 (rule-based linear). Two seed workflows shipping with the install.
- Deliverable: a project goes brief → concept → design → install → handover with vendor coordination happening *inside* the platform; client gets automated status updates via the EmailProvider abstraction.
- Success metric: one real project runs to "Concept signed off" milestone with at least 3 vendors assigned and >5 deliverables uploaded.

**Wave 4 — Days 22–35. M365 distribution + reporting + invoicing surface.**
- Scope: Outlook add-in (Unified Manifest, sideload to org); Teams app (manifest, auto-tab on project channels); M365 launcher custom tile; Reporting & Dashboards (the six fixed views); Invoicing as a read/view surface (display invoices created in Xero/QuickBooks against projects).
- Deliverable: DesignersMeet users find the platform in Outlook, in Teams, and in the M365 launcher. Reports show real numbers from V1's 2 weeks of operational data.
- Success metric: the team stops opening the old CRM URL — they reach for the Outlook add-in or Teams tab instead.

**Wave 5+ — beyond launch.**
- Wave 5 (Months 2–3): Reputation & vendor reviews; payment flows (Stripe Connect + invoice creation); document e-sign; Gmail + IMAP email adapters.
- Wave 6 (Months 3–6): AI features (draft email assist via Azure OpenAI; project chat summarization); Social Planner; Vendor Communities; Vendor Training (Memberships/Courses module); Mobile native iOS/Android.
- Wave 7 (Months 6+): Workflows visual canvas (graph builder); Snapshots for project templates; multi-workspace; integration marketplace UI; Shopify deeper hook for vendor product sales.

---

## 10. Risks & open questions

**Risks (ranked).**
1. **Scope inflation.** GHL has a decade of feature accretion. The MVP cut is aggressive *by design*; protect it. Anything not on the Wave 1–4 list is a no-for-V1 — write it down and revisit.
2. **M365 admin permissions in tenant.** Several Graph scopes (`Group.ReadWrite.All`, `ChannelMessage.Send`, mail subscription webhooks) require tenant admin consent. If the DesignersMeet M365 tenant doesn't have admin sign-off, the Outlook add-in + Teams app distribution gets blocked. **Action:** Confirm admin consent path before Wave 4.
3. **Meta App Review timeline.** Production scopes for FB/IG posting require multi-week App Review + Business Verification. **Action:** Submit App Review on Day 1 of Wave 1 in parallel with engineering build — the calendar wait, not the code, is the blocker.
4. **Email deliverability ramp.** Even with SPF/DKIM/DMARC, a new sending domain (`mail.designersmeet.com`) needs a 4-6 week warm-up before sending bulk-style automations. **Action:** Wave 1 sets up the domain + auth records; bulk-blast workflows ship in Wave 3 not Wave 2.
5. **The Outlook add-in vs Teams app vs Power Apps embed maintenance overhead.** Three surfaces means three manifest update cadences + three QA passes per release. **Action:** Single shared embed route (`/embed`) that all three load; manifests change rarely.
6. **Vendor data migration.** The existing CRM's vendor table may have inconsistent emails (the natural join key). **Action:** Dry-run the migration script and produce a duplicate/orphan report before cutover.
7. **Aider as primary build tool.** The brief mentions Aider for development; Aider is well-suited for iterative editing but less suited for multi-file scaffolds. **Action:** Use `create-next-app` + shadcn CLI for scaffold, then Aider for feature waves.

**Open questions.**
- Workspace model: single-tenant single-workspace at launch (cleanest) — confirmed. But future: do we ever want to license the platform to another design firm? If yes, the multi-tenant primitives need to ship with V1; if no, simpler.
- Vendor portal auth: NextAuth-based SSO for vendors who have Microsoft/Google accounts; magic-link fallback for vendors who don't. Default = magic link to maximize adoption — vendors hate creating yet another account. Confirm.
- WhatsApp number ownership: single shared business number, or per-PM numbers? Single shared is V1; per-PM is V1.1 if it becomes useful.
- File storage default location: SharePoint as primary is the M365-aligned choice, but for vendors not in the M365 tenant, they upload to SharePoint via a sharing link — does this incur licensing cost? Verify with M365 admin.
- Pricing model: this is internal, so no external pricing. But an internal usage budget per workspace (email send caps, WhatsApp message caps, AI token caps) helps surface runaway costs. Decide threshold values.
- Aider session model: one Aider session per Wave, or per module? TBD with engineering practice.
- Power Apps full embed (Dataverse-backed) — actually do it (V2)? Or is the launcher tile + Outlook add-in + Teams app distribution sufficient? Likely sufficient; deeper Power Apps not on roadmap unless Microsoft enterprise sale demands it.

---

## 11. Figma mockup plan

These are the 15 screens to mock before any production code is written. Each screen is a single Figma page with desktop (1440 wide) + mobile (390 wide) frames where mobile differs.

1. **Login & SSO selector** — three buttons (Microsoft / Google / Apple) on an otherwise-empty white card. Brand mark top-center.
2. **Dashboard** — six widget cards (pipeline value, project health, vendor utilization, deliverable cycle time, overdue tasks, this-month bookings) in a 3-column grid. Date-range picker in the top-right.
3. **Contacts list (table view)** — virtual-scroll table with filter bar, saved-filter chips above, bulk action menu. Show both Client and Vendor row variants with their type badge.
4. **Contact detail (Client)** — tabs across the top, Profile tab default. Right rail with quick actions.
5. **Contact detail (Vendor)** — same tab shell, vendor-specific Profile content (skills, regions, certifications, rate card, rating).
6. **Pipelines kanban** — 5-stage Sales pipeline, sample cards with various stages, drag affordance, "convert to project" modal on drop into Won.
7. **Project detail — Overview tab** — heaviest screen. Header strip with status pill, milestone bar, next-actions list, side rail with assigned vendors + key dates.
8. **Project detail — Deliverables tab** — card grid, deliverable card hover state, version-history popover, request-approval flow.
9. **Project detail — Vendors tab** — table of VendorAssignment rows, invite-vendor flyout, scope edit inline.
10. **Calendar (week view + service-menu booking page)** — internal week-view, plus the public branded booking page a client sees.
11. **Conversations Inbox** — three-pane layout, sample thread mixing email + WhatsApp + internal note, channel badges visible, right-rail context.
12. **Forms — schema builder** — left rail of field types, center canvas, right rail field config. Plus the public form preview.
13. **Workflows V1** — rule-based linear builder: trigger picker → filters → ordered action list. No graph canvas in V1 mock.
14. **Reports — single dashboard page** — Pipeline Value as the reference dashboard, Recharts-styled, date-range picker, export-CSV menu.
15. **Settings — Email providers** — list of configured providers (Microsoft Graph primary, Resend transactional), each with status pill + last-error toast slot; "Add provider" flyout with the four adapter types listed (M365 / Gmail / IMAP-SMTP / Transactional).

Optional bonus (do if time allows):
- Outlook add-in task pane (narrow viewport, ~320px wide) — contact lookup + open-in-DesignersMeet CTA.
- Teams app personal tab — Dashboard rendered into Teams chrome to validate the embed contrast.
- Vendor portal — scoped project view, deliverable upload, task list.

---

## Appendix A — Source roll-up

**GHL feature research:**
- [HighLevel Pricing](https://www.gohighlevel.com/pricing)
- [Workflow Advanced Builder](https://help.gohighlevel.com/support/solutions/articles/155000006635-advanced-builder-for-workflows-visual-canvas-for-building-workflows)
- [List of workflow triggers](https://help.gohighlevel.com/support/solutions/articles/155000002292-a-list-of-workflow-triggers)
- [Unified Conversations](https://www.gohighlevel.com/post/unified-conversations)
- [Snapshots overview](https://help.gohighlevel.com/support/solutions/articles/48000982511-snapshots-overview)
- [AI features](https://www.gohighlevel.com/ai)
- [WhatsApp full setup](https://help.gohighlevel.com/support/solutions/articles/48001206216-whatsapp-full-setup-guide-for-agency)
- [Documents & Contracts](https://help.gohighlevel.com/support/solutions/articles/155000000594-how-to-use-documents-contracts-)
- All other GHL citations in the per-concept files in `/concepts/`.

**Microsoft / M365:**
- [Microsoft Graph permissions reference](https://learn.microsoft.com/en-us/graph/permissions-reference)
- [Outlook Mail overview](https://learn.microsoft.com/en-us/graph/outlook-mail-concept-overview)
- [Outlook Calendar overview](https://learn.microsoft.com/en-us/graph/outlook-calendar-concept-overview)
- [Graph webhooks](https://learn.microsoft.com/en-us/graph/webhooks)
- [Teams manifest schema](https://learn.microsoft.com/en-us/microsoftteams/platform/resources/schema/manifest-schema)
- [Outlook add-in unified manifest](https://learn.microsoft.com/en-us/office/dev/add-ins/develop/unified-manifest-overview)
- [Power Automate HTTP trigger](https://learn.microsoft.com/en-us/connectors/custom-connectors/create-webhook-trigger)
- [Entra ID OAuth v2](https://learn.microsoft.com/en-us/entra/identity-platform/v2-oauth2-auth-code-flow)
- [Custom M365 launcher tiles](https://learn.microsoft.com/en-us/microsoft-365/admin/manage/customize-the-app-launcher)

**Shopify:**
- [Admin GraphQL](https://shopify.dev/docs/api/admin-graphql/latest)
- [Marketing Activities](https://shopify.dev/docs/api/marketing-activities)
- [Webhooks](https://shopify.dev/docs/apps/build/webhooks)

**Meta:**
- [Pages API](https://developers.facebook.com/docs/pages-api/)
- [Instagram Graph API](https://developers.facebook.com/docs/instagram-api/)
- [Permissions reference](https://developers.facebook.com/docs/permissions/)

**Email providers:**
- [Gmail API users.messages](https://developers.google.com/gmail/api/reference/rest/v1/users.messages)
- [Gmail Pub/Sub push](https://developers.google.com/gmail/api/guides/push)
- [Resend docs](https://resend.com/docs)
- [Amazon SES domain auth](https://docs.aws.amazon.com/ses/latest/dg/send-email-authentication-spf.html)
- [DMARC overview](https://dmarc.org/overview/)

**SSO:**
- [Google Identity Services](https://developers.google.com/identity/gsi/web/guides/overview)
- [Sign in with Apple JS](https://developer.apple.com/documentation/signinwithapplejs)
- [Sign in with Apple REST](https://developer.apple.com/documentation/signinwithapplerestapi)

---

*End of SPEC v0.1.*
