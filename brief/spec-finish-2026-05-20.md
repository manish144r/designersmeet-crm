# DesignersMeet CRM — Finish Spec (June 1 Launch)

**Spec author:** Claude (dispatcher, spec-only per build-pipeline-roles)
**Date:** 2026-05-20
**Base commit:** `c0a2ee9` on `claude/confident-archimedes-a4d918` (Wave A + B landed)
**Target launch:** 1 June 2026 (T-11 days)
**Pipeline role:** This document is the Claude-authored spec. Aider/Qwen builds, CodeRabbit reviews (or Codex if CR CLI not installed), Codex suggests fixes, Claude does final acceptance.

---

## 0. Premise verification (read first)

Verified against repo + vault on 2026-05-20:

| Item | Stated in brief | Verified | Action |
|---|---|---|---|
| `confident-archimedes-a4d918` branch + commit `c0a2ee9` | YES | ✅ confirmed | proceed |
| Wave A + B landed (5 endpoints, 18 settings sub-items, D-DECORATIVE probe, fresh VR baseline) | YES | ✅ confirmed via git log | proceed |
| Power Apps env "Manish Sharma's Environment" at `org4b345989.crm6.dynamics.com` | YES | ✅ confirmed via `pac env list` | proceed |
| Tenant ID `f3b2a859-acd8-433c-be2f-f361fd729743` | YES | ✅ confirmed (matches AtomicTrade default tenant) | proceed |
| 6 entities `dmcrm_client / project / freelancer / service / order / contact` provisioned with seed data | YES | ⚠️ *unverified by Claude — must be tested in T-1* | T-1 runs a smoke test |
| `DM_CRM_DATAVERSE_CLIENT_SECRET` in vault `secrets.env` | YES | ❌ **NOT IN VAULT** (`C:\Users\smani\OneDrive\Codex\NightFactory-Secrets\secrets.env`) | **BLOCKER** — see below |
| `STRIPE_SECRET_KEY` in `secrets.env` | conditional | ❌ NOT in vault | render Stripe in Configure-state; not a build blocker |
| `META_ACCESS_TOKEN` exists | YES | ❌ NOT in vault (not in any `*.env` or `*.json` on disk) | render Meta in Configure-state |
| `SHOPIFY_*` env-gating | conditional | ❌ NOT in vault | Configure-state |
| `BREVO_API_KEY` | conditional | ❌ NOT in vault | Configure-state |
| `ENTRA_*` (M365 OAuth) | conditional | ❌ NOT in vault | Configure-state |
| Existing Dataverse adapter at `packages/backend/src/repositories/dataverse/index.ts` | YES | ✅ confirmed; uses `dm_*` table prefix (NOT `dmcrm_*`) | T-2 renames the table prefix |
| Existing repo interfaces (`orders`, `freelancers`, `services`, `shopify_mappings`, `social_accounts`, `queue_log`) | implicit | ✅ confirmed | T-3 adds missing `clients`, `projects`, `contacts` interfaces |

### Hard blockers (Manish must resolve before live cutover)

1. **`DM_CRM_DATAVERSE_CLIENT_SECRET` is missing.** Without the SPN secret, the backend cannot authenticate to Dataverse via client-credentials flow. The pipeline can wire EVERYTHING ELSE but the "live Dataverse round-trip" acceptance criterion is **GATED on Manish providing the secret**. Add it to `C:\Users\smani\OneDrive\Codex\NightFactory-Secrets\secrets.env` as: `DM_CRM_DATAVERSE_CLIENT_SECRET=<value>`. Then reload: `. "$env:USERPROFILE\OneDrive\Codex\NightFactory-Secrets\load_secrets.ps1" -Persist`.

2. **No Dataverse entity-existence verification done by Claude.** Tasks T-1 dispatches a smoke test that hits `dmcrm_clients` and asserts 3 rows + `dmcrm_orders` 2 rows; that's the live-round-trip evidence in the final acceptance report.

### Soft blockers (build proceeds; UI shows Configure-state)

- Stripe, Meta, Shopify, Brevo, M365 OAuth — all credentials absent. Pipeline implements the **Configure-state UX** (panel with env-var hints; NO decorative buttons; per `feedback_no_decorative_interactive_elements`). When Manish adds the keys, no UI rebuild needed — flags flip live via env.

---

## 1. Scope (definition of finished)

Eight feature areas, all gated by the same acceptance bar.

### F-1 — Dataverse entity wiring (CRITICAL PATH)

