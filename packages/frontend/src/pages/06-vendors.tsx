/* Generated from brief/mockups/06-vendors.html via Codex fidelity pass 2026-05-19. Do not hand-edit. */

import type { ReactNode } from "react";
import {
  BarChart3,
  Bell,
  Bookmark,
  Calendar,
  ChevronDown,
  ChevronRight,
  ChevronsUpDown,
  CircleHelp,
  ClipboardList,
  Filter,
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
  Send,
  Settings,
  ShieldCheck,
  Star,
  Upload,
  Users,
  UsersRound,
  Zap,
  type LucideIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type NavItem = {
  label: string;
  icon: LucideIcon;
  active?: boolean;
};

type Vendor = {
  initials: string;
  name: string;
  skills: string;
  regions: string[];
  tier: "Tier-1" | "Tier-2" | "Tier-3";
  rating: string;
  reviews: string;
  agreement: "Signed" | "Pending";
  status: "Active" | "Paused" | "Onboarding";
};

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

const savedViews = [
  { label: "All vendors", count: "41", active: true },
  { label: "Tier-1 partners", count: "7" },
  { label: "Active this month", count: "28" },
  { label: "Onboarding", count: "3" },
  { label: "NDA expiring < 30d", count: "2" },
];

const vendors: Vendor[] = [
  {
    initials: "AS",
    name: "Aurora Studio",
    skills: "Concept · 3D viz · Brand",
    regions: ["KA", "TN"],
    tier: "Tier-1",
    rating: "4.9",
    reviews: "12",
    agreement: "Signed",
    status: "Active",
  },
  {
    initials: "MK",
    name: "Manjunath Karpenter Co",
    skills: "Carpentry · Modular",
    regions: ["KA"],
    tier: "Tier-1",
    rating: "4.7",
    reviews: "8",
    agreement: "Signed",
    status: "Active",
  },
  {
    initials: "VE",
    name: "Voltek Electricals",
    skills: "Electrical · Smart home",
    regions: ["KA"],
    tier: "Tier-2",
    rating: "4.5",
    reviews: "6",
    agreement: "Signed",
    status: "Active",
  },
  {
    initials: "RB",
    name: "Render Boutique",
    skills: "3D · VR walk-throughs",
    regions: ["KA", "MH"],
    tier: "Tier-1",
    rating: "4.8",
    reviews: "4",
    agreement: "Signed",
    status: "Active",
  },
  {
    initials: "FT",
    name: "FabTextiles",
    skills: "Soft furnishings · Drapery",
    regions: ["KA", "TN"],
    tier: "Tier-2",
    rating: "4.6",
    reviews: "11",
    agreement: "Signed",
    status: "Active",
  },
  {
    initials: "MN",
    name: "Marble & Stone Mart",
    skills: "Stone · Marble · Granite",
    regions: ["KA"],
    tier: "Tier-2",
    rating: "4.4",
    reviews: "9",
    agreement: "Signed",
    status: "Active",
  },
  {
    initials: "PP",
    name: "Plumbline Pros",
    skills: "Plumbing · Sanitaryware",
    regions: ["KA"],
    tier: "Tier-3",
    rating: "4.2",
    reviews: "3",
    agreement: "Signed",
    status: "Active",
  },
  {
    initials: "LP",
    name: "Light & Form",
    skills: "Lighting · Fixtures",
    regions: ["KA", "MH"],
    tier: "Tier-1",
    rating: "4.7",
    reviews: "5",
    agreement: "Signed",
    status: "Active",
  },
  {
    initials: "WB",
    name: "Woodbarn Joinery",
    skills: "Joinery · Veneers",
    regions: ["KA"],
    tier: "Tier-2",
    rating: "4.3",
    reviews: "4",
    agreement: "Signed",
    status: "Paused",
  },
  {
    initials: "AC",
    name: "AC Climate Solutions",
    skills: "HVAC · Climate",
    regions: ["KA"],
    tier: "Tier-3",
    rating: "4.1",
    reviews: "2",
    agreement: "Pending",
    status: "Onboarding",
  },
  {
    initials: "PS",
    name: "Patel Steel Fab",
    skills: "Metalwork · Steel",
    regions: ["KA", "MH"],
    tier: "Tier-2",
    rating: "4.5",
    reviews: "6",
    agreement: "Signed",
    status: "Active",
  },
  {
    initials: "GF",
    name: "Green Foliage Co",
    skills: "Landscaping · Planters",
    regions: ["KA"],
    tier: "Tier-2",
    rating: "4.6",
    reviews: "3",
    agreement: "Signed",
    status: "Active",
  },
];

const iconClass = "size-4 shrink-0";

const badgeClass =
  "inline-flex items-center gap-1 rounded-full bg-border-subtle px-2 py-0.5 text-[11px] font-medium leading-[18px] tracking-normal text-secondary";

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

function Badge({
  children,
  className,
  active,
}: {
  children: ReactNode;
  className?: string;
  active?: boolean;
}) {
  return (
    <span className={cn(badgeClass, active && "text-foreground", className)}>{children}</span>
  );
}

function StatusBadge({ status }: { status: Vendor["status"] }) {
  return (
    <span
      className={cn(
        badgeClass,
        "before:size-1.5 before:rounded-full before:bg-current before:content-['']",
        status === "Active" ? "bg-primary-tint text-primary" : "text-secondary",
      )}
    >
      {status}
    </span>
  );
}

function AgreementStatus({ agreement }: { agreement: Vendor["agreement"] }) {
  if (agreement === "Signed") {
    return (
      <span className="inline-flex items-center gap-1 text-secondary">
        <ShieldCheck className={iconClass} aria-hidden="true" />
        Signed
      </span>
    );
  }

  return <span className="text-secondary">Pending</span>;
}

export default function Vendors() {
  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground antialiased">
      <aside className="flex w-[232px] shrink-0 flex-col border-r border-border bg-sidebar">
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
          <div className="flex flex-col gap-0.5">
            {workspaceNavItems.map((item) => (
              <SidebarNavItem key={item.label} item={item} />
            ))}
          </div>

          <div className="mb-1.5 mt-3.5 px-2.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-muted">
            Surfaces
          </div>
          <div className="flex flex-col gap-0.5">
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
            <span className="font-medium text-foreground">All vendors</span>
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
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between px-8 pb-3 pt-6">
              <div>
                <h1 className="font-display text-[22px] font-semibold tracking-normal text-foreground">
                  Vendors
                </h1>
                <p className="mt-0.5 text-[13px] text-muted">
                  41 vendors · 28 active this month · 7 Tier-1 partners
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  className="h-auto gap-1.5 px-3.5 py-[7px] text-[13px] focus-visible:ring-foreground"
                >
                  <Upload className={iconClass} aria-hidden="true" />
                  Import from old CRM
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  className="h-auto gap-1.5 px-3.5 py-[7px] text-[13px] focus-visible:ring-foreground"
                >
                  <Send className={iconClass} aria-hidden="true" />
                  Send onboarding form
                </Button>
                <Button
                  type="button"
                  className="h-auto gap-1.5 bg-primary px-3.5 py-[7px] text-[13px] text-background hover:bg-primary-hover"
                >
                  <Plus className={iconClass} aria-hidden="true" />
                  Invite vendor
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-2 border-b border-border-subtle px-8 pb-3">
              {savedViews.map((view) => (
                <button
                  type="button"
                  key={view.label}
                  className={cn(
                    badgeClass,
                    "hover:bg-border focus-visible:outline-foreground",
                    view.active && "text-foreground",
                  )}
                >
                  {view.label}
                  <span className="ml-1 text-muted">{view.count}</span>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 border-b border-border bg-subtle/40 px-8 py-3">
              <SearchField placeholder="Filter vendors…" className="w-[280px]" />
              <Button
                type="button"
                variant="secondary"
                className="h-auto gap-1.5 px-3.5 py-[7px] text-[12px] focus-visible:ring-foreground"
              >
                <Filter className={iconClass} aria-hidden="true" />
                Skill: Any
                <ChevronDown className="size-4 text-muted" aria-hidden="true" />
              </Button>
              <Button
                type="button"
                variant="secondary"
                className="h-auto gap-1.5 px-3.5 py-[7px] text-[12px] focus-visible:ring-foreground"
              >
                Region: Karnataka
                <ChevronDown className="size-4 text-muted" aria-hidden="true" />
              </Button>
              <Button
                type="button"
                variant="secondary"
                className="h-auto gap-1.5 px-3.5 py-[7px] text-[12px] focus-visible:ring-foreground"
              >
                Tier: Any
                <ChevronDown className="size-4 text-muted" aria-hidden="true" />
              </Button>
              <Button
                type="button"
                variant="secondary"
                className="h-auto gap-1.5 px-3.5 py-[7px] text-[12px] focus-visible:ring-foreground"
              >
                Status: Any
                <ChevronDown className="size-4 text-muted" aria-hidden="true" />
              </Button>
              <div className="flex-1" />
              <Button
                type="button"
                variant="ghost"
                className="h-auto gap-1.5 px-2.5 py-1.5 text-[12px] text-secondary hover:bg-hover hover:text-foreground focus-visible:ring-foreground"
              >
                <Bookmark className={iconClass} aria-hidden="true" />
                Save view
              </Button>
            </div>

            <div className="flex-1 overflow-auto">
              <table className="w-full border-separate border-spacing-0 text-[13px]">
                <thead>
                  <tr>
                    <th className={cn(tableHeadClass, "w-8")}>
                      <input
                        type="checkbox"
                        className="size-4 rounded border-border-strong accent-foreground"
                      />
                    </th>
                    <th className={tableHeadClass}>Vendor</th>
                    <th className={tableHeadClass}>Regions</th>
                    <th className={tableHeadClass}>Tier</th>
                    <th className={tableHeadClass}>Rating</th>
                    <th className={tableHeadClass}>NDA / MSA</th>
                    <th className={tableHeadClass}>Status</th>
                    <th className={tableHeadClass} />
                  </tr>
                </thead>
                <tbody>
                  {vendors.map((vendor, index) => {
                    const isLast = index === vendors.length - 1;

                    return (
                      <tr key={vendor.name} className="hover:bg-hover">
                        <td className={cn(tableCellClass, isLast && "border-border")}>
                          <input
                            type="checkbox"
                            className="size-4 rounded border-border-strong accent-foreground"
                          />
                        </td>
                        <td className={cn(tableCellClass, isLast && "border-border")}>
                          <div className="flex items-center gap-3">
                            <Avatar size="sm">{vendor.initials}</Avatar>
                            <div>
                              <div className="font-medium text-foreground">{vendor.name}</div>
                              <div className="text-[11px] text-muted">{vendor.skills}</div>
                            </div>
                          </div>
                        </td>
                        <td className={cn(tableCellClass, isLast && "border-border")}>
                          <div className="flex flex-wrap gap-1">
                            {vendor.regions.map((region) => (
                              <Badge key={`${vendor.name}-${region}`} className="text-[10px]">
                                {region}
                              </Badge>
                            ))}
                          </div>
                        </td>
                        <td className={cn(tableCellClass, isLast && "border-border")}>
                          <Badge>{vendor.tier}</Badge>
                        </td>
                        <td className={cn(tableCellClass, isLast && "border-border")}>
                          <div className="flex items-center gap-1.5">
                            <Star
                              className="size-4 shrink-0 fill-current text-secondary"
                              aria-hidden="true"
                            />
                            <span className="font-medium text-foreground">{vendor.rating}</span>
                            <span className="text-[11px] text-muted">({vendor.reviews})</span>
                          </div>
                        </td>
                        <td className={cn(tableCellClass, isLast && "border-border")}>
                          <AgreementStatus agreement={vendor.agreement} />
                        </td>
                        <td className={cn(tableCellClass, isLast && "border-border")}>
                          <StatusBadge status={vendor.status} />
                        </td>
                        <td className={cn(tableCellClass, "text-right", isLast && "border-border")}>
                          <IconButton title={`${vendor.name} actions`}>
                            <MoreHorizontal className={iconClass} aria-hidden="true" />
                          </IconButton>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between border-t border-border bg-background px-8 py-3">
              <div className="text-[12px] text-muted">Showing 1–12 of 41</div>
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="secondary"
                  className="h-auto bg-border-subtle px-2 py-[7px] text-[12px] text-foreground hover:bg-border-subtle focus-visible:ring-foreground"
                >
                  1
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="h-auto px-2 py-[7px] text-[12px] text-secondary hover:bg-hover hover:text-foreground focus-visible:ring-foreground"
                >
                  2
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="h-auto px-2 py-[7px] text-[12px] text-secondary hover:bg-hover hover:text-foreground focus-visible:ring-foreground"
                >
                  3
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="h-auto px-2 py-[7px] text-[12px] text-secondary hover:bg-hover hover:text-foreground focus-visible:ring-foreground"
                >
                  4
                </Button>
                <IconButton title="Next page">
                  <ChevronRight className={iconClass} aria-hidden="true" />
                </IconButton>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
