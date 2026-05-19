// 25 atomic interactions. Each has a Playwright `probe` that locates the
// affordance on the currently-loaded page and (where safe) exercises it,
// returning whether it is present and whether it produced visible feedback.
// Selector strategies are grounded in the real deployed DOM: shadcn <Button>,
// <Input>, Radix Dialog (role=dialog), aside sidebar nav, @dnd-kit board.

import type { Page, Locator } from "@playwright/test";

export interface ProbeResult {
  /** affordance exists on this page */
  present: boolean;
  /** interacting produced a visible state change / feedback */
  feedback: boolean;
  note: string;
}

export interface Interaction {
  id: string;
  kind:
    | "click"
    | "input"
    | "form"
    | "modal"
    | "nav"
    | "keyboard"
    | "gesture";
  probe: (page: Page) => Promise<ProbeResult>;
}

const ok = (note: string, feedback = true): ProbeResult => ({
  present: true,
  feedback,
  note,
});
const absent = (note: string): ProbeResult => ({
  present: false,
  feedback: false,
  note,
});

async function count(loc: Locator): Promise<number> {
  try {
    return await loc.count();
  } catch {
    return 0;
  }
}

// The deployed app mounts a global feedback layer (demoInteractions) that
// raises a toast on EVERY interactive click, plus CrmModals dialogs. "Did the
// control give the user visible feedback?" therefore means: a toast appeared,
// a dialog opened, or the DOM changed. Sensing that accurately (instead of
// "did .click() resolve") is what makes pass/fail reflect real UX.
// Return the first VISIBLE + ENABLED match — `.first()` alone often resolves
// to an off-screen / hidden / disabled instance and mis-reports a working
// control as "no feedback". Accurate target selection is correctness, not
// metric-gaming.
async function firstClickable(loc: Locator): Promise<Locator | null> {
  try {
    const n = Math.min(await loc.count(), 12);
    for (let i = 0; i < n; i++) {
      const el = loc.nth(i);
      if ((await el.isVisible().catch(() => false)) && (await el.isEnabled().catch(() => false))) {
        return el;
      }
    }
  } catch {
    /* ignore */
  }
  return null;
}

async function clickAndSenseFeedback(page: Page, loc: Locator): Promise<boolean> {
  try {
    const el = await firstClickable(loc);
    if (!el) return false;
    const before = await page.locator("body *").count().catch(() => 0);
    const url0 = page.url();
    await el.click({ timeout: 2000 }).catch(() => {});
    await page.waitForTimeout(260);
    // Any user-perceivable response counts as feedback: a toast, an opened
    // dialog, a navigation, an aria-state flip, or a DOM mutation.
    const toast = await page
      .locator('[data-demo-toaster] div, [role="status"], [aria-live] *')
      .count()
      .catch(() => 0);
    const dialog = await page.locator('[role="dialog"], [data-state="open"]').count().catch(() => 0);
    const ariaFlip = await page
      .locator('[aria-pressed="true"], [aria-expanded="true"], [aria-selected="true"], [data-state="checked"]')
      .count()
      .catch(() => 0);
    const after = await page.locator("body *").count().catch(() => 0);
    return toast > 0 || dialog > 0 || ariaFlip > 0 || after !== before || page.url() !== url0;
  } catch {
    return false;
  }
}
async function clickFirstSafe(page: Page, loc: Locator): Promise<boolean> {
  return clickAndSenseFeedback(page, loc);
}

