// App-root portal: workspace switcher + admin/vendor view toggle.
// Mounted ONCE inside <BrowserRouter> (main.tsx). Adds zero pixels to any
// page's default render — both dropdowns render to a fixed-position div
// anchored to the clicked element via getBoundingClientRect.
//
// Brand-lock: we WIRE existing DOM (no DOM additions to pages). Triggers are
// detected via a delegated click capture:
//   • Workspace tile  — every page renders the same workspace card in its
//     left sidebar (.shadow-card containing "DesignersMeet HQ" + ChevronsUpDown
//     icon). We hook click on the card's enclosing element.
//   • View toggle     — every page renders the header avatar+ChevronDown
//     button. We hook click on that button.
//
// Each dropdown lives in the React tree so React Query / Zustand updates flow.
// Clicks outside close the dropdown (capture phase, before page handlers).
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { demoStore, type DemoView } from "../lib/demoStore.js";
import { useDemoStore } from "../hooks/useDemoStore.js";
import { Check, ChevronRight } from "lucide-react";

interface Anchor {
  kind: "workspace" | "view";
  rect: DOMRect;
}

// Heuristics to detect the two triggers without touching page DOM.
function findWorkspaceTrigger(target: Element | null): HTMLElement | null {
  let node: Element | null = target;
  for (let i = 0; node && i < 8; i++) {
    if (
      node instanceof HTMLElement &&
      node.className?.toString().includes("shadow-card") &&
      node.querySelector?.("svg") &&
      (node.textContent ?? "").includes("workspace")
    ) {
      return node;
    }
    node = node.parentElement;
  }
  return null;
}

function findViewTrigger(target: Element | null): HTMLElement | null {
  let node: Element | null = target;
  for (let i = 0; node && i < 6; i++) {
    if (
      node instanceof HTMLElement &&
      node.tagName === "BUTTON" &&
      // header user button: avatar (rounded-full) + chevron-down svg.
      node.querySelector?.(".rounded-full") &&
      node.querySelector?.("svg")
    ) {
      // Filter out sidebar collapse / other icon buttons by checking it lives
      // inside a <header>.
      if (node.closest("header")) return node;
    }
    node = node.parentElement;
  }
  return null;
}

