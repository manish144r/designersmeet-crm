// Exhaustive-UI-walk journey + D-DECORATIVE matrix dimension.
//
// Companion to runner.spec.ts. The persona x journey x interaction x state
// matrix tests JOURNEY completion; this spec tests EVERY clickable-looking
// element on every page (16 routes) and emits a D-DECORATIVE blocker for any
// element that:
//   - looks interactive (button / a[href] / role=button / cursor-pointer), AND
//   - is NOT wired (no onClick / href / role=button + tabindex), AND
//   - is NOT intentionally inert (no aria-disabled / data-disabled / disabled)
//
// Also runs a sub-nav coherence pass: groups of 3+ sibling cursor-pointer
// items where clicking does NOT flip data-active or change pane content.
// This is the methodology fix for the Settings sub-menu defect (Manish
// 2026-05-20 feedback_no_decorative_interactive_elements.md).
//
// Threshold split:
//   - D-DECORATIVE pass-rate ≥99% (unambiguous defects)
//   - functional journey pass-rate ≥95% (handled in runner.spec.ts)

import { test, expect, chromium, type Browser, type Page } from "@playwright/test";
import { writeFileSync, mkdirSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  probeClickableCompleteness,
  type ClickableReport,
} from "./probes/clickable-completeness.js";

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = resolve(HERE, "ux-results");
if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });

const BASE_URL = process.env.UX_BASE_URL ?? "https://designersmeet-preview.surge.sh";
const STAMP = process.env.UX_STAMP ?? "2026-05-20";
const PHASE = process.env.UX_PHASE ?? "decorative";

// All 16 routes covered by the persona matrix.
const ROUTES: string[] = [
  "/signin",
  "/onboarding",
  "/dashboard",
  "/contacts",
  "/contact-detail",
  "/vendors",
  "/vendor-detail",
  "/projects",
  "/project-detail",
  "/pipelines",
  "/calendar",
  "/conversations",
  "/workflows",
  "/forms",
  "/settings",
  "/spec",
];

async function gotoRoute(page: Page, route: string): Promise<boolean> {
  try {
    await page.goto(BASE_URL + route, { waitUntil: "domcontentloaded", timeout: 20_000 });
    await page.waitForTimeout(450);
    return true;
  } catch {
    return false;
  }
}

// Sub-nav coherence: pick groups of 3+ sibling cursor-pointer items, click
// the first non-active one, then assert one of:
//   - data-active flips on the clicked element
//   - data-active flips OFF the previously-active sibling
//   - URL changes
//   - The main heading text changes
async function subNavCoherenceCheck(
  page: Page,
  route: string,
): Promise<Array<{ route: string; group: string; reason: string }>> {
  const stuck: Array<{ route: string; group: string; reason: string }> = [];

  const groups = await page.evaluate(() => {
    const containers = Array.from(document.querySelectorAll("aside, nav, [role='navigation']"));
    const result: Array<{ id: string; n: number; firstLabel: string }> = [];
    for (let ci = 0; ci < containers.length; ci++) {
      const c = containers[ci];
      const items = Array.from(
        c.querySelectorAll<HTMLElement>('[class~="cursor-pointer"], [role="button"]'),
      ).filter((el) => el.children.length <= 5);
      const byParent = new Map<Element, HTMLElement[]>();
      for (const el of items) {
        const p = el.parentElement!;
        const arr = byParent.get(p) ?? [];
        arr.push(el);
        byParent.set(p, arr);
      }
      let gi = 0;
      for (const arr of byParent.values()) {
        if (arr.length >= 3) {
          arr.forEach((el, i) => el.setAttribute("data-uat-group", `c${ci}-g${gi}-i${i}`));
          result.push({ id: `c${ci}-g${gi}`, n: arr.length, firstLabel: arr[0].textContent?.slice(0, 30) || "" });
          gi++;
        }
      }
    }
    return result;
  });

  for (const g of groups) {
    // Re-tag groups (previous click may have navigated, stripping markers).
    if (!page.url().endsWith(route)) {
      await gotoRoute(page, route);
      await page.evaluate(() => {
        const containers = Array.from(document.querySelectorAll("aside, nav, [role='navigation']"));
        for (let ci = 0; ci < containers.length; ci++) {
          const c = containers[ci];
          const items = Array.from(
            c.querySelectorAll<HTMLElement>('[class~="cursor-pointer"], [role="button"]'),
          ).filter((el) => el.children.length <= 5);
          const byParent = new Map<Element, HTMLElement[]>();
          for (const el of items) {
            const p = el.parentElement!;
            const arr = byParent.get(p) ?? [];
            arr.push(el);
            byParent.set(p, arr);
          }
          let gi = 0;
          for (const arr of byParent.values()) {
            if (arr.length >= 3) {
              arr.forEach((el, i) => el.setAttribute("data-uat-group", `c${ci}-g${gi}-i${i}`));
              gi++;
            }
          }
        }
      });
    }

    const pre = await page.evaluate((gid) => {
      const els = Array.from(document.querySelectorAll<HTMLElement>(`[data-uat-group^="${gid}-"]`));
      const heading = document.querySelector<HTMLElement>("h1, h2")?.textContent ?? "";
      const url = window.location.href;
      return {
        active: els.findIndex((el) => el.getAttribute("data-active") === "true"),
        heading,
        url,
        n: els.length,
      };
    }, g.id);

    if (pre.n < 3) continue;

    // Sub-nav groups where ALL items are intentionally inert (data-disabled)
    // are not stuck — they're a Phase-2 surface; the demoInteractionLayer
    // shows a "Coming in Phase 2" toast on click. Skip the coherence check.
    const allDisabled = await page.evaluate((gid) => {
      const els = Array.from(document.querySelectorAll<HTMLElement>(`[data-uat-group^="${gid}-"]`));
      return els.length > 0 && els.every((el) => el.getAttribute("data-disabled") === "true");
    }, g.id);
    if (allDisabled) continue;

    const targetIdx = pre.active === 0 ? 1 : 0;
    const target = page.locator(`[data-uat-group="${g.id}-i${targetIdx}"]`);
    try {
      await target.scrollIntoViewIfNeeded({ timeout: 1000 });
      await target.click({ timeout: 2000, force: true });
    } catch {
      continue;
    }
    await page.waitForTimeout(350);

    const post = await page.evaluate((gid) => {
      const els = Array.from(document.querySelectorAll<HTMLElement>(`[data-uat-group^="${gid}-"]`));
      const heading = document.querySelector<HTMLElement>("h1, h2")?.textContent ?? "";
      const url = window.location.href;
      return {
        active: els.findIndex((el) => el.getAttribute("data-active") === "true"),
        heading,
        url,
      };
    }, g.id);

    // Navigation away from `route` is a valid wired behaviour (primary nav).
    // We only treat same-route, same-heading, same-active as stuck.
    const navigated = !post.url.endsWith(route);
    const changed =
      navigated ||
      pre.active !== post.active ||
      pre.heading !== post.heading;
    if (!changed) {
      stuck.push({
        route,
        group: `${g.id} (${g.n} items, first: "${g.firstLabel}")`,
        reason:
          "clicked non-active sub-nav item → data-active did not flip, heading unchanged, URL unchanged. Item is decorative.",
      });
    }
  }
  return stuck;
}