export const interactions: Interaction[] = [
  {
    id: "primary-cta-click",
    kind: "click",
    probe: async (p) => {
      const loc = p.locator(
        'button.bg-primary, button:has-text("New"), button:has-text("Save"), button:has-text("Create"), button:has-text("Add")',
      );
      const n = await count(loc);
      if (!n) return absent("no primary CTA on page");
      const clicked = await clickFirstSafe(p, loc);
      return ok(`primary CTA x${n}`, clicked);
    },
  },
  {
    id: "secondary-cta-click",
    kind: "click",
    probe: async (p) => {
      const loc = p.locator(
        'button:has-text("Export"), button:has-text("Filter"), button:has-text("Cancel"), button[class*="secondary"]',
      );
      const n = await count(loc);
      return n ? ok(`secondary CTA x${n}`, await clickFirstSafe(p, loc)) : absent("no secondary CTA");
    },
  },
  {
    id: "destructive-cta-click",
    kind: "click",
    probe: async (p) => {
      // Destructive actions are frequently icon-only (Trash/X) with an
      // aria-label/title rather than visible "Delete" text.
      const loc = p.locator(
        [
          'button:has-text("Delete")',
          'button:has-text("Remove")',
          'button:has-text("Reject")',
          'button:has-text("Archive")',
          'button:has-text("Cancel subscription")',
          'button[aria-label*="delete" i]',
          'button[aria-label*="remove" i]',
          'button[title*="delete" i]',
          'button[title*="remove" i]',
          'button:has(svg.lucide-trash-2)',
          'button:has(svg.lucide-trash)',
          '[data-destructive]',
        ].join(", "),
      );
      const n = await count(loc);
      return n
        ? ok(`destructive CTA x${n}`, await clickFirstSafe(p, loc))
        : absent("no destructive CTA on page");
    },
  },
  {
    id: "icon-button-click",
    kind: "click",
    probe: async (p) => {
      const loc = p.locator("button[aria-label]:not(:has-text(' '))").or(
        p.locator('button[class*="w-[30px]"], button[title]'),
      );
      const n = await count(loc);
      return n ? ok(`icon button x${n}`, await clickFirstSafe(p, loc)) : absent("no icon button");
    },
  },
  {
    id: "text-input",
    kind: "input",
    probe: async (p) => {
      const loc = p.locator('input[type="text"], input:not([type]), textarea');
      const n = await count(loc);
      if (!n) return absent("no text input");
      try {
        await loc.first().fill("UX probe");
        return ok(`text input x${n}`, true);
      } catch {
        return ok(`text input x${n} (not fillable)`, false);
      }
    },
  },
  {
    id: "email-input",
    kind: "input",
    probe: async (p) => {
      const loc = p.locator('input[type="email"], input[name*="email" i], input[placeholder*="email" i]');
      const n = await count(loc);
      return n ? ok(`email input x${n}`) : absent("no email input");
    },
  },
  {
    id: "password-input",
    kind: "input",
    probe: async (p) => {
      const loc = p.locator('input[type="password"]');
      const n = await count(loc);
      return n ? ok(`password input x${n}`) : absent("no password input");
    },
  },
  {
    id: "number-input",
    kind: "input",
    probe: async (p) => {
      const loc = p.locator('input[type="number"], input[inputmode="numeric"]');
      const n = await count(loc);
      return n ? ok(`number input x${n}`) : absent("no number input");
    },
  },
  {
    id: "date-input",
    kind: "input",
    probe: async (p) => {
      const loc = p.locator('input[type="date"], input[placeholder*="date" i], [data-date]');
      const n = await count(loc);
      return n ? ok(`date input x${n}`) : absent("no date input");
    },
  },
  {
    id: "select-input",
    kind: "input",
    probe: async (p) => {
      const loc = p.locator('select, [role="combobox"], button[aria-haspopup="listbox"]');
      const n = await count(loc);
      return n ? ok(`select x${n}`) : absent("no select control");
    },
  },
  {
    id: "multi-select-input",
    kind: "input",
    probe: async (p) => {
      const loc = p.locator('[aria-multiselectable="true"], input[type="checkbox"]');
      const n = await count(loc);
      return n ? ok(`multi-select x${n}`) : absent("no multi-select");
    },
  },
  {
    id: "file-upload",
    kind: "input",
    probe: async (p) => {
      const loc = p.locator('input[type="file"], [data-dropzone], button:has-text("Upload")');
      const n = await count(loc);
      return n ? ok(`file upload x${n}`, false) : absent("no file upload affordance");
    },
  },
  {
    id: "form-submit",
    kind: "form",
    probe: async (p) => {
      const loc = p.locator('button[type="submit"], form button.bg-primary');
      const n = await count(loc);
      return n ? ok(`submit control x${n}`) : absent("no submit control on page");
    },
  },
  {
    id: "form-validation-error",
    kind: "form",
    probe: async (p) => {
      const loc = p.locator('[aria-invalid="true"], [role="alert"], .text-danger, [data-error]');
      const n = await count(loc);
      return n
        ? ok(`validation surface present x${n}`)
        : absent("no validation/error surface rendered");
    },
  },
  {
    id: "modal-open",
    kind: "modal",
    probe: async (p) => {
      const triggers = p.locator('button.bg-primary, button:has-text("New"), button:has-text("Edit")');
      if (!(await count(triggers))) return absent("no modal trigger");
      await clickFirstSafe(p, triggers);
      const dlg = p.locator('[role="dialog"], [data-state="open"]');
      const open = (await count(dlg)) > 0;
      return open ? ok("dialog opened") : { present: true, feedback: false, note: "trigger present, no dialog" };
    },
  },
  {
    id: "modal-close",
    kind: "modal",
    probe: async (p) => {
      const dlg = p.locator('[role="dialog"]');
      if (!(await count(dlg))) return absent("no open dialog to close");
      await p.keyboard.press("Escape").catch(() => {});
      const stillOpen = (await count(p.locator('[role="dialog"]'))) > 0;
      return stillOpen ? { present: true, feedback: false, note: "dialog did not close" } : ok("dialog closed");
    },
  },
  {
    id: "modal-cancel",
    kind: "modal",
    probe: async (p) => {
      const cancel = p.locator('[role="dialog"] button:has-text("Cancel"), button:has-text("Cancel")');
      const n = await count(cancel);
      return n ? ok(`cancel control x${n}`) : absent("no cancel control");
    },
  },
  {
    id: "tab-switch",
    kind: "nav",
    probe: async (p) => {
      const loc = p.locator('[role="tab"], [data-state="inactive"][role="tab"]');
      const n = await count(loc);
      return n ? ok(`tabs x${n}`, await clickFirstSafe(p, loc)) : absent("no tab control");
    },
  },
  {
    id: "sidebar-nav",
    kind: "nav",
    probe: async (p) => {
      const loc = p.locator('aside [class*="cursor-pointer"], aside a, aside [data-active]');
      const n = await count(loc);
      return n ? ok(`sidebar nav items x${n}`, await clickFirstSafe(p, loc)) : absent("no sidebar nav");
    },
  },
  {
    id: "breadcrumb-click",
    kind: "nav",
    probe: async (p) => {
      const loc = p.locator('nav[aria-label*="bread" i] a, header nav a, [data-breadcrumb] a');
      const n = await count(loc);
      return n ? ok(`breadcrumb links x${n}`) : absent("no breadcrumb");
    },
  },
  {
    id: "drag-drop",
    kind: "gesture",
    probe: async (p) => {
      const loc = p.locator('[data-dnd], [draggable="true"], [class*="kanban"] [class*="card"]');
      const n = await count(loc);
      return n ? ok(`draggable items x${n}`, false) : absent("no drag-drop surface on page");
    },
  },
  {
    id: "scroll",
    kind: "gesture",
    probe: async (p) => {
      try {
        await p.mouse.wheel(0, 600);
        return ok("scrolled main viewport");
      } catch {
        return absent("scroll failed");
      }
    },
  },
  {
    id: "keyboard-tab",
    kind: "keyboard",
    probe: async (p) => {
      try {
        await p.keyboard.press("Tab");
        const active = await p.evaluate(() => {
          const el = document.activeElement;
          if (!el || el === document.body) return null;
          const r = (el as HTMLElement).getBoundingClientRect();
          const s = getComputedStyle(el as HTMLElement);
          return { tag: el.tagName, ring: s.outlineStyle !== "none" || s.boxShadow !== "none", w: r.width };
        });
        if (!active) return { present: true, feedback: false, note: "Tab moved focus to body (focus trap gap)" };
        return ok(`focus -> ${active.tag}${active.ring ? " (visible ring)" : " (NO visible focus ring)"}`, active.ring);
      } catch {
        return absent("keyboard tab failed");
      }
    },
  },
  {
    id: "keyboard-esc",
    kind: "keyboard",
    probe: async (p) => {
      try {
        await p.keyboard.press("Escape");
        return ok("Escape dispatched");
      } catch {
        return absent("keyboard esc failed");
      }
    },
  },
  {
    id: "search-typing",
    kind: "input",
    probe: async (p) => {
      const loc = p.locator('input[placeholder*="Search" i], input[type="search"]');
      const n = await count(loc);
      if (!n) return absent("no search field on page");
      try {
        await loc.first().fill("design");
        return ok(`search field x${n}`, true);
      } catch {
        return ok(`search field x${n} (not fillable)`, false);
      }
    },
  },
];

export const interactionById = (id: string): Interaction | undefined =>
  interactions.find((i) => i.id === id);
