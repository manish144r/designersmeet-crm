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
    function onClick(ev: MouseEvent) {
      const target = isInteractive(ev.target as Element | null);
      if (!target) return;

      const label = labelOf(target);
      const key = label.toLowerCase();
      const route = NAV_ROUTES[key];

      if (route && window.location.pathname !== route) {
        ev.preventDefault();
        navigate(route);
        push(`Navigated to ${label}`);
        return;
      }

      // Real anchors that point somewhere meaningful: let them be.
      const href = target.getAttribute("href");
      if (target.tagName === "A" && href && href !== "#" && !href.startsWith("#")) {
        return;
      }

      push(label);
    }

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
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
