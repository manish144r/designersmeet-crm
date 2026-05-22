# DesignersMeet CRM — Full Architecture

**Author:** Design Architect Agent (`claude-opus-4-7`)
**Date:** 2026-05-22
**Mode:** Read-only analysis. No code changes.
**Scope:** Current state, required MVP, target database, deployment, enterprise security, RBAC, and Phase-2 roadmap.

---

## 0. Executive Summary

DesignersMeet CRM is a TypeScript monorepo (`@dm/shared`, `@dm/backend`, `@dm/frontend`) built around a swappable repository pattern (memory / SQL Server / Dataverse) and a swappable queue (memory / Azure Service Bus / Supabase). Two parallel domains coexist inside it:

1. **Legacy DM arbitrage** (orders → freelancers, Shopify webhook, social posting). Routes exist under `packages/backend/src/routes/*.ts` but **are not mounted** by `packages/backend/src/crm/app.ts`. Effectively dead code on the deployed server, though the schemas, queue workers, and repository implementations are real.
2. **New 19-resource CRM surface** (contacts, vendors, projects, conversations, calendar, workflows, forms, settings/identity). Mounted via `crmRouter` (generic CRUD), `waveBRouter` (overrides for identity surface), and `domainRouter` (non-CRUD verbs: kanban-move, slot-book, thread-merge, form-submit).

The frontend is in transition between two architectures: an older `App.tsx` shell that imports pages that no longer exist (build will fail) and a Wave-1 numbered-mockup surface (`pages/01-signin.tsx` … `pages/16-spec-sheet.tsx` + `pages/vendor-portal.tsx`) that lives behind `DEMO_MODE`. In demo mode the entire app runs against a mutable in-browser `demoStore` and never touches the backend.

**Highest-impact gaps for MVP:**

- `App.tsx` imports 8 page modules that do not exist. The current production routes do not match the page files. Either replace `App.tsx` with a router over the 01-16 numbered pages and `vendor-portal.tsx`, or revert to the broader page set and rebuild the missing pages.
- `usePermission` violates React Rules of Hooks (calls `useList` after conditional early returns). Will produce inconsistent behaviour for any non-admin role.
- Role taxonomy is split: backend allows `admin | designer | client`, frontend AuthProvider declares `admin | pm | designer | vendor | viewer`, brief-24 specifies a fifth taxonomy. Single canonical roster is required.
- `CORS_ORIGIN=*` in `vercel.json` with `credentials: true` in `cors()` middleware is a hard security defect (browsers reject this combination, and the wildcard would be unsafe even if accepted).
- No backend audit trail. No `created_by`/`updated_by` on any schema. No row-level scoping. RBAC is enforced only client-side via the broken hook.
- Demo mode is the only path actually in use — `DEMO_MODE=true` short-circuits every CRUD hook, so backend correctness has no UI consumer today.

The recommendations below assume MVP launch means: real Entra SSO for staff, magic-link auth for external vendors and clients, server-enforced RBAC, full audit trail, persistent backing store (SQL Server first → Dataverse later), and Vercel-fronted Azure backend.

---

## 1. Current State Assessment

### 1.1 Repository layout

```
crm-app/
├── packages/
│   ├── shared/        @dm/shared — Zod schemas + constants (single source of truth)
│   ├── backend/       @dm/backend — Express 4, TS ESM, port 4000
│   └── frontend/      @dm/frontend — Vite 5 + React 18 + Tailwind, port 5173
├── api/server.mjs     Vercel serverless entry (re-exports the Express app)
├── vercel.json        Vercel deployment manifest
├── render.yaml        Render full-stack deployment alt
├── docker-compose.yml Local dev stack
└── brief/             Design lock + Aider briefs + mockups + tokens
```

`package.json` declares Node ≥ 20, three workspaces, and the standard `dev / build / typecheck / lint / seed / test / start` scripts. No `prepare`/`postinstall` hooks. `concurrently` runs backend + frontend together in dev.

### 1.2 Backend — Express app (`packages/backend/src/crm/app.ts`)

Middleware order:
1. `helmet({ contentSecurityPolicy: { … } })` with explicit CSP directives (defaultSrc 'self'; scriptSrc adds 'unsafe-inline'; styleSrc adds 'unsafe-inline' + `https://rsms.me`; imgSrc adds `data:`, `https:`).
2. `cors({ origin: allowlist | "*", credentials: true })` driven by `CORS_ORIGIN` env. **Gap:** `vercel.json` ships `CORS_ORIGIN=*` AND `credentials: true` is hardcoded; browsers refuse this combination.
3. `morgan("dev")` (verbose ANSI logs — fine in dev, noisy in prod).
4. `express.json({ limit: "2mb" })`.
5. Request counter middleware feeding `/metrics`.

Routes mounted:
- `GET /health`, `GET /healthz`, `GET /readyz`, `GET /metrics` (Prometheus plaintext) — unauthenticated.
- `app.use("/api", authMiddleware)` — every `/api/*` is gated.
- `app.use("/api", domainRouter())` — non-CRUD verbs.
- `app.use("/api", waveBRouter())` — Wave-B overrides (mount before generic CRUD).
- `app.use("/api", crmRouter())` — generic CRUD factory over 19 RESOURCES.
- `GET /api/integrations` — list configured integrations.
- `GET /api/integrations/meta/insights` — Meta Page Insights pass-through (501 if unconfigured).
- `errorHandler` last.
- Production-only static serve of `packages/frontend/dist` + SPA fallback to `index.html`.

**Routes mounted vs route files written:** `packages/backend/src/routes/{orders,freelancers,services,shopifyMappings,shopifyWebhook,queue,social}.ts` exist with `requireRole`-guarded handlers, but **none are mounted in `app.ts`**. The Shopify webhook in particular needs the `raw` body parser to run **before** `express.json()` — currently impossible because the router is never wired. This is a critical gap if Shopify ingestion is a launch requirement.

### 1.3 Backend — `/api` resources actually live

Generic CRUD (`crmRouter`) auto-generates 5 verbs per resource using the Zod schema in `crm/types.ts`. RESOURCES (19): `vendors, clients, contacts, pipelines, pipeline-stages, projects, project-stages, conversations, messages, calendar-events, workflows, workflow-runs, forms, form-submissions, api-keys, sessions, sso-providers, email-providers, webhook-subscriptions`.

Per resource: `GET /api/<r>`, `GET /api/<r>/:id`, `POST /api/<r>`, `PUT|PATCH /api/<r>/:id`, `DELETE /api/<r>/:id`. List supports `?page=&pageSize=&sort=&order=&<field>=value` (substring filter on any column; max pageSize 200).

Wave-B overrides (`waveBRouter`):
- `POST /api/api-keys` — mints `dm_<scope>_<24hex>`, hashes with sha256, returns `plaintext_once`, redacts `hashed_key` everywhere.
- `GET /api/api-keys` — strips hash from every row.
- `DELETE /api/api-keys/:id` — soft-delete (sets `revoked_at`, returns 204).
- `GET /api/sessions` — filters revoked + expired unless `?include_revoked=true`.
- `DELETE /api/sessions/:id` — soft-revoke (sets `revoked_at`).
- `POST /api/email-providers/:id/test` — simulated send (no real provider call yet); requires `to`; returns provider feedback.
- `GET /api/email-providers` — strips `config_json.api_key` from every row.
- `POST /api/webhook-subscriptions` — generates `whsec_<48hex>` signing secret, returns it once.
- `GET /api/webhook-subscriptions` — masks signing secret as `***`.
- `GET /api/sso/:type/callback` — stub returning 501 with the env vars needed for real wiring (entra / google / apple).

Domain verbs (`domainRouter`):
- `POST /api/domain/projects/:id/stage { status }` — kanban stage move.
- `POST /api/domain/calendar/book { title, contact_id?, start_at, end_at, type? }` — refuses overlap with 409 SLOT_TAKEN.
- `POST /api/domain/conversations/merge { sourceId, targetId }` — re-parents all messages, deletes source thread.
- `POST /api/domain/forms/:slug/submit { payload, contact? }` — public submission; can upsert contact lead.

**What is wired vs decorative (backend):**
- All 19 resources: full CRUD wired in-memory; auto-create timestamp; partial PATCH; UUID PK.
- Wave-B overrides: wired with sha256/HMAC patterns.
- Domain verbs: wired.
- Legacy DM routes (`orders, freelancers, services, social, queue, shopifyMappings, shopifyWebhook`): **not wired into `app.ts`**. Their repositories (memory/dataverse/sqlserver) exist; their queue workers exist (`workers/*`); but no Express server actually exposes them.
- `requireRole` middleware exists but is only used inside the unmounted legacy routes. No route in the currently-served CRM surface enforces roles server-side.

### 1.4 Backend — data layer

Three implementations behind `Repositories` interface (`packages/backend/src/repositories/interfaces.ts`):
- **memory** — `Collection<T>` with filter+sort+paginate. Seeded on boot (`seedInMemory()` + `seedComprehensive()`). Default.
- **sqlserver** — Knex against MSSQL. Schema bootstrapped lazily in `ensureSchema()` for 7 tables (`freelancers, services, freelancer_services, orders, shopify_mappings, social_accounts, order_queue`). **Does not include any of the 19 CRM resources** — only the legacy DM tables.
- **dataverse** — `ClientSecretCredential` + Web API `v9.2` against `${DATAVERSE_URL}`. Token-cached singletons.

**Gap:** the new CRM surface (19 resources) only has in-memory persistence. The two cloud providers cover only the legacy DM tables. Any production data persistence for contacts, vendors, projects, conversations, etc. requires building SQL Server + Dataverse implementations from scratch.

The in-memory `Collection` stores rows in a single `Map<string, T>` per resource; mutation/read are O(n) on filter. No indexing. No tenancy. No soft-delete (except `api-keys` and `sessions` via Wave-B).

### 1.5 Backend — queue layer

`IQueueService` with three impls:
- **InMemoryQueueService** — per-queue array, 250 ms tick, exponential backoff (0.5/1/2s), MAX_RETRIES=3, then DLQ status. Reads/writes through `IQueueLogRepository` for dashboard visibility.
- **AzureServiceBusQueueService** — real SDK (`@azure/service-bus`).
- **SupabaseQueueService** — table-polling against Supabase.

