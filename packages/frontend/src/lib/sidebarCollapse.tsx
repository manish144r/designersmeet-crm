// Sidebar collapse behaviour layer.
//
// The primary nav <aside> is duplicated, byte-identical and design-locked,
// inside 14 page TSX files (each stamped "do not hand-edit"). Its "Collapse"
// IconButton ships with no onClick — clicking it did nothing (the bug Manish
// caught manually).
//
// Rather than hand-edit 14 locked pages (visual-fidelity risk + Codex-only
// territory), this root-level layer — same non-invasive pattern as
// demoInteractions — wires collapse centrally:
//
//   * delegated capture-phase listener: a click on any
//     button[title="Collapse"] / [aria-label="Collapse"] toggles the
//     persisted Zustand `sidebarCollapsed` state.
//   * the state is reflected as html[data-sidebar-collapsed]; index.css
//     drawer-collapses the primary sidebar (layout-only, no colour literals).
//   * a token-styled floating "Expand" control is rendered ONLY while
//     collapsed (and only when a primary sidebar exists), so the user can
//     always get the sidebar back.
//   * aria-expanded is kept in sync on every collapse control.
//
// Default (expanded) state renders zero extra DOM/pixels => the locked
// expanded design is unaffected (0.00% visual-regression).

import { useEffect } from "react";
import { PanelLeftOpen } from "lucide-react";
import { useUIStore } from "../stores/uiStore.js";

const COLLAPSE_BTN = 'button[title="Collapse"], button[aria-label="Collapse"]';

function syncAria(collapsed: boolean) {
  document.querySelectorAll(COLLAPSE_BTN).forEach((b) => {
    b.setAttribute("aria-expanded", String(!collapsed));
    b.setAttribute("aria-controls", "dm-primary-sidebar");
  });
}

export function SidebarCollapseLayer() {
  const collapsed = useUIStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);

  // Reflect state to <html> + keep aria in sync as lazy pages mount.
  useEffect(() => {
    document.documentElement.dataset.sidebarCollapsed = collapsed ? "true" : "false";
    syncAria(collapsed);
    const obs = new MutationObserver(() => syncAria(useUIStore.getState().sidebarCollapsed));
    obs.observe(document.body, { childList: true, subtree: true });
    return () => obs.disconnect();
  }, [collapsed]);

  // Delegated collapse-button handler (capture phase, additive — never
  // preventDefaults; demoInteractions' toast still fires as feedback).
  useEffect(() => {
    function onClick(ev: MouseEvent) {
      const el = ev.target as Element | null;
      const btn = el?.closest?.(COLLAPSE_BTN);
      if (btn) toggleSidebar();
    }
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [toggleSidebar]);

  if (!collapsed) return null;

  return (
    <button
      type="button"
      className="dm-sidebar-expand"
      aria-label="Expand sidebar"
      aria-expanded="false"
      aria-controls="dm-primary-sidebar"
      title="Expand sidebar"
      onClick={() => toggleSidebar()}
    >
      <PanelLeftOpen className="size-4" aria-hidden="true" />
    </button>
  );
}
