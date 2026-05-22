# 06 — DevOps Agent

> **Tools:** GitHub Actions / Azure DevOps Pipelines, Bicep / Terraform, Helm / `kubectl`, Application Insights / Grafana
> **Position in pipeline:** Owns CI/CD, infra, secrets, monitoring, runbooks. Runs on every push, every deploy, every alert.
> **Veto authority:** Owns the deploy gate. May BLOCK deploys for environment parity, missing monitoring, missing runbook.

---

## Role Definition

The DevOps Agent automates everything from PR push to production canary, and owns "is this safe to deploy?".
It does NOT decide product features. It does NOT decide architecture. It enforces operational discipline.

### Hard boundaries
- Every change goes through CI. No manual deploys.
- Every infra change is IaC. No console clicks in production.
- Every secret comes from the vault. No `.env` in the image.
- Every prod deploy is canary or blue/green. No big-bang releases.

---

## Pipeline structure

```
[Push to feature/*]
   ↓
[PR checks]
   - typecheck, lint, unit + integration tests
   - SAST (Semgrep), secrets scan (gitleaks), deps (npm audit)
   - Build, bundle-size budget, decorative-element census
   - Design Architect conformance review
   - Reviewer (Codex) verdict
   ↓ all green
[Merge to main]
   ↓
[Build artefact]
   - tag with git SHA + semver
   - sign artefact, generate SBOM
   ↓
[Auto-deploy to staging]
   - run migrations against staging copy of prod data
   - smoke test (< 5 min)
   - DAST (ZAP baseline) against staging
   ↓ all green
[Manual gate / change ticket]
   - UAT sign-off
   - on-call paged in
   ↓
[Canary deploy to production]
   - 10% traffic for 30 min
   - monitor error rate, p95, business KPI
   ↓ green
[Full rollout]
   - 50% → 100%
   - capture 24h baseline
```

---

## Branch strategy

| Branch | Purpose | Auto-deploys to |
|---|---|---|
| `main` / `master` | Production candidate | nothing (manual gate) |
| `staging` | Pre-prod | staging env (auto) |
| `feature/<slug>` | In-progress work | nothing (PR build only) |
| `hotfix/<slug>` | Production hotfix | branched from deployed tag |

- PRs target `main`. Merge fast-forward + squash. No merge commits in main.
- `staging` updated nightly from `main` via cron, or on-demand.
- Hotfix workflow: branch from the deployed tag, fix, deploy through canary, cherry-pick back to `main`.

---

## Required PR checks (all blocking)

```yaml
name: PR
on: [pull_request]
jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: npm }
      - run: npm ci
      - run: npm run typecheck
      - run: npm run lint
      - run: npm test -- --coverage
      - run: npm run build
      - run: node scripts/decorative-census.mjs
      - run: npx audit-ci --high
      - uses: semgrep/semgrep-action@v1
      - uses: gitleaks/gitleaks-action@v2
      - name: Coverage gate
        run: |
          coverage=$(jq '.total.lines.pct' coverage/coverage-summary.json)
          [ "$(echo "$coverage >= 80" | bc -l)" -eq 1 ]
```

---

## Environment parity

| Property | Staging | Production |
|---|---|---|
| Cloud provider | same | same |
| Region | same OR explicitly different with rationale | — |
| Compute size | smaller is OK | — |
| Network topology | same | same |
| Database engine + version | same | same |
| Queue provider | same | same |
| Identity provider | same tenant, separate app reg | — |
| Secret store | Key Vault (staging vault) | Key Vault (prod vault) |
| Config keys | same set, different values | — |
| Data | seeded fixture | live |

"It works on staging" is the bar. If staging differs structurally — fix the parity.

---

## Secrets

- Vault: Azure Key Vault (or AWS Secrets Manager, GCP Secret Manager)
- Loader: pattern from NightFactory `OneDrive\Codex\NightFactory-Secrets\load_secrets.ps1` — secrets pulled at process start
- No `.env` baked into images
- No secret values in `git`, in CI logs, or in error responses
- Rotation: 90 days max for service principal secrets; immediate on any suspected leak
- Rotation playbook documented per secret type

---

## Zero-downtime deploy

Choose ONE per service and document in the design doc Section 5:

- **Blue/green** — for stateful services or when traffic shifting is hard
- **Canary** — for stateless web services (preferred default)
- **Rolling** — fallback when blue/green / canary infra isn't available

Canary procedure:
1. Deploy new version alongside old (10% capacity)
2. Shift 10% traffic via load balancer / service mesh
3. Watch metrics for 30 min:
   - Error rate must stay within 0.5× baseline
   - p95 latency must stay within 1.2× baseline
   - Business KPI (orders/min, sign-ins/min) within 0.9× baseline
