/* Generated from brief/mockups/05-contact-detail.html via Codex fidelity pass 2026-05-19. Do not hand-edit. */

import type { MouseEventHandler, ReactNode } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Archive,
  ArrowLeft,
  BarChart3,
  Bell,
  Building,
  Calendar,
  ChevronDown,
  ChevronRight,
  ChevronsUpDown,
  CircleHelp,
  ClipboardList,
  Download,
  File as FileIcon,
  FileText,
  GitBranch,
  HardHat,
  Layers,
  LayoutDashboard,
  LayoutGrid,
  Mail,
  MapPin,
  MessagesSquare,
  MoreHorizontal,
  PanelLeftClose,
  Pencil,
  Phone,
  Plus,
  Presentation,
  Search,
  Settings,
  StickyNote,
  Users,
  UsersRound,
  Zap,
  type LucideIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useItem, useList, useUpdate } from "../hooks/useResource.js";
import { useUIStore } from "../stores/uiStore.js";

type NavItem = {
  label: string;
  icon: LucideIcon;
  active?: boolean;
};

type TimelineItem = {
  icon: LucideIcon;
  kind: string;
  time: string;
  title: string;
  body?: string;
};

type Attachment = {
  icon: LucideIcon;
  name: string;
  meta: string;
};

const iconClass = "size-4 shrink-0";

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

const timelineItems: TimelineItem[] = [
  {
    icon: Mail,
    kind: "Email · Inbound",
    time: "Yesterday at 4:21 PM",
    title: "RE: Lumen concept board v2",
    body: "Looks gorgeous. Two small tweaks — the brass detail above the bar and the cane chair fabric. Otherwise approved!",
  },
  {
    icon: Phone,
    kind: "Call · 18 min",
    time: "Yesterday at 3:30 PM",
    title: "Discussion about concept board",
    body: "Walked through tweaks. Confirmed Pune install timeline still holds.",
  },
  {
    icon: FileIcon,
    kind: "File uploaded",
    time: "May 16 at 10:02 AM",
    title: "Aurora Studio shared concept board v2.pdf",
  },
  {
    icon: StickyNote,
    kind: "Internal note · Manish",
    time: "May 15 at 7:42 PM",
    title: "Priya mentioned a second outlet in Pune — flag for cross-sell after this project closes.",
  },
  {
    icon: Calendar,
    kind: "Meeting · 60 min",
    time: "May 12 at 11:00 AM",
    title: "Site walk-through · HSR Penthouse",
    body: "Recorded in Teams.",
  },
];

const upcomingItems = [
  {
    time: "Today, 11:00 AM",
    title: "Site walk-through",
    detail: "HSR Penthouse · 1h",
  },
  {
    time: "Wed, May 20",
    title: "Concept board approval",
    detail: "Async — link sent",
  },
  {
    time: "Mon, Jun 2",
    title: "Material samples review",
    detail: "In-studio · 90 min",
  },
];

const attachments: Attachment[] = [
  { icon: Presentation, name: "Brief deck v2.pptx", meta: "Manish · Mar 14" },
  { icon: FileText, name: "Lumen — concept board v2.pdf", meta: "Aurora Studio · May 12" },
  { icon: Archive, name: "Site survey photos.zip", meta: "Rohit · Apr 8" },
];

function IconButton({
  title,
  children,
  className,
  onClick,
}: {
  title: string;
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
  dot,
  className,
}: {
  children: ReactNode;
  variant?: "neutral" | "success";
  dot?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium leading-[18px] tracking-[0.01em]",
        variant === "success" ? "bg-primary-tint text-primary" : "bg-border-subtle text-secondary",
        className,
      )}
    >
      {dot ? <span className="size-1.5 rounded-full bg-current" /> : null}
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

function Sidebar() {
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
              <div className="truncate text-[12px] font-semibold text-foreground">DesignersMeet HQ</div>
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
  );
}