Container guard: if `QUEUE_PROVIDER=memory` in production, auto-upgrades to Supabase when both `SUPABASE_URL`/`ANON_KEY` are set; otherwise logs a loud warning. Production safety in `config.ts` aborts startup if `QUEUE_PROVIDER=memory` and neither Supabase nor Service Bus is configured (unless `DEMO_BYPASS=true`).

Queue names (`@dm/shared` constants): `orders.assignment`, `orders.notification`, `shopify.sync`, `social.post`. **None of these are subscribed today** because the workers in `packages/backend/src/workers/` are not started by `server.ts` — only the Express app boots. The queue dashboard will show `enqueue` calls (if reachable) but messages will sit in `pending` forever.

### 1.6 Backend — auth (`auth/authMiddleware.ts`)

Two modes via `AUTH_MODE`:
- **dev** — injects stubbed `req.user = { sub:"demo-user", email: DEMO_BYPASS_EMAIL, name:"Demo Vendor Admin", roles:["admin"] }`. Blocked in production unless `DEMO_BYPASS=true`.
- **entra** — validates Bearer JWT via `jose.createRemoteJWKSet` against `https://login.microsoftonline.com/${ENTRA_TENANT_ID}/discovery/v2.0/keys`; audience = `ENTRA_AUDIENCE ?? ENTRA_CLIENT_ID`; issuer = `https://login.microsoftonline.com/${ENTRA_TENANT_ID}/v2.0`. Roles drawn from `payload.roles[]` (Azure App Registration app roles); defaults to `["admin"]` if missing — **a permissive fallback that defeats RBAC** the first time a real account signs in without app-role assignments.

`AppRole` declared as `"admin" | "designer" | "client"` in the backend — does **not** match the brief's RBAC roster (`admin, pm, designer, vendor, viewer`) or the frontend's `AuthProvider` roster (same as brief). `requireRole("admin","designer")` is used on the unmounted legacy routes; nothing on the currently-served routes enforces roles.

### 1.7 Frontend — composition root (`packages/frontend/src/main.tsx`)

Boot tree:
```
<ErrorBoundary>
  <QueryClientProvider>            // staleTime: 30s, refetchOnWindowFocus: false
    <AuthProvider>                 // MSAL or demo
      <NavGuard>                   // pass-through at root
        <BrowserRouter>
          <HeaderDropdowns />      // global capture-phase click handlers
          <DemoInteractionLayer /> // generic onClick→toast/nav fallback
          <SidebarCollapseLayer />
          <CrmModals />            // global modal host
          <App />                  // routing
```

`AuthProvider` mode:
- Demo mode whenever `VITE_MSAL_CLIENT_ID` is unset → instant `DEMO_USER = { sub:"admin-user", email:"admin@designersmeet.com", name:"Manish Sharma", roles:["admin"] }`.
- Real mode → MSAL `PublicClientApplication`, `loginPopup` (fallback `loginRedirect` on popup-blocked), `acquireTokenSilent` → returns `idToken` to the API client (intentionally not the access token).

`DEMO_MODE` in `lib/demoData.ts` is true whenever `VITE_DEMO_MODE` is "true" OR `VITE_AUTH_MODE` is "dev". Default branch evaluates to true. When true, **every `useList/useItem/useCreate/useUpdate/useRemove` in `hooks/useResource.ts` bypasses the API entirely** and operates on `lib/demoStore.ts`, an in-browser mutable store seeded from `demoFixtures.ts`, with localStorage persistence for workspace/view/locale. `demoStore` also drives an audit-event interceptor (100-row cap on `audit_events`) and a `subscribe()` pub/sub for live UI.

### 1.8 Frontend — routing (`packages/frontend/src/App.tsx`)

Imports: `Dashboard, Clients, Projects, Orders, Freelancers, Services, ShopifyMappings, Queue, Social, Settings, Workflows, Reporting`. Renders an old top-tab nav.

Reality on disk in `packages/frontend/src/pages/`:
- Present (named export): `Projects.tsx`, `Reporting.tsx`, `Settings.tsx`, `Workflows.tsx`.
- Present (default export, name does not match import): `01-signin.tsx → DesignersMeetSignIn`, `03-dashboard.tsx → Dashboard`, `04-contacts.tsx → Contacts`, `06-vendors.tsx → Vendors`, `07-vendor-detail.tsx`, `08-projects-board.tsx`, `09-project-detail.tsx`, `10-pipelines.tsx`, `11-calendar.tsx`, `12-conversations.tsx`, `13-workflows.tsx`, `14-forms.tsx`, `15-settings.tsx`, `16-spec-sheet.tsx`, `vendor-portal.tsx`.
- **Missing entirely:** `Dashboard.tsx`, `Clients.tsx`, `Orders.tsx`, `Freelancers.tsx`, `Services.tsx`, `ShopifyMappings.tsx`, `Queue.tsx`, `Social.tsx`.

This is the single biggest visible defect — the app cannot build cleanly against `App.tsx` as written. Either it's being patched at the route layer by some upstream mechanism (Aider mid-migration), or the build is currently broken. Treat as P0.

The 16-page mockup surface defines the actual UI the user sees in screenshots — `AppShell.tsx` provides the canonical sidebar + topbar, with `NAV_ROUTES = { Dashboard, Contacts, Vendors, Pipelines, Projects, Calendar, Conversations, Forms, Workflows, Reports→/pipelines, Settings }` and `SURFACE_URLS = { Outlook add-in, Teams app, M365 launcher }`. The vendor portal at `/vendor` is a separate experience (it never reaches the admin sidebar) and is not currently routed either.

### 1.9 Frontend — wiring status (every interactive element, by page)

**Generic infrastructure (mounted globally, works):**
- `CrmModals` global host: handles create/edit/confirm-delete for resources in REGISTRY (`contacts, vendors, clients, projects, conversations, calendar-events, workflows, forms`). Other resources will render a fallback single-field form.
- `useUIStore`: `openCreate(resource)`, `openEdit(resource,id)`, `openConfirmDelete(resource,id)`, `closeModal()`, `filters/selection` keyed by resource, `sidebarCollapsed` persisted to `localStorage.dm.sidebarCollapsed`.
- `useResource` generic hooks against `demoStore` (default) or `/api/<r>` (when DEMO_MODE off).
- `DemoInteractionLayer` + `SidebarCollapseLayer` + `HeaderDropdowns`: capture-phase click handlers that fire generic toast/nav fallbacks so no click feels dead. `HeaderDropdowns` mounts first because it `stopPropagation()`s on workspace tile + view toggle.
- `usePermission(page, action)`: **broken** — calls `useList` after early returns, breaking React Rules of Hooks. Admin always returns true (short-circuit before the violation), so the demo with `roles:["admin"]` masks the bug. First non-admin sign-in will fail.

**Per page (16 numbered + vendor portal):**

| # | Page                       | Status snapshot |
|---|----------------------------|-----------------|
| 01 | `signin.tsx`               | Sign-in shell. Auth handled by `AuthProvider`; sign-in screen mostly visual. |
| 02 | `onboarding.tsx`           | Static screens; wiring decorative. |
| 03 | `dashboard.tsx`            | Live stats wired via `useList` (BRIEF-09); recent activity from conversations. |
| 04 | `contacts.tsx`             | Wired: list, search (`name=q`), saved filters, create/edit modal via `openCreate/openEdit`, row delete via `openConfirmDelete`, pagination. |
| 05 | `contact-detail.tsx`       | Tabs partially wired (BRIEF-15). Profile pane reads live; other tabs partial. |
| 06 | `vendors.tsx`              | Wired CRUD (BRIEF-03). Search + filter chips. |
| 07 | `vendor-detail.tsx`        | Tabs partially wired (BRIEF-16). |
| 08 | `projects-board.tsx`       | Kanban with `useMoveProjectStage`; filter badges (BRIEF-22). |
| 09 | `project-detail.tsx`       | 6 tabs partially wired (BRIEF-17). Stage checkboxes drive `useUpdate('project-stages')`. |
| 10 | `pipelines.tsx`            | Pipeline-deal cards (BRIEF-10) — deal resource is **missing in the canonical `RESOURCES` enum**, only exists in `demoStore` seed. Backend cannot persist them. |
| 11 | `calendar.tsx`             | Day selection + event create via `useCreate('calendar-events')`, type filter chips (BRIEF-22). |
| 12 | `conversations.tsx`        | Filter badges (BRIEF-18), folder tree (BRIEF-20), reply via local `replyBody` state. |
| 13 | `workflows.tsx`            | Run/toggle/create wired (BRIEF-06). |
| 14 | `forms.tsx`                | Hidden per directive — not in sidebar. |
| 15 | `settings.tsx`             | Wave-A wired: Audit log live tail, Workspaces CRUD + switcher, Locale & time, Teams, Plan & usage, Invoices (jsPDF download), Vendor portal admin. Wave-B Phase-2: API keys, sessions, SSO, email providers, webhooks render "Coming in Phase 2" unless backend is reached. |
| 16 | `spec-sheet.tsx`           | Static print template. |
| —  | `vendor-portal.tsx`        | Read-only vendor scope (vn1 in seed). Local profile/banking/timesheet/invoice forms; demoStore subscribe. **Not routed in `App.tsx`.** |

### 1.10 Decorative-vs-wired matrix (high-level)

Wired today (demo path only): contact/vendor/project/conversation/calendar/workflow CRUD, dashboard counts, settings audit/workspaces/locale/teams/plan/invoices/vendor-portal, sidebar collapse, sort/search/filter on contacts+vendors+settings tables, kanban stage move, slot booking.

Still decorative or stub: pipeline-deal CRUD (no backend resource), file uploads everywhere (Phase 2 placeholder), real M365 / Shopify / Stripe OAuth, SSO callback (501 by design), email-provider real send, webhook delivery, role-permissions editor (Settings → Role permissions), invite-users (Settings → Team).

### 1.11 Security gaps observed

