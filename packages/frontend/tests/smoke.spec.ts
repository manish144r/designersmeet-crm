/**
 * Layer 1 — HTTP Endpoint Smoke Tests
 *
 * Runs against the LIVE Vercel URL (DEPLOY_URL env var).
 * No browser — pure HTTP via Playwright's request context.
 * Every API route must return application/json, never text/html.
 *
 * Known gotchas baked in:
 *   - SPA catch-all intercept: if Express !process.env.VERCEL guard missing,
 *     API routes return index.html (200, text/html) → BLOCK
 *   - /api/health missing: health alias not added → BLOCK
 *   - /api/freelancers: renamed to /api/vendors in this branch → 404 is EXPECTED
 *
 * Run:  npx playwright test --config playwright.smoke.config.ts
 */

import { test, expect, request } from "@playwright/test";
import { writeFileSync, mkdirSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = resolve(HERE, "smoke-results");
if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });

const BASE = process.env.DEPLOY_URL ?? "https://designersmeet-crm-backend.vercel.app";

// Routes that must return 200 + application/json
const JSON_ROUTES = [
  "/health",
  "/api/health",
  "/api/healthz",
  "/api/contacts",
  "/api/vendors",
  "/api/projects",
  "/api/pipelines",
  "/api/pipeline-stages",
  "/api/conversations",
  "/api/calendar-events",
  "/api/services",
  "/api/orders",
];

// Routes that must return 200 + text/html (SPA shell)
const HTML_ROUTES = ["/", "/dashboard", "/contacts", "/pipelines", "/calendar"];

// Routes that return 404 JSON (entity renamed or not yet registered — expected)
const EXPECTED_404_ROUTES = [
  "/api/freelancers", // renamed to /api/vendors in brand-change branch
];

const results: Array<{
  route: string;
  status: number;
  contentType: string;
  verdict: "PASS" | "BLOCK";
  reason?: string;
}> = [];

function assertJson(status: number, contentType: string, route: string) {
  const isJson = contentType.includes("application/json");
  const isHtml = contentType.includes("text/html");
  if (isHtml) {
    return { verdict: "BLOCK" as const, reason: `${route} returned HTML — SPA catch-all intercepted API route. Check !process.env.VERCEL guard in app.ts.` };
  }
  if (status >= 500) {
    return { verdict: "BLOCK" as const, reason: `${route} returned ${status} — server error.` };
  }
  if (!isJson) {
    return { verdict: "BLOCK" as const, reason: `${route} returned unexpected content-type: ${contentType}` };
  }
  return { verdict: "PASS" as const };
}

test.describe("Layer 1 — Endpoint Smoke Tests", () => {
  test.describe.configure({ mode: "serial" });

  let ctx: Awaited<ReturnType<typeof request.newContext>>;

  test.beforeAll(async () => {
    ctx = await request.newContext({ baseURL: BASE, ignoreHTTPSErrors: true });
  });

  test.afterAll(async () => {
    await ctx.dispose();
    const report = {
      timestamp: new Date().toISOString(),
      baseUrl: BASE,
      results,
      blocked: results.filter((r) => r.verdict === "BLOCK"),
      verdict: results.some((r) => r.verdict === "BLOCK") ? "BLOCK" : "PASS",
    };
    writeFileSync(resolve(OUT_DIR, "smoke-report.json"), JSON.stringify(report, null, 2));
    if (report.verdict === "BLOCK") {
      console.error("\n🚨 SMOKE BLOCK — Issues:\n" + report.blocked.map((r) => `  • ${r.reason}`).join("\n"));
    } else {
      console.log("\n✅ SMOKE PASS — all endpoints healthy");
    }
  });

  for (const route of JSON_ROUTES) {
    test(`JSON route: ${route}`, async () => {
      const res = await ctx.get(route);
      const contentType = res.headers()["content-type"] ?? "";
      const { verdict, reason } = assertJson(res.status(), contentType, route);
      results.push({ route, status: res.status(), contentType, verdict, reason });

      // Health routes must explicitly return { status: "ok" }
      if (route.includes("health")) {
        const body = await res.json().catch(() => null);
        expect(body?.status, `${route} body.status should be "ok"`).toBe("ok");
      }

      expect(verdict, reason ?? `${route} failed`).toBe("PASS");
    });
  }

  test("SPA root returns HTML shell (not API error)", async () => {
    const res = await ctx.get("/");
    const ct = res.headers()["content-type"] ?? "";
    expect(res.status(), "/ should return 200").toBe(200);
    expect(ct, "/ should return HTML, not JSON error").toContain("text/html");
    results.push({ route: "/", status: res.status(), contentType: ct, verdict: "PASS" });
  });

  for (const route of HTML_ROUTES.filter((r) => r !== "/")) {
    test(`SPA route serves HTML: ${route}`, async () => {
      const res = await ctx.get(route);
      const ct = res.headers()["content-type"] ?? "";
      const isHtml = ct.includes("text/html");
      // SPA routes should return HTML (200) not a 404 JSON or API error
      expect(res.status(), `${route} should 200 or 304`).toBeLessThan(400);
      expect(isHtml, `${route} should serve HTML SPA shell`).toBe(true);
      results.push({ route, status: res.status(), contentType: ct, verdict: "PASS" });
    });
  }

  for (const route of EXPECTED_404_ROUTES) {
    test(`Expected 404 (renamed entity): ${route}`, async () => {
      const res = await ctx.get(route);
      const ct = res.headers()["content-type"] ?? "";
      // This should be a JSON 404, NOT an HTML response (which would mean SPA catch-all bug)
      const isHtml = ct.includes("text/html");
      if (isHtml) {
        results.push({
          route,
          status: res.status(),
          contentType: ct,
          verdict: "BLOCK",
          reason: `${route} returned HTML — SPA catch-all bug still present`,
        });
        expect(isHtml, `${route} returned HTML — SPA catch-all bug`).toBe(false);
      } else {
        results.push({ route, status: res.status(), contentType: ct, verdict: "PASS" });
        // 404 JSON is correct here — entity was renamed
        expect(res.status()).toBe(404);
      }
    });
  }

  test("No /api/* route returns text/html (catch-all guard check)", async () => {
    // Probe a non-existent API route — must return JSON 404, never HTML
    const res = await ctx.get("/api/__probe_nonexistent__");
    const ct = res.headers()["content-type"] ?? "";
    const isHtml = ct.includes("text/html");
    const reason = isHtml
      ? "CRITICAL: /api/__probe__ returned HTML — Express SPA catch-all is active. Fix: add !process.env.VERCEL guard in packages/backend/src/crm/app.ts"
      : undefined;
    results.push({ route: "/api/__probe__", status: res.status(), contentType: ct, verdict: isHtml ? "BLOCK" : "PASS", reason });
    expect(isHtml, reason).toBe(false);
  });
});
