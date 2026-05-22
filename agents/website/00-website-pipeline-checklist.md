# 00 — Website Pipeline Master Checklist
> Designer-led, developer-built, performance- and SEO-gated. Binary pass/fail every phase.
> Roles named per row: **D** = Designer, **C** = Coder, **R** = Reviewer (Design QA), **O** = Ops.

---

## Phase 0 — DISCOVERY

| # | Check | Owner | Pass = |
|---|-------|-------|--------|
| 0.1 | Brand brief signed | D | Single PDF/MD covering purpose, audience, voice, do-nots |
| 0.2 | Target audience defined (≥1 primary persona) | D | Demographic + psychographic + jobs-to-be-done |
| 0.3 | Content strategy mapped | D | Page inventory (URL × purpose × CTA) |
| 0.4 | SEO brief produced | D+C | Primary keyword per page + intent + SERP analysis |
| 0.5 | Competitor analysis filed | D | Top 5 competitors, screenshots, what to copy / avoid |
| 0.6 | Success metric numeric | O | e.g. organic sessions × 3 in 90 days, conv ≥ 2.5% |
| 0.7 | Tech stack chosen | C | Static (Astro/Next SSG) vs CMS-driven; CDN; hosting |
| 0.8 | Repo + worktree created | C | `using-git-worktrees` skill |
| 0.9 | Pipeline log opened | O | `WEBSITE_PIPELINE_LOG.md` |

Exit gate: every row green or DISCOVERY halts.

---

## Phase 1 — DESIGN (designer-owned)

| # | Check | Owner | Pass = |
|---|-------|-------|--------|
| 1.1 | Wireframes (lo-fi) signed | D | One per unique page template, content-first |
| 1.2 | Hi-fi mockups at 4 frames | D | 320 / 768 / 1280 / 1920 |
| 1.3 | Design system v1 | D | Tokens (color/type/space/radius/shadow), components, motion principles |
| 1.4 | Prototype clickable | D | Figma prototype or equivalent walks the primary journey |
| 1.5 | Accessibility check | D | Contrast AA, focus order, no colour-only signals |
| 1.6 | Empty / error / loading states designed | D | Every async surface has all four states |
| 1.7 | Handoff spec written | D | Every component annotated (spacing, font, token, interaction, motion) |
| 1.8 | Design review | R | Sign-off comment + commit SHA on the spec |

Exit gate: design system + mockups + handoff spec all committed under `brief/` and frozen.

---

## Phase 2 — BUILD (developer-owned)

| # | Check | Owner | Pass = |
|---|-------|-------|--------|
| 2.1 | Tokens imported as CSS custom properties | C | Generated from `brief/tokens.json` |
| 2.2 | No hardcoded hex / px | C | Lint rule `no-raw-color` + `no-magic-numbers` green |
| 2.3 | Components match handoff 1:1 | C | Visual regression ≤ 2% drift |
| 2.4 | Responsive at every frame | C | Playwright snapshot at 320 / 768 / 1280 / 1920 |
| 2.5 | Cross-browser matrix | C | Chrome / Firefox / Safari / Edge — latest + iOS Safari |
| 2.6 | Core Web Vitals gate | C | LCP < 2.5s, INP < 200ms, CLS < 0.1 on mid-tier mobile |
| 2.7 | a11y axe-core | C | 0 serious / 0 critical |
| 2.8 | Semantic HTML | C | One H1/page, heading order, landmarks present |
| 2.9 | Forms validated client+server | C | Inline errors, `aria-describedby` |
| 2.10 | Design QA pass | R | Designer comments `APPROVE` in the PR |

Exit gate: visual regression green, CWV green, designer sign-off in PR.

---

## Phase 3 — CONTENT

| # | Check | Owner | Pass = |
|---|-------|-------|--------|
| 3.1 | CMS set up | C | Schema versioned in code (Sanity/Contentful/Payload migrations) |
| 3.2 | Editor roles configured | O | Editors edit, devs deploy; least privilege |
| 3.3 | Content entered for every page | D+O | No `lorem ipsum` ships |
| 3.4 | SEO copy per page | D | Title ≤ 60ch unique, meta ≤ 160ch unique, H1 unique |
| 3.5 | Structured data | C | JSON-LD validates (Schema.org + Rich Results test) |
| 3.6 | Internal linking | D | Every page reachable in ≤ 3 clicks from home |
| 3.7 | Image alt text | D | Descriptive (never filename / "image") |

Exit gate: lighthouse SEO ≥ 95 on every page.

---

## Phase 4 — LAUNCH

| # | Check | Owner | Pass = |
|---|-------|-------|--------|
| 4.1 | DNS records configured | O | A/AAAA/CNAME + apex + www, TTL ≤ 300 |
| 4.2 | SSL valid | O | TLS 1.2+, HSTS preload, A+ on SSL Labs |
| 4.3 | Redirects from old URLs | O | 301 map filed; chain length ≤ 1 |
| 4.4 | sitemap.xml present + submitted | O | Search Console + Bing Webmaster |
| 4.5 | robots.txt correct | O | Staging blocked entirely; prod allows + sitemap line |
| 4.6 | Analytics live | O | First event recorded within 24h |
| 4.7 | Custom 404 + 500 pages | C | Useful (search + top links) |
| 4.8 | Consent banner | C | GDPR/ePrivacy compliant, non-essential default off |
| 4.9 | Security headers | C | HSTS, CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy |
| 4.10 | Backup + rollback rehearsed | O | One-command revert documented |

Exit gate: dual sign-off (D + O) + smoke test passes on production URL.

---

## Phase 5 — POST-LAUNCH (first 30 days)

| # | Check | Cadence | Pass = |
|---|-------|---------|--------|
| 5.1 | CWV via CrUX / RUM | Daily | All three thresholds green for 75th percentile |
| 5.2 | SEO rank tracking | Weekly | Keyword positions logged; no surprise drops |
| 5.3 | Conversion tracking | Daily | Goals firing; funnel drop-offs identified |
| 5.4 | Uptime | 24/7 | ≥ 99.9% |
| 5.5 | A/B test framework wired | Once | One hypothesis + MDE running by week 2 |
| 5.6 | Lessons-learned entries | Per incident | See `../07-self-learning-system.md` |
| 5.7 | Cost vs forecast | Weekly | Within ± 15% |

---

## CI Gates (branch protection on `main`)

- `ci/lint` (raw-color, magic-number)
- `ci/typecheck`
- `ci/build`
- `ci/lighthouse` (Perf ≥ 90, SEO ≥ 95, a11y ≥ 95, Best Practices ≥ 95)
- `ci/visual-regression` (≤ 2% drift)
- `ci/a11y` (0 serious / 0 critical)
- `ci/links` (no broken)
- `ci/structured-data`
- Designer sign-off label