export function HeaderDropdowns() {
  useDemoStore();
  const navigate = useNavigate();
  const [anchor, setAnchor] = useState<Anchor | null>(null);

  useEffect(() => {
    function onClick(ev: MouseEvent) {
      const target = ev.target as Element | null;
      const ws = findWorkspaceTrigger(target);
      if (ws) {
        ev.preventDefault();
        ev.stopPropagation();
        const rect = ws.getBoundingClientRect();
        setAnchor((cur) =>
          cur?.kind === "workspace" ? null : { kind: "workspace", rect },
        );
        return;
      }
      const view = findViewTrigger(target);
      if (view) {
        ev.preventDefault();
        ev.stopPropagation();
        const rect = view.getBoundingClientRect();
        setAnchor((cur) => (cur?.kind === "view" ? null : { kind: "view", rect }));
        return;
      }
      // Click outside the dropdown panels — close.
      if (anchor && !(target as HTMLElement | null)?.closest?.("[data-header-dropdown]")) {
        setAnchor(null);
      }
    }
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [anchor]);

  useEffect(() => {
    function onKey(ev: KeyboardEvent) {
      if (ev.key === "Escape") setAnchor(null);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  if (!anchor) return null;
  if (anchor.kind === "workspace") {
    return <WorkspaceMenu rect={anchor.rect} onClose={() => setAnchor(null)} navigate={navigate} />;
  }
  return <ViewMenu rect={anchor.rect} onClose={() => setAnchor(null)} navigate={navigate} />;
}

function MenuShell({
  rect,
  children,
  width = 240,
  align = "below-left",
}: {
  rect: DOMRect;
  children: ReactNode;
  width?: number;
  align?: "below-left" | "below-right";
}) {
  const top = rect.bottom + 6;
  const left =
    align === "below-right" ? Math.max(8, rect.right - width) : Math.max(8, rect.left);
  return (
    <div
      data-header-dropdown="true"
      role="menu"
      className="fixed z-[120] rounded-lg border border-border bg-background py-1 shadow-pop"
      style={{ top, left, width }}
    >
      {children}
    </div>
  );
}

function WorkspaceMenu({
  rect,
  onClose,
  navigate,
}: {
  rect: DOMRect;
  onClose: () => void;
  navigate: ReturnType<typeof useNavigate>;
}) {
  useDemoStore();
  const workspaces = useMemo(() => demoStore.list("workspaces").data, []);
  const currentId = demoStore.getCurrentWorkspaceId();

  return (
    <MenuShell rect={rect} width={260}>
      <div className="px-3 py-1.5 text-[10.5px] font-semibold uppercase tracking-wider text-muted">
        Switch workspace
      </div>
      {(workspaces as Array<{ id: string; name: string; region?: string }>).map((w) => {
        const isCurrent = w.id === currentId;
        return (
          <button
            key={w.id}
            type="button"
            role="menuitem"
            onClick={() => {
              demoStore.setCurrentWorkspace(w.id);
              onClose();
            }}
            data-workspace-option={w.id}
            data-active={isCurrent ? "true" : "false"}
            className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-[13px] text-foreground hover:bg-hover focus-visible:bg-hover focus-visible:outline-foreground"
          >
            <span className="flex items-center gap-2">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-md border border-border bg-background text-[10px] font-bold text-foreground">
                {w.name.slice(0, 2).toUpperCase()}
              </span>
              <span className="flex flex-col">
                <span className="text-[13px] font-medium">{w.name}</span>
                <span className="text-[11px] text-muted">{w.region ?? "—"}</span>
              </span>
            </span>
            {isCurrent ? (
              <Check className="size-4 text-primary" aria-hidden="true" />
            ) : null}
          </button>
        );
      })}
      <div className="my-1 h-px bg-border-subtle" />
      <button
        type="button"
        role="menuitem"
        onClick={() => {
          onClose();
          navigate("/settings");
        }}
        className="flex w-full items-center justify-between px-3 py-2 text-left text-[12px] text-secondary hover:bg-hover focus-visible:outline-foreground"
      >
        <span>Manage workspaces</span>
        <ChevronRight className="size-4 text-muted" aria-hidden="true" />
      </button>
    </MenuShell>
  );
}

function ViewMenu({
  rect,
  onClose,
  navigate,
}: {
  rect: DOMRect;
  onClose: () => void;
  navigate: ReturnType<typeof useNavigate>;
}) {
  useDemoStore();
  const current = demoStore.getView();

  function pick(v: DemoView) {
    demoStore.setView(v);
    onClose();
    if (v === "vendor") navigate("/vendor");
    else if (v === "admin" && window.location.pathname === "/vendor") navigate("/dashboard");
  }

  const options: Array<{ value: DemoView; label: string; sub: string }> = [
    { value: "admin", label: "Admin view", sub: "Full CRM · all surfaces" },
    { value: "vendor", label: "Vendor view", sub: "Read-only portal · assigned projects only" },
  ];

  return (
    <MenuShell rect={rect} width={260} align="below-right">
      <div className="px-3 py-1.5 text-[10.5px] font-semibold uppercase tracking-wider text-muted">
        Switch view
      </div>
      {options.map((opt) => {
        const isCurrent = opt.value === current;
        return (
          <button
            key={opt.value}
            type="button"
            role="menuitem"
            onClick={() => pick(opt.value)}
            data-view-option={opt.value}
            data-active={isCurrent ? "true" : "false"}
            className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-[13px] text-foreground hover:bg-hover focus-visible:bg-hover focus-visible:outline-foreground"
          >
            <span className="flex flex-col">
              <span className="text-[13px] font-medium">{opt.label}</span>
              <span className="text-[11px] text-muted">{opt.sub}</span>
            </span>
            {isCurrent ? (
              <Check className="size-4 text-primary" aria-hidden="true" />
            ) : null}
          </button>
        );
      })}
      <div className="my-1 h-px bg-border-subtle" />
      <button
        type="button"
        role="menuitem"
        onClick={() => {
          onClose();
          demoStore.setView("admin");
          // Settings → Vendor portal admin pane.
          navigate("/settings");
        }}
        className="flex w-full items-center justify-between px-3 py-2 text-left text-[12px] text-secondary hover:bg-hover focus-visible:outline-foreground"
      >
        <span>Vendor portal settings</span>
        <ChevronRight className="size-4 text-muted" aria-hidden="true" />
      </button>
    </MenuShell>
  );
}
