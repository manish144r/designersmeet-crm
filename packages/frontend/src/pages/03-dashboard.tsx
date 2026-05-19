/* Generated from brief/mockups/03-dashboard.html via Codex fidelity pass 2026-05-19. Do not hand-edit. */

import type { ReactNode } from "react";
import {
  BarChart3,
  Bell,
  Calendar,
  ChevronDown,
  ChevronsUpDown,
  CircleHelp,
  ClipboardList,
  Clock,
  Download,
  GitBranch,
  HardHat,
  Layers,
  LayoutDashboard,
  LayoutGrid,
  Mail,
  MessagesSquare,
  MoreHorizontal,
  PanelLeftClose,
  Plus,
  Search,
  Settings,
  TrendingUp,
  Users,
  UsersRound,
  Zap,
  type LucideIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

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
  },
  {
    initials: "AS",
    name: "Aurora Studio",
    verb: "uploaded",
    target: "Concept board v3.pdf",
    meta: "Brand Refresh — Lumen Café · 22m ago",
  },
  {
    initials: "PR",
    name: "Priya Raghavan",
    verb: "replied to",
    target: "RE: Snag list review",
    meta: "HSR Penthouse · 1h ago",
  },
  {
    initials: "VE",
    name: "Voltek Electricals",
    verb: "marked task blocked",
    target: "Awaiting MCB spec confirmation",
    meta: "HSR Penthouse · 2h ago",
  },
  {
    initials: "MK",
    name: "Manjunath Karpenter Co",
    verb: "accepted assignment",
    target: "Carpentry — Phase 1",
    meta: "Indiranagar Loft Reno · 4h ago",
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
    statusVariant: "neutral",
  },
  {
    deliverable: "Carpentry shop drawings",
    project: "Indiranagar Loft Reno",
    initials: "MK",
    vendor: "Manjunath Karpenter Co",
    due: "Thu, May 21",
    status: "On track",
    statusVariant: "success",
  },
  {
    deliverable: "Electrical load schedule",
    project: "HSR Penthouse",
    initials: "VE",
    vendor: "Voltek Electricals",
    due: "Tomorrow",
    status: "Blocked",
    statusVariant: "emphasis",
  },
  {
    deliverable: "Final 3D walkthrough",
    project: "Whitefield Villa",
    initials: "RB",
    vendor: "Render Boutique",
    due: "Fri, May 22",
    status: "In review",
    statusVariant: "neutral",
  },
  {
    deliverable: "Snag list — site visit 4",
    project: "JP Nagar Bungalow",
    initials: "MS",
    vendor: "Manish (PM)",
    due: "Fri, May 22",
    status: "Approved",
    statusVariant: "success",
  },
] as const;

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

