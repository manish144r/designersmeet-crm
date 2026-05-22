/* Generated from brief/mockups/02-onboarding.html via Codex fidelity pass 2026-05-19. Do not hand-edit. */

import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Bell,
  Building2,
  Calendar,
  Check,
  ChevronDown,
  ChevronsUpDown,
  CircleHelp,
  ClipboardList,
  Folder,
  GitBranch,
  HardHat,
  Layers,
  LayoutDashboard,
  LayoutGrid,
  Link as LinkIcon,
  Mail,
  MessagesSquare,
  MoreHorizontal,
  PanelLeftClose,
  Plus,
  Search,
  Settings,
  Users,
  UsersRound,
  Zap,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type NavItemProps = {
  icon: LucideIcon;
  label: string;
  active?: boolean;
};

const workspaceNavItems: NavItemProps[] = [
  { icon: LayoutDashboard, label: "Dashboard", active: true },
  { icon: Users, label: "Contacts" },
  { icon: HardHat, label: "Vendors" },
  { icon: GitBranch, label: "Pipelines" },
  { icon: Layers, label: "Projects" },
  { icon: Calendar, label: "Calendar" },
  { icon: MessagesSquare, label: "Conversations" },
  { icon: ClipboardList, label: "Forms" },
  { icon: Zap, label: "Workflows" },
  { icon: BarChart3, label: "Reports" },
  { icon: Settings, label: "Settings" },
];

const surfaceNavItems: NavItemProps[] = [
  { icon: Mail, label: "Outlook add-in" },
  { icon: UsersRound, label: "Teams app" },
  { icon: LayoutGrid, label: "M365 launcher" },
];

function IconButton({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Button
      variant="ghost"
      size="icon"
      title={title}
      aria-label={title}
      className={cn("h-[30px] w-[30px] rounded-md text-secondary hover:bg-hover hover:text-foreground", className)}
    >
      {children}
    </Button>
  );
}

function Initials({ children, small = false }: { children: React.ReactNode; small?: boolean }) {
  return (
    <div
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full border border-border bg-background font-semibold uppercase tracking-[0.02em] text-foreground",
        small ? "size-[22px] text-[10px]" : "size-7 text-[12px]",
      )}
    >
      {children}
    </div>
  );
}

