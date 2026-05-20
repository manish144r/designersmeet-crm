import { defineConfig, devices } from "@playwright/test";

// D-DECORATIVE walk — exhaustive clickable completeness across all 16 routes.
// Runs only decorative-walk.spec.ts, independent of the persona matrix.
export default defineConfig({
  testDir: "./tests",
  testMatch: /decorative-walk\.spec\.ts/,
  timeout: 25 * 60_000,
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [["list"], ["json", { outputFile: "tests/ux-results/decorative-walk.json" }]],
  use: {
    baseURL: process.env.UX_BASE_URL ?? "https://designersmeet-preview.surge.sh",
    viewport: { width: 1440, height: 900 },
    ...devices["Desktop Chrome"],
  },
});
