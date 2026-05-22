/**
 * AppShell — shared Sidebar + TopBar used by every main page.
 * Wiring: sidebar nav routes, collapse toggle, user menu, notifications.
 * 2026-05-22 Batch 3 — extracted to stop duplicating across 15 pages.
 */
import { useRef, useEffect, useState, type ReactNode } from "react";
import {
  BarChart3,
  Bell,
  Calendar,
  ChevronDown,
  ChevronRight,
  ChevronsUpDown,
  CircleHelp,
  ClipboardList,
  GitBranch,
  HardHat,
  LayoutDashboard,
  LayoutGrid,
  LogOut,
  Mail,
  MessagesSquare,
  MoreHorizontal,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  User,
  Users,
  UsersRound,
  Zap,
  Layers,
  type LucideIcon,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "../auth/AuthProvider.js";

/* ─── Constants ──────────────────────────────────────────────── */
export const NAV_ROUTES: Record<string, string> = {
  Dashboard: "/dashboard",
  Contacts: "/contacts",
  Vendors: "/vendors",
  Pipelines: "/pipelines",
  Projects: "/projects",
  Calendar: "/calendar",
  Conversations: "/conversations",
  Forms: "/forms",
  Workflows: "/workflows",
  Reports: "/pipelines",
  Settings: "/settings",
};

export const SURFACE_URLS: Record<string, string> = {
  "Outlook add-in": "https://outlook.office.com",
  "Teams app": "https://teams.microsoft.com",
  "M365 launcher": "https://microsoft365.com/apps",
};

type NavItem = { label: string; icon: LucideIcon; active?: boolean };

export const workspaceNavItems: NavItem[] = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "Contacts", icon: Users },
  { label: "Vendors", icon: HardHat },
  { label: "Pipelines", icon: GitBranch },
  { label: "Projects", icon: Layers },
  { label: "Calendar", icon: Calendar },
  { label: "Conversations", icon: MessagesSquare },
  { label: "Forms", icon: ClipboardList },
  { label: "Workflows", icon: Zap },
  { label: "Reports", icon: BarChart3 },
  { label: "Settings", icon: Settings },
];

export const surfaceNavItems: NavItem[] = [
  { label: "Outlook add-in", icon: Mail },
  { label: "Teams app", icon: UsersRound },
  { label: "M365 launcher", icon: LayoutGrid },
];

/* ─── Dropdown hook ──────────────────────────────────────────── */
export function useDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);
  return { open, setOpen, ref };
}

/* ─── Avatar ─────────────────────────────────────────────────── */
export function Avatar({
  children,
  size = "default",
  className,
}: {
  children: ReactNode;
  size?: "default" | "sm";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full border border-background bg-border-subtle font-semibold uppercase text-secondary",
        size === "sm" ? "size-[22px] text-[10px]" : "size-7 text-[12px]",
        className,
      )}
    >
      {children}
    </div>
  );
}

/* ─── IconButton ─────────────────────────────────────────────── */
export function IconButton({
  title,
  children,
  className,
  disabled,
  onClick,
}: {
  title?: string;
  children: ReactNode;
  className?: string;
  disabled?: boolean;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      title={title}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "h-[30px] w-[30px] rounded-md p-0 text-secondary hover:bg-hover hover:text-foreground focus-visible:ring-foreground",
        className,
      )}
    >
      {children}
    </Button>
  );
}

