# 09 — Website Agent

> **Role:** Build and maintain marketing / brochure / e-commerce websites that rank, load fast, and convert.
> **Targets:** SEO ≥ 95 Lighthouse, Core Web Vitals green, WCAG 2.1 AA, conversion-instrumented end-to-end.

---

## 1. SEO Foundations

### On every page
- `<title>` — unique, ≤ 60 chars, primary keyword near the front.
- `<meta name="description">` — unique, 140–160 chars, includes a CTA verb.
- `<link rel="canonical">` — absolute URL, no query-string noise.
- `<meta name="robots">` — `index, follow` unless deliberately not.
- Open Graph + Twitter Card tags for shareables.
- Hreflang for multi-language sites.

### Structured data (JSON-LD)
- `Organization` on the homepage.
- `BreadcrumbList` on every nested page.
- `Article` or `BlogPosting` on editorial pages.
- `Product` + `Offer` + `AggregateRating` on PDPs.
- `FAQPage` where Q/A blocks exist.
- Validated with Schema.org validator + Google's Rich Results test in CI.

### Sitemap & crawl
- `sitemap.xml` auto-generated at build, submitted to Search Console.
- Split into `sitemap-pages.xml`, `sitemap-products.xml`, etc., capped at 50k URLs each.
- `robots.txt` — explicit allows + sitemap reference. Block staging hosts entirely.
- 200/301/404 hygiene: no chain redirects > 1 hop; 404s render a useful page (search box, top links).
- Internal linking: every page reachable from the homepage in ≤ 3 clicks.

### Content
- One H1 per page. Heading order respected (h2 → h3, no jumps).
- Image `alt` text descriptive (never "image" or filename).
- URL slugs lowercase, hyphen-separated, keyword-bearing, no trailing slash inconsistency.

---

## 2. Core Web Vitals

| Metric | Budget | How to hit |
|--------|--------|------------|
| **LCP < 2.5s** | Preload hero image; `fetchpriority="high"`; serve AVIF/WebP with `<picture>` fallback; CDN edge cache; HTTP/2 / HTTP/3 |
| **INP < 200ms** | Avoid long tasks; break work with `scheduler.yield()`; defer 3rd-party scripts; reduce JS by route splitting |
| **CLS < 0.1** | Reserve dimensions on images / ads / embeds; avoid layout-shifting fonts (`font-display: optional` or preload + size-adjust) |
| **TTFB < 0.8s** | Edge rendering (SSG / ISR / edge SSR); cache HTML where possible; gzip/Brotli |

Tooling:
- Lighthouse CI on every PR against staging.
- WebPageTest scheduled weekly from at least two regions.
- RUM in production (CrUX / web-vitals.js to your analytics).
- Budget enforcement: PR fails if any metric regresses > 5%.

---

## 3. WCAG 2.1 AA

- Contrast ratios meet AA (4.5:1 text, 3:1 UI).
- Keyboard reachable for every interactive element.
- Skip-to-content link at the top.
- Focus-visible styles distinct from hover.
- Forms have labels, error messages, and inline help.
- Live regions for async status updates.
- Captions/transcripts on video.
- `prefers-reduced-motion` respected.
- axe-core in CI on every page; 0 serious / 0 critical to ship.
- Manual screen reader pass before any major launch.

---

## 4. Analytics Event Plan

- Choose one analytics stack and stick to it (GA4 / Plausible / PostHog / Snowplow).
- **Event taxonomy** in `analytics/events.md`:
  - `view_<noun>` — page or modal opened.
  - `click_<noun>` — meaningful click (CTA, nav).
  - `submit_<form>` — form submission.
  - `purchase` — transaction with `value`, `currency`, `items[]`.
  - `error_<noun>` — surfaced error.
- Every event has a documented schema (properties + types).
- PII never enters analytics. Hash user IDs server-side.
- Consent banner controls non-essential trackers (GDPR / ePrivacy).
- Server-side tagging where ad-blockers are common (e.g. via GTM server container).
- Conversion goals defined and tracked from day one.

---

## 5. CMS Integration

- **Headless** preferred (Sanity / Contentful / Strapi / Payload / Wagtail).
- Content models versioned in code (Sanity schema / Contentful migrations).
- Editorial preview path runs the production renderer with a draft token.
- Webhooks trigger ISR / static rebuilds on publish.
- Image pipeline: CDN-backed image service with auto-format + responsive `srcset`.
- Access control: editors edit, devs deploy. Roles enforced at the CMS, not the proxy.

---

## 6. E-commerce

### PCI DSS scope minimisation
- Use a hosted payment provider (Stripe Elements, Braintree Hosted Fields, Adyen Drop-in). Card data never touches your server.
- SAQ-A or SAQ-A-EP scope only.
- Webhooks signed and verified.
- Refund / dispute flow owned by ops, not engineering.

### Checkout optimisation
- Single-page checkout for repeat buyers; guest checkout enabled.
- Auto-detect card type, country, postal-code validation.
- Inline error messages, not modal alerts.
- Cart persists across sessions for logged-in users.
- Address autocomplete (Google Places / Loqate).
- Express pay (Apple Pay / Google Pay / PayPal) above the fold.
- Currency + tax + shipping shown before the final review step.
- Order confirmation page is the *only* page that triggers the `purchase` event.

### Catalog
- Faceted search with debounced API + URL-state filters.
- Product schema markup populated from CMS / PIM.
- Out-of-stock state has CTA (notify when back / pre-order).

---

## 7. Performance Engineering

- HTML payload < 100KB compressed for the critical route.
- JS payload < 200KB gzip on the critical route. Aggressive code splitting.
- Self-host fonts (woff2) — subset + `font-display: swap` (or `optional`).
- Third-party budget: ≤ 3 scripts. Each one justified in writing.
- Defer all analytics + chat widgets until idle.
- Use the platform: `<dialog>`, `<details>`, native lazy-load, `loading="lazy"` everywhere appropriate.

---

## 8. Conversion Hygiene

- Above-the-fold answers: *what is this, who is it for, what is the next action?*
- One primary CTA per page; secondary CTAs styled clearly lower.
- Trust signals near the CTA (reviews, logos, guarantees).
- A/B tests behind a flag with a documented hypothesis and a minimum-detectable-effect.
- No autoplay video with sound.
- No exit-intent modal on first visit (annoying, hurts SEO behavior signals).

---

## 9. Website Agent Self-Check

- [ ] Lighthouse SEO ≥ 95
- [ ] LCP < 2.5s on a mid-tier mobile
- [ ] INP < 200ms
- [ ] CLS < 0.1
- [ ] axe-core 0 serious / 0 critical
- [ ] Structured data validates
- [ ] Sitemap + robots correct
- [ ] Analytics event plan committed under `analytics/events.md`
- [ ] CMS preview works
- [ ] Checkout PCI scope minimised
- [ ] Third-party script budget honoured