- Refactor `packages/backend/src/repositories/dataverse/index.ts` to use the **real** entity-set names: `dmcrm_clients`, `dmcrm_projects`, `dmcrm_freelancers`, `dmcrm_services`, `dmcrm_orders`, `dmcrm_contacts` (replacing the placeholder `dm_*` prefix).
- Add three new repository interfaces in `packages/backend/src/repositories/interfaces.ts`:
  - `IClientRepository` — `list / findById / create / update / delete` over `dmcrm_clients`
  - `IProjectRepository` — same surface over `dmcrm_projects`
  - `IContactRepository` — same surface over `dmcrm_contacts`
  - Add `clients`, `projects`, `contacts` fields to the `Repositories` interface.
- Implement these new interfaces in **all three** providers (`memory/`, `sqlserver/`, `dataverse/`) — keep the `DATA_PROVIDER` swap invariant.
- Add corresponding Zod schemas in `packages/shared/src/` for `Client`, `Project`, `Contact`, derived from the actual Dataverse field shape (test by retrieving one row from each entity and matching the column names).
- Add `/api/clients`, `/api/projects`, `/api/contacts` routes in `packages/backend/src/routes/` following the existing CRUD pattern.
- Default behaviour: `DATA_PROVIDER=memory` for dev; `DATA_PROVIDER=dataverse` is the prod target once SPN secret lands.
- **Frontend stays unchanged.** Frontend calls `/api/*` via the existing typed-fetch wrapper (`packages/frontend/src/lib/api.ts`); the **provider swap is backend-only**. UI is locked per `feedback_brief_conformance`.
- Add a `DATAVERSE_ENTITY_PREFIX=dmcrm_` config knob with default `dmcrm_` so future re-prefixing is one env-change.

### F-2 — Stripe 4-tier checkout

- Add `packages/backend/src/integrations/stripe/checkout.ts` — creates Stripe Checkout Sessions for the 4 tiers (Solo $0 / Studio $49/mo / Agency $149/mo / Enterprise contact-sales).
- Tier products + prices defined as a config table in `packages/shared/src/billing.ts`:
  ```
  Solo:       priceId = null,        amount = 0,    cta = "Get started"
  Studio:     priceId = process.env.STRIPE_PRICE_STUDIO,  amount = 4900,  cta = "Upgrade to Studio"
  Agency:     priceId = process.env.STRIPE_PRICE_AGENCY,  amount = 14900, cta = "Upgrade to Agency"
  Enterprise: priceId = null,        amount = null, cta = "Contact sales" (mailto)
  ```
- Route: `POST /api/billing/checkout` — body `{ tier: 'studio'|'agency' }`, returns `{ url: <Stripe Checkout URL> }`.
- Webhook stub: `POST /api/billing/webhook` — accepts Stripe signature, logs event to `queue_log`. No business-logic processing in this wave (gate that on Stripe key).
- Settings → Billing → Plan & usage panel: real button wired to `POST /api/billing/checkout`. When `STRIPE_SECRET_KEY` absent, show banner: "Configure Stripe — set `STRIPE_SECRET_KEY` in `secrets.env`. [Open docs]" — button stays clickable and shows the docs/help dialog (NOT a dead button — wired to a Help dialog component). Banner is wired to a real `<button>` that toggles a `<dialog>`.
- Use Stripe **test mode** when only `sk_test_*` keys are present; **live mode** when `sk_live_*`.

### F-3 — Meta Graph API Page Insights

- Add `packages/backend/src/integrations/meta/insights.ts` — fetches `/me/insights` and `/{page-id}/insights` for the configured Page ID.
- Route: `GET /api/integrations/meta/insights?metric=page_impressions&since=...`. Returns time-series data normalized to `{ timestamp, value }[]`.
- Dashboard widget reads `/api/integrations/meta/insights` via React Query.
- When `META_ACCESS_TOKEN` absent: widget shows "Connect Meta" panel with env-var hint AND a `<button onClick={() => openConnectDialog()}>` that opens a real `<dialog>` with setup instructions. NOT decorative.

### F-4 — M365 (Entra) OAuth — env-gated

- Existing scaffolding in `packages/backend/src/integrations/` is incomplete. Wire a minimal Entra OAuth code-grant flow:
  - `GET /api/auth/m365/login` → redirect to `https://login.microsoftonline.com/{tenant}/oauth2/v2.0/authorize?...`
  - `GET /api/auth/m365/callback` → exchange code, store refresh token in `system_tables` (encrypted at rest).
- When `ENTRA_CLIENT_ID` + `ENTRA_CLIENT_SECRET` absent: Settings → Identity → SSO providers shows "Configure Microsoft" with env-var hints + a real `<button>` that opens the setup `<dialog>`.

### F-5 — Shopify env-gating

