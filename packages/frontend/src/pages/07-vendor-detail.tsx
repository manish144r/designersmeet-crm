/* Generated from brief/mockups/07-vendor-detail.html via Codex fidelity pass 2026-05-19. Do not hand-edit. */

import type { ReactNode } from "react";
import {
  BarChart3,
  Bell,
  Calendar,
  ChevronDown,
  ChevronRight,
  ChevronsUpDown,
  CircleHelp,
  ClipboardList,
  ExternalLink,
  GitBranch,
  Globe,
  HardHat,
  Instagram,
  Layers,
  LayoutDashboard,
  LayoutGrid,
  Mail,
  MessageCircle,
  MessagesSquare,
  MoreHorizontal,
  PanelLeftClose,
  Pencil,
  Phone,
  Search,
  Settings,
  Star,
  UserPlus,
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

type BadgeVariant = "neutral" | "success" | "warning";

const workspaceNavItems: NavItem[] = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "Contacts", icon: Users },
  { label: "Vendors", icon: HardHat, active: true },
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

const profileTabs = [
  { label: "Profile", active: true },
  { label: "Projects", count: "12" },
  { label: "Tasks", count: "8" },
  { label: "Deliverables", count: "47" },
  { label: "Conversations" },
  { label: "Files" },
  { label: "Reviews", count: "12" },
];

const skills = [
  "Concept design",
  "3D visualization",
  "Brand identity",
  "Mood boards",
  "Material palette",
  "F&B interiors",
  "Residential",
  "VR walk-throughs",
];

const rateRows = [
  {
    deliverable: "Concept board",
    unit: "per project",
    rate: "₹ 45,000",
    notes: "3 revision rounds incl.",
  },
  {
    deliverable: "3D rendered view",
    unit: "per view",
    rate: "₹ 8,500",
    notes: "2 days SLA",
  },
  {
    deliverable: "VR walk-through",
    unit: "per project",
    rate: "₹ 1,20,000",
    notes: "10–15 day SLA",
  },
  {
    deliverable: "Brand identity refresh",
    unit: "per scope",
    rate: "₹ 2,80,000",
    notes: "Logo, palette, type",
  },
];

const projectRows = [
  {
    project: "Brand Refresh — Lumen Café",
    role: "Concept lead",
    period: "Mar 12 → Jun 30",
    fee: "₹ 3,25,000",
    status: "Active",
    variant: "success",
  },
  {
    project: "Whitefield Villa",
    role: "3D + VR",
    period: "Feb 2 → May 18",
    fee: "₹ 4,80,000",
    status: "Install",
    variant: "warning",
  },
  {
    project: "Indiranagar Loft Reno",
    role: "Concept board",
    period: "Jan 15 → Feb 10",
    fee: "₹ 95,000",
    status: "Closed",
    variant: "neutral",
  },
  {
    project: "Koramangala Co-work",
    role: "Brand + interiors",
    period: "Nov 4 → Jan 8",
    fee: "₹ 5,40,000",
    status: "Closed",
    variant: "neutral",
  },
  {
    project: "Café Espresso Roastery",
    role: "Concept",
    period: "Sep 1 → Oct 30",
    fee: "₹ 1,20,000",
    status: "Closed",
    variant: "neutral",
  },
] as const;

const complianceItems = [
  {
    title: "NDA",
    detail: "Signed Jan 12, 2024",
    status: "Valid",
    variant: "success",
  },
  {
    title: "MSA",
    detail: "Signed Jan 12, 2024 · renews Jan 2027",
    status: "Valid",
    variant: "success",
  },
  {
    title: "GST registration",
    detail: "29AABCT1234X1Z5",
    status: "Verified",
    variant: "success",
  },
  {
    title: "Insurance",
    detail: "Expires Jul 14, 2026",
    status: "Renew soon",
    variant: "warning",
  },
] as const;

const teamContacts = [
  { initials: "RB", name: "Rohan Batra", role: "Founder · Primary contact" },
  { initials: "SK", name: "Sneha Kapur", role: "3D lead" },
  { initials: "DP", name: "Devika Pillai", role: "Project coordinator" },
];

