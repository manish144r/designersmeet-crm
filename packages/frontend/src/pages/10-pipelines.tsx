/* Generated from brief/mockups/10-pipelines.html via Codex fidelity pass 2026-05-19. Do not hand-edit. */

import { useState, type ReactNode } from "react";
import {
  BarChart3,
  Bell,
  Calendar,
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
  List,
  Mail,
  MessagesSquare,
  MoreHorizontal,
  PanelLeftClose,
  Plus,
  Search,
  Settings,
  Users,
  UsersRound,
  type LucideIcon,
  Zap,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useList } from "../hooks/useResource.js";
import { useUIStore } from "../stores/uiStore.js";

type NavItem = {
  label: string;
  icon: LucideIcon;
  active?: boolean;
};

type OpportunityCard = {
  title: string;
  detail: string;
  value: string;
  age: string;
  owner: string;
};

type PipelineColumn = {
  title: string;
  count: string;
  total: string;
  dotClass: string;
  cards: OpportunityCard[];
};

type PipelineStageRow = {
  pipeline_id?: string;
  order?: number;
  title?: string;
  count?: string;
  total?: string;
  dotClass?: string;
};

type PipelineRow = {
  name?: string;
};

const workspaceNavItems: NavItem[] = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "Contacts", icon: Users },
  { label: "Vendors", icon: HardHat },
  { label: "Pipelines", icon: GitBranch, active: true },
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

const pipelineColumns: PipelineColumn[] = [
  {
    title: "New",
    count: "8",
    total: "₹ 12.4 L",
    dotClass: "bg-muted",
    cards: [
      { title: "Suri Kapoor", detail: "Residential · 3BHK · HSR", value: "₹ 2,40,000", age: "4d", owner: "R" },
      { title: "Arjun K. (Signal)", detail: "Co-work expansion · Indiranagar", value: "₹ 5,80,000", age: "2d", owner: "A" },
      { title: "Tanvi Joshi", detail: "Café fit-out · MG Road", value: "₹ 1,80,000", age: "1d", owner: "M" },
    ],
  },
  {
    title: "Qualified",
    count: "6",
    total: "₹ 18.2 L",
    dotClass: "bg-secondary",
    cards: [
      { title: "Mehta Family", detail: "Villa · Whitefield", value: "₹ 8,40,000", age: "6d", owner: "A" },
      { title: "Lumen Café (2)", detail: "Pune outlet expansion", value: "₹ 4,60,000", age: "3d", owner: "M" },
      { title: "Kotha Bros LLP", detail: "Showroom · Koramangala", value: "₹ 2,80,000", age: "1d", owner: "R" },
    ],
  },
  {
    title: "Brief",
    count: "5",
    total: "₹ 22.0 L",
    dotClass: "bg-foreground",
    cards: [
      { title: "Hennur Apartment", detail: "2BHK · soft refurb", value: "₹ 3,40,000", age: "8d", owner: "R" },
      { title: "Yelahanka Duplex", detail: "4BHK · full design", value: "₹ 9,80,000", age: "5d", owner: "A" },
      { title: "Mantra Studios", detail: "Yoga studio interior", value: "₹ 2,20,000", age: "2d", owner: "M" },
    ],
  },
  {
    title: "Proposal",
    count: "4",
    total: "₹ 16.4 L",
    dotClass: "bg-secondary",
    cards: [
      { title: "Banashankari Duplex", detail: "Full design + install", value: "₹ 7,20,000", age: "12d", owner: "R" },
      { title: "Café Espresso 2", detail: "Brand refresh + interior", value: "₹ 4,80,000", age: "5d", owner: "A" },
      { title: "Koramangala Bar", detail: "Lounge concept", value: "₹ 4,40,000", age: "2d", owner: "M" },
    ],
  },
  {
    title: "Won",
    count: "3",
    total: "₹ 16.2 L",
    dotClass: "bg-foreground",
    cards: [
      { title: "MG Road Boutique", detail: "Install in progress", value: "₹ 5,40,000", age: "1mo", owner: "A" },
      { title: "Brand Refresh — Lumen", detail: "Active project", value: "₹ 3,25,000", age: "2mo", owner: "M" },
      { title: "Indiranagar Loft", detail: "In design", value: "₹ 3,80,000", age: "3mo", owner: "M" },
    ],
  },
];

const iconClass = "size-4 shrink-0";

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
        "size-[30px] rounded-md p-0 text-secondary hover:bg-hover hover:text-foreground focus-visible:ring-foreground",
        className,
      )}
    >
      {children}
    </Button>
  );
}

