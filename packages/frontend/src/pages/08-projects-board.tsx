/* Generated from brief/mockups/08-projects-board.html via Codex fidelity pass 2026-05-19. Do not hand-edit. */

import type { ReactNode } from "react";
import {
  BarChart3,
  Bell,
  Calendar,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  ChevronsUpDown,
  CircleHelp,
  ClipboardList,
  Filter,
  GitBranch,
  HardHat,
  Kanban,
  Layers,
  LayoutDashboard,
  LayoutGrid,
  LayoutTemplate,
  List,
  Mail,
  MessageSquare,
  MessagesSquare,
  MoreHorizontal,
  PanelLeftClose,
  Paperclip,
  Plus,
  Search,
  Settings,
  User,
  Users,
  UsersRound,
  Zap,
  type LucideIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type NavItem = {
  label: string;
  icon: LucideIcon;
  active?: boolean;
};

type ProjectCardData = {
  title: string;
  due: string;
  owner: string;
  milestones: string;
  progressClass: string;
  vendors?: string[];
  noVendors?: boolean;
};

type ProjectColumn = {
  title: string;
  count: string;
  dotClass: string;
  cards: ProjectCardData[];
};

const workspaceNavItems: NavItem[] = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "Contacts", icon: Users },
  { label: "Vendors", icon: HardHat },
  { label: "Pipelines", icon: GitBranch },
  { label: "Projects", icon: Layers, active: true },
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

const projectColumns: ProjectColumn[] = [
  {
    title: "Brief",
    count: "3",
    dotClass: "bg-secondary",
    cards: [
      {
        title: "Brand Refresh — Café Espresso 2",
        due: "Jun 14",
        owner: "Anita M.",
        milestones: "0/8",
        progressClass: "w-0",
        vendors: ["AS"],
      },
      {
        title: "Whitefield Townhouse",
        due: "Jun 28",
        owner: "Manish",
        milestones: "0/6",
        progressClass: "w-0",
        vendors: ["MS"],
      },
      {
        title: "Suri Family Home",
        due: "Jul 02",
        owner: "Rohit",
        milestones: "0/4",
        progressClass: "w-0",
        noVendors: true,
      },
    ],
  },
  {
    title: "Concept",
    count: "2",
    dotClass: "bg-info",
    cards: [
      {
        title: "Brand Refresh — Lumen Café",
        due: "Jun 30",
        owner: "Manish",
        milestones: "4/12",
        progressClass: "w-[33%]",
        vendors: ["AS", "RB"],
      },
      {
        title: "Koramangala Bar Lounge",
        due: "Jul 18",
        owner: "Anita M.",
        milestones: "2/9",
        progressClass: "w-[22%]",
        vendors: ["AS", "LP"],
      },
    ],
  },
  {
    title: "Design",
    count: "3",
    dotClass: "bg-secondary",
    cards: [
      {
        title: "HSR Penthouse",
        due: "Jul 22",
        owner: "Rohit",
        milestones: "9/14",
        progressClass: "w-[64%]",
        vendors: ["AS", "VE", "FT"],
      },
      {
        title: "JP Nagar Bungalow",
        due: "Aug 04",
        owner: "Anita M.",
        milestones: "6/11",
        progressClass: "w-[54%]",
        vendors: ["MK", "MN", "PP"],
      },
      {
        title: "Indiranagar Loft Reno",
        due: "Jun 18",
        owner: "Manish",
        milestones: "11/13",
        progressClass: "w-[84%]",
        vendors: ["MK", "FT"],
      },
    ],
  },
  {
    title: "Procurement",
    count: "2",
    dotClass: "bg-warning",
    cards: [
      {
        title: "Whitefield Villa",
        due: "Jul 30",
        owner: "Manish",
        milestones: "14/18",
        progressClass: "w-[77%]",
        vendors: ["AS", "MN", "PS"],
      },
      {
        title: "Hennur Apartment",
        due: "Jul 12",
        owner: "Rohit",
        milestones: "8/10",
        progressClass: "w-[80%]",
        vendors: ["MK", "FT"],
      },
    ],
  },
  {
    title: "Install",
    count: "2",
    dotClass: "bg-warning",
    cards: [
      {
        title: "MG Road Boutique",
        due: "May 30",
        owner: "Anita M.",
        milestones: "20/22",
        progressClass: "w-[90%]",
        vendors: ["MK", "VE", "LP"],
      },
      {
        title: "Banashankari Duplex",
        due: "Jun 06",
        owner: "Rohit",
        milestones: "18/21",
        progressClass: "w-[85%]",
        vendors: ["MK", "PP", "AC"],
      },
    ],
  },
  {
    title: "Handover",
    count: "1",
    dotClass: "bg-success",
    cards: [
      {
        title: "Sarjapur Cottage",
        due: "May 22",
        owner: "Manish",
        milestones: "24/24",
        progressClass: "w-full",
        vendors: ["FT", "GF"],
      },
    ],
  },
];

