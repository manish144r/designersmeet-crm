# 00 — Pipeline Master Checklist

> The single source of truth for "did we build this app robustly on the first go?"
> Every check is binary (PASS / FAIL). No subjective judgement.
> If a gate fails, the pipeline stops. No exceptions, no "ship anyway".
>
> Owners listed per check map to the agent files in this directory:
> Design Architect (01), Builder (02), Reviewer (03), Tester (04), Security (05), DevOps (06).
>
> Mined from NightFactory: `architecture-review-package.md`, `codex-deliverables/prod_readiness_checklist.md`,
> `crm-app/CODE_REVIEW.md`, `crm-app/PIPELINE_RUN_LOG.md`, `crm-app/AIDER-HANDOFF-2026-05-19-V2.md`,
> `crm-app/reviews/pass1-*.md`. Real failures from those reviews drive the binary checks below.

---

## How to use this file

1. Copy this file into the build folder for each new feature/app.
2. Tick the box ONLY when the artefact exists and was reviewed. No "trust me".
3. Phase gates are blocking. Do not move to the next phase until every check in the current phase is PASS.
4. If a check is "N/A", state the reason in writing in the same line.
5. Update `agents/lessons-learned.md` for any new failure mode discovered.

---

## PRE-BUILD PHASE (Design Architect — agent 01)

Gate owner: **Design Architect**. No code may be written until every check below is PASS.

### Requirements
- [ ] Functional requirements written as user stories with Given/When/Then acceptance criteria
- [ ] Non-functional requirements documented and measurable:
  - [ ] Performance: page load p95, API p95, throughput target
  - [ ] Security: auth flow, session timeout, secrets storage location named
  - [ ] Accessibility: WCAG 2.1 AA conformance target
  - [ ] Scalability: expected user count at 1×, 10×, 100×
- [ ] Business rules enumerated (every "must" / "must not" the product owner stated)

### Architecture Decision Records (ADRs)
- [ ] Every framework / library / cloud service choice has a 1-page ADR
- [ ] Each ADR lists: decision, context, alternatives considered, rationale, consequences
- [ ] ADRs stored in `docs/adr/NNNN-<slug>.md` with sequential numbering
- [ ] No technology choice is "implicit" — if it is in `package.json`, it has an ADR or is in the framework defaults

### Threat Modelling (STRIDE)
- [ ] Data flow diagram drawn for every trust boundary
- [ ] For each data flow, all 6 STRIDE categories assessed:
  - [ ] Spoofing
  - [ ] Tampering
  - [ ] Repudiation
  - [ ] Information disclosure
  - [ ] Denial of service
  - [ ] Elevation of privilege
- [ ] Each identified risk has a mitigation OR explicit acceptance with sign-off

### Design Doc (the 5-section template — see agent 01)
- [ ] Section 1: Data model (every entity, every field, every relationship)
- [ ] Section 2: API contracts (OpenAPI 3.1 spec, all endpoints, all schemas)
- [ ] Section 3: RBAC matrix (every role × every resource × every action, deny-by-default)
- [ ] Section 4: UX interaction spec (every screen, every state, every transition)
- [ ] Section 5: Operational spec (deploy topology, monitoring, alerting, runbooks)
- [ ] Design doc approved by Design Architect (PR merged) before any build PR is opened

### OpenAPI Spec
- [ ] `docs/openapi.yaml` exists for every backend
- [ ] Every route in the design doc has a matching OpenAPI operation
- [ ] Every operation has: parameters, requestBody schema, all response codes with schemas
- [ ] Common error envelope schema reused on every error response
- [ ] `npm run openapi:lint` (spectral) passes with 0 errors

### Database Schema
- [ ] Tables documented in `docs/data-model.md` with field name, type, constraints, validation rules
- [ ] 3NF unless explicitly denormalised — denormalisation has a written rationale
- [ ] Every FK has a corresponding index
- [ ] Every table has: `id`, `created_at`, `updated_at`, `created_by`, `updated_by`
- [ ] Every multi-tenant table has `tenant_id` indexed and on every query path
- [ ] Soft delete (`deleted_at`) defined OR explicit decision to hard-delete documented
- [ ] Row-Level Security (RLS) policy written for every tenant-scoped table
- [ ] Query plan reviewed for top 10 expected queries — no full table scans on hot paths

### RBAC Matrix
- [ ] Roles enumerated (internal + external, each surface separate)
- [ ] Resources enumerated (every entity + every action verb)
- [ ] Matrix cell explicitly marked Allow or Deny — no blanks
- [ ] Deny-by-default rule confirmed in code (`requireRole` middleware on every route)
- [ ] Cross-tenant access explicitly forbidden in every read query

