/* Generated from brief/mockups/14-forms.html via Codex fidelity pass 2026-05-19. Do not hand-edit. */

import { useNavigate } from "react-router-dom";
import type { ReactNode } from "react";
import { useState } from "react";
import {
  AlignLeft,
  BarChart3,
  Bell,
  Calendar,
  Check,
  CheckSquare,
  ChevronDown,
  ChevronDownSquare,
  ChevronRight,
  ChevronsUpDown,
  Circle,
  CircleHelp,
  ClipboardList,
  Code,
  Copy,
  Eye,
  GitBranch,
  GripVertical,
  HardHat,
  Hash,
  Layers,
  LayoutDashboard,
  LayoutGrid,
  Link as LinkIcon,
  ListChecks,
  Mail,
  MapPin,
  MessagesSquare,
  Minus,
  MoreHorizontal,
  PanelLeftClose,
  PencilRuler,
  Phone,
  Plus,
  Search,
  Settings,
  TextCursorInput,
  Trash2,
  Type,
  Upload,
  UploadCloud,
  Users,
  UsersRound,
  Zap,
  type LucideIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useItem, useList, useUpdate } from "../hooks/useResource.js";

type NavItem = {
  label: string;
  icon: LucideIcon;
  active?: boolean;
};

type FieldType = {
  label: string;
  icon: LucideIcon;
};

type FieldSection = {
  label: string;
  items: FieldType[];
};

type FormField =
  | {
      label: string;
      meta: string;
      required?: boolean;
      active?: boolean;
      kind: "input";
      value: string;
    }
  | {
      label: string;
      meta: string;
      active?: boolean;
      kind: "badges";
      badges: string[];
      addLabel: string;
    }
  | {
      label: string;
      meta: string;
      active?: boolean;
      kind: "upload";
    };

const workspaceNavItems: NavItem[] = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "Contacts", icon: Users },
  { label: "Vendors", icon: HardHat },
  { label: "Pipelines", icon: GitBranch },
  { label: "Projects", icon: Layers },
  { label: "Calendar", icon: Calendar },
  { label: "Conversations", icon: MessagesSquare },
  { label: "Forms", icon: ClipboardList, active: true },
  { label: "Workflows", icon: Zap },
  { label: "Reports", icon: BarChart3 },
  { label: "Settings", icon: Settings },
];

const surfaceNavItems: NavItem[] = [
  { label: "Outlook add-in", icon: Mail },
  { label: "Teams app", icon: UsersRound },
  { label: "M365 launcher", icon: LayoutGrid },
];

const fieldSections: FieldSection[] = [
  {
    label: "Text",
    items: [
      { label: "Short text", icon: TextCursorInput },
      { label: "Long text", icon: AlignLeft },
      { label: "Rich text", icon: Type },
    ],
  },
  {
    label: "Contact",
    items: [
      { label: "Email", icon: Mail },
      { label: "Phone", icon: Phone },
      { label: "Address", icon: MapPin },
    ],
  },
  {
    label: "Choice",
    items: [
      { label: "Dropdown", icon: ChevronDownSquare },
      { label: "Radio", icon: Circle },
      { label: "Checkboxes", icon: CheckSquare },
      { label: "Multi-select", icon: ListChecks },
    ],
  },
  {
    label: "Other",
    items: [
      { label: "Number", icon: Hash },
      { label: "Date", icon: Calendar },
      { label: "File upload", icon: Upload },
      { label: "Section break", icon: Minus },
    ],
  },
];

const inspectorOptions = [
  "Carpentry",
  "Electrical",
  "Plumbing",
  "Painting & finishes",
  "Soft furnishings",
  "3D / visualization",
];

const iconClass = "size-4 shrink-0";
const inputFocusClass = "focus:border-border-strong focus:ring-0";

function IconButton({ title, children, className, onClick }: { title?: string; children: ReactNode; className?: string; onClick?: () => void }) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      title={title}
      aria-label={title}
      className={cn("size-[30px] rounded-md p-0 text-secondary hover:bg-hover hover:text-foreground focus-visible:ring-foreground", className)}
    >
      {children}
    </Button>
  );
}

