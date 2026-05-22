# 07 — Self-Learning System

> The agents only stay correct if they LEARN from every failure.
> This file describes the mechanism. `agents/lessons-learned.md` is the data.

---

## Principle

Every BLOCK, every production bug, every failed test, every flaky test is a signal.
If we don't capture it, we will repeat it.
The training files in `agents/` are not static — they are amended every time a new failure mode appears.

---

## Triggers — when to log a lesson

| Trigger | Who logs | When |
|---|---|---|
| Design Architect BLOCK on a PR | Builder | Same day |
| Reviewer BLOCK on a PR | Builder | Same day |
| Security Agent BLOCK | Builder | Same day |
| Test failure that exposed a real bug | Tester | Same day |
| Production incident (any severity) | On-call | Within 24h |
| Flaky test discovered | Tester | Same day |
| Deploy rollback | DevOps | Same day |
| Cost spike / alert burst | DevOps | Within 24h |
| Code review finds repeat issue | Reviewer | Same day |

Every entry forces a training update — even if the update is "add a check to agent 03's checklist".

---

## Lesson entry format (in `agents/lessons-learned.md`)

```
## YYYY-MM-DD — <one-line title>

| Field | Value |
|---|---|
| Agent | 01 / 02 / 03 / 04 / 05 / 06 (which produced or missed it) |
| Phase | PRE-BUILD / REQUIREMENTS / BUILD / AFTER-BUILD / PRE-DEPLOY / POST-DEPLOY / OPS |
| Severity | P0 / P1 / P2 / P3 |
| Detected by | CI / Reviewer / Manual review / Production / User report |

**What failed**
<exactly what went wrong, including file:line if applicable>

**Root cause**
<the one underlying reason — not "developer didn't notice", but the missing check>

**Training update applied**
<which agent file was changed, what check was added; PR link>

**Prevents recurrence**
Y / N (only Y once the check is enforced in CI or a gate)
```

---

## Weekly retro (every Friday)

1. Run `bash agents/retro-runner.sh`
2. Read `agents/retro-summary-YYYY-MM-DD.md`
3. For each top failure pattern:
   - Does the relevant agent training file address it?
   - If yes → why didn't it catch this instance?
   - If no → add the check, link to lesson, commit
4. Update CI to enforce any new check (a check that depends on a human noticing is not a check)

---

## Monthly audit (first business day)

- Walk every agent file. For each rule:
  - Is it still true? Tech / dep / cloud has moved.
  - Has it been overruled by a more recent lesson? Reconcile.
  - Is it dead text? Remove it — noise dilutes signal.
- Walk `agents/lessons-learned.md`:
  - Lessons > 12 months old with `Prevents recurrence = Y` and no recurrence → archive
  - Lessons with `Prevents recurrence = N` → escalate

---

## How agents read lessons

- **Before any PR**: Builder runs `grep -A 20 "Agent | 02" agents/lessons-learned.md` to see prior builder failures
- **During review**: Reviewer scans `agents/lessons-learned.md` headings for patterns matching the diff
- **Before sign-off**: Design Architect scans for prior design-doc misses
- **Before deploy**: DevOps scans for prior post-deploy failures

The cost of skipping this read is repeating a failure that has a known prevention. The cost of doing it is < 5 min per phase.

---

## Categories tracked

The retro-runner script groups failures into these buckets so the trend is visible:

- `auth-bypass` — authentication or authorization holes
- `validation-bypass` — input not parsed by Zod, `as any`, etc.
- `data-loss` — silent message drop, missing persistence
- `info-disclosure` — error envelope leaks internals, PII in logs
- `decorative-ui` — button without handler, confirm dialog
- `perf-regression` — N+1, missing index, unbounded list
- `a11y-regression` — missing label, click handler on non-interactive element
- `deploy-failure` — failed migration, missed env var, rollback
- `flaky-test` — non-deterministic test
- `cost-spike` — runaway cloud bill, infinite retry, log volume

The script counts each category over the trailing 30 days.

---

## When the system is working

- New failure modes appear, get logged, get a check, never recur.
- Recurring failure modes drop to zero within 30 days of the lesson being logged.
- The `agents/` files grow over time but no rule contradicts another.
- Builders read fewer reviewer BLOCKs because the rules are internalised.
- The CI gate count grows; the manual review burden shrinks.

## When it is NOT working

- Same failure recurs 3+ times in `agents/lessons-learned.md` → the check is missing or unenforced. Escalate.
- Rules contradict each other → monthly audit was skipped. Catch up.
- No lessons logged in 30 days → either nothing failed (unlikely) or no one's logging. Investigate.