### UX
- [ ] Wireframes approved
- [ ] Visual mockups approved
- [ ] Design tokens generated (Style Dictionary or equivalent) — no raw hex in code
- [ ] Brand lock check script exists (`scripts/brand-lock-check.mjs` pattern from crm-app)
- [ ] Component inventory matches mockups (no orphan components, no missing components)

### Accessibility Plan
- [ ] WCAG 2.1 AA target stated for the app
- [ ] Component-level a11y plan (every interactive element has known keyboard contract + aria pattern)
- [ ] Screen reader test plan (NVDA on Windows, VoiceOver on macOS/iOS)
- [ ] Colour contrast verified ≥ 4.5:1 for text, ≥ 3:1 for UI components

### Performance Budget
- [ ] Page load LCP < 2.5s on 3G (or explicit slower target with rationale)
- [ ] API p95 response time < 500ms for read, < 1s for write
- [ ] Bundle size budget per route (e.g., main < 200KB gz, per-route chunks < 50KB gz)
- [ ] Lighthouse CI score gates: perf ≥ 80, a11y ≥ 90, best-practices ≥ 90, SEO ≥ 90

### Security Requirements
- [ ] Auth provider chosen (Entra ID / Auth0 / Cognito) with ADR
- [ ] Token type, lifetime, refresh strategy documented
- [ ] Session storage location (HttpOnly cookie / sessionStorage / memory) decided
- [ ] Secrets management: Key Vault / Secrets Manager — no `.env` in production decision recorded
- [ ] CORS allowlist drawn (no `*` in production)
- [ ] Security headers list documented: HSTS, CSP, X-Frame-Options, Referrer-Policy, Permissions-Policy

**Gate: Design Architect signs PR. No build until merged.**

---

## REQUIREMENTS PHASE (Design Architect — agent 01)

### User stories
- [ ] Every story has an ID (e.g., `US-014`)
- [ ] Every story has Given/When/Then acceptance criteria
- [ ] Every story has an estimated effort (T-shirt or story points)
- [ ] Every story has a priority (P0 must / P1 should / P2 nice)

### Non-functional requirements
- [ ] Each NFR has a measurable target and a measurement method
- [ ] NFRs are testable in CI (e.g., k6 script asserts API p95 < 500ms)

### API contracts
- [ ] OpenAPI 3.1 spec is the contract — backend tests assert response matches schema
- [ ] Frontend client generated from OpenAPI (`openapi-typescript` or similar) — no hand-written types

### Error catalogue
- [ ] Every error has a stable code (e.g., `ORDER_NOT_FOUND`)
- [ ] Every code has a user-facing message
- [ ] Every code has a developer-facing message (logged, not surfaced to user)
- [ ] HTTP status code mapped per error code
- [ ] Error envelope: `{ code, message, correlationId, details? }`

### Data dictionary
- [ ] Every field: name, type, nullable?, default, validation regex/range, PII flag
- [ ] PII fields marked — drives encryption-at-rest and log scrubbing

### Dependency audit
- [ ] Every third-party lib has: name, version, licence, last-released date, vulnerability count
- [ ] No high/critical CVEs without documented exception
- [ ] No GPL/AGPL deps (or explicit legal review)
- [ ] Bundle impact recorded for FE deps (`bundlephobia` or `vite-bundle-visualizer`)

### Compliance
- [ ] GDPR / Privacy Act applicability assessed
- [ ] If PII: DPIA (Data Protection Impact Assessment) completed
- [ ] If payments: PCI DSS scope documented
- [ ] Accessibility law applicability (DDA-AU, ADA-US, EAA-EU) confirmed

**Gate: Design Architect approves. Requirements PR merged.**

---

## DURING-BUILD PHASE (Builder — agent 02)

### TDD discipline
- [ ] Test file created before implementation file (or in same commit)
- [ ] Red → Green → Refactor visible in commit history
- [ ] Coverage gate: 80% lines minimum on changed files, 0% regression on existing files

### Feature flags
- [ ] Every new user-visible feature behind a flag (`FEATURE_*`)
- [ ] Flag defaults OFF in production
- [ ] Flag has a kill switch tested

### PR quality gates (all blocking)
- [ ] `npm run typecheck` — 0 errors, no `any`, no `as` without comment
- [ ] `npm run lint` — 0 errors, 0 warnings (warnings = errors policy)
- [ ] `npm test` — all green, coverage gate met
- [ ] `npm run build` — succeeds
- [ ] `npm audit --audit-level=high` — 0 high or critical
- [ ] SAST scan (Semgrep / CodeQL) — 0 high or critical
- [ ] Design Architect conformance check (diff matches design doc) — PASS