test("D-DECORATIVE: exhaustive UI walk across all 16 routes", async () => {
  test.setTimeout(20 * 60_000);
  const browser: Browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();

  const reports: ClickableReport[] = [];
  const subNavFindings: Array<{ route: string; group: string; reason: string }> = [];
  let totalDecorative = 0;
  let totalSubNav = 0;

  for (const route of ROUTES) {
    const loaded = await gotoRoute(page, route);
    if (!loaded) {
      reports.push({
        route,
        total: 0,
        wired: 0,
        disabled: 0,
        decorative: 0,
        subNavStuck: 0,
        findings: [],
      });
      continue;
    }
    const r = await probeClickableCompleteness(page, route);
    reports.push(r);
    totalDecorative += r.decorative;

    const stuck = await subNavCoherenceCheck(page, route);
    subNavFindings.push(...stuck);
    totalSubNav += stuck.length;
  }

  await browser.close();

  const total = reports.reduce((a, r) => a + r.total, 0);
  const wired = reports.reduce((a, r) => a + r.wired, 0);
  const disabled = reports.reduce((a, r) => a + r.disabled, 0);
  const passRate = total ? (((wired + disabled) / total) * 100).toFixed(2) : "0";

  const lines: string[] = [];
  lines.push(`# D-DECORATIVE walk — ${PHASE} (${STAMP})`);
  lines.push("");
  lines.push(`Target: ${BASE_URL}`);
  lines.push("");
  lines.push(
    `| Route | Total | Wired | Disabled | Decorative | Sub-nav stuck |`,
  );
  lines.push(`|---|---|---|---|---|---|`);
  for (const r of reports) {
    const stuckOnRoute = subNavFindings.filter((s) => s.route === r.route).length;
    lines.push(`| ${r.route} | ${r.total} | ${r.wired} | ${r.disabled} | ${r.decorative} | ${stuckOnRoute} |`);
  }
  lines.push("");
  lines.push(`**Totals:** total=${total}, wired=${wired}, disabled=${disabled}, decorative=${totalDecorative}, sub-nav-stuck=${totalSubNav}`);
  lines.push(`**D-DECORATIVE pass-rate** = (wired+disabled)/total = ${passRate}% (threshold ≥99%)`);
  lines.push("");
  if (subNavFindings.length) {
    lines.push(`## Sub-nav stuck findings (clicking does not flip active state):`);
    for (const s of subNavFindings) {
      lines.push(`- ${s.route} :: ${s.group} — ${s.reason}`);
    }
  }
  lines.push("");
  lines.push("## Decorative element samples (first 30):");
  const decFindings = reports.flatMap((r) => r.findings.filter((f) => f.verdict === "decorative"));
  for (const f of decFindings.slice(0, 30)) {
    lines.push(`- ${f.route} :: ${f.selector} "${f.label}" — ${f.reason}`);
  }

  writeFileSync(
    resolve(OUT_DIR, `decorative-walk-${PHASE}-${STAMP}.md`),
    lines.join("\n"),
  );
  writeFileSync(
    resolve(OUT_DIR, `decorative-walk-${PHASE}-${STAMP}.json`),
    JSON.stringify({ reports, subNavFindings, total, wired, disabled, totalDecorative, totalSubNav, passRate }, null, 2),
  );

  console.log(
    `D-DECORATIVE ${PHASE}: total=${total} wired=${wired} disabled=${disabled} decorative=${totalDecorative} subnav-stuck=${totalSubNav} pass=${passRate}%`,
  );
  // Soft check — record results, do not fail test (pre-fix run is expected to
  // flag ~60 decorative elements). The dashboard report is the artifact; CI
  // gates on the percentage via a separate check that reads the JSON.
  expect(reports.length).toBe(ROUTES.length);
});
