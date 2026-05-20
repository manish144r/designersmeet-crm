/**
 * Wave-A base-vs-current VR proof (2026-05-20).
 *
 * Captures each of the 16 locked pages from BOTH:
 *   • the base commit's build (served at http://127.0.0.1:4174 from a
 *     separate preview server in /tmp/dm-base-0c63d4d), and
 *   • the Wave A build (served by the playwright webServer at :4173)
 * then diffs pixel-by-pixel. Expectation: 0.00% on every page, because the
 * only DOM diffs Wave A introduces are on the Settings sub-panels behind
 * the sub-nav clicks — the FIRST render at every route is byte-identical.
 *
 * The /vendor route has no base baseline (new route) — not in this spec.
 */
import { test, expect } from "@playwright/test";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { mkdirSync, existsSync, writeFileSync } from "node:fs";
import { PNG } from "pngjs";
import pixelmatch from "pixelmatch";

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(HERE, "../.vr-base-vs-wavea");
if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true });

const BASE = process.env.BASE_URL ?? "http://127.0.0.1:4174";
const WAVEA = process.env.WAVEA_URL ?? "http://127.0.0.1:4173";

const PAGES: Array<{ slug: string; route: string }> = [
  { slug: "01-signin", route: "/signin" },
  { slug: "02-onboarding", route: "/onboarding" },
  { slug: "03-dashboard", route: "/dashboard" },
  { slug: "04-contacts", route: "/contacts" },
  { slug: "05-contact-detail", route: "/contact-detail" },
  { slug: "06-vendors", route: "/vendors" },
  { slug: "07-vendor-detail", route: "/vendor-detail" },
  { slug: "08-projects-board", route: "/projects" },
  { slug: "09-project-detail", route: "/project-detail" },
  { slug: "10-pipelines", route: "/pipelines" },
  { slug: "11-calendar", route: "/calendar" },
  { slug: "12-conversations", route: "/conversations" },
  { slug: "13-workflows", route: "/workflows" },
  { slug: "14-forms", route: "/forms" },
  { slug: "15-settings", route: "/settings" },
  { slug: "16-spec-sheet", route: "/spec" },
];

const results: Array<{ slug: string; pct: number }> = [];

test.afterAll(() => {
  const md = [
    "# Wave A base-vs-wavea VR proof",
    "",
    "| Slug | Drift |",
    "| --- | ---: |",
    ...results.map((r) => `| ${r.slug} | ${(r.pct * 100).toFixed(4)}% |`),
  ].join("\n");
  writeFileSync(resolve(OUT, "summary.md"), md);
});

for (const { slug, route } of PAGES) {
  test(`base-vs-wavea: ${slug}`, async ({ browser }) => {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
    const page = await ctx.newPage();

    await page.goto(`${BASE}${route}`, { waitUntil: "networkidle" });
    await page.waitForTimeout(800);
    const baseShot = await page.screenshot({ clip: { x: 0, y: 0, width: 1440, height: 900 } });

    await page.goto(`${WAVEA}${route}`, { waitUntil: "networkidle" });
    await page.waitForTimeout(800);
    const waveaShot = await page.screenshot({ clip: { x: 0, y: 0, width: 1440, height: 900 } });
    await ctx.close();

    writeFileSync(resolve(OUT, `${slug}.base.png`), baseShot);
    writeFileSync(resolve(OUT, `${slug}.wavea.png`), waveaShot);

    const a = PNG.sync.read(baseShot);
    const b = PNG.sync.read(waveaShot);
    const w = Math.min(a.width, b.width);
    const h = Math.min(a.height, b.height);
    const mismatched = pixelmatch(a.data, b.data, null, w, h, { threshold: 0.1 });
    const ratio = mismatched / (w * h);

    results.push({ slug, pct: ratio });
    test.info().annotations.push({ type: "drift", description: `${slug} = ${(ratio * 100).toFixed(4)}%` });

    // 0.5% is generous tolerance for sub-pixel anti-aliasing on different
    // process snapshots; in practice we expect 0.00%.
    expect(ratio, `${slug} drift ${(ratio * 100).toFixed(4)}% exceeds 0.5%`).toBeLessThanOrEqual(0.005);
  });
}