### Forbidden in committed code
- [ ] No `console.log` (logger only)
- [ ] No `TODO` / `FIXME` without an issue link
- [ ] No hardcoded secrets (any string matching `key|secret|token|password` patterns is reviewed)
- [ ] No `alert()`, `confirm()`, `prompt()` dialogs (use modal components — *lesson from crm-app reviews*)
- [ ] No decorative buttons (script `scripts/decorative-census.mjs` returns 0 DECORATIVE)
- [ ] No `as any`, no `@ts-ignore`, no `@ts-expect-error` without inline justification

**Gate: All checks green in CI. Reviewer (agent 03) approves PR. Merge.**

---

## AFTER-BUILD PHASE (Tester — agent 04, Security — agent 05)

### E2E test suite
- [ ] One Playwright test per acceptance criterion
- [ ] Tests use Page Object Model
- [ ] Tests run against staging seeded with deterministic data
- [ ] All tests green on three browsers (Chromium, Firefox, WebKit)

### Visual regression
- [ ] Baseline screenshots committed
- [ ] Per-page diff threshold ≤ 2%
- [ ] Per-element diff threshold ≤ 0.5% on primary CTAs / logo / sidebar (pattern from crm-app)

### Accessibility audit
- [ ] `axe-core` runs in CI on every page — 0 violations of severity serious or higher
- [ ] Manual keyboard navigation tested on every interactive flow
- [ ] Screen reader smoke test on the 3 most critical flows

### API contract validation
- [ ] Every route tested against OpenAPI schema (`dredd` or `schemathesis`)
- [ ] Both happy path and error envelope validated

### Performance
- [ ] Lighthouse CI gates pass (perf ≥ 80, a11y ≥ 90)
- [ ] Core Web Vitals: LCP < 2.5s, INP < 200ms, CLS < 0.1

### DAST
- [ ] OWASP ZAP baseline scan against staging — 0 high/critical findings
- [ ] Authenticated ZAP scan run for protected routes

### Load test
- [ ] k6 baseline captured: throughput, p50/p95/p99, error rate
- [ ] 2× peak load test passes with error rate < 0.1% and p95 within budget

### Security review (every PR + final sign-off)
- [ ] OWASP Top 10 walked line-by-line against the diff
- [ ] No critical/high findings open

### Design Architect conformance review
- [ ] Diff matches design doc (data model, API contract, RBAC, UX)
- [ ] Any deviation has been approved via design-doc update PR first
- [ ] Verdict: PASS required to proceed

**Gate: All checks green. Design Architect signs off final.**

---

## PRE-DEPLOYMENT PHASE (DevOps — agent 06)

### Environment parity
- [ ] Staging = production minus data (same infra, same config keys, different secrets)
- [ ] No "works on staging because…" exceptions — fix the parity or fix the design

### Smoke test
- [ ] Smoke suite runs in < 5 min
- [ ] Covers every critical user path (sign-in, list view, create, update, delete, sign-out)
- [ ] Smoke runs automatically after staging deploy — red = stop

### UAT
- [ ] Stakeholder sign-off recorded (email / ticket / PR comment)
- [ ] UAT covered every P0 user story

### Rollback plan
- [ ] Documented in the deploy ticket
- [ ] Rollback script exists and was tested on staging
- [ ] Database migration is reversible OR has a forward-fix plan with RTO < 1h

### Migration
- [ ] Migration tested against a staging copy of production data (not empty DB)
- [ ] Migration is online-safe (no `ALTER TABLE` that locks > 1s on a hot table)
- [ ] Backfill runs in batches with progress logging

### Secrets
- [ ] All secrets resolved via Key Vault references (no `.env` baked into the image)
- [ ] Secret rotation playbook documented
- [ ] Vault loader pattern matches NightFactory: `OneDrive\Codex\NightFactory-Secrets\load_secrets.ps1`

### DNS / CDN / SSL
- [ ] DNS TTL lowered 24h before cutover
- [ ] SSL cert valid > 30 days
- [ ] HSTS preloaded (only after long-term cert plan)

### Monitoring & alerting
- [ ] Logs centralised (Application Insights / CloudWatch / Loki)
- [ ] Metrics: request rate, error rate, p95 latency per route — dashboards exist
- [ ] Alerts: error rate > X%, p95 > budget, 5xx burst — paged to on-call
- [ ] Synthetic monitor hits health endpoint every 1 min

### On-call runbook
- [ ] Pattern from NightFactory `prod_readiness_checklist.md`: queue saturation, DLQ storm, worker death, DB outage
- [ ] Each scenario: detection signal → diagnostic commands → mitigation → escalation
- [ ] Tabletop drill executed before go-live