- `CORS_ORIGIN=*` with `credentials: true`. Browser-rejected combination, plus wildcard is unsafe.
- CSP allows `'unsafe-inline'` for both `script-src` and `style-src`. Vite hydration snippet does need a small inline script — switch to a hash or nonce in prod.
- Helmet's HSTS, COOP/COEP, Referrer-Policy, X-Frame-Options use library defaults — fine, but not explicitly configured against the required threat model.
- `Bearer` tokens accepted with no audit log of which user did what; no per-request `request_id` propagated to logs (Morgan provides line-level logs only).
- Shopify webhook (when mounted) verifies HMAC with `timingSafeEqual` — correct. Falls back to "accept everything" when `SHOPIFY_WEBHOOK_SECRET` is unset — fine for dev, dangerous if the route gets mounted in prod without setting the secret.
- `errorHandler` strips internal details in production (good). ZodError → 400 with full `issues` — fine.
- `usePermission` bug means RBAC is effectively off for non-admin demo users.
- `DEMO_BYPASS=true` lets dev auth run in production. Useful for surge previews, dangerous if accidentally left on for the real launch.
- No API rate limiting middleware. No login throttling.
- No secret-rotation policy or KMS-backed storage; `SQLSERVER_PASSWORD`, `ENTRA_CLIENT_SECRET`, `AZURE_CLIENT_SECRET`, `SHOPIFY_*`, Supabase keys all read from `process.env` (Vercel env vars in practice).
- Plaintext API keys and signing secrets returned once — good — but no rotation endpoint, no revocation audit.

---

## 2. Required State (MVP for Launch)

The MVP exposes three audiences:
- **Staff** (Manish + future admins/managers/operators) — internal CRM, signs in via Entra (M365 SSO). Full sidebar.
- **Vendors / freelancers** — external. Sign in via email magic-link. Only `/vendor` portal.
- **Clients** — external. Sign in via email magic-link. Only `/client` portal (new, not yet built).

### 2.1 Canonical data model (MVP)

Five role values, single roster across backend and frontend. Resources promoted to first-class (each gets full CRUD + persistence + RBAC):

| Resource | PK | Owner | Audit | Notes |
|---|---|---|---|---|
| `users` | `user_id` UUID | self | yes | Internal users. SSO sub stored as `external_sub`. |
| `vendors` | `vendor_id` UUID | staff | yes | External freelancer. Has `auth_email` for magic-link. |
| `clients` | `client_id` UUID | staff | yes | External client. Has `auth_email` for magic-link. |
| `contacts` | `contact_id` UUID | owner_user_id | yes | Lead/contact (may be promoted to client). |
| `projects` | `project_id` UUID | manager_user_id | yes | Status enum brief→…→closed. Has `client_id`. |
| `project_stages` | `stage_id` UUID | project | yes | FK to projects. |
| `pipelines` | `pipeline_id` UUID | staff | yes | |
| `pipeline_stages` | `stage_id` UUID | pipeline | yes | |
| `pipeline_deals` | `deal_id` UUID | owner_user_id | yes | **NEW** — promote from demoStore-only to backend. |
| `conversations` | `conversation_id` UUID | assigned_user_id | yes | |
| `messages` | `message_id` UUID | conversation | yes | |
| `calendar_events` | `event_id` UUID | owner_user_id | yes | |
| `workflows` | `workflow_id` UUID | staff | yes | |
| `workflow_runs` | `run_id` UUID | workflow | yes | |
| `forms` | `form_id` UUID | staff | yes | Has `public_slug` (no auth). |
| `form_submissions` | `submission_id` UUID | form | yes | Public ingest. |
| `orders` | `order_id` UUID | staff | yes | Wire from Shopify. |
| `services` | `service_id` UUID | staff | yes | |
| `freelancer_services` | composite (vendor_id, service_id) | vendor | yes | |
| `shopify_mappings` | `mapping_id` UUID | staff | yes | |
| `order_queue_log` | `queue_id` UUID | system | n/a | Queue dashboard. |
| `api_keys` | `key_id` UUID | created_by | yes | Already wired. |
| `sessions` | `session_id` UUID | user_id | yes | Already wired. |
| `sso_providers` | `provider_id` UUID | staff | yes | Already wired. |
| `email_providers` | `provider_id` UUID | staff | yes | Already wired. |
| `webhook_subscriptions` | `subscription_id` UUID | staff | yes | Already wired. |
| `role_permissions` | `permission_id` UUID | staff | yes | **NEW** — drives RBAC. |
| `audit_events` | `event_id` UUID | actor | n/a | **NEW server-side** (frontend has a demo-only mirror). |
| `magic_link_tokens` | `token_id` UUID | email | n/a | **NEW** for vendor/client passwordless auth. |
| `invites` | `invite_id` UUID | created_by | yes | **NEW** — Settings → Team → Invite. |

Every audited table also carries: `created_at, updated_at, created_by, updated_by, deleted_at` (soft delete). PKs are UUIDv4 generated server-side. `tenant_id` column reserved on every table (single tenant at MVP, but populated to `'default'` so the row-level-security policy is forward-compatible).

### 2.2 API contract (every route, MVP)

Conventions:
- Base path `/api`.
- All non-public routes require auth.
- Success envelope `{ data, meta? }`. Error envelope `{ error, code, details }` (current `errorHandler` shape — keep).
- List endpoints accept `?page=&pageSize=&sort=&order=&q=&<field>=value` and return `{ data: T[], meta: { total, page, pageSize } }`.
- HTTP status: 200 ok, 201 created, 202 accepted (queued), 204 no content, 400 validation, 401 unauthenticated, 403 forbidden, 404 not found, 409 conflict, 422 business-rule violation, 429 rate-limited, 501 not implemented, 500 internal.

Auth flows:

| Method | Path | Auth | Body | Success | Errors |
|---|---|---|---|---|---|
| POST | `/api/auth/staff/login` | none | n/a (redirects to Entra) | 302 to Entra | 503 if Entra down |
| GET | `/api/auth/staff/callback` | none | OAuth params | 302 to `/dashboard` + sets HttpOnly session cookie | 401 invalid state, 403 unknown user |
| POST | `/api/auth/magic-link/request` | none | `{ email, audience: "vendor"\|"client" }` | 202 (always — anti-enumeration) | 400 invalid email, 429 throttled |
| GET | `/api/auth/magic-link/consume` | none | `?token=...` | 302 to portal + sets cookie | 401 invalid/expired/used |
| POST | `/api/auth/logout` | session | n/a | 204 | — |
| GET | `/api/me` | session | n/a | `{ id, email, name, roles, audience }` | 401 |

Generic resource CRUD (kept from current architecture, but now RBAC-enforced on every verb):

| Method | Path | Required permission | Body / response |
|---|---|---|---|
| GET | `/api/<r>` | `view` on `<r>` | `{ data: T[], meta }` |
| GET | `/api/<r>/:id` | `view` on `<r>` + row scope | `{ data: T }` or 404 |
| POST | `/api/<r>` | `create` on `<r>` | Zod-parse body → `{ data: T }` 201 |
| PATCH | `/api/<r>/:id` | `edit` on `<r>` + row scope | partial body → `{ data: T }` |
| DELETE | `/api/<r>/:id` | `delete` on `<r>` + row scope | 204; sets `deleted_at` (soft delete) |

Row scope rules: vendors see only rows where `vendor_id == req.user.vendor_id`; clients only where `client_id == req.user.client_id`; staff see everything within tenant.

Special routes already present, kept and hardened:

| Method | Path | Required | Behaviour |
|---|---|---|---|
| POST | `/api/api-keys` | `create:api-keys` (admin only) | Returns `plaintext_once`. |
| DELETE | `/api/api-keys/:id` | `delete:api-keys` | Sets `revoked_at`. |
| GET | `/api/sessions` | `view:sessions` (self or admin) | Filters revoked/expired by default. |
| DELETE | `/api/sessions/:id` | `delete:sessions` (self or admin) | Sets `revoked_at`. |
| POST | `/api/email-providers/:id/test` | `edit:email-providers` | Test send. |
| POST | `/api/webhook-subscriptions` | `create` | Returns `signing_secret_once`. |
| GET | `/api/sso/:type/callback` | none | OAuth callback. |
| POST | `/api/domain/projects/:id/stage` | `edit:projects` | Kanban move. |
| POST | `/api/domain/calendar/book` | `create:calendar-events` | 409 SLOT_TAKEN on overlap. |
| POST | `/api/domain/conversations/merge` | `edit:conversations` | Re-parent + delete source. |
| POST | `/api/domain/forms/:slug/submit` | none (public) | Public ingest. |

New MVP routes (must be added before launch):

| Method | Path | Required | Body | Success | Errors |
|---|---|---|---|---|---|
| POST | `/api/invites` | `create:invites` | `{ email, role, audience }` | 201 `Invite` | 400 bad email, 409 already-invited (pending) |
| GET | `/api/invites` | `view:invites` | — | `{ data: Invite[] }` | — |
| POST | `/api/invites/:id/resend` | `edit:invites` | — | 202 | 404, 409 already-accepted |
| DELETE | `/api/invites/:id` | `delete:invites` | — | 204 | 404 |
| POST | `/api/role-permissions/bulk` | `edit:role-permissions` (admin only) | `{ role, permissions: [{page, canView,…}] }` | 200 | 403 (non-admin attempting to escalate) |
| POST | `/api/shopify/webhook/orders/create` | HMAC | raw body | 202 + queue id | 401 invalid HMAC |
| POST | `/api/shopify/webhook/orders/updated` | HMAC | raw body | 202 | 401 |
| GET | `/api/audit-events` | `view:audit-events` (admin) | filters | paginated | — |

`/api/orders`, `/api/freelancers`, `/api/services`, `/api/shopify-mappings`, `/api/social/*`, `/api/queue/*` — **mount the existing routers in `app.ts`** with `requireRole` middleware. They are written, they just aren't wired in.

### 2.3 Frontend interaction spec (every page, MVP)

Replace `App.tsx` with a router over the 16 numbered pages + the two portals. Each `Route` is wrapped in `<PageGuard page="<name>">`.

Staff sidebar (driven from `AppShell.workspaceNavItems`):