/* ─── UserMenu ───────────────────────────────────────────────── */
function UserMenu() {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const dd = useDropdown();
  return (
    <div className="relative" ref={dd.ref}>
      <button
        type="button"
        onClick={() => dd.setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-md px-2 py-1 hover:bg-hover focus-visible:outline-foreground"
      >
        <Avatar size="sm">MS</Avatar>
        <ChevronDown className="size-4 text-muted" aria-hidden="true" />
      </button>
      {dd.open && (
        <div className="absolute right-0 top-full z-50 mt-1 min-w-[160px] rounded-lg border border-border bg-background py-1 shadow-lg">
          {[
            { label: "Profile", icon: User, action: () => navigate("/settings") },
            { label: "Settings", icon: Settings, action: () => navigate("/settings") },
            { label: "Sign out", icon: LogOut, action: signOut, danger: true },
          ].map(({ label, icon: Icon, action, danger }) => (
            <button
              key={label}
              type="button"
              onClick={() => { action(); dd.setOpen(false); }}
              className={cn(
                "flex w-full items-center gap-2.5 px-3 py-2 text-[13px] hover:bg-hover",
                danger ? "text-red-600" : "text-foreground",
              )}
            >
              <Icon className="size-4 shrink-0 text-muted" />
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Sidebar ────────────────────────────────────────────────── */
function SidebarNavItem({
  item,
  collapsed,
  onClick,
}: {
  item: NavItem;
  collapsed: boolean;
  onClick: () => void;
}) {
  const Icon = item.icon;
  return (
    <button
      type="button"
      onClick={onClick}
      title={collapsed ? item.label : undefined}
      className={cn(
        "flex w-full cursor-pointer select-none items-center gap-2.5 rounded-md px-2.5 py-[7px] text-[13px] font-medium transition-colors",
        item.active
          ? "bg-primary-tint text-primary"
          : "text-secondary hover:bg-border-subtle hover:text-foreground",
        collapsed && "justify-center px-0",
      )}
    >
      <Icon
        className={cn("size-4 shrink-0", item.active ? "text-primary" : "text-muted")}
        aria-hidden="true"
      />
      {!collapsed && <span>{item.label}</span>}
    </button>
  );
}

/** activeNav: the label of the current page's nav item, e.g. "Contacts" */
export function AppSidebar({
  activeNav,
  collapsed,
  onToggle,
}: {
  activeNav: string;
  collapsed: boolean;
  onToggle: () => void;
}) {
  const navigate = useNavigate();
  return (
    <aside
      className={cn(
        "flex flex-shrink-0 flex-col border-r border-border bg-sidebar transition-all duration-200",
        collapsed ? "w-[52px]" : "w-[232px]",
      )}
    >
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        {!collapsed && (
          <div className="inline-flex items-center gap-2 text-[14px] font-semibold tracking-normal text-foreground">
            <span className="inline-flex size-[22px] items-center justify-center rounded-[5px] border border-border bg-background text-[12px] font-bold text-foreground">
              D
            </span>
            <span>DesignersMeet</span>
          </div>
        )}
        <IconButton
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          onClick={onToggle}
          className={collapsed ? "mx-auto" : ""}
        >
          {collapsed
            ? <PanelLeftOpen className="size-4 shrink-0" aria-hidden="true" />
            : <PanelLeftClose className="size-4 shrink-0" aria-hidden="true" />}
        </IconButton>
      </div>

      {!collapsed && (
        <div className="px-3 pt-3">
          <div className="flex items-center justify-between gap-2 rounded-lg border border-border bg-background p-2 shadow-card">
            <div className="flex min-w-0 items-center gap-2">
              <div className="flex size-6 shrink-0 items-center justify-center rounded-md border border-border bg-background text-[10px] font-bold text-foreground">
                HQ
              </div>
              <div className="min-w-0">
                <div className="truncate text-[12px] font-semibold text-foreground">
                  DesignersMeet HQ
                </div>
                <div className="truncate text-[10px] text-muted">Bengaluru workspace</div>
              </div>
            </div>
            <ChevronsUpDown className="size-4 shrink-0 text-muted" aria-hidden="true" />
          </div>
        </div>
      )}

      <nav className="flex-1 overflow-y-auto px-2 pt-3">
        {!collapsed && (
          <div className="mb-1.5 mt-3.5 px-2.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-muted">
            Workspace
          </div>
        )}
        <div className="space-y-0.5">
          {workspaceNavItems.map((item) => (
            <SidebarNavItem
              key={item.label}
              item={{ ...item, active: item.label === activeNav }}
              collapsed={collapsed}
              onClick={() => { const r = NAV_ROUTES[item.label]; if (r) navigate(r); }}
            />
          ))}
        </div>
        {!collapsed && (
          <div className="mb-1.5 mt-3.5 px-2.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-muted">
            Surfaces
          </div>
        )}
        <div className="space-y-0.5">
          {surfaceNavItems.map((item) => (
            <SidebarNavItem
              key={item.label}
              item={item}
              collapsed={collapsed}
              onClick={() => {
                const url = SURFACE_URLS[item.label];
                if (url) window.open(url, "_blank", "noopener,noreferrer");
              }}
            />
          ))}
        </div>
      </nav>

      <div className="border-t border-border px-3 py-3">
        <div className="flex items-center gap-2 px-1">
          <Avatar>MS</Avatar>
          {!collapsed && (
            <>
              <div className="min-w-0">
                <div className="truncate text-[12px] font-semibold text-foreground">Manish</div>
                <div className="truncate text-[10px] text-muted">Workspace owner</div>
              </div>
              <div className="ml-auto">
                <IconButton title="Account menu" onClick={() => navigate("/settings")}>
                  <MoreHorizontal className="size-4 shrink-0" aria-hidden="true" />
                </IconButton>
              </div>
            </>
          )}
        </div>
      </div>
    </aside>
  );
}

/* ─── TopBar ─────────────────────────────────────────────────── */
export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function AppTopBar({
  breadcrumbs,
  center,
}: {
  breadcrumbs: BreadcrumbItem[];
  center?: ReactNode;
}) {
  const navigate = useNavigate();
  const notifDd = useDropdown();

  return (
    <header className="flex h-[52px] items-center gap-4 border-b border-border bg-background px-5">
      <nav className="flex items-center gap-2 text-[13px]">
        {breadcrumbs.map((bc, i) => (
          <span key={bc.label} className="flex items-center gap-2">
            {i > 0 && <ChevronRight className="size-4 text-disabled" aria-hidden="true" />}
            {bc.href ? (
              <button
                type="button"
                onClick={() => navigate(bc.href!)}
                className="text-muted hover:text-foreground"
              >
                {bc.label}
              </button>
            ) : (
              <span className="font-medium text-foreground">{bc.label}</span>
            )}
          </span>
        ))}
      </nav>

      {center && <div className="ml-auto mr-auto max-w-[480px] flex-1">{center}</div>}

      <div className="ml-auto flex items-center gap-1">
        <IconButton
          title="Help"
          onClick={() =>
            window.open("https://support.microsoft.com", "_blank", "noopener,noreferrer")
          }
        >
          <CircleHelp className="size-4 shrink-0" aria-hidden="true" />
        </IconButton>

        {/* Notifications */}
        <div className="relative" ref={notifDd.ref}>
          <IconButton
            title="Notifications"
            className="relative"
            onClick={() => notifDd.setOpen((v) => !v)}
          >
            <Bell className="size-4 shrink-0" aria-hidden="true" />
            <span className="absolute right-1 top-1 size-1.5 rounded-full bg-foreground" />
          </IconButton>
          {notifDd.open && (
            <div className="absolute right-0 top-full z-50 mt-1 min-w-[240px] rounded-lg border border-border bg-background py-1 shadow-lg">
              {[
                { label: "Concept board v3 uploaded", route: "/projects" },
                { label: "Task blocked: MCB spec", route: "/projects" },
                { label: "View all notifications", route: "/conversations" },
              ].map(({ label, route }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => { navigate(route); notifDd.setOpen(false); }}
                  className="flex w-full items-center px-3 py-2 text-left text-[13px] text-foreground hover:bg-hover"
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="mx-1 h-6 w-px bg-border" />
        <UserMenu />
      </div>
    </header>
  );
}

/* ─── AppLayout ──────────────────────────────────────────────── */
/**
 * Full page shell. Wrap page content in this.
 * Usage:
 *   <AppLayout activeNav="Contacts" breadcrumbs={[{label:"Contacts"}]} center={<SearchField/>}>
 *     ...page body...
 *   </AppLayout>
 */
export function AppLayout({
  activeNav,
  breadcrumbs,
  center,
  children,
}: {
  activeNav: string;
  breadcrumbs: BreadcrumbItem[];
  center?: ReactNode;
  children: ReactNode;
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground antialiased">
      <AppSidebar
        activeNav={activeNav}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((v) => !v)}
      />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <AppTopBar breadcrumbs={breadcrumbs} center={center} />
        {children}
      </div>
    </div>
  );
}
