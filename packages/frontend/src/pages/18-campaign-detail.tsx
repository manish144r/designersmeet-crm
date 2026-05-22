/* BRIEF-27: Campaign detail — recipient list + send-now control. */

import { useNavigate, useParams } from "react-router-dom";
import { type ReactNode } from "react";
import {
  ArrowLeft,
  BarChart3,
  Bell,
  Calendar,
  ChevronDown,
  ChevronRight,
  ChevronsUpDown,
  CircleHelp,
  ClipboardList,
  GitBranch,
  HardHat,
  Layers,
  LayoutDashboard,
  LayoutGrid,
  Mail,
  Megaphone,
  MessagesSquare,
  MoreHorizontal,
  PanelLeftClose,
  Send,
  Settings,
  Users,
  UsersRound,
  Zap,
  type LucideIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useItem, useList, useUpdate } from "../hooks/useResource.js";

type NavItem = { label: string; icon: LucideIcon; active?: boolean };

const workspaceNavItems: NavItem[] = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "Contacts", icon: Users },
  { label: "Vendors", icon: HardHat },
  { label: "Pipelines", icon: GitBranch },
  { label: "Projects", icon: Layers },
  { label: "Calendar", icon: Calendar },
  { label: "Conversations", icon: MessagesSquare },
  { label: "Forms", icon: ClipboardList },
  { label: "Workflows", icon: Zap },
  { label: "Campaigns", icon: Megaphone, active: true },
  { label: "Reports", icon: BarChart3 },
  { label: "Settings", icon: Settings },
];

const surfaceNavItems: NavItem[] = [
  { label: "Outlook add-in", icon: Mail },
  { label: "Teams app", icon: UsersRound },
  { label: "M365 launcher", icon: LayoutGrid },
];

const iconClass = "size-4 shrink-0";

type Campaign = {
  id: string;
  name: string;
  subject: string;
  body: string;
  from_address?: string;
  status: "draft" | "scheduled" | "active" | "paused" | "completed";
  target_tag?: string;
  scheduled_at?: string | null;
  sent_count?: number;
  open_rate?: number;
  click_rate?: number;
};

type Recipient = {
  id: string;
  campaign_id: string;
  contact_id: string;
  email: string;
  status: "queued" | "sent" | "opened" | "clicked" | "bounced" | "failed";
  sent_at: string | null;
  opened_at: string | null;
  clicked_at: string | null;
};

const recipientStatusColors: Record<Recipient["status"], string> = {
  queued: "bg-border-subtle text-secondary",
  sent: "bg-info-tint text-info",
  opened: "bg-success-tint text-success",
  clicked: "bg-primary-tint text-primary",
  bounced: "bg-danger-tint text-danger",
  failed: "bg-danger-tint text-danger",
};

function IconButton({ title, children, className, onClick }: { title?: string; children: ReactNode; className?: string; onClick?: () => void }) {
  return (
    <Button type="button" variant="ghost" size="icon" title={title} aria-label={title} onClick={onClick} className={cn("size-[30px] rounded-md p-0 text-secondary hover:bg-hover hover:text-foreground focus-visible:ring-foreground", className)}>
      {children}
    </Button>
  );
}

function Avatar({ children, size = "default", className }: { children: ReactNode; size?: "default" | "sm" | "lg"; className?: string }) {
  return (
    <div className={cn("inline-flex shrink-0 items-center justify-center rounded-full border border-background bg-border-subtle font-semibold uppercase text-secondary", size === "sm" && "size-[22px] text-[10px]", size === "default" && "size-7 text-[12px]", size === "lg" && "size-10 text-[14px]", className)}>
      {children}
    </div>
  );
}

function SidebarNavItem({ item, onClick }: { item: NavItem; onClick: () => void }) {
  const Icon = item.icon;
  return (
    <button type="button" onClick={onClick} className={cn("flex w-full cursor-pointer select-none items-center gap-2.5 rounded-md px-2.5 py-[7px] text-[13px] font-medium transition-colors", item.active ? "bg-primary-tint text-primary" : "text-secondary hover:bg-border-subtle hover:text-foreground")}>
      <Icon className={cn("size-4 shrink-0", item.active ? "text-primary" : "text-muted")} />
      <span>{item.label}</span>
    </button>
  );
}

function RecipientStatusBadge({ status }: { status: Recipient["status"] }) {
  return <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.04em]", recipientStatusColors[status])}>{status}</span>;
}

