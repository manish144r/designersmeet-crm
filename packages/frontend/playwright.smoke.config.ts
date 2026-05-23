/**
 * Playwright config for Layer 1 — HTTP Smoke Tests.
 *
 * Targets the LIVE Vercel deployment (DEPLOY_URL env var).
 * No webServer — tests hit the already-running remote app.
 * No browser UI needed — pure HTTP via request context.
 */
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  testMatch: ["**/smoke.spec.ts"],
  timeout: 30_000,
  retries: 1, // one automatic retry on transient network failures
  fullyParallel: false,
  reporter: [
    ["list"],
    ["json", { outputFile: "tests/smoke-results/playwright-report.json" }],
  ],
  use: {
    baseURL: process.env.DEPLOY_URL ?? "https://designersmeet-crm-backend.vercel.app",
    ignoreHTTPSErrors: true,
    extraHTTPHeaders: {
      // Tell any WAF this is a monitoring probe
      "x-ui-inspector": "smoke-layer-1",
    },
  },
  // No webServer — we target an already-deployed app
});
