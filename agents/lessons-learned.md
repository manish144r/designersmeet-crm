# Lessons Learned

> Append-only log of every BLOCK, every production bug, every test failure that exposed a real issue.
> Format defined in `agents/07-self-learning-system.md`.
> Newest entry on top.

---

## 2026-05-19 — `prompt()` dialog used in confirm flow

| Field | Value |
|---|---|
| Agent | 02 (Builder) |
| Phase | BUILD |
| Severity | P1 |
| Detected by | Manual review of mockup-vs-implementation diff |

**What failed**
Builder used `window.prompt()` to confirm a destructive action in a freelancer-management flow. The mockup specified a modal with focus trap, Cancel and Confirm buttons, and Escape-to-close. `prompt()` is unstylable, not keyboard-trapped beyond the OS dialog, not accessible to most screen readers, and untestable with Playwright without `page.on('dialog')` boilerplate that masks the real UX.

**Root cause**
No explicit rule in builder training that forbids `window.prompt` / `window.confirm` / `window.alert`. The design doc said "confirm dialog" without naming the implementation. Builder defaulted to the lowest-effort option.

**Training update applied**
- `agents/02-builder-agent.md` — added rule "No browser dialogs (real failure pattern from crm-app)".
- `agents/03-reviewer-agent.md` — added Browser dialog check.
- `agents/01-design-architect-agent.md` — Section 4 of design doc must name the modal component class.
- ESLint rule `no-restricted-globals: [alert, confirm, prompt]` added to config.

**Prevents recurrence**
Y — ESLint blocks at the PR check stage.

---

## 2026-05-12 — Decorative buttons committed across 8 pages

| Field | Value |
|---|---|
| Agent | 02 (Builder) |
| Phase | BUILD |
| Severity | P1 |
| Detected by | `scripts/decorative-census.mjs` run after the fact |

**What failed**
Builder shipped 47 buttons across 8 pages with no `onClick`, no `href`, no `to=`. Visually they looked enabled; users clicked them and nothing happened. The mockup-to-implementation conversion preserved the visual but not the wiring.

**Root cause**
No automated check that distinguished WIRED vs DECORATIVE elements. The decorative-element census script existed but was not part of CI.

**Training update applied**
- `agents/02-builder-agent.md` — added "No decorative elements" section; Builder runs `decorative-census.mjs` before push.
- `agents/03-reviewer-agent.md` — added Decorative element check to PR review checklist.
- `agents/06-devops-agent.md` — added `node scripts/decorative-census.mjs` to required PR checks; fails CI when DECORATIVE > 0 on changed files.

**Prevents recurrence**
Y — CI fails the PR.

---

## 2026-05-06 — `req.body as { freelancer_id?: string }` bypasses Zod validation

| Field | Value |
|---|---|
| Agent | 02 (Builder) + 03 (Reviewer) |
| Phase | BUILD |
| Severity | P0 |
| Detected by | Pass-1 Security Auditor (multi-LLM review pipeline) at `orders.ts:73` |

**What failed**
`orders.ts:73` did `const { freelancer_id } = req.body as { freelancer_id?: string }`. The TypeScript `as` cast satisfied the compiler but the runtime payload was never validated. An attacker could inject extra fields, wrong types, or send `freelancer_id` as an object instead of a UUID string. Caught by the security pass — would have shipped otherwise.

**Root cause**
No TypeScript rule against `as` on `req.body`. Reviewer missed it because the line type-checked cleanly. The design doc named Zod as the validation library but didn't say "Zod is mandatory on every input".

**Training update applied**
- `agents/02-builder-agent.md` — "Validation: Zod first, always" section made explicit, with the exact crm-app example as the anti-pattern.
- `agents/03-reviewer-agent.md` — Type safety check added; Reviewer greps the diff for `as { ` on `req.body` / `req.query` / `req.params`.
- `agents/05-security-agent.md` — A03 Injection check expanded to include type-assertion-bypassing-validation.
- Semgrep rule added: `pattern: req.body as ...` → BLOCK.

**Prevents recurrence**
Y — Semgrep fails the PR; Reviewer rule reinforces.

---

<!--
APPEND NEW LESSONS ABOVE THIS LINE.
Use the format documented in agents/07-self-learning-system.md.
-->
