/* Generated from brief/mockups/13-workflows.html via Codex fidelity pass 2026-05-19. Do not hand-edit. */

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
  Clock,
  Filter,
  GitBranch,
  HardHat,
  History,
  Layers,
  LayoutDashboard,
  LayoutGrid,
  Mail,
  MessageCircle,
  MessagesSquare,
  MoreHorizontal,
  PanelLeftClose,
  Pause,
  Play,
  Plus,
  Save,
  Search,
  Settings,
  SquareCheck,
  Tag,
  UserPlus,
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

type WorkflowStatus = "Live" | "Paused" | "Draft";
type BadgeTone = "success" | "warning" | "neutral";

type WorkflowItem = {
  name: string;
  trigger: string;
  runs: string;
  status: WorkflowStatus;
  active?: boolean;
};

type WorkflowStep = {
  title: string;
  detail: string;
  icon: LucideIcon;
  mutedIcon?: boolean;
};

const workspaceNavItems: NavItem[] = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "Contacts", icon: Users },
  { label: "Vendors", icon: HardHat },
  { label: "Pipelines", icon: GitBranch },
  { label: "Projects", icon: Layers },
  { label: "Calendar", icon: Calendar },
  { label: "Conversations", icon: MessagesSquare },
  { label: "Forms", icon: ClipboardList },
  { label: "Workflows", icon: Zap, active: true },
  { label: "Reports", icon: BarChart3 },
  { label: "Settings", icon: Settings },
];

const surfaceNavItems: NavItem[] = [
  { label: "Outlook add-in", icon: Mail },
  { label: "Teams app", icon: UsersRound },
  { label: "M365 launcher", icon: LayoutGrid },
];

const workflows: WorkflowItem[] = [
  {
    name: "Vendor onboarding sequence",
    trigger: "Form submitted",
    runs: "12 runs · 30d",
    status: "Live",
    active: true,
  },
  {
    name: "Won opportunity → project",
    trigger: "Pipeline stage = Won",
    runs: "34 runs · 30d",
    status: "Live",
  },
  {
    name: "Deliverable approved → next ms",
    trigger: "Deliverable approved",
    runs: "22 runs · 30d",
    status: "Live",
  },
  {
    name: "Vendor NDA expiring (30d)",
    trigger: "Daily cron",
    runs: "4 runs · 30d",
    status: "Live",
  },
  {
    name: "Client status digest (weekly)",
    trigger: "Sunday 6 PM",
    runs: "8 runs · 30d",
    status: "Live",
  },
  {
    name: "Booking → SMS reminder",
    trigger: "Booking created",
    runs: "18 runs · 30d",
    status: "Paused",
  },
  {
    name: "Tag added: Hot lead",
    trigger: "Tag applied",
    runs: "0 runs · 30d",
    status: "Draft",
  },
  {
    name: "Shopify order → vendor fee",
    trigger: "Webhook: orders/paid",
    runs: "0 runs · 30d",
    status: "Draft",
  },
];

const workflowSteps: WorkflowStep[] = [
  {
    title: "1. Apply tag",
    detail: "Add tag “New vendor — pending review” to contact",
    icon: Tag,
  },
  {
    title: "2. Create vendor draft",
    detail: "Create Contact (type=vendor) with profile from form",
    icon: UserPlus,
  },
  {
    title: "3. Send welcome email",
    detail:
      "Template: vendor-welcome · sender: mail.designersmeet.com (Resend) · traffic: system_transactional",
    icon: Mail,
  },
  {
    title: "4. Send WhatsApp template",
    detail: "Template: VENDOR_WELCOME_V2 · channel: WhatsApp Cloud API · approved",
    icon: MessageCircle,
  },
  {
    title: "5. Wait 3 days",
    detail: "Pause workflow run, resume on May 21",
    icon: Clock,
    mutedIcon: true,
  },
  {
    title: "6. Post to Teams channel",
    detail: "Channel: #vendor-onboarding · message: “New vendor {name} ready for review”",
    icon: UsersRound,
  },
  {
    title: "7. Create task for PM",
    detail: "Assign to: Manish · title: “Review new vendor {name}” · due: +2d",
    icon: SquareCheck,
  },
];

