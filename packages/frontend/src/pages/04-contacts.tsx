/* Generated from brief/mockups/04-contacts.html via Codex fidelity pass 2026-05-19.
   Interactive wiring applied 2026-05-22 — Batch 2 Contacts fix. */

import { useRef, useEffect, useState, type ChangeEventHandler, type ReactNode } from "react";
import {
  BarChart3,
  Bell,
  Bookmark,
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  CircleHelp,
  ClipboardList,
  Download,
  Filter,
  GitBranch,
  HardHat,
  LayoutDashboard,
  LayoutGrid,
  Layers,
  List,
  LogOut,
  Mail,
  MessagesSquare,
  MoreHorizontal,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Search,
  Settings,
  Trash2,
  Upload,
  User,
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
  Reports: "/reports",
  Settings: "/settings",
};
const SURFACE_URLS: Record<string, string> = {
  "Outlook add-in": "https://outlook.office.com",
  "Teams app": "https://teams.microsoft.com",
  "M365 launcher": "https://microsoft365.com/apps",
};

const PAGE_SIZE = 12;

type NavItem = { label: string; icon: LucideIcon; active?: boolean };

type Contact = {
  id: string;
  initials: string;
  name: string;
  email: string;
  type: string;
  project: string;
  tag: string;
  owner: string;
  lastContact: string;
};

const workspaceNavItems: NavItem[] = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "Contacts", icon: Users, active: true },
  { label: "Vendors", icon: HardHat },
  { label: "Pipelines", icon: GitBranch },
  { label: "Projects", icon: Layers },
  { label: "Calendar", icon: Calendar },
  { label: "Conversations", icon: MessagesSquare },
  // { label: "Forms", icon: ClipboardList }, // hidden
  { label: "Workflows", icon: Zap },
  { label: "Reports", icon: BarChart3 },
  { label: "Settings", icon: Settings },
];

const surfaceNavItems: NavItem[] = [
  { label: "Outlook add-in", icon: Mail },
  { label: "Teams app", icon: UsersRound },
  { label: "M365 launcher", icon: LayoutGrid },
];

const savedFilters = [
  { label: "All", count: "2,438" },
  { label: "Clients", count: "312" },
  { label: "Vendors", count: "41" },
  { label: "Open leads", count: "89" },
  { label: "Tier-1 partners", count: "7" },
  { label: "+ Saved filter" },
];

const TYPE_OPTIONS = ["Any", "Client", "Vendor", "Lead", "Partner"];
const TAG_OPTIONS = ["Any", "Hot", "Warm", "Cold", "VIP"];
const OWNER_OPTIONS = ["Anyone", "Manish", "Team"];
const LAST_SEEN_OPTIONS = ["7 days", "30 days", "90 days", "All time"];

const iconClass = "size-4 shrink-0";
const badgeClass =
  "inline-flex items-center gap-1 rounded-full bg-border-subtle px-2 py-0.5 text-[11px] font-medium leading-[18px] tracking-normal text-secondary";
const tableHeadClass =
  "border-y border-border bg-subtle px-3.5 py-[9px] text-left text-[11px] font-medium uppercase tracking-[0.04em] text-muted";
const tableCellClass = "border-b border-border-subtle px-3.5 py-[11px] align-middle";

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
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full cursor-pointer select-none items-center gap-2.5 rounded-md px-2.5 py-[7px] text-[13px] font-medium transition-colors",
        item.active
          ? "bg-primary-tint text-primary"
          : "text-secondary hover:bg-border-subtle hover:text-foreground",
      )}
    >
      <Icon
        className={cn("size-4 shrink-0", item.active ? "text-primary" : "text-muted")}
        aria-hidden="true"
      />
      <span>{item.label}</span>
    </button>
  );
}