| Route | Page file | Element | Trigger | Validation | API | Success | Error |
|---|---|---|---|---|---|---|---|
| `/dashboard` | `03-dashboard.tsx` | KPI cards | mount | — | `GET /api/contacts?pageSize=1`, `GET /api/vendors?pageSize=1`, `GET /api/projects?pageSize=1` (use `meta.total`) | Render counts | Show skeleton on loading; "—" on error |
| `/contacts` | `04-contacts.tsx` | "+ New Contact" | onClick | `usePermission("contacts","create")` | `openCreate("contacts")` → `POST /api/contacts` via modal | Toast "Contact created"; list refetches | Toast "Failed to create contact" |
| `/contacts` | `04-contacts.tsx` | Row edit | onClick row pencil | `usePermission("contacts","edit")` + row owner | `openEdit("contacts", id)` → `PATCH /api/contacts/:id` | Toast "Contact updated" | Toast "Failed to update" |
| `/contacts` | `04-contacts.tsx` | Row delete | onClick row trash | `usePermission("contacts","delete")` | `openConfirmDelete` → `DELETE /api/contacts/:id` | Row removed | Toast on 403/500 |
| `/contacts` | `04-contacts.tsx` | Search box | onChange (debounced 250 ms) | — | `GET /api/contacts?q=...` | Refetched list | — |
| `/contacts` | `04-contacts.tsx` | Saved filter chip | onClick | — | `GET /api/contacts?type=client\|vendor\|lead` | List filtered, chip `data-active` | — |
| `/contacts` | `04-contacts.tsx` | Column header sort chevron | onClick | — | `GET /api/contacts?sort=name&order=asc\|desc` | List reordered | — |
| `/contacts/:id` | `05-contact-detail.tsx` | Tabs (profile, timeline, conversations, opportunities, projects, files, custom-fields) | onClick tab | — | per tab: `GET /api/conversations?contact_id=`, `GET /api/pipeline-deals?contact_name=`, etc. | Panel switches | — |
| `/vendors` | `06-vendors.tsx` | Same shape as contacts | — | — | `/api/vendors` | — | — |
| `/vendors/:id` | `07-vendor-detail.tsx` | 7 tabs as BRIEF-16 | — | — | `/api/projects?vendor_id=`, `/api/project-stages?assigned_vendor_id=`, `/api/conversations?vendor_id=`, … | — | — |
| `/pipelines` | `10-pipelines.tsx` | Each stage column "+ Add Card" | onClick | `create:pipeline-deals` | `POST /api/pipeline-deals { pipeline_stage_id, contact_name, value, currency, note }` | New card appears | Toast |
| `/pipelines` | `10-pipelines.tsx` | Drag deal to column | onDragEnd | `edit:pipeline-deals` | `PATCH /api/pipeline-deals/:id { pipeline_stage_id }` | Card moves | Snap-back + toast |
| `/projects` | `08-projects-board.tsx` | Kanban drag | onDragEnd | `edit:projects` | `POST /api/domain/projects/:id/stage` | Card moves | Snap-back |
| `/projects` | `08-projects-board.tsx` | "+ New Project" | onClick | `create:projects` | `openCreate("projects")` | New card | Toast |
| `/projects` | `08-projects-board.tsx` | Filter badges (All/High priority/Overdue/My/Blocked) | onClick | — | Client-side filter on already-fetched rows | Visual filter | — |
| `/projects/:id` | `09-project-detail.tsx` | 6 tabs (overview, tasks, deliverables, vendors, files, activity) | onClick | — | per tab | — | — |
| `/projects/:id` | `09-project-detail.tsx` | Stage checkbox | onChange | `edit:project-stages` | `PATCH /api/project-stages/:id { status }` | Checkbox flips; progress bar updates | Revert + toast |
| `/calendar` | `11-calendar.tsx` | Day cell click | onClick | — | local state; `GET /api/calendar-events?start_at>=day&start_at<day+1` | Right panel shows events | — |
| `/calendar` | `11-calendar.tsx` | "+ New Event" | onClick | `create:calendar-events` | `POST /api/domain/calendar/book` | Toast; refetch | 409 SLOT_TAKEN shows "That slot is already booked" |
| `/calendar` | `11-calendar.tsx` | Type filter chips | onClick | — | Client-side filter | — | — |
| `/conversations` | `12-conversations.tsx` | Filter badges (All/Unread/Assigned) | onClick | — | Client-side filter | — | — |
| `/conversations` | `12-conversations.tsx` | Folder tree (inbox/starred/sent) | onClick | — | Client-side filter | — | — |
| `/conversations` | `12-conversations.tsx` | Reply textarea + Send (or ⌘+Enter) | onClick / keydown | non-empty body | `POST /api/messages { conversation_id, direction:"outbound", body }` | Reply prepended; box clears | Toast |
| `/conversations` | `12-conversations.tsx` | "Merge" button | onClick (multi-select) | `edit:conversations` | `POST /api/domain/conversations/merge { sourceId, targetId }` | Source thread vanishes | Toast |
| `/workflows` | `13-workflows.tsx` | "Run" | onClick | `edit:workflows` | `POST /api/workflow-runs { workflow_id, status:"queued" }` | Toast "Workflow started" | Toast |
| `/workflows` | `13-workflows.tsx` | Enable/Disable toggle | onChange | `edit:workflows` | `PATCH /api/workflows/:id { status }` | Toggle reflects state | Revert + toast |
| `/workflows` | `13-workflows.tsx` | "+ New Workflow" | onClick | `create:workflows` | `openCreate("workflows")` | New card | Toast |
| `/forms` | `14-forms.tsx` | Currently hidden — keep hidden until Phase 2. | — | — | — | — | — |
| `/settings` | `15-settings.tsx` | Sidebar items (~25) | onClick | per-item permission | activate matching panel | Panel renders | "Coming in Phase 2" panel for unimpl |
| `/settings` → Team → Invite | `15-settings.tsx` | "+ Invite User" | onClick | `create:invites` | `POST /api/invites` | Toast "Invite sent to {email}" | 409 "Already invited"; 400 "Invalid email" |
| `/settings` → Role permissions | `15-settings.tsx` | Checkbox toggle | onChange | admin only | `POST /api/role-permissions/bulk` (debounced) | Inline save; toast on persisted | Revert on failure |
| `/settings` → API keys | `15-settings.tsx` | "+ New API key" | onClick | `create:api-keys` admin | `POST /api/api-keys` | Modal shows `plaintext_once` with copy button | Toast |
| `/settings` → API keys | `15-settings.tsx` | "Revoke" | onClick | `delete:api-keys` admin | `DELETE /api/api-keys/:id` | Row marked revoked | Toast |
| `/settings` → Sessions | `15-settings.tsx` | "Revoke" | onClick | self or admin | `DELETE /api/sessions/:id` | Row removed | Toast |
| `/settings` → Webhooks | `15-settings.tsx` | "+ Add" / "Delete" | onClick | admin | `POST /api/webhook-subscriptions` / `DELETE` | Same plaintext-once UX | Toast |
| `/settings` → Email providers | `15-settings.tsx` | "Send test" | onClick | admin | `POST /api/email-providers/:id/test` | Toast with provider feedback | Toast |
| `/settings` → SSO providers | `15-settings.tsx` | "Test" | onClick | admin | `GET /api/sso/:type/callback?code=test` | Modal explains required env vars | — |
| `/vendor` | `vendor-portal.tsx` | Sidebar (Overview, Projects, Conversations, Deliverables, Profile, Banking, Timesheets, Invoices) | onClick | implicit `audience=vendor` | server-scoped lists | Panel switches | — |
| `/vendor/profile` save | `vendor-portal.tsx` | "Save" | onClick | self | `PATCH /api/vendors/:self` | Toast | Toast |
| `/vendor/banking` save | `vendor-portal.tsx` | "Save banking" | onClick | self | `PATCH /api/vendors/:self { banking_json }` | Toast | Toast |
| `/vendor/timesheets` add | `vendor-portal.tsx` | "Add row" | onClick | self | `POST /api/timesheets { date, project_id, hours, rate }` | Row appends | Toast |
| `/vendor/invoices` download | `vendor-portal.tsx` | "Download PDF" | onClick | self | client-side jsPDF | PDF saves | — |
| `/client` (new) | `client-portal.tsx` (new) | Read-only project status + invoice list | — | implicit `audience=client` | `GET /api/projects?client_id=:self`, `/api/invoices?client_id=:self` | — | — |

Validation across the app:
- All form fields use `react-hook-form` + `zodResolver` against the schema in `@dm/shared`.
- Inputs disable Submit when invalid; show field-level red border + helper text once blurred.
- Submit button shows spinner while `mutation.isPending`; disables.
- Date fields use ISO 8601 (`isoDate` in `@dm/shared`).
- File upload (Phase 2) goes through `POST /api/files/sign-upload` → S3-compatible signed PUT.

Error UX:
- 401 → redirect to `/signin`.
- 403 → toast "You don't have permission to do that" + log to telemetry.
- 409 → toast with `details.code` mapped to user-readable message.
- 422 → field-level error from `details`.
- 5xx → generic toast + Sentry capture.

### 2.4 RBAC model (MVP)

Five canonical roles, one taxonomy across backend + frontend + DB:
- `super_admin` — full org. Reserved for Manish and one backup.
- `admin` — full tenant.
- `manager` — CRUD on contacts/vendors/projects/conversations/calendar/workflows; view-only on settings + audit log.
- `staff` — CRUD on contacts/projects/conversations/calendar; view on vendors; no settings.
- `vendor` (audience=vendor) — view-only on own profile + own projects + own deliverables + own invoices; edit own profile/banking; never sees other vendors or any internal admin surface.
- `client` (audience=client) — view-only on own projects + own invoices; never sees other clients or admin surfaces.

`super_admin` and `admin` are internal-audience only. `manager`, `staff` are also internal. `vendor`, `client` are the only external-audience values. The `audience` claim in the JWT is the high-order gate: an `audience=vendor` token simply cannot reach `/api/contacts` regardless of `roles[]`.

### 2.5 Internal vs external auth flows

**Internal (staff):** Entra ID via MSAL.
- App registration `dm-crm-staff` in the workspace tenant.
- `App roles`: super_admin, admin, manager, staff. Assigned to users in Azure portal.
- MSAL `loginRedirect` returns ID token (aud = clientId).
- Backend `authMiddleware` validates JWT, populates `req.user = { sub, email, name, roles, audience:"staff" }`, refuses if `roles[]` is empty (no permissive fallback).
- Server creates `sessions` row with device + IP + last_active; cookie is HttpOnly + Secure + SameSite=Lax.

