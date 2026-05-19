/**
 * Collapsed-sidebar visual-regression — a SECOND, independent baseline.
 *
 * The design lock freezes the EXPANDED layout (proved by wiring-regression
 * at 0.00%). Collapsing the sidebar is a NEW, opt-in UI state, so it gets its
 * own baseline set in tests/.vr-baseline/collapsed/ and is diffed only against
 * itself — never against the locked expanded screenshots.
 *
 *   first run (VR_BASELINE=1): capture each sidebar page collapsed
 *   later runs: diff current collapsed render vs that baseline (<=2% page)
 *
 * Pre-seeds localStorage so the app boots already collapsed (proves the
 * persisted-preference path too).
 */
import { test, expect } from "@playwright/test";
import { readFileSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { PNG } from "pngjs";
import pixelmatch from "pixelmatch";

const HERE = dirname(fileURLToPath(import.meta.url));
const BASE = resolve(HERE, ".vr-baseline", "collapsed");
if (!existsSync(BASE)) mkdirSync(BASE, { recursive: true });
const CAPTURE = process.env.VR_BASELINE === "1";

// 14 pages that carry the primary nav sidebar (01-signin / 16-spec have none).
const PAGES = [
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
];

function diffRatio(a: PNG, b: PNG): number {
  const w = Math.min(a.width, b.width);
  const h = Math.min(a.height, b.height);
  const da = a.width === w ? a.data : PNG.sync.read(PNG.sync.write(a)).data;
  const db = b.width === w ? b.data : PNG.sync.read(PNG.sync.write(b)).data;
  const mismatched = pixelmatch(da, db, null, w, h, { threshold: 0.1 });
  return mismatched / (w * h);
}

for (const { slug, route } of PAGES) {
  test(`collapsed-vr: ${slug}`, async ({ page }) => {
    await page.addInitScript(() => {
      try {
        window.localStorage.setItem("dm.sidebarCollapsed", "1");
      } catch {
        /* ignore */
      }
    });
    await page.goto(route, { waitUntil: "networkidle" });
    await page.waitForTimeout(700); // allow collapse transition to settle

    // Behaviour assertion: the sidebar must actually be collapsed.
    const asideWidth = await page.evaluate(() => {
      const a = document.querySelector(
        'aside[class*="w-[232px]"][class*="bg-sidebar"]',
      ) as HTMLElement | null;
      return a ? Math.round(a.getBoundingClientRect().width) : -1;
    });
    expect(asideWidth, `${slug} sidebar should be collapsed (~0px)`).toBeLessThanOrEqual(8);
    const expandBtn = await page.locator(".dm-sidebar-expand").count();
    expect(expandBtn, `${slug} must offer a re-expand control`).toBeGreaterThan(0);

    const shot = await page.screenshot({ clip: { x: 0, y: 0, width: 1440, height: 900 } });
    const baselinePath = resolve(BASE, `${slug}.png`);
    if (CAPTURE) {
      writeFileSync(baselinePath, shot);
      test.info().annotations.push({ type: "vr", description: `BASELINE collapsed ${slug}` });
      return;
    }
    expect(existsSync(baselinePath), `missing collapsed baseline ${slug}.png`).toBe(true);
    const whole = diffRatio(PNG.sync.read(shot), PNG.sync.read(readFileSync(baselinePath)));
    console.log(`CVR ${slug} page=${(whole * 100).toFixed(2)}%`);
    expect(whole, `${slug} collapsed drift vs its own baseline`).toBeLessThanOrEqual(0.02);
  });
}
