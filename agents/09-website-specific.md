# 09 — Website-Specific Training

> Add-on to agents 01–06 for marketing sites, content sites, e-commerce storefronts,
> and any browser-first product. When building a website, this file's checks are
> appended to the master checklist (agent 00).

---

## SEO

### Design (Architect, agent 01)
- URL structure: `/<topic>/<slug>` — lower-case, hyphenated, no query strings for canonical pages
- Canonical URL strategy: one canonical per piece of content; pagination uses `rel="next"`/`rel="prev"`
- Internal linking plan: every page is ≤ 3 clicks from the home page
- 301 redirect plan for any URL change

### Build (Builder, agent 02)
- `<title>` unique per page, ≤ 60 chars, primary keyword early
- `<meta name="description">` unique per page, 140–160 chars
- One `<h1>` per page; semantic heading hierarchy without skipping levels
- `<link rel="canonical" href="…">` on every indexable page
- Open Graph + Twitter Card meta tags on every shareable page
- Structured data (schema.org JSON-LD): `Organization`, `WebSite`, `BreadcrumbList`, `Article` / `Product` / `FAQ` as applicable
- `sitemap.xml` generated at build time; submitted to Search Console
- `robots.txt` references sitemap; allows / disallows explicit
- `hreflang` tags if multi-locale
- No `noindex` on production unless intentional (and tested)

### Test (Tester, agent 04)
- Google Rich Results Test passes for every structured-data type
- Screaming Frog OR `linkinator` scan: 0 broken internal links
- Mobile-Friendly Test passes
- `meta description` and `title` length asserted in CI per template

---

## Performance

### Design (Architect, agent 01)
- Page load budget: LCP < 2.5s on slow 4G
- Interaction budget: INP < 200ms
- Visual stability budget: CLS < 0.1
- Bundle budget per route documented (e.g., home < 150KB gz)
- Image strategy: WebP/AVIF, responsive `srcset`, `loading="lazy"` below the fold
- Font strategy: `font-display: swap`, preload critical fonts, system fallback that limits CLS

### Build (Builder, agent 02)
- Static generation (SSG) for content pages — no SSR unless personalised
- Critical CSS inlined in `<head>` for above-the-fold content
- JS deferred / async — no render-blocking scripts
- Images:
  - Modern format (WebP / AVIF with JPEG / PNG fallback)
  - Responsive `srcset` + `sizes`
  - Explicit `width` + `height` to prevent CLS
  - `loading="lazy"` for below-the-fold
  - `decoding="async"`
- Fonts:
  - Subset to characters used
  - `font-display: swap`
  - `<link rel="preload" as="font" crossorigin>` for critical
- Third-party scripts behind consent (no GA / FB Pixel before opt-in)
- Self-host third-party fonts and small libs where licence permits

### Test (Tester, agent 04)
- Lighthouse CI gates: perf ≥ 90, a11y ≥ 95, best-practices ≥ 95, SEO ≥ 95
- Field data via Chrome UX Report (CrUX) reviewed monthly
- WebPageTest run on key pages monthly — compare to baseline
- Bundle analyzer report attached to PR for FE changes

---

## Accessibility (WCAG 2.1 AA — non-negotiable)

### Design (Architect, agent 01)
- Colour contrast ≥ 4.5:1 for text (3:1 for large text and UI components)
- Focus indicators visible and ≥ 3:1 contrast against background
- Form labels: visible always (placeholder is not a label)
- Error messages associated with inputs (`aria-describedby`)
- Skip-link to main content
- Page language declared (`<html lang="en-AU">`)
- Don't convey information by colour alone

### Build (Builder, agent 02)
- Semantic HTML first — `<nav>`, `<main>`, `<article>`, `<aside>`, `<footer>`
- ARIA only when semantic HTML doesn't carry the meaning
- Every interactive element keyboard reachable, focus visible, has accessible name
- Form: labelled inputs, fieldsets for groups, required marker not colour-only
- `alt` text:
  - Descriptive for content images
  - `alt=""` for decorative images
- Heading levels in source order — don't skip levels for styling
- Landmark roles unique and named when multiple of the same type
- Auto-playing media: muted by default, with controls and stop button
- Animations respect `prefers-reduced-motion`