const iconClass = "size-4 shrink-0";

const badgeVariants: Record<BadgeVariant, string> = {
  neutral: "bg-border-subtle text-secondary",
  success: "bg-success-tint text-success",
  warning: "bg-warning-tint text-warning",
};

const tableHeadClass =
  "border-y border-border bg-subtle px-3.5 py-[9px] text-left text-[11px] font-medium uppercase tracking-[0.04em] text-muted";

const tableCellClass = "border-b border-border-subtle px-3.5 py-[11px] align-middle";

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
  size?: "default" | "sm" | "xl";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full border border-background bg-border-subtle font-semibold uppercase text-secondary",
        size === "sm" && "size-[22px] text-[10px]",
        size === "default" && "size-7 text-[12px]",
        size === "xl" && "size-16 text-[22px]",
        className,
      )}
    >
      {children}
    </div>
  );
}

function Badge({
  children,
  variant = "neutral",
  dot = false,
  className,
}: {
  children: ReactNode;
  variant?: BadgeVariant;
  dot?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium leading-[18px] tracking-[0.01em]",
        dot && "before:size-1.5 before:rounded-full before:bg-current before:content-['']",
        badgeVariants[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}

function StatusPill({
  children,
  variant = "neutral",
}: {
  children: ReactNode;
  variant?: BadgeVariant;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-[5px] rounded-full border border-transparent px-2 py-[3px] text-[11px] font-medium before:size-1.5 before:rounded-full before:bg-current before:content-['']",
        badgeVariants[variant],
      )}
    >
      {children}
    </span>
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
      <Icon className={cn(iconClass, item.active ? "text-primary" : "text-muted")} aria-hidden="true" />
      <span>{item.label}</span>
    </div>
  );
}

function PortfolioPlaceholder() {
  return (
    <div className="flex aspect-[4/3] items-center justify-center bg-gradient-to-br from-subtle to-border-subtle">
      <svg viewBox="0 0 60 45" className="h-9 w-12 text-muted" aria-hidden="true">
        <rect
          x="2"
          y="6"
          width="56"
          height="33"
          rx="2"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <circle cx="14" cy="18" r="3" fill="currentColor" opacity="0.4" />
        <path
          d="M2 32 L20 22 L34 30 L48 18 L58 28 L58 39 L2 39 Z"
          fill="currentColor"
          opacity="0.25"
        />
      </svg>
    </div>
  );
}

