/* Generated from brief/mockups/06-vendors.html via Codex fidelity pass 2026-05-19. Do not hand-edit. */

import { useRef, useState, type ChangeEventHandler, type MouseEventHandler, type ReactNode } from "react";
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
  Trash2,
  Upload,
  Users,
  UsersRound,
  Zap,
  type LucideIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { SortChevron } from "../components/SortChevron.js";
import { useList } from "../hooks/useResource.js";
import { useUIStore } from "../stores/uiStore.js";
import { useNavigate } from "react-router-dom";

type NavItem = {
  label: string;
  icon: LucideIcon;
  active?: boolean;
};

type Vendor = {
  id: string;
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
  onClick,
}: {
  title?: string;
  children: ReactNode;
  className?: string;
  onClick?: MouseEventHandler<HTMLButtonElement>;
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
  value,
  onChange,
}: {
  placeholder: string;
  className?: string;
  shortcut?: string;
  value?: string;
  onChange?: ChangeEventHandler<HTMLInputElement>;
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
        value={value}
        onChange={onChange}
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
    <button type="button" onClick={onClick} className={cn(
        "flex w-full cursor-pointer select-none items-center gap-2.5 rounded-md px-2.5 py-[7px] text-[13px] font-medium transition-colors",
        item.active
          ? "bg-primary-tint text-primary"
          : "text-secondary hover:bg-border-subtle hover:text-foreground",
      )}>
      <Icon
        className={cn("size-4 shrink-0", item.active ? "text-primary" : "text-muted")}
        aria-hidden="true"
      />
      <span>{item.label}</span>
    </button>
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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [q, setQ] = useState("");
  const [sort, setSortField] = useState("name");
  const [order, setOrder] = useState<"asc" | "desc">("asc");
  const [skillFilter, setSkillFilter] = useState("Any");
  const [regionFilter, setRegionFilter] = useState("Any");
  const [tierFilter, setTierFilter] = useState("Any");
  const [statusFilter, setStatusFilter] = useState("Any");
  const navigate = useNavigate();
  const { data } = useList("vendors", { name: q, sort, order });
  const vendors = (data?.data ?? []) as Vendor[];

  function handleSort(field: string) {
    if (sort === field) {
      setOrder(order === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setOrder("asc");
    }
  }

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
          <IconButton title="Collapse sidebar" onClick={() => setSidebarCollapsed(v => !v)}>
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
              <SidebarNavItem key={item.label} item={item} onClick={() => { const r = ({Dashboard:"/dashboard",Contacts:"/contacts",Vendors:"/vendors",Pipelines:"/pipelines",Projects:"/projects",Calendar:"/calendar",Conversations:"/conversations",Forms:"/forms",Workflows:"/workflows",Reports:"/pipelines",Settings:"/settings"} as Record<string,string>)[item.label]; if (r) navigate(r); }} />
            ))}
          </div>

          <div className="mb-1.5 mt-3.5 px-2.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-muted">
            Surfaces
          </div>
          <div className="flex flex-col gap-0.5">
            {surfaceNavItems.map((item) => (
              <SidebarNavItem key={item.label} item={item} onClick={() => { const urls: Record<string,string> = {"Outlook add-in":"https://outlook.office.com","Teams app":"https://teams.microsoft.com","M365 launcher":"https://microsoft365.com/apps"}; const u = urls[item.label]; if (u) window.open(u,"_blank","noopener,noreferrer"); }} />
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
            <IconButton title="Help" onClick={() => window.open("https://support.microsoft.com","_blank","noopener,noreferrer")}>
              <CircleHelp className={iconClass} aria-hidden="true" />
            </IconButton>
            <IconButton title="Notifications" className="relative" onClick={() => navigate("/conversations")}>
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
                  onClick={() => useUIStore.getState().openCreate("vendors")}
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
              <SearchField
                placeholder="Filter vendors…"
                className="w-[280px]"
                value={q}
                onChange={(event) => setQ(event.target.value)}
              />
              <Button
                type="button"
                variant="secondary"
                onClick={() => { const v = prompt("Filter by skill (e.g. Design, Dev, Video):", skillFilter); if (v !== null) setSkillFilter(v || "Any"); }}
                className="h-auto gap-1.5 px-3.5 py-[7px] text-[12px] focus-visible:ring-foreground"
              >
                <Filter className={iconClass} aria-hidden="true" />
                Skill: {skillFilter}
                <ChevronDown className="size-4 text-muted" aria-hidden="true" />
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => { const v = prompt("Filter by region:", regionFilter); if (v !== null) setRegionFilter(v || "Any"); }}
                className="h-auto gap-1.5 px-3.5 py-[7px] text-[12px] focus-visible:ring-foreground"
              >
                Region: {regionFilter}
                <ChevronDown className="size-4 text-muted" aria-hidden="true" />
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => { const v = prompt("Filter by tier (1, 2, or Any):", tierFilter); if (v !== null) setTierFilter(v || "Any"); }}
                className="h-auto gap-1.5 px-3.5 py-[7px] text-[12px] focus-visible:ring-foreground"
              >
                Tier: {tierFilter}
                <ChevronDown className="size-4 text-muted" aria-hidden="true" />
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => { const v = prompt("Filter by status (Active, Invited, Inactive, Any):", statusFilter); if (v !== null) setStatusFilter(v || "Any"); }}
                className="h-auto gap-1.5 px-3.5 py-[7px] text-[12px] focus-visible:ring-foreground"
              >
                Status: {statusFilter}
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
                        onChange={(event) => {
                          const checked = event.currentTarget.checked;
                          const selectedVendorIds =
                            useUIStore.getState().selection.vendors ?? [];
                          vendors.forEach((vendor) => {
                            const selected = selectedVendorIds.includes(vendor.id);
                            if (selected !== checked) {
                              useUIStore.getState().toggleSelected("vendors", vendor.id);
                            }
                          });
                        }}
                        className="size-4 rounded border-border-strong accent-foreground"
                      />
                    </th>
                    <th className={tableHeadClass}>
                      Vendor
                      <SortChevron field="name" sort={sort} order={order} onSort={handleSort} />
                    </th>
                    <th className={tableHeadClass}>Regions</th>
                    <th className={tableHeadClass}>Tier</th>
                    <th className={tableHeadClass}>
                      Rating
                      <SortChevron
                        field="quality_rating"
                        sort={sort}
                        order={order}
                        onSort={handleSort}
                      />
                    </th>
                    <th className={tableHeadClass}>NDA / MSA</th>
                    <th className={tableHeadClass}>
                      Status
                      <SortChevron
                        field="availability_status"
                        sort={sort}
                        order={order}
                        onSort={handleSort}
                      />
                    </th>
                    <th className={tableHeadClass} />
                  </tr>
                </thead>
                <tbody>
                  {vendors.map((vendor, index) => {
                    const isLast = index === vendors.length - 1;

                    return (
                      <tr
                        key={vendor.name}
                        onClick={() => navigate("/vendors/" + vendor.id)}
                        className="hover:bg-hover"
                      >
                        <td className={cn(tableCellClass, isLast && "border-border")}>
                          <input
                            type="checkbox"
                            onClick={(event) => event.stopPropagation()}
                            onChange={() =>
                              useUIStore.getState().toggleSelected("vendors", vendor.id)
                            }
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
                          <IconButton
                            title={`${vendor.name} actions`}
                            onClick={(event) => {
                              event.stopPropagation();
                              useUIStore.getState().openEdit("vendors", vendor.id);
                            }}
                          >
                            <MoreHorizontal className={iconClass} aria-hidden="true" />
                          </IconButton>
                          <IconButton
                            title={`Delete ${vendor.name}`}
                            onClick={(event) => {
                              event.stopPropagation();
                              useUIStore
                                .getState()
                                .openConfirmDelete("vendors", vendor.id);
                            }}
                          >
                            <Trash2 className={iconClass} aria-hidden="true" />
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