function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <div className="inline-flex items-center gap-2 text-[14px] font-semibold tracking-normal text-foreground">
      <span className="inline-flex size-[22px] items-center justify-center rounded-[5px] bg-foreground text-[12px] font-bold text-background">D</span>
      <span className={cn(compact && "text-[12px]")}>DesignersMeet</span>
    </div>
  );
}

function Avatar({ children, size = "default" }: { children: ReactNode; size?: "default" | "sm" }) {
  return (
    <div
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full border border-background bg-border-subtle font-semibold uppercase text-secondary",
        size === "sm" ? "size-[22px] text-[10px]" : "size-7 text-[12px]",
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
        className={cn("h-full border-0 bg-transparent py-0 pl-8 text-[13px] text-foreground shadow-none placeholder:text-muted focus:border-transparent focus:ring-0", shortcut ? "pr-14" : "pr-3")}
      />
      {shortcut ? (
        <span className="absolute right-2 top-1/2 -translate-y-1/2">
          <kbd className="rounded border border-border bg-background px-1.5 py-0.5 font-sans text-[10px] font-medium text-muted shadow-card">{shortcut}</kbd>
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
      <Icon className={cn(iconClass, item.active ? "text-primary" : "text-muted")} aria-hidden="true" />
      <span>{item.label}</span>
    </button>
  );
}

function Badge({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "success" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium leading-[18px] tracking-[0.01em]",
        tone === "success" ? "bg-primary-tint text-primary" : "bg-border-subtle text-secondary",
      )}
    >
      {children}
    </span>
  );
}

function FieldPaletteItem({ item }: { item: FieldType }) {
  const Icon = item.icon;

  return (
    <div className="flex cursor-grab items-center gap-2.5 rounded-md border border-border bg-background px-2.5 py-2 text-[12.5px] text-secondary hover:border-border-strong hover:bg-hover">
      <Icon className="size-4 shrink-0 text-muted" aria-hidden="true" />
      <span>{item.label}</span>
    </div>
  );
}

function ModeButton({ active, icon: Icon, children, last, onClick }: { active?: boolean; icon: LucideIcon; children: ReactNode; last?: boolean; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 px-2.5 py-1.5 text-[12px] focus-visible:outline-foreground",
        active ? "rounded-l-md bg-primary-tint font-medium text-primary" : "text-muted hover:bg-hover",
        last && "rounded-r-md",
      )}
    >
      <Icon className={iconClass} aria-hidden="true" />
      {children}
    </button>
  );
}

function FormFieldCard({ field }: { field: FormField }) {
  return (
    <div className={cn("group relative rounded-md border p-4", field.active ? "border-border-strong ring-2 ring-border-subtle" : "border-border hover:border-border-strong")}>
      <button
        type="button"
        className="absolute -left-3 top-1/2 flex size-6 -translate-y-1/2 items-center justify-center rounded border border-border bg-background opacity-0 group-hover:opacity-100"
      >
        <GripVertical className="size-4 text-muted" aria-hidden="true" />
      </button>
      <div className="mb-2 flex items-start justify-between">
        <div>
          <label className="text-[13px] font-semibold text-foreground">
            {field.label}
            {"required" in field && field.required ? <span className="ml-0.5 text-danger">*</span> : null}
          </label>
          <div className="mt-0.5 text-[11px] text-muted">{field.meta}</div>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
          <IconButton title="Copy field" className="size-6">
            <Copy className={iconClass} aria-hidden="true" />
          </IconButton>
          <IconButton title="Delete field" className="size-6">
            <Trash2 className={iconClass} aria-hidden="true" />
          </IconButton>
        </div>
      </div>
      {field.kind === "input" ? (
        <Input defaultValue={field.value} placeholder="Type your answer..." className={inputFocusClass} />
      ) : null}
      {field.kind === "badges" ? (
        <div className="flex flex-wrap gap-1.5">
          {field.badges.map((badge) => (
            <Badge key={badge}>{badge} {"\u00d7"}</Badge>
          ))}
          <Badge>{field.addLabel}</Badge>
        </div>
      ) : null}
      {field.kind === "upload" ? (
        <div className="rounded-md border-2 border-dashed border-border py-6 text-center text-[12px] text-secondary">
          <UploadCloud className="mb-1 inline-block size-5 text-muted" aria-hidden="true" />
          <div>Click or drop a file here</div>
        </div>
      ) : null}
    </div>
  );
}