export default function VendorDetail() {
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
            <span className="text-muted">Vendors</span>
            <ChevronRight className="size-4 text-disabled" aria-hidden="true" />
            <span className="font-medium text-foreground">Aurora Studio</span>
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
          <div className="flex h-full">
            <div className="flex-1 overflow-auto">
              <div className="border-b border-border-subtle px-8 pb-4 pt-6">
                <div className="flex items-start gap-4">
                  <Avatar size="xl">AS</Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h1 className="font-display text-[24px] font-semibold tracking-normal text-foreground">
                        Aurora Studio
                      </h1>
                      <Badge>Tier-1 partner</Badge>
                      <Badge variant="success" dot>
                        Active
                      </Badge>
                      <div className="ml-2 flex items-center gap-1">
                        <Star className="size-4 shrink-0 fill-current text-warning" aria-hidden="true" />
                        <span className="text-[13px] font-semibold text-foreground">4.9</span>
                        <span className="text-[12px] text-muted">· 12 projects</span>
                      </div>
                    </div>
                    <div className="mt-1 text-[13px] text-muted">
                      Concept · 3D visualization · Brand refresh · Founded 2018 · Bengaluru + Chennai
                    </div>
                    <div className="mt-3 flex items-center gap-4 text-[12px] text-secondary">
                      <span className="flex items-center gap-1.5">
                        <Mail className="size-4 text-muted" aria-hidden="true" />
                        hello@aurorastudio.in
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Phone className="size-4 text-muted" aria-hidden="true" />
                        +91 80 4123 5678
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Globe className="size-4 text-muted" aria-hidden="true" />
                        aurorastudio.in
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Instagram className="size-4 text-muted" aria-hidden="true" />
                        @aurora.studio
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      className="h-auto gap-1.5 px-3.5 py-[7px] text-[13px] focus-visible:ring-foreground"
                    >
                      <MessageCircle className={iconClass} aria-hidden="true" />
                      WhatsApp
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      className="h-auto gap-1.5 px-3.5 py-[7px] text-[13px] focus-visible:ring-foreground"
                    >
                      <Mail className={iconClass} aria-hidden="true" />
                      Email
                    </Button>
                    <Button
                      type="button"
                      className="h-auto gap-1.5 bg-primary px-3.5 py-[7px] text-[13px] text-background hover:bg-primary"
                    >
                      <UserPlus className={iconClass} aria-hidden="true" />
                      Assign to project
                    </Button>
                    <IconButton title="More">
                      <MoreHorizontal className={iconClass} aria-hidden="true" />
                    </IconButton>
                  </div>
                </div>

                <div className="mt-5 flex gap-1 border-b border-border">
                  {profileTabs.map((tab) => (
                    <div
                      key={tab.label}
                      className={cn(
                        "-mb-px flex cursor-pointer items-center border-b-2 border-transparent px-3.5 py-2.5 text-[13px] font-medium text-secondary hover:text-foreground",
                        tab.active && "border-primary text-foreground",
                      )}
                      data-active={tab.active ? "true" : undefined}
                    >
                      {tab.label}
                      {tab.count ? <Badge className="ml-1">{tab.count}</Badge> : null}
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-6 px-8 py-6">
                <div className="col-span-2 space-y-4">
                  <Card>
                    <CardHeader>
                      <div className="text-[13px] font-semibold text-foreground">
                        Skills & specialization
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        className="h-auto gap-1.5 px-2.5 py-1.5 text-[12px] text-secondary hover:bg-hover hover:text-foreground"
                      >
                        <Pencil className={iconClass} aria-hidden="true" />
                        Edit
                      </Button>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {skills.map((skill) => (
                          <Badge key={skill}>{skill}</Badge>
                        ))}
                      </div>
                      <div className="mt-5 grid grid-cols-3 gap-4 border-t border-border-subtle pt-4">
                        <div>
                          <div className="text-[11px] uppercase tracking-[0.04em] text-muted">
                            Avg. project value
                          </div>
                          <div className="mt-1 text-[16px] font-semibold text-foreground">₹ 4.2 L</div>
                        </div>
                        <div>
                          <div className="text-[11px] uppercase tracking-[0.04em] text-muted">
                            On-time delivery
                          </div>
                          <div className="mt-1 text-[16px] font-semibold text-success">94%</div>
                        </div>
                        <div>
                          <div className="text-[11px] uppercase tracking-[0.04em] text-muted">
                            Last assignment
                          </div>
                          <div className="mt-1 text-[16px] font-semibold text-foreground">5h ago</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <div className="text-[13px] font-semibold text-foreground">Rate card</div>
                      <Button
                        type="button"
                        variant="ghost"
                        className="h-auto gap-1.5 px-2.5 py-1.5 text-[12px] text-secondary hover:bg-hover hover:text-foreground"
                      >
                        <ExternalLink className={iconClass} aria-hidden="true" />
                        View MSA
                      </Button>
                    </CardHeader>
                    <CardContent className="p-0">
                      <table className="w-full border-separate border-spacing-0 text-[13px]">
                        <thead>
                          <tr>
                            <th className={tableHeadClass}>Deliverable</th>
                            <th className={tableHeadClass}>Unit</th>
                            <th className={tableHeadClass}>Rate</th>
                            <th className={tableHeadClass}>Notes</th>
                          </tr>
                        </thead>
                        <tbody>
                          {rateRows.map((row, index) => {
                            const isLast = index === rateRows.length - 1;

                            return (
                              <tr key={row.deliverable} className="hover:bg-hover">
                                <td className={cn(tableCellClass, isLast && "border-border")}>
                                  <span className="font-medium text-foreground">{row.deliverable}</span>
                                </td>
                                <td className={cn(tableCellClass, isLast && "border-border")}>
                                  {row.unit}
                                </td>
                                <td className={cn(tableCellClass, isLast && "border-border")}>
                                  {row.rate}
                                </td>
                                <td className={cn(tableCellClass, "text-muted", isLast && "border-border")}>
                                  {row.notes}
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
                      <div className="text-[13px] font-semibold text-foreground">Project history</div>
                      <Button
                        type="button"
                        variant="ghost"
                        className="h-auto px-2.5 py-1.5 text-[12px] text-secondary hover:bg-hover hover:text-foreground"
                      >
                        All 12 →
                      </Button>
                    </CardHeader>
                    <CardContent className="p-0">
                      <table className="w-full border-separate border-spacing-0 text-[13px]">
                        <thead>
                          <tr>
                            <th className={tableHeadClass}>Project</th>
                            <th className={tableHeadClass}>Role</th>
                            <th className={tableHeadClass}>Period</th>
                            <th className={tableHeadClass}>Fee</th>
                            <th className={tableHeadClass}>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {projectRows.map((row, index) => {
                            const isLast = index === projectRows.length - 1;

                            return (
                              <tr key={row.project} className="hover:bg-hover">
                                <td className={cn(tableCellClass, isLast && "border-border")}>
                                  <span className="font-medium text-foreground">{row.project}</span>
                                </td>
                                <td className={cn(tableCellClass, isLast && "border-border")}>
                                  {row.role}
                                </td>
                                <td className={cn(tableCellClass, isLast && "border-border")}>
                                  {row.period}
                                </td>
                                <td className={cn(tableCellClass, isLast && "border-border")}>
                                  {row.fee}
                                </td>
                                <td className={cn(tableCellClass, isLast && "border-border")}>
                                  <StatusPill variant={row.variant}>{row.status}</StatusPill>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </CardContent>
                  </Card>
                </div>

                <div className="col-span-1 space-y-4">
                  <Card>
                    <CardHeader>
                      <div className="text-[13px] font-semibold text-foreground">Compliance</div>
                    </CardHeader>
                    <CardContent className="p-0">
                      {complianceItems.map((item, index) => (
                        <div
                          key={item.title}
                          className={cn(
                            "flex items-center justify-between px-4 py-3",
                            index !== complianceItems.length - 1 && "border-b border-border-subtle",
                          )}
                        >
                          <div>
                            <div className="text-[12.5px] font-medium text-foreground">{item.title}</div>
                            <div
                              className={cn(
                                "text-[11px]",
                                item.variant === "warning" ? "text-warning" : "text-muted",
                              )}
                            >
                              {item.detail}
                            </div>
                          </div>
                          <Badge variant={item.variant} dot>
                            {item.status}
                          </Badge>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <div className="text-[13px] font-semibold text-foreground">Portfolio</div>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="grid grid-cols-2 gap-px bg-border-subtle p-px">
                        <PortfolioPlaceholder />
                        <PortfolioPlaceholder />
                        <PortfolioPlaceholder />
                        <PortfolioPlaceholder />
                      </div>
                      <div className="border-t border-border-subtle px-4 py-2.5 text-center">
                        <a
                          href="#"
                          className="text-[12px] font-medium text-secondary hover:text-foreground hover:underline"
                        >
                          Open SharePoint folder →
                        </a>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <div className="text-[13px] font-semibold text-foreground">Team contacts</div>
                    </CardHeader>
                    <CardContent className="p-0">
                      {teamContacts.map((contact, index) => (
                        <div
                          key={contact.initials}
                          className={cn(
                            "flex items-center gap-3 px-4 py-2.5",
                            index !== teamContacts.length - 1 && "border-b border-border-subtle",
                          )}
                        >
                          <Avatar size="sm">{contact.initials}</Avatar>
                          <div className="min-w-0 flex-1">
                            <div className="text-[12.5px] font-medium text-foreground">
                              {contact.name}
                            </div>
                            <div className="text-[11px] text-muted">{contact.role}</div>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
