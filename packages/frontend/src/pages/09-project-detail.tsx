/* Generated from brief/mockups/09-project-detail.html via Codex fidelity pass 2026-05-19. Do not hand-edit. */

import { useState, useRef, type MouseEventHandler, type ReactNode } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  AtSign,
  BarChart3,
  Bell,
  Calendar,
  Check,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  ChevronsUpDown,
  CircleHelp,
  ClipboardList,
  FolderOpen,
  GitBranch,
  HardHat,
  History,
  Layers,
  LayoutDashboard,
  LayoutGrid,
  Mail,
  MessagesSquare,
  MoreHorizontal,
  PanelLeftClose,
  Paperclip,
  Plus,
  Search,
  Settings,
  UserPlus,
  Users,
  UsersRound,
  X,
  Zap,
  type LucideIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useItem, useList, useUpdate } from "../hooks/useResource.js";
import { useUIStore } from "../stores/uiStore.js";

type NavItem = {
  label: string;
  icon: LucideIcon;
  active?: boolean;
};

type BadgeVariant = "neutral" | "success" | "warning" | "danger" | "info";

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

const milestones = [
  { label: "Brief sign-off", status: "done" },
  { label: "Concept", status: "done" },
  { label: "Design dev", status: "active" },
  { label: "Procurement", status: "pending" },
  { label: "Install", status: "pending" },
  { label: "Snag", status: "pending" },
  { label: "Handover", status: "pending" },
] as const;

const tabs = [
  { label: "Overview", value: "overview" },
  { label: "Tasks", value: "tasks", count: "23" },
  { label: "Deliverables", value: "deliverables", count: "12" },
  { label: "Vendors", value: "vendors", count: "3" },
  { label: "Files", value: "files", count: "47" },
  { label: "Activity", value: "activity" },
];

const deliverables = [
  {
    title: "Concept board v3",
    vendor: "Aurora Studio · v3",
    status: "In review",
    statusVariant: "info",
  },
  {
    title: "Material palette v2",
    vendor: "Aurora Studio · v3",
    status: "Approved",
    statusVariant: "success",
  },
  {
    title: "3D — bar elevation",
    vendor: "Render Boutique · v3",
    status: "Awaiting upload",
    statusVariant: "warning",
  },
  {
    title: "Brand mark refresh",
    vendor: "Aurora Studio · v3",
    status: "In review",
    statusVariant: "info",
  },
] as const;

const tasks = [
  {
    title: "Approve concept board v3",
    status: "In progress",
    variant: "info",
    due: "Today",
    owner: "Manish",
    state: "active",
  },
  {
    title: "Order brass bar fittings (sample)",
    status: "To do",
    variant: "neutral",
    due: "Wed, May 20",
    owner: "Aurora Studio",
    state: "todo",
  },
  {
    title: "Confirm cane fabric — alternate from FabTextiles",
    status: "To do",
    variant: "neutral",
    due: "Thu, May 21",
    owner: "Anita M.",
    state: "todo",
  },
  {
    title: "Send Pune install timeline to Priya",
    status: "To do",
    variant: "neutral",
    due: "Fri, May 22",
    owner: "Manish",
    state: "todo",
  },
  {
    title: "Lock floor plan (final)",
    status: "Blocked",
    variant: "danger",
    due: "Mon, May 25",
    owner: "Anita M.",
    state: "blocked",
  },
] as const;

const activities = [
  {
    initials: "AS",
    actor: "Aurora Studio",
    action: "uploaded",
    target: "Concept board v3.pdf",
    time: "5h ago",
  },
  {
    initials: "MS",
    actor: "Manish",
    action: "marked deliverable",
    target: "Material palette v2 → Approved",
    time: "1d ago",
  },
  {
    initials: "VE",
    actor: "Voltek Electricals",
    action: "left a comment on",
    target: "Electrical load schedule",
    time: "2d ago",
  },
  {
    initials: "SY",
    actor: "System",
    action: "renewed",
    target: "Microsoft Graph mail subscription",
    time: "3d ago",
  },
  {
    initials: "AS",
    actor: "Aurora Studio",
    action: "accepted assignment for",
    target: "Concept lead · 3D",
    time: "1w ago",
  },
];

const vendors = [
  {
    initials: "AS",
    name: "Aurora Studio",
    detail: "Concept lead · 3D · ₹ 3,25,000",
    status: "Active",
    variant: "success",
  },
  {
    initials: "RB",
    name: "Render Boutique",
    detail: "VR walk-through · ₹ 1,20,000",
    status: "Active",
    variant: "success",
  },
  {
    initials: "FT",
    name: "FabTextiles",
    detail: "Soft furnishings · ₹ 78,000",
    status: "Invited",
    variant: "warning",
  },
] as const;

