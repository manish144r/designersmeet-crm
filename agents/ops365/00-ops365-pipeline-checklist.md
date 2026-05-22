# 00 — Ops 365 Pipeline Master Checklist
> Operational backbone. 24/7/365. Keeps every Night Factory business alive and growing.
> Binary pass/fail per row. Cadence column = how often this check runs.

---

## 1. System Health

| # | Check | Cadence | Pass = |
|---|-------|---------|--------|
| 1.1 | Scheduled tasks alive | Every 60s | All registered tasks reported `Ready` or actively running |
| 1.2 | Workers alive | Every 60s | Heartbeat in last 5 min for each worker (NF `night_factory_heartbeat` table) |
| 1.3 | Queues draining | Every 60s | `pending_count` not rising > 2× normal for 10 min |
| 1.4 | Integrations connected | Every 5 min | Each external API last successful call < 1h |
| 1.5 | Disk free | Every 5 min | ≥ 20% on every monitored volume |
| 1.6 | Memory free | Every 60s | M1 ≥ 4GB free; M2 ≥ 1.5GB free (NF guardrail) |
| 1.7 | Process restart count | Hourly | No process flapping (> 3 restarts in 60 min) |

---

## 2. Data Integrity

| # | Check | Cadence | Pass = |
|---|-------|---------|--------|
| 2.1 | Daily backup taken | Daily | Backup file > 0 bytes, integrity hash matches |
| 2.2 | Backup restore test | Weekly | Test restore to disposable env succeeds |
| 2.3 | Replication lag | Every 5 min | Lag < 30s |
| 2.4 | Stale data detection | Daily | No table > 24h without an expected update |
| 2.5 | Schema drift | Daily | `migrate:status` shows no pending |
| 2.6 | Audit log shipping | Hourly | All privileged actions arrived at SIEM / log store |
| 2.7 | 0-byte file scan | Daily | Auto-recover or alert (NF lesson: OneDrive truncation 2026-05-08) |

---

## 3. Cost Controls

| # | Check | Cadence | Pass = |
|---|-------|---------|--------|
| 3.1 | Daily spend ingested | Daily | Each provider's billing pulled into `agent_cost_ledger` |
| 3.2 | Spend vs budget | Daily | < 80% of daily budget per provider |
| 3.3 | Alert at 80% | Real-time | Email/SMS fired |
| 3.4 | Auto-shutdown at 100% | Real-time | Circuit breakers in NF `agent-routing.json` engage |
| 3.5 | Free-tier preferred | Continuous | Routing chooses Cerebras/Groq/OpenRouter/SambaNova when capable |
| 3.6 | Self-host opportunities | Monthly | Recurring spend > $50/mo flagged for self-host evaluation (Gemma 4 on M2 pattern) |

---

## 4. Security Ops

| # | Check | Cadence | Pass = |
|---|-------|---------|--------|
| 4.1 | Failed auth attempts | Real-time | < threshold per IP / per user; spike triggers alert |
| 4.2 | Unusual access patterns | Real-time | Off-hours admin, new IP, new device → flag |
| 4.3 | Certificate expiry | Daily | All TLS certs > 30 days remaining |
| 4.4 | Secret rotation drill | Quarterly | All `*_KEY` rotated; old revoked |
| 4.5 | Dependency vulnerabilities | Daily | `npm audit` / `pip-audit` clean |
| 4.6 | WAF logs reviewed | Weekly | Top blocked patterns investigated |
| 4.7 | Audit log review | Weekly | Privileged actions cross-checked vs change tickets |

---

## 5. Incident Management

| # | Check | Cadence | Pass = |
|---|-------|---------|--------|
| 5.1 | Detection latency | Per incident | Alert within target (P1 ≤ 2 min, P2 ≤ 5 min, P3 daily digest) |
| 5.2 | Triage | Per incident | Severity assigned within target |
| 5.3 | Escalation | Per incident | Owner paged; CEO notified for P1 |
| 5.4 | Resolution | Per incident | Within SLA per severity |
| 5.5 | Post-mortem | ≤ 7 days after | Written, blameless, with lessons |
| 5.6 | Lessons logged | Per incident | Entry in `agents/lessons-learned.md` |
| 5.7 | Runbook updated | Per incident | Existing runbook revised OR new one written |

See `02-incident-response-agent.md` for severity definitions and runbooks.

---

## 6. Deployment Ops

| # | Check | Per release | Pass = |
|---|-------|-------------|--------|
| 6.1 | Pre-deploy checklist | Required | Per `agents/00-pipeline-master-checklist.md` Phase 4 |
| 6.2 | Canary metrics | Required | Error / latency / cost within budget for each step |
| 6.3 | Rollback rehearsed | Required | One-command verified |
| 6.4 | Go / no-go decision | Required | Dual sign-off recorded |
| 6.5 | Release notes published | Required | What changed / who feels it / how to roll back |
| 6.6 | Post-deploy probes | First 24h | Health green for 24h before flag flip to 100% |

---

## 7. Business Metrics

| # | Check | Cadence | Pass = |
|---|-------|---------|--------|
| 7.1 | Daily KPIs | Daily | Revenue, leads, conv, churn proxy logged per business |
| 7.2 | Weekly trends | Weekly | Direction recorded; deltas explained |
| 7.3 | Monthly OKR progress | Monthly | Each Night Factory business — ProcessBI / DM / RawFit / DentalOps / AtomicSMSF — has its progress logged |
| 7.4 | Cohort retention | Monthly | 1m / 3m / 6m retention curves |
| 7.5 | LTV / CAC | Monthly | Per channel; channel ROI ranked |

---

## 8. Agent Health (Night Factory specific)

| # | Check | Cadence | Pass = |
|---|-------|---------|--------|
| 8.1 | Each scheduled task — last run | Continuous | Within expected window (hourly / 4h / 12h / daily) |
| 8.2 | Each scheduled task — exit code | Continuous | 0 = pass; non-zero counted, alert at threshold |
| 8.3 | Each scheduled task — output size | Continuous | 0 bytes when not expected = alert (NF 0-byte recovery lesson) |
| 8.4 | Queue depth per agent | Continuous | `pending_count('m2_factory')`, `pending_count('codex')`, etc. |
| 8.5 | Lease reclamation running | Every 5 min | `reclaim_expired_leases()` cron job alive (NF pg_cron reaper) |
| 8.6 | DLQ size | Hourly | Within threshold; spike = "DLQ storm" runbook |
| 8.7 | Cost ledger writing | Continuous | Provider calls record `cost_usd` |

---

## 9. CI / Automation Stack

- Heartbeat collector (Supabase upsert) — every 60s from each machine.
- Monitor agent (Haiku) — hourly aggregate + alert.
- Incident agent (Sonnet) — on alert.
- Cost agent (deterministic) — daily.
- Growth agent (Sonnet) — daily/weekly/monthly tiers.

Alerts route per `01-monitoring-agent.md`.