**Gate: DevOps signs off. Go/no-go meeting if anything is yellow.**

---

## POST-DEPLOYMENT PHASE (DevOps — agent 06)

### Canary
- [ ] 10% traffic shift first
- [ ] Monitor for 30 min: error rate, p95, business KPIs
- [ ] If green, ramp to 50% then 100%
- [ ] If red, automatic rollback to previous version

### Health checks
- [ ] `/health` liveness probe returns 200 (process alive)
- [ ] `/ready` readiness probe returns 200 only when DB + queue reachable
- [ ] Kubernetes / App Service probes wired to these endpoints

### Baselines (first 24h)
- [ ] Error rate baseline captured
- [ ] p50 / p95 / p99 latency baseline captured per route
- [ ] Business KPIs baseline captured (orders/hour, sign-ins/hour, etc.)
- [ ] Alerts tuned against the baseline (not theoretical numbers)

### Alert pipeline test
- [ ] Synthetically trigger one error → verify alert reaches on-call channel within 5 min
- [ ] Verify silence flow works (mute during planned maintenance)

**Gate: Stable for 24h. Sign-off recorded in `agents/lessons-learned.md`.**

---

## OPERATIONS + FEEDBACK PHASE

### Error monitoring
- [ ] Sentry (or equivalent) capturing every unhandled exception
- [ ] Source maps uploaded so stack traces are usable
- [ ] PII scrubbed from breadcrumbs and event payloads

### APM
- [ ] p50/p95/p99 tracked per route
- [ ] Slowest endpoints reviewed weekly
- [ ] DB query plans audited for N+1 monthly

### Feedback loop
- [ ] In-app feedback widget OR mailto link in footer
- [ ] Feedback triaged into the backlog within 1 week
- [ ] Public changelog kept in `CHANGELOG.md` (Keep-a-Changelog format)

### Bug SLA
- [ ] Critical (data loss / security / total outage): mitigation in 4h, fix in 24h
- [ ] High (broken core flow): fix in 24h
- [ ] Medium (broken non-core flow): fix in 1 week
- [ ] Low (cosmetic / niche): backlog

### Retros
- [ ] Weekly retro: what failed, why, training update applied — log in `agents/lessons-learned.md`
- [ ] Monthly: audit all agent training files for staleness

### Hotfix
- [ ] Branch from the deployed tag (not main)
- [ ] Fix + minimal test that proves the fix
- [ ] Deploy through the same canary process
- [ ] Cherry-pick back to main

---

## FUTURE-ENHANCEMENTS PHASE

### Feature flags
- [ ] Every enhancement behind a flag
- [ ] Graduated rollout: 1% → 10% → 50% → 100%
- [ ] Flag has a documented sunset date — flags older than 6 months are reviewed for removal

### A/B testing
- [ ] Hypothesis written: "If we do X, then metric Y will move by Z%"
- [ ] Sample size and run-time computed from baseline variance
- [ ] Decision criteria written before starting (not "we'll see")

### Deprecation
- [ ] Old API versioned (`/v1` → `/v2`)
- [ ] Sunset date communicated 90 days in advance
- [ ] Usage telemetry confirms 0 active clients before removal

### Scalability review
- [ ] At 10× current load: name the first thing that breaks
- [ ] At 100× current load: name the first thing that breaks
- [ ] If the answer is "DB" — review sharding/read-replica plan
- [ ] If the answer is "queue" — confirm Azure Service Bus / SQS sizing
- [ ] If the answer is "auth" — confirm Entra throttling envelope

---

## FAILURE MODES TO PREVENT (from real NightFactory + crm-app reviews)

These are the actual failures the multi-LLM review pipeline caught. Every check above is designed to prevent at least one of them.

1. **Auth bypass via `AUTH_MODE=dev` in production** — pre-deploy gate must block `NODE_ENV=production && AUTH_MODE=dev`
2. **No RBAC on routes** — RBAC matrix gate in pre-build catches this
3. **Unsafe `req.body as { ... }` type assertion** — TDD + Zod-first rule catches this
4. **No React Error Boundary** — design doc's UX section requires it
5. **In-memory queue in production** — pre-deploy gate blocks `NODE_ENV=production && QUEUE_PROVIDER=memory`
6. **Decorative buttons (no `onClick`)** — `scripts/decorative-census.mjs` must return 0 DECORATIVE
7. **`prompt()` / `alert()` dialogs** — forbidden-in-commit rule + linter
8. **Missing pagination on list endpoints** — OpenAPI spec gate requires pagination on every list op
9. **HMAC bypass when secret unset** — security agent OWASP check catches this
10. **Information disclosure in error messages** — error envelope schema enforces correlation ID only