const comments = [
  {
    initials: "MS",
    name: "Manish",
    time: "2h ago",
    body: "Priya is in on Wed for the concept review — let's batch the material samples + brand mark in the same session.",
  },
  {
    initials: "AS",
    name: "Aurora Studio",
    time: "5h ago",
    body: "v3 uploaded. Brass detail above the bar revised per call. Cane fabric option B from FabTextiles in slide 12.",
  },
];

const projectDetails = [
  ["Started", "Mar 12, 2026"],
  ["Target end", "Jun 30, 2026"],
  ["Budget", "₹ 18.4 L"],
  ["Spent", "₹ 6.2 L (34%)"],
  ["Opportunity source", "Referral"],
];

const iconClass = "size-4 shrink-0";

const badgeVariants: Record<BadgeVariant, string> = {
  neutral: "bg-border-subtle text-secondary",
  success: "bg-success-tint text-success",
  warning: "bg-warning-tint text-warning",
  danger: "bg-danger-tint text-danger",
  info: "bg-info-tint text-info",
};

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
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium leading-[18px] tracking-normal",
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
  shortcut,
  className,
}: {
  placeholder: string;
  shortcut?: string;
  className?: string;
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

function AppSidebar() {
  return (
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
  );
}

function Topbar() {
  return (
    <header className="flex h-[52px] items-center gap-4 border-b border-border bg-background px-5">
      <nav className="flex items-center gap-2 text-[13px]">
        <span className="text-muted">Projects</span>
        <ChevronRight className="size-4 text-disabled" aria-hidden="true" />
        <span className="font-medium text-foreground">Brand Refresh — Lumen Café</span>
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
  );
}

function isDoneStatus(status: string) {
  return status === "done" || status === "approved";
}

function MilestoneBar({
  rows = milestones,
}: {
  rows?: ReadonlyArray<{ label: string; status: string }>;
}) {
  return (
    <div className="mt-5 grid grid-cols-7 gap-2">
      {rows.map((milestone) => (
        <div key={milestone.label} className="flex flex-col items-center gap-2 text-center">
          <div
            className={cn(
              "flex size-7 items-center justify-center rounded-full",
              isDoneStatus(milestone.status) && "bg-success text-background",
              milestone.status === "active" && "bg-primary text-background ring-4 ring-primary-tint",
              milestone.status === "pending" && "border border-border-strong bg-background text-muted",
            )}
          >
            {isDoneStatus(milestone.status) ? <Check className={iconClass} aria-hidden="true" /> : null}
            {milestone.status === "active" ? (
              <span className="size-1.5 rounded-full bg-background" />
            ) : null}
            {milestone.status === "pending" ? <span className="text-[10px]">·</span> : null}
          </div>
          <div
            className={cn(
              "text-[11px] leading-tight",
              milestone.status === "active" ? "font-semibold text-foreground" : null,
              isDoneStatus(milestone.status) ? "text-foreground" : null,
              milestone.status === "pending" ? "text-muted" : null,
            )}
          >
            {milestone.label}
          </div>
        </div>
      ))}
    </div>
  );
}

function DeliverablePreview() {
  return (
    <div className="flex aspect-[4/3] items-center justify-center bg-subtle">
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

function DeliverableCard({ deliverable }: { deliverable: (typeof deliverables)[number] }) {
  return (
    <div className="group overflow-hidden rounded-lg border border-border bg-background transition-colors hover:border-border-strong">
      <DeliverablePreview />
      <div className="border-t border-border p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="truncate text-[13px] font-semibold text-foreground">
              {deliverable.title}
            </div>
            <div className="truncate text-[11px] text-muted">{deliverable.vendor}</div>
          </div>
          <StatusPill variant={deliverable.statusVariant}>{deliverable.status}</StatusPill>
        </div>
        <div className="mt-2.5 flex items-center justify-between border-t border-border-subtle pt-2.5">
          <div className="flex items-center gap-2 text-[11px] text-muted">
            <span className="flex items-center gap-1">
              <History className={iconClass} aria-hidden="true" />3 versions
            </span>
          </div>
          <button
            type="button"
            className="text-[11px] font-medium text-secondary opacity-0 transition-opacity group-hover:opacity-100 hover:text-foreground focus-visible:outline-foreground"
          >
            Request approval →
          </button>
        </div>
      </div>
    </div>
  );
}

function TaskRow({ task }: { task: (typeof tasks)[number] }) {
  return (
    <div className="flex items-center gap-3 border-b border-border-subtle px-4 py-2.5 last:border-b-0 hover:bg-hover">
      <button
        type="button"
        className={cn(
          "flex size-4 items-center justify-center rounded-sm border-2",
          task.state === "active" && "border-info bg-info-tint",
          task.state === "todo" && "border-border-strong bg-background",
          task.state === "blocked" && "border-danger bg-background",
        )}
        aria-label={task.title}
      >
        {task.state === "active" ? <span className="size-1.5 rounded-sm bg-info" /> : null}
        {task.state === "blocked" ? <X className="size-2.5 text-danger" aria-hidden="true" /> : null}
      </button>
      <div className="min-w-0 flex-1 text-[13px] text-foreground">{task.title}</div>
      <Badge variant={task.variant}>{task.status}</Badge>
      <span className="w-[90px] text-right text-[11px] text-muted">{task.due}</span>
      <span className="w-[80px] text-right text-[11px] text-muted">{task.owner}</span>
    </div>
  );
}

function ActivityRow({ activity }: { activity: (typeof activities)[number] }) {
  return (
    <div className="flex items-start gap-3 border-b border-border-subtle px-4 py-2.5 last:border-b-0">
      <Avatar size="sm">{activity.initials}</Avatar>
      <div className="min-w-0 flex-1">
        <div className="text-[12.5px] text-secondary">
          <span className="font-medium text-foreground">{activity.actor}</span> {activity.action}{" "}
          <span className="font-medium text-foreground">{activity.target}</span>
        </div>
        <div className="text-[11px] text-muted">{activity.time}</div>
      </div>
    </div>
  );
}

function VendorRow({ vendor }: { vendor: (typeof vendors)[number] }) {
  return (
    <div className="flex items-center gap-3 border-b border-border-subtle px-4 py-3 last:border-b-0">
      <Avatar>{vendor.initials}</Avatar>
      <div className="min-w-0 flex-1">
        <div className="truncate text-[13px] font-semibold text-foreground">{vendor.name}</div>
        <div className="truncate text-[11px] text-muted">{vendor.detail}</div>
      </div>
      <Badge variant={vendor.variant} dot>
        {vendor.status}
      </Badge>
    </div>
  );
}

export default function ProjectDetail() {
  const params = useParams();
  const navigate = useNavigate();
  const pid = params.id ?? "pj4";
  const p = useItem("projects", pid).data as any;
  const allStages = useList<any>("project-stages").data?.data ?? [];
  const stageRows = allStages
    .filter((s: any) => s.project_id === pid)
    .sort((a: any, b: any) => a.order - b.order);
  const updateStage = useUpdate<any>("project-stages");
  const [commentBody, setCommentBody] = useState("");
  const createComment = useUpdate<any>("projects"); // placeholder until comments endpoint exists

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground antialiased">
      <AppSidebar />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Topbar />

        <main className="flex-1 overflow-auto bg-background">
          <div className="flex h-full flex-col">
            <div className="border-b border-border-subtle px-8 pb-4 pt-6">
              <div className="mb-3">
                <button
                  type="button"
                  onClick={() => navigate("/projects")}
                  className="flex items-center gap-1.5 text-[12px] text-secondary hover:text-foreground focus-visible:outline-foreground"
                >
                  <ArrowLeft className="size-4" aria-hidden="true" />
                  Back to Projects
                </button>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex size-12 items-center justify-center rounded-lg border border-border bg-background text-foreground">
                  <Layers className="size-5" aria-hidden="true" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h1 className="font-display text-[22px] font-semibold tracking-normal text-foreground">
                      {p?.name ?? "Brand Refresh — Lumen Café"}
                    </h1>
                    <StatusPill variant="info">Design</StatusPill>
                    <Badge variant="success" dot>
                      On track
                    </Badge>
                  </div>
                  <div className="mt-1 text-[12.5px] text-muted">
                    <span className="font-medium text-secondary">Priya Raghavan</span> · PM{" "}
                    <span className="font-medium text-secondary">Manish</span> · Designer{" "}
                    <span className="font-medium text-secondary">Anita M.</span> · Target{" "}
                    <span className="font-medium text-secondary">Jun 30, 2026</span> · 43 days remaining
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => { console.warn("TODO: backend endpoint needed — SharePoint project folder URL"); }}
                    className="h-auto gap-1.5 px-3.5 py-[7px] text-[13px] focus-visible:ring-foreground"
                  >
                    <FolderOpen className={iconClass} data-icon="inline-start" aria-hidden="true" />
                    SharePoint
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => { console.warn("TODO: backend endpoint needed — Teams channel deep link"); }}
                    className="h-auto gap-1.5 px-3.5 py-[7px] text-[13px] focus-visible:ring-foreground"
                  >
                    <UsersRound className={iconClass} data-icon="inline-start" aria-hidden="true" />
                    Teams channel
                  </Button>
                  <Button
                    type="button"
                    onClick={() =>
                      updateStage.mutate({
                        id: stageRows[0]?.id ?? "pjs1",
                        patch: { status: "approved" },
                      })
                    }
                    className="h-auto gap-1.5 bg-primary px-3.5 py-[7px] text-[13px] text-background hover:bg-primary-hover"
                  >
                    <CheckCircle className={iconClass} data-icon="inline-start" aria-hidden="true" />
                    Mark milestone done
                  </Button>
                  <IconButton title="More actions" onClick={() => useUIStore.getState().openEdit("projects", pid)}>
                    <MoreHorizontal className={iconClass} aria-hidden="true" />
                  </IconButton>
                </div>
              </div>

              <MilestoneBar rows={stageRows.length > 0 ? stageRows : milestones} />

              <Tabs defaultValue="overview" className="mt-5">
                <TabsList>
                  {tabs.map((tab) => (
                    <TabsTrigger key={tab.value} value={tab.value}>
                      {tab.label}
                      {tab.count ? <Badge className="ml-1">{tab.count}</Badge> : null}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>

            <div className="flex-1 overflow-auto">
              <div className="grid grid-cols-3 gap-6 px-8 py-6">
                <div className="col-span-2 flex flex-col gap-4">
                  <Card>
                    <CardHeader>
                      <div className="text-[13px] font-semibold text-foreground">
                        Deliverables — current milestone
                      </div>
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => useUIStore.getState().openCreate("deliverables")}
                        className="h-auto gap-1.5 px-3.5 py-[7px] text-[12px] focus-visible:ring-foreground"
                      >
                        <Plus className={iconClass} data-icon="inline-start" aria-hidden="true" />
                        New deliverable
                      </Button>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-3">
                        {deliverables.map((deliverable) => (
                          <DeliverableCard key={deliverable.title} deliverable={deliverable} />
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <div className="text-[13px] font-semibold text-foreground">Next-up tasks</div>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => navigate(`/projects/${pid}?tab=tasks`)}
                        className="h-auto px-2.5 py-1.5 text-[12px] text-secondary hover:bg-hover hover:text-foreground focus-visible:ring-foreground"
                      >
                        Full task list →
                      </Button>
                    </CardHeader>
                    <CardContent className="p-0">
                      {tasks.map((task) => (
                        <TaskRow key={task.title} task={task} />
                      ))}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <div className="text-[13px] font-semibold text-foreground">Activity</div>
                      <div className="flex items-center gap-2">
                        <Badge>All</Badge>
                        <Badge>Comments</Badge>
                        <Badge>Status</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-0">
                      {activities.map((activity) => (
                        <ActivityRow key={`${activity.actor}-${activity.time}`} activity={activity} />
                      ))}
                    </CardContent>
                  </Card>
                </div>

                <div className="col-span-1 flex flex-col gap-4">
                  <Card>
                    <CardHeader>
                      <div className="text-[13px] font-semibold text-foreground">Assigned vendors</div>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => useUIStore.getState().openCreate("vendors")}
                        className="h-auto gap-1.5 px-2.5 py-1.5 text-[12px] text-secondary hover:bg-hover hover:text-foreground focus-visible:ring-foreground"
                      >
                        <UserPlus className={iconClass} data-icon="inline-start" aria-hidden="true" />
                        Invite
                      </Button>
                    </CardHeader>
                    <CardContent className="p-0">
                      {vendors.map((vendor) => (
                        <VendorRow key={vendor.name} vendor={vendor} />
                      ))}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <div className="text-[13px] font-semibold text-foreground">Comments</div>
                    </CardHeader>
                    <CardContent className="p-0">
                      {comments.map((comment) => (
                        <div key={`${comment.name}-${comment.time}`} className="border-b border-border-subtle px-4 py-3">
                          <div className="flex items-start gap-2.5">
                            <Avatar size="sm">{comment.initials}</Avatar>
                            <div className="min-w-0 flex-1">
                              <div className="text-[12px]">
                                <span className="font-medium text-foreground">{comment.name}</span>{" "}
                                <span className="text-muted">· {comment.time}</span>
                              </div>
                              <div className="mt-1 text-[12.5px] leading-snug text-secondary">
                                {comment.body}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      <div className="px-4 py-2.5">
                        <textarea
                          className="w-full resize-none border-0 bg-background text-[13px] text-foreground placeholder:text-muted focus:outline-none"
                          rows={2}
                          placeholder="Comment or @mention…"
                          value={commentBody}
                          onChange={(e) => setCommentBody(e.target.value)}
                          onKeyDown={(e) => {
                            if ((e.metaKey || e.ctrlKey) && e.key === "Enter" && commentBody.trim()) {
                              console.warn("TODO: backend endpoint needed — POST /api/projects/:id/comments");
                              setCommentBody("");
                            }
                          }}
                        />
                        <div className="mt-1 flex items-center justify-between">
                          <div className="flex gap-1">
                            <IconButton title="Attach file" onClick={() => console.warn("TODO: backend endpoint needed — file attachment")}>
                              <Paperclip className={iconClass} aria