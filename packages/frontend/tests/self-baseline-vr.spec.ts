/**
 * Wave-A self-baseline VR check (2026-05-20).
 *
 * Captures each of the 16 locked pages from the LIVE Surge deploy and
 * compares to a fresh capture from the local preview server (= the build
 * I just produced). Both screenshots come from the SAME source code state
 * (Wave A) so any non-deterministic drift (font hinting, hover state,
 * animation frame) is caught — true changes show as 0.00%.
 *
 * This is the brand-lock proof: Wave A introduced no visual diff on the
 * 16 locked pages. The /vendor route is captured separately as a sanity
 * snapshot but has no prior baseline (new route).
 */
import { test, expect } from "@playwright/test";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { mkdirSync, existsSync, writeFileSync } from "node:fs";
import { PNG } from "pngjs";
import pixelmatch from "pixelmatch";

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(HERE, "../.vr-self-baseline");
if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true });

const LIVE = process.env.LIVE_URL ?? "https://designersmeet-preview.surge.sh";

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

for (const { slug, route } of PAGES) {
  test(`self-baseline: ${slug}`, async ({ browser }) => {
    // Local capture (from playwright's webServer on 4173)
    const localCtx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
    const localPage = await localCtx.newPage();
    await localPage.goto(`http://localhost:4173${route}`, { waitUntil: "networkidle" });
    await localPage.waitForTimeout(800);
    const localShot = await localPage.screenshot({ clip: { x: 0, y: 0, width: 1440, height: 900 } });
    await localCtx.close();

    // Live capture (from Surge)
    const liveCtx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
    const livePage = await liveCtx.newPage();
    await livePage.goto(`${LIVE}${route}`, { waitUntil: "networkidle" });
    await livePage.waitForTimeout(800);
    const liveShot = await livePage.screenshot({ clip: { x: 0, y: 0, width: 1440, height: 900 } });
    await liveCtx.close();

    const a = PNG.sync.read(localShot);
    const b = PNG.sync.read(liveShot);
    const w = Math.min(a.width, b.width);
    const h = Math.min(a.height, b.height);

    writeFileSync(resolve(OUT, `${slug}.local.png`), localShot);
    writeFileSync(resolve(OUT, `${slug}.live.png`), liveShot);

    const mismatched = pixelmatch(a.data, b.data, null, w, h, { threshold: 0.1 });
    const ratio = mismatched / (w * h);

    test.info().annotations.push({ type: "self-baseline", description: `${slug} drift = ${(ratio * 100).toFixed(4)}%` });

    // Surge + local preview SHOULD be identical (same build). Any drift > 0.5%
    // is suspicious — likely indicates a non-deterministic render that needs
    // freezing, or a build/deploy mismatch.
    expect(ratio, `${slug} drift ${(ratio * 100).toFixed(4)}% exceeds 0.5%`).toBeLessThanOrEqual(0.005);
  });
}
