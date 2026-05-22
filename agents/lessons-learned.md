# Lessons Learned — Running Log

> Append-only. One row per incident. Verified flips to Y after the next retro confirms the rule held.
> See `07-self-learning-system.md` for the loop.

| Date | Agent | Phase | What happened | Root cause | Rule added | Verified (Y/N) |
|------|-------|-------|---------------|------------|------------|----------------|
| 2026-05-22 | Builder | During-Build | `prompt()` dialogs used as filter stubs across multiple pages | No interaction spec in design doc, builder improvised | Rule added to `01-design-architect-agent.md` §1 / §7: every filter element must have its dropdown options listed in `brief/element-action-table.md` before build starts | Y |
| 2026-05-22 | Builder | During-Build | Decorative buttons across Settings (SSO, integrations, invite, webhooks) — no wired actions | Build agent had no wiring spec per element | Rule added to `01-design-architect-agent.md` §1: Design Architect must produce an element × action table; rule added to `02-builder-agent.md` §2: builder must match the table exactly, escalate if a row is missing | Y |
| 2026-05-22 | Builder | During-Build | TypeScript ChangeEvent union mismatch (HTMLInputElement \| HTMLSelectElement) collapsed type inference | TypeScript strict not enforced in design doc; shared Input component accepted a mixed event type | Rule added to `02-builder-agent.md` §3: Input components accept only `ChangeEvent<HTMLInputElement>`, select elements use a separate component; auto-enforce via ESLint rule `dm/no-mixed-event-types` | Y |
