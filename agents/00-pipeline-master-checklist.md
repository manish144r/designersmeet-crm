# 00 — Pipeline Master Checklist
> NightFactory Aider pipeline. Binary pass/fail every phase. No grey area.
> Owner: Manish Sharma. Last sync from NightFactory: `architecture-review-package.md`, `code-review-round1.md`, `review-synthesis.md`, `prod_readiness_checklist.md`, `AGENTS.md`, `DEPLOY_TURBO_MAX.md`.

---

## Phase 0 — PRE-BUILD (kick-off gate)

Goal: nothing leaves planning until the brief is complete, locked, and routable.

| # | Check | Pass = | Fail action |
|---|-------|--------|-------------|
| 0.1 | Knowledge graph queried for prior work on this domain | `knowledge_query` hit list attached to brief | Re-run query; cite results in `brief/sources.md` |
| 0.2 | Business owner (Night Factory portfolio line) named | One of: ProcessBI / Designersmeet / RawFit / DentalOps / AtomicSMSF | Reject brief |
| 0.3 | Target users + roles enumerated | Internal / external / admin matrix in brief | Reject |
| 0.4 | Success metric is numeric | e.g. `LCP < 2.5s`, `pass-rate ≥ 95%`, `$10K MRR` | Rewrite KPI |
| 0.5 | Out-of-scope list exists | Explicit `WILL NOT` bullets | Add list |
| 0.6 | Threat model done (STRIDE) | `brief/threat-model.md` exists | Block |
| 0.7 | Cost ceiling agreed | `cost_budgets_usd` in routing config | Refuse start |
| 0.8 | Model routing decided | Architect=Opus 4.7, Builder=Aider+Sonnet, Reviewer=Codex, Tester=Playwright | Re-route |
| 0.9 | Worktree created (isolated) | Path: `.claude/worktrees/<adjective-name>` | Use `using-git-worktrees` skill |
| 0.10 | Pipeline log opened | `PIPELINE_RUN_LOG.md` created with date and version | Create |

Exit gate: every row green or PRE-BUILD halts pipeline.

---

## Phase 1 — REQUIREMENTS (lock the design)

Goal: produce a design doc the builder can implement without improvising.

| # | Check | Pass = | Notes |
|---|-------|--------|-------|
| 1.1 | Functional requirements numbered (FR-1..FR-n) | Each FR has acceptance criteria | One AC = one test later |
| 1.2 | Non-functional requirements numbered (NFR) | Perf, a11y, security, i18n | Bind to budgets |
| 1.3 | ERD drawn | `brief/erd.md` or PNG | 3NF unless flagged |
| 1.4 | API contract written | OpenAPI 3.1 in `brief/openapi.yaml` | Error envelopes defined |
| 1.5 | RBAC permission matrix | Role × resource × verb table | Deny-by-default |
| 1.6 | Element × action table per page | Every button/input has wiring + state | Lesson from 2026-05-22 |
| 1.7 | Filter elements have dropdown options | No `prompt()` placeholders | Lesson from 2026-05-22 |
| 1.8 | TypeScript strict mode declared | `tsconfig` strict + noImplicitAny | Lesson from 2026-05-22 |
| 1.9 | Design tokens locked | `brief/tokens.json` + Style Dictionary build | DM design-lock standard |
| 1.10 | Visual baselines captured | Storybook + Playwright snapshots | Self-baseline only |
| 1.11 | Threat model maps to NFRs | STRIDE × component grid | Architect signs |
| 1.12 | Architect sign-off | Commit SHA recorded | Frozen brief |

Exit gate: brief committed under `brief/` and protected (CODEOWNERS or pre-commit guard).

---

## Phase 2 — DURING-BUILD (Aider+Sonnet writes code)

Goal: code matches the locked brief — nothing more, nothing less.

