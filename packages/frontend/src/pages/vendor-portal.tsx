/* /vendor — Wave-A vendor-mode portal (2026-05-20).
 *
 * Read-only experience scoped to a single vendor (Aurora Studio / vn1 in the
 * demo seed). The admin nav items (Settings, Reports) are intentionally
 * absent — vendors only see surfaces that pertain to their own assignments.
 *
 * This is a NEW route — no locked baseline, so we are free to author DOM
 * from scratch using the same token-only Tailwind palette as the rest of
 * the app. Brand-lock guard (raw-color check + VR on the 16 locked pages)
 * is unaffected because this file is new.
 */

import { useReducer, useEffect, useState, type ReactNode } from "react";
import {
  ArrowLeft,
  BarChart3,
  Bell,
  Calendar,
  CircleHelp,
  ClipboardCheck,
  Download,
  FileText,
  HardHat,
  Layers,
  MessagesSquare,
  Receipt,
  Search,
  Upload,
  Users,
  type LucideIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { demoStore } from "@/lib/demoData";
import { downloadInvoicePdf } from "@/lib/invoicePdf";
import { useDatePreference } from "@/hooks/usePreferences";

const iconClass = "size-4 shrink-0";

interface VendorRow {
  id: string;
  initials?: string;
  name: string;
  skills?: string;
  tier?: string;
  rating?: string;
  status?: string;
}

interface ProjectRow {
  id: string;
  title: string;
  due: string;
  owner: string;
  status: string;
  milestones?: string;
  progressClass?: string;
  vendors?: string[];
}

interface ConversationRow {
  id: string;
  name: string;
  subject: string;
  preview: string;
  time: string;
  channel: string;
  initials: string;
  unread?: boolean;
}

interface DeliverableRow {
  id: string;
  vendor_id: string;
  project_id: string;
  title: string;
  status: string;
  submitted_at: string;
}

interface InvoiceRow {
  id: string;
  period: string;
  amount: number;
  currency: string;
  status: "paid" | "due" | "overdue";
  issued_at: string;
  paid_at?: string | null;
  line_items: Array<{ label: string; amount: number }>;
}

function useDemoStoreTick(): number {
  const [tick, force] = useReducer((n: number) => n + 1, 0);
  useEffect(() => demoStore.subscribe(() => force()), []);
  return tick;
}

const vendorNavItems: Array<{ label: string; icon: LucideIcon; key: string }> = [
  { label: "Overview", icon: BarChart3, key: "overview" },
  { label: "Projects", icon: Layers, key: "projects" },
  { label: "Conversations", icon: MessagesSquare, key: "conversations" },
  { label: "Deliverables", icon: ClipboardCheck, key: "deliverables" },
  { label: "Invoices", icon: Receipt, key: "invoices" },
];

export default function VendorPortal() {
  useDemoStoreTick();
  const [activeKey, setActiveKey] = useState<string>("overview");

  // The demo seed pegs vendor scope to Aurora Studio (vn1) — see
  // demoStore.getVendorId. Switching vendors is a deliberate Wave-B feature.
  const vendor = (demoStore.getVendor() ?? { id: "vn1", name: "Aurora Studio", initials: "AS", tier: "Tier-1", status: "Active" }) as unknown as VendorRow;
  const projects = (demoStore.list("projects").data as unknown as ProjectRow[]).filter((p) =>
    Array.isArray(p.vendors) && p.vendors.includes(vendor.initials ?? "AS"),
  );
  const conversations = (demoStore.list("conversations").data as unknown as ConversationRow[]).filter((c) =>
    // Demo heuristic: any conversation initiated by the vendor or referencing one of their projects.
    c.initials === (vendor.initials ?? "AS") ||
    projects.some((p) => c.subject?.toLowerCase().includes(p.title.toLowerCase().slice(0, 12))),
  );
  const deliverables = (demoStore.list("vendor_deliverables").data as unknown as DeliverableRow[]).filter(
    (d) => d.vendor_id === vendor.id,
  );
  // Vendor sees invoices issued to them — in the demo all invoices belong to the
  // vendor's workspace, so we surface them all under "issued to me".
  const invoices = demoStore.list("invoices").data as unknown as InvoiceRow[];

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground antialiased">
      <aside className="flex w-[232px] shrink-0 flex-col border-r border-border bg-sidebar">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="inline-flex items-center gap-2 text-[14px] font-semibold tracking-normal text-foreground">
            <span className="inline-flex size-[22px] items-center justify-center rounded-[5px] border border-border bg-background text-[12px] font-bold text-foreground">
              V
            </span>
            <span>Vendor portal</span>
          </div>
        </div>

        <div className="px-3 pt-3">
          <div className="flex items-center justify-between gap-2 rounded-lg border border-border bg-background p-2 shadow-card">
            <div className="flex min-w-0 items-center gap-2">
              <div className="flex size-6 shrink-0 items-center justify-center rounded-md border border-border bg-background text-[10px] font-bold text-foreground">
                {(vendor.initials ?? "AS").slice(0, 2)}
              </div>
              <div className="min-w-0">
                <div className="truncate text-[12px] font-semibold text-foreground">
                  {vendor.name}
                </div>
                <div className="truncate text-[10px] text-muted">{vendor.tier ?? "Tier-1"} · vendor view</div>
              </div>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-2 pt-3">
          <div className="mb-1.5 mt-3.5 px-2.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-muted">
            Vendor
          </div>
          <div className="space-y-0.5">
            {vendorNavItems.map((item) => {
              const Icon = item.icon;
              const active = item.key === activeKey;
              return (
                <div
                  key={item.key}
                  role="button"
                  tabIndex={0}
                  data-vendor-nav={item.key}
                  data-active={active ? "true" : "false"}
                  onClick={() => setActiveKey(item.key)}
                  onKeyDown={(ev) => {
                    if (ev.key === "Enter" || ev.key === " ") {
                      ev.preventDefault();
                      setActiveKey(item.key);
                    }
                  }}
                  className={cn(
                    "flex cursor-pointer select-none items-center gap-2.5 rounded-md px-2.5 py-[7px] text-[13px] font-medium transition-colors",
                    active
                      ? "bg-primary-tint text-primary"
                      : "text-secondary hover:bg-border-subtle hover:text-foreground",
                  )}
                >
                  <Icon
                    className={cn("size-4 shrink-0", active ? "text-primary" : "text-muted")}
                    aria-hidden="true"
                  />
                  <span>{item.label}</span>
                </div>
              );
            })}
          </div>

          <div className="mb-1.5 mt-3.5 px-2.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-muted">
            Back
          </div>
          <div className="space-y-0.5">
            <a
              href="/dashboard"
              data-vendor-back="admin"
              className="flex cursor-pointer select-none items-center gap-2.5 rounded-md px-2.5 py-[7px] text-[13px] font-medium text-secondary hover:bg-border-subtle hover:text-foreground"
            >
              <ArrowLeft className="size-4 shrink-0 text-muted" aria-hidden="true" />
              <span>Admin view</span>
            </a>
          </div>
        </nav>

        <div className="border-t border-border px-3 py-3">
          <div className="flex items-center gap-2 px-1">
            <div className="inline-flex size-7 items-center justify-center rounded-full border border-background bg-border-subtle text-[12px] font-semibold uppercase text-secondary">
              {(vendor.initials ?? "AS").slice(0, 2)}
            </div>
            <div className="min-w-0">
              <div className="truncate text-[12px] font-semibold text-foreground">{vendor.name}</div>
              <div className="truncate text-[10px] text-muted">Vendor account</div>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex h-[52px] items-center gap-4 border-b border-border bg-background px-5">
          <nav className="flex items-center gap-2 text-[13px]">
            <span className="text-muted">Vendor portal</span>
            <span className="text-disabled">›</span>
            <span className="font-medium text-foreground capitalize">{activeKey}</span>
          </nav>

          <div className="relative ml-auto mr-auto flex h-[34px] max-w-[480px] flex-1 items-center rounded-md border border-border-strong bg-background">
            <Search
              className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted"
              aria-hidden="true"
            />
            <Input
              type="text"
              placeholder="Search projects, conversations…"
              className="h-full border-0 bg-transparent py-0 pl-8 text-[13px] text-foreground shadow-none placeholder:text-muted focus:border-transparent focus:ring-0"
            />
          </div>

          <div className="ml-auto flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              title="Help"
              aria-label="Help"
              className="h-[30px] w-[30px] rounded-md p-0 text-secondary hover:bg-hover hover:text-foreground"
            >
              <CircleHelp className={iconClass} aria-hidden="true" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              title="Notifications"
              aria-label="Notifications"
              className="relative h-[30px] w-[30px] rounded-md p-0 text-secondary hover:bg-hover hover:text-foreground"
            >
              <Bell className={iconClass} aria-hidden="true" />
              <span className="absolute right-1 top-1 size-1.5 rounded-full bg-foreground" />
            </Button>
          </div>
        </header>

        <main className="flex-1 overflow-auto bg-background">
          {activeKey === "overview" ? (
            <OverviewPane vendor={vendor} projects={projects} deliverables={deliverables} invoices={invoices} />
          ) : activeKey === "projects" ? (
            <ProjectsPane projects={projects} />
          ) : activeKey === "conversations" ? (
            <ConversationsPane conversations={conversations} />
          ) : activeKey === "deliverables" ? (
            <DeliverablesPane vendor={vendor} projects={projects} deliverables={deliverables} />
          ) : activeKey === "invoices" ? (
            <InvoicesPane invoices={invoices} />
          ) : null}
        </main>
      </div>
    </div>
  );
}