const iconClass = "size-4 shrink-0";

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
        "size-[30px] rounded-md p-0 text-secondary hover:bg-hover hover:text-foreground focus-visible:ring-foreground",
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

function FilterBadge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "primary" | "warning";
}) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium leading-[18px] tracking-normal hover:bg-border-subtle focus-visible:outline-foreground",
        tone === "primary" && "bg-primary-tint text-primary",
        tone === "neutral" && "bg-border-subtle text-secondary",
        tone === "warning" && "bg-warning-tint text-warning",
      )}
    >
      {children}
    </button>
  );
}

function ProjectCard({ project }: { project: ProjectCardData }) {
  return (
    <Card className="cursor-grab rounded-md border-border bg-background p-3 transition-colors hover:border-border-strong hover:shadow-card">
      <div className="mb-2 flex items-start justify-between">
        <div className="text-[13px] font-semibold leading-snug text-foreground">
          {project.title}
        </div>
        <IconButton title="Project menu" className="size-6">
          <MoreHorizontal className={iconClass} aria-hidden="true" />
        </IconButton>
      </div>

      <div className="mb-2.5 flex items-center gap-2 text-[11px] text-muted">
        <Calendar className={iconClass} aria-hidden="true" />
        <span>{project.due}</span>
        <span className="text-disabled">·</span>
        <User className={iconClass} aria-hidden="true" />
        <span>{project.owner}</span>
      </div>

      <div className="mb-2.5">
        <div className="mb-1 flex items-center justify-between text-[10px] text-muted">
          <span>Milestones</span>
          <span>{project.milestones}</span>
        </div>
        <div className="h-1 w-full overflow-hidden rounded-full bg-border-subtle">
          <div className={cn("h-full rounded-full bg-foreground", project.progressClass)} />
        </div>
      </div>

      <div className="flex items-center justify-between">
        {project.noVendors ? (
          <div className="flex">
            <span className="text-[11px] text-muted">No vendors yet</span>
          </div>
        ) : (
          <div className="flex">
            {project.vendors?.map((vendor, index) => (
              <Avatar
                key={`${project.title}-${vendor}-${index}`}
                size="sm"
                className={cn(index > 0 && "-ml-1.5")}
              >
                {vendor}
              </Avatar>
            ))}
          </div>
        )}

        <div className="flex items-center gap-2 text-[11px] text-muted">
          <MessageSquare className={iconClass} aria-hidden="true" />
          <span>3</span>
          <Paperclip className={iconClass} aria-hidden="true" />
          <span>7</span>
        </div>
      </div>
    </Card>
  );
}