/** Generic filter dropdown button */
function FilterDropdown({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  const dd = useDropdown();
  const display = value === options[0] ? `${label}: ${options[0]}` : `${label}: ${value}`;
  return (
    <div className="relative" ref={dd.ref}>
      <Button
        type="button"
        variant="secondary"
        className="h-auto gap-1.5 px-3.5 py-[7px] text-[12px] focus-visible:ring-foreground"
        onClick={() => dd.setOpen((v) => !v)}
      >
        {label === "Type" && <Filter className={iconClass} aria-hidden="true" />}
        {display}
        <ChevronDown className="size-4 text-muted" aria-hidden="true" />
      </Button>
      {dd.open && (
        <div className="absolute left-0 top-full z-50 mt-1 min-w-[140px] rounded-lg border border-border bg-background py-1 shadow-lg">
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => { onChange(opt); dd.setOpen(false); }}
              className={cn(
                "flex w-full items-center px-3 py-2 text-left text-[13px] hover:bg-hover",
                opt === value ? "font-medium text-primary" : "text-foreground",
              )}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/** User account dropdown */
function UserMenu({ onSignOut, onSettings }: { onSignOut: () => void; onSettings: () => void }) {
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
          <button type="button" onClick={() => { onSettings(); dd.setOpen(false); }}
            className="flex w-full items-center gap-2.5 px-3 py-2 text-[13px] text-foreground hover:bg-hover">
            <User className="size-4 text-muted" /> Profile
          </button>
          <button type="button" onClick={() => { onSettings(); dd.setOpen(false); }}
            className="flex w-full items-center gap-2.5 px-3 py-2 text-[13px] text-foreground hover:bg-hover">
            <Settings className="size-4 text-muted" /> Settings
          </button>
          <button type="button" onClick={() => { onSignOut(); dd.setOpen(false); }}
            className="flex w-full items-center gap-2.5 px-3 py-2 text-[13px] text-red-600 hover:bg-hover">
            <LogOut className="size-4 text-muted" /> Sign out
          </button>
        </div>
      )}
    </div>
  );
}

/* ─── Main page ──────────────────────────────────────────────── */
export default function Contacts() {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const [q, setQ] = useState("");
  const [sort, setSortField] = useState("name");
  const [order, setOrder] = useState<"asc" | "desc">("asc");
  const [activeSavedFilter, setActiveSavedFilter] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [typeFilter, setTypeFilter] = useState("Any");
  const [tagFilter, setTagFilter] = useState("Any");
  const [ownerFilter, setOwnerFilter] = useState("Anyone");
  const [lastSeenFilter, setLastSeenFilter] = useState("30 days");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const selectedContacts = useUIStore((state) => state.selection.contacts);
  const toggleSelected = useUIStore((state) => state.toggleSelected);

  const listParams: Record<string, string> = {
    name: q,
    sort,
    order,
    page: String(page),
    limit: String(PAGE_SIZE),
  };
  if (activeSavedFilter) listParams.type = activeSavedFilter;
  if (typeFilter !== "Any") listParams.contactType = typeFilter.toLowerCase();
  if (tagFilter !== "Any") listParams.tag = tagFilter.toLowerCase();
  if (ownerFilter !== "Anyone") listParams.owner = ownerFilter;

  const { data } = useList<Contact>("contacts", listParams);
  const contacts = data?.data ?? [];
  const total = data?.total ?? 2438;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const selectedContactIds = selectedContacts ?? [];

  // hidden CSV file input ref
  const csvInputRef = useRef<HTMLInputElement>(null);

  function handleSort(field: string) {
    if (sort === field) setOrder(order === "asc" ? "desc" : "asc");
    else { setSortField(field); setOrder("asc"); }
    setPage(1);
  }

  function handleSavedFilterClick(label: string) {
    if (label === "+ Saved filter") {
      useUIStore.getState().openCreate("contacts");
      return;
    }
    if (label === "All") { setActiveSavedFilter(null); setPage(1); return; }
    const next = label.toLowerCase().replace(/s$/, "");
    setActiveSavedFilter((cur) => (cur === next ? null : next));
    setPage(1);
  }

  function handlePageChange(p: number) {
    if (p < 1 || p > totalPages) return;
    setPage(p);
  }

  function handleExport() {
    window.print();
  }

  function buildPageNumbers() {
    // Show first, last, and 2 around current
    const pages: (number | "...")[] = [];
    const add = (n: number) => { if (!pages.includes(n)) pages.push(n); };
    add(1);
    if (page > 3) pages.push("...");
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) add(i);
    if (page < totalPages - 2) pages.push("...");
    if (totalPages > 1) add(totalPages);
    return pages;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground antialiased">
      {/* Hidden CSV input */}
      <input
        ref={csvInputRef}
        type="file"
        accept=".csv"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) alert(`Import: ${file.name} (${file.size} bytes) — backend upload coming soon`);
          e.target.value = "";
        }}
      />

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
            {sidebarCollapsed
              ? <PanelLeftOpen className={iconClass} aria-hidden="true" />
              : <PanelLeftClose className={iconClass} aria-hidden="true" />}
          </IconButton>
        </div>

        {!sidebarCollapsed && (
          <div className="px-3 pt-3">
            <div className="flex items-center justify-between gap-2 rounded-lg border border-border bg-background p-2 shadow-card">
              <div className="flex min-w-0 items-center gap-2">
                <div className="flex size-6 shrink-0 items-center justify-center rounded-md border border-border bg-background text-[10px] font-bold text-foreground">HQ</div>
                <div className="min-w-0">
                  <div className="truncate text-[12px] font-semibold text-foreground">DesignersMeet HQ</div>
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
                onClick={() => {
                  const r = NAV_ROUTES[item.label];
                  if (r) navigate(r);
                }}
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
            {!sidebarCollapsed && (
              <>
                <div className="min-w-0">
                  <div className="truncate text-[12px] font-semibold text-foreground">Manish</div>
                  <div className="truncate text-[10px] text-muted">Workspace owner</div>
                </div>
                <UserMenu
                  onSignOut={signOut}
                  onSettings={() => navigate("/settings")}
                />
              </>
            )}
          </div>
        </div>
      </aside>

      {/* ── Main ────────────────────────────────────────────── */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex h-[52px] items-center gap-4 border-b border-border bg-background px-5">
          <nav className="flex items-center gap-2 text-[13px]">
            <button
              type="button"
              onClick={() => navigate("/contacts")}
              className="text-muted hover:text-foreground"
            >
              Contacts
            </button>
            <ChevronRight className="size-4 text-disabled" aria-hidden="true" />
            <span className="font-medium text-foreground">All contacts</span>
          </nav>

          <SearchField
            placeholder="Search contacts, projects, vendors…"
            shortcut="⌘K"
            className="ml-auto mr-auto max-w-[480px] flex-1"
            value={q}
            onChange={(e) => { setQ(e.target.value); setPage(1); }}
          />

          <div className="ml-auto flex items-center gap-1">
            <IconButton
              title="Help"
              onClick={() => window.open("https://support.microsoft.com", "_blank", "noopener,noreferrer")}
            >
              <CircleHelp className={iconClass} aria-hidden="true" />
            </IconButton>
            <IconButton
              title="Notifications"
              className="relative"
              onClick={() => navigate("/conversations")}
            >
              <Bell className={iconClass} aria-hidden="true" />
              <span className="absolute right-1 top-1 size-1.5 rounded-full bg-foreground" />
            </IconButton>
            <div className="mx-1 h-6 w-px bg-border" />
            <UserMenu onSignOut={signOut} onSettings={() => navigate("/settings")} />
          </div>
        </header>

        <main className="flex-1 overflow-auto bg-background">
          <div className="flex h-full flex-col">
            {/* Page header */}
            <div className="flex items-center justify-between px-8 pb-3 pt-6">
              <div>
                <h1 className="font-display text-[22px] font-semibold tracking-normal text-foreground">
                  Contacts
                </h1>
                <p className="mt-0.5 text-[13px] text-muted">
                  {total.toLocaleString()} records · 41 vendors · 312 clients · 89 open leads
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  className="h-auto gap-1.5 px-3.5 py-[7px] text-[13px] focus-visible:ring-foreground"
                  onClick={() => csvInputRef.current?.click()}
                >
                  <Upload className={iconClass} aria-hidden="true" />
                  Import CSV
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  className="h-auto gap-1.5 px-3.5 py-[7px] text-[13px] focus-visible:ring-foreground"
                  onClick={handleExport}
                >
                  <Download className={iconClass} aria-hidden="true" />
                  Export
                </Button>
                <Button
                  type="button"
                  onClick={() => useUIStore.getState().openCreate("contacts")}
                  className="h-auto gap-1.5 bg-primary px-3.5 py-[7px] text-[13px] text-background hover:bg-primary"
                >
                  <Plus className={iconClass} aria-hidden="true" />
                  New contact
                </Button>
              </div>
            </div>

            {/* Saved filter pills */}
            <div className="flex items-center gap-2 border-b border-border-subtle px-8 pb-3">
              {savedFilters.map((filter) => {
                const normalized =
                  filter.label === "All" ? null
                  : filter.label === "+ Saved filter" ? "__saved__"
                  : filter.label.toLowerCase().replace(/s$/, "");
                const isActive =
                  normalized === null ? activeSavedFilter === null
                  : activeSavedFilter === normalized;
                return (
                  <button
                    type="button"
                    key={filter.label}
                    onClick={() => handleSavedFilterClick(filter.label)}
                    className={cn(
                      badgeClass,
                      "hover:bg-border focus-visible:outline-foreground transition-colors",
                      isActive && "bg-primary-tint text-primary",
                      filter.label === "+ Saved filter" && "border border-dashed border-border",
                    )}
                  >
                    {filter.label}
                    {filter.count ? <span className="ml-1 text-muted">{filter.count}</span> : null}
                  </button>
                );
              })}
            </div>

            {/* Filter bar */}
            <div className="flex items-center gap-2 border-b border-border bg-background px-8 py-3">
              <SearchField
                placeholder="Filter contacts…"
                className="w-[280px]"
                value={q}
                onChange={(e) => { setQ(e.target.value); setPage(1); }}
              />
              <FilterDropdown
                label="Type"
                options={TYPE_OPTIONS}
                value={typeFilter}
                onChange={(v) => { setTypeFilter(v); setPage(1); }}
              />
              <FilterDropdown
                label="Tag"
                options={TAG_OPTIONS}
                value={tagFilter}
                onChange={(v) => { setTagFilter(v); setPage(1); }}
              />
              <FilterDropdown
                label="Owner"
                options={OWNER_OPTIONS}
                value={ownerFilter}
                onChange={(v) => { setOwnerFilter(v); setPage(1); }}
              />
              <FilterDropdown
                label="Last seen"
                options={LAST_SEEN_OPTIONS}
                value={lastSeenFilter}
                onChange={(v) => { setLastSeenFilter(v); setPage(1); }}
              />
              <Button
                type="button"
                variant="ghost"
                className="h-auto gap-1.5 px-2.5 py-1.5 text-[12px] text-secondary hover:bg-hover hover:text-foreground focus-visible:ring-foreground"
                onClick={() => {
                  setTypeFilter("Any");
                  setTagFilter("Any");
                  setOwnerFilter("Anyone");
                  setLastSeenFilter("30 days");
                  setQ("");
                  setActiveSavedFilter(null);
                  setPage(1);
                }}
              >
                <Plus className={iconClass} aria-hidden="true" />
                Reset filters
              </Button>
              <div className="flex-1" />
              <Button
                type="button"
                variant="ghost"
                className="h-auto gap-1.5 px-2.5 py-1.5 text-[12px] text-secondary hover:bg-hover hover:text-foreground focus-visible:ring-foreground"
                onClick={() => alert("Save current filter as a named view — coming soon")}
              >
                <Bookmark className={iconClass} aria-hidden="true" />
                Save view
              </Button>
              {/* List / Grid toggle */}
              <div className="flex items-center rounded-md border border-border-strong bg-background">
                <button
                  type="button"
                  onClick={() => setViewMode("list")}
                  className={cn(
                    "rounded-l-md px-2 py-1.5 focus-visible:outline-foreground",
                    viewMode === "list"
                      ? "bg-border-subtle text-foreground"
                      : "text-muted hover:text-secondary",
                  )}
                  title="List view"
                >
                  <List className={iconClass} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("grid")}
                  className={cn(
                    "rounded-r-md px-2 py-1.5 focus-visible:outline-foreground",
                    viewMode === "grid"
                      ? "bg-border-subtle text-foreground"
                      : "text-muted hover:text-secondary",
                  )}
                  title="Grid view"
                >
                  <LayoutGrid className={iconClass} aria-hidden="true" />
                </button>
              </div>
            </div>

            {/* Table / Grid */}
            <div className="flex-1 overflow-auto">
              {viewMode === "list" ? (
                <table className="w-full border-separate border-spacing-0 text-[13px]">
                  <thead>
                    <tr>
                      <th className={cn(tableHeadClass, "w-8")}>
                        <input
                          type="checkbox"
                          checked={
                            contacts.length > 0 &&
                            contacts.every((c) => selectedContactIds.includes(c.id))
                          }
                          onChange={(e) => {
                            const checked = e.currentTarget.checked;
                            contacts.forEach((c) => {
                              const sel = selectedContactIds.includes(c.id);
                              if (sel !== checked) toggleSelected("contacts", c.id);
                            });
                          }}
                          className="size-4 rounded border-border-strong accent-foreground"
                        />
                      </th>
                      <th className={tableHeadClass}>
                        Name
                        <SortChevron field="name" sort={sort} order={order} onSort={handleSort} />
                      </th>
                      <th className={tableHeadClass}>
                        Type
                        <SortChevron field="type" sort={sort} order={order} onSort={handleSort} />
                      </th>
                      <th className={tableHeadClass}>Active project</th>
                      <th className={tableHeadClass}>Tag</th>
                      <th className={tableHeadClass}>Owner</th>
                      <th className={tableHeadClass}>
                        Last contact
                        <SortChevron field="last_contact" sort={sort} order={order} onSort={handleSort} />
                      </th>
                      <th className={tableHeadClass} />
                    </tr>
                  </thead>
                  <tbody>
                    {contacts.map((contact, index) => {
                      const isLast = index === contacts.length - 1;
                      return (
                        <tr
                          key={contact.id}
                          onClick={() => navigate("/contacts/" + contact.id)}
                          className="cursor-pointer hover:bg-hover"
                        >
                          <td className={cn(tableCellClass, isLast && "border-border")}>
                            <input
                              type="checkbox"
                              checked={selectedContactIds.includes(contact.id)}
                              onClick={(e) => e.stopPropagation()}
                              onChange={() => toggleSelected("contacts", contact.id)}
                              className="size-4 rounded border-border-strong accent-foreground"
                            />
                          </td>
                          <td className={cn(tableCellClass, isLast && "border-border")}>
                            <div className="flex items-center gap-3">
                              <Avatar size="sm">{contact.initials}</Avatar>
                              <div>
                                <div className="font-medium text-foreground">{contact.name}</div>
                                <div className="text-[11px] text-muted">{contact.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className={cn(tableCellClass, isLast && "border-border")}>
                            <span className={badgeClass}>{contact.type}</span>
                          </td>
                          <td className={cn(tableCellClass, isLast && "border-border")}>
                            <span className="text-secondary">{contact.project}</span>
                          </td>
                          <td className={cn(tableCellClass, isLast && "border-border")}>
                            <span className={badgeClass}>{contact.tag}</span>
                          </td>
                          <td className={cn(tableCellClass, isLast && "border-border")}>
                            <span className="text-secondary">{contact.owner}</span>
                          </td>
                          <td className={cn(tableCellClass, isLast && "border-border")}>
                            <span className="text-muted">{contact.lastContact}</span>
                          </td>
                          <td className={cn(tableCellClass, "text-right", isLast && "border-border")}>
                            <IconButton
                              title="Edit contact"
                              onClick={(e) => {
                                e.stopPropagation();
                                useUIStore.getState().openEdit("contacts", contact.id);
                              }}
                            >
                              <MoreHorizontal className={iconClass} aria-hidden="true" />
                            </IconButton>
                            <IconButton
                              title="Delete contact"
                              onClick={(e) => {
                                e.stopPropagation();
                                useUIStore.getState().openConfirmDelete("contacts", contact.id);
                              }}
                            >
                              <Trash2 className={iconClass} aria-hidden="true" />
                            </IconButton>
                          </td>
                        </tr>
                      );
                    })}
                    {contacts.length === 0 && (
                      <tr>
                        <td colSpan={8} className="px-8 py-12 text-center text-[13px] text-muted">
                          No contacts match the current filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              ) : (
                /* Grid view */
                <div className="grid grid-cols-4 gap-4 p-8">
                  {contacts.map((contact) => (
                    <button
                      key={contact.id}
                      type="button"
                      onClick={() => navigate("/contacts/" + contact.id)}
                      className="flex flex-col items-center gap-2 rounded-lg border border-border bg-background p-5 text-center shadow-card hover:shadow-md"
                    >
                      <Avatar>{contact.initials}</Avatar>
                      <div className="font-medium text-foreground">{contact.name}</div>
                      <div className="text-[11px] text-muted">{contact.email}</div>
                      <span className={badgeClass}>{contact.type}</span>
                    </button>
                  ))}
                  {contacts.length === 0 && (
                    <div className="col-span-4 py-12 text-center text-[13px] text-muted">
                      No contacts match the current filters.
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between border-t border-border bg-background px-8 py-3">
              <div className="text-[12px] text-muted">
                Showing {Math.min((page - 1) * PAGE_SIZE + 1, total)}–{Math.min(page * PAGE_SIZE, total)} of {total.toLocaleString()}
              </div>
              <div className="flex items-center gap-1">
                <IconButton
                  disabled={page === 1}
                  onClick={() => handlePageChange(page - 1)}
                  title="Previous page"
                >
                  <ChevronLeft className={cn("size-4", page === 1 ? "text-disabled" : "")} aria-hidden="true" />
                </IconButton>
                {buildPageNumbers().map((p, i) =>
                  p === "..." ? (
                    <span key={`ellipsis-${i}`} className="px-1 text-[12px] text-muted">…</span>
                  ) : (
                    <Button
                      key={p}
                      type="button"
                      variant={p === page ? "secondary" : "ghost"}
                      onClick={() => handlePageChange(p as number)}
                      className={cn(
                        "h-auto px-2 py-[7px] text-[12px] focus-visible:ring-foreground",
                        p === page
                          ? "bg-border-subtle text-foreground hover:bg-border-subtle"
                          : "text-secondary hover:bg-hover hover:text-foreground",
                      )}
                    >
                      {p}
                    </Button>
                  )
                )}
                <IconButton
                  disabled={page === totalPages}
                  onClick={() => handlePageChange(page + 1)}
                  title="Next page"
                >
                  <ChevronRight className={cn(iconClass, page === totalPages ? "text-disabled" : "")} aria-hidden="true" />
                </IconButton>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