function StatCard({ label, value, hint }: { label: string; value: ReactNode; hint?: string }) {
  return (
    <Card className="rounded-lg border-border bg-background">
      <CardContent className="px-[18px] py-4">
        <div className="text-[12px] text-muted">{label}</div>
        <div className="mt-1 text-[22px] font-semibold text-foreground">{value}</div>
        {hint ? <div className="mt-0.5 text-[11px] text-muted">{hint}</div> : null}
      </CardContent>
    </Card>
  );
}

function OverviewPane({
  vendor,
  projects,
  deliverables,
  invoices,
}: {
  vendor: VendorRow;
  projects: ProjectRow[];
  deliverables: DeliverableRow[];
  invoices: InvoiceRow[];
}) {
  const openDeliverables = deliverables.filter((d) => d.status !== "approved").length;
  const paidInvoices = invoices.filter((i) => i.status === "paid").length;
  return (
    <div className="max-w-[1100px] px-8 py-6">
      <div className="mb-6">
        <h1 className="font-display text-[22px] font-semibold tracking-tight text-foreground">
          {vendor.name}
        </h1>
        <p className="mt-1 text-[13px] text-muted">
          {vendor.tier ?? "Tier-1"} · {vendor.skills ?? "Concept · 3D viz · Brand"} · rating {vendor.rating ?? "4.9"}
        </p>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Active projects" value={projects.length} />
        <StatCard label="Open deliverables" value={openDeliverables} hint={`${deliverables.length} total`} />
        <StatCard label="Invoices paid" value={paidInvoices} hint={`${invoices.length} total issued`} />
      </div>
    </div>
  );
}

