import { defineConfig, devices } from "@playwright/test";

// Persona-driven UX runner config. Unlike playwright.config.ts (the visual-
// regression harness that builds + serves locally), this runs ONLY the UX
// matrix runner against a remote/live URL (the Surge preview by default) and
// never starts a webServer.
export default defineConfig({
  testDir: "./tests",
  testMatch: /runner\.spec\.ts/,
  timeout: 95 * 60_000,
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [["list"], ["html", { outputFolder: "tests/ux-results/html", open: "never" }]],
  use: {
    baseURL: process.env.UX_BASE_URL ?? "https://designersmeet-preview.surge.sh",
    viewport: { width: 1440, height: 900 },
    screenshot: "only-on-failure",
    ...devices["Desktop Chrome"],
  },
});
