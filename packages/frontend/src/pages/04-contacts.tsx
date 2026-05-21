/* Generated from brief/mockups/04-contacts.html via Codex fidelity pass 2026-05-19. Do not hand-edit. */

import { useState, type ChangeEventHandler, type MouseEventHandler, type ReactNode } from "react";
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
  Layers,
  LayoutDashboard,
  LayoutGrid,
  List,
  Mail,
  MessagesSquare,
  MoreHorizontal,
  PanelLeftClose,
  Plus,
  Search,
  Settings,
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
import { useList, useRemove } from "../hooks/useResource.js";
import { useUIStore } from "../stores/uiStore.js";
import { useNavigate } from "react-router-dom";

type NavItem = {
  label: string;
  icon: LucideIcon;
  active?: boolean;
};

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

const savedFilters = [
  { label: "All", count: "2,438", active: true },
  { label: "Clients", count: "312" },
  { label: "Vendors", count: "41" },
  { label: "Open leads", count: "89" },
  { label: "Tier-1 partners", count: "7" },
  { label: "+ Saved filter" },
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
  disabled,
  onClick,
}: {
  title?: string;
  children: ReactNode;
  className?: string;
  disabled?: boolean;
  onClick?: MouseEventHandler<HTMLButtonElement>;
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

export default function Contacts() {
  const [q, setQ] = useState("");
  const [sort, setSortField] = useState("name");
  const [order, setOrder] = useState<"asc" | "desc">("asc");
  const [activeSavedFilter, setActiveSavedFilter] = useState<string | null>(null);
  const navigate = useNavigate();
  const selectedContacts = useUIStore((state) => state.selection.contacts);
  const toggleSelected = useUIStore((state) => state.toggleSelected);
  const listParams: Record<string, string> = { name: q, sort, order };
  if (activeSavedFilter) listParams.type = activeSavedFilter;
  const { data } = useList<Contact>("contacts", listParams);
  const contacts = data?.data ?? [];
  const selectedContactIds = selectedContacts ?? [];

  function handleSort(field: string) {
    if (sort === field) {
      setOrder(order === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setOrder("asc");
    }
  }

  function handleSavedFilterClick(label: string) {
    if (label === "+ Saved filter") return;
    if (label === "All") {
      setActiveSavedFilter(null);
      return;
    }
    const next = label.toLowerCase().replace(/s$/, "");
    setActiveSavedFilter((cur) => (cur === next ? null : next));
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
            <span className="text-muted">Contacts</span>
            <ChevronRight className="size-4 text-disabled" aria-hidden="true" />
            <span className="font-medium text-foreground">All contacts</span>
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
                  Contacts
                </h1>
                <p className="mt-0.5 text-[13px] text-muted">
                  2,438 records · 41 vendors · 312 clients · 89 open leads
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  className="h-auto gap-1.5 px-3.5 py-[7px] text-[13px] focus-visible:ring-foreground"
                >
                  <Upload className={iconClass} aria-hidden="true" />
                  Import CSV
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
                  onClick={() => useUIStore.getState().openCreate("contacts")}
                  className="h-auto gap-1.5 bg-primary px-3.5 py-[7px] text-[13px] text-background hover:bg-primary"
                >
                  <Plus className={iconClass} aria-hidden="true" />
                  New contact
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-2 border-b border-border-subtle px-8 pb-3">
              {savedFilters.map((filter) => {
                const normalized =
                  filter.label === "All"
                    ? null
                    : filter.label === "+ Saved filter"
                      ? "__saved__"
                      : filter.label.toLowerCase().replace(/s$/, "");
                const isActive =
                  normalized === null
                    ? activeSavedFilter === null
                    : activeSavedFilter === normalized;
                return (
                  <button
                    type="button"
                    key={filter.label}
                    onClick={() => handleSavedFilterClick(filter.label)}
                    data-active={isActive ? "true" : "false"}
                    className={cn(
                      badgeClass,
                      "hover:bg-border focus-visible:outline-foreground",
                      isActive && "text-foreground",
                    )}
                  >
                    {filter.label}
                    {filter.count ? <span className="ml-1 text-muted">{filter.count}</span> : null}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2 border-b border-border bg-background px-8 py-3">
              <SearchField
                placeholder="Filter contacts…"
                className="w-[280px]"
                value={q}
                onChange={(event) => setQ(event.target.value)}
              />
              <Button
                type="button"
                variant="secondary"
                className="h-auto gap-1.5 px-3.5 py-[7px] text-[12px] focus-visible:ring-foreground"
              >
                <Filter className={iconClass} aria-hidden="true" />
                Type: Any
                <ChevronDown className="size-4 text-muted" aria-hidden="true" />
              </Button>
              <Button
                type="button"
                variant="secondary"
                className="h-auto gap-1.5 px-3.5 py-[7px] text-[12px] focus-visible:ring-foreground"
              >
                Tag: Any
                <ChevronDown className="size-4 text-muted" aria-hidden="true" />
              </Button>
              <Button
                type="button"
                variant="secondary"
                className="h-auto gap-1.5 px-3.5 py-[7px] text-[12px] focus-visible:ring-foreground"
              >
                Owner: Anyone
                <ChevronDown className="size-4 text-muted" aria-hidden="true" />
              </Button>
              <Button
                type="button"
                variant="secondary"
                className="h-auto gap-1.5 px-3.5 py-[7px] text-[12px] focus-visible:ring-foreground"
              >
                Last seen: 30 days
                <ChevronDown className="size-4 text-muted" aria-hidden="true" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="h-auto gap-1.5 px-2.5 py-1.5 text-[12px] text-secondary hover:bg-hover hover:text-foreground focus-visible:ring-foreground"
              >
                <Plus className={iconClass} aria-hidden="true" />
                Add filter
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
              <div className="flex items-center rounded-md border border-border-strong bg-background">
                <button
                  type="button"
                  className="rounded-l-md bg-border-subtle px-2 py-1.5 text-foreground hover:bg-border-subtle focus-visible:outline-foreground"
                >
                  <List className={iconClass} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  className="px-2 py-1.5 text-muted hover:text-secondary focus-visible:outline-foreground"
                >
                  <LayoutGrid className={iconClass} aria-hidden="true" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-auto">
              <table className="w-full border-separate border-spacing-0 text-[13px]">
                <thead>
                  <tr>
                    <th className={cn(tableHeadClass, "w-8")}>
                      <input
                        type="checkbox"
                        checked={
                          contacts.length > 0 &&
                          contacts.every((contact) => selectedContactIds.includes(contact.id))
                        }
                        onChange={(event) => {
                          const checked = event.currentTarget.checked;
                          contacts.forEach((contact) => {
                            const selected = selectedContactIds.includes(contact.id);
                            if (selected !== checked) {
                              toggleSelected("contacts", contact.id);
                            }
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
                      <SortChevron
                        field="last_contact"
                        sort={sort}
                        order={order}
                        onSort={handleSort}
                      />
                    </th>
                    <th className={tableHeadClass} />
                  </tr>
                </thead>
                <tbody>
                  {contacts.map((contact, index) => {
                    const isLast = index === contacts.length - 1;

                    return (
                      <tr
                        key={`${contact.name}-${contact.email}`}
                        onClick={() => navigate("/contacts/" + contact.id)}
                        className="hover:bg-hover"
                      >
                        <td className={cn(tableCellClass, isLast && "border-border")}>
                          <input
                            type="checkbox"
                            checked={selectedContactIds.includes(contact.id)}
                            onClick={(event) => event.stopPropagation()}
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
                            onClick={(event) => {
                              event.stopPropagation();
                              useUIStore.getState().openEdit("contacts", contact.id);
                            }}
                          >
                            <MoreHorizontal className={iconClass} aria-hidden="true" />
                          </IconButton>
                          <IconButton
                            title="Delete contact"
                            onClick={(event) => {
                              event.stopPropagation();
                              useUIStore
                                .getState()
                                .openConfirmDelete("contacts", contact.id);
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
              <div className="text-[12px] text-muted">Showing 1–12 of 2,438</div>
              <div className="flex items-center gap-1">
                <IconButton disabled>
                  <ChevronLeft className="size-4 text-disabled" aria-hidden="true" />
                </IconButton>
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
                <span className="px-1 text-[12px] text-muted">…</span>
                <Button
                  type="button"
                  variant="ghost"
                  className="h-auto px-2 py-[7px] text-[12px] text-secondary hover:bg-hover hover:text-foreground focus-visible:ring-foreground"
                >
                  204
                </Button>
                <IconButton>
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