function Avatar({ children, size = "default", className }: { children: ReactNode; size?: "default" | "sm"; className?: string }) {
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

function SearchField({ placeholder, className, shortcut }: { placeholder: string; className?: string; shortcut?: string }) {
  return (
    <div className={cn("relative flex h-[34px] items-center rounded-md border border-border-strong bg-background", className)}>
      <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted" aria-hidden="true" />
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
        item.active ? "bg-primary-tint text-primary" : "text-secondary hover:bg-border-subtle hover:text-foreground",
      )}
      data-active={item.active ? "true" : "false"}
    >
      <Icon className={cn("size-4 shrink-0", item.active ? "text-primary" : "text-muted")} aria-hidden="true" />
      <span>{item.label}</span>
    </div>
  );
}

function Badge({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "primary" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium leading-[18px] tracking-[0.01em]",
        tone === "primary" ? "bg-primary-tint text-primary" : "bg-border-subtle text-secondary",
      )}
    >
      {children}
    </span>
  );
}

function FilterBadge({
  children,
  active,
  onClick,
}: {
  children: ReactNode;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-active={active ? "true" : "false"}
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium leading-[18px] tracking-[0.01em] hover:bg-border-subtle focus-visible:outline-foreground",
        active ? "bg-primary-tint text-primary" : "bg-border-subtle text-secondary",
      )}
    >
      {children}
    </button>
  );
}

function ViewButton({ active, icon: Icon, children }: { active?: boolean; icon: LucideIcon; children: ReactNode }) {
  return (
    <button
      type="button"
      className={cn(
        "flex items-center gap-1.5 px-2.5 py-1.5 text-[12px] focus-visible:outline-foreground",
        active ? "rounded-l-md bg-primary-tint font-medium text-primary" : "text-muted hover:bg-hover",
      )}
    >
      <Icon className={iconClass} aria-hidden="true" />
      {children}
    </button>
  );
}

function OpportunityCard({ card }: { card: OpportunityCard }) {
  return (
    <Card className="cursor-grab rounded-md border-border bg-background p-3 transition-colors hover:border-border-strong hover:shadow-card">
      <div className="mb-1.5 flex items-start justify-between">
        <div className="text-[13px] font-semibold leading-snug text-foreground">{card.title}</div>
        <IconButton
          title="Opportunity menu"
          className="size-5"
          onClick={() => useUIStore.getState().openEdit("pipeline-deals", card.title)}
        >
          <MoreHorizontal className={iconClass} aria-hidden="true" />
        </IconButton>
      </div>
      <div className="mb-2.5 text-[11.5px] leading-snug text-muted">{card.detail}</div>
      <div className="flex items-center justify-between text-[12px]">
        <div className="font-semibold text-foreground">{card.value}</div>
        <div className="flex items-center gap-2 text-[11px] text-muted">
          <span>{card.age}</span>
          <Avatar size="sm">{card.owner}</Avatar>
        </div>
      </div>
    </Card>
  );
}

function KanbanColumn({ column }: { column: PipelineColumn }) {
  return (
    <div className="flex w-[280px] min-w-[280px] flex-col rounded-lg border border-border bg-subtle">
      <div className="flex items-center justify-between border-b border-border px-3.5 py-3 text-[12px] font-semibold text-foreground">
        <div className="flex items-center gap-2">
          <span className={cn("size-2 rounded-full", column.dotClass)} />
          <span>{column.title}</span>
          <span className="font-normal text-muted">{column.count}</span>
        </div>
        <IconButton
          title={`Add ${column.title} opportunity`}
          className="size-6"
          onClick={() => useUIStore.getState().openCreate("pipeline-deals")}
        >
          <Plus className={iconClass} aria-hidden="true" />
        </IconButton>
      </div>
      <div className="border-b border-border bg-background px-3 py-2">
        <div className="text-[11px] uppercase tracking-wider text-muted">Total value</div>
        <div className="text-[13px] font-semibold text-foreground">{column.total}</div>
      </div>
      <div className="flex min-h-[200px] flex-1 flex-col gap-2 p-2.5">
        {column.cards.map((card) => (
          <OpportunityCard key={card.title} card={card} />
        ))}
      </div>
    </div>
  );
}

