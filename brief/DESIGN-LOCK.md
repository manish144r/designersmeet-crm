# DesignersMeet — Design Lock

The DesignersMeet visual identity is locked behind **four independent enforcement
layers**. The brief mockups in `brief/mockups/*.html` are the single source of
truth; the tokens below are derived from them and may not be changed casually.

Canonical anchors (verified everywhere):

| Token   | Value     |
|---------|-----------|
| bg      | `#FFFFFF` |
| primary | `#4F46E5` (Indigo 600) |
| sidebar | `#FAFAFA` |
| text    | `#0F172A` |
| font    | Inter     |

---

## Layer 1 — Single source of truth (Style Dictionary)

`brief/tokens.json` (W3C Design Tokens / DTCG format) is the only place colour,
radius, shadow and font values are authored. `brief/style-dictionary.config.js`
compiles it into two generated, locked artifacts:

- `packages/frontend/src/styles/tokens.css` — CSS custom properties (`--color-*`)
- `packages/frontend/tailwind.tokens.ts` — typed Tailwind theme fragment

Regenerate: `npm run tokens` (also runs automatically inside `npm run build`).
`packages/frontend/tailwind.config.ts` imports the generated fragment and never
hand-codes a colour. No component may invent a colour — it can only consume a
token class (`bg-primary`, `text-foreground`, …) or a `var(--color-*)`.

## Layer 2 — Visual regression

Every page is screenshotted at 1440×900 in Storybook and pixel-diffed against
`brief/screenshots/<slug>.png`. Budget: ≤2% per page, ≤0.5% on the primary CTA,
sidebar nav and logo bands. CI: `.github/workflows/visual-regression.yml`.

## Layer 3 — Colour-guard lint

`packages/frontend/eslint.config.js` ships a custom `dm/no-raw-color` rule that
fails on any inline hex/rgb/hsl literal in `src/**/*.{ts,tsx}`.
`scripts/check-no-raw-color.mjs` does the same for `src/**/*.css` (ESLint cannot
parse CSS). Both run from `npm run lint`, which gates `npm run build` and CI.
The only file allowed to contain hex is the generated `tokens.css` (ignored).

## Layer 4 — Brand-change git gate

`.husky/commit-msg` runs `scripts/brand-lock-check.mjs`: any commit that stages a
path listed in `brief/locked-files.json` is **rejected** unless the commit
message contains the override token `[brand-change]`. `.husky/pre-commit`
additionally fails the commit on token drift or a colour-guard violation.

Activate the hooks in a fresh clone/worktree:

```
git config core.hooksPath .husky
```

Locked paths: see `brief/locked-files.json` → `locked[]`
(mockups, tokens.json/.css, spec.md, generators, screenshots,
style-dictionary.config.js, tailwind.config.ts, tailwind.tokens.ts,
src/styles/tokens.css, eslint.config.js).

---

## Changing the brand (the sanctioned path)

1. Edit `brief/tokens.json` (or a mockup, with intent).
2. `npm run tokens` to regenerate the CSS + Tailwind fragment.
3. Refresh visual-regression baselines if the change is intentional.
4. Commit with `[brand-change]` in the message so the gate allows it.

Anything else is a bug, not a brand decision.
