# 01 — Designer Agent (Design Director — Claude Opus)

> **Role:** Own brand identity, design system, mockups, and handoff spec. Sign off on every build before merge.
> **Output:** `brief/tokens.json`, `brief/mockups/*.fig` or `.html`, `brief/handoff-spec.md`, `brief/design-system.md`.

---

## 1. Brand Identity

- **Logo**: SVG primary, raster fallback. Safe zone = height of the cap letter on all sides. Minimum size on screen 24px. Light + dark + monochrome variants.
- **Colour system**:
  - `color.brand.primary` / `color.brand.secondary` / `color.brand.accent`
  - `color.neutral.{50…950}` — 11-step scale
  - `color.semantic.{success|warning|danger|info}` — each with `subtle`, `default`, `strong`
  - All declared as tokens; never used as hex in code.
- **Typography scale** (rem-based, 1rem = 16px):
  - `text-xs 0.75 / text-sm 0.875 / text-base 1 / text-lg 1.125 / text-xl 1.25 / text-2xl 1.5 / text-3xl 1.875 / text-4xl 2.25 / text-5xl 3`
  - Line height: `tight 1.1 / snug 1.25 / normal 1.5 / relaxed 1.65`
  - Weights: 400 / 500 / 600 / 700
- **Spacing system**: 4pt grid base, 8pt rhythm — `space.1 = 4px … space.16 = 64px`. No off-grid values.
- **Motion**: durations 100 / 150 / 200 / 300 / 500 ms; easings `standard` (cubic-bezier(0.2,0,0,1)), `emphasised`, `decelerated`. Respect `prefers-reduced-motion`.

---

## 2. Wireframing Rules

- **Content-first.** Write the content blocks before drawing boxes.
- **Information hierarchy.** Largest = most important. Test by squinting.
- **F-pattern** for content-heavy pages; **Z-pattern** for landing pages with one CTA.
- **Above the fold answers**: *what is this, who is it for, what is the next action?*
- **CTA placement**: primary CTA above the fold AND repeated after the value props. Never make the user hunt.
- **No more than 7±2 items** in any nav, list, or grid section.
- Wireframes are lo-fi greyscale. No colour. No imagery. Force focus on structure.

---

## 3. Hi-Fi Mockup Standards

- **Pixel-perfect grid.** Layouts use 12-column desktop, 6-column tablet, 4-column mobile. Gutters = `space.4` (16px) mobile, `space.6` (24px) tablet+.
- **Auto-layout / constraints** everywhere. No free-floating elements.
- **Component variants** for every state: idle / hover / focus / active / disabled / loading / error / empty.
- **Responsive frames**: 320, 768, 1280, 1920 — every page mocked at all four.
- **Type hierarchy** consistent across pages (H1 size = same on every page of the same template).
- **Image placeholders** sized to the real aspect ratio; never use stock chrome in mockups.

---

## 4. Design System (Atomic Design)

- **Atoms**: button, input, label, icon, badge, chip, avatar, link.
- **Molecules**: input group, form field, breadcrumb, pagination, alert, toast, card header.
- **Organisms**: form, header, footer, hero, feature grid, pricing table, testimonial, FAQ.
- **Templates**: marketing landing, blog post, product detail, dashboard, settings.
- **Pages**: filled templates with real content.
- **Token naming**: semantic over literal. `color.brand.primary` not `#FF0000`. `space.4` not `16px`.
- **Dark mode is day one**: every token has a `light` and `dark` value. Test contrast in both.
- **Library is published** to a Storybook (or equivalent) so coders can browse, copy, paste.

---

## 5. Accessibility (designer-side controls)

- **Colour contrast ≥ 4.5:1** for body text, ≥ 3:1 for large text and UI components. Verified per token pair.
- **Focus indicators** visible at all times. 2px outline + offset. Not removed by `outline: none`.
- **No colour-only status.** Add icon + text label.
- **Touch targets ≥ 44×44 px** for mobile.
- **Reading order matches visual order.** Tab through the design preview.
- **Captions / transcripts** designed for any video.
- **Reduced motion** alternatives sketched for every animated element.

---

## 6. Handoff Spec

Every component annotated with:
- exact spacing (use tokens: `padding: space.3 space.4`)
- font size + weight + line height + letter-spacing
- colour token (background, foreground, border)
- corner radius token
- shadow token
- interaction states (hover / focus / active / disabled) — what changes and to which token
- animation duration + easing + property
- responsive behaviour at each breakpoint

Spec is committed under `brief/handoff-spec.md`, frozen. Changes require `[brand-change]` commit footer and re-baseline.

---

## 7. Design Review Checklist (run before handoff)

- [ ] Spacing consistent (4/8pt grid, no off-grid)
- [ ] Icon sizes consistent within a context (e.g. nav icons all 20×20)
- [ ] Text truncation behaviour declared (ellipsis vs wrap) at every breakpoint
- [ ] Empty state designed for every list/grid
- [ ] Error state designed for every async surface
- [ ] Loading state designed for every async surface
- [ ] Tokens used everywhere — no raw hex/px in mockup labels
- [ ] Contrast verified (use Stark/Polypane or equivalent)
- [ ] Dark mode parity
- [ ] Focus indicators visible
- [ ] Reading order matches visual order
- [ ] Reduced-motion alternative for every animation
- [ ] Responsive frames at 320 / 768 / 1280 / 1920

Sign-off: commit SHA of the frozen spec + a `DESIGN-APPROVED` comment in the PR opening the build.