| # | Check | Pass = | Owner |
|---|-------|--------|-------|
| 2.1 | TDD: failing test exists before code | Red test in branch HEAD | Builder |
| 2.2 | One PR == one FR | Diff scoped to a single feature | Builder |
| 2.3 | Atomic conventional commits | `feat|fix|chore|test|docs(scope):` | Builder |
| 2.4 | No decorative buttons | Every button wired to action OR removed | Builder + Reviewer |
| 2.5 | No `prompt()` / `alert()` | Use proper form components | Builder |
| 2.6 | No raw colors | `npm run lint` passes `dm/no-raw-color` | Builder |
| 2.7 | TypeScript strict — no `any` | `npm run typecheck` green | Builder |
| 2.8 | Parameterised queries only | Grep finds zero string-concat SQL | Builder |
| 2.9 | Inputs validated via Zod | Boundary schemas in `packages/shared` | Builder |
| 2.10 | No PII / secrets in logs | Logger redacts; scanner clean | Builder |
| 2.11 | aria-label on every actionable element | axe-core score 100 | Builder |
| 2.12 | Lazy load images + heavy routes | `loading="lazy"` + `React.lazy` | Builder |
| 2.13 | Memoise hot paths (>16ms) | React Profiler trace attached | Builder |
| 2.14 | No `console.log` left | Pre-commit hook blocks | Builder |
| 2.15 | Element × action table cross-checked | Every row implemented | Builder |
| 2.16 | Aider model fallback runner used | `aider_run.py` with OpenRouter→SambaNova→Mistral | Builder |

Exit gate: PR opens with a self-fill checklist where every box is ticked.

---

## Phase 3 — AFTER-BUILD (Codex reviewer + Playwright tester)

Goal: independent verification by a different model family.

| # | Check | Pass = | Owner |
|---|-------|--------|-------|
| 3.1 | Codex reviews against the brief, not just style | Cites FR/NFR numbers in comments | Reviewer |
| 3.2 | OWASP Top 10 sweep complete | Reviewer ticks all 10 | Reviewer |
| 3.3 | Performance anti-patterns flagged | N+1, unbounded maps, leaking listeners | Reviewer |
| 3.4 | Accessibility anti-patterns flagged | Missing labels, focus traps, keyboard-only | Reviewer |
| 3.5 | Tests: 1 per AC | Test ID == AC ID | Tester |
| 3.6 | Page Object Model used | No raw selectors in spec files | Tester |
| 3.7 | axe-core a11y per page | 0 serious / 0 critical | Tester |
| 3.8 | Visual regression vs self-baseline | ≤2% drift / ≤0.5% on logo+CTA | Tester |
| 3.9 | API schema validation | Response matches OpenAPI 3.1 | Tester |
| 3.10 | Negative tests run | Invalid input, wrong role, network fail | Tester |
| 3.11 | Persona suite (5×20×25×4 = 10,000 cases) | Critical subset 100%, full ≥95% | Tester |
| 3.12 | Block on: decorative element / hardcoded secret / missing error state / critical TODO | Pipeline halts | Reviewer |

Exit gate: Codex `APPROVE` comment + Playwright report green.

---

## Phase 4 — PRE-DEPLOY (release engineering)

Goal: prove the artifact is shippable, not just buildable.

| # | Check | Pass = | Notes |
|---|-------|--------|-------|
| 4.1 | `npm run build` deterministic | Two runs produce identical hashes | |
| 4.2 | Container image scanned | Trivy / Grype: 0 high, 0 critical | |
| 4.3 | Dependency audit clean | `npm audit --omit=dev`: 0 high/critical | |
| 4.4 | Secrets pulled from Key Vault | No `.env` in image; loader script verified | |
| 4.5 | IaC plan reviewed | `bicep what-if` / `terraform plan` attached | |
| 4.6 | Staging deploy succeeded | Smoke test green on staging URL | |
| 4.7 | Staging == prod (minus data) | Drift report empty | |
| 4.8 | Rollback rehearsed | One-command rollback documented | |
| 4.9 | Migration is reversible | `migrate:down` works on a copy | |
| 4.10 | Feature flag default off | `growthbook`/`launchdarkly` toggle inactive | |
| 4.11 | Pass-score ≥ 95% (Aider gate) | Model-pair tier hit; gap report attached if not | DRAFT only if gap |
| 4.12 | Release notes drafted | What changed / who feels it / how to roll back | |

Exit gate: change advisory record signed (one human OR architect-agent + reviewer-agent dual sign).

---

## Phase 5 — POST-DEPLOY (first 24 hours)

| # | Check | Pass = | Notes |
|---|-------|--------|-------|
| 5.1 | Health probe returns 200 for 15 min | Liveness + readiness | |
| 5.2 | Error rate vs baseline | ≤ +0.5% | |
| 5.3 | Latency p95 vs baseline | ≤ +10% | |
| 5.4 | Cost burn vs forecast | ≤ +15% | |
| 5.5 | No new Sev1/Sev2 alerts | Pager silence | |
| 5.6 | Canary at 5% → 25% → 100% staircase | Each step held ≥ 15 min | |
| 5.7 | Tracing IDs in logs | `trace_id` end-to-end | |
| 5.8 | Smoke test for the named feature | Real user flow recorded | |

