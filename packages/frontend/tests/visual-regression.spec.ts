/**
 * Design-lock Layer 3 — every page pixel-diffed against the locked brief
 * baseline (brief/screenshots/<slug>.png). Budgets: ≤2% whole page;
 * ≤0.5% on brand anchors (top band ≈ logo/CTA, left band ≈ sidebar nav).
 * A missing baseline FAILS (never auto-pass).
 */
import { test, expect } from "@playwright/test";
import { readFileSync, existsSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { PNG } from "pngjs";
import pixelmatch from "pixelmatch";

const HERE = dirname(fileURLToPath(import.meta.url));
const BRIEF = resolve(HERE, "../../../brief/screenshots");
const OUT = resolve(HERE, "../.vr-out");
if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true });

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

function diffRatio(a: PNG, b: PNG, region?: { x: number; y: number; w: number; h: number }) {
  const w = Math.min(a.width, b.width);
  const h = Math.min(a.height, b.height);
  const rx = region?.x ?? 0;
  const ry = region?.y ?? 0;
  const rw = Math.min(region?.w ?? w, w - rx);
  const rh = Math.min(region?.h ?? h, h - ry);
  const crop = (src: PNG) => {
    const out = new PNG({ width: rw, height: rh });
    for (let y = 0; y < rh; y++)
      for (let x = 0; x < rw; x++) {
        const si = ((ry + y) * src.width + (rx + x)) << 2;
        const di = (y * rw + x) << 2;
        out.data[di] = src.data[si];
        out.data[di + 1] = src.data[si + 1];
        out.data[di + 2] = src.data[si + 2];
        out.data[di + 3] = src.data[si + 3];
      }
    return out;
  };
  const ca = crop(a);
  const cb = crop(b);
  const mismatched = pixelmatch(ca.data, cb.data, null, rw, rh, { threshold: 0.1 });
  return mismatched / (rw * rh);
}

for (const { slug, route } of PAGES) {
  test(`visual: ${slug}`, async ({ page }) => {
    const baselinePath = resolve(BRIEF, `${slug}.png`);
    expect(existsSync(baselinePath), `missing locked baseline ${slug}.png`).toBe(true);

    await page.goto(route, { waitUntil: "networkidle" });
    // Baselines are viewport-clipped 1440x900 — match that capture method.
    await page.waitForTimeout(600);
    const shot = await page.screenshot({
      clip: { x: 0, y: 0, width: 1440, height: 900 },
    });
    const actual = PNG.sync.read(shot);
    const baseline = PNG.sync.read(readFileSync(baselinePath));

    const whole = diffRatio(actual, baseline);
    const topBand = diffRatio(actual, baseline, { x: 0, y: 0, w: 1440, h: 64 });
    const leftBand = diffRatio(actual, baseline, { x: 0, y: 0, w: 240, h: 900 });

    const line = `VR ${slug} page=${(whole * 100).toFixed(2)}% top=${(topBand * 100).toFixed(2)}% left=${(leftBand * 100).toFixed(2)}%`;
    console.log(line);
    test.info().annotations.push({ type: "vr", description: line });

    expect(whole, `${slug} whole-page diff`).toBeLessThanOrEqual(0.02);
    expect(topBand, `${slug} logo/CTA band diff`).toBeLessThanOrEqual(0.005);
    expect(leftBand, `${slug} sidebar band diff`).toBeLessThanOrEqual(0.005);
  });
}
