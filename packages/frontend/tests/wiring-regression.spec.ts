/**
 * Wiring-regression gate (behavior-lock proof).
 *
 * The committed brief/screenshots/* baselines are pre-existing-unusable: the
 * UNTOUCHED locked pages already diff 4-7% against them (captured from raw
 * HTML mockups without the app stylesheet — see memory codex-html-to-react).
 * So they cannot prove "wiring added no pixels".
 *
 * Instead we baseline against the page's OWN pre-wiring render:
 *   - first run (BASELINE=1): capture each route -> tests/.vr-baseline/<slug>.png
 *   - later runs: diff current render vs that baseline; ≤2% whole page,
 *     ≤0.5% on the top (logo/CTA) and left (sidebar) bands.
 * This is the exact design-lock requirement: behavior wiring must not move
 * a single pixel of the locked layout.
 */
import { test, expect } from "@playwright/test";
import { readFileSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { PNG } from "pngjs";
import pixelmatch from "pixelmatch";

const HERE = dirname(fileURLToPath(import.meta.url));
const BASE = resolve(HERE, ".vr-baseline");
if (!existsSync(BASE)) mkdirSync(BASE, { recursive: true });
const CAPTURE = process.env.VR_BASELINE === "1";

const PAGES = [
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

function diffRatio(
  a: PNG,
  b: PNG,
  region?: { x: number; y: number; w: number; h: number },
) {
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
  test(`wiring-vr: ${slug}`, async ({ page }) => {
    await page.goto(route, { waitUntil: "networkidle" });
    await page.waitForTimeout(600);
    const shot = await page.screenshot({ clip: { x: 0, y: 0, width: 1440, height: 900 } });
    const baselinePath = resolve(BASE, `${slug}.png`);

    if (CAPTURE) {
      writeFileSync(baselinePath, shot);
      test.info().annotations.push({ type: "vr", description: `BASELINE ${slug}` });
      return;
    }

    expect(existsSync(baselinePath), `missing pre-wiring baseline ${slug}.png`).toBe(true);
    const actual = PNG.sync.read(shot);
    const baseline = PNG.sync.read(readFileSync(baselinePath));
    const whole = diffRatio(actual, baseline);
    const topBand = diffRatio(actual, baseline, { x: 0, y: 0, w: 1440, h: 64 });
    const leftBand = diffRatio(actual, baseline, { x: 0, y: 0, w: 240, h: 900 });
    const line = `WVR ${slug} page=${(whole * 100).toFixed(2)}% top=${(topBand * 100).toFixed(2)}% left=${(leftBand * 100).toFixed(2)}%`;
    console.log(line);
    test.info().annotations.push({ type: "vr", description: line });
    expect(whole, `${slug} whole-page drift vs pre-wiring`).toBeLessThanOrEqual(0.02);
    expect(topBand, `${slug} top band drift`).toBeLessThanOrEqual(0.005);
    expect(leftBand, `${slug} left band drift`).toBeLessThanOrEqual(0.005);
  });
}
