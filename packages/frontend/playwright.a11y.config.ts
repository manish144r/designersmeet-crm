/**
 * Playwright config for Layer 3 — Accessibility (axe-core).
 *
 * Targets either the LIVE Vercel URL (DEPLOY_URL) or local preview server.
 * Launches a real Chromium browser to render the SPA, then runs axe-core.
 */
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  testMatch: ["**/a11y.spec.ts"],
  timeout: 60_000,
  retries: 0, // a11y violations are deterministic — no retry needed
  fullyParallel: true, // pages can be checked concurrently
  reporter: [
    ["list"],
    ["json", { outputFile: "tests/a11y-results/playwright-report.json" }],
  ],
  use: {
    baseURL: process.env.DEPLOY_URL ?? "http://localhost:4173",
    ...devices["Desktop Chrome"],
    viewport: { width: 1440, height: 900 },
    // Capture screenshots on failure for Aider repair context
    screenshot: "only-on-failure",
    video: "off",
  },
  // Start local preview server only when DEPLOY_URL is not set
  webServer: process.env.DEPLOY_URL
    ? undefined
    : {
        command: "npm run build && npm run preview -- --port 4173",
        url: "http://localhost:4173",
        timeout: 180_000,
        reuseExistingServer: true,
      },
});