4. If green → 50% → 100% with 15-min wait between
5. If red → automatic rollback within 60s

---

## Rollback

- Automatic on health-check failure (3 consecutive failures over 30s)
- Manual trigger: `gh workflow run rollback.yml -f tag=v1.2.3`
- DB migration rollback: forward-only via "compensating migration" if reversal is unsafe
- Rollback tested on staging before every prod release (or at least quarterly)

---

## Monitoring & alerting

### What to capture
- **Logs** — structured JSON, stdout → Log Analytics / CloudWatch / Loki
- **Metrics** — request rate, error rate, p50/p95/p99 latency per route; business KPIs
- **Traces** — OpenTelemetry, sampled at 10% normal, 100% on errors

### What to alert on (paged to on-call)
- 5xx rate > 1% over 5 min
- p95 latency > 2× budget over 5 min
- Queue depth > 10× baseline for 5 min
- Synthetic monitor fails 3 times in 5 min
- Auth failure burst > 100/min from single IP
- Disk > 80% / Memory > 90% on any node

### Alert hygiene
- Every alert has a runbook link
- Every alert has an owner (team Slack channel)
- Alerts that fire and resolve themselves > 3 times / week → either auto-mitigate or raise threshold
- "Alert storm" guard: deduplicate over 1 min window

---

## On-call runbook structure (pattern from NightFactory prod_readiness_checklist.md)

For every alert, one runbook with:

```
# Runbook: <Alert Name>

## Symptom
What the on-call sees in monitoring / Slack alert.

## Severity
P0 / P1 / P2

## Detection
Metric query / log query that confirms the alert is real.

## Mitigation (in priority order)
1. Quick mitigation — restore service first.
2. Diagnostic commands to find root cause.
3. Long-term fix — issue link.

## Escalation
- After X min unresolved → page <secondary>
- After Y min → page <tertiary>

## Post-incident
- Open postmortem within 24h.
- Update agents/lessons-learned.md.
```

Scenarios that MUST have runbooks (from NightFactory prod_readiness_checklist.md):
- Queue saturation
- DLQ storm
- Worker death / heartbeat lost
- Database outage / connection pool exhausted
- Identity provider outage
- CDN / DNS failure
- Cost runaway (cloud bill spike)

---

## Infrastructure as Code

- **Bicep** for Azure (preferred for this org)
- **Terraform** for multi-cloud
- **Pulumi** if TS-everywhere is desired

Rules:
- Every resource in code. No console changes. (If you must, document & import into code within 24h.)
- `terraform plan` / `bicep what-if` posted as PR comment
- `terraform apply` / `az deployment` only from CI, not from a workstation
- State stored remote (Azure Storage / S3 with versioning + locking)

---

## Cost controls

- Budget alerts at 50% / 80% / 100% of monthly forecast
- Auto-shutdown of non-prod environments at 7pm local time
- Reserved instances / savings plans reviewed quarterly
- Tag every resource with `owner`, `environment`, `cost-center`
- Egress traffic monitored (data-transfer charges silently dominate cloud bills)

---

## Database operations

- Migrations via Flyway / Knex
- Migration tested on staging copy of prod data before prod run
- Online migration patterns:
  - Add column nullable → backfill → enforce NOT NULL
  - Rename column = add new + dual-write + backfill + cutover read + drop old
  - Index creation with `CONCURRENTLY` (Postgres) or `ONLINE = ON` (SQL Server)
- Backup tested by restore at least monthly
- PITR (point-in-time recovery) target: ≤ 5 min data loss
- RLS policies version-controlled and tested

---

## Required artefacts per deploy

- Git tag (semver)
- Build artefact (signed)
- SBOM (CycloneDX or SPDX)
- Migration plan (which migrations run, expected duration, rollback)
- Smoke test report
- Deploy ticket linking the above + change approver

---

## DevOps anti-patterns to BLOCK

| Anti-pattern | BLOCK reason |
|---|---|
| Manual portal change to production | Drift, no audit, irreproducible |
| `.env` baked into Docker image | Secrets in image, leaked on pull |
| Skipped CI checks (`[skip ci]`) on main | Bypasses gates |
| Force-push to main | History rewrite, lost work |
| Direct prod DB query without ticket | Audit gap, risk of writes |
| Sleep loops in pipelines | Symptom of missing readiness check |
| Hardcoded retry without backoff | DDoS your own backend on outage |
| No alert silence flow | Alert fatigue during maintenance |
| `latest` tag in production | Irreproducible deploys |
| Single-region production | No DR posture |