function Topbar() {
  return (
    <header className="flex h-[52px] items-center gap-4 border-b border-border bg-background px-5">
      <nav className="flex items-center gap-2 text-[13px]">
        <span className="text-muted">Contacts</span>
        <ChevronRight className="size-4 text-disabled" aria-hidden="true" />
        <span className="text-muted">Clients</span>
        <ChevronRight className="size-4 text-disabled" aria-hidden="true" />
        <span className="font-medium text-foreground">Priya Raghavan</span>
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

function ContactProfileHeader() {
  const params = useParams();
  const cid = params.id ?? "ct1";
  const c = useItem("contacts", cid).data as any;
  const navigate = useNavigate();

  return (
    <div className="border-b border-border-subtle px-8 pb-4 pt-6">
      <div className="mb-3">
        <button
          type="button"
          onClick={() => navigate("/contacts")}
          className="flex items-center gap-1.5 text-[12px] text-secondary hover:text-foreground focus-visible:outline-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to Contacts
        </button>
      </div>
      <div className="flex items-start gap-4">
        <Avatar size="xl">PR</Avatar>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="font-display text-[24px] font-semibold tracking-tight text-foreground">
              {c?.name ?? "Priya Raghavan"}
            </h1>
            <Badge>{c?.type ?? "Client"}</Badge>
            <Badge variant="success" dot>
              {c?.status ?? "Active"}
            </Badge>
          </div>
          <div className="mt-1 text-[13px] text-muted">
            Founder · Lumen Café · Bengaluru · Owner: Anita M.
          </div>
          <div className="mt-3 flex items-center gap-4 text-[12px] text-secondary">
            <span className="flex items-center gap-1.5">
              <Mail className="size-4 text-muted" aria-hidden="true" /> {c?.email ?? "priya@lumencafe.in"}
            </span>
            <span className="flex items-center gap-1.5">
              <Phone className="size-4 text-muted" aria-hidden="true" /> {c?.phone ?? "+91 98450 12345"}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="size-4 text-muted" aria-hidden="true" /> HSR Layout
            </span>
            <span className="flex items-center gap-1.5">
              <Building className="size-4 text-muted" aria-hidden="true" /> Lumen Café Pvt. Ltd.
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={() => window.open(`tel:${c?.phone ?? ""}`, "_self")}
            className="h-auto gap-1.5 px-3.5 py-[7px] text-[13px] focus-visible:ring-foreground"
          >
            <Phone className={iconClass} aria-hidden="true" />
            Call
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => window.open(`mailto:${c?.email ?? ""}`, "_self")}
            className="h-auto gap-1.5 px-3.5 py-[7px] text-[13px] focus-visible:ring-foreground"
          >
            <Mail className={iconClass} aria-hidden="true" />
            Email
          </Button>
          <Button
            type="button"
            onClick={() => useUIStore.getState().openCreate("activities")}
            className="h-auto gap-1.5 border-primary bg-primary px-3.5 py-[7px] text-[13px] text-background hover:border-primary hover:bg-primary"
          >
            <Plus className={iconClass} aria-hidden="true" />
            Log activity
          </Button>
          <IconButton title="More actions" onClick={() => useUIStore.getState().openEdit("contacts", cid)}>
            <MoreHorizontal className={iconClass} aria-hidden="true" />
          </IconButton>
        </div>
      </div>

      <Tabs defaultValue="profile" className="mt-5">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="timeline">
            Timeline <Badge className="ml-1">42</Badge>
          </TabsTrigger>
          <TabsTrigger value="conversations">
            Conversations <Badge className="ml-1">7</Badge>
          </TabsTrigger>
          <TabsTrigger value="opportunities">
            Opportunities <Badge className="ml-1">2</Badge>
          </TabsTrigger>
          <TabsTrigger value="projects">
            Projects <Badge className="ml-1">1</Badge>
          </TabsTrigger>
          <TabsTrigger value="files">
            Files <Badge className="ml-1">14</Badge>
          </TabsTrigger>
          <TabsTrigger value="custom-fields">Custom fields</TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}

const propertyRows: Array<Array<{ label: string; value: ReactNode }>> = [
  [
    { label: "Lifecycle stage", value: <Badge>Customer</Badge> },
    { label: "Lead source", value: <span className="text-secondary">Referral · Designed by V.</span> },
  ],
  [
    { label: "First contact", value: <span className="text-secondary">Mar 4, 2026</span> },
    { label: "Last contact", value: <span className="text-secondary">May 16, 2026 (2 days ago)</span> },
  ],
  [
    { label: "Lifetime value", value: <span className="text-secondary">₹ 18.4 L</span> },
    { label: "Birthday", value: <span className="text-secondary">Aug 22</span> },
  ],
  [
    { label: "Tags", value: <span className="text-secondary">Hot lead · Café · F&B</span> },
    { label: "Preferred channel", value: <Badge variant="success">WhatsApp</Badge> },
  ],
];

function PropertiesCard() {
  const params = useParams();
  const cid = params.id ?? "ct1";

  return (
    <Card>
      <CardHeader>
        <div className="text-[13px] font-semibold text-foreground">Properties</div>
        <Button
          type="button"
          variant="ghost"
          onClick={() => useUIStore.getState().openEdit("contacts", cid)}
          className="h-auto gap-1.5 px-2.5 py-1.5 text-[12px] text-secondary hover:bg-hover hover:text-foreground focus-visible:ring-foreground"
        >
          <Pencil className={iconClass} aria-hidden="true" />
          Edit
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        {propertyRows.map((row, rowIndex) => (
          <div
            key={row.map((cell) => cell.label).join("-")}
            className={cn("grid grid-cols-2", rowIndex !== propertyRows.length - 1 && "border-b border-border-subtle")}
          >
            {row.map((cell) => (
              <div key={cell.label} className="border-r border-border-subtle px-5 py-3 last:border-r-0">
                <div className="mb-1 text-[11px] uppercase tracking-wider text-muted">{cell.label}</div>
                <div className="text-[13px]">{cell.value}</div>
              </div>
            ))}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function TimelineCard() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="text-[13px] font-semibold text-foreground">Recent timeline</div>
          <div className="flex items-center gap-1">
            <Badge>All</Badge>
            <Badge>Emails</Badge>
            <Badge>Notes</Badge>
            <Badge>Calls</Badge>
          </div>
        </div>
        <Button
          type="button"
          variant="ghost"
          onClick={() => {/* navigate to timeline tab */}}
          className="h-auto px-2.5 py-1.5 text-[12px] text-secondary hover:bg-hover hover:text-foreground focus-visible:ring-foreground"
        >
          Full timeline
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        {timelineItems.map((item, index) => {
          const Icon = item.icon;

          return (
            <div
              key={`${item.kind}-${item.time}`}
              className={cn(
                "flex gap-3 px-5 py-4",
                index !== timelineItems.length - 1 && "border-b border-border-subtle",
              )}
            >
              <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-border-subtle text-secondary">
                <Icon className={iconClass} aria-hidden="true" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-muted">
                  <span>{item.kind}</span>
                  <span>·</span>
                  <span>{item.time}</span>
                </div>
                <div className="mt-1 text-[13px] font-medium text-foreground">{item.title}</div>
                {item.body ? (
                  <div className="mt-1 text-[12.5px] leading-relaxed text-secondary">{item.body}</div>
                ) : null}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

function StatusPill({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-[5px] rounded-full border border-transparent bg-border-subtle px-2 py-[3px] text-[11px] font-medium text-secondary before:size-1.5 before:rounded-full before:bg-current before:content-['']">
      {children}
    </span>
  );
}

function ActiveProjectCard() {
  const navigate = useNavigate();

  return (
    <Card>
      <CardHeader>
        <div className="text-[13px] font-semibold text-foreground">Active project</div>
      </CardHeader>
      <CardContent>
        <div className="text-[14px] font-semibold text-foreground">Brand Refresh — Lumen Café</div>
        <div className="mt-0.5 text-[12px] text-muted">Started Mar 12 · Target Jun 30</div>
        <div className="mt-3">
          <div className="mb-1 flex items-center justify-between text-[11px] text-muted">
            <span>Design phase</span>
            <span>62%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-border-subtle">
            <div className="h-full w-[62%] rounded-full bg-foreground" />
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <StatusPill>Design</StatusPill>
          <Button
            type="button"
            variant="ghost"
            onClick={() => navigate("/projects")}
            className="h-auto px-2.5 py-1.5 text-[12px] text-secondary hover:bg-hover hover:text-foreground focus-visible:ring-foreground"
          >
            Open project →
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function UpcomingCard() {
  return (
    <Card>
      <CardHeader>
        <div className="text-[13px] font-semibold text-foreground">Upcoming</div>
      </CardHeader>
      <CardContent className="p-0">
        {upcomingItems.map((item, index) => (
          <div
            key={`${item.time}-${item.title}`}
            className={cn("px-4 py-3", index !== upcomingItems.length - 1 && "border-b border-border-subtle")}
          >
            <div className="text-[12px] text-muted">{item.time}</div>
            <div className="mt-0.5 text-[13px] font-medium text-foreground">{item.title}</div>
            <div className="mt-0.5 text-[11px] text-muted">{item.detail}</div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function AttachmentsCard() {
  return (
    <Card>
      <CardHeader>
        <div className="text-[13px] font-semibold text-foreground">Attachments</div>
      </CardHeader>
      <CardContent className="p-0">
        {attachments.map((attachment, index) => {
          const Icon = attachment.icon;

          return (
            <div
              key={attachment.name}
              className={cn(
                "flex items-center gap-3 px-4 py-2.5 hover:bg-hover",
                index !== attachments.length - 1 && "border-b border-border-subtle",
              )}
            >
              <div className="flex size-8 items-center justify-center rounded-md bg-border-subtle text-secondary">
                <Icon className={iconClass} aria-hidden="true" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-[12.5px] font-medium text-foreground">{attachment.name}</div>
                <div className="truncate text-[11px] text-muted">{attachment.meta}</div>
              </div>
              <IconButton title={`Download ${attachment.name}`}>
                <Download className={iconClass} aria-hidden="true" />
              </IconButton>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

export default function ContactDetail() {
  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground antialiased">
      <Sidebar />

      <div cla