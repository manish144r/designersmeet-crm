/**
 * Layer 3 — Accessibility Gate (axe-core)
 *
 * Navigates to all 15 CRM routes and runs axe-core WCAG 2.1 AA.
 * Critical + serious violations → BLOCK (pipeline stops).
 * Moderate violations → logged as tech debt, non-blocking.
 *
 * Run:  npx playwright test --config playwright.a11y.config.ts
 *
 * On first run with no issues, output is a11y-report.json showing PASS.
 * On failure, the report includes exact violation descriptions + CSS selectors
 * so Aider can target the exact element.
 */

import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { writeFileSync, mkdirSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = resolve(HERE, "a11y-results");
if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });

interface PageReport {
  route: string;
  critical: number;
  serious: number;
  moderate: number;
  violations: Array<{ impact: string; description: string; nodes: string[] }>;
  verdict: "PASS" | "BLOCK";
}

const allReports: PageReport[] = [];

const CRM_ROUTES = [
  { slug: "signin", route: "/signin" },
  { slug: "onboarding", route: "/onboarding" },
  { slug: "dashboard", route: "/dashboard" },
  { slug: "contacts", route: "/contacts" },
  { slug: "contact-detail", route: "/contact-detail" },
  { slug: "vendors", route: "/vendors" },
  { slug: "vendor-detail", route: "/vendor-detail" },
  { slug: "projects", route: "/projects" },
  { slug: "project-detail", route: "/project-detail" },
  { slug: "pipelines", route: "/pipelines" },
  { slug: "calendar", route: "/calendar" },
  { slug: "conversations", route: "/conversations" },
  { slug: "marketing", route: "/marketing" },
  { slug: "reports", route: "/reports" },
  { slug: "settings", route: "/settings" },
];

test.afterAll(async () => {
  const blocked = allReports.filter((r) => r.verdict === "BLOCK");
  const report = {
    timestamp: new Date().toISOString(),
    baseUrl: process.env.DEPLOY_URL ?? "http://localhost:4173",
    pages: allReports,
    totalCritical: allReports.reduce((s, r) => s + r.critical, 0),
    totalSerious: allReports.reduce((s, r) => s + r.serious, 0),
    totalModerate: allReports.reduce((s, r) => s + r.moderate, 0),
    blocked,
    verdict: blocked.length > 0 ? "BLOCK" : "PASS",
  };
  writeFileSync(resolve(OUT_DIR, "a11y-report.json"), JSON.stringify(report, null, 2));

  if (report.verdict === "BLOCK") {
    const summary = blocked
      .flatMap((p) =>
        p.violations
          .filter((v) => v.impact === "critical" || v.impact === "serious")
          .map((v) => `  [${v.impact.toUpperCase()}] ${p.route}: ${v.description}\n    Nodes: ${v.nodes.slice(0, 2).join(", ")}`)
      )
      .join("\n");
    console.error(`\n🚨 A11Y BLOCK — ${blocked.length} pages have critical/serious violations:\n${summary}`);
  } else {
    console.log(`\n✅ A11Y PASS — zero critical/serious violations across ${allReports.length} pages`);
    const moderateCount = report.totalModerate;
    if (moderateCount > 0) {
      console.log(`   ⚠️  ${moderateCount} moderate violations logged as tech debt (non-blocking)`);
    }
  }
});

for (const { slug, route } of CRM_ROUTES) {
  test(`a11y: ${route}`, async ({ page }) => {
    await page.goto(route, { waitUntil: "networkidle", timeout: 30_000 });

    // Wait for React to hydrate
    await page.waitForSelector("[data-page-ready], main, #root > *", { timeout: 10_000 }).catch(() => {});

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .exclude("#axe-core-widget") // exclude any injected debug overlays
      .analyze();

    const byImpact = (impact: string) =>
      results.violations
        .filter((v) => v.impact === impact)
        .map((v) => ({
          impact: v.impact ?? "unknown",
          description: v.description,
          nodes: v.nodes.map((n) => n.target.join(" ")).slice(0, 3),
        }));

    const critical = byImpact("critical");
    const serious = byImpact("serious");
    const moderate = byImpact("moderate");

    const pageReport: PageReport = {
      route,
      critical: critical.length,
      serious: serious.length,
      moderate: moderate.length,
      violations: [...critical, ...serious, ...moderate],
      verdict: critical.length + serious.length > 0 ? "BLOCK" : "PASS",
    };
    allReports.push(pageReport);

    // Write per-page report for Aider consumption
    writeFileSync(resolve(OUT_DIR, `${slug}.json`), JSON.stringify(pageReport, null, 2));

    if (critical.length > 0 || serious.length > 0) {
      const details = [...critical, ...serious]
        .map((v) => `  [${v.impact.toUpperCase()}] ${v.description} — ${v.nodes[0] ?? "unknown element"}`)
        .join("\n");
      expect(
        critical.length + serious.length,
        `A11Y BLOCK on ${route}:\n${details}`
      ).toBe(0);
    }

    // Moderate — log but don't fail
    if (moderate.length > 0) {
      console.warn(`  ⚠️  ${route}: ${moderate.length} moderate violations (tech debt)`);
    }
  });
}