export default function CampaignDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: campaign } = useItem<Campaign>("campaigns", id);
  const { data: recipientsResp } = useList<Recipient>("campaign-recipients", id ? { campaign_id: id } : {});
  const updateCampaign = useUpdate("campaigns");
  const updateRecipient = useUpdate("campaign-recipients");
  const c = (campaign as any)?.data ?? campaign;
  const allRecipients = recipientsResp?.data ?? [];
  const recipients = allRecipients.filter((r: Recipient) => r.campaign_id === id);

  function sendNow() {
    if (!c || !id) return;
    const nowIso = new Date().toISOString();
    updateCampaign.mutate({ id, patch: { status: "active", sent_count: recipients.length } });
    recipients.forEach((r: Recipient) => {
      updateRecipient.mutate({ id: r.id, patch: { status: "sent", sent_at: nowIso } });
    });
  }

  if (!c) {
    return <div className="flex h-screen items-center justify-center text-sm text-muted">Loading campaign…</div>;
  }

  const stats = {
    total: recipients.length,
    sent: recipients.filter((r: Recipient) => ["sent", "opened", "clicked"].includes(r.status)).length,
    opened: recipients.filter((r: Recipient) => ["opened", "clicked"].includes(r.status)).length,
    clicked: recipients.filter((r: Recipient) => r.status === "clicked").length,
    bounced: recipients.filter((r: Recipient) => r.status === "bounced").length,
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground antialiased">
      <aside className="flex w-[232px] shrink-0 flex-col border-r border-border bg-sidebar">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="inline-flex items-center gap-2 text-[14px] font-semibold tracking-normal text-foreground">
            <span className="inline-flex size-[22px] items-center justify-center rounded-[5px] border border-border bg-background text-[12px] font-bold text-foreground">D</span>
            <span>DesignersMeet</span>
          </div>
          <IconButton title="Collapse sidebar"><PanelLeftClose className={iconClass} /></IconButton>
        </div>
        <div className="px-3 pt-3">
          <div className="flex items-center justify-between gap-2 rounded-lg border border-border bg-background p-2 shadow-card">
            <div className="flex min-w-0 items-center gap-2">
              <div className="flex size-6 shrink-0 items-center justify-center rounded-md border border-border bg-background text-[10px] font-bold text-foreground">HQ</div>
              <div className="min-w-0">
                <div className="truncate text-[12px] font-semibold text-foreground">DesignersMeet HQ</div>
                <div className="truncate text-[10px] text-muted">Bengaluru workspace</div>
              </div>
            </div>
            <ChevronsUpDown className="size-4 shrink-0 text-muted" />
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto px-2 pt-3">
          <div className="mb-1.5 mt-3.5 px-2.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-muted">Workspace</div>
          <div className="space-y-0.5">
            {workspaceNavItems.map((item) => (
              <SidebarNavItem key={item.label} item={item} onClick={() => { const r = ({ Dashboard: "/dashboard", Contacts: "/contacts", Vendors: "/vendors", Pipelines: "/pipelines", Projects: "/projects", Calendar: "/calendar", Conversations: "/conversations", Forms: "/forms", Workflows: "/workflows", Campaigns: "/campaigns", Reports: "/pipelines", Settings: "/settings" } as Record<string, string>)[item.label]; if (r) navigate(r); }} />
            ))}
          </div>
          <div className="mb-1.5 mt-3.5 px-2.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-muted">Surfaces</div>
          <div className="space-y-0.5">
            {surfaceNavItems.map((item) => (
              <SidebarNavItem key={item.label} item={item} onClick={() => { const urls: Record<string, string> = { "Outlook add-in": "https://outlook.office.com", "Teams app": "https://teams.microsoft.com", "M365 launcher": "https://microsoft365.com/apps" }; const u = urls[item.label]; if (u) window.open(u, "_blank", "noopener,noreferrer"); }} />
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
            <IconButton title="Menu" className="ml-auto"><MoreHorizontal className={iconClass} /></IconButton>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex h-[52px] items-center gap-4 border-b border-border bg-background px-5">
          <Button type="button" variant="ghost" onClick={() => navigate("/campaigns")} className="h-auto gap-1.5 px-2 py-1 text-[12px] text-secondary hover:bg-hover">
            <ArrowLeft className={iconClass} /> Back
          </Button>
          <nav className="flex items-center gap-2 text-[13px]">
            <span className="text-muted">Marketing</span>
            <ChevronRight className="size-4 shrink-0 text-disabled" />
            <button onClick={() => navigate("/campaigns")} className="text-muted hover:text-foreground">Campaigns</button>
            <ChevronRight className="size-4 shrink-0 text-disabled" />
            <span className="font-medium text-foreground">{c.name}</span>
          </nav>
          <div className="ml-auto flex items-center gap-1">
            <IconButton title="Help"><CircleHelp className={iconClass} /></IconButton>
            <IconButton title="Notifications" className="relative">
              <Bell className={iconClass} />
              <span className="absolute right-1 top-1 size-1.5 rounded-full bg-foreground" />
            </IconButton>
            <div className="mx-1 h-6 w-px bg-border" />
            <Button type="button" variant="ghost" className="h-auto gap-2 rounded-md px-2 py-1 text-secondary hover:bg-hover">
              <Avatar size="sm">MS</Avatar>
              <ChevronDown className="size-4 shrink-0 text-muted" />
            </Button>
          </div>
        </header>

        <main className="flex-1 overflow-auto bg-background px-6 py-5">
          <div className="mx-auto max-w-[1200px] space-y-4">
            <Card className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.06em] text-muted">{c.status}</div>
                  <h1 className="mt-1 text-[20px] font-semibold text-foreground">{c.name}</h1>
                  <div className="mt-2 text-[13px] text-secondary"><span className="text-muted">Subject:</span> {c.subject}</div>
                  <div className="mt-1 text-[12px] text-muted"><span>From: {c.from_address}</span>{c.target_tag ? <span> · Tag: {c.target_tag}</span> : null}</div>
                </div>
                {c.status === "draft" || c.status === "scheduled" ? (
                  <Button type="button" onClick={sendNow} className="h-auto gap-1.5 bg-primary px-3.5 py-[7px] text-[13px] text-background hover:bg-primary-hover">
                    <Send className={iconClass} /> Send now
                  </Button>
                ) : null}
              </div>

              <div className="mt-5 grid grid-cols-5 gap-4 border-t border-border-subtle pt-4">
                {[
                  { label: "Recipients", value: stats.total },
                  { label: "Sent", value: stats.sent },
                  { label: "Opened", value: stats.opened },
                  { label: "Clicked", value: stats.clicked },
                  { label: "Bounced", value: stats.bounced },
                ].map((s) => (
                  <div key={s.label}>
                    <div className="text-[11px] font-medium uppercase tracking-[0.06em] text-muted">{s.label}</div>
                    <div className="mt-1 text-[20px] font-semibold text-foreground">{s.value}</div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-5">
              <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.06em] text-muted">Body preview</div>
              <pre className="whitespace-pre-wrap rounded-md border border-border-subtle bg-subtle/30 p-3 text-[13px] leading-relaxed text-secondary">{c.body}</pre>
            </Card>

            <Card className="overflow-hidden">
              <div className="border-b border-border-subtle px-4 py-3 text-[13px] font-semibold text-foreground">Recipients ({recipients.length})</div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-subtle/40 text-[11px] font-medium uppercase tracking-[0.06em] text-muted">
                    <tr className="border-b border-border-subtle">
                      <th className="px-4 py-2 text-left">Email</th>
                      <th className="px-4 py-2 text-left">Status</th>
                      <th className="px-4 py-2 text-left">Sent</th>
                      <th className="px-4 py-2 text-left">Opened</th>
                      <th className="px-4 py-2 text-left">Clicked</th>
                    </tr>
                  </thead>
                  <tbody className="text-[13px]">
                    {recipients.length === 0 ? (
                      <tr><td colSpan={5} className="px-4 py-10 text-center text-muted">No recipients yet.</td></tr>
                    ) : recipients.map((r: Recipient) => (
                      <tr key={r.id} className="border-b border-border-subtle hover:bg-hover">
                        <td className="px-4 py-2.5 font-medium text-foreground">{r.email}</td>
                        <td className="px-4 py-2.5"><RecipientStatusBadge status={r.status} /></td>
                        <td className="px-4 py-2.5 text-secondary">{r.sent_at ? new Date(r.sent_at).toLocaleString() : "—"}</td>
                        <td className="px-4 py-2.5 text-secondary">{r.opened_at ? new Date(r.opened_at).toLocaleString() : "—"}</td>
                        <td className="px-4 py-2.5 text-secondary">{r.clicked_at ? new Date(r.clicked_at).toLocaleString() : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
