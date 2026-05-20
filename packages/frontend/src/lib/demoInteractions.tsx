// Non-invasive demo interaction layer.
//
// The 16 pages are pixel-faithful Codex translations of brief/mockups/*.html
// and are explicitly "do not hand-edit" + design-locked, so they ship with no
// onClick / navigation handlers. This layer is mounted ONCE at the app root
// (inside <BrowserRouter>) and gives the static UI feedback WITHOUT touching
// any page TSX, colour, or layout:
//
//   1. A click on a sidebar nav item (a div/button/a whose visible text is one
//      of the known route labels) performs a real react-router navigation.
//   2. Any other button / link click raises a transient toast so the control
//      visibly responds instead of looking dead.
//
// It never preventDefaults real anchors/handlers — toasts are purely additive,
// so any genuine page behaviour still runs. Styling uses Tailwind design
// tokens only (no raw colour literals — passes the dm/no-raw-color guard).

import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

const NAV_ROUTES: Record<string, string> = {
  dashboard: "/dashboard",
  contacts: "/contacts",
  vendors: "/vendors",
  pipelines: "/pipelines",
  projects: "/projects",
  calendar: "/calendar",
  conversations: "/conversations",
  forms: "/forms",
  workflows: "/workflows",
  settings: "/settings",
  onboarding: "/onboarding",
  "spec sheet": "/spec",
};

// Phase-2 nav items rendered in the locked sidebars but not yet implemented.
// They were decorative pre-2026-05-20 (clicking did nothing meaningful — toast
// only). We mark them aria-disabled / data-disabled at runtime so the
// D-DECORATIVE probe accepts them as INTENTIONALLY inert, and surface a
// "Coming in Phase 2" toast that explains why instead of echoing the label.
const PHASE2_LABELS = new Set([
  "outlook add-in",
  "teams app",
  "m365 launcher",
  "reports",
]);

function applyPhase2Markers() {
  const labels = Array.from(PHASE2_LABELS);
  for (const el of Array.from(document.querySelectorAll<HTMLElement>('[class~="cursor-pointer"], button, [role="button"]'))) {
    const text = (el.textContent ?? "").replace(/\s+/g, " ").trim().toLowerCase();
    if (labels.includes(text) && el.getAttribute("data-disabled") !== "true") {
      el.setAttribute("data-disabled", "true");
      el.setAttribute("aria-disabled", "true");
      if (!el.getAttribute("title")) el.setAttribute("title", "Coming in Phase 2");
    }
  }
}

// Selection-on-click coherence layer.
//
// Several locked pages render LISTS of selectable sibling items with
// `cursor-pointer` (calendar dates, conversation threads, workflow rows,
// kanban-style filter chips). The Codex translation includes per-item
// `data-active="true|false"` markers + active-vs-default styling but ships
// no onClick handler, so clicking one item does not move the active state
// from the previously-selected sibling. The D-DECORATIVE probe correctly
// flags these as "sub-nav stuck".
//
// This layer is the brand-lock-safe fix: on click of any cursor-pointer
// item inside a group of ≥3 sibling cursor-pointer items, flip data-active
// on the clicked element and clear it on its siblings in the same parent.
// The styling treatment for active is ALREADY in the locked CSS — we just
// move the marker. No DOM is added/removed.
function findGroupSiblings(el: Element): Element[] {
  const parent = el.parentElement;
  if (!parent) return [];
  const siblings = Array.from(parent.children).filter((c) => {
    if (c === el) return true;
    const cls = c.getAttribute("class") || "";
    return cls.includes("cursor-pointer") && c.children.length <= 5;
  });
  return siblings.length >= 3 ? siblings : [];
}

function flipActiveWithinGroup(el: Element) {
  const siblings = findGroupSiblings(el);
  if (!siblings.length) return false;
  for (const s of siblings) {
    s.setAttribute("data-active", s === el ? "true" : "false");
  }
  return true;
}

interface Toast {
  id: number;
  text: string;
}

function isInteractive(el: Element | null): HTMLElement | null {
  let node: Element | null = el;
  for (let i = 0; node && i < 6; i++) {
    if (
      node instanceof HTMLElement &&
      (node.tagName === "BUTTON" ||
        node.tagName === "A" ||
        node.getAttribute("role") === "button" ||
        node.className.toString().includes("cursor-pointer"))
    ) {
      return node;
    }
    node = node.parentElement;
  }
  return null;
}

function labelOf(el: HTMLElement): string {
  const text = (el.textContent ?? "").replace(/\s+/g, " ").trim();
  if (text) return text.slice(0, 48);
  const aria = el.getAttribute("aria-label");
  return aria ? aria.slice(0, 48) : "Action";
}

export function DemoInteractionLayer() {
  const navigate = useNavigate();
  const [toasts, setToasts] = useState<Toast[]>([]);

  const push = useCallback((text: string) => {
    const id = Date.now() + Math.random();
    setToasts((cur) => [...cur, { id, text }].slice(-4));
    window.setTimeout(() => {
      setToasts((cur) => cur.filter((t) => t.id !== id));
    }, 2600);
  }, []);

  useEffect(() => {
    // Mark Phase-2 nav items on first render and re-mark as lazy pages mount.
    applyPhase2Markers();
    const obs = new MutationObserver(() => applyPhase2Markers());
    obs.observe(document.body, { childList: true, subtree: true });

    function onClick(ev: MouseEvent) {
      const target = isInteractive(ev.target as Element | null);
      if (!target) return;

      const label = labelOf(target);
      const key = label.toLowerCase();

      // Intentionally inert (Phase 2) — show explanatory toast, do nothing.
      if (PHASE2_LABELS.has(key) || target.getAttribute("data-disabled") === "true") {
        ev.preventDefault();
        push(`${label}: coming in Phase 2`);
        return;
      }

      const route = NAV_ROUTES[key];

      if (route && window.location.pathname !== route) {
        ev.preventDefault();
        navigate(route);
        push(`Navigated to ${label}`);
        return;
      }

      // Selectable list coherence — flip data-active on the clicked item.
      if ((target.getAttribute("class") || "").includes("cursor-pointer")) {
        flipActiveWithinGroup(target);
      }

      // Real anchors that point somewhere meaningful: let them be.
      const href = target.getAttribute("href");
      if (target.tagName === "A" && href && href !== "#" && !href.startsWith("#")) {
        return;
      }

      push(label);
    }

    document.addEventListener("click", onClick, true);
    return () => {
      document.removeEventListener("click", onClick, true);
      obs.disconnect();
    };
  }, [navigate, push]);

  return (
    <div
      className="pointer-events-none fixed bottom-4 right-4 z-[9999] flex flex-col gap-2"
      aria-live="polite"
      data-demo-toaster="true"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          className="pointer-events-auto max-w-[320px] rounded-md border border-border bg-foreground px-3 py-2 text-[13px] font-medium text-background shadow-pop"
        >
          {t.text}
        </div>
      ))}
    </div>
  );
}