**External (vendors + clients):** email magic-link.
- `POST /api/auth/magic-link/request { email, audience }` always returns 202 (avoid email enumeration). Throttle: 5/hour/IP, 3/hour/email.
- Server generates 32-byte token, stores hashed copy in `magic_link_tokens`, sends email via configured `email_providers.is_default=true`.
- Token TTL: 15 minutes. Single-use. Stored hashed.
- `GET /api/auth/magic-link/consume?token=...` validates, marks used, creates session, sets cookie, 302 to `/vendor` or `/client`.
- First-use bootstrap: if no `vendors` / `clients` row exists for that email, deny (provisioning happens via `/api/invites`).

**SSO providers** (`sso_providers` resource) reserved for future per-tenant SSO (Google Workspace, Okta) — not on MVP critical path.

### 2.6 Validation rules (canonical, per field)

All defined in `@dm/shared` and reused on backend (`schema.parse`) and frontend (`zodResolver`). Examples:

- `email` — `z.string().email().max(254).trim().toLowerCase()`.
- `phone` — `z.string().regex(/^\+?[0-9 ()-]{6,20}$/).optional()`.
- `name` — `z.string().min(1).max(120).trim()`.
- `url` — `z.string().url().max(500)`.
- Money — store as integer cents (`z.number().int().nonnegative()`).
- Dates — `z.string().datetime({ offset: true })`.
- Enums — declared once in `constants.ts`, imported.

Backend-side, every PATCH uses `schema.partial().strict()` — reject unknown keys to prevent mass-assignment.

### 2.7 Error handling (canonical, per failure)

| Failure | Status | Code | Body |
|---|---|---|---|
| Zod parse fail | 400 | `VALIDATION_ERROR` | `{ details: ZodIssue[] }` |
| Auth missing/expired | 401 | `UNAUTHENTICATED` | empty details in prod |
| Permission denied | 403 | `FORBIDDEN` | `{ resource, action }` |
| Row not found | 404 | `NOT_FOUND` | `{ resource, id }` |
| Conflict (dup / locked) | 409 | `CONFLICT` / `SLOT_TAKEN` / `ALREADY_INVITED` | message |
| Business-rule fail | 422 | resource-specific | `{ rule, hint }` |
| Rate-limited | 429 | `RATE_LIMITED` | `{ retry_after_ms }` |
| Not implemented | 501 | `NOT_IMPLEMENTED` | `{ env_required: [...] }` |
| Unhandled | 500 | `INTERNAL_ERROR` | `null` in prod |

Frontend renders toast based on `code` + falls back to `error` text. Mutations expose `error` to forms for field-level placement.

---

## 3. Database Design

### 3.1 Layered strategy

- **MVP (week 1):** SQL Server (Azure SQL Database, S0 5 DTU starter, $15/mo). Single tenant. Provider stays `sqlserver` in `container.ts`. All 30 tables live here.
- **Phase 2 (post-revenue):** Migrate read-heavy entities (`contacts`, `vendors`, `clients`, `projects`) to **Dataverse** so they get the Power Apps / Power Automate ecosystem. Operational entities (`order_queue_log`, `audit_events`, `sessions`, `magic_link_tokens`) stay in SQL Server — they're hot-path and not useful in Dataverse.
- **Never:** Don't try to launch on Dataverse — schema iteration is too slow, throttling is opaque, and the Web API does not love high-frequency CRUD on dev tier.

### 3.2 Schema (SQL Server, MVP)

Note: types target SQL Server. All `uniqueidentifier` columns default to `NEWID()`. All `*_at` columns are `datetime2(3)` UTC. Money is `int` cents.

```sql
-- ── Tenancy + audit columns appear on every audited table ─────────────────
-- tenant_id   varchar(64)  NOT NULL  DEFAULT 'default'
-- created_at  datetime2(3) NOT NULL  DEFAULT SYSUTCDATETIME()
-- updated_at  datetime2(3) NOT NULL  DEFAULT SYSUTCDATETIME()
-- created_by  uniqueidentifier NULL
-- updated_by  uniqueidentifier NULL
-- deleted_at  datetime2(3) NULL                     -- soft delete

-- ── users ────────────────────────────────────────────────────────────────
CREATE TABLE users (
  user_id        uniqueidentifier PRIMARY KEY DEFAULT NEWID(),
  tenant_id      varchar(64)      NOT NULL DEFAULT 'default',
  external_sub   varchar(255)     NULL,                  -- Entra OID
  email          varchar(254)     NOT NULL,
  name           nvarchar(120)    NOT NULL,
  audience       varchar(16)      NOT NULL,              -- 'staff'|'vendor'|'client'
  primary_role   varchar(32)      NOT NULL,              -- denormalised for fast filter
  active         bit              NOT NULL DEFAULT 1,
  last_login_at  datetime2(3)     NULL,
  created_at     datetime2(3)     NOT NULL DEFAULT SYSUTCDATETIME(),
  updated_at     datetime2(3)     NOT NULL DEFAULT SYSUTCDATETIME(),
  created_by     uniqueidentifier NULL,
  updated_by     uniqueidentifier NULL,
  deleted_at     datetime2(3)     NULL,
  CONSTRAINT uq_users_tenant_email UNIQUE (tenant_id, email)
);
CREATE INDEX ix_users_audience      ON users(tenant_id, audience) WHERE deleted_at IS NULL;
CREATE INDEX ix_users_external_sub  ON users(external_sub)         WHERE external_sub IS NOT NULL;

-- ── role_permissions (drives RBAC) ────────────────────────────────────────
CREATE TABLE role_permissions (
  permission_id  uniqueidentifier PRIMARY KEY DEFAULT NEWID(),
  tenant_id      varchar(64)      NOT NULL DEFAULT 'default',
  role           varchar(32)      NOT NULL,    -- super_admin|admin|manager|staff|vendor|client
  page           varchar(64)      NOT NULL,    -- resource name e.g. 'contacts'
  can_view       bit              NOT NULL DEFAULT 1,
  can_create     bit              NOT NULL DEFAULT 0,
  can_edit       bit              NOT NULL DEFAULT 0,
  can_delete     bit              NOT NULL DEFAULT 0,
  created_at     datetime2(3)     NOT NULL DEFAULT SYSUTCDATETIME(),
  updated_at     datetime2(3)     NOT NULL DEFAULT SYSUTCDATETIME(),
  CONSTRAINT uq_role_permissions UNIQUE (tenant_id, role, page)
);

-- ── invites ──────────────────────────────────────────────────────────────
CREATE TABLE invites (
  invite_id      uniqueidentifier PRIMARY KEY DEFAULT NEWID(),
  tenant_id      varchar(64)      NOT NULL DEFAULT 'default',
  email          varchar(254)     NOT NULL,
  role           varchar(32)      NOT NULL,
  audience       varchar(16)      NOT NULL,
  status         varchar(16)      NOT NULL DEFAULT 'pending',  -- pending|accepted|expired|revoked
  token_hash     char(64)         NOT NULL,                    -- sha256 hex
  expires_at     datetime2(3)     NOT NULL,
  accepted_at    datetime2(3)     NULL,
  created_at     datetime2(3)     NOT NULL DEFAULT SYSUTCDATETIME(),
  created_by     uniqueidentifier NULL
);
CREATE UNIQUE INDEX uq_invites_pending
  ON invites(tenant_id, email)
  WHERE status = 'pending';

-- ── magic_link_tokens ────────────────────────────────────────────────────
CREATE TABLE magic_link_tokens (
  token_id    uniqueidentifier PRIMARY KEY DEFAULT NEWID(),
  email       varchar(254)     NOT NULL,
  token_hash  char(64)         NOT NULL,
  audience    varchar(16)      NOT NULL,
  expires_at  datetime2(3)     NOT NULL,
  consumed_at datetime2(3)     NULL,
  created_at  datetime2(3)     NOT NULL DEFAULT SYSUTCDATETIME(),
  request_ip  varchar(45)      NULL
);
CREATE INDEX ix_magic_link_active ON magic_link_tokens(email, expires_at)
  WHERE consumed_at IS NULL;

-- ── contacts ─────────────────────────────────────────────────────────────
CREATE TABLE contacts (
  contact_id        uniqueidentifier PRIMARY KEY DEFAULT NEWID(),
  tenant_id         varchar(64)      NOT NULL DEFAULT 'default',
  type              varchar(16)      NOT NULL DEFAULT 'lead',
  first_name        nvarchar(120)    NOT NULL,
  last_name         nvarchar(120)    NOT NULL DEFAULT '',
  primary_email     varchar(254)     NOT NULL,
  primary_phone     varchar(40)      NOT NULL DEFAULT '',
  address           nvarchar(400)    NOT NULL DEFAULT '',
  custom_fields_json nvarchar(max)   NOT NULL DEFAULT '{}',
  owner_user_id     uniqueidentifier NULL,
  created_at        datetime2(3)     NOT NULL DEFAULT SYSUTCDATETIME(),
  updated_at        datetime2(3)     NOT NULL DEFAULT SYSUTCDATETIME(),
  created_by        uniqueidentifier NULL,
  updated_by        uniqueidentifier NULL,
  deleted_at        datetime2(3)     NULL,
  CONSTRAINT fk_contacts_owner FOREIGN KEY (owner_user_id) REFERENCES users(user_id)
);
CREATE INDEX ix_contacts_owner ON contacts(tenant_id, owner_user_id) WHERE deleted_at IS NULL;
CREATE INDEX ix_contacts_email ON contacts(tenant_id, primary_email);
```

The remaining tables (`vendors`, `clients`, `projects`, `project_stages`, `pipelines`, `pipeline_stages`, `pipeline_deals`, `conversations`, `messages`, `calendar_events`, `workflows`, `workflow_runs`, `forms`, `form_submissions`, `services`, `freelancer_services`, `orders`, `shopify_mappings`, `social_accounts`, `api_keys`, `sessions`, `sso_providers`, `email_providers`, `webhook_subscriptions`, `audit_events`, `order_queue_log`) follow the same pattern: PK `<name>_id uniqueidentifier`, tenant + audit columns, soft delete, indexed by foreign keys and the most common filter columns. Full DDL goes in `packages/backend/src/repositories/sqlserver/migrations/0001_init.sql` (replace the lazy `ensureSchema()` runtime bootstrap with proper migrations).

