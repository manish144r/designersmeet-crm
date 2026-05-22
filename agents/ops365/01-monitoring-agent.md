# 01 — Monitoring Agent

> **Role:** Watch everything. Surface the right signals at the right severity. Never page on noise.
> **Stack:** Supabase metrics, Grafana / SigNoz dashboards, Prometheus exporters where possible, polling scripts otherwise.

---

## 1. Health Checks

- **HTTP liveness** every 60s on every public endpoint:
  - `GET /health` → 200 + JSON body with `status: "ok"`, `version`, `commit_sha`.
  - Alert after **2 consecutive failures** (avoids flap).
- **HTTP readiness** every 60s on internal endpoints:
  - `GET /ready` → 200 only when DB + queue + cache reachable.
- **Synthetic transactions** every 5 min:
  - Critical journey scripted (e.g. login → fetch dashboard → log out).
  - Fail = page.

---

## 2. Worker Health

Per scheduled task:
- **Last run time** — fresher than its declared cadence × 1.5.
- **Exit code** — 0 = pass; non-zero counted; threshold > 3 in 24h alerts.
- **Output length** — 0 bytes when output is expected = suspicious (NF 0-byte recovery lesson 2026-05-08).
- **Heartbeat file** — touched within expected interval (NF `heartbeat_push.ps1` v3 pattern).

---

## 3. Queue Health

- **Depth trending up** = worker stuck. Alert when depth > 2× rolling 24h average for > 10 min.
- **Lease expirations** — `reclaim_expired_leases()` cron must run every 5 min (NF `setup_pg_cron_reaper.sql`).
- **DLQ size** — any growth alerts; sustained growth = "DLQ storm" runbook trigger.
- **Claim/complete ratio** — should approach 1.0 over time; deviation flags hung workers.

---

## 4. Database Health

- **Connection pool utilisation** — alert > 80% sustained.
- **Slow queries** — `pg_stat_statements` (or equivalent) — anything > 1s flagged; > 5s pages.
- **Lock waits** — alert if any lock held > 30s.
- **Replication lag** — alert > 30s.
- **Table bloat** — weekly check; vacuum if growth-rate-vs-baseline > 1.5×.

---

## 5. Cost Health

- Daily ingest of each provider's billing into `agent_cost_ledger`:
  - Anthropic, OpenAI, OpenRouter, Cerebras, Groq, Cohere, Mistral, Gemini, Azure, Vercel.
- Per-provider spend vs daily budget:
  - 50% → log
  - 80% → email alert
  - 100% → SMS + circuit breaker engages (route freezes)
- Monthly forecast vs actual; drift > ±15% triggers a review.
- "Free tier first" report: % of calls routed to free providers; target ≥ 70%.

---

## 6. Integration Health

For each external API (Shopify, Meta Graph, LinkedIn, Stripe, M365, HeyGen, Higgsfield, Postiz, Supabase, Perplexity):

| Signal | Threshold |
|--------|-----------|
| Last successful call | < 1h (or per integration cadence) |
| Error rate (5xx + 429) | < 1% in last hour |
| Rate limit headroom | > 20% of window remaining |
| Webhook delivery lag | < 60s |
| Token expiry | > 7 days remaining |

Each integration owns a runbook entry in `agents/ops365/runbooks/<integration>.md`.

---

## 7. Alert Routing

| Severity | Channel | Hours | Action |
|----------|---------|-------|--------|
| **Critical** | SMS + email + Telegram | 24/7 | Page within 2 min |
| **Warning** | Email | Daily digest 09:00 local | Triage within 1 business day |
| **Info** | Weekly report | Mon 09:00 | Review at retro |

Critical examples: business down, payment provider 5xx, DB unreachable, prod canary auto-rollback.
Warning examples: cost at 80%, queue depth 1.5× baseline, integration error rate creeping up.
Info examples: dependency CVE published (patch available), Lighthouse score dropped 5pts.

**Anti-flap rule**: an alert that fires + resolves > 3 times in 1h is a Critical regardless of original severity.

---

## 8. Dashboards (Grafana / SigNoz)

One dashboard per business + one cross-cutting Ops dashboard:

- **Per-business dashboard** answers: are we open for business? Health, queue, integrations, KPI snapshot.
- **Ops dashboard** answers: where is the next fire? Cost, errors, latency, DLQ, certificate expiries, scheduled-task heatmap.

Dashboards are operator-question-driven (skill `dashboard-builder`), not metric-driven. Every panel answers a named question; un-answered panels are removed.

---

## 9. Monitoring Agent Self-Check

- [ ] Every public endpoint has a synthetic
- [ ] Every scheduled task has heartbeat + exit-code monitoring
- [ ] Queue depth, DLQ, lease reaper covered
- [ ] DB metrics ingested
- [ ] Cost ledger ingested daily
- [ ] Every integration has health signals + runbook
- [ ] Alert routes verified by a quarterly drill
- [ ] Dashboards answer the operator's question
