// Per-page optimization heuristics: axe-core a11y (CDN-injected, no npm dep),
// plus UX heuristics — visible focus rings, ARIA labelling of icon buttons,
// button feedback, loading affordances, image alt coverage, and a lightweight
// performance proxy from Navigation Timing (labelled a proxy — NOT official
// Lighthouse, which needs the lighthouse package + CDP).

import type { Page } from "@playwright/test";

export interface PageOptReport {
  route: string;
  perfProxy: number; // 0-100
  a11yViolations: number;
  a11ySerious: number;
  iconButtonsMissingLabel: number;
  imagesMissingAlt: number;
  focusRingPresent: boolean;
  loadingAffordance: boolean;
  buttonFeedback: boolean;
  notes: string[];
}

const AXE_CDN = "https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.10.2/axe.min.js";

async function runAxe(page: Page): Promise<{ violations: number; serious: number }> {
  try {
    await page.addScriptTag({ url: AXE_CDN });
    const res = await page.evaluate(async () => {
      // @ts-expect-error axe injected at runtime
      if (!window.axe) return null;
      // @ts-expect-error axe injected at runtime
      const r = await window.axe.run(document, { resultTypes: ["violations"] });
      return r.violations.map((v: { impact: string }) => v.impact);
    });
    if (!res) return { violations: -1, serious: -1 };
    return {
      violations: res.length,
      serious: res.filter((i: string) => i === "serious" || i === "critical").length,
    };
  } catch {
    return { violations: -1, serious: -1 };
  }
}

async function perfProxy(page: Page): Promise<number> {
  try {
    const t = await page.evaluate(() => {
      const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming;
      const paint = performance.getEntriesByType("paint");
      const fcp = paint.find((p) => p.name === "first-contentful-paint")?.startTime ?? 0;
      return {
        fcp,
        dcl: nav ? nav.domContentLoadedEventEnd - nav.startTime : 0,
        load: nav ? nav.loadEventEnd - nav.startTime : 0,
        resources: performance.getEntriesByType("resource").length,
      };
    });
    // Simple budget scoring: FCP<1.8s, load<3s, <60 resources -> ~100.
    let score = 100;
    if (t.fcp > 1800) score -= Math.min(30, (t.fcp - 1800) / 60);
    if (t.load > 3000) score -= Math.min(30, (t.load - 3000) / 80);
    if (t.resources > 60) score -= Math.min(20, (t.resources - 60) / 2);
    return Math.max(0, Math.round(score));
  } catch {
    return -1;
  }
}

export async function auditPage(page: Page, route: string): Promise<PageOptReport> {
  const notes: string[] = [];
  const { violations, serious } = await runAxe(page);
  if (violations < 0) notes.push("axe-core injection failed (offline?) — a11y not scored");

  const iconButtonsMissingLabel = await page
    .locator("button:not([aria-label]):not(:has-text(/.+/))")
    .count()
    .catch(() => 0);

  const imagesMissingAlt = await page
    .locator("img:not([alt])")
    .count()
    .catch(() => 0);

  const focusRingPresent = await page.evaluate(() => {
    const btn = document.querySelector("button");
    if (!btn) return false;
    (btn as HTMLElement).focus();
    const s = getComputedStyle(btn as HTMLElement);
    return s.outlineStyle !== "none" || s.boxShadow !== "none" || !!btn.className.match(/focus|ring/);
  }).catch(() => false);

  const loadingAffordance =
    (await page
      .locator('[aria-busy], [role="progressbar"], .animate-spin, [class*="skeleton"]')
      .count()
      .catch(() => 0)) > 0;

  const buttonFeedback =
    (await page
      .locator('button[class*="hover:"], button[class*="active:"], [data-demo-toaster]')
      .count()
      .catch(() => 0)) > 0;

  const perf = await perfProxy(page);
  if (perf >= 0 && perf < 80) notes.push(`perf proxy ${perf} < 80`);
  if (serious > 0) notes.push(`${serious} serious/critical a11y violations`);
  if (iconButtonsMissingLabel > 0) notes.push(`${iconButtonsMissingLabel} icon buttons missing aria-label`);
  if (!focusRingPresent) notes.push("no visible focus ring on first button");
  if (imagesMissingAlt > 0) notes.push(`${imagesMissingAlt} images missing alt`);

  return {
    route,
    perfProxy: perf,
    a11yViolations: violations,
    a11ySerious: serious,
    iconButtonsMissingLabel,
    imagesMissingAlt,
    focusRingPresent,
    loadingAffordance,
    buttonFeedback,
    notes,
  };
}

export const AUDIT_ROUTES = [
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
  "/onboarding",
  "/signin",
];
