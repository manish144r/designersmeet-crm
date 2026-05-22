# 07 — Self-Learning System

> **Mandate:** Every BLOCK and every production bug becomes a written rule before it can happen twice.
> **Cadence:** Inline (per incident) → weekly retro → training update.
> **Loop:** Failure → root cause → lesson → rule → agent training file update → retro confirms the rule held.

---

## 1. The Loop

```
                            ┌──────────────────────────────────────┐
                            │  Incident / BLOCK / Sev1 detected    │
                            └────────────────┬─────────────────────┘
                                             ↓
                  ┌───────────────────────────────────────────────┐
                  │ Root-cause within 24h (5 Whys + timeline)     │
                  └────────────────┬──────────────────────────────┘
                                   ↓
                  ┌───────────────────────────────────────────────┐
                  │ Lesson logged in agents/lessons-learned.md    │
                  └────────────────┬──────────────────────────────┘
                                   ↓
                  ┌───────────────────────────────────────────────┐
                  │ Rule written into the relevant agent file     │
                  │ (01-architect, 02-builder, 03-reviewer, etc.) │
                  └────────────────┬──────────────────────────────┘
                                   ↓
                  ┌───────────────────────────────────────────────┐
                  │ Weekly retro: top patterns, file diffs, owner │
                  │ ► retro-runner.sh writes retro-summary-YYYY-… │
                  └────────────────┬──────────────────────────────┘
                                   ↓
                  ┌───────────────────────────────────────────────┐
                  │ Next sprint: rule enforced; failure repeats?  │
                  │   yes → escalate (CI guard / pre-commit hook) │
                  │   no  → archive lesson, increase confidence   │
                  └───────────────────────────────────────────────┘
```

---

## 2. Lesson Entry Format

`agents/lessons-learned.md` is an append-only table. Columns:

| Date | Agent | Phase | What happened | Root cause | Rule added | Verified (Y/N) |

Rules:
- **Date** is the date the incident was detected (ISO `YYYY-MM-DD`).
- **Agent** is the agent that should have caught it (Architect / Builder / Reviewer / Tester / Security / DevOps / Platform / Website).
- **Phase** is the master-checklist phase (PRE-BUILD / REQUIREMENTS / DURING-BUILD / AFTER-BUILD / PRE-DEPLOY / POST-DEPLOY / OPS / FUTURE).
- **What happened** is one sentence.
- **Root cause** is one sentence — not a symptom.
- **Rule added** points to the file + section that received the new rule.
- **Verified** flips to `Y` only after the next retro confirms the rule held in production.

No lesson without all six columns.

---

## 3. Trigger Events (mandatory log)

- Reviewer's `[BLOCK]` comment.
- Test that catches a bug in staging (escaped dev).
- Any rollback.
- Any Sev1 / Sev2 in prod.
- Any pre-deploy gate fail (visual regression, persona suite < 95%, security audit).
- Any pattern that the retro-runner flags as a top-3 (recurring source).
- Any time a builder improvises (lesson: 2026-05-22 prompt() filters).

Trigger events that are NOT logged are themselves a bug — call them out in retro.

---

## 4. Weekly Retro

- Run `bash agents/retro-runner.sh` every Monday 09:00 local.
- The script:
  1. Reads `agents/lessons-learned.md`.
  2. Counts failures by agent and by phase.
  3. Surfaces the top 3 recurring patterns.
  4. Writes `agents/retro-summary-YYYY-MM-DD.md`.
  5. Prints the list of agent training files that need an update.
- Retro meeting (15 min, async): assign owner per training-file update; close the loop by next retro.
- A pattern that recurs three weeks → escalate to a CI guard or pre-commit hook (move from "rule" to "machine-enforced").

---

## 5. Rule-Writing Standard

Every rule added to an agent file follows this shape:

```
**Rule R-<id>:** <one-sentence imperative>
- Why: <one-sentence root cause it prevents>
- Where it bites: <phase + agent>
- How to check: <command, test name, or grep pattern>
- Auto-enforce: <hook / lint rule / CI step that makes it impossible to skip>  (if applicable)
- Lesson source: <date in lessons-learned.md>
```

Example (from 2026-05-22 ChangeEvent issue):

```
**Rule R-014:** Input components accept only ChangeEvent<HTMLInputElement>; select elements have their own component.
- Why: union of HTMLInputElement|HTMLSelectElement collapsed type inference and broke TS strict builds.
- Where it bites: DURING-BUILD, Builder.
- How to check: grep `ChangeEvent<HTMLInputElement \| HTMLSelectElement>` should return zero matches.
- Auto-enforce: ESLint rule `dm/no-mixed-event-types` (new).
- Lesson source: lessons-learned 2026-05-22 row 3.
```

---

## 6. Escalation Ladder

| Confidence | Mechanism |
|------------|-----------|
| First incident | Lesson + rule in training file |
| Second incident | Reviewer must explicitly tick the rule in the PR checklist |
| Third incident | CI guard (lint / test / pre-commit) — failure blocks merge |
| Fourth incident | Refactor the API or architecture so the foot-gun cannot exist |

Confidence resets when the rule has been quiet for two retro cycles.

---

## 7. Owner Map

| Failure class | Lives in | Owner |
|---------------|----------|-------|
| Brief incomplete (missing element-action row, missing AC) | `01-design-architect-agent.md` | Architect |
| Builder improvised | `02-builder-agent.md` | Builder |
| Reviewer missed a class of bug | `03-reviewer-agent.md` | Reviewer |
| Test gap | `04-tester-agent.md` | Tester |
| Security gap | `05-security-agent.md` | Security |
| Deploy / rollback / IaC | `06-devops-agent.md` | DevOps |
| Platform-specific regression | `08-platform-agents.md` | Platform |
| Website regression | `09-website-agent.md` | Website |

---

## 8. What This System Is NOT

- Not blameware. Lessons name agents, not humans.
- Not a knowledge graveyard. A rule that hasn't fired in 6 months is archived to `agents/archive/`, not deleted.
- Not a substitute for thinking. New incident classes still need a human in the loop.
- Not optional. A PR that closes an incident without a lesson entry is itself a BLOCK.