function IconButton({
  title,
  children,
  className,
}: {
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      title={title}
      aria-label={title}
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

function SidebarNavItem({ item }: { item: NavItem }) {
  const Icon = item.icon;

  return (
    <div
      className={cn(
        "flex cursor-pointer select-none items-center gap-2.5 rounded-md px-2.5 py-[7px] text-[13px] font-medium transition-colors",
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
    </div>
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

export default function Dashboard() {
  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground antialiased">
      <aside className="flex w-[232px] flex-shrink-0 flex-col border-r border-border bg-sidebar">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="inline-flex items-center gap-2 text-[14px] font-semibold tracking-normal text-foreground">
            <span className="inline-flex size-[22px] items-center justify-center rounded-[5px] border border-border bg-background text-[12px] font-bold text-foreground">
              D
            </span>
            <span>DesignersMeet</span>
          </div>
          <IconButton title="Collapse">
            <PanelLeftClose className={iconClass} aria-hidden="true" />
          </IconButton>
        </div>

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

        <nav className="flex-1 overflow-y-auto px-2 pt-3">
          <div className="mb-1.5 mt-3.5 px-2.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-muted">
            Workspace
          </div>
          <div className="space-y-0.5">
            {workspaceNavItems.map((item) => (
              <SidebarNavItem key={item.label} item={item} />
            ))}
          </div>

          <div className="mb-1.5 mt-3.5 px-2.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-muted">
            Surfaces
          </div>
          <div className="space-y-0.5">
            {surfaceNavItems.map((item) => (
              <SidebarNavItem key={item.label} item={item} />
            ))}
          </div>
        </nav>

        <div className="border-t border-border px-3 py-3">
          <div className="flex items-center gap-2 px-1">
            <Avatar>MS</Avatar>
            <div className="min-w-0">
              <div className="truncate text-[12px] font-semibold text-foreground">Manish</div>
              <div className="truncate text-[10px] text-muted">Workspace owner</div>
            </div>
            <IconButton title="Menu" className="ml-auto">
              <MoreHorizontal className={iconClass} aria-hidden="true" />
            </IconButton>
          </div>
        </div>
      </aside>

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
            <IconButton title="Help">
              <CircleHelp className={iconClass} aria-hidden="true" />
            </IconButton>
            <IconButton title="Notifications" className="relative">
              <Bell className={iconClass} aria-hidden="true" />
              <span className="absolute right-1 top-1 size-1.5 rounded-full bg-foreground" />
            </IconButton>
            <div className="mx-1 h-6 w-px bg-border" />
            <button
              type="button"
              className="flex items-center gap-2 rounded-md px-2 py-1 hover:bg-hover focus-visible:outline-foreground"
            >
              <Avatar size="sm">MS</Avatar>
              <ChevronDown className="size-4 text-muted" aria-hidden="true" />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-auto bg-background">
          <div className="px-8 py-6">
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
                <Button
                  type="button"
                  variant="secondary"
                  className="h-auto gap-1.5 px-3.5 py-[7px] text-[13px] focus-visible:ring-foreground"
                >
                  <Calendar className={iconClass} aria-hidden="true" />
                  Last 30 days
                  <ChevronDown className="size-4 text-muted" aria-hidden="true" />
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  className="h-auto gap-1.5 px-3.5 py-[7px] text-[13px] focus-visible:ring-foreground"
                >
                  <Download className={iconClass} aria-hidden="true" />
                  Export
                </Button>
                <Button
                  type="button"
                  className="h-auto gap-1.5 bg-primary px-3.5 py-[7px] text-[13px] text-background hover:bg-primary-hover"
                >
                  <Plus className={iconClass} aria-hidden="true" />
                  New project
                </Button>
              </div>
            </div>

            <div className="mb-6 grid grid-cols-4 gap-4">
              <Card className="p-5">
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

              <Card className="p-5">
                <div className="flex items-start justify-between">
                  <div className="text-[12px] font-medium uppercase tracking-wider text-muted">
                    Projects on track
                  </div>
                  <Layers className="size-4 text-muted" aria-hidden="true" />
                </div>
                <div className="font-display mt-2 text-[28px] font-semibold text-foreground">
                  9 <span className="text-[16px] font-normal text-muted">/ 12</span>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-border-subtle">
                    <div className="h-full w-3/4 rounded-full bg-foreground" />
                  </div>
                  <span className="text-[11px] text-muted">75%</span>
                </div>
              </Card>

              <Card className="p-5">
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
                  <span className="text-secondary">28 of 41 vendors active</span>
                </div>
              </Card>

              <Card className="p-5">
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
                    <Button
                      type="button"
                      variant="ghost"
                      className="h-auto px-2.5 py-1.5 text-[12px] text-secondary hover:bg-hover hover:text-foreground focus-visible:ring-foreground"
                    >
                      Last 30 days
                    </Button>
                    <IconButton>
                      <MoreHorizontal className={iconClass} aria-hidden="true" />
                    </IconButton>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="relative flex h-[200px] items-end gap-4 px-4">
                    {chartBars.map((barClass) => (
                      <div key={barClass} className="flex flex-1 flex-col items-center gap-2">
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
                    <div>
                      <div className="text-[11px] text-muted">New</div>
                      <div className="text-[13px] font-semibold text-foreground">₹ 12L</div>
                    </div>
                    <div>
                      <div className="text-[11px] text-muted">Qualified</div>
                      <div className="text-[13px] font-semibold text-foreground">₹ 18L</div>
                    </div>
                    <div>
                      <div className="text-[11px] text-muted">Brief</div>
                      <div className="text-[13px] font-semibold text-foreground">₹ 22L</div>
                    </div>
                    <div>
                      <div className="text-[11px] text-muted">Proposal</div>
                      <div className="text-[13px] font-semibold text-foreground">₹ 16L</div>
                    </div>
                    <div>
                      <div className="text-[11px] text-muted">Won</div>
                      <div className="text-[13px] font-semibold text-foreground">₹ 16.2L</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="text-[14px] font-semibold text-foreground">Recent activity</div>
                  <Button
                    type="button"
                    variant="ghost"
                    className="h-auto px-2.5 py-1.5 text-[12px] text-secondary hover:bg-hover hover:text-foreground focus-visible:ring-foreground"
                  >
                    See all
                  </Button>
                </CardHeader>
                <CardContent className="p-0">
                  {activities.map((activity) => (
                    <div
                      key={`${activity.name}-${activity.target}`}
                      className="flex items-start gap-3 border-b border-border-subtle px-5 py-3.5 last:border-b-0"
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
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <Card className="col-span-2">
                <CardHeader>
                  <div className="text-[14px] font-semibold text-foreground">
                    Upcoming deliveries this week
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    className="h-auto px-2.5 py-1.5 text-[12px] text-secondary hover:bg-hover hover:text-foreground focus-visible:ring-foreground"
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
                      </tr>
                    </thead>
                    <tbody>
                      {deliverables.map((row, index) => {
                        const isLast = index === deliverables.length - 1;

                        return (
                          <tr key={row.deliverable} className="hover:bg-hover">
                            <td className={cn(tableCellClass, isLast && "border-border")}>
                              <span className="font-medium text-foreground">{row.deliverable}</span>
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
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="text-[14px] font-semibold text-foreground">Today's bookings</div>
                  <Button
                    type="button"
                    variant="ghost"
                    className="h-auto px-2.5 py-1.5 text-[12px] text-secondary hover:bg-hover hover:text-foreground focus-visible:ring-foreground"
                  >
                    Calendar
                  </Button>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-border-subtle">
                    {bookings.map((booking) => (
                      <div key={`${booking.time}-${booking.title}`} className="flex items-start gap-3 px-5 py-3">
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
                      </div>
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