function NavItem({ icon: Icon, label, active = false }: NavItemProps) {
  return (
    <div
      className={cn(
        "flex cursor-pointer select-none items-center gap-2.5 rounded-md px-2.5 py-[7px] text-[13px] font-medium transition-colors",
        active
          ? "bg-primary-tint text-primary"
          : "text-secondary hover:bg-border-subtle hover:text-foreground",
      )}
      data-active={active ? "true" : "false"}
    >
      <Icon className={cn("size-4 shrink-0", active ? "text-primary" : "text-muted")} strokeWidth={1.75} aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}

function MicrosoftMark() {
  return (
    <svg viewBox="0 0 21 21" className="size-4" aria-hidden="true">
      <rect x="1" y="1" width="9" height="9" className="fill-foreground" />
      <rect x="11" y="1" width="9" height="9" className="fill-secondary" />
      <rect x="1" y="11" width="9" height="9" className="fill-muted" />
      <rect x="11" y="11" width="9" height="9" className="fill-disabled" />
    </svg>
  );
}

function IntegrationCard({
  icon: Icon,
  title,
  description,
  scopes,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  scopes: string;
}) {
  return (
    <div className="rounded-lg border border-border p-4">
      <Icon className="mb-3 size-5 text-secondary" strokeWidth={1.75} aria-hidden="true" />
      <div className="text-[13px] font-semibold text-foreground">{title}</div>
      <div className="mt-1 text-[12px] text-secondary">{description}</div>
      <div className="mt-3 text-[11px] text-muted">{scopes}</div>
    </div>
  );
}

export default function Onboarding() {
  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground antialiased">
      <aside className="flex w-[232px] flex-shrink-0 flex-col border-r border-border bg-sidebar">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="inline-flex items-center gap-2 text-[14px] font-semibold tracking-[-0.01em] text-foreground">
            <span className="inline-flex size-[22px] items-center justify-center rounded-[5px] bg-foreground text-[12px] font-bold tracking-[-0.04em] text-background">
              D
            </span>
            <span>DesignersMeet</span>
          </div>
          <IconButton title="Collapse">
            <PanelLeftClose className="size-3.5" strokeWidth={1.75} aria-hidden="true" />
          </IconButton>
        </div>

        <div className="px-3 pt-3">
          <div className="flex cursor-pointer items-center justify-between rounded-md border border-border bg-background px-2.5 py-2 hover:bg-hover">
            <div className="flex min-w-0 items-center gap-2">
              <div className="flex size-6 flex-shrink-0 items-center justify-center rounded-md bg-foreground text-[10px] font-bold text-background">
                HQ
              </div>
              <div className="min-w-0">
                <div className="truncate text-[12px] font-semibold text-foreground">DesignersMeet HQ</div>
                <div className="truncate text-[10px] text-secondary">Bengaluru workspace</div>
              </div>
            </div>
            <ChevronsUpDown className="size-3.5 text-muted" strokeWidth={1.75} aria-hidden="true" />
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-2 pt-3">
          <div className="mb-1.5 mt-3.5 px-2.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-muted">
            Workspace
          </div>
          <div className="flex flex-col gap-0.5">
            {workspaceNavItems.map((item) => (
              <NavItem key={item.label} {...item} />
            ))}
          </div>

          <div className="mb-1.5 mt-3.5 px-2.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-muted">
            Surfaces
          </div>
          <div className="flex flex-col gap-0.5">
            {surfaceNavItems.map((item) => (
              <NavItem key={item.label} {...item} />
            ))}
          </div>
        </nav>

        <div className="border-t border-border px-3 py-3">
          <div className="flex items-center gap-2 px-1">
            <Initials>MS</Initials>
            <div className="min-w-0">
              <div className="truncate text-[12px] font-semibold text-foreground">Manish</div>
              <div className="truncate text-[10px] text-secondary">Workspace owner</div>
            </div>
            <IconButton title="Menu" className="ml-auto">
              <MoreHorizontal className="size-3.5" strokeWidth={1.75} aria-hidden="true" />
            </IconButton>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex h-[52px] items-center gap-4 border-b border-border bg-background px-5">
          <nav className="flex items-center gap-2 text-[13px]">
            <span className="font-medium text-foreground">Welcome</span>
          </nav>

          <div className="relative ml-auto mr-auto max-w-[480px] flex-1">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted" strokeWidth={1.75} aria-hidden="true" />
            <Input
              type="text"
              placeholder="Search contacts, projects, vendors…"
              className="h-8 rounded-md border-border bg-subtle py-0 pl-8 pr-16 text-[13px] text-foreground placeholder:text-muted focus:border-primary focus:bg-background focus:ring-[3px] focus:ring-primary-tint"
            />
            <span className="absolute right-2 top-1/2 -translate-y-1/2">
              <kbd className="inline-flex items-center rounded-sm border border-b-2 border-border bg-background px-[5px] py-px font-sans text-[11px] leading-4 text-muted">
                ⌘K
              </kbd>
            </span>
          </div>

          <div className="ml-auto flex items-center gap-1">
            <IconButton title="Help">
              <CircleHelp className="size-3.5" strokeWidth={1.75} aria-hidden="true" />
            </IconButton>
            <IconButton title="Notifications" className="relative">
              <Bell className="size-3.5" strokeWidth={1.75} aria-hidden="true" />
              <span className="absolute right-1 top-1 size-1.5 rounded-full bg-muted" />
            </IconButton>
            <div className="mx-1 h-6 w-px bg-border" />
            <button className="flex items-center gap-2 rounded-md px-2 py-1 hover:bg-hover">
              <Initials small>MS</Initials>
              <ChevronDown className="size-3.5 text-muted" strokeWidth={1.75} aria-hidden="true" />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-auto bg-background">
          <div className="mx-auto max-w-[1040px] px-8 py-10">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h1 className="font-display text-[24px] font-semibold tracking-tight text-foreground">
                  Welcome, Manish
                </h1>
                <p className="mt-1 text-[14px] text-secondary">
                  Let's set up DesignersMeet HQ. You can come back to any step from Settings.
                </p>
              </div>
              <Button variant="ghost" className="h-auto px-2.5 py-1.5 text-[13px] font-medium text-secondary hover:bg-hover hover:text-foreground">
                Skip for now
              </Button>
            </div>

            <Card className="mb-6">
              <CardContent className="p-5">
                <div className="flex items-center gap-4">
                  <div className="flex flex-1 items-center gap-2.5">
                    <span className="flex size-6 items-center justify-center rounded-full bg-success-tint text-[11px] font-semibold text-success">
                      <Check className="size-3.5" strokeWidth={1.75} aria-hidden="true" />
                    </span>
                    <span className="text-[13px] font-medium text-foreground">Workspace created</span>
                  </div>
                  <div className="h-px flex-1 bg-border" />
                  <div className="flex flex-1 items-center gap-2.5">
                    <span className="flex size-6 items-center justify-center rounded-full bg-border-subtle text-[11px] font-semibold text-foreground">
                      2
                    </span>
                    <span className="text-[13px] font-medium text-foreground">Connect Microsoft 365</span>
                  </div>
                  <div className="h-px flex-1 bg-border" />
                  <div className="flex flex-1 items-center gap-2.5">
                    <span className="flex size-6 items-center justify-center rounded-full bg-border-subtle text-[11px] font-semibold text-muted">
                      3
                    </span>
                    <span className="text-[13px] font-medium text-secondary">Import vendors</span>
                  </div>
                  <div className="h-px flex-1 bg-border" />
                  <div className="flex flex-1 items-center gap-2.5">
                    <span className="flex size-6 items-center justify-center rounded-full bg-border-subtle text-[11px] font-semibold text-muted">
                      4
                    </span>
                    <span className="text-[13px] font-medium text-secondary">Invite your team</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mb-6">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-subtle">
                    <MicrosoftMark />
                  </div>
                  <div>
                    <div className="text-[14px] font-semibold text-foreground">Connect Microsoft 365</div>
                    <div className="text-[12px] text-secondary">
                      We'll sync Outlook mail, Calendar, and SharePoint files.
                    </div>
                  </div>
                </div>
                <Button className="h-auto gap-1.5 rounded-md px-3.5 py-[7px] text-[13px] font-medium">
                  <LinkIcon data-icon="inline-start" className="size-3.5" strokeWidth={1.75} aria-hidden="true" />
                  Connect tenant
                </Button>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <IntegrationCard
                    icon={Mail}
                    title="Outlook mail"
                    description="Threaded into Conversations inbox."
                    scopes="Scopes: Mail.Read, Mail.Send"
                  />
                  <IntegrationCard
                    icon={Calendar}
                    title="Calendar two-way"
                    description="Booking page writes back to your calendar."
                    scopes="Scopes: Calendars.ReadWrite"
                  />
                  <IntegrationCard
                    icon={Folder}
                    title="SharePoint drive"
                    description="Project files & deliverables live in SharePoint."
                    scopes="Scopes: Files.ReadWrite.All"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div>
                  <div className="text-[14px] font-semibold text-foreground">Workspaces</div>
                  <div className="text-[12px] text-secondary">
                    You can run multiple workspaces — one per design firm or business unit.
                  </div>
                </div>
                <Button
                  variant="secondary"
                  className="h-auto gap-1.5 rounded-md px-3.5 py-[7px] text-[13px] font-medium"
                >
                  <Plus data-icon="inline-start" className="size-3.5" strokeWidth={1.75} aria-hidden="true" />
                  New workspace
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                <div className="flex items-center gap-3 border-b border-border-subtle px-5 py-4">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-foreground text-[12px] font-bold text-background">
                    HQ
                  </div>
                  <div className="flex-1">
                    <div className="text-[13px] font-semibold text-foreground">DesignersMeet HQ</div>
                    <div className="text-[12px] text-secondary">12 members · Bengaluru · created today</div>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-success-tint px-2 py-0.5 text-[11px] font-medium leading-[18px] tracking-[0.01em] text-success before:size-1.5 before:rounded-full before:bg-current before:content-['']">
                    Active
                  </span>
                  <Button variant="ghost" className="h-auto px-2.5 py-1.5 text-[13px] font-medium text-secondary hover:bg-hover hover:text-foreground">
                    Manage
                  </Button>
                </div>
                <div className="bg-subtle/40 px-5 py-8 text-center">
                  <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full border border-border bg-background text-muted">
                    <Building2 className="size-5" strokeWidth={1.75} aria-hidden="true" />
                  </div>
                  <div className="text-[13px] font-medium text-secondary">No additional workspaces yet</div>
                  <div className="mt-1 text-[12px] text-secondary">
                    When you add a second design firm or studio, it'll appear here.
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
