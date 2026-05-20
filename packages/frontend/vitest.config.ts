import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/test/setup.ts",
    css: true,
    // Vitest scans the package root by default. The Playwright suites live in
    // `tests/` and import `@playwright/test` — including them here pulls in
    // Playwright's test runner globals and explodes. Restrict to src + spec
    // files that aren't Playwright.
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    exclude: ["node_modules/**", "dist/**", "tests/**"],
    coverage: {
      reporter: ["text", "html"],
      exclude: ["node_modules/", "dist/", "src/test/", "tests/"],
    },
  },
});
