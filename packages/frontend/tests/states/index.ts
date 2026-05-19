// 4 UX states each interaction is evaluated under. Each state defines the DOM
// markers that prove the app communicated that state to the user. Missing
// markers are real UX gaps (silent loading, no success feedback, swallowed
// errors, no empty-state guidance).

import type { Page } from "@playwright/test";

export interface UxState {
  id: "loading" | "success" | "error" | "empty-populated";
  /** Returns true if the page exposes a marker appropriate to this state. */
  detect: (page: Page) => Promise<{ marker: boolean; note: string }>;
}

export const states: UxState[] = [
  {
    id: "loading",
    detect: async (p) => {
      const n = await p
        .locator(
          '[aria-busy="true"], [role="progressbar"], .animate-spin, [data-loading], text=/loading/i, .skeleton, [class*="skeleton"]',
        )
        .count()
        .catch(() => 0);
      return {
        marker: n > 0,
        note: n > 0 ? `loading affordance x${n}` : "no spinner/skeleton/aria-busy",
      };
    },
  },
  {
    id: "success",
    detect: async (p) => {
      const n = await p
        .locator(
          '[data-demo-toaster] div, [role="status"], [aria-live="polite"] *, .text-primary, [data-state="checked"]',
        )
        .count()
        .catch(() => 0);
      return {
        marker: n > 0,
        note: n > 0 ? `success/feedback channel x${n}` : "no success feedback channel",
      };
    },
  },
  {
    id: "error",
    detect: async (p) => {
      const n = await p
        .locator('[role="alert"], [aria-invalid="true"], .text-danger, [data-error]')
        .count()
        .catch(() => 0);
      return {
        marker: n > 0,
        note: n > 0 ? `error surface x${n}` : "no error surface available",
      };
    },
  },
  {
    id: "empty-populated",
    detect: async (p) => {
      const populated = await p
        .locator('table tbody tr, [role="row"], [class*="card"], li')
        .count()
        .catch(() => 0);
      const emptyState = await p
        .locator('text=/no .*(yet|found)/i, [data-empty], .empty-state')
        .count()
        .catch(() => 0);
      return {
        marker: populated > 0 || emptyState > 0,
        note:
          populated > 0
            ? `populated (${populated} rows/cards)`
            : emptyState > 0
              ? "explicit empty-state shown"
              : "neither data nor empty-state guidance",
      };
    },
  },
];
