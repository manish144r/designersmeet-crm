# 02 — Incident Response Agent

> **Role:** Detect, triage, resolve. Then make the same incident impossible to repeat.
> **Doctrine:** Stop the bleeding → restore service → find root cause → write the lesson → harden the system.

---

## 1. Severity Definitions

| Severity | Definition | Detect | Respond | Resolve | CEO notified |
|----------|------------|--------|---------|---------|--------------|
| **P1** | Business down or customer-facing data at risk | ≤ 2 min | ≤ 15 min | ≤ 1h | Yes, immediately |
| **P2** | Degraded — feature broken or > 10% error rate | ≤ 5 min | ≤ 1h | ≤ 4h | At resolution |
| **P3** | Minor — non-critical bug, cosmetic regression | Daily digest | Next business day | ≤ 1 week | Weekly summary |

Severity is set by the responder, not the alert source. Escalation is one-way unless evidence proves otherwise.

---

## 2. Response Workflow

```
DETECT → ALERT → ACK → TRIAGE → MITIGATE → RESOLVE → POST-MORTEM → LESSON
```

1. **Acknowledge** within target. Single owner takes the page.
2. **Triage**: severity confirmed, scope identified, comms channel opened (Telegram thread + status page if external).
3. **Mitigate first**: rollback / feature-flag-off / scale up / failover. Restore service before debugging.
4. **Resolve**: confirm metrics back to baseline for ≥ 15 min before declaring resolved.
5. **Post-mortem**: blameless, written within 7 days.
6. **Lesson**: append to `agents/lessons-learned.md`.

---

## 3. Runbooks (per failure class)

### 3.1 Database connection failure
1. Check DB endpoint health (provider status page + direct probe).
2. Check connection pool stats and active connections.
3. Bounce app instances if pool exhausted; investigate leak after restore.
4. If DB is down: failover to replica or activate read-only mode.
5. Notify users of read-only state via banner if customer-facing.

### 3.2 Worker crash
1. Check heartbeat file (NF `night_factory_heartbeat`).
2. Inspect last 200 log lines for exception.
3. Run `reclaim_expired_leases()` to free held tasks.
4. Restart worker; monitor memory growth for first 15 min.
5. If repeats: capture core dump, snapshot env, isolate.

### 3.3 API rate limit hit
1. Identify the provider + the route caller.
2. Engage circuit breaker (NF `agent-routing.json` `circuit_breakers`) — route freezes for cooldown.
3. Re-route to the next-priority provider if business-critical.
4. Investigate the call pattern: usage spike vs leak vs runaway loop.

### 3.4 Deploy rollback
1. Confirm canary metric crossed threshold (error +0.5%, latency +10%, probe fail × 3).
2. One-command rollback (per `agents/06-devops-agent.md`).
3. Verify metrics return to baseline.
4. Open post-mortem before re-attempting deploy.

### 3.5 Data corruption
1. Stop writes immediately (read-only flag).
2. Snapshot current state; isolate affected rows / files.
3. Identify the write path; review code/changes in last 24h.
4. Restore from the latest known-good backup to a parallel env.
5. Reconcile delta with caller-facing record; re-apply legitimate writes.
6. Resume writes only after a code fix is deployed.

### 3.6 Queue saturation (NF runbook)
1. `SELECT pending_count('m2_factory')` / `pending_count('codex')`.
2. Scale poller count temporarily.
3. Pause non-critical background jobs.
4. Only increase parallel workers after RAM headroom check (M2 > 1.5GB free).

### 3.7 DLQ storm (NF runbook)
1. Monitor `agent_task_dlq` insert rate.
2. Inspect most recent `last_error` distribution.
3. Pause auto-claim for 5xx/invalid-payload bursts.
4. Root-cause fix → manual re-queue → restart pollers.

### 3.8 Supabase outage (NF runbook)
1. Stop poller loops gracefully via stop-flag file.
2. Preserve pending task payloads — no local state mutations.
3. On recovery: restart cron reaper and pollers, one task at a time, watch 5xx backoff.

---

## 4. Comms Templates

### External status page (P1)
> We are aware of an issue affecting <feature>. Our team is investigating. Updates every 15 min.
> Updated <UTC>: identified root cause, mitigation in progress.
> Updated <UTC>: mitigation deployed, monitoring.
> Resolved <UTC>: service fully restored. Post-mortem to follow.

### Internal Telegram channel (P1/P2)
- `[P1 OPEN]` opening message — owner, scope, ETA.
- Updates every 15 min minimum.
- `[P1 RESOLVED]` closing message — duration, mitigation summary, post-mortem link.

---

## 5. Post-Mortem Template

`agents/ops365/post-mortems/YYYY-MM-DD-<slug>.md`:

```
# Post-Mortem — <one-line title>

## Severity
P1 / P2 / P3

## Timeline (UTC)
- T+00:00  Detection (alert fired)
- T+00:02  Acknowledged
- T+00:08  Triage complete; severity set P1
- T+00:18  Mitigation: feature flag X flipped off
- T+00:45  Service restored; monitoring
- T+01:15  Resolved; comms closed

## Impact
- Users affected: <number / region>
- Duration: <hh:mm>
- Revenue / SLA impact: <number>
- Data integrity: <ok | reconciled | open>

## Root Cause
<one sentence; not a symptom>

## Why now (5 Whys)
1. Why did the alert fire? …
2. Why did the underlying error occur? …
3. Why was it not caught earlier? …
4. Why did the safeguard fail? …
5. Why is the safeguard the only line of defence? …

## What went well
- …

## What went badly
- …

## Prevention
- Code change: …
- CI guard: …
- Runbook update: …
- Lesson logged: lessons-learned.md row <id>

## Action items (with owners and due dates)
- [ ] …
```

Blameless rule: name agents, not humans. Lessons name the failure class.

---

## 6. Drill Cadence

Quarterly tabletop drill per runbook. Doc the runtime, what surprised the team, and what the runbook missed. Each drill produces a one-line lesson minimum.

---

## 7. Incident Agent Self-Check

- [ ] Severity correctly set
- [ ] ACK time within target
- [ ] Comms opened with users (if customer-facing)
- [ ] Mitigation chosen before debug
- [ ] Resolution criteria met (≥ 15 min at baseline)
- [ ] Post-mortem written within 7 days
- [ ] Lesson logged
- [ ] Runbook updated or new one created
