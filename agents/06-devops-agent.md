# 06 — DevOps / CI-CD Agent

> **Role:** Run the release machinery. Same image promoted across envs. Rollback is a button.
> **Sources:** NF `prod_readiness_checklist.md`, `rls_migration.sql`, `setup_pg_cron_reaper.sql`, `m2_poller.ps1`, DM `vercel.json`/`render.yaml`.

---

## 1. Pipeline Structure

```
PR opened
  └── ci/lint            (eslint, dm/no-raw-color)
  └── ci/typecheck       (tsc --noEmit)
  └── ci/test            (vitest + playwright unit/integration)
  └── ci/build           (vite, docker build, SBOM)
  └── ci/security        (gitleaks, npm audit, trivy, ZAP baseline)
  └── ci/visual          (playwright VR)
  └── ci/a11y            (axe-core)
  └── ci/codex-review    (Codex agent)
  └── ci/persona-critical(dm-ux-critical subset)

Merge to `main`
  └── deploy:staging     (same image)
  └── smoke:staging      (probes + auth flow + create-order flow)
  └── persona:full       (10k cases nightly; merge does not wait for this)
  └── approval-gate      (architect-agent + reviewer-agent dual sign or human)
  └── deploy:prod-canary 5%
  └── soak 15min
  └── deploy:prod-canary 25%
  └── soak 15min
  └── deploy:prod-100%
  └── flag:flip
  └── release-notes:publish
```

---

## 2. Branch Strategy

- **Trunk-based.** `main` is always deployable.
- Short-lived feature branches off `main` via worktrees (`using-git-worktrees` skill).
- No long-lived `develop`/`release` branches.
- Hotfix = a normal PR with `fix(...)` and an expedited approval — same gates.
- Tag releases `v<major>.<minor>.<patch>` on `main` after canary green.

---

## 3. Required Merge Checks (branch protection on `main`)

- `ci/lint`
- `ci/typecheck`
- `ci/test`
- `ci/build`
- `ci/security`
- `ci/visual`
- `ci/a11y`
- `ci/codex-review` (verdict ≠ BLOCK)
- `ci/persona-critical` (≥ 95%)
- Signed commits (or signed tags at minimum)
- Linear history (squash or rebase, no merge commits)
- Dismiss stale reviews on push
- Require resolution of all conversations

---

## 4. Environment Parity

- **Same container image** promoted dev → staging → prod. Config changes only.
- **Staging = prod minus data.** Same runtime versions, same env-var schema, same network policy.
- **Drift detection**: `bicep what-if` / `terraform plan` runs nightly against each env; non-zero drift opens an issue.
- **Schema migrations** run on staging before prod, same script.
- **Feature flags** keyed per-env; default off in staging+prod for new flags.

---

## 5. Secrets — Key Vault

- All secrets in Azure Key Vault (or Supabase Vault for NF stack).
- App auth to Key Vault via Managed Identity (no client secret on disk in cloud envs).
- Local dev: `load_secrets.ps1` from `OneDrive\Codex\NightFactory-Secrets\` (NF pattern).
- CI runners: OIDC federation to Key Vault — short-lived tokens, no static credentials in CI.
- Rotation: quarterly drill; every `*_KEY`/`*_SECRET` rotated; old version revoked within 24h.
- Never write a secret to logs, traces, or error responses.

---

## 6. Zero-Downtime Deploy

- **Expand → migrate → contract** for any schema change:
  1. Add the new column/table nullable.
  2. Backfill in the background.
  3. Deploy code that writes both old and new.
  4. Deploy code that reads new.
  5. Drop the old column in a later release.
- **Connection drain** on shutdown. SIGTERM → stop accepting, finish in-flight, exit.
- **Readiness probe** flips before liveness probe — load balancer stops sending traffic before the process dies.
- **Sessions are external** (Redis / sticky cookie not required) — process restart loses no state.

---

## 7. Rollback Automation

- **One command** per artifact:
  - Container: `kubectl rollout undo deployment/<name>` or platform equivalent.
  - Feature flag: `flag <name> off` reverts behavior without a redeploy.
  - DB migration: `migrate:down` rehearsed on a copy in pre-deploy.
- **Auto-rollback** if any of these trip during canary:
  - Error rate > baseline + 0.5% for 5 min.
  - p95 latency > baseline + 10% for 5 min.
  - Health probe fails 3× in 60s.
- **Postmortem** required for every rollback — entry in `agents/lessons-learned.md`.

---

## 8. Infrastructure as Code

- **Bicep** for Azure (preferred, native), **Terraform** for multi-cloud.
- Every resource is in IaC. ClickOps changes are reconciled or reverted.
- State stored remote (Terraform: Azure storage with state locking; Bicep: ARM deployment history).
- `what-if` / `plan` is a required CI check on any IaC change.
- Modules versioned and pinned.
- Reaper / cron jobs (e.g. `reclaim_expired_leases()` every 5 min — NF `setup_pg_cron_reaper.sql`) live in IaC, not in the database admin UI.

---

## 9. Cost Controls

- **Budget alerts** at 50%, 80%, 100% of monthly forecast.
- **Cost ledger** at app level: `agent_cost_ledger` table records each external API call with `cost_usd`. (NF `cost_ledger_patch.md`.)
- **Circuit breakers** per provider: route freezes when daily spend exceeds `cost_budgets_usd` (NF `agent-routing.json`).
- **Right-sizing**: monthly review; downscale anything < 30% utilised.
- **Free-tier preferred** when latency/quality allows (Cerebras, Groq, OpenRouter, SambaNova — NF pattern).
- **Self-host** evaluated for any recurring spend > $50/mo (Gemma 4 on M2 example).
- **Storage**: lifecycle rules on every bucket; cold tier after 30d, delete after 365d (unless legal hold).

---

## 10. DevOps Self-Check (per release)

- [ ] Same image hash deployed across envs
- [ ] Schema migration is reversible
- [ ] Rollback rehearsed on a copy
- [ ] Probes green for 15 min after each canary step
- [ ] Error / latency / cost within budget
- [ ] Audit log shipping confirmed
- [ ] Release notes published
- [ ] Lessons-learned updated if anything tripped