function KanbanColumn({ column }: { column: ProjectColumn }) {
  return (
    <div className="flex w-[280px] min-w-[280px] flex-col rounded-lg border border-border bg-subtle">
      <div className="flex items-center justify-between border-b border-border px-3.5 py-3 text-[12px] font-semibold text-foreground">
        <div className="flex items-center gap-2">
          <span className={cn("size-2 rounded-full", column.dotClass)} />
          <span>{column.title}</span>
          <span className="font-normal text-muted">{column.count}</span>
        </div>
        <IconButton title={`Add ${column.title} project`} className="size-6">
          <Plus className={iconClass} aria-hidden="true" />
        </IconButton>
      </div>

      <div className="flex min-h-[200px] flex-1 flex-col gap-2 p-2.5">
        {column.cards.map((project) => (
          <ProjectCard key={project.title} project={project} />
        ))}
      </div>
    </div>
  );
}

export default function ProjectsBoard() {
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
            <span className="text-muted">Projects</span>
            <ChevronRight className="size-4 text-disabled" aria-hidden="true" />
            <span className="font-medium text-foreground">Board</span>
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
            <div className="flex items-center justify-between px-8 pb-4 pt-6">
              <div>
                <h1 className="font-display text-[22px] font-semibold tracking-normal text-foreground">
                  Projects
                </h1>
                <p className="mt-0.5 text-[13px] text-muted">
                  13 active · 9 on track · 3 at risk · 1 in handover this week
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center rounded-md border border-border-strong bg-background">
                  <button
                    type="button"
                    className="flex items-center gap-1.5 rounded-l-md bg-primary-tint px-2.5 py-1.5 text-[12px] font-medium text-primary focus-visible:outline-foreground"
                  >
                    <Kanban className={iconClass} aria-hidden="true" />
                    Board
                  </button>
                  <button
                    type="button"
                    className="flex items-center gap-1.5 px-2.5 py-1.5 text-[12px] text-muted hover:bg-hover focus-visible:outline-foreground"
                  >
                    <List className={iconClass} aria-hidden="true" />
                    List
                  </button>
                  <button
                    type="button"
                    className="flex items-center gap-1.5 px-2.5 py-1.5 text-[12px] text-muted hover:bg-hover focus-visible:outline-foreground"
                  >
                    <CalendarDays className={iconClass} aria-hidden="true" />
                    Timeline
                  </button>
                </div>

                <Button
                  type="button"
                  variant="secondary"
                  className="h-auto gap-1.5 px-3.5 py-[7px] text-[13px] focus-visible:ring-foreground"
                >
                  <Filter className={iconClass} aria-hidden="true" />
                  Filter
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  className="h-auto gap-1.5 px-3.5 py-[7px] text-[13px] focus-visible:ring-foreground"
                >
                  <LayoutTemplate className={iconClass} aria-hidden="true" />
                  Templates
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

            <div className="flex items-center gap-2 border-b border-border bg-subtle/40 px-8 pb-3">
              <FilterBadge tone="primary">
                Active <span className="ml-1 text-primary">13</span>
              </FilterBadge>
              <FilterBadge>
                My projects <span className="ml-1 text-muted">5</span>
              </FilterBadge>
              <FilterBadge>
                Anita M. <span className="ml-1 text-muted">4</span>
              </FilterBadge>
              <FilterBadge>
                Rohit <span className="ml-1 text-muted">4</span>
              </FilterBadge>
              <FilterBadge tone="warning">
                At risk <span className="ml-1 text-warning">3</span>
              </FilterBadge>
              <FilterBadge>+ Add filter</FilterBadge>

              <div className="flex-1" />

              <div className="flex items-center gap-2 text-[12px] text-muted">
                <span>Group by</span>
                <Button
                  type="button"
                  variant="ghost"
                  className="h-auto gap-1.5 px-2.5 py-1 text-[12px] text-secondary hover:bg-hover hover:text-foreground focus-visible:ring-foreground"
                >
                  Status
                  <ChevronDown className="size-4 text-muted" aria-hidden="true" />
                </Button>
              </div>
            </div>

            <div className="flex-1 overflow-x-auto">
              <div className="flex min-w-min gap-4 p-6">
                {projectColumns.map((column) => (
                  <KanbanColumn key={column.title} column={column} />
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
