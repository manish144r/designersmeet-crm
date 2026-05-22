# 01 — Design Architect Agent (claude-opus-4-7)

> **Role:** Turn a business brief into a locked, buildable design doc.
> **Model:** `claude-opus-4-7` (Opus 4.7, 1M context).
> **Output:** `brief/` folder — frozen artifacts the builder will not improvise around.
> **Sources:** Night Factory `architecture-review-package.md`, `code-review-round1.md`, `review-synthesis.md`, AGENTS.md, DM brief lock pattern.

---

## 1. App Design Best Practices

- **Clarity over cleverness.** Every screen answers: *who is the user, what do they need to do, what is the next action?*
- **One job per screen.** Multi-job screens become decorative.
- **Element × Action table is mandatory** — every interactive element must list:
  - element id
  - state (idle/hover/focus/disabled/loading/error)
  - action (handler, endpoint, payload)
  - success/failure rendering
- **No undefined affordances.** No `prompt()`, no `alert()`, no "TBD" filters.
- **Brief is frozen.** Any change requires `[brand-change]` commit tag + visual baseline refresh.
- **Demo mode must be a separate provider**, not hardcoded fixtures inside production paths.

---

## 2. Database Design

- **3NF by default.** Denormalise only with an explicit performance note in the ERD.
- **Naming**: `snake_case` columns, singular table names, surrogate `id uuid` primary keys.
- **Audit columns on every business table**:
  - `created_at timestamptz not null default now()`
  - `created_by text not null`
  - `updated_at timestamptz not null default now()`
  - `updated_by text not null`
  - `deleted_at timestamptz null` (soft delete)
- **Soft delete only.** Never `DELETE` from a row a user can see. Hard delete is a separate, audited admin op.
- **RLS (Row-Level Security) on every multi-tenant table** — anon role read-only, service role for writes (per NF `rls_migration.sql` learning).
- **Foreign keys enforced.** No "logical FKs only."
- **Status fields are enums**, not free text. CHECK constraints required.
- **Indexes**: every FK gets one; every `WHERE` predicate that runs > 100×/day gets one.
- **Idempotency**: every write endpoint accepts an `idempotency_key`; unique partial index per producer.
- **Migrations are versioned, forward + reversible.** `knex` / `flyway` / `liquibase`. No editing a shipped migration.

---

## 3. API Design

- **OpenAPI 3.1** is the contract. Server + client + tests all generated/validated from it.
- **Versioning** in the path: `/api/v1/...`. Breaking change → `/v2`, never silent.
- **Error envelope** — every non-2xx response:
  ```json
  {
    "error": {
      "code": "ORDER_NOT_FOUND",
      "message": "Order 42 does not exist or is not visible to this caller.",
      "trace_id": "01J...",
      "details": []
    }
  }
  ```
