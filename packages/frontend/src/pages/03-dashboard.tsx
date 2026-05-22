/* Generated from brief/mockups/03-dashboard.html via Codex fidelity pass 2026-05-19.
   Interactive wiring applied 2026-05-22 — Batch 1 Dashboard fix. */

import { type ReactNode, useRef, useEffect, useState } from "react";
import {
  BarChart3,
  Bell,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronsUpDown,
  CircleHelp,
  ClipboardList,
  Clock,
  Download,
  Eye,
  GitBranch,
  HardHat,
  Layers,
  LayoutDashboard,
  LayoutGrid,
  LogOut,
  Mail,
  MessagesSquare,
  MoreHorizontal,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Search,
  Settings,
  TrendingUp,
  User,
  Users,
  UsersRound,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useList } from "../hooks/useResource.js";
import { useUIStore } from "../stores/uiStore.js";
import { useAuth } from "../auth/AuthProvider.js";

/* ─── Route map ─────────────────────────────────────────────── */
const NAV_ROUTES: Record<string, string> = {
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

const SURFACE_URLS: Record<string, string> = {
  "Outlook add-in": "https://outlook.office.com",
  "Teams app": "https://teams.microsoft.com",
  "M365 launcher": "https://microsoft365.com/apps",
};

type NavItem = {
  label: string;
  icon: LucideIcon;
  active?: boolean;
};

const workspaceNavItems: NavItem[] = [
  { label: "Dashboard", icon: LayoutDashboard, active: true },
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

const surfaceNavItems: NavItem[] = [
  { label: "Outlook add-in", icon: Mail },
  { label: "Teams app", icon: UsersRound },
  { label: "M365 launcher", icon: LayoutGrid },
];

const activities = [
  {
    initials: "MS",
    name: "Manish",
    verb: "approved deliverable",
    target: "Concept board v2",
    meta: "Brand Refresh — Lumen Café · 5m ago",
    route: "/projects",
  },
  {
    initials: "AS",
    name: "Aurora Studio",
    verb: "uploaded",
    target: "Concept board v3.pdf",
    meta: "Brand Refresh — Lumen Café · 22m ago",
    route: "/vendors",
  },
  {
    initials: "PR",
    name: "Priya Raghavan",
    verb: "replied to",
    target: "RE: Snag list review",
    meta: "HSR Penthouse · 1h ago",
    route: "/contacts",
  },
  {
    initials: "VE",
    name: "Voltek Electricals",
    verb: "marked task blocked",
    target: "Awaiting MCB spec confirmation",
    meta: "HSR Penthouse · 2h ago",
    route: "/vendors",
  },
  {
    initials: "MK",
    name: "Manjunath Karpenter Co",
    verb: "accepted assignment",
    target: "Carpentry — Phase 1",
    meta: "Indiranagar Loft Reno · 4h ago",
    route: "/vendors",
  },
];

const deliverables = [
  {
    deliverable: "Concept board v3",
    project: "Brand Refresh — Lumen Café",
    initials: "AS",
    vendor: "Aurora Studio",
    due: "Wed, May 20",
    status: "In review",
    statusVariant: "neutral" as const,
  },
  {
    deliverable: "Carpentry shop drawings",
    project: "Indiranagar Loft Reno",
    initials: "MK",
    vendor: "Manjunath Karpenter Co",
    due: "Thu, May 21",
    status: "On track",
    statusVariant: "success" as const,
  },
  {
    deliverable: "Electrical load schedule",
    project: "HSR Penthouse",
    initials: "VE",
    vendor: "Voltek Electricals",
    due: "Tomorrow",
    status: "Blocked",
    statusVariant: "emphasis" as const,
  },
  {
    deliverable: "Final 3D walkthrough",
    project: "Whitefield Villa",
    initials: "RB",
    vendor: "Render Boutique",
    due: "Fri, May 22",
    status: "In review",
    statusVariant: "neutral" as const,
  },
  {
    deliverable: "Snag list — site visit 4",
    project: "JP Nagar Bungalow",
    initials: "MS",
    vendor: "Manish (PM)",
    due: "Fri, May 22",
    status: "Approved",
    statusVariant: "success" as const,
  },
];

const bookings = [
  {
    time: "11:00",
    period: "AM",
    title: "Site walk-through",
    detail: "Priya Raghavan · HSR Penthouse",
    badge: "in 1h",
  },
  {
    time: "2:30",
    period: "PM",
    title: "Vendor sync — Aurora",
    detail: "Concept board review",
    badge: "Teams",
  },
  {
    time: "4:00",
    period: "PM",
    title: "Brief discovery — Suri Family",
    detail: "Lead → Qualified",
    badge: "Outlook",
  },
  {
    time: "5:30",
    period: "PM",
    title: "Weekly PM stand-up",
    detail: "Internal · all PMs",
    badge: "Teams",
  },
];

const FILTER_PERIODS = ["Last 7 days", "Last 30 days", "Last 90 days", "This year"];

const chartBars = [
  "h-[35%] bg-muted",
  "h-[50%] bg-muted",
  "h-[70%] bg-secondary",
  "h-[55%] bg-secondary",
  "h-[80%] bg-foreground",
];

const iconClass = "size-4 shrink-0";

const tableHeadClass =
  "border-y border-border bg-subtle px-3.5 py-[9px] text-left text-[11px] font-medium uppercase tracking-[0.04em] text-muted";

const tableCellClass = "border-b border-border-subtle px-3.5 py-[11px] align-middle";

const statusVariantClasses = {
  neutral: "bg-border-subtle text-secondary",
  success: "bg-primary-tint text-primary",
  emphasis: "bg-border-subtle text-foreground",
};

/* ─── Dropdown hook ──────────────────────────────────────────── */
function useDropdown() {
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

/* ─── Sub-components ─────────────────────────────────────────── */
function IconButton({
  title,
  children,
  className,
  onClick,
}: {
  title?: string;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      title={title}
      aria-label={title}
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

function Avatar({
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

function SearchField({
  placeholder,
  className,
  shortcut,
}: {
  placeholder: string;
  className?: string;
  shortcut?: string;
}) {
  return (
    <div
      className={cn(
        "relative flex h-[34px] items-center rounded-md border border-border-strong bg-background",
        className,
      )}
    >
      <Search
        className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted"
        aria-hidden="true"
      />
      <Input
        type="text"
        placeholder={placeholder}
        className={cn(
          "h-full border-0 bg-transparent py-0 pl-8 text-[13px] text-foreground shadow-none placeholder:text-muted focus:border-transparent focus:ring-0",
          shortcut ? "pr-14" : "pr-3",
        )}
      />
      {shortcut ? (
        <span className="absolute right-2 top-1/2 -translate-y-1/2">
          <kbd className="rounded border border-border bg-background px-1.5 py-0.5 font-sans text-[10px] font-medium text-muted shadow-card">
            {shortcut}
          </kbd>
        </span>
      ) : null}
    </div>
  );
}

function SidebarNavItem({ item, onClick }: { item: NavItem; onClick: () => void }) {
  const Icon = item.icon;
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full cursor-pointer select-none items-center gap-2.5 rounded-md px-2.5 py-[7px] text-[13px] font-medium transition-colors",
        item.active
          ? "bg-primary-tint text-primary"
          : "text-secondary hover:bg-border-subtle hover:text-foreground",
      )}
      data-active={item.active ? "true" : "false"}
    >
      <Icon
        className={cn("size-4 shrink-0", item.active ? "text-primary" : "text-muted")}
        aria-hidden="true"
      />
      <span>{item.label}</span>
    </button>
  );
}

function Badge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-border-subtle px-2 py-0.5 text-[11px] font-medium leading-[18px] tracking-[0.01em] text-secondary">
      {children}
    </span>
  );
}

function StatusPill({
  children,
  variant = "neutral",
}: {
  children: ReactNode;
  variant?: keyof typeof statusVariantClasses;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-[5px] rounded-full border border-transparent px-2 py-[3px] text-[11px] font-medium before:size-1.5 before:rounded-full before:bg-current before:content-['']",
        statusVariantClasses[variant],
      )}
    >
      {children}
    </span>
  );
}