const variablesAvailable = [
  "{{contact.first_name}}",
  "{{vendor.skills}}",
  "{{vendor.regions}}",
  "{{onboarding_link}}",
];

const lastRuns = [
  ["4h ago", "success", "success"],
  ["1d ago", "success", "success"],
  ["2d ago", "success", "success"],
  ["3d ago", "success", "success"],
  ["5d ago", "retried", "warning"],
] as const;

const iconClass = "size-4 shrink-0";
const iconLargeClass = "size-5 shrink-0 stroke-[1.75]";

const badgeToneClasses: Record<BadgeTone, string> = {
  success: "bg-success-tint text-success",
  warning: "bg-warning-tint text-warning",
  neutral: "bg-border-subtle text-secondary",
};

function statusTone(status: WorkflowStatus): BadgeTone {
  if (status === "Live") return "success";
  if (status === "Paused") return "warning";
  return "neutral";
}

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

function Brand() {
  return (
    <div className="inline-flex items-center gap-2 text-[14px] font-semibold tracking-normal text-foreground">
      <span className="inline-flex size-[22px] items-center justify-center rounded-[5px] border border-border bg-background text-[12px] font-bold text-foreground">
        D
      </span>
      <span>DesignersMeet</span>
    </div>
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
        "relative flex h-8 items-center rounded-md border border-border bg-subtle",
        className,
      )}
    >
      <Search
        className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted"
        aria-hidden="true"
      />
      <Input
        type="text"
        placeholder={placeholder}
        className={cn(
          "h-full border-0 bg-transparent py-0 pl-8 text-[13px] text-foreground shadow-none placeholder:text-muted focus:border-transparent focus:ring-0 focus:ring-transparent",
          shortcut ? "pr-14" : "pr-3",
        )}
      />
      {shortcut ? (
        <span className="absolute right-2 top-1/2 -translate-y-1/2">
          <kbd className="inline-flex items-center rounded border border-border bg-background px-[5px] py-px font-sans text-[11px] font-medium text-muted shadow-card">
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

function Badge({
  children,
  tone = "neutral",
  dot,
}: {
  children: ReactNode;
  tone?: BadgeTone;
  dot?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium leading-[18px] tracking-[0.01em]",
        badgeToneClasses[tone],
      )}
    >
      {dot ? <span className="size-1.5 rounded-full bg-current" /> : null}
      {children}
    </span>
  );
}

function WorkflowCard({ workflow }: { workflow: WorkflowItem }) {
  return (
    <Card
      className={cn(
        "cursor-pointer rounded-md px-3 py-2.5 hover:bg-hover",
        workflow.active ? "border-border-strong bg-subtle/60" : "border-border bg-background",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 text-[12.5px] font-semibold leading-snug text-foreground">
          {workflow.name}
        </div>
        <Badge tone={statusTone(workflow.status)} dot>
          {workflow.status}
        </Badge>
      </div>
      <div className="mt-1 truncate text-[11px] text-muted">{workflow.trigger}</div>
      <div className="mt-1 text-[10.5px] text-muted">{workflow.runs}</div>
    </Card>
  );
}

function Connector() {
  return (
    <div className="flex justify-center py-1">
      <div className="h-6 w-px bg-border-strong" />
    </div>
  );
}

function WorkflowActionNode({ step }: { step: WorkflowStep }) {
  const Icon = step.icon;

  return (
    <Card className="rounded-lg border-2 border-border bg-background p-4 shadow-card">
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-md text-secondary",
            step.mutedIcon ? "bg-subtle" : "bg-background",
          )}
        >
          <Icon className={iconLargeClass} aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-muted">ACTION</div>
          <div className="mt-0.5 text-[14px] font-semibold text-foreground">{step.title}</div>
          <div className="mt-1 text-[12px] leading-snug text-secondary">{step.detail}</div>
        </div>
        <IconButton title="More">
          <MoreHorizontal className={iconClass} aria-hidden="true" />
        </IconButton>
      </div>
    </Card>
  );
}