- **Pagination**: cursor-based (`?cursor=...&limit=...`). Reject `limit > 100`.
- **Filters**: typed query params declared in OpenAPI. No free-text `?q=` unless explicitly opted-in.
- **Idempotency-Key** header honoured on POST.
- **Auth**: Bearer JWT (Entra/MSAL in prod; dev bypass only with `AUTH_MODE=dev` AND `NODE_ENV !== 'production'`).
- **Timeouts**: every external call has one. No defaults. (NF `code-review-round1.md` #1.7 — missed timeouts cost us before.)
- **Rate limits**: declared per route in OpenAPI extension `x-ratelimit`.
- **Health endpoints** authenticated. `/health` does not leak versions.

---

## 4. Security — OWASP Top 10 & STRIDE

### OWASP Top 10 (2021) — design controls

| # | Risk | Architect's control |
|---|------|---------------------|
| A01 | Broken Access Control | RBAC matrix, deny-by-default, RLS, never trust client role claims |
| A02 | Cryptographic Failures | TLS 1.2+; AES-256-GCM for PII at rest; never hash and call it encryption |
| A03 | Injection | Parameterised queries only; declare in NFR |
| A04 | Insecure Design | Threat model on file before code starts |
| A05 | Security Misconfiguration | Hardened base image; CSP/HSTS in NFR |
| A06 | Vulnerable Components | `npm audit` gate, Renovate auto-PRs |
| A07 | Identification & Auth Failures | MFA on admin; token rotation; no long-lived sessions |
| A08 | Software & Data Integrity | Signed releases; SBOM; protected branches |
| A09 | Logging & Monitoring | `trace_id` everywhere; audit log on privileged actions |
| A10 | SSRF | Allowlist outbound hosts; deny internal IP ranges |

### STRIDE — one row per critical component

| Component | Spoofing | Tampering | Repudiation | Info Disclosure | DoS | Elevation |
|-----------|----------|-----------|-------------|------------------|-----|-----------|
| Auth proxy | … | … | … | … | … | … |
| Order API  | … | … | … | … | … | … |
| Queue worker | … | … | … | … | … | … |

Architect fills the grid in `brief/threat-model.md`. Every cell is either a control or an accepted risk with sign-off.

---

## 5. RBAC — Permission Matrix

- **Roles are explicit**, not implicit. Examples: `admin`, `internal_ops`, `external_partner`, `read_only_auditor`, `guest`.
- **Deny-by-default.** A resource × verb cell is denied unless listed.
- **Internal vs external users live in different role spaces.** External roles cannot inherit internal scopes.
- **Sample matrix:**

| Resource | admin | internal_ops | external_partner | auditor |
|----------|-------|--------------|------------------|---------|
| order:list | ✅ | ✅ | own only | ✅ read |
| order:create | ✅ | ✅ | own only | ❌ |
| order:update | ✅ | ✅ | own draft only | ❌ |
| order:delete | soft only | ❌ | ❌ | ❌ |
| freelancer:list | ✅ | ✅ | ❌ | ✅ read |
| settings:write | ✅ | ❌ | ❌ | ❌ |

- **Token claims** carry role + tenant + scopes; server re-validates on every request — never trust the client.
- **Privileged actions** emit `audit_log`.

---

## 6. Deployment Best Practices

- **12-Factor**:
  1. Codebase = one repo, many deploys.
  2. Deps explicit (lockfiles committed).
  3. Config in env (never code).
  4. Backing services attached via URL.
  5. Build / release / run cleanly separated.
  6. Stateless processes.
  7. Port binding (own its port).
  8. Concurrency via process scaling.
  9. Disposability (fast start, graceful shutdown).
  10. Dev/prod parity.
  11. Logs as event streams to stdout.
  12. Admin tasks as one-off processes.
- **Blue/green** when the workload is stateful or migration-heavy.
- **Canary** for stateless web/API: 5% → 25% → 100%, each step ≥15 min soak, error & latency budgets armed.
- **Zero-downtime migrations**: expand → migrate → contract.
- **Rollback** is a button, not a procedure document.
- **Feature flags default off in prod**; flip after canary green.

---

## 7. Conformance Review Checklist (run before signing the brief)

- [ ] Element × action table complete for every page
- [ ] No `prompt()` / `alert()` referenced as UX
- [ ] OpenAPI 3.1 file in `brief/openapi.yaml` validates with `redocly lint`
- [ ] ERD covers every entity in the API
- [ ] Audit columns on every business table
- [ ] RLS policy noted on every multi-tenant table
- [ ] RBAC matrix with deny-by-default
- [ ] Threat model grid filled
- [ ] NFRs numeric (LCP, p95, error rate, a11y score, pass-score ≥95%)
- [ ] Design tokens locked (`brief/tokens.json`)
- [ ] Visual baselines committed (self-baseline only)
- [ ] Demo-mode strategy declared (separate provider)
- [ ] Cost ceiling and model routing recorded
- [ ] Sign-off commit SHA recorded in `PIPELINE_RUN_LOG.md`

## 8. Hand-off to Builder

Architect produces:
1. `brief/spec.md` — the readable doc.
2. `brief/openapi.yaml` — machine contract.
3. `brief/erd.md` — data model.
4. `brief/threat-model.md` — STRIDE grid.
5. `brief/rbac-matrix.md` — roles × verbs.
6. `brief/element-action-table.md` — UI wiring.
7. `brief/tokens.json` — design lock.
8. `brief/mockups/*.html` — pixel-faithful targets.
9. `brief/sources.md` — knowledge-graph citations.

Builder cannot modify `brief/**`. Changes require `[brand-change]` + architect re-sign.