/* ─── Dropdown menu ──────────────────────────────────────────── */
function DropdownMenu({
  open,
  items,
  onSelect,
  className,
}: {
  open: boolean;
  items: { label: string; icon?: LucideIcon; onClick: () => void; danger?: boolean }[];
  onSelect?: () => void;
  className?: string;
}) {
  if (!open) return null;
  return (
    <div
      className={cn(
        "absolute z-50 mt-1 min-w-[160px] rounded-lg border border-border bg-background py-1 shadow-lg",
        className,
      )}
    >
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <button
            key={item.label}
            type="button"
            onClick={() => {
              item.onClick();
              onSelect?.();
            }}
            className={cn(
              "flex w-full items-center gap-2.5 px-3 py-2 text-left text-[13px] hover:bg-hover",
              item.danger ? "text-red-600" : "text-foreground",
            )}
          >
            {Icon && <Icon className="size-4 shrink-0 text-muted" aria-hidden="true" />}
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

/* ─── Main page ──────────────────────────────────────────────── */
export default function Dashboard() {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const projectsTotal = useList("projects").data?.total ?? 12;
  const vendorsTotal = useList("vendors").data?.total ?? 41;

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [filterPeriod, setFilterPeriod] = useState("Last 30 days");

  const filterDropdown = useDropdown();
  const chartFilterDropdown = useDropdown();
  const chartKebabDropdown = useDropdown();
  const userMenuDropdown = useDropdown();
  const notifDropdown = useDropdown();

  function handleExport() {
    window.print();
  }

  function handleNavItem(item: NavItem) {
    const route = NAV_ROUTES[item.label];
    if (route) navigate(route);
  }

  function handleSurfaceItem(item: NavItem) {
    const url = SURFACE_URLS[item.label];
    if (url) window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground antialiased">
      {/* ── Sidebar ─────────────────────────────────────────── */}
      <aside
        className={cn(
          "flex flex-shrink-0 flex-col border-r border-border bg-sidebar transition-all duration-200",
          sidebarCollapsed ? "w-[52px]" : "w-[232px]",
        )}
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          {!sidebarCollapsed && (
            <div className="inline-flex items-center gap-2 text-[14px] font-semibold tracking-normal text-foreground">
              <span className="inline-flex size-[22px] items-center justify-center rounded-[5px] border border-border bg-background text-[12px] font-bold text-foreground">
                D
              </span>
              <span>DesignersMeet</span>
            </div>
          )}
          <IconButton
            title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            onClick={() => setSidebarCollapsed((v) => !v)}
            className={sidebarCollapsed ? "mx-auto" : ""}
          >
            {sidebarCollapsed ? (
              <PanelLeftOpen className={iconClass} aria-hidden="true" />
            ) : (
              <PanelLeftClose className={iconClass} aria-hidden="true" />
            )}
          </IconButton>
        </div>

        {!sidebarCollapsed && (
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
          {!sidebarCollapsed && (
            <div className="mb-1.5 mt-3.5 px-2.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-muted">
              Workspace
            </div>
          )}
          <div className="space-y-0.5">
            {workspaceNavItems.map((item) => (
              <SidebarNavItem
                key={item.label}
                item={sidebarCollapsed ? { ...item, label: "" } : item}
                onClick={() => handleNavItem(item)}
              />
            ))}
          </div>

          {!sidebarCollapsed && (
            <div className="mb-1.5 mt-3.5 px-2.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-muted">
              Surfaces
            </div>
          )}
          <div className="space-y-0.5">
            {surfaceNavItems.map((item) => (
              <SidebarNavItem
                key={item.label}
                item={sidebarCollapsed ? { ...item, label: "" } : item}
                onClick={() => handleSurfaceItem(item)}
              />
            ))}
          </div>
        </nav>

        <div className="border-t border-border px-3 py-3">
          <div className="flex items-center gap-2 px-1">
            <Avatar>MS</Avatar>
            {!sidebarCollapsed && (
              <>
                <div className="min-w-0">
                  <div className="truncate text-[12px] font-semibold text-foreground">Manish</div>
                  <div className="truncate text-[10px] text-muted">Workspace owner</div>
                </div>
                <div className="relative ml-auto" ref={userMenuDropdown.ref}>
                  <IconButton
                    title="Account menu"
                    onClick={() => userMenuDropdown.setOpen((v) => !v)}
                  >
                    <MoreHorizontal className={iconClass} aria-hidden="true" />
                  </IconButton>
                  <DropdownMenu
                    open={userMenuDropdown.open}
                    onSelect={() => userMenuDropdown.setOpen(false)}
                    className="bottom-full right-0 mb-1"
                    items={[
                      { label: "Profile", icon: User, onClick: () => navigate("/settings") },
                      { label: "Settings", icon: Settings, onClick: () => navigate("/settings") },
                      {
                        label: "Sign out",
                        icon: LogOut,
                        danger: true,
                        onClick: () => signOut(),
                      },
                    ]}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </aside>

      {/* ── Main ────────────────────────────────────────────── */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex h-[52px] items-center gap-4 border-b border-border bg-background px-5">
          <nav className="flex items-center gap-2 text-[13px]">
            <span className="font-medium text-foreground">Dashboard</span>
          </nav>

          <SearchField
            placeholder="Search contacts, projects, vendors…"
            shortcut="⌘K"
            className="ml-auto mr-auto max-w-[480px] flex-1"
          />

          <div className="ml-auto flex items-center gap-1">
            <IconButton
              title="Help"
              onClick={() =>
                window.open("https://support.microsoft.com", "_blank", "noopener,noreferrer")
              }
            >
              <CircleHelp className={iconClass} aria-hidden="true" />
            </IconButton>

            {/* Notifications */}
            <div className="relative" ref={notifDropdown.ref}>
              <IconButton
                title="Notifications"
                className="relative"
                onClick={() => notifDropdown.setOpen((v) => !v)}
              >
                <Bell className={iconClass} aria-hidden="true" />
                <span className="absolute right-1 top-1 size-1.5 rounded-full bg-foreground" />
              </IconButton>
              <DropdownMenu
                open={notifDropdown.open}
                onSelect={() => notifDropdown.setOpen(false)}
                className="right-0 top-full w-[240px]"
                items={[
                  {
                    label: "Concept board v3 uploaded",
                    onClick: () => navigate("/projects"),
                  },
                  {
                    label: "Task blocked: MCB spec",
                    onClick: () => navigate("/projects"),
                  },
                  {
                    label: "View all notifications",
                    onClick: () => navigate("/conversations"),
                  },
                ]}
              />
            </div>

            <div className="mx-1 h-6 w-px bg-border" />

            {/* User avatar */}
            <div className="relative" ref={userMenuDropdown.ref}>
              <button
                type="button"
                onClick={() => userMenuDropdown.setOpen((v) => !v)}
                className="flex items-center gap-2 rounded-md px-2 py-1 hover:bg-hover focus-visible:outline-foreground"
              >
                <Avatar size="sm">MS</Avatar>
                <ChevronDown className="size-4 text-muted" aria-hidden="true" />
              </button>
              <DropdownMenu
                open={userMenuDropdown.open}
                onSelect={() => userMenuDropdown.setOpen(false)}
                className="right-0 top-full"
                items={[
                  { label: "Profile", icon: User, onClick: () => navigate("/settings") },
                  { label: "Settings", icon: Settings, onClick: () => navigate("/settings") },
                  { label: "Sign out", icon: LogOut, danger: true, onClick: () => signOut() },
                ]}
              />
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto bg-background">
          <div className="px-8 py-6">
            {/* ── Page header ─────────────────────────────── */}
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h1 className="font-display text-[22px] font-semibold tracking-tight text-foreground">
                  Dashboard
                </h1>
                <p className="mt-1 text-[13px] text-muted">
                  Monday, May 18 · 12 active projects · 3 deliverables awaiting approval
                </p>
              </div>
              <div className="flex items-center gap-2">
                {/* Date filter */}
                <div className="relative" ref={filterDropdown.ref}>
                  <Button
                    type="button"
                    variant="secondary"
                    className="h-auto gap-1.5 px-3.5 py-[7px] text-[13px] focus-visible:ring-foreground"
                    onClick={() => filterDropdown.setOpen((v) => !v)}
                  >
                    <Calendar className={iconClass} aria-hidden="true" />
                    {filterPeriod}
                    <ChevronDown className="size-4 text-muted" aria-hidden="true" />
                  </Button>
                  {filterDropdown.open && (
                    <div className="absolute right-0 top-full z-50 mt-1 min-w-[160px] rounded-lg border border-border bg-background py-1 shadow-lg">
                      {FILTER_PERIODS.map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => {
                            setFilterPeriod(p);
                            filterDropdown.setOpen(false);
                          }}
                          className={cn(
                            "flex w-full items-center px-3 py-2 text-left text-[13px] hover:bg-hover",
                            p === filterPeriod ? "font-medium text-primary" : "text-foreground",
                          )}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Export */}
                <Button
                  type="button"
                  variant="secondary"
                  className="h-auto gap-1.5 px-3.5 py-[7px] text-[13px] focus-visible:ring-foreground"
                  onClick={handleExport}
                >
                  <Download className={iconClass} aria-hidden="true" />
                  Export
                </Button>

                {/* New project */}
                <Button
                  type="button"
                  className="h-auto gap-1.5 bg-primary px-3.5 py-[7px] text-[13px] text-background hover:bg-primary-hover"
                  onClick={() => useUIStore.getState().openCreate("projects")}
                >
                  <Plus className={iconClass} aria-hidden="true" />
                  New project
                </Button>
              </div>
            </div>

            {/* ── KPI cards ───────────────────────────────── */}
            <div className="mb-6 grid grid-cols-4 gap-4">
              <Card
                className="cursor-pointer p-5 transition-shadow hover:shadow-md"
                onClick={() => navigate("/pipelines")}
              >
                <div className="flex items-start justify-between">
                  <div className="text-[12px] font-medium uppercase tracking-wider text-muted">
                    Pipeline value
                  </div>
                  <GitBranch className="size-4 text-muted" aria-hidden="true" />
                </div>
                <div className="font-display mt-2 text-[28px] font-semibold text-foreground">
                  ₹ 84.2 L
                </div>
                <div className="mt-1 flex items-center gap-1.5 text-[12px]">
                  <span className="flex items-center font-medium text-secondary">
                    <TrendingUp className={iconClass} aria-hidden="true" />
                    +12.4%
                  </span>
                  <span className="text-muted">vs last month</span>
                </div>
              </Card>

              <Card
                className="cursor-pointer p-5 transition-shadow hover:shadow-md"
                onClick={() => navigate("/projects")}
              >
                <div className="flex items-start justify-between">
                  <div className="text-[12px] font-medium uppercase tracking-wider text-muted">
                    Projects on track
                  </div>
                  <Layers className="size-4 text-muted" aria-hidden="true" />
                </div>
                <div className="font-display mt-2 text-[28px] font-semibold text-foreground">
                  9 <span className="text-[16px] font-normal text-muted">/ {projectsTotal}</span>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-border-subtle">
                    <div className="h-full w-3/4 rounded-full bg-foreground" />
                  </div>
                  <span className="text-[11px] text-muted">75%</span>
                </div>
              </Card>

              <Card
                className="cursor-pointer p-5 transition-shadow hover:shadow-md"
                onClick={() => navigate("/vendors")}
              >
                <div className="flex items-start justify-between">
                  <div className="text-[12px] font-medium uppercase tracking-wider text-muted">
                    Vendor utilization
                  </div>
                  <HardHat className="size-4 text-muted" aria-hidden="true" />
                </div>
                <div className="font-display mt-2 text-[28px] font-semibold text-foreground">
                  68%
                </div>
                <div className="mt-1 flex items-center gap-1.5 text-[12px]">
                  <span className="text-secondary">28 of {vendorsTotal} vendors active</span>
                </div>
              </Card>

              <Card
                className="cursor-pointer p-5 transition-shadow hover:shadow-md"
                onClick={() => navigate("/projects")}
              >
                <div className="flex items-start justify-between">
                  <div className="text-[12px] font-medium uppercase tracking-wider text-muted">
                    Deliverable cycle
                  </div>
                  <Clock className="size-4 text-muted" aria-hidden="true" />
                </div>
                <div className="font-display mt-2 text-[28px] font-semibold text-foreground">
                  3.2 <span className="text-[16px] font-normal text-muted">days</span>
                </div>
                <div className="mt-1 flex items-center gap-1.5 text-[12px]">
                  <span className="flex items-center font-medium text-secondary">
                    <TrendingUp className={iconClass} aria-hidden="true" />
                    +0.4d
                  </span>
                  <span className="text-muted">vs last month</span>
                </div>
              </Card>
            </div>

            {/* ── Charts row ──────────────────────────────── */}
            <div className="mb-6 grid grid-cols-3 gap-4">
              <Card className="col-span-2">
                <CardHeader>
                  <div>
                    <div className="text-[14px] font-semibold text-foreground">
                      Pipeline by stage
                    </div>
                    <div className="mt-0.5 text-[11px] text-muted">
                      Sales pipeline, indexed to expected close date
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Chart date filter */}
                    <div className="relative" ref={chartFilterDropdown.ref}>
                      <Button
                        type="button"
                        variant="ghost"
                        className="h-auto px-2.5 py-1.5 text-[12px] text-secondary hover:bg-hover hover:text-foreground focus-visible:ring-foreground"
                        onClick={() => chartFilterDropdown.setOpen((v) => !v)}
                      >
                        {filterPeriod}
                      </Button>
                      {chartFilterDropdown.open && (
                        <div className="absolute right-0 top-full z-50 mt-1 min-w-[160px] rounded-lg border border-border bg-background py-1 shadow-lg">
                          {FILTER_PERIODS.map((p) => (
                            <button
                              key={p}
                              type="button"
                              onClick={() => {
                                setFilterPeriod(p);
                                chartFilterDropdown.setOpen(false);
                              }}
                              className={cn(
                                "flex w-full items-center px-3 py-2 text-left text-[13px] hover:bg-hover",
                                p === filterPeriod
                                  ? "font-medium text-primary"
                                  : "text-foreground",
                              )}
                            >
                              {p}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Chart kebab */}
                    <div className="relative" ref={chartKebabDropdown.ref}>
                      <IconButton onClick={() => chartKebabDropdown.setOpen((v) => !v)}>
                        <MoreHorizontal className={iconClass} aria-hidden="true" />
                      </IconButton>
                      <DropdownMenu
                        open={chartKebabDropdown.open}
                        onSelect={() => chartKebabDropdown.setOpen(false)}
                        className="right-0 top-full"
                        items={[
                          {
                            label: "View full report",
                            icon: Eye,
                            onClick: () => navigate("/pipelines"),
                          },
                          {
                            label: "Export chart",
                            icon: Download,
                            onClick: () => window.print(),
                          },
                        ]}
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="relative flex h-[200px] items-end gap-4 px-4">
                    {chartBars.map((barClass, i) => (
                      <div key={i} className="flex flex-1 flex-col items-center gap-2">
                        <div
                          className={cn(
                            "w-full max-w-[64px] rounded-t-md transition-all",
                            barClass,
                          )}
                        />
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 grid grid-cols-5 gap-4 px-4 text-center">
                    {[
                      { label: "New", value: "₹ 12L" },
                      { label: "Qualified", value: "₹ 18L" },
                      { label: "Brief", value: "₹ 22L" },
                      { label: "Proposal", value: "₹ 16L" },
                      { label: "Won", value: "₹ 16.2L" },
                    ].map(({ label, value }) => (
                      <button
                        key={label}
                        type="button"
                        onClick={() => navigate("/pipelines")}
                        className="rounded-md py-1 hover:bg-hover"
                      >
                        <div className="text-[11px] text-muted">{label}</div>
                        <div className="text-[13px] font-semibold text-foreground">{value}</div>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recent activity */}
              <Card>
                <CardHeader>
                  <div className="text-[14px] font-semibold text-foreground">Recent activity</div>
                  <Button
                    type="button"
                    variant="ghost"
                    className="h-auto px-2.5 py-1.5 text-[12px] text-secondary hover:bg-hover hover:text-foreground focus-visible:ring-foreground"
                    onClick={() => navigate("/contacts")}
                  >
                    See all
                  </Button>
                </CardHeader>
                <CardContent className="p-0">
                  {activities.map((activity) => (
                    <button
                      key={`${activity.name}-${activity.target}`}
                      type="button"
                      onClick={() => navigate(activity.route)}
                      className="flex w-full items-start gap-3 border-b border-border-subtle px-5 py-3.5 text-left last:border-b-0 hover:bg-hover"
                    >
                      <Avatar size="sm">{activity.initials}</Avatar>
                      <div className="min-w-0 flex-1">
                        <div className="text-[12.5px] leading-snug text-secondary">
                          <span className="font-medium text-foreground">{activity.name}</span>{" "}
                          {activity.verb}{" "}
                          <span className="font-medium text-foreground">{activity.target}</span>
                        </div>
                        <div className="mt-0.5 text-[11px] text-muted">{activity.meta}</div>
                      </div>
                    </button>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* ── Bottom row ──────────────────────────────── */}
            <div className="grid grid-cols-3 gap-4">
              {/* Deliverables table */}
              <Card className="col-span-2">
                <CardHeader>
                  <div className="text-[14px] font-semibold text-foreground">
                    Upcoming deliveries this week
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    className="h-auto px-2.5 py-1.5 text-[12px] text-secondary hover:bg-hover hover:text-foreground focus-visible:ring-foreground"
                    onClick={() => navigate("/projects")}
                  >
                    View all projects
                  </Button>
                </CardHeader>
                <CardContent className="p-0">
                  <table className="w-full border-separate border-spacing-0 text-[13px]">
                    <thead>
                      <tr>
                        <th className={tableHeadClass}>Deliverable</th>
                        <th className={tableHeadClass}>Project</th>
                        <th className={tableHeadClass}>Vendor</th>
                        <th className={tableHeadClass}>Due</th>
                        <th className={tableHeadClass}>Status</th>
                        <th className={tableHeadClass}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {deliverables.map((row, index) => {
                        const isLast = index === deliverables.length - 1;
                        return (
                          <tr
                            key={row.deliverable}
                            className="cursor-pointer hover:bg-hover"
                            onClick={() => navigate("/projects")}
                          >
                            <td className={cn(tableCellClass, isLast && "border-border")}>
                              <span className="font-medium text-foreground">
                                {row.deliverable}
                              </span>
                            </td>
                            <td className={cn(tableCellClass, isLast && "border-border")}>
                              <span className="text-secondary">{row.project}</span>
                            </td>
                            <td className={cn(tableCellClass, isLast && "border-border")}>
                              <div className="flex items-center gap-2">
                                <Avatar size="sm">{row.initials}</Avatar>
                                <span className="text-secondary">{row.vendor}</span>
                              </div>
                            </td>
                            <td className={cn(tableCellClass, isLast && "border-border")}>
                              <span
                                className={cn(
                                  row.due === "Tomorrow"
                                    ? "font-medium text-foreground"
                                    : "text-muted",
                                )}
                              >
                                {row.due}
                              </span>
                            </td>
                            <td className={cn(tableCellClass, isLast && "border-border")}>
                              <StatusPill variant={row.statusVariant}>{row.status}</StatusPill>
                            </td>
                            <td
                              className={cn(tableCellClass, isLast && "border-border")}
                              onClick={(e) => e.stopPropagation()}
                            >
                              {row.status === "In review" && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    useUIStore.getState().openEdit("projects", "review")
                                  }
                                  className="flex items-center gap-1 rounded-md border border-border px-2 py-1 text-[11px] font-medium text-secondary hover:bg-hover hover:text-foreground"
                                >
                                  <CheckCircle2 className="size-3" aria-hidden="true" />
                                  Review
                                </button>
                              )}
                              {row.status === "Blocked" && (
                                <button
                                  type="button"
                                  onClick={() => navigate("/projects")}
                                  className="flex items-center gap-1 rounded-md border border-border px-2 py-1 text-[11px] font-medium text-secondary hover:bg-hover hover:text-foreground"
                                >
                                  <Eye className="size-3" aria-hidden="true" />
                                  View
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </CardContent>
              </Card>

              {/* Today's bookings */}
              <Card>
                <CardHeader>
                  <div className="text-[14px] font-semibold text-foreground">Today's bookings</div>
                  <Button
                    type="button"
                    variant="ghost"
                    className="h-auto px-2.5 py-1.5 text-[12px] text-secondary hover:bg-hover hover:text-foreground focus-visible:ring-foreground"
                    onClick={() => navigate("/calendar")}
                  >
                    Calendar
                  </Button>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-border-subtle">
                    {bookings.map((booking) => (
                      <button
                        key={`${booking.time}-${booking.title}`}
                        type="button"
                        onClick={() => navigate("/calendar")}
                        className="flex w-full items-start gap-3 px-5 py-3 text-left hover:bg-hover"
                      >
                        <div className="flex-shrink-0 text-center">
                          <div className="text-[11px] text-muted">{booking.time}</div>
                          <div className="text-[10px] text-muted">{booking.period}</div>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-[13px] font-medium text-foreground">
                            {booking.title}
                          </div>
                          <div className="truncate text-[12px] text-muted">{booking.detail}</div>
                        </div>
                        <Badge>{booking.badge}</Badge>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