### Test (Tester, agent 04)
- `axe-core` 0 violations of severity serious or higher
- Keyboard nav: full critical path traversed with Tab/Shift+Tab/Enter/Space/Escape
- Screen reader smoke test:
  - NVDA on Windows (Firefox + Chrome)
  - VoiceOver on macOS (Safari) and iOS (Safari)
  - TalkBack on Android (Chrome) — at least once per release
- Zoom test: 200% zoom — no horizontal scroll, no text clipped
- Reflow test: 320px width — content reflows, no horizontal scroll

---

## Analytics

### Design (Architect, agent 01)
- Privacy-first preferred (Plausible / Fathom / self-hosted Matomo) when no profiling needed
- GA4 only when funnel analysis is required AND consent is enforced
- Event taxonomy documented: event name, properties, when fired, why
- No PII in event properties

### Build (Builder, agent 02)
- Analytics loaded after consent (or self-hosted privacy-first without consent)
- `<noscript>` fallback for analytics if business requires
- 404 page tracks the broken URL to inform redirect plan

### Test (Tester, agent 04)
- Smoke test verifies event fires on the relevant action (network tab assertion)
- Privacy test: no analytics request before consent (for GA4 / FB / TikTok pixels)

---

## Content & CMS

### Design (Architect, agent 01)
- CMS choice ADR'd (headless: Sanity / Contentful / Strapi vs WordPress vs file-based)
- Editorial workflow: draft → review → publish → archive
- Preview deployments per content change (Vercel / Netlify preview branch)
- Content model: every field typed, validated, with editor guidance text
- Localisation strategy if multi-language: source language + translation memory

### Build (Builder, agent 02)
- ISR / on-demand revalidation for content updates (no full rebuild for one page change)
- Image transforms via CMS or CDN (Cloudinary / Imgix / next/image)
- Rich text rendered via a sanitised renderer — never raw HTML insertion
- 404 page styled, useful (search box, popular pages)
- 500 page styled, useful (status link, contact)

---

## E-commerce specifics

### Design (Architect, agent 01)
- PCI DSS scope: prefer hosted checkout (Stripe / Shopify / Adyen) to keep scope at SAQ-A
- Cart / checkout state survives reload — stored server-side under session
- Inventory sync strategy with source-of-truth ERP / Shopify
- Refund / cancellation workflow documented
- Tax calculation: who handles (you / payment provider / tax service)
- Shipping zones, rates, ETA matrix documented

### Build (Builder, agent 02)
- Checkout: 1-page or stepped, but always show progress
- Cart abandonment: cookie / token survives 30 days, server-side cart restore
- Idempotent order create — `Idempotency-Key` header for retries
- Inventory check at checkout (not just add-to-cart) to avoid overselling
- Payment failure UX: clear error, no card number echoed, no PCI in logs

### Test (Tester, agent 04)
- Full checkout E2E test with payment provider's test cards
- Cart restoration test (close tab, reopen, cart still there)
- Out-of-stock at checkout test (race between two buyers)
- Refund flow test (admin path)

### Security (agent 05)
- HTTPS-only on payment routes; HSTS preloaded
- PCI DSS scope minimised: tokens only, no PAN in app
- Webhook signature verification on every payment-provider callback
- Receipt / order data encrypted at rest if it contains addresses
- GDPR: customer data export + delete endpoint (account deletion)

---

## Cross-browser matrix (every website release)

- Chromium: Chrome stable, Edge stable
- Firefox stable
- WebKit: Safari macOS stable, Safari iOS stable
- Latest + latest-1 of each
- Mobile Safari on the smallest iPhone the analytics still shows

If you don't have analytics yet, use Statcounter's global market share as a default.

---

## Pre-launch checklist (one-pager)

- [ ] SEO: title, description, OG, canonical, sitemap, robots, structured data
- [ ] Perf: Lighthouse score gates met
- [ ] A11y: axe 0 violations + keyboard pass + screen reader smoke
- [ ] Analytics: events firing, consent enforced
- [ ] Security: HTTPS, HSTS, CSP, headers per agent 05
- [ ] Content: 404 + 500 pages, legal pages (Privacy / Terms / Cookies / Refunds)
- [ ] Monitoring: real-user metrics, error tracking, uptime check
- [ ] Cross-browser smoke pass
- [ ] DNS / CDN / SSL verified
- [ ] Rollback plan documented