- Existing shopify-mapping routes stay. Add `process.env.SHOPIFY_STORE_DOMAIN && process.env.SHOPIFY_ADMIN_TOKEN` gates around the Admin API client. If absent: Settings → Connections → Shopify shows "Configure Shopify" panel with env-var hints + real button → dialog. Mapping CRUD stays functional in demo/memory mode.

### F-6 — Brevo (transactional email) env-gating

- Add `packages/backend/src/integrations/email/brevo.ts` — minimal `sendTransactional({ to, subject, html })` wrapper over Brevo API v3.
- Wire into the existing `EmailProvider` interface as a new option in `EMAIL_PROVIDER` enum.
- Settings → Connections → Email providers: when no email provider is set, show "Configure email" panel with provider matrix (Brevo / Resend / SES / SMTP) + env-var hints + real button → dialog per choice.

### F-7 — Persona UAT re-run

- Re-run the 5×20×25×4 = 10,000-case persona UAT framework against the live-Dataverse build.
- New baseline file: `outputs/dm-ux-uat-2026-05-20-live-dataverse.md`. Capture:
  - Pre-baseline (current `outputs/dm-ux-critical-2026-05-21.md` numbers)
  - Post-baseline after F-1..F-6 land
  - Per-category pass/fail delta (B-AUTH, B-ASYNC, B-LOCK, B-XJRNY, D-DECORATIVE)
- Acceptance bar: ≥95% functional, ≥99% D-DECORATIVE = 0.

### F-8 — Deploy

- `pac code push` to "Manish Sharma's Environment" with `NODE_TLS_REJECT_UNAUTHORIZED=0` set (Norton-MITM workaround per `feedback_norton_blocks_tunnels`).
- Capture deployed `apps.powerapps.com` URL + bundle hash.
- If Surge auth restored: redeploy customer-facing frontend to Surge as well. If still broken: note in report and leave Power Apps Code App as sole surface.

---

## 2. Non-functional + invariants

- **UI locked.** 0.00% VR drift per page on the 16 pages baseline established in commit `0c63d4d` (`packages/frontend/.vr-base-vs-wavea/`). Drift > 0% = automatic acceptance fail.
- **D-DECORATIVE = 0.** Every clickable element must wire to a handler OR be `disabled` with `aria-disabled="true"` and `cursor-not-allowed`. The probe added in `0c63d4d` is the enforcement.
- **Dataverse-only data layer.** Per Manish 2026-05-20: Postgres pooler ports Norton-blocked. NO Supabase/Postgres for DM CRM application data (queue/orchestration uses local Postgres on `localhost:5433`, which is fine).
- **Repository pattern preserved.** Routes never touch `@azure/identity` or `dataverse-webapi` directly — only repository interfaces.
- **Zod-first.** All new entity types defined as Zod schemas in `packages/shared/src/`, types inferred, shared with backend + frontend.
- **No decorative buttons.** Every "Configure X" banner has a real button → `<dialog>` with setup instructions and env-var names. No dead nav items.
- **Test coverage.** New repository interfaces get vitest tests against the in-memory provider as a minimum. Dataverse provider gets a smoke test that's skipped when secrets absent.

---

## 3. Out of scope

- Email warm-up + FB/IG posting (Wave 2 marketing, separate workstream per `project_wave1_scope`).
- Real-domain DNS cutover (Manish-gated, ManishOps P0).
- Stripe webhook **processing** logic (signed signature verification only; business actions deferred to post-launch).
- Vendor portal UI changes (already locked).
- New marketing pages.

---

## 4. Pipeline routing

Per `feedback_build_pipeline_roles`:

```
Claude (this doc)         → spec_kit_loader.py emits agent_task_queue rows (agent_name='hermes')
Hermes (nf_hermes_agent)  → routes to 'aider' (ROUTE_BUILD_AGENT)
Aider (qwen via Cerebras) → builds + runs tests per task
Gate A (Aider 95-pass)    → ≥95% test pass rate
Gate B (Codex CLI review) → JSON {pass:bool,issues:[...]}  [CodeRabbit CLI not installed, fall back to Codex]
Loop                      → max 3 iterations; failed tasks → 'failed' status w/ issue log
After all F-1..F-8 pass   → emit claude_acceptance row → Claude (this session, on wake) runs spec-conformance
```

**Anthropic API NOT in the build loop** per `feedback_pipeline_priority`. Claude consumes tokens only at spec (this doc) + acceptance gates.

**Codex stdin no-op risk** per `feedback_codex_exec_stdin_noop`: Aider executor runs `codex exec` foreground + `</dev/null` redirect. Already encoded in `aider_executor.py`. Verify in the report.
