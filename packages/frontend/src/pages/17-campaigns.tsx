/* BRIEF-27: Email campaigns list page — GHL-style sequences. */

import { useNavigate } from "react-router-dom";
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
  Plus,
  Search,
  Send,
  Settings,
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

type NavItem = { label: string; icon: LucideIcon; active?: boolean };

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
  created_at?: string;
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

const statusColors: Record<Campaign["status"], string> = {
  draft: "bg-border-subtle text-secondary",
  scheduled: "bg-info-tint text-info",
  active: "bg-success-tint text-success",
  paused: "bg-warning-tint text-warning",
  completed: "bg-primary-tint text-primary",
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
      <Icon className={cn("size-4 shrink-0", item.active ? "text-primary" : "text-muted")} aria-hidden="true" />
      <span>{item.label}</span>
    </button>
  );
}

function StatusBadge({ status }: { status: Campaign["status"] }) {
  return <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.04em]", statusColors[status])}>{status}</span>;
}

function NewCampaignModal({ onClose, onCreate }: { onClose: () => void; onCreate: (data: Partial<Campaign>) => void }) {
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [fromAddress, setFromAddress] = useState("hello@designersmeet.com");
  const [targetTag, setTargetTag] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 p-4" onClick={onClose}>
      <div className="w-full max-w-[560px] rounded-lg border border-border bg-background p-6 shadow-card" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-[16px] font-semibold text-foreground">New campaign</h2>
        <p className="mt-1 text-[12px] text-muted">Draft, schedule, or send to a tagged segment.</p>
        <div className="mt-4 space-y-3">
          <div>
            <label className="block text-[11px] font-medium uppercase tracking-[0.06em] text-muted">Name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="May Newsletter" className="mt-1" />
          </div>
          <div>
            <label className="block text-[11px] font-medium uppercase tracking-[0.06em] text-muted">Subject</label>
            <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject line" className="mt-1" />
          </div>
          <div>
            <label className="block text-[11px] font-medium uppercase tracking-[0.06em] text-muted">Body</label>
            <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={6} className="mt-1 w-full rounded-md border border-border-strong bg-background px-3 py-2 text-[13px] text-foreground placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-foreground" placeholder="Hey {{first_name}}, …" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium uppercase tracking-[0.06em] text-muted">From</label>
              <Input value={fromAddress} onChange={(e) => setFromAddress(e.target.value)} className="mt-1" />
            </div>
            <div>
              <label className="block text-[11px] font-medium uppercase tracking-[0.06em] text-muted">Target tag</label>
              <Input value={targetTag} onChange={(e) => setTargetTag(e.target.value)} placeholder="Client / VIP / Cold" className="mt-1" />
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-medium uppercase tracking-[0.06em] text-muted">Schedule (optional)</label>
            <Input type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} className="mt-1" />
          </div>
        </div>
        <div className="mt-5 flex items-center justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose} className="h-auto px-3.5 py-[7px] text-[12px]">Cancel</Button>
          <Button
            type="button"
            disabled={!name || !subject}
            onClick={() => {
              onCreate({
                name,
                subject,
                body,
                from_address: fromAddress,
                target_tag: targetTag,
                scheduled_at: scheduledAt ? new Date(scheduledAt).toISOString() : null,
                status: scheduledAt ? "scheduled" : "draft",
                sent_count: 0,
                open_rate: 0,
                click_rate: 0,
                created_at: new Date().toISOString(),
              });
              onClose();
            }}
            className="h-auto gap-1.5 bg-primary px-3.5 py-[7px] text-[13px] text-background hover:bg-primary-hover"
          >
            <Plus className={iconClass} />
            Create campaign
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function Campaigns() {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | Campaign["status"]>("all");
  const { data } = useList<Campaign>("campaigns");
  const allCampaigns = data?.data ?? [];
  const campaigns = allCampaigns.filter((c) => {
    if (statusFilter !== "all" && c.status !== statusFilter) return false;
    if (q && !c.name.toLowerCase().includes(q.toLowerCase()) && !c.subject.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });
  const createCampaign = useCreate("campaigns");
  const updateCampaign = useUpdate("campaigns");
  const updateRecipient = useUpdate("campaign-recipients");
  const { data: recipientsResp } = useList<{ id: string; campaign_id: string; status: string }>("campaign-recipients");
  const recipientsByCampaign = (recipientsResp?.data ?? []).reduce<Record<string, number>>((acc, r) => {
    acc[r.campaign_id] = (acc[r.campaign_id] ?? 0) + 1;
    return acc;
  }, {});

  function sendNow(campaign: Campaign) {
    const recipients = (recipientsResp?.data ?? []).filter((r) => r.campaign_id === campaign.id);
    const nowIso = new Date().toISOString();
    updateCampaign.mutate({ id: campaign.id, patch: { status: "active", sent_count: recipients.length } });
    recipients.forEach((r) => {
      updateRecipient.mutate({ id: r.id, patch: { status: "sent", sent_at: nowIso } });
    });
  }

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
          <nav className="flex items-center gap-2 text-[13px]">
            <span className="text-muted">Marketing</span>
            <ChevronRight className="size-4 shrink-0 text-disabled" />
            <span className="font-medium text-foreground">Campaigns</span>
          </nav>
          <div className="relative ml-auto mr-auto flex h-[34px] max-w-[480px] flex-1 items-center rounded-md border border-border-strong bg-background">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search campaigns…" className="h-full border-0 bg-transparent py-0 pl-8 text-[13px] shadow-none focus:border-transparent focus:ring-0" />
          </div>
          <div className="ml-auto flex items-center gap-1">
            <IconButton title="Help"><CircleHelp className={iconClass} /></IconButton>
            <IconButton title="Notifications" className="relative">
              <Bell className={iconClass} />
              <span className="absolute right-1 top-1 size-1.5 rounded-full bg-foreground" />
            </IconButton>
            <div className="mx-1 h-6 w-px bg-border" />
            <Button type="button" variant="ghost" className="h-auto gap-2 rounded-md px-2 py-1 text-secondary hover:bg-hover focus-visible:ring-foreground">
              <Avatar size="sm">MS</Avatar>
              <ChevronDown className="size-4 shrink-0 text-muted" />
            </Button>
          </div>
        </header>

        <main className="flex-1 overflow-auto bg-background px-6 py-5">
          <div className="mx-auto max-w-[1200px]">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h1 className="text-[18px] font-semibold text-foreground">Campaigns</h1>
                <p className="mt-1 text-[12px] text-muted">Send broadcast emails or scheduled sequences to tagged contacts.</p>
              </div>
              <Button onClick={() => setShowModal(true)} className="h-auto gap-1.5 bg-primary px-3.5 py-[7px] text-[13px] text-background hover:bg-primary-hover">
                <Plus className={iconClass} />
                New campaign
              </Button>
            </div>

            <div className="mb-3 flex items-center gap-1 text-[11px]">
              {(["all", "draft", "scheduled", "active", "paused", "completed"] as const).map((s) => (
                <button key={s} type="button" onClick={() => setStatusFilter(s)} className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-medium leading-[18px] tracking-[0.01em]", statusFilter === s ? "bg-primary-tint text-primary" : "bg-border-subtle text-secondary")}>
                  {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
                  <span className={cn("ml-1", statusFilter === s ? "text-primary" : "text-muted")}>{s === "all" ? allCampaigns.length : allCampaigns.filter((c) => c.status === s).length}</span>
                </button>
              ))}
            </div>

            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-subtle/40 text-[11px] font-medium uppercase tracking-[0.06em] text-muted">
                    <tr className="border-b border-border-subtle">
                      <th className="px-4 py-2 text-left">Name</th>
                      <th className="px-4 py-2 text-left">Subject</th>
                      <th className="px-4 py-2 text-left">Status</th>
                      <th className="px-4 py-2 text-left">Recipients</th>
                      <th className="px-4 py-2 text-left">Sent</th>
                      <th className="px-4 py-2 text-left">Open</th>
                      <th className="px-4 py-2 text-left">Click</th>
                      <th className="px-4 py-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="text-[13px]">
                    {campaigns.length === 0 ? (
                      <tr><td colSpan={8} className="px-4 py-10 text-center text-muted">No campaigns match this filter.</td></tr>
                    ) : campaigns.map((c) => (
                      <tr key={c.id} className="border-b border-border-subtle hover:bg-hover">
                        <td className="px-4 py-2.5">
                          <button onClick={() => navigate(`/campaigns/${c.id}`)} className="font-medium text-foreground hover:underline">{c.name}</button>
                          {c.target_tag ? <div className="mt-0.5 text-[11px] text-muted">→ {c.target_tag}</div> : null}
                        </td>
                        <td className="px-4 py-2.5 max-w-[280px] truncate text-secondary">{c.subject}</td>
                        <td className="px-4 py-2.5"><StatusBadge status={c.status} /></td>
                        <td className="px-4 py-2.5 text-secondary">{recipientsByCampaign[c.id] ?? 0}</td>
                        <td className="px-4 py-2.5 text-secondary">{c.sent_count ?? 0}</td>
                        <td className="px-4 py-2.5 text-secondary">{Math.round((c.open_rate ?? 0) * 100)}%</td>
                        <td className="px-4 py-2.5 text-secondary">{Math.round((c.click_rate ?? 0) * 100)}%</td>
                        <td className="px-4 py-2.5 text-right">
                          <div className="inline-flex items-center gap-1">
                            <Button type="button" variant="ghost" onClick={() => navigate(`/campaigns/${c.id}`)} className="h-auto px-2 py-1 text-[12px]">View</Button>
                            {c.status === "draft" || c.status === "scheduled" ? (
                              <Button type="button" onClick={() => sendNow(c)} className="h-auto gap-1.5 bg-primary px-2.5 py-1 text-[12px] text-background hover:bg-primary-hover">
                                <Send className="size-3.5" /> Send now
                              </Button>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </main>
      </div>

      {showModal ? (
        <NewCampaignModal
          onClose={() => setShowModal(false)}
          onCreate={(data) => createCampaign.mutate(data)}
        />
      ) : null}
    </div>
  );
}