Exit gate: 24h soak passes → flag flipped to 100%; otherwise rollback.

---

## Phase 6 — OPS + FEEDBACK (steady state)

| # | Check | Cadence | Notes |
|---|-------|---------|-------|
| 6.1 | Lessons-learned entries reviewed | Weekly retro | `agents/lessons-learned.md` |
| 6.2 | Top-3 failure patterns identified | Weekly | Drives training updates |
| 6.3 | Agent training files updated | Within 7 days of a Sev1 | See `07-self-learning-system.md` |
| 6.4 | Dependency audit | Weekly | Auto-PR via Renovate / Dependabot |
| 6.5 | Secret rotation drill | Quarterly | All `*_KEY` env vars |
| 6.6 | Chaos drill | Quarterly | Worker death, queue saturation, DLQ storm, Supabase outage |
| 6.7 | Cost ledger reviewed | Weekly | `agent_cost_ledger` per agent vs budget |
| 6.8 | Persona UX suite scheduled run | Daily critical, weekly full | `scripts/dm-ux-run.ps1` template |
| 6.9 | KPI dashboard read | Weekly | Compare to Phase-0 success metric |

---

## Phase 7 — FUTURE-ENHANCEMENTS (forward queue)

Treat as a Kanban with strict WIP=3.

| # | Practice | Pass = |
|---|----------|--------|
| 7.1 | New ideas captured as one-line tickets, not threads | Ticket = title + outcome + owner |
| 7.2 | Every enhancement starts at Phase 0 | No skipping back into the build |
| 7.3 | Quarterly architecture review | `architecture-review-package.md` rerun against current system |
| 7.4 | Sunset list maintained | Anything unused 90 days → flagged for delete |
| 7.5 | Knowledge graph entries added per enhancement | `knowledge/<topic>/*.md` |

---

## CI/CD Pipeline Spec

```
PR opened
  → lint + typecheck + unit (parallel, ≤5 min)
  → Codex review (advisory; blocking comments must resolve)
  → build artifact + SBOM
  → security scan (Trivy, npm audit, gitleaks)
  → staging deploy on merge to main
  → smoke tests on staging
  → manual approval gate (or architect-agent dual sign)
  → canary 5% → 25% → 100% (each step soak ≥ 15 min)
  → post-deploy probes
  → flag flip
  → close release notes
```

Required merge checks (branch protection):
- `ci/lint`, `ci/typecheck`, `ci/test`, `ci/build`, `ci/security`, `ci/visual-regression`, `ci/a11y`, `ci/codex-review`.

Branch strategy: trunk-based. `main` always deployable. Short-lived feature branches off `main` via worktrees.

---

## DevSecOps Controls

- **Secrets**: Azure Key Vault (or Supabase Vault) + OneDrive `NightFactory-Secrets` vault. Source loads via `load_secrets.ps1` — never inline.
- **SCA**: `npm audit` + `pip-audit` weekly. 0 high/critical to merge.
- **SAST**: `eslint-plugin-security`, `bandit`, `gitleaks` pre-commit + CI.
- **DAST**: ZAP baseline on staging URL nightly.
- **Container**: distroless or `node:lts-slim`. Non-root user. Trivy scan.
- **Runtime**: WAF on prod (Cloudflare/Front Door). Rate limit at edge.
- **Audit**: every privileged action emits an `audit_log` event with `actor`, `action`, `resource`, `trace_id`.
- **Headers**: HSTS, CSP, X-Frame-Options DENY, X-Content-Type-Options nosniff, Referrer-Policy strict-origin-when-cross-origin.
- **CORS**: explicit allowlist; never `*` in prod.

---

## Environment Strategy

| Env | Purpose | Data | Provider | Promotion |
|-----|---------|------|----------|-----------|
| **dev** | Builder loops, hot reload | Synthetic seeds (`npm run seed`) | `DATA_PROVIDER=memory`, `AUTH_MODE=dev` | Push → CI |
| **staging** | Pre-prod parity | Anonymised prod snapshot, weekly refresh | Same backend as prod, separate DB | Auto on merge to `main` |
| **prod** | Live users | Real | `DATA_PROVIDER=dataverse` or `sqlserver`, `AUTH_MODE=entra`, Key Vault | Manual approval after staging green + canary |

Hard rules:
- Same container image promoted across envs — config changes only.
- No prod data in dev. Ever.
- Staging schema migrations run before prod, same script.
- Prod requires dual-key for any destructive action.
