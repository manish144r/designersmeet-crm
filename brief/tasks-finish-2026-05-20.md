# Tasks: DesignersMeet CRM Finish (June 1 Launch)

**Spec:** `brief/spec-finish-2026-05-20.md`
**Branch:** `claude/confident-archimedes-a4d918` (base `c0a2ee9`)
**Pipeline:** Hermes → Aider (qwen via Cerebras) → tests → Codex review → loop (3 max) → Claude acceptance

Each task is one queue row. Marker `[ ]` = pending, `[x]` = done, `[~]` = needs-refinement. `[P]` = parallelizable.

---

## Phase 1: Verify the Dataverse premise (the ONE thing Claude can't dispatch)

- [ ] T001 [US-ALL] Write a one-shot smoke test `scripts/dataverse-smoke.ts` that uses `ClientSecretCredential` with env (`AZURE_TENANT_ID`, `AZURE_CLIENT_ID`, `AZURE_CLIENT_SECRET`, `DATAVERSE_URL`) and calls `GET /api/data/v9.2/dmcrm_clients?$top=3`, asserting status 200 + ≥3 rows. Same for `dmcrm_orders` (≥2 rows). On secret-missing, print: `BLOCKED — DM_CRM_DATAVERSE_CLIENT_SECRET not set in secrets.env` and exit code 2. File: `packages/backend/scripts/dataverse-smoke.ts`. Run via `npm --workspace @dm/backend run dataverse:smoke`. No frontend changes.

## Phase 2: Dataverse adapter — table-name + entity-set fixes

- [ ] T002 In `packages/backend/src/repositories/dataverse/index.ts`, replace `dm_orders` / `dm_freelancers` / `dm_services` / `dm_shopify_mappings` / `dm_social_accounts` with `dmcrm_orders` / `dmcrm_freelancers` / `dmcrm_services` / etc. Add a `DATAVERSE_ENTITY_PREFIX` config knob (default `dmcrm_`) and use template literals: `` `${prefix}orders` ``. Update column-mapping helpers as needed.

- [ ] T003 [P] Add `IClientRepository`, `IProjectRepository`, `IContactRepository` to `packages/backend/src/repositories/interfaces.ts`. Each has `list/findById/create/update/delete`. Add `clients`, `projects`, `contacts` to `Repositories`. File: `packages/backend/src/repositories/interfaces.ts`.

- [ ] T004 [P] [US-DV] Add `Client`, `Project`, `Contact` Zod schemas in `packages/shared/src/entities.ts`. Fields derived from the actual Dataverse entity schema — script T001's smoke test should also dump column names; if names are unverified, use these reasonable defaults: `Client { id, dmcrm_name, dmcrm_email, dmcrm_phone, createdon, modifiedon }`, `Project { id, dmcrm_name, dmcrm_clientid, dmcrm_status, dmcrm_value, createdon }`, `Contact { id, dmcrm_firstname, dmcrm_lastname, dmcrm_email, dmcrm_clientid, createdon }`. Export inferred types. File: `packages/shared/src/entities.ts` + re-export from `index.ts`.

- [ ] T005 Implement `MemoryClientRepository`, `MemoryProjectRepository`, `MemoryContactRepository` in `packages/backend/src/repositories/memory/`. Seed with 3 / 2 / 2 example rows in `seed.ts`. Files: `packages/backend/src/repositories/memory/{clients,projects,contacts}.ts`.

- [ ] T006 Implement `DataverseClientRepository`, `DataverseProjectRepository`, `DataverseContactRepository` in `packages/backend/src/repositories/dataverse/`. Use the existing `DataverseClient` wrapper. Tables: `dmcrm_clients`, `dmcrm_projects`, `dmcrm_contacts`. Files: `packages/backend/src/repositories/dataverse/{clients,projects,contacts}.ts`. Plug into `buildDataverseRepos()` in `index.ts`.

- [ ] T007 Implement `SqlServerClientRepository`, `SqlServerProjectRepository`, `SqlServerContactRepository` in `packages/backend/src/repositories/sqlserver/` with corresponding migrations in `packages/backend/migrations/`. Same surface; SQL Server names use `[Clients]`, `[Projects]`, `[Contacts]`.

- [ ] T008 Add `/api/clients`, `/api/projects`, `/api/contacts` routes following the existing CRUD pattern (`packages/backend/src/routes/orders.ts` is the template). Mount in `packages/backend/src/app.ts`. Validate body with the Zod schemas from T004.

- [ ] T009 [P] Update `Container.init()` to wire `clients/projects/contacts` for all three providers. File: `packages/backend/src/container.ts`.

- [ ] T010 [P] Add vitest unit tests for the three new memory-provider repositories — happy-path CRUD + filter. Files: `packages/backend/src/repositories/memory/__tests__/{clients,projects,contacts}.test.ts`.

## Phase 3: Stripe 4-tier checkout

- [ ] T011 Add `packages/shared/src/billing.ts`: enum `BillingTier = 'solo'|'studio'|'agency'|'enterprise'`. Tier config object with `priceEnvVar`, `amountCents`, `displayName`, `cta`, `featuresList`. Export type `TierConfig`.

- [ ] T012 [P] Add `packages/backend/src/integrations/stripe/client.ts` — lazy-init `Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-12-18.acacia' })`. Throw a descriptive error if missing (caught by routes).

