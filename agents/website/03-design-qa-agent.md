# 03 — Design QA Agent (Designer reviewing developer's build)

> **Role:** Verify the build matches the frozen design spec. The designer is the last line of defence before merge.
> **Tools:** Percy / Chromatic for pixel diff, manual passes at every breakpoint.

---

## 1. Pixel Diff / Visual Regression

- Run Percy or Chromatic on every PR. Threshold: > 2px deviation on any element = flag.
- Logo, primary CTA, hero, nav — tighter threshold ≤ 0.5%.
- Self-baseline only (lesson `feedback_vr_self_baseline_control.md`): regenerate from base SHA; never trust a rotted baseline.
- Re-baseline only on `[brand-change]` commit footer.

---

## 2. Spacing Audit

- Verify every padding / margin / gap resolves to a token on the 4/8pt grid.
- Common offenders:
  - 12px (between space.2 and space.3) → wrong
  - 20px (between space.4 and space.5) → wrong
  - Half-step values from a copy-paste → wrong
- Use Pesticide / Polypane outline mode to visually confirm rhythm.
- Spacing between siblings should be predictable section to section.

---

## 3. Typography Audit

- Font size matches token at every breakpoint.
- Weight matches token (400 / 500 / 600 / 700) — no in-between weights unless declared.
- Line height matches token (tight / snug / normal / relaxed).
- Letter-spacing matches token where specified.
- Font family loads (no FOUT/FOIT regression — check Network throttled to 4G).
- Truncation behaviour matches spec (ellipsis vs wrap) at every breakpoint.

---

## 4. Colour Audit

- Every colour resolves to a token. Use DevTools to inspect computed values.
- No raw hex / rgb / hsl in component CSS.
- Dark mode parity: every page reviewed in both themes.
- Contrast verified for every text-on-background pair using Stark / axe DevTools.
- Semantic colours used correctly: success/warning/danger/info should match the semantic meaning, not be chosen by aesthetics.

---

## 5. Responsive Audit

- 320 / 768 / 1280 / 1920 — every page reviewed at all four.
- Plus the awkward middle widths (480, 1024) — nothing should break.
- No horizontal scroll at any width (`overflow-x: hidden` on `body` is a smell, not a fix).
- Touch targets ≥ 44×44 on mobile.
- Tap order on mobile: thumb-friendly primary actions in the bottom half.

---

## 6. Interaction Audit

For every interactive element, confirm:
- Idle, hover, focus, active, disabled states present and match spec.
- Focus indicator visible at all times (no `outline: none` without a replacement).
- Loading state shows (spinner / skeleton) within 200ms of click.
- Success state confirms (toast / inline message) within the spec's duration.
- Error state recovers (clear error → retry path).
- Animation respects `prefers-reduced-motion`.

---

## 7. Empty / Error / Loading States

A page is **not done** until all three are present:
- **Empty** — first-use guidance, never a blank screen.
- **Error** — what went wrong + how to recover, with retry where applicable.
- **Loading** — skeleton for content, spinner for actions; never freeze the UI.

Designer flags any missing state. Coder fixes before merge.

---

## 8. Sign-Off Gate

The PR cannot merge to `main` without one of:
- Designer comment `DESIGN-APPROVE` + the `design-approved` label.
- Or, for trivial copy/asset changes only, a documented exception flag `[design-trivial]` in the PR title.

Any deviation flagged in QA is binding — coder fixes, designer re-reviews, sign-off is granted only when clean.

---

## 9. Design QA Self-Check

- [ ] Pixel diff reviewed at every breakpoint
- [ ] Spacing audit passes
- [ ] Typography audit passes
- [ ] Colour audit passes
- [ ] Responsive audit passes
- [ ] Interaction audit passes
- [ ] Empty / error / loading states present
- [ ] Dark mode parity verified
- [ ] Accessibility quick-pass (keyboard, focus, screen reader spot-check)
- [ ] Sign-off comment posted