function ProjectsPane({ projects }: { projects: ProjectRow[] }) {
  const { formatDate } = useDatePreference();
  return (
    <div className="max-w-[1100px] px-8 py-6">
      <div className="mb-6">
        <h1 className="font-display text-[22px] font-semibold tracking-tight text-foreground">
          Assigned projects
        </h1>
        <p className="mt-1 text-[13px] text-muted">
          {projects.length} project{projects.length === 1 ? "" : "s"} where you are listed as a vendor
        </p>
      </div>
      <Card className="rounded-lg border-border bg-background">
        <CardContent className="p-0">
          {projects.length === 0 ? (
            <div className="px-5 py-8 text-center text-[12px] text-muted">No projects assigned yet.</div>
          ) : (
            projects.map((p) => (
              <div
                key={p.id}
                data-project-id={p.id}
                className="flex items-center gap-3 border-b border-border-subtle px-5 py-3 last:border-b-0"
              >
                <div className="flex size-8 shrink-0 items-center justify-center rounded-md border border-border bg-background text-secondary">
                  <Layers className={iconClass} aria-hidden="true" />
                </div>
                <div className="flex-1">
                  <div className="text-[13px] font-semibold text-foreground">{p.title}</div>
                  <div className="text-[11px] text-muted">
                    Due {formatDate(`2026 ${p.due}`) || p.due} · Owner {p.owner} · Milestones {p.milestones ?? "—"}
                  </div>
                </div>
                <span className="rounded-full bg-border-subtle px-2.5 py-0.5 text-[11px] font-medium text-secondary">
                  {p.status}
                </span>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ConversationsPane({ conversations }: { conversations: ConversationRow[] }) {
  return (
    <div className="max-w-[1100px] px-8 py-6">
      <div className="mb-6">
        <h1 className="font-display text-[22px] font-semibold tracking-tight text-foreground">
          Conversations
        </h1>
        <p className="mt-1 text-[13px] text-muted">
          {conversations.length} thread{conversations.length === 1 ? "" : "s"} on your assigned projects
        </p>
      </div>
      <Card className="rounded-lg border-border bg-background">
        <CardContent className="p-0">
          {conversations.length === 0 ? (
            <div className="px-5 py-8 text-center text-[12px] text-muted">
              No conversations yet. New messages will land here.
            </div>
          ) : (
            conversations.map((c) => (
              <div
                key={c.id}
                data-conversation-id={c.id}
                className="flex items-center gap-3 border-b border-border-subtle px-5 py-3 last:border-b-0"
              >
                <div className="inline-flex size-7 items-center justify-center rounded-full bg-border-subtle text-[11px] font-semibold uppercase text-secondary">
                  {c.initials}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="truncate text-[13px] font-semibold text-foreground">{c.name}</div>
                    <span className="shrink-0 text-[11px] text-muted">{c.time}</span>
                  </div>
                  <div className="mt-0.5 truncate text-[12px] text-secondary">{c.subject}</div>
                  <div className="mt-0.5 truncate text-[11px] text-muted">{c.preview}</div>
                </div>
                {c.unread ? <span className="size-2 shrink-0 rounded-full bg-foreground" /> : null}
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function DeliverablesPane({
  vendor,
  projects,
  deliverables,
}: {
  vendor: VendorRow;
  projects: ProjectRow[];
  deliverables: DeliverableRow[];
}) {
  const [draftTitle, setDraftTitle] = useState("");
  const [draftProject, setDraftProject] = useState<string>(projects[0]?.id ?? "");

  function submit() {
    const title = draftTitle.trim();
    if (!title || !draftProject) return;
    demoStore.create("vendor_deliverables", {
      vendor_id: vendor.id,
      project_id: draftProject,
      title,
      status: "submitted",
      submitted_at: new Date().toISOString(),
    });
    setDraftTitle("");
  }

  return (
    <div className="max-w-[1100px] px-8 py-6">
      <div className="mb-6">
        <h1 className="font-display text-[22px] font-semibold tracking-tight text-foreground">
          Deliverables
        </h1>
        <p className="mt-1 text-[13px] text-muted">
          Submit new files or check the status of previous submissions.
        </p>
      </div>

      <Card className="mb-4 rounded-lg border-border bg-background">
        <CardContent className="space-y-3 px-[18px] py-4">
          <div className="flex items-center gap-2">
            <Upload className={cn(iconClass, "text-muted")} aria-hidden="true" />
            <span className="text-[13px] font-semibold text-foreground">Submit deliverable</span>
          </div>
          <label className="block">
            <span className="text-[12px] font-medium text-secondary">Title</span>
            <Input
              value={draftTitle}
              onChange={(e) => setDraftTitle(e.target.value)}
              placeholder="Concept board v4"
              className="mt-1 h-[34px] text-[13px]"
            />
          </label>
          <label className="block">
            <span className="text-[12px] font-medium text-secondary">Project</span>
            <select
              value={draftProject}
              onChange={(e) => setDraftProject(e.target.value)}
              className="mt-1 h-[34px] w-full rounded-md border border-border-strong bg-background px-2 text-[13px] text-foreground focus:border-foreground focus:outline-none"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
          </label>
          <Button
            type="button"
            onClick={submit}
            className="h-auto bg-primary px-3.5 py-[7px] text-[13px] text-background hover:bg-primary-hover"
          >
            Submit
          </Button>
        </CardContent>
      </Card>

      <Card className="rounded-lg border-border bg-background">
        <CardContent className="p-0">
          {deliverables.length === 0 ? (
            <div className="px-5 py-8 text-center text-[12px] text-muted">No deliverables yet.</div>
          ) : (
            deliverables.map((d) => (
              <div
                key={d.id}
                data-deliverable-id={d.id}
                data-deliverable-status={d.status}
                className="flex items-center gap-3 border-b border-border-subtle px-5 py-3 last:border-b-0"
              >
                <div className="flex size-8 shrink-0 items-center justify-center rounded-md border border-border bg-background text-secondary">
                  <FileText className={iconClass} aria-hidden="true" />
                </div>
                <div className="flex-1">
                  <div className="text-[13px] font-semibold text-foreground">{d.title}</div>
                  <div className="text-[11px] text-muted">
                    {projects.find((p) => p.id === d.project_id)?.title ?? d.project_id}
                    {" · "}submitted {new Date(d.submitted_at).toLocaleDateString()}
                  </div>
                </div>
                <span
                  className={cn(
                    "rounded-full px-2.5 py-0.5 text-[11px] font-medium",
                    d.status === "approved"
                      ? "bg-primary-tint text-primary"
                      : d.status === "in_review"
                      ? "bg-border-subtle text-secondary"
                      : "bg-border-subtle text-secondary",
                  )}
                >
                  {d.status.replace("_", " ")}
                </span>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function InvoicesPane({ invoices }: { invoices: InvoiceRow[] }) {
  return (
    <div className="max-w-[1100px] px-8 py-6">
      <div className="mb-6">
        <h1 className="font-display text-[22px] font-semibold tracking-tight text-foreground">
          Invoices issued to you
        </h1>
        <p className="mt-1 text-[13px] text-muted">
          {invoices.length} invoice{invoices.length === 1 ? "" : "s"} · download PDFs for your records
        </p>
      </div>
      <Card className="rounded-lg border-border bg-background">
        <CardContent className="p-0">
          {invoices.map((inv) => (
            <div
              key={inv.id}
              data-invoice-id={inv.id}
              className="flex items-center gap-3 border-b border-border-subtle px-5 py-3 last:border-b-0"
            >
              <div className="flex size-8 shrink-0 items-center justify-center rounded-md border border-border bg-background text-secondary">
                <Receipt className={iconClass} aria-hidden="true" />
              </div>
              <div className="flex-1">
                <div className="text-[13px] font-semibold text-foreground">
                  {inv.period} · {inv.currency} {inv.amount.toLocaleString("en-IN")}
                </div>
                <div className="text-[11px] text-muted">
                  Issued {inv.issued_at?.slice(0, 10)}
                </div>
              </div>
              <span
                className={cn(
                  "rounded-full px-2.5 py-0.5 text-[11px] font-medium",
                  inv.status === "paid" ? "bg-primary-tint text-primary" : "bg-border-subtle text-secondary",
                )}
              >
                {inv.status === "paid" ? "Paid" : inv.status === "due" ? "Due" : "Overdue"}
              </span>
              <Button
                type="button"
                variant="secondary"
                onClick={() => downloadInvoicePdf(inv)}
                className="h-auto gap-1.5 px-3 py-1.5 text-[12px] focus-visible:ring-foreground"
              >
                <Download className={iconClass} aria-hidden="true" />
                Download
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

// Re-exports used by lazy loader (parity with the other page files).
export const __vendorPortalMarker = true as const;

// Suppress unused-import warnings — these icons are reserved for future
// fields (calendar dates, contact roster) and stay available to keep the
// vendor portal shape stable as the surface grows.
type _UnusedSlots = { calendar: typeof Calendar; users: typeof Users; hardHat: typeof HardHat };
const _unusedSlots: _UnusedSlots = { calendar: Calendar, users: Users, hardHat: HardHat };
void _unusedSlots;