Indexes that matter for the hot paths:
- `messages(conversation_id, sent_at DESC)` — thread reads.
- `projects(tenant_id, status, deleted_at)` — kanban board.
- `pipeline_deals(pipeline_stage_id)` — pipeline UI.
- `calendar_events(tenant_id, owner_user_id, start_at)` — calendar view.
- `audit_events(tenant_id, actor_user_id, occurred_at DESC)` — admin log.
- `order_queue_log(queue_type, status, created_at)` — queue dashboard.
- `magic_link_tokens(email, expires_at) WHERE consumed_at IS NULL` — magic-link lookup.

### 3.3 Foreign keys and referential integrity

- `projects.client_id → clients.client_id` (ON DELETE NO ACTION; project must be detached or deleted first).
- `project_stages.project_id → projects.project_id` (ON DELETE CASCADE).
- `messages.conversation_id → conversations.conversation_id` (ON DELETE CASCADE).
- `workflow_runs.workflow_id → workflows.workflow_id` (ON DELETE CASCADE).
- `pipeline_stages.pipeline_id → pipelines.pipeline_id` (ON DELETE CASCADE).
- `pipeline_deals.pipeline_stage_id → pipeline_stages.stage_id` (ON DELETE CASCADE).
- `form_submissions.form_id → forms.form_id` (ON DELETE CASCADE).
- All `*_by` columns are nullable FKs to `users(user_id)` ON DELETE SET NULL.

3NF throughout. The two `*_json` columns (`custom_fields_json`, `rate_card_json`, `config_json`) are deliberate Stretch JSON columns — denormalised only where the shape is genuinely sparse/unknown. Never query through them in a hot path; if a field becomes queryable, promote it to a real column.

### 3.4 Row-level security

Azure SQL supports native RLS via `CREATE SECURITY POLICY`. MVP: apply per-tenant filter on every table using `SESSION_CONTEXT('tenant_id')`, set by the connection pool middleware on every request. Phase-2 extends to per-vendor/per-client scoping:

```sql
CREATE FUNCTION fn_vendor_self (@vendor_id uniqueidentifier)
RETURNS TABLE WITH SCHEMABINDING AS RETURN
  SELECT 1 AS allowed
  WHERE @vendor_id = CAST(SESSION_CONTEXT('vendor_id') AS uniqueidentifier)
     OR SESSION_CONTEXT('audience') = 'staff';

CREATE SECURITY POLICY pol_vendors ADD FILTER PREDICATE
  dbo.fn_vendor_self(vendor_id) ON dbo.vendors;
```

Equivalent policies on `clients`, `projects` (via client_id), `invoices`, `timesheets`. Staff bypass via `SESSION_CONTEXT('audience')='staff'`. The middleware sets `tenant_id`, `audience`, `vendor_id`, `client_id`, `user_id` on every connection checkout.

### 3.5 Audit trail

Every audited mutation appends a row to `audit_events`:

```sql
CREATE TABLE audit_events (
  event_id      uniqueidentifier PRIMARY KEY DEFAULT NEWID(),
  tenant_id     varchar(64)      NOT NULL DEFAULT 'default',
  occurred_at   datetime2(3)     NOT NULL DEFAULT SYSUTCDATETIME(),
  actor_user_id uniqueidentifier NULL,
  actor_email   varchar(254)     NULL,                    -- snapshot
  action        varchar(32)      NOT NULL,                -- create|update|delete|view-export|...
  resource      varchar(64)      NOT NULL,
  resource_id   uniqueidentifier NULL,
  request_id    varchar(64)      NULL,
  ip            varchar(45)      NULL,
  user_agent    varchar(400)     NULL,
  before_json   nvarchar(max)    NULL,
  after_json    nvarchar(max)    NULL
);
CREATE INDEX ix_audit_actor    ON audit_events(tenant_id, actor_user_id, occurred_at DESC);
CREATE INDEX ix_audit_resource ON audit_events(tenant_id, resource, resource_id, occurred_at DESC);
```

Written from a single backend repository middleware (`auditRepo.write(ctx, before, after)`) called by every PATCH/POST/DELETE handler. Retention: 13 months hot (Azure SQL), then archive to Azure Blob (cool tier) keyed by month — 7-year retention to match Australian Privacy Act expectations.

### 3.6 Migration strategy

- **In-memory → SQL Server.** Replace `ensureSchema()` runtime CREATE TABLE calls with versioned `.sql` files in `packages/backend/src/repositories/sqlserver/migrations/` run by `knex migrate:latest`. Wire `npm run migrate` into the deploy step. Write `0001_init.sql` with all 30 tables, `0002_seed_role_permissions.sql` with the default RBAC matrix.
- **SQL Server → Dataverse (Phase 2, partial).** Selected entities only (contacts, vendors, clients, projects). Use the Dataverse Web API + `pac solution` to define entities with same logical names. Backfill via a one-time export-import script (`scripts/sql-to-dataverse.ts`). Keep SQL Server as system-of-record for everything else and as the read-replica for the migrated entities for ~30 days as a safety net.
- **Rollback.** Never `DROP TABLE` in a migration. Mark deprecated columns with `_deprecated_` prefix; drop them in the migration after the next stable release.

---

## 4. Deployment Architecture

### 4.1 Topology

```
┌─────────────────┐   ┌──────────────────────┐   ┌──────────────────────┐
│  Browser (SPA)  │──▶│  Vercel Edge + CDN   │──▶│  Azure Functions     │
│  (React, Vite)  │   │  (frontend static    │   │  (Express adapter)   │
│                 │   │   + /api rewrites)   │   │  /api/*              │
└─────────────────┘   └──────────────────────┘   └──────────┬───────────┘
                                                            │
                                                  ┌─────────┴──────────┐
                                                  │  Azure SQL DB      │
                                                  │  S0 → S1 as needed │
                                                  └─────────┬──────────┘
                                                            │
                                       ┌────────────────────┴────────────────┐
                                       │  Azure Service Bus (queue)          │
                                       │  Azure Key Vault (secrets)          │
                                       │  Azure App Insights / Sentry        │
                                       │  Azure Blob (file uploads, audit)   │
                                       └─────────────────────────────────────┘
```

### 4.2 Frontend — Vercel

Repo: `manish144r/designersmeet-crm`. Vercel project `dm-crm`. One deployment per push to `master`; preview deployments on every PR.

`vercel.json` (corrected MVP):
```jsonc
{
  "version": 2,
  "framework": null,
  "installCommand": "npm install --include=dev",
  "buildCommand": "npm run build -w @dm/shared && npm run build -w @dm/frontend",
  "outputDirectory": "packages/frontend/dist",
  "rewrites": [
    { "source": "/api/:path*", "destination": "https://api.designersmeet.com/api/:path*" }
  ],
  "headers": [
    { "source": "/(.*)",
      "headers": [
        { "key": "Strict-Transport-Security", "value": "max-age=63072000; includeSubDomains; preload" },
        { "key": "X-Content-Type-Options",    "value": "nosniff" },
        { "key": "Referrer-Policy",           "value": "strict-origin-when-cross-origin" },
        { "key": "Permissions-Policy",        "value": "geolocation=(), microphone=(), camera=()" }
      ]
    }
  ]
}
```

Env vars (Vercel project settings, environment-scoped):
- `VITE_MSAL_CLIENT_ID`, `VITE_MSAL_TENANT` — staff SSO.
- `VITE_API_BASE_URL=https://api.designersmeet.com` — separate origin → no CORS surprises.
- `VITE_DEMO_MODE=false` for prod; `true` for `dm-crm-preview.vercel.app`.
- `VITE_SENTRY_DSN`.

Build steps:
1. `npm install --include=dev`.
2. `npm run build -w @dm/shared` (compiles `tsc` → `dist`).
3. `npm run build -w @dm/frontend` (Vite → `packages/frontend/dist`).

Removed from current `vercel.json`: the API function definition and the `/api/:path*` → `/api/server` rewrite. The backend lives at its own subdomain — this stops Vercel's 60s/512MB serverless limit from constraining background work, and removes the CORS bandage.

### 4.3 Backend — Azure Functions (consumption + premium hybrid)

**Recommendation:** Azure Functions (Node 20 runtime) with an Express adapter (`@azure/functions` v4 + `serverless-http` wrapper). Reasoning:

- Cost: consumption plan = $0 idle, ~$1–$2/mo for early traffic; premium plan ($150/mo) only when warm-start latency matters.
- Native MSAL/Entra integration without bolt-ons.
- VNet integration to Azure SQL on premium tier.
- App Service Plan (B1, ~$13/mo) is the right answer if the team needs sustained throughput >100 rps or background workers running continuously. For background queue workers, **always** use a separate App Service instance — Azure Functions consumption kills idle workers.

Deployment unit:
- One function app `dm-crm-api` (HTTP triggers for `/api/*`).
- One function app `dm-crm-workers` (Service Bus triggers for `orders.*`, `shopify.*`, `social.*` queues). Premium plan (`EP1`, ~$150/mo) so workers stay warm.

`packages/backend/src/server.ts` is the local entry; production entry is `packages/backend/azure-function/index.ts`:

```ts
import { app } from "@azure/functions";
import serverless from "serverless-http";
import { createApp } from "../src/crm/app.js";
const handler = serverless(createApp());
app.http("api", { route: "{*proxy}", methods: ["GET","POST","PUT","PATCH","DELETE"], handler });
```

### 4.4 Backend env vars (production)

All come from Azure Key Vault via `@azure/keyvault-secrets` + a tiny `loadSecrets()` step at boot. Vault references in App Settings — never paste plaintext.