export default function Pipelines() {
  const [activePipelineFilter, setActivePipelineFilter] = useState<string | null>(null);
  const _st = useList<PipelineStageRow & { id?: string }>("pipeline-stages").data?.data ?? [];
  const _pp = useList<PipelineRow>("pipelines").data?.data ?? [];
  const _deals =
    useList<{
      id: string;
      pipelineStageId?: string;
      contactName?: string;
      note?: string;
      value?: number;
      currency?: string;
      createdAt?: string;
    }>("pipeline-deals").data?.data ?? [];
  const _pl1Stages = _st
    .filter((stage) => stage.pipeline_id === "pl1")
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const _pipelineColumns =
    _pl1Stages.length > 0
      ? pipelineColumns.map((column, index) => {
          const stage = _pl1Stages[index];
          if (!stage) return column;
          const stageDeals = _deals.filter((d) => d.pipelineStageId === stage.id);
          const liveCards =
            stageDeals.length > 0
              ? stageDeals.map<OpportunityCard>((d) => ({
                  title: d.contactName ?? "—",
                  detail: d.note ?? "—",
                  value: `${d.currency ?? "₹"} ${(d.value ?? 0).toLocaleString("en-IN")}`,
                  age: "—",
                  owner: (d.contactName ?? "?").slice(0, 1).toUpperCase(),
                }))
              : column.cards;
          const liveTotal =
            stageDeals.length > 0
              ? `${stageDeals[0]?.currency ?? "₹"} ${stageDeals
                  .reduce((sum, d) => sum + (d.value ?? 0), 0)
                  .toLocaleString("en-IN")}`
              : column.total;
          return {
            ...column,
            title: stage.title ?? column.title,
            count: stageDeals.length > 0 ? String(stageDeals.length) : stage.count ?? column.count,
            total: liveTotal,
            dotClass: stage.dotClass ?? column.dotClass,
            cards: liveCards,
          };
        })
      : pipelineColumns;

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
                <div className="truncate text-[12px] font-semibold text-foreground">DesignersMeet HQ</div>
                <div className="truncate text-[10px] text-muted">Bengaluru workspace</div>
              </div>
            </div>
            <ChevronsUpDown className="size-4 shrink-0 text-muted" aria-hidden="true" />
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-2 pt-3">
          <div className="mb-1.5 mt-3.5 px-2.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-muted">Workspace</div>
          <div className="flex flex-col gap-0.5">
            {workspaceNavItems.map((item) => (
              <SidebarNavItem key={item.label} item={item} />
            ))}
          </div>
          <div className="mb-1.5 mt-3.5 px-2.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-muted">Surfaces</div>
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
            <span className="text-muted">Pipelines</span>
            <ChevronRight className="size-4 text-disabled" aria-hidden="true" />
            <span className="font-medium text-foreground">{_pp[0]?.name ?? "Sales"}</span>
          </nav>

          <SearchField placeholder="Search contacts, projects, vendors…" shortcut="⌘K" className="ml-auto mr-auto max-w-[480px] flex-1" />

          <div className="ml-auto flex items-center gap-1">
            <IconButton title="Help">
              <CircleHelp className={iconClass} aria-hidden="true" />
            </IconButton>
            <IconButton title="Notifications" className="relative">
              <Bell className={iconClass} aria-hidden="true" />
              <span className="absolute right-1 top-1 size-1.5 rounded-full bg-foreground" />
            </IconButton>
            <div className="mx-1 h-6 w-px bg-border" />
            <button type="button" className="flex items-center gap-2 rounded-md px-2 py-1 hover:bg-hover focus-visible:outline-foreground">
              <Avatar size="sm">MS</Avatar>
              <ChevronDown className="size-4 text-muted" aria-hidden="true" />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-auto bg-background">
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between px-8 pb-3 pt-6">
              <div className="flex items-center gap-3">
                <h1 className="font-display text-[22px] font-semibold tracking-tight text-foreground">Sales pipeline</h1>
                <Button type="button" variant="ghost" className="h-auto px-2.5 py-1.5 text-[12px] text-secondary hover:bg-hover hover:text-foreground focus-visible:ring-foreground">
                  <ChevronDown className="size-4 text-muted" aria-hidden="true" />
                </Button>
                <Badge>5 stages</Badge>
                <Badge>26 open opps</Badge>
                <Badge tone="primary">₹ 85.2 L total value</Badge>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center rounded-md border border-border-strong bg-background">
                  <ViewButton active icon={Kanban}>Board</ViewButton>
                  <ViewButton icon={List}>List</ViewButton>
                  <ViewButton icon={BarChart3}>Forecast</ViewButton>
                </div>
                <Button type="button" variant="secondary" className="h-auto gap-1.5 px-3.5 py-[7px] text-[13px] focus-visible:ring-foreground">
                  <Filter className={iconClass} aria-hidden="true" />
                  Filter
                </Button>
                <Button type="button" onClick=