export default function Forms() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const navigate = useNavigate();
  const _f = useItem("forms", "fm1").data as any;
  const updateForm = useUpdate("forms");
  const responsesCount = useList("form-responses", { formId: "fm1" }).data?.data?.length ?? 0;
  const previewUrl = (_f?.publicUrl as string | undefined) ?? "https://forms.designersmeet.com/vendor-onboarding";
  const formFields: FormField[] = _f?.schema_json ?? [
    { label: "Studio / company name", meta: "Required", required: true, kind: "input", value: "Aurora Studio" },
    { label: "Primary contact email", meta: "Required", required: true, kind: "input", value: "hello@aurorastudio.in" },
    { label: "WhatsApp number", meta: "Required", kind: "input", value: "+91 80 4123 5678" },
    {
      label: "Skills / disciplines",
      meta: "Required \u00b7 1\u20136 selections",
      active: true,
      kind: "badges",
      badges: ["Concept design", "3D visualization"],
      addLabel: "+ Add skill",
    },
    {
      label: "Regions you serve",
      meta: "Required",
      kind: "badges",
      badges: ["Karnataka", "Tamil Nadu"],
      addLabel: "+ Add region",
    },
    { label: "Years in business", meta: "Optional", kind: "input", value: "8" },
    { label: "Portfolio link", meta: "Required", kind: "input", value: "https://aurorastudio.in/work" },
    { label: "Upload latest case studies (PDF)", meta: "Optional \u00b7 max 25MB", kind: "upload" },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground antialiased">
      <aside className="flex w-[232px] shrink-0 flex-col border-r border-border bg-sidebar">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <Brand />
          <IconButton title="Collapse sidebar" onClick={() => setSidebarCollapsed(v => !v)}>
            <PanelLeftClose className={iconClass} aria-hidden="true" />
          </IconButton>
        </div>
        <div className="px-3 pt-3">
          <div className="flex items-center justify-between gap-2 rounded-lg border border-border bg-background p-2 shadow-card">
            <div className="flex min-w-0 items-center gap-2">
              <div className="flex size-6 shrink-0 items-center justify-center rounded-md bg-foreground text-[10px] font-bold text-background">HQ</div>
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
          <div className="flex flex-col gap-0.5">{workspaceNavItems.map((item) => <SidebarNavItem key={item.label} item={item} onClick={() => { const r = ({Dashboard:"/dashboard",Contacts:"/contacts",Vendors:"/vendors",Pipelines:"/pipelines",Projects:"/projects",Calendar:"/calendar",Conversations:"/conversations",Forms:"/forms",Workflows:"/workflows",Reports:"/pipelines",Settings:"/settings"} as Record<string,string>)[item.label]; if (r) navigate(r); }} />)}</div>
          <div className="mb-1.5 mt-3.5 px-2.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-muted">Surfaces</div>
          <div className="flex flex-col gap-0.5">{surfaceNavItems.map((item) => <SidebarNavItem key={item.label} item={item} onClick={() => { const r = ({Dashboard:"/dashboard",Contacts:"/contacts",Vendors:"/vendors",Pipelines:"/pipelines",Projects:"/projects",Calendar:"/calendar",Conversations:"/conversations",Forms:"/forms",Workflows:"/workflows",Reports:"/pipelines",Settings:"/settings"} as Record<string,string>)[item.label]; if (r) navigate(r); }} />)}</div>
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
            <span className="text-muted">Forms</span>
            <ChevronRight className="size-4 text-disabled" aria-hidden="true" />
            <span className="font-medium text-foreground">{_f?.name ?? "Vendor onboarding form"}</span>
          </nav>
          <SearchField placeholder="Search contacts, projects, vendors..." shortcut={"\u2318K"} className="ml-auto mr-auto max-w-[480px] flex-1" />
          <div className="ml-auto flex items-center gap-1">
            <IconButton title="Help" onClick={() => window.open("https://support.microsoft.com","_blank","noopener,noreferrer")}>
              <CircleHelp className={iconClass} aria-hidden="true" />
            </IconButton>
            <IconButton title="Notifications" className="relative" onClick={() => navigate("/conversations")}>
              <Bell className={iconClass} aria-hidden="true" />
              <span className="absolute right-1 top-1 size-1.5 rounded-full bg-foreground" />
            </IconButton>
            <div className="mx-1 h-6 w-px bg-border" />
            <button type="button" className="flex items-center gap-2 rounded-md px-2 py-1 hover:bg-hover">
              <Avatar size="sm">MS</Avatar>
              <ChevronDown className="size-4 text-muted" aria-hidden="true" />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-auto bg-background">
          <div className="flex h-full">
            <aside className="flex w-[240px] flex-col border-r border-border bg-sidebar">
              <div className="border-b border-border bg-background px-4 py-3">
                <div className="text-[12px] font-semibold uppercase tracking-wider text-muted">Field types</div>
              </div>
              <div className="flex flex-1 flex-col gap-2 overflow-y-auto p-3">
                {fieldSections.map((section, sectionIndex) => (
                  <div key={section.label} className="flex flex-col gap-2">
                    <div className={cn("mb-1 px-2 text-[10.5px] font-semibold uppercase tracking-wider text-muted", sectionIndex > 0 && "mt-1")}>{section.label}</div>
                    {section.items.map((item) => <FieldPaletteItem key={item.label} item={item} />)}
                  </div>
                ))}
              </div>
            </aside>

            <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
              <div className="flex items-center justify-between border-b border-border px-6 py-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-[16px] font-semibold text-foreground">{_f?.name ?? "Vendor onboarding form"}</h1>
                    <Badge tone="success">Published</Badge>
                  </div>
                  <div className="mt-0.5 flex items-center gap-2 text-[11.5px] text-muted">
                    <LinkIcon className={iconClass} aria-hidden="true" />
                    <code className="rounded bg-border-subtle px-1.5 py-0.5 font-mono text-[11px] text-secondary">{_f?.publicUrl ?? "forms.designersmeet.com/vendor-onboarding"}</code>
                    <IconButton title="Copy link" className="size-5">
                      <Copy className={iconClass} aria-hidden="true" />
                    </IconButton>
                    <span>{"\u00b7"} {`${responsesCount} submissions`} {"\u00b7"} {_f?.lastSubmission ?? "last 2h ago"}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center rounded-md border border-border-strong bg-background">
                    <ModeButton active icon={PencilRuler}>Build</ModeButton>
                    <ModeButton icon={Eye} onClick={() => window.open(previewUrl, "_blank", "noopener,noreferrer")}>Preview</ModeButton>
                    <ModeButton icon={Code}>Embed</ModeButton>
                    <ModeButton icon={Zap} last>Logic</ModeButton>
                  </div>
                  <Button type="button" variant="secondary" className="h-[34px] gap-1.5 px-3.5 py-[7px] text-[13px]" onClick={() => updateForm.mutate({ id: "fm1", patch: {} })}>Save draft</Button>
                  <Button type="button" className="h-[34px] gap-1.5 px-3.5 py-[7px] text-[13px]" onClick={() => updateForm.mutate({ id: "fm1", patch: {} })}>
                    <Check className={iconClass} aria-hidden="true" />
                    Publish
                  </Button>
                </div>
              </div>

              <div className="flex-1 overflow-auto bg-subtle p-8">
                <Card className="mx-auto max-w-[640px] rounded-lg border-border bg-background shadow-card">
                  <div className="border-b border-border-subtle px-7 py-6">
                    <div className="mb-3">
                      <Brand compact />
                    </div>
                    <h2 className="font-display text-[22px] font-semibold tracking-tight text-foreground">Vendor onboarding</h2>
                    <p className="mt-1 text-[13px] text-muted">Tell us about your studio and we'll get you set up in the DesignersMeet vendor pool.</p>
                  </div>
                  <div className="flex flex-col gap-5 px-7 py-6">
                    {formFields.map((field) => <FormFieldCard key={field.label} field={field} />)}
                    <div className="flex items-center justify-between border-t border-border-subtle pt-5">
                      <label className="flex items-center gap-2 text-[12px] text-secondary">
                        <input type="checkbox" className="rounded border-border-strong accent-foreground" />
                        I agree to the vendor terms.
                      </label>
                      <Button type="submit" className="h-[34px] px-3.5 py-[7px] text-[13px] bg-primary text-background hover:bg-primary-hover">Submit application</Button>
                    </div>
                  </div>
                </Card>

                <div className="mx-auto mt-4 flex max-w-[640px] items-center gap-3 rounded-md border border-border bg-background px-4 py-3">
                  <Zap className="size-4 shrink-0 text-secondary" aria-hidden="true" />
                  <div className="flex-1 text-[12px] text-secondary">
                    On submit, this form triggers the workflow <span className="font-semibold text-foreground">Vendor onboarding sequence</span> (7 steps).
                  </div>
                  <a className="text-[12px] font-medium text-foreground hover:underline">Edit workflow {"\u2192"}</a>
                </div>
              </div>
            </div>

            <aside className="w-[280px] overflow-auto border-l border-border bg-background">
              <div className="border-b border-border px-5 py-3">
                <div className="text-[10.5px] font-semibold uppercase tracking-wider text-muted">Selected field</div>
                <div className="mt-1 text-[14px] font-semibold text-foreground">Skills / disciplines</div>
                <div className="text-[11px] text-muted">Multi-select</div>
              </div>
              <div className="flex flex-col gap-4 p-5">
                <div>
                  <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-muted">Label</label>
                  <Input defaultValue="Skills / disciplines" className={inputFocusClass} />
                </div>
                <div>
                  <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-muted">Help text</label>
                  <Input defaultValue={"Pick 1\u20136 specialities"} className={inputFocusClass} />
                </div>
                <div>
                  <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-muted">Options</label>
                  <div className="flex flex-col gap-1.5">
                    {inspectorOptions.map((option) => (
                      <div key={option} className="flex items-center gap-2">
                        <Input defaultValue={option} className={cn("flex-1", inputFocusClass)} />
                        <IconButton title="Drag option">
                          <GripVertical className={iconClass} aria-hidden="true" />
                        </IconButton>
                      </div>
                    ))}
                    <Button type="button" variant="ghost" onClick={() => alert("Field palette — drag a field type from the panel to add it")} className="h-auto justify-start gap-1.5 px-2.5 py-1.5 text-[12px] text-secondary hover:bg-hover hover:text-foreground">
                      <Plus className={iconClass} aria-hidden="true" />
                      Add option
                    </Button>
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-muted">Required</label>
                  <label className="flex items-center gap-2 text-[12.5px] text-secondary">
                    <input type="checkbox" defaultChecked className="rounded border-border-strong accent-foreground" />
                    Required to submit
                  </label>
                </div>
                <div>
                  <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-muted">Selection limit</label>
                  <div className="flex items-center gap-2">
                    <Input defaultValue="1" className={cn("w-16", inputFocusClass)} />
                    <span className="text-[12px] text-muted">to</span>
                    <Input defaultValue="6" className={cn("w-16", inputFocusClass)} />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-muted">Maps to contact field</label>
                  <select className="h-[34px] w-full rounded-md border border-border-strong bg-background px-3 text-[13px] text-foreground outline-none transition-colors focus:border-border-strong focus:ring-0">
                    <option>vendor.skills (array)</option>
                    <option>custom_fields.skills</option>
                    <option>Don't map</option>
                  </select>
                </div>
              </div>
            </aside>
          </div>
        </main>
      </div>
    </div>
  );
}