- [ ] T013 Add `packages/backend/src/integrations/stripe/checkout.ts` — `createCheckoutSession({ tier, successUrl, cancelUrl })` returning `{ url }`. Test-mode vs live-mode auto-detected from key prefix.

- [ ] T014 Add `POST /api/billing/checkout` route. Body validation via Zod `{ tier: BillingTier }`. On `STRIPE_SECRET_KEY` missing: returns `503 { error: 'stripe-not-configured', remediation: 'Set STRIPE_SECRET_KEY in secrets.env' }`. File: `packages/backend/src/routes/billing.ts`.

- [ ] T015 Add `POST /api/billing/webhook` — signature verification only (`stripe.webhooks.constructEvent`), log event id + type to `queue_log`. Return 200. File: same as T014.

- [ ] T016 Wire the upgrade CTA in `packages/frontend/src/pages/15-settings.tsx` → Billing → Plan & usage panel. The existing panel slot from Wave A gets a real button `<button onClick={handleUpgrade}>Upgrade to Studio/Agency</button>` that calls `POST /api/billing/checkout` and redirects to `result.url`. When 503 returned: show the existing "Configure Stripe" banner (real button → `<dialog>` with env-var instructions). NO DECORATIVE BUTTONS — every button has `onClick`.

## Phase 4: Meta Graph API insights

- [ ] T017 [P] Add `packages/backend/src/integrations/meta/insights.ts`. Functions `pageInsights(metric, since)` + `userInsights()` wrapping `https://graph.facebook.com/v19.0/...` with `META_ACCESS_TOKEN`. Return normalized `{ timestamp, value }[]`.

- [ ] T018 Add `GET /api/integrations/meta/insights` route. Returns 503 with remediation when `META_ACCESS_TOKEN` missing. File: `packages/backend/src/routes/integrations.ts`.

- [ ] T019 Add a Meta insights widget on `packages/frontend/src/pages/03-dashboard.tsx`. React Query hook. On 503 → render the "Connect Meta" panel (real button → `<dialog>`). UI changes are LIMITED to the existing widget slot — no layout shift, no VR drift.

## Phase 5: M365 (Entra) OAuth env-gating

- [ ] T020 [P] Add minimal Entra OAuth code-grant routes: `GET /api/auth/m365/login`, `GET /api/auth/m365/callback`. Use `ENTRA_TENANT_ID`, `ENTRA_CLIENT_ID`, `ENTRA_CLIENT_SECRET`. Store refresh token in `system_tables` (encrypt with `crypto.subtle` using a key derived from `ENTRA_TOKEN_ENCRYPTION_KEY` env var). On any env-var missing: route returns 503 + remediation.

- [ ] T021 Wire Settings → Identity → SSO providers: Microsoft tile. Real button → `<dialog>` with setup steps + env-var hints when 503. When configured: shows "Connected as <upn>" + Disconnect button.

## Phase 6: Shopify + Brevo env-gating UI

- [ ] T022 [P] Settings → Connections → Shopify: real button → `<dialog>` with env-var hints when `SHOPIFY_STORE_DOMAIN`/`SHOPIFY_ADMIN_TOKEN` absent. When configured: shows store domain + "Test connection" button.

- [ ] T023 [P] Add `packages/backend/src/integrations/email/brevo.ts` — `sendTransactional({to,subject,html})` via Brevo API v3. Add `'brevo'` to `EMAIL_PROVIDER` enum in `config.ts`.

- [ ] T024 [P] Settings → Connections → Email providers: tile per provider (Brevo / Resend / SES / SMTP). Real button → `<dialog>` with env-var hints per provider. Active provider shows green dot.

## Phase 7: Acceptance harness

- [ ] T025 Run the persona UAT re-run script `packages/frontend/scripts/persona-uat.ts` with `DATA_PROVIDER=memory` (since live Dataverse is gated on SPN secret). Capture results to `outputs/dm-ux-uat-2026-05-20-pre-deploy.md`. The script is the existing Wave A asset.

- [ ] T026 Run `npm --workspace @dm/frontend run test:vr` against the `.vr-base-vs-wavea/` baseline. Assert 0.00% drift across all 16 pages. Capture to `outputs/dm-vr-drift-2026-05-20.md`.

- [ ] T027 Run `npm --workspace @dm/frontend run test:d-decorative` — D-DECORATIVE probe. Assert count = 0 across all 16 pages. Capture to `outputs/dm-d-decorative-2026-05-20.md`.

- [ ] T028 Build artifacts: `npm run build` then `pac code push` (with `NODE_TLS_REJECT_UNAUTHORIZED=0` env). Capture deploy URL + bundle SHA. File: `outputs/dm-deploy-2026-05-20.md`.

## Phase 8: Claude acceptance gate

- [ ] T029 [CLAUDE-ACCEPTANCE] When all T001-T028 complete, emit a `claude_acceptance` queue row. Payload: `{spec_path: "brief/spec-finish-2026-05-20.md", tasks_path: "brief/tasks-finish-2026-05-20.md", branch: "claude/confident-archimedes-a4d918", base_commit: "c0a2ee9", build_commit: "<latest>", artifacts: {uat, vr, decorative, deploy}}`. Claude on next dispatcher poll runs spec-conformance review per `feedback_brief_conformance` and writes `outputs/dm-finish-2026-05-20.md` final report.