| Var | Source | Notes |
|---|---|---|
| `NODE_ENV` | App Settings | `production` |
| `AUTH_MODE` | App Settings | `entra` |
| `DEMO_BYPASS` | App Settings | `false` always in prod |
| `DATA_PROVIDER` | App Settings | `sqlserver` |
| `QUEUE_PROVIDER` | App Settings | `azure-service-bus` |
| `CORS_ORIGIN` | App Settings | `https://app.designersmeet.com` (no wildcard) |
| `ENTRA_TENANT_ID` | Key Vault | tenant GUID |
| `ENTRA_CLIENT_ID` | Key Vault | app reg client GUID |
| `ENTRA_AUDIENCE` | Key Vault | usually = `ENTRA_CLIENT_ID` |
| `SQLSERVER_HOST/PORT/DATABASE/USER/PASSWORD` | Key Vault | use Managed Identity if possible |
| `SQLSERVER_ENCRYPT=true`, `SQLSERVER_TRUST_SERVER_CERT=false` | App Settings | enforce TLS |
| `SERVICE_BUS_CONNECTION_STRING` | Key Vault | or Managed Identity |
| `SHOPIFY_WEBHOOK_SECRET` | Key Vault | required if Shopify route mounted |
| `SENTRY_DSN` | Key Vault | |
| `EMAIL_PROVIDER` / `EMAIL_API_KEY` | Key Vault | Resend or MS Graph send-as |
| `META_ACCESS_TOKEN`, `STRIPE_SECRET_KEY` | Key Vault | only if integration enabled |

### 4.5 Database

Azure SQL Database, single-server (`dm-crm-sql`, S0 → S1 as load grows). Geo-replicate to a secondary region (auto-failover group) once revenue justifies the ~2× cost. Backups: PITR retained 35 days (default S0), long-term retention enabled for monthly backups (12 months).

### 4.6 CDN + caching

- Vercel handles frontend static asset CDN (Edge).
- `Cache-Control: public, max-age=31536000, immutable` on hashed Vite asset filenames.
- `Cache-Control: no-store` on `/api/*` responses.
- React Query staleTime 30s (current) — fine; bump per-resource where the data is genuinely stable.

### 4.7 CI/CD

`.github/workflows/ci.yml`:

```yaml
on: [push, pull_request]
jobs:
  ci:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: npm }
      - run: npm ci
      - run: npm run typecheck
      - run: npm run lint
      - run: npm test
      - run: npm run build
```

`.github/workflows/deploy-frontend.yml` — Vercel CLI on push to `master`.
`.github/workflows/deploy-backend.yml` — Azure Functions Action on push to `master`, with `production` environment requiring manual approval.

Husky already has `commit-msg` running `brand-lock-check.mjs`. Add `pre-commit` running `lint-staged` (eslint + prettier + the `dm/no-raw-color` rule).

### 4.8 Environments

| Env | Purpose | Frontend | Backend | DB | Auth |
|---|---|---|---|---|---|
| local | dev | Vite 5173 | Express 4000 | memory or local SQL | dev (stub) |
| preview | per-PR demo | Vercel preview URL | none (DEMO_MODE=true) | none | dev (stub) |
| staging | pre-prod | `staging.app.designersmeet.com` | `staging.api.designersmeet.com` | Azure SQL (separate DB) | Entra (staging app reg) |
| production | live | `app.designersmeet.com` | `api.designersmeet.com` | Azure SQL prod | Entra (prod app reg) |

Preview deployments deliberately stay demo-mode — keeps the surface live for stakeholders without ever needing real auth or data persistence.

### 4.9 Secrets management

- All secrets in Azure Key Vault `kv-dm-crm-prod` / `kv-dm-crm-staging`.
- Function apps use Managed Identity → Key Vault reference syntax `@Microsoft.KeyVault(SecretUri=…)`.
- Vercel env vars stay public-safe-only (`VITE_*` are bundled into the browser).
- `.env.example` (already exists) is the canonical contract; `.env` is gitignored.
- Rotation: 90 days for API/integration keys, on-incident for everything else. Document the rotation runbook in `docs/security/rotation.md` (not yet written).

### 4.10 Observability

- **Logging:** `pino` already in use; ship to App Insights via the OpenTelemetry exporter.
- **Tracing:** OTel SDK in `packages/backend/src/sentry.ts` already initialises Sentry; add `@opentelemetry/api` with `@vercel/otel` for the Edge side.
- **Alerts:** App Insights availability test on `/healthz`; alert on >5% 5xx rate over 5 min; queue DLQ depth >0.
- **Dashboards:** one Azure Workbook with: requests/min, p95 latency by route, error rate, queue depth, SQL DTU, top exceptions.

---

## 5. Enterprise Security

Tied to the OWASP Top 10 (2021).

### A01 — Broken Access Control
- **Today:** Wave-B routes never call `requireRole`. The 19 generic CRM routes never check permissions. `usePermission` is broken. → Effectively no server-side authorisation.
- **MVP fix:** Add a `requirePermission(resource, action)` middleware that consults `role_permissions` and the row-scope predicate (vendor self, client self). Mount on every `/api/*` route. Fail-closed: missing permission row = 403, not allow.
- Repair `usePermission` (move `useList` above the early returns; cache the permissions query at app load so per-render hook calls are deterministic).
- Set `audience` claim on JWT; reject `audience=vendor` calls to `/api/contacts` etc. at the middleware layer before reaching the resource handler.

### A02 — Cryptographic Failures
- All API tokens stored as sha256 (already true for `api_keys`; extend to `webhook_signing_secret`).
- Magic-link tokens stored hashed; never logged in plaintext.
- Sessions are server-side rows; cookie holds opaque `session_id`, not the JWT.
- TLS 1.2+ only on Azure SQL, Functions, Vercel.
- Backup encryption enabled (Azure SQL TDE on by default — keep it).

### A03 — Injection
- All SQL via parameterised Knex queries. Reject anything passed to raw `db.raw()` in code review.
- ZodError → 400 already implemented; **add `.strict()` on every PATCH** to block mass-assignment.
- The current `Collection.list` lowercase-substring filter has no injection surface (in-memory). The SQL Server impl must `.where('column', 'like', `%${value}%`)` via Knex bindings.
- HTML in user fields rendered via React (auto-escaped). Avoid `dangerouslySetInnerHTML` (current codebase uses it only in the logo SVG — fine).

### A04 — Insecure Design
- Add a deny-by-default permissions table.
- Treat all external-audience endpoints (vendor / client / public form-submit) as untrusted.
- Public form endpoint already exists at `POST /api/domain/forms/:slug/submit` — add a hCaptcha / Turnstile token validation before the handler.

### A05 — Security Misconfiguration
- **CORS:** drop `*` + `credentials:true` combo. In prod, `CORS_ORIGIN` = explicit list of allowed origins (`https://app.designersmeet.com`).
- **CSP:** remove `'unsafe-inline'` from scriptSrc. Use Vite's `crossorigin` + nonce.
- **HSTS:** set via Vercel header config (above). Backend should also send `Strict-Transport-Security` when reachable directly.
- **Helmet:** explicitly set `crossOriginEmbedderPolicy: false` only if needed (M365 iframe needs it); document trade-off.
- **Express trust proxy:** `app.set('trust proxy', 1)` so `req.ip` is the real client through Vercel/Azure FD.
- **Disable dev-mode auth in prod:** drop `DEMO_BYPASS` long term; if surge previews need it, gate it behind a separate env variable that is never set on real prod.

### A06 — Vulnerable Components
- `npm audit` weekly via Dependabot.
- Pin Node 20 LTS until October 2026, then Node 22.
- Replace `Knex` with `Kysely` only if SQL-injection-safe type-checked builders become a priority — not required for MVP.

### A07 — Identification & Authentication Failures
- Magic-link throttle: 5/hour/IP, 3/hour/email; lockout 30 min after 10 misses.
- Sessions revocable from `/settings/sessions`; automatically expire after 8 hours of inactivity, 30 days absolute.
- API keys scoped (`read|write|admin`); admin scope requires `audience=staff` + `super_admin` role.
- Entra app registration: enforce MFA at the tenant level.

### A08 — Software & Data Integrity Failures
- Shopify webhook HMAC verification — already implemented; mount the route.
- Webhook signatures sent out (`webhook_subscriptions.signing_secret`) — already implemented.
- Lock the package-lock.json. CI fails on `npm ci` mismatch.

### A09 — Security Logging & Monitoring Failures
- Audit log: every CRUD on every audited resource (see §3.5).
- Auth events: login success, login failure, logout, magic-link-request, magic-link-consume (success/fail), session-revoke.
- Sentry capture on every 5xx and unhandled rejection.
- Quarterly review of admin-role assignments + active API keys.

### A10 — Server-Side Request Forgery
- Outbound HTTP (Meta, Stripe, Shopify, Resend) goes through a single `httpClient` wrapper that allows only whitelisted hosts.
- Webhook delivery (when we send) does **not** follow redirects; resolves DNS once and refuses private IP ranges.

### Cross-cutting
- Rate limiting: `express-rate-limit` middleware globally at 60 req/min/IP on `/api/*`; tighter buckets on `/api/auth/*` and `/api/domain/forms/*`.
- CSRF: not strictly required for token-bearer APIs, but if cookie-session is used (magic-link landing) then issue and check a `X-CSRF-Token` on state-changing routes (double-submit cookie pattern).
- PII minimisation: log `request_id` not `req.user.email`; redact emails from queue payloads where the entity is identifiable by ID alone.

---

## 6. RBAC Design (Internal + External)

### 6.1 Canonical role taxonomy

| Role | Audience | Description |
|---|---|---|
| `super_admin` | staff | Org-level. Manage tenants, billing, root permissions. Manish only. |
| `admin` | staff | Tenant-level. Manage users, roles, integrations, billing within tenant. |
| `manager` | staff | Operate the business. Full CRUD on operational resources; view-only on settings + audit. |
| `staff` | staff | Day-to-day operator. CRUD on contacts/projects/conversations/calendar; view on vendors. |
| `vendor` | vendor | External freelancer. Sees only own profile + own assignments. |
| `client` | client | External client. Sees only own projects + own invoices. |

The `audience` claim is the high-order separator: a `vendor` token simply cannot reach `/api/contacts` regardless of `role_permissions`. The middleware checks audience first, role second.

### 6.2 Permission matrix (default seed)

Format: V=view, C=create, E=edit, D=delete. `-` = denied. `self` = only own row.