export default function Workflows() {
  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground antialiased">
      <aside className="flex w-[232px] shrink-0 flex-col border-r border-border bg-sidebar">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <Brand />
          <IconButton title="Collapse">
            <PanelLeftClose className={iconClass} aria-hidden="true" />
          </IconButton>
        </div>

        <div className="px-3 pt-3">
          <div className="flex items-center justify-between gap-2 rounded-md border border-border bg-background px-2.5 py-2">
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
            <span className="text-muted">Workflows</span>
            <ChevronRight className="size-4 shrink-0 text-disabled" aria-hidden="true" />
            <span className="font-medium text-foreground">Vendor onboarding sequence</span>
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
            <Button
              type="button"
              variant="ghost"
              className="h-auto gap-2 rounded-md px-2 py-1 text-secondary hover:bg-hover focus-visible:ring-foreground"
            >
              <Avatar size="sm">MS</Avatar>
              <ChevronDown className="size-4 shrink-0 text-muted" aria-hidden="true" />
            </Button>
          </div>
        </header>

        <main className="flex-1 overflow-auto bg-background">
          <div className="flex h-full">
            <aside className="flex w-[280px] flex-col border-r border-border">
              <div className="border-b border-border px-4 py-3">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-[15px] font-semibold text-foreground">Workflows</h2>
                  <Button className="h-auto gap-1.5 px-2.5 py-1 text-[12px]">
                    <Plus className={iconClass} aria-hidden="true" />
                    New
                  </Button>
                </div>
                <SearchField placeholder="Filter…" />
              </div>

              <div className="flex-1 space-y-1 overflow-y-auto p-2">
                {workflows.map((workflow) => (
                  <WorkflowCard key={workflow.name} workflow={workflow} />
                ))}
              </div>
            </aside>

            <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
              <div className="flex items-center justify-between border-b border-border px-6 py-3">
                <div className="flex items-center gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h1 className="text-[16px] font-semibold text-foreground">
                        Vendor onboarding sequence
                      </h1>
                      <Badge tone="success" dot>
                        Live
                      </Badge>
                    </div>
                    <div className="text-[11.5px] text-muted">
                      12 runs this month · 100% success · last run 4h ago
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    className="h-auto gap-1.5 px-2.5 py-1.5 text-[12px] text-secondary hover:bg-hover hover:text-foreground focus-visible:ring-foreground"
                  >
                    <History className={iconClass} aria-hidden="true" />
                    Run history
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    className="h-auto gap-1.5 px-3.5 py-[7px] text-[13px] focus-visible:ring-foreground"
                  >
                    <Play className={iconClass} aria-hidden="true" />
                    Test run
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    className="h-auto gap-1.5 px-3.5 py-[7px] text-[13px] focus-visible:ring-foreground"
                  >
                    <Pause className={iconClass} aria-hidden="true" />
                    Pause
                  </Button>
                  <Button className="h-auto gap-1.5 px-3.5 py-[7px] text-[13px]">
                    <Save className={iconClass} aria-hidden="true" />
                    Save
                  </Button>
                </div>
              </div>

              <div className="flex-1 overflow-auto bg-subtle/30 p-8">
                <div className="mx-auto max-w-[640px]">
                  <Card className="rounded-lg border-2 border-border-strong bg-background p-4 shadow-card">
                    <div className="flex items-start gap-3">
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-subtle text-secondary">
                        <Zap className={iconLargeClass} aria-hidden="true" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-[10px] font-semibold uppercase tracking-wider text-muted">
                          TRIGGER
                        </div>
                        <div className="mt-0.5 text-[14px] font-semibold text-foreground">
                          When form is submitted
                        </div>
                        <div className="mt-1 text-[12px] leading-snug text-secondary">
                          Form: Vendor onboarding (vendor-onboarding · public)
                        </div>
                      </div>
                      <IconButton title="More">
                        <MoreHorizontal className={iconClass} aria-hidden="true" />
                      </IconButton>
                    </div>
                  </Card>

                  <Connector />

                  <Card className="rounded-lg border border-border bg-background p-3.5">
                    <div className="flex items-start gap-3">
                      <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-subtle text-secondary">
                        <Filter className={iconClass} aria-hidden="true" />
                      </div>
                      <div className="flex-1">
                        <div className="text-[10px] font-semibold uppercase tracking-wider text-muted">
                          FILTER
                        </div>
                        <div className="mt-0.5 text-[12.5px] text-secondary">
                          <span className="font-mono">vendor.tier ≠ "Tier-3"</span>
                          <span className="mx-1.5 text-muted">AND</span>
                          <span className="font-mono">contact.email_verified = true</span>
                        </div>
                      </div>
                    </div>
                  </Card>

                  {workflowSteps.map((step) => (
                    <div key={step.title}>
                      <Connector />
                      <WorkflowActionNode step={step} />
                    </div>
                  ))}

                  <div className="mt-2 flex justify-center">
                    <Button
                      type="button"
                      variant="secondary"
                      className="h-auto gap-1.5 px-3.5 py-[7px] text-[12px] focus-visible:ring-foreground"
                    >
                      <Plus className={iconClass} aria-hidden="true" />
                      Add step
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <aside className="w-[300px] overflow-auto border-l border-border bg-background">
              <div className="border-b border-border px-5 py-3">
                <div className="text-[12px] font-semibold uppercase tracking-wider text-muted">
                  Inspector
                </div>
                <div className="mt-1 text-[15px] font-semibold text-foreground">
                  Send welcome email
                </div>
              </div>

              <div className="space-y-4 p-5">
                <div>
                  <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-muted">
                    Email provider
                  </label>
                  <select className="h-[34px] w-full rounded-md border border-border-strong bg-background px-3 text-[13px] text-foreground outline-none focus:border-foreground focus:ring-[3px] focus:ring-border-subtle">
                    <option>Resend (mail.designersmeet.com) — system_transactional</option>
                    <option>Microsoft Graph — human_outbound</option>
                    <option>Postmark — system_transactional</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-muted">
                    Template
                  </label>
                  <select className="h-[34px] w-full rounded-md border border-border-strong bg-background px-3 text-[13px] text-foreground outline-none focus:border-foreground focus:ring-[3px] focus:ring-border-subtle">
                    <option>vendor-welcome (v3)</option>
                    <option>vendor-welcome (v2 — archived)</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-muted">
                    Subject
                  </label>
                  <Input
                    defaultValue="Welcome to DesignersMeet, {{contact.first_name}}"
                    className="focus:border-foreground focus:ring-border-subtle"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-muted">
                    Variables available
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {variablesAvailable.map((variable) => (
                      <Badge key={variable}>{variable}</Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-muted">
                    On failure
                  </label>
                  <select className="h-[34px] w-full rounded-md border border-border-strong bg-background px-3 text-[13px] text-foreground outline-none focus:border-foreground focus:ring-[3px] focus:ring-border-subtle">
                    <option>Skip & continue · log error</option>
                    <option>Pause workflow run</option>
                    <option>Retry once after 30 min</option>
                  </select>
                </div>

                <div className="border-t border-border-subtle pt-3">
                  <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted">
                    Last 5 runs
                  </div>
                  <div className="space-y-1.5 text-[12px]">
                    {lastRuns.map(([time, label, tone]) => (
                      <div key={`${time}-${label}`} className="flex items-center justify-between">
                        <span className="text-secondary">{time}</span>
                        <Badge tone={tone}>{label}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </main>
      </div>
    </div>
  );
}
