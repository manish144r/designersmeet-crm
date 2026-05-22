/* Generated from brief/mockups/12-conversations.html via Codex fidelity pass 2026-05-19. Do not hand-edit. */

import { useNavigate } from "react-router-dom";
import { useState, type ReactNode, useEffect } from "react";
import {
  Archive,
  BarChart3,
  Bell,
  Calendar,
  ChevronDown,
  ChevronRight,
  ChevronsUpDown,
  CircleHelp,
  ClipboardList,
  FileText,
  GitBranch,
  HardHat,
  Image as ImageIcon,
  Layers,
  LayoutDashboard,
  LayoutGrid,
  Link as LinkIcon,
  Mail,
  MessagesSquare,
  MoreHorizontal,
  PanelLeftClose,
  Paperclip,
  Pencil,
  Phone,
  Search,
  Send,
  Settings,
  Sparkles,
  Tag,
  User,
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
import { useList, useCreate, useUpdate } from "../hooks/useResource.js";
import { useUIStore } from "../stores/uiStore.js";

type NavItem = {
  label: string;
  icon: LucideIcon;
  active?: boolean;
};

type Channel = "email" | "whatsapp" | "note";

type InboxItem = {
  id: string;
  initials: string;
  name: string;
  time: string;
  subject: string;
  preview: string;
  channel: Channel;
  active?: boolean;
  unread?: boolean;
  assigned_user_id?: string;
};

type ThreadMessage = {
  initials: string;
  sender: string;
  meta: string;
  body: string;
  tone?: "default" | "note";
};

const workspaceNavItems: NavItem[] = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "Contacts", icon: Users },
  { label: "Vendors", icon: HardHat },
  { label: "Pipelines", icon: GitBranch },
  { label: "Projects", icon: Layers },
  { label: "Calendar", icon: Calendar },
  { label: "Conversations", icon: MessagesSquare, active: true },
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


const iconClass = "size-4 shrink-0";

const channelBadgeClasses: Record<Channel, string> = {
  email: "bg-border-subtle text-secondary",
  whatsapp: "bg-border-subtle text-secondary",
  note: "bg-warning-tint text-warning",
};

const composerDefaultValue = `Priya — v3 looks great. Going to share with the bar-fit vendors today and lock procurement Friday.

Best,
Manish`;

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

function Avatar({
  children,
  size = "default",
  className,
}: {
  children: ReactNode;
  size?: "default" | "sm" | "lg";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full border border-background bg-border-subtle font-semibold uppercase text-secondary",
        size === "sm" && "size-[22px] text-[10px]",
        size === "default" && "size-7 text-[12px]",
        size === "lg" && "size-10 text-[14px]",
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

function FilterBadge({
  children,
  count,
  active,
  onClick,
}: {
  children: ReactNode;
  count: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium leading-[18px] tracking-[0.01em] focus-visible:outline-foreground",
        active ? "bg-primary-tint text-primary" : "bg-border-subtle text-secondary",
      )}
    >
      {children}
      <span className={cn("ml-1", active ? "text-primary" : "text-muted")}>{count}</span>
    </button>
  );
}

function ChannelBadge({ channel, children }: { channel: Channel; children: ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-1.5 py-px text-[10px] font-medium leading-4",
        channelBadgeClasses[channel],
      )}
    >
      {children}
    </span>
  );
}

function InboxRow({ item, onClick }: { item: InboxItem; onClick?: () => void }) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "cursor-pointer border-b border-border-subtle border-l-2 px-4 py-3 hover:bg-hover",
        item.active ? "border-l-foreground bg-background" : "border-l-transparent",
      )}
    >
      <div className="flex items-start gap-2.5">
        <Avatar>{item.initials}</Avatar>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <span
              className={cn(
                "truncate text-[13px] text-foreground",
                item.unread ? "font-semibold" : "font-medium",
              )}
            >
              {item.name}
            </span>
            <span className="shrink-0 text-[10px] text-muted">{item.time}</span>
          </div>
          <div
            className={cn(
              "mt-0.5 truncate text-[12px] text-secondary",
              item.unread ? "font-semibold" : "font-medium",
            )}
          >
            {item.subject}
          </div>
          <div className="mt-0.5 truncate text-[11.5px] text-muted">{item.preview}</div>
          <div className="mt-1.5 flex items-center gap-2">
            <ChannelBadge channel={item.channel}>{item.channel}</ChannelBadge>
            {item.unread ? <span className="size-2 shrink-0 rounded-full bg-foreground" /> : null}
          </div>
        </div>
      </div>
    </div>
  );
}

function ThreadMessageItem({ message }: { message: ThreadMessage }) {
  return (
    <div className="flex gap-3">
      <Avatar>{message.initials}</Avatar>
      <div className="min-w-0 flex-1">
        <div className="text-[12px] text-muted">
          <span className="font-medium text-foreground">{message.sender}</span> · {message.meta}
        </div>
        <div
          className={cn(
            "mt-1.5 whitespace-pre-line rounded-md border border-border border-l-2 bg-background p-3 text-[13px] leading-relaxed text-secondary",
            message.tone === "note"
              ? "border-l-warning bg-warning-tint/40"
              : "border-l-border-strong",
          )}
        >
          {message.body}
        </div>
      </div>
    </div>
  );
}