| Page / Resource | super_admin | admin | manager | staff | vendor | client |
|---|---|---|---|---|---|---|
| `dashboard`           | V    | V    | V    | V    | -    | -    |
| `contacts`            | CRUD | CRUD | CRUD | CRUD | -    | -    |
| `vendors`             | CRUD | CRUD | CRUD | V    | V self | - |
| `clients`             | CRUD | CRUD | CRUD | CR   | -    | V self |
| `projects`            | CRUD | CRUD | CRUD | CRUD | V self | V self |
| `project-stages`      | CRUD | CRUD | CRUD | CRUD | V self | - |
| `pipelines`           | CRUD | CRUD | CRUD | V    | -    | -    |
| `pipeline-stages`     | CRUD | CRUD | CRUD | V    | -    | -    |
| `pipeline-deals`      | CRUD | CRUD | CRUD | CR   | -    | -    |
| `calendar-events`     | CRUD | CRUD | CRUD | CRUD | V self | V self |
| `conversations`       | CRUD | CRUD | CRUD | CRUD | V self | V self |
| `messages`            | CRUD | CRUD | CRUD | CRUD | CRE self | CRE self |
| `workflows`           | CRUD | CRUD | CRUD | CR   | -    | -    |
| `workflow-runs`       | CRUD | CRUD | CRUD | V    | -    | -    |
| `forms`               | CRUD | CRUD | CRUD | CR   | -    | -    |
| `form-submissions`    | CRUD | CRUD | CRUD | V    | -    | -    |
| `services`            | CRUD | CRUD | CRUD | V    | V    | -    |
| `orders`              | CRUD | CRUD | CRUD | CRE  | V self | V self |
| `shopify-mappings`    | CRUD | CRUD | CRUD | V    | -    | -    |
| `invoices`            | CRUD | CRUD | CRUD | V    | V self | V self |
| `timesheets`          | CRUD | CRUD | CRUD | V    | CRUD self | - |
| `settings`            | CRUD | CRUD | V    | -    | -    | -    |
| `api-keys`            | CRUD | CRUD | -    | -    | -    | -    |
| `sessions`            | CRUD | CRUD | V self | V self | V self | V self |
| `sso-providers`       | CRUD | CRUD | -    | -    | -    | -    |
| `email-providers`     | CRUD | CRUD | -    | -    | -    | -    |
| `webhook-subscriptions` | CRUD | CRUD | -  | -    | -    | -    |
| `role-permissions`    | CRUD | CRUD | V    | -    | -    | -    |
| `audit-events`        | V    | V    | V    | -    | -    | -    |
| `invites`             | CRUD | CRUD | CR   | -    | -    | -    |
| `users`               | CRUD | CRUD | V    | V    | V self | V self |

Encoded as a single bulk-seed migration; admin can refine per-tenant via Settings → Role permissions.

### 6.3 UI surface separation

Single React build, but the router gates surfaces by `audience`:

- `audience=staff` → routes under `/` (the AppShell sidebar). `/vendor` redirects to `/dashboard`. `/client` redirects to `/dashboard`.
- `audience=vendor` → `/vendor/*` only. Any other route redirects to `/vendor`.
- `audience=client` → `/client/*` only. Any other route redirects to `/client`.

Sidebar items inside the staff shell are then filtered by `usePermission(page, "view")` via `<NavGuard page="…">` wrappers.

### 6.4 Backend enforcement

Every `/api/*` route uses two guards:

```ts
app.use("/api", authMiddleware);              // populates req.user
app.use("/api", audienceMiddleware);          // rejects wrong-audience early
app.use("/api/<r>",
  requirePermission("<r>", "view|create|edit|delete"),  // checks role_permissions
  rowScope("<r>")                              // injects WHERE clause / 403 if cross-row
);
```

`requirePermission` reads the `role_permissions` table (cached for 60s per role). `rowScope` is per-resource: for `vendors`, it forces `WHERE vendor_id = req.user.vendor_id` when audience=vendor; for `projects`, forces `WHERE client_id = req.user.client_id` when audience=client; for staff it's pass-through.

### 6.5 Frontend enforcement

- `<PageGuard page="contacts">` wraps every page root; renders the "no access" panel when `usePermission(page,"view")` is false.
- `<NavGuard page="contacts">` wraps each sidebar item; returns null when denied.
- Buttons inside pages check `usePermission(page, action)` and either hide or render disabled with a tooltip "Ask your admin for access".

The hook must be fixed first — call `useList('role-permissions', { role: user.roles[0] })` unconditionally at the top of the component tree (a single `<PermissionsProvider>` mounted in `main.tsx` that publishes the matrix into context), then the hook reads from context, not from a per-component query.

---

## 7. Future Enhancement Roadmap

Each phase strictly post-MVP. Sequenced by revenue-unlock impact, then technical-debt impact.

### Phase 2 — Persistence & Payments (weeks 5–8)

1. **Migrate hot entities to Dataverse.** Contacts, vendors, clients, projects. Keeps Power Platform expansion open. Cost: one engineer-week (mostly schema parity + smoke tests). Unblocks: Power Apps add-ins, Power Automate flows.
2. **Stripe payments live.** `/api/invoices` already exists in spec; wire Stripe Checkout for client invoice pay. Reuse existing `stripe` integration scaffold in `packages/backend/src/integrations/stripe`.
3. **Real email send.** Resend (primary) + MS Graph send-as (fallback). Replace the demo `email_providers/test` stub with `Mailer.send()` injected from `IEmailService`.
4. **Magic-link auth for vendors and clients.** New route group `/api/auth/magic-link/*`; new `magic_link_tokens` table; new `/vendor/signin` and `/client/signin` pages.
5. **File uploads.** `POST /api/files/sign-upload` issues pre-signed PUT to Azure Blob; `GET /api/files/:id` returns signed read URL. Virus-scan via ClamAV sidecar (per `Designersmeet/CLAUDE.md` rule).

### Phase 3 — Operational maturity (weeks 9–14)

1. **Mount the legacy DM routes and wire workers.** `/api/orders`, `/api/freelancers`, `/api/services`, `/api/shopify-mappings`, `/api/shopify-webhook`, `/api/social/*`, `/api/queue/*`. Start `workers/*` in the worker function app. This is the Shopify → freelancer assignment chain that DesignersMeet's revenue model depends on.
2. **Server-side audit log + admin viewer.** Replace the demoStore audit interceptor with the real `audit_events` table; expose `/api/audit-events` with cursor pagination; render in Settings → Audit log.
3. **RBAC editor live.** Settings → Role permissions panel writing to `/api/role-permissions/bulk` with optimistic UI.
4. **Workflows engine.** Promote `workflow_runs` from "card with a Run button" to an actual executor (trigger types: schedule, webhook, form-submission, status-change). Run inside the worker function app.
5. **Real HubSpot / Xero / Slack integrations** wired through the existing `integrations/registry.ts` pattern.

### Phase 4 — Scale (weeks 15+)

1. **Multi-tenant.** `tenant_id` columns are already in the schema; add tenant resolution middleware (subdomain → tenant lookup), per-tenant Key Vault namespacing.
2. **Read replica.** Azure SQL geo-replica in second region; read traffic via routing rule.
3. **Search.** Promote substring `LIKE` filters to Azure AI Search (only for `contacts`, `vendors`, `messages`).
4. **AI assist.** GenAI summarisation of conversation threads, project briefs, vendor reviews. Use the existing Night Factory Ollama / OpenRouter routing pattern from `CLAUDE.md` — keep cost low by routing bulk to local Gemma 4 (when available) and reserving cloud Claude/Gemini for quality cases.
5. **PCF + Custom Page.** Per existing `CLAUDE.md`, the deployment target is a model-driven Power App. Phase 4 packages the kanban board and project detail as PCF controls and the full SPA as a Custom Page. Backend continues to run as Azure Functions; PCF talks to Dataverse directly for the migrated entities and to `/api` for everything else.

### Technical debt to clear before Phase 2

- Fix `App.tsx` routing to match files on disk.
- Fix `usePermission` Rules-of-Hooks violation.
- Reconcile role taxonomy between backend, frontend, brief.
- Remove `DEMO_BYPASS=true` from `vercel.json` (move to a separate preview env).
- Drop wildcard CORS in `vercel.json`.
- Replace `ensureSchema()` with versioned migrations.
- Reconcile the 6 unmounted route files (mount or delete).
- Reconcile `Projects.tsx` (legacy `projects-api` page that imports `@dm/shared` types like `ProjectStage` which doesn't exist in shared/schemas.ts) — either delete the file or wire to the new schema.

### Scalability ceilings

| Bottleneck | Breaks at | Mitigation |
|---|---|---|
| In-memory queue (current default) | First server restart | Switch to Service Bus (done by config in prod). |
| `Collection.list` O(n) filter | ~10k rows | Move to SQL Server (already designed). |
| Single Azure SQL DB (S0) | ~300 connections / 100 DTU | Scale to S1 then S2 ($30–$70/mo). |
| Single Function app | ~1000 rps | Premium plan + auto-scale rules. |
| One vendor / one client portal user at a time | n/a | Per-row RLS already designed. |

Empirically: 100 vendors × 10 active projects × 10 messages/day = 10k messages/day = trivial for SQL S0. The first real ceiling will be the Shopify queue at 1000 orders/day, which Service Bus handles natively.

### Integration expansion

| Integration | Status today | MVP need | Phase 2 |
|---|---|---|---|
| Shopify | Scaffold + HMAC route written, **not mounted** | Mount routes + secret in Key Vault | Inventory sync |
| Stripe | Scaffold present | not on MVP | Checkout + webhooks |
| HubSpot | not present | not on MVP | One-way contact sync |
| Xero | not present | not on MVP | Invoice sync |
| MS Graph (M365) | scaffold | not on MVP | Calendar 2-way, mail send-as |
| Meta (FB/IG) | scaffold | not on MVP | Page insights, scheduled post |
| LinkedIn | scaffold | not on MVP | Scheduled post |
| Resend | n/a | MVP (transactional mail) | — |
| Sentry | initialised | MVP (already shipped) | — |

### AI / automation layer

Inherit the Night Factory orchestrator pattern (`CLAUDE.md`): Ollama-first, cloud-second, with task-complexity routing. CRM-specific use cases:

- Auto-categorise inbound conversation by intent (lead / support / billing).
- Suggest freelancer-to-order match based on past assignments + skill embedding.
- Draft project brief from form submission.
- Summarise client weekly status email from project timeline events.

All AI calls go through a `IAiService` interface in `packages/backend/src/integrations/ai/` (interface — not in repo today; add in Phase 2 with one default `OpenRouterPoster`-style adapter).

---

*End of architecture.*
