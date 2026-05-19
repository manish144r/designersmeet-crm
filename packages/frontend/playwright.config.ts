import { defineConfig, devices } from "@playwright/test";

// Visual-regression harness (design-lock Layer 2/3). Builds + serves the app,
// pixel-diffs every page vs the locked brief/screenshots baseline at 1440x900.
export default defineConfig({
  testDir: "./tests",
  timeout: 60_000,
  fullyParallel: false,
  reporter: [["list"]],
  use: {
    baseURL: process.env.VR_BASE_URL ?? "http://localhost:4173",
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
    ...devices["Desktop Chrome"],
  },
  webServer: {
    command: "npm run build && npm run preview -- --port 4173",
    url: "http://localhost:4173",
    timeout: 180_000,
    reuseExistingServer: true,
  },
});