export default function Conversations() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const navigate = useNavigate();
  const [selectedConvId, setSelectedConvId] = useState("cv1");
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [replyBody, setReplyBody] = useState("");
  const { data } = useList<InboxItem>("conversations");
  const [activeFilter, setActiveFilter] = useState<"all" | "unread" | "assigned">("all");
  const inboxItems = data?.data ?? [];
  const filteredInboxItems = inboxItems.filter((item: InboxItem) => {
    if (activeFilter === "unread") return item.unread;
    if (activeFilter === "assigned") return item.assigned_user_id === "u1";
    return true;
  });
  const _m = useList<ThreadMessage & { conversation_id: string }>("messages").data?.data ?? [];
  const threadMessages = _m.filter((x: any) => x.conversation_id === selectedConvId);
  const createMessage = useCreate("messages");
  const updateConversation = useUpdate("conversations");

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
          <div className="space-y-0.5">
            {workspaceNavItems.map((item) => (
              <SidebarNavItem key={item.label} item={item} onClick={() => { const r = ({Dashboard:"/dashboard",Contacts:"/contacts",Vendors:"/vendors",Pipelines:"/pipelines",Projects:"/projects",Calendar:"/calendar",Conversations:"/conversations",Forms:"/forms",Workflows:"/workflows",Reports:"/reports",Settings:"/settings"} as Record<string,string>)[item.label]; if (r) navigate(r); }} />
            ))}
          </div>

          <div className="mb-1.5 mt-3.5 px-2.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-muted">
            Surfaces
          </div>
          <div className="space-y-0.5">
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
            <span className="text-muted">Conversations</span>
            <ChevronRight className="size-4 shrink-0 text-disabled" aria-hidden="true" />
            <span className="font-medium text-foreground">Unified inbox</span>
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
            <aside className="flex w-[340px] flex-col border-r border-border">
              <div className="border-b border-border px-4 py-3">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-[15px] font-semibold text-foreground">Inbox</h2>
                  <Button onClick={() => useUIStore.getState().openCreate("conversations")} className="h-auto gap-1.5 bg-primary px-2.5 py-1 text-[12px] text-background hover:bg-primary-hover">
                    <Pencil className={iconClass} aria-hidden="true" />
                    Compose
                  </Button>
                </div>

                <SearchField placeholder="Search messages…" />

                <div className="mt-3 flex items-center gap-1 text-[11px]">
                  <FilterBadge active={activeFilter === "all"} count="137" onClick={() => setActiveFilter("all")}>
                    All
                  </FilterBadge>
                  <FilterBadge count="12">Unread</FilterBadge>
                  <FilterBadge count="8">Assigned to me</FilterBadge>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto">
                {filteredInboxItems.map((item: InboxItem) => (
                  <InboxRow key={`${item.name}-${item.subject}`} item={item} onClick={() => setSelectedConvId(item.id)} />
                ))}
              </div>
            </aside>

            <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
              <div className="flex items-center gap-3 border-b border-border px-6 py-3">
                <div className="flex-1">
                  <div className="text-[15px] font-semibold text-foreground">
                    RE: Lumen concept board v2
                  </div>
                  <div className="mt-0.5 flex items-center gap-2 text-[12px] text-muted">
                    <span>3 participants</span>
                    <span>·</span>
                    <ChannelBadge channel="email">email</ChannelBadge>
                    <ChannelBadge channel="note">internal note</ChannelBadge>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => updateConversation.mutate({ id: selectedConvId, patch: { assigned_user_id: "u1" } })}
                  className="h-auto gap-1.5 px-3.5 py-[7px] text-[13px] focus-visible:ring-foreground"
                >
                  <UserPlus className={iconClass} aria-hidden="true" />
                  Assign
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  className="h-auto gap-1.5 px-3.5 py-[7px] text-[13px] focus-visible:ring-foreground"
                >
                  <Tag className={iconClass} aria-hidden="true" />
                  Label
                </Button>
                <IconButton title="Archive" onClick={() => updateConversation.mutate({ id: selectedConvId, patch: { status: "closed" } })}>
                  <Archive className={iconClass} aria-hidden="true" />
                </IconButton>
                <IconButton title="More">
                  <MoreHorizontal className={iconClass} aria-hidden="true" />
                </IconButton>
              </div>

              <div className="flex-1 space-y-4 overflow-auto bg-subtle/30 px-6 py-5">
                {threadMessages.map((message: ThreadMessage) => (
                  <ThreadMessageItem key={`${message.sender}-${message.meta}`} message={message} />
                ))}
              </div>

              <div className="border-t border-border bg-background">
                <div className="flex items-center gap-3 border-b border-border-subtle px-6 py-2 text-[12px]">
                  <span className="text-muted">Reply via</span>
                  <div className="flex items-center rounded-md bg-border-subtle p-0.5">
                    <button
                      type="button"
                      className="rounded bg-background px-2.5 py-1 font-medium text-foreground shadow-sm"
                    >
                      📧 Email
                    </button>
                    <button type="button" className="px-2.5 py-1 text-muted">
                      💬 WhatsApp
                    </button>
                    <button type="button" className="px-2.5 py-1 text-muted">
                      🟡 Internal note
                    </button>
                  </div>
                  <span className="ml-auto text-muted">
                    Sending as{" "}
                    <span className="font-medium text-secondary">manish@designersmeet.com</span>{" "}
                    via Microsoft Graph
                  </span>
                </div>

                <div className="px-6 py-3">
                  <textarea
                    className="w-full resize-none bg-background text-[13.5px] text-foreground placeholder:text-muted focus:outline-none"
                    rows={4}
                    placeholder="Type your reply… (⌘+Enter to send)"
                    value={replyBody}
                    onChange={(e) => setReplyBody(e.target.value)}
                    onKeyDown={(e) => {
                      if ((e.metaKey || e.ctrlKey) && e.key === "Enter" && replyBody.trim()) {
                        createMessage.mutate({ conversation_id: selectedConvId, direction: "outbound", body: replyBody.trim() });
                        setReplyBody("");
                      }
                    }}
                  />
                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <IconButton title="Attach">
                        <Paperclip className={iconClass} aria-hidden="true" />
                      </IconButton>
                      <IconButton title="Link">
                        <LinkIcon className={iconClass} aria-hidden="true" />
                      </IconButton>
                      <IconButton title="Assist">
                        <Sparkles className={iconClass} aria-hidden="true" />
                      </IconButton>
                      <IconButton title="Image">
                        <ImageIcon className={iconClass} aria-hidden="true" />
                      </IconButton>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="secondary"
                        className="h-auto px-3.5 py-[7px] text-[12px] focus-visible:ring-foreground"
                      >
                        Save draft
                      </Button>
                      <Button onClick={() => { if (replyBody.trim()) { createMessage.mutate({ conversation_id: selectedConvId, direction: "outbound", body: replyBody.trim() }); setReplyBody(""); } }} className="h-auto gap-1.5 bg-primary px-3.5 py-[7px] text-[13px] text-background hover:bg-primary-hover">
                        <Send className={iconClass} aria-hidden="true" />
                        Send
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <aside className="w-[300px] overflow-auto border-l border-border bg-background">
              <div className="border-b border-border bg-background p-5">
                <div className="flex items-center gap-3">
                  <Avatar size="lg">PR</Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[14px] font-semibold text-foreground">
                      Priya Raghavan
                    </div>
                    <div className="truncate text-[11px] text-muted">Founder · Lumen Café</div>
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    className="h-auto flex-1 justify-center gap-1.5 px-2.5 py-1.5 text-[11px] text-secondary hover:bg-hover focus-visible:ring-foreground"
                  >
                    <User className={iconClass} aria-hidden="true" />
                    Profile
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="h-auto flex-1 justify-center gap-1.5 px-2.5 py-1.5 text-[11px] text-secondary hover:bg-hover focus-visible:ring-foreground"
                  >
                    <Phone className={iconClass} aria-hidden="true" />
                    Call
                  </Button>
                </div>
              </div>

              <div className="p-5">
                <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.06em] text-muted">
                  Active project
                </div>
                <Card className="mb-4 p-3">
                  <div className="text-[13px] font-semibold text-foreground">
                    Brand Refresh — Lumen Café
                  </div>
                  <div className="mt-1 text-[11px] text-muted">Design phase · 62%</div>
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-border-subtle">
                    <div className="h-full w-[62%] rounded-full bg-foreground" />
                  </div>
                </Card>

                <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.06em] text-muted">
                  Open invoices
                </div>
                <Card className="mb-4 p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-[13px] font-semibold text-foreground">
                        INV-2026-0142
                      </div>
                      <div className="text-[11px] text-muted">Due May 28</div>
                    </div>
                    <div className="text-[13px] font-semibold text-foreground">₹ 4.6 L</div>
                  </div>
                </Card>

                <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.06em] text-muted">
                  Recent deliverables
                </div>
                <div className="mb-4 space-y-1.5">
                  <div className="flex items-center gap-2 text-[12px] text-secondary">
                    <FileText className="size-4 shrink-0 text-muted" aria-hidden="true" />
                    Concept board v3
                  </div>
                  <div className="flex items-center gap-2 text-[12px] text-secondary">
                    <FileText className="size-4 shrink-0 text-muted" aria-hidden="true" />
                    Material palette v2
                  </div>
                  <div className="flex items-center gap-2 text-[12px] text-secondary">
                    <FileText className="size-4 shrink-0 text-muted" aria-hidden="true" />
                    Brand mark refresh
                  </div>
                </div>

                <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.06em] text-muted">
                  Upcoming
                </div>
                <div className="text-[12px] text-secondary">
                  <div className="font-medium text-secondary">Today 11:00 AM</div>
                  <div className="text-muted">Site walk-through · HSR Penthouse</div>
                </div>
              </div>
            </aside>
          </div>
        </main>
      </div>
    </div>
  );
}
