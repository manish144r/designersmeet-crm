# DesignersMeet CRM — UX Optimization Round (2026-05-19)

Source: persona UX suite pre-fix run vs `https://designersmeet-preview.surge.sh`
(10,000 cases — pass 3417 / fail 395 / skip 6188). Generated 2026-05-20.

## Failure taxonomy (395 fails)

| Class | Count | Nature |
|---|---|---|
| missing-affordance | 184 | a journey-critical control (select, file-upload, destructive CTA, submit) is absent on the page |
| missing-loading-state | 157 | an action has no spinner/skeleton/`aria-busy` — silent wait |
| no-feedback | 54 | control present but no visible response in success/error state |

**Hard constraint that shapes every recommendation:** Manish's rule is *strict
0% visual drift on the locked pages* ("UI must never change"). Loading
skeletons, new `<select>`s, file-upload fields and destructive buttons are all
**new visible DOM** → they cannot be added without moving pixels, so they are
NOT behavior-only and must be approved as a `[brand-change]` design decision,
not silently shipped. The sidebar collapse was the one true behavior-only fix
(drawer state; default render byte-identical — proven 0.00%) and is **shipped**.

So this round ships 1 fix and produces a prioritized `[brand-change]` backlog.

## Scoring

`priority = severity (1-3) × user-frequency (distinct personas affected, 1-5)`.
Severity: 3 = blocks a core journey; 2 = degrades trust/clarity; 1 = polish.

## Top 20 optimizations

| # | Area | Issue | Sev | Freq | Score | Effort | Ship now? |
|---|---|---|---|---|---|---|---|
| 1 | /contacts | `secondary-cta-click` (filter/export) gives no visible feedback (22) | 3 | 5 | 15 | S | `[brand-change]` — add pressed/active + result toast |
| 2 | /contacts | `select-input` filter control absent (20) | 3 | 5 | 15 | M | `[brand-change]` — needs a real filter select (visual) |
| 3 | /settings | profile form has no email input / select / submit (20×3=60) | 3 | 4 | 12 | M | `[brand-change]` — settings form is display-only |
| 4 | /contacts | `icon-button-click` no feedback (18) | 2 | 5 | 10 | S | `[brand-change]` — hover/active + row action result |
| 5 | /dashboard | `destructive-cta-click` absent for reject/delete journeys (32) | 3 | 4 | 12 | M | Defer — journey mapping: reject lives on detail pages, not dashboard; refine suite + add reject affordance via `[brand-change]` |
| 6 | global (16 pp) | no loading affordance anywhere (`loading:N` all pages, 157 fails) | 2 | 5 | 10 | M | `[brand-change]` — add a token skeleton/spinner primitive |
| 7 | /contacts | no destructive (delete) affordance (16) | 3 | 4 | 12 | M | `[brand-change]` — delete row action + confirm modal |
| 8 | /forms | no file-upload input (8) + no submit (8) | 3 | 3 | 9 | M | `[brand-change]` — forms page is non-interactive |
| 9 | /contacts | no file-upload for import journey (8) | 2 | 4 | 8 | M | `[brand-change]` |
| 10 | /contacts | `modal-cancel` control absent (8) | 2 | 4 | 8 | S | `[brand-change]` — add Cancel to CrmModals dialogs |
| 11 | a11y /forms | 4 serious/critical axe violations | 3 | 5 | 15 | S–M | Partly behavior-only (labels/roles) — see a11y note |
| 12 | a11y /contacts,/workflows | 3 serious axe violations each | 3 | 5 | 15 | S–M | Partly behavior-only |
| 13 | a11y (9 more routes) | 1–2 serious axe violations each | 2 | 5 | 10 | S | Partly behavior-only |
| 14 | /contact-detail,/spec,/onboarding | no visible focus ring on first control | 2 | 5 | 10 | S | `[brand-change]` — focus-visible token already exists; pages override |
| 15 | /dashboard | `select-input` (date-range/report) absent (12) | 2 | 4 | 8 | S | `[brand-change]` |
| 16 | /dashboard | modal-open / primary-cta no loading (23) | 1 | 4 | 4 | S | Defer — static demo has no latency; low real-world value |
| 17 | /contacts | scroll/text-input no loading (15) | 1 | 5 | 5 | S | Defer — artifact of static demo |
| 18 | /signin | primary/secondary CTA no loading (10) | 1 | 5 | 5 | S | Defer — auth bypassed in demo |
| 19 | suite | journey→route mapping over-flags dashboard for delete/reject | 1 | 5 | 5 | S | Ship now — test-only refinement (no app/visual change) |
| 20 | /conversations,/calendar | minor missing-affordance (send/schedule) | 2 | 3 | 6 | M | `[brand-change]` |

## a11y note (the most ship-able non-sidebar work)

axe-core serious/critical violations exist on every route (1–4 each). A subset
of axe fixes are genuinely **behavior/markup-only and visually inert**
(adding `aria-label`/`role`/`for`/`name` attributes, fixing landmark
nesting). Those are the best next `[brand-change]` batch: high accessibility
value, near-zero pixel risk (attributes don't render). Recommend a dedicated
Codex pass: "add only ARIA/semantic attributes to satisfy axe; change no
class, text, or element" — then re-run wiring-regression to confirm 0.00%.

## Recommended next `[brand-change]` batches (for Manish to approve)

1. **A11y attributes-only** (items 11–13): highest value, lowest visual risk.
   Codex, attribute-only, gate at 0.00%. ~1 session.
2. **Settings + Contacts real controls** (items 2,3,7,10): the biggest
   journey-blockers; explicitly visual → needs Manish design sign-off as these
   add inputs/buttons to locked pages. ~1–2 sessions.
3. **Global loading primitive** (item 6): one token skeleton component, opt-in
   per page; ships only when real async (Render backend) is wired. Park until
   backend is live — moot on the static demo.
4. **Feedback polish** (items 1,4): pressed/active state + result toasts.

## Ship-now this cycle
- ✅ Sidebar collapse + persist (done, `[brand-change]` 519db26, 0.00% lock held).
- ✅ Suite journey-mapping refinement (item 19) — test-only, no app change.

Everything else is correctly *withheld* pending Manish's design call rather
than force-shipped through the strict visual lock (honest gap report, per the
95-pass-gate discipline).
