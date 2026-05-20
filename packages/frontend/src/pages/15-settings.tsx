/* Generated from brief/mockups/15-settings.html via Codex fidelity pass 2026-05-19.
 * Visual DOM untouched. Behaviour-only patch 2026-05-20 wires the secondary
 * Settings sub-menu (was decorative — clicking any of the 18 items did not
 * change `data-active` or swap the right pane). The default active selection
 * stays "Integrations", so the FIRST render is byte-identical to the locked
 * baseline. Clicking switches active state + right-pane content; items with no
 * Wave-1 implementation render a "Coming in Phase 2" panel and carry
 * data-disabled/aria-disabled so the new D-DECORATIVE probe accepts them as
 * intentionally inert (not as silent defects).
 *
 * Wave-A (2026-05-20) wires 7 panels that were Phase-2 stubs into real demo-
 * mode features backed by demoStore: Audit log, Workspaces CRUD + active-
 * switch, Locale & time, Teams, Plan & usage (+ upgrade modal), Invoices
 * (+ jsPDF download), Vendor portal admin pane. The 5 remaining Phase-2
 * items (Sessions, API keys, SSO providers, Email providers, Webhooks)
 * still render the locked "Coming in Phase 2" pane — they need a real
 * backend deploy and land in Wave B.
 */

import { useEffect, useMemo, useReducer, useState, type ReactNode } from "react";
import {
  BarChart3,
  Bell,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ChevronsUpDown,
  CircleHelp,
  ClipboardList,
  CreditCard,
  Download,
  ExternalLink,
  GitBranch,
  Globe,
  HardHat,
  Key,
  Layers,
  LayoutDashboard,
  LayoutGrid,
  Lock,
  Mail,
  MessagesSquare,
  MoreHorizontal,
  Palette,
  PanelLeftClose,
  Plus,
  Puzzle,
  Receipt,
  Scroll,
  Search,
  Settings as SettingsIcon,
  ShieldCheck,
  ShoppingBag,
  Trash2,
  Users,
  UsersRound,
  Webhook,
  Workflow,
  X,
  Zap,
  type LucideIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { demoStore } from "@/lib/demoData";
import {
  DATE_FORMATS,
  LANGUAGES,
  TIMEZONES,
  useDatePreference,
  usePreferences,
} from "@/hooks/usePreferences";
import { downloadInvoicePdf } from "@/lib/invoicePdf";

type NavItem = {
  label: string;
  icon: LucideIcon;
  active?: boolean;
  /** Phase-2 items render a "Coming in Phase 2" panel + carry data-disabled */
  phase2?: boolean;
};

type SettingsSection = {
  label: string;
  items: NavItem[];
};

type BadgeVariant = "success" | "neutral";

type Integration = {
  name: string;
  description: string;
  detail: string;
  status: string;
  statusVariant: BadgeVariant;
  statusDot?: boolean;
  icon: ReactNode;
  connected?: boolean;
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
  { label: "Reports", icon: BarChart3 },
  { label: "Settings", icon: SettingsIcon, active: true },
];

const surfaceNavItems: NavItem[] = [
  { label: "Outlook add-in", icon: Mail },
  { label: "Teams app", icon: UsersRound },
  { label: "M365 launcher", icon: LayoutGrid },
];

const settingsSections: SettingsSection[] = [
  {
    label: "Workspace",
    items: [
      { label: "General", icon: SettingsIcon },
      { label: "Workspaces", icon: Building2 },
      { label: "Branding", icon: Palette },
      { label: "Locale & time", icon: Globe },
    ],
  },
  {
    label: "People",
    items: [
      { label: "Users & roles", icon: Users },
      { label: "Teams", icon: UsersRound },
      { label: "Vendor portal", icon: HardHat },
    ],
  },
  {
    label: "Identity",
    items: [
      { label: "SSO providers", icon: ShieldCheck },
      { label: "Sessions", icon: Lock, phase2: true },
      { label: "Audit log", icon: Scroll },
    ],
  },
  {
    label: "Connections",
    items: [
      { label: "Integrations", icon: Puzzle },
      { label: "Email providers", icon: Mail, phase2: true },
      { label: "Webhooks", icon: Webhook, phase2: true },
      { label: "API keys", icon: Key, phase2: true },
    ],
  },
  {
    label: "Billing",
    items: [
      { label: "Plan & usage", icon: CreditCard },
      { label: "Invoices", icon: Receipt },
    ],
  },
];

const DEFAULT_SETTINGS_ITEM = "Integrations"; // preserves locked baseline

const iconClass = "size-4 shrink-0";

const badgeVariantClasses: Record<BadgeVariant, string> = {
  success: "bg-primary-tint text-primary",
  neutral: "bg-border-subtle text-secondary",
};

const integrations: Integration[] = [
  {
    name: "Microsoft 365",
    description: "Outlook · Calendar · SharePoint · Teams",
    detail: "Mail.ReadWrite, Calendars.ReadWrite, Files.ReadWrite.All, Group.ReadWrite.All",
    status: "Connected",
    statusVariant: "success",
    statusDot: true,
    connected: true,
    icon: <MicrosoftLogo className="size-6 text-foreground" />,
  },
  {
    name: "Resend",
    description: "Transactional email · mail.designersmeet.com",
    detail: "SPF · DKIM · DMARC quarantine",
    status: "Connected",
    statusVariant: "success",
    statusDot: true,
    connected: true,
    icon: <LogoTile>R</LogoTile>,
  },
  {
    name: "WhatsApp Cloud",
    description: "Meta Cloud API · Business number",
    detail: "2 templates approved · 5 pending",
    status: "Connected",
    statusVariant: "success",
    statusDot: true,
    connected: true,
    icon: <WhatsAppLogo className="size-6 text-foreground" />,
  },
  {
    name: "Google Workspace",
    description: "Gmail · Calendar (for vendor SSO)",
    detail: "Activate when first Gmail-based vendor onboards",
    status: "Available",
    statusVariant: "neutral",
    icon: <GoogleLogo className="size-6 text-foreground" />,
  },
  {
    name: "Shopify",
    description: "Admin GraphQL · Marketing activities",
    detail: "1 store · 47 products · webhook health green",
    status: "Connected",
    statusVariant: "success",
    statusDot: true,
    connected: true,
    icon: (
      <LogoTile>
        <ShoppingBag className="size-3.5" aria-hidden="true" />
      </LogoTile>
    ),
  },
  {
    name: "Meta (FB + IG)",
    description: "Pages API · Instagram Graph",
    detail: "Submitted May 12 · expected 14d",
    status: "In review",
    statusVariant: "neutral",
    statusDot: true,
    icon: <LogoTile>f</LogoTile>,
  },
  {
    name: "Stripe",
    description: "Stripe Connect for vendor payouts",
    detail: "Deferred to Wave 5 per roadmap",
    status: "Wave 5",
    statusVariant: "neutral",
    icon: <LogoTile>S</LogoTile>,
  },
  {
    name: "Power Automate",
    description: "HTTP triggers · bidirectional webhooks",
    detail: "3 flows subscribed · last fire 12m ago",
    status: "Connected",
    statusVariant: "success",
    statusDot: true,
    connected: true,
    icon: (
      <LogoTile>
        <Workflow className="size-3.5" aria-hidden="true" />
      </LogoTile>
    ),
  },
];

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

function SidebarNavItem({
  item,
  onClick,
}: {
  item: NavItem;
  onClick?: () => void;
}) {
  const Icon = item.icon;
  const disabled = item.phase2 === true;

  return (
    <div
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={
        onClick
          ? (ev) => {
              if (ev.key === "Enter" || ev.key === " ") {
                ev.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      aria-disabled={disabled ? "true" : undefined}
      data-disabled={disabled ? "true" : undefined}
      title={disabled ? "Coming in Phase 2" : undefined}
      className={cn(
        "flex cursor-pointer select-none items-center gap-2.5 rounded-md px-2.5 py-[7px] text-[13px] font-medium transition-colors",
        item.active
          ? "bg-primary-tint text-primary"
          : "text-secondary hover:bg-border-subtle hover:text-foreground",
      )}
      data-active={item.active ? "true" : "false"}
    >
      <Icon
        className={cn("size-4 shrink-0", item.active ? "text-primary" : "text-muted")}
        aria-hidden="true"
      />
      <span>{item.label}</span>
    </div>
  );
}

function Badge({
  children,
  variant = "neutral",
  dot = false,
}: {
  children: ReactNode;
  variant?: BadgeVariant;
  dot?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium leading-[18px] tracking-[0.01em]",
        badgeVariantClasses[variant],
      )}
    >
      {dot ? <span className="size-1.5 rounded-full bg-current" /> : null}
      {children}
    </span>
  );
}

function LogoTile({ children }: { children: ReactNode }) {
  return (
    <div className="flex size-6 shrink-0 items-center justify-center rounded-md border border-border bg-background text-[10px] font-bold text-foreground">
      {children}
    </div>
  );
}

function MicrosoftLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 21 21" className={className} aria-hidden="true">
      <rect x="1" y="1" width="9" height="9" fill="currentColor" />
      <rect x="11" y="1" width="9" height="9" fill="currentColor" />
      <rect x="1" y="11" width="9" height="9" fill="currentColor" />
      <rect x="11" y="11" width="9" height="9" fill="currentColor" />
    </svg>
  );
}

function GoogleLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="currentColor"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="currentColor"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22z"
        fill="currentColor"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="currentColor"
      />
    </svg>
  );
}

function AppleLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        d="M17.05 12.04c-.03-2.99 2.44-4.43 2.55-4.5-1.39-2.04-3.56-2.32-4.33-2.35-1.84-.19-3.6 1.09-4.54 1.09-.95 0-2.39-1.07-3.93-1.04-2.02.03-3.88 1.18-4.92 2.99-2.1 3.64-.54 9.02 1.51 11.97 1 1.45 2.19 3.07 3.74 3.01 1.5-.06 2.07-.97 3.88-.97 1.81 0 2.31.97 3.89.94 1.61-.03 2.62-1.46 3.6-2.92 1.14-1.67 1.6-3.31 1.63-3.39-.04-.02-3.13-1.2-3.16-4.77zM14.16 3.18c.83-1.01 1.39-2.4 1.24-3.8-1.2.05-2.66.8-3.51 1.8-.77.89-1.45 2.32-1.27 3.69 1.33.1 2.7-.68 3.54-1.69z"
        fill="currentColor"
      />
    </svg>
  );
}

function WhatsAppLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M17.5 14.4c-.3-.2-1.8-.9-2.1-1-.3-.1-.5-.2-.7.2-.2.3-.8 1-1 1.2-.2.2-.4.2-.7 0-.3-.2-1.2-.4-2.3-1.4-.9-.8-1.4-1.7-1.6-2-.2-.3 0-.5.1-.6.1-.1.3-.4.4-.5.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5-.1-.2-.7-1.6-.9-2.2-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.4 0 1.4 1 2.8 1.2 3 .2.2 2.1 3.2 5 4.5.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.8-.7 2-1.5.2-.7.2-1.4.2-1.5-.1-.1-.3-.2-.6-.3z"
        fill="currentColor"
      />
    </svg>
  );
}

function IntegrationCard({ integration }: { integration: Integration }) {
  return (
    <Card className="rounded-lg border-border bg-background p-4 transition-colors hover:border-border-strong">
      <div className="flex items-start gap-3">
        <div className="shrink-0">{integration.icon}</div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <div className="truncate text-[14px] font-semibold text-foreground">
              {integration.name}
            </div>
            <Badge variant={integration.statusVariant} dot={integration.statusDot}>
              {integration.status}
            </Badge>
          </div>
          <div className="mt-0.5 text-[12px] text-muted">{integration.description}</div>
          <div className="mt-2 text-[11px] leading-relaxed text-muted">{integration.detail}</div>
          <div className="mt-3 flex items-center gap-2">
            {integration.connected ? (
              <>
                <Button
                  type="button"
                  variant="secondary"
                  className="h-auto px-3.5 py-[7px] text-[12px] focus-visible:ring-foreground"
                >
                  Configure
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="h-auto px-2.5 py-1.5 text-[12px] text-secondary hover:bg-hover hover:text-foreground focus-visible:ring-foreground"
                >
                  Logs
                </Button>
              </>
            ) : (
              <Button
                type="button"
                className="h-auto bg-primary px-3.5 py-[7px] text-[12px] text-background hover:bg-primary-hover"
              >
                Connect
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

function Phase2Panel({ title, description }: { title: string; description: string }) {
  return (
    <div className="max-w-[1100px] px-8 py-6" data-settings-panel={title}>
      <div className="mb-6">
        <h1 className="font-display text-[22px] font-semibold tracking-tight text-foreground">
          {title}
        </h1>
        <p className="mt-1 text-[13px] text-muted">{description}</p>
      </div>
      <Card className="rounded-lg border-border bg-background">
        <CardContent className="px-[18px] py-6">
          <div className="flex items-start gap-3">
            <div className="flex size-8 items-center justify-center rounded-lg bg-border-subtle text-secondary">
              <CircleHelp className={iconClass} aria-hidden="true" />
            </div>
            <div>
              <div className="text-[14px] font-semibold text-foreground">Coming in Phase 2</div>
              <div className="mt-1 text-[12px] text-muted">
                {title} ships in the post-launch Phase 2 release. The locked Wave-1 build wires
                the surfaces it depends on (auth, billing, audit pipeline) but the configuration
                UI lands later.
              </div>
              <Button
                type="button"
                variant="secondary"
                disabled
                aria-disabled="true"
                data-disabled="true"
                title="Coming in Phase 2"
                className="mt-4 h-auto gap-1.5 px-3.5 py-[7px] text-[13px] focus-visible:ring-foreground"
              >
                Open {title.toLowerCase()}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function GeneralPanel() {
  const [workspaceName, setWorkspaceName] = useState("DesignersMeet HQ");
  const [subdomain, setSubdomain] = useState("designersmeet");
  const [saved, setSaved] = useState(false);
  return (
    <div className="max-w-[1100px] px-8 py-6" data-settings-panel="General">
      <div className="mb-6">
        <h1 className="font-display text-[22px] font-semibold tracking-tight text-foreground">
          General
        </h1>
        <p className="mt-1 text-[13px] text-muted">
          Workspace-wide defaults: name, subdomain, default timezone.
        </p>
      </div>
      <Card className="rounded-lg border-border bg-background">
        <CardContent className="space-y-4 px-[18px] py-5">
          <label className="block">
            <span className="text-[12px] font-medium text-secondary">Workspace name</span>
            <Input
              value={workspaceName}
              onChange={(e) => {
                setWorkspaceName(e.target.value);
                setSaved(false);
              }}
              className="mt-1 h-[34px] text-[13px]"
            />
          </label>
          <label className="block">
            <span className="text-[12px] font-medium text-secondary">Subdomain</span>
            <Input
              value={subdomain}
              onChange={(e) => {
                setSubdomain(e.target.value);
                setSaved(false);
              }}
              className="mt-1 h-[34px] text-[13px]"
            />
          </label>
          <div className="flex items-center gap-3 pt-2">
            <Button
              type="button"
              className="h-auto bg-primary px-3.5 py-[7px] text-[13px] text-background hover:bg-primary-hover"
              onClick={() => setSaved(true)}
            >
              Save changes
            </Button>
            {saved ? (
              <span className="text-[12px] text-muted" role="status">
                Saved to demo session
              </span>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function BrandingPanel() {
  const [primary, setPrimary] = useState("");
  return (
    <div className="max-w-[1100px] px-8 py-6" data-settings-panel="Branding">
      <div className="mb-6">
        <h1 className="font-display text-[22px] font-semibold tracking-tight text-foreground">
          Branding
        </h1>
        <p className="mt-1 text-[13px] text-muted">
          Logo, primary colour, and white-label preferences. Updates apply on next reload.
        </p>
      </div>
      <Card className="rounded-lg border-border bg-background">
        <CardContent className="space-y-4 px-[18px] py-5">
          <label className="block">
            <span className="text-[12px] font-medium text-secondary">Primary colour (hex)</span>
            <Input
              value={primary}
              onChange={(e) => setPrimary(e.target.value)}
              placeholder="var(--color-foreground)"
              className="mt-1 h-[34px] text-[13px]"
            />
          </label>
          <div className="flex items-center gap-3">
            <div
              className="size-8 rounded-md border border-border bg-foreground"
              style={primary ? { backgroundColor: primary } : undefined}
              aria-label="Primary colour preview"
            />
            <span className="text-[12px] text-muted">{primary || "default"}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function UsersRolesPanel() {
  const users = [
    { name: "Manish Sharma", email: "manish@designersmeet.com", role: "Owner" },
    { name: "Priya Iyer", email: "priya@designersmeet.com", role: "Admin" },
    { name: "Ravi Kumar", email: "ravi@designersmeet.com", role: "Member" },
  ];
  return (
    <div className="max-w-[1100px] px-8 py-6" data-settings-panel="Users & roles">
      <div className="mb-6 flex items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-[22px] font-semibold tracking-tight text-foreground">
            Users &amp; roles
          </h1>
          <p className="mt-1 text-[13px] text-muted">
            Workspace members and their role assignments.
          </p>
        </div>
        <Button
          type="button"
          variant="secondary"
          className="h-auto gap-1.5 px-3.5 py-[7px] text-[13px] focus-visible:ring-foreground"
          onClick={() => undefined}
        >
          <Plus className={iconClass} aria-hidden="true" />
          Invite member
        </Button>
      </div>
      <Card className="rounded-lg border-border bg-background">
        <CardContent className="p-0">
          {users.map((u) => (
            <div
              key={u.email}
              className="flex items-center gap-3 border-b border-border-subtle px-5 py-3 last:border-b-0"
            >
              <Avatar>{u.name.slice(0, 2).toUpperCase()}</Avatar>
              <div className="flex-1">
                <div className="text-[13px] font-semibold text-foreground">{u.name}</div>
                <div className="text-[11px] text-muted">{u.email}</div>
              </div>
              <Badge variant={u.role === "Owner" ? "success" : "neutral"} dot={u.role === "Owner"}>
                {u.role}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function SsoProvidersPanel() {
  return (
    <div className="max-w-[1100px] px-8 py-6" data-settings-panel="SSO providers">
      <div className="mb-6">
        <h1 className="font-display text-[22px] font-semibold tracking-tight text-foreground">
          SSO providers
        </h1>
        <p className="mt-1 text-[13px] text-muted">
          Identity providers wired at launch. Same SSO surface as the Integrations card.
        </p>
      </div>
      <Card className="rounded-lg border-border bg-background">
        <CardContent className="p-[18px]">
          <div className="grid grid-cols-3 gap-3">
            {[
              { logo: <MicrosoftLogo className="size-5 text-foreground" />, name: "Microsoft Entra ID", sub: "Multi-tenant · admin consented" },
              { logo: <GoogleLogo className="size-5 text-foreground" />, name: "Google Identity", sub: "OAuth · openid email profile" },
              { logo: <AppleLogo className="size-5 text-foreground" />, name: "Sign in with Apple", sub: "Services ID configured" },
            ].map((p) => (
              <div key={p.name} className="rounded-lg border border-border p-4">
                <div className="mb-3 flex items-start justify-between">
                  {p.logo}
                  <Badge variant="success" dot>
                    Enabled
                  </Badge>
                </div>
                <div className="text-[13px] font-semibold text-foreground">{p.name}</div>
                <div className="mt-0.5 text-[11px] text-muted">{p.sub}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Wave-A: live subscription to demoStore ────────────────────────────────
// Tiny hook that re-renders on demoStore.notify() so panels reading from the
// raw store (workspaces, audit_events, plan, invoices, teams) reflect writes
// outside the react-query path.
function useDemoStoreTick(): number {
  const [tick, force] = useReducer((n: number) => n + 1, 0);
  useEffect(() => demoStore.subscribe(() => force()), []);
  return tick;
}

interface WorkspaceRow {
  id: string;
  name: string;
  slug: string;
  members_count?: number;
  region?: string;
  active?: boolean;
  created_at?: string;
}

function WorkspacesPanel() {
  useDemoStoreTick();
  const [draftName, setDraftName] = useState("");
  const [draftSlug, setDraftSlug] = useState("");
  const [showNew, setShowNew] = useState(false);

  const rows = (demoStore.list("workspaces").data as unknown as WorkspaceRow[]) ?? [];
  const currentId = demoStore.getCurrentWorkspaceId();

  function submit() {
    const name = draftName.trim();
    const slug = (draftSlug.trim() || name.toLowerCase().replace(/\s+/g, "-")).slice(0, 32);
    if (!name) return;
    demoStore.create("workspaces", {
      name,
      slug,
      members_count: 1,
      region: "—",
      active: false,
    });
    setDraftName("");
    setDraftSlug("");
    setShowNew(false);
  }

  return (
    <div className="max-w-[1100px] px-8 py-6" data-settings-panel="Workspaces">
      <div className="mb-6 flex items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-[22px] font-semibold tracking-tight text-foreground">
            Workspaces
          </h1>
          <p className="mt-1 text-[13px] text-muted">
            {rows.length} workspace{rows.length === 1 ? "" : "s"} · click <em>Make active</em> to scope new records to it
          </p>
        </div>
        <Button
          type="button"
          variant="secondary"
          className="h-auto gap-1.5 px-3.5 py-[7px] text-[13px] focus-visible:ring-foreground"
          onClick={() => setShowNew((v) => !v)}
        >
          <Plus className={iconClass} aria-hidden="true" />
          New workspace
        </Button>
      </div>

      {showNew ? (
        <Card className="mb-4 rounded-lg border-border bg-background">
          <CardContent className="space-y-3 px-[18px] py-4">
            <label className="block">
              <span className="text-[12px] font-medium text-secondary">Name</span>
              <Input
                value={draftName}
                onChange={(e) => setDraftName(e.target.value)}
                placeholder="DesignersMeet Mumbai"
                className="mt-1 h-[34px] text-[13px]"
              />
            </label>
            <label className="block">
              <span className="text-[12px] font-medium text-secondary">Slug</span>
              <Input
                value={draftSlug}
                onChange={(e) => setDraftSlug(e.target.value)}
                placeholder="dm-mumbai"
                className="mt-1 h-[34px] text-[13px]"
              />
            </label>
            <div className="flex items-center gap-2 pt-1">
              <Button
                type="button"
                onClick={submit}
                className="h-auto bg-primary px-3.5 py-[7px] text-[13px] text-background hover:bg-primary-hover"
              >
                Create workspace
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setShowNew(false);
                  setDraftName("");
                  setDraftSlug("");
                }}
                className="h-auto px-3 py-[7px] text-[13px] text-secondary"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <Card className="rounded-lg border-border bg-background">
        <CardContent className="p-0">
          {rows.map((w) => {
            const isCurrent = w.id === currentId;
            const initials = w.name
              .split(/\s+/)
              .map((p) => p[0] ?? "")
              .join("")
              .slice(0, 2)
              .toUpperCase();
            return (
              <div
                key={w.id}
                data-workspace-id={w.id}
                data-workspace-active={isCurrent ? "true" : "false"}
                className="flex items-center gap-3 border-b border-border-subtle px-5 py-3 last:border-b-0"
              >
                <div className="flex size-8 shrink-0 items-center justify-center rounded-md border border-border bg-background text-[11px] font-bold text-foreground">
                  {initials}
                </div>
                <div className="flex-1">
                  <div className="text-[13px] font-semibold text-foreground">{w.name}</div>
                  <div className="text-[11px] text-muted">
                    {w.members_count ?? 0} members
                    {w.region ? ` · ${w.region}` : ""}
                    {w.slug ? ` · ${w.slug}` : ""}
                  </div>
                </div>
                {isCurrent ? (
                  <Badge variant="success" dot>
                    Active
                  </Badge>
                ) : (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => demoStore.setCurrentWorkspace(w.id)}
                    className="h-auto px-2.5 py-1.5 text-[12px] text-secondary hover:bg-hover hover:text-foreground focus-visible:ring-foreground"
                  >
                    Make active
                  </Button>
                )}
                {!isCurrent ? (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => demoStore.remove("workspaces", w.id)}
                    title="Delete workspace"
                    aria-label="Delete workspace"
                    className="h-auto px-2 py-1.5 text-[12px] text-secondary hover:bg-hover hover:text-destructive focus-visible:ring-foreground"
                  >
                    <Trash2 className={iconClass} aria-hidden="true" />
                  </Button>
                ) : null}
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────
// Wave-A Phase-2 panels (Audit log, Locale & time, Teams, Plan & usage,
// Invoices, Vendor portal). Each renders inside the locked Settings right-
// pane slot — no chrome / sidebar / header DOM changes.
// ────────────────────────────────────────────────────────────────────────

interface AuditEventRow {
  id: string;
  actor: string;
  action: string;
  target_type: string;
  target_id: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

function AuditLogPanel() {
  useDemoStoreTick();
  const events = demoStore.auditTail(100) as unknown as AuditEventRow[];

  const [actionFilter, setActionFilter] = useState<string>("all");
  const [actorFilter, setActorFilter] = useState<string>("all");
  const [dateBucket, setDateBucket] = useState<"all" | "1h" | "24h" | "7d">("all");

  const actors = useMemo(() => Array.from(new Set(events.map((e) => e.actor))), [events]);
  const actions = useMemo(() => Array.from(new Set(events.map((e) => e.action))), [events]);

  const filtered = useMemo(() => {
    const now = Date.now();
    const bucketMs =
      dateBucket === "1h" ? 60 * 60_000 :
      dateBucket === "24h" ? 24 * 60 * 60_000 :
      dateBucket === "7d" ? 7 * 24 * 60 * 60_000 : Number.POSITIVE_INFINITY;
    return events.filter((e) => {
      if (actionFilter !== "all" && e.action !== actionFilter) return false;
      if (actorFilter !== "all" && e.actor !== actorFilter) return false;
      const ts = new Date(e.timestamp).getTime();
      if (Number.isFinite(bucketMs) && now - ts > bucketMs) return false;
      return true;
    });
  }, [events, actionFilter, actorFilter, dateBucket]);

  return (
    <div className="max-w-[1100px] px-8 py-6" data-settings-panel="Audit log">
      <div className="mb-6 flex items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-[22px] font-semibold tracking-tight text-foreground">
            Audit log
          </h1>
          <p className="mt-1 text-[13px] text-muted">
            Last 100 mutations across this workspace · live tail
          </p>
        </div>
        <Badge variant="neutral">{filtered.length} of {events.length}</Badge>
      </div>

      <Card className="mb-3 rounded-lg border-border bg-background">
        <CardContent className="flex flex-wrap items-center gap-2 px-[18px] py-3">
          <FilterChipGroup
            label="Action"
            value={actionFilter}
            onChange={setActionFilter}
            options={["all", ...actions]}
          />
          <FilterChipGroup
            label="Actor"
            value={actorFilter}
            onChange={setActorFilter}
            options={["all", ...actors]}
          />
          <FilterChipGroup
            label="When"
            value={dateBucket}
            onChange={(v) => setDateBucket(v as typeof dateBucket)}
            options={["all", "1h", "24h", "7d"]}
            labelFor={(v) =>
              v === "all" ? "Anytime" :
              v === "1h" ? "Last hour" :
              v === "24h" ? "Last 24h" :
              v === "7d" ? "Last 7d" : v
            }
          />
        </CardContent>
      </Card>

      <Card className="rounded-lg border-border bg-background">
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="px-5 py-8 text-center text-[12px] text-muted">
              No audit events match the filters. Trigger a CRUD action elsewhere in Settings to populate the log.
            </div>
          ) : (
            filtered.map((e) => (
              <div
                key={e.id}
                data-audit-id={e.id}
                className="flex items-center gap-3 border-b border-border-subtle px-5 py-3 last:border-b-0"
              >
                <Avatar size="sm">
                  {e.actor.slice(0, 2).toUpperCase()}
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="truncate text-[13px] text-foreground">
                    <span className="font-semibold">{e.actor}</span>
                    <span className="text-muted"> · {e.action}</span>
                    <span className="text-muted"> on </span>
                    <span className="font-medium">{e.target_type}</span>
                    <span className="text-muted"> · </span>
                    <span className="text-[12px] text-muted">{e.target_id}</span>
                  </div>
                  {e.metadata && Object.keys(e.metadata).length > 0 ? (
                    <div className="mt-0.5 truncate text-[11px] text-muted">
                      {Object.entries(e.metadata)
                        .map(([k, v]) => `${k}: ${JSON.stringify(v)}`)
                        .join(" · ")}
                    </div>
                  ) : null}
                </div>
                <span className="text-[11px] text-muted">
                  {new Date(e.timestamp).toLocaleString()}
                </span>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function FilterChipGroup({
  label,
  value,
  onChange,
  options,
  labelFor,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  labelFor?: (v: string) => string;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[11px] font-medium uppercase tracking-wider text-muted">{label}</span>
      {options.map((opt) => {
        const text = labelFor ? labelFor(opt) : opt === "all" ? "All" : opt;
        const active = opt === value;
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            data-active={active ? "true" : "false"}
            className={cn(
              "h-auto rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors",
              active
                ? "bg-primary-tint text-primary"
                : "bg-border-subtle text-secondary hover:bg-hover hover:text-foreground",
            )}
          >
            {text}
          </button>
        );
      })}
    </div>
  );
}

function LocaleTimePanel() {
  const [prefs, setPrefs] = usePreferences();
  const { formatDate } = useDatePreference();
  const [saved, setSaved] = useState(false);

  function save<K extends keyof typeof prefs>(key: K, value: (typeof prefs)[K]) {
    setPrefs({ [key]: value } as Partial<typeof prefs>);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1600);
  }

  return (
    <div className="max-w-[1100px] px-8 py-6" data-settings-panel="Locale & time">
      <div className="mb-6">
        <h1 className="font-display text-[22px] font-semibold tracking-tight text-foreground">
          Locale &amp; time
        </h1>
        <p className="mt-1 text-[13px] text-muted">
          Defaults for the whole demo session · persisted to your browser
        </p>
      </div>

      <Card className="rounded-lg border-border bg-background">
        <CardContent className="space-y-4 px-[18px] py-5">
          <label className="block">
            <span className="text-[12px] font-medium text-secondary">Timezone</span>
            <select
              value={prefs.timezone}
              onChange={(e) => save("timezone", e.target.value)}
              className="mt-1 h-[34px] w-full rounded-md border border-border-strong bg-background px-2 text-[13px] text-foreground focus:border-foreground focus:outline-none"
            >
              {TIMEZONES.map((tz) => (
                <option key={tz} value={tz}>{tz}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-[12px] font-medium text-secondary">Language</span>
            <select
              value={prefs.language}
              onChange={(e) => save("language", e.target.value as typeof prefs.language)}
              className="mt-1 h-[34px] w-full rounded-md border border-border-strong bg-background px-2 text-[13px] text-foreground focus:border-foreground focus:outline-none"
            >
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>{l.label}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-[12px] font-medium text-secondary">Date format</span>
            <select
              value={prefs.dateFormat}
              onChange={(e) => save("dateFormat", e.target.value as typeof prefs.dateFormat)}
              className="mt-1 h-[34px] w-full rounded-md border border-border-strong bg-background px-2 text-[13px] text-foreground focus:border-foreground focus:outline-none"
            >
              {DATE_FORMATS.map((f) => (
                <option key={f.code} value={f.code}>{f.label}</option>
              ))}
            </select>
          </label>
          <div className="rounded-md border border-border-subtle bg-border-subtle/40 px-3 py-2 text-[12px] text-secondary">
            Today renders as <span className="font-semibold text-foreground">{formatDate(new Date())}</span>
            {saved ? <span className="ml-2 text-primary">· Saved</span> : null}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Team-color palette resolves to design tokens (no raw hex — passes the
// dm/no-raw-color guard). Each entry references a `--color-*` CSS variable
// already declared in src/styles/tokens.css. Keeps Style Dictionary as the
// single source of truth for every renderable colour.
const TEAM_COLORS = [
  "var(--color-foreground)",
  "var(--color-primary)",
  "var(--color-info)",
  "var(--color-success)",
  "var(--color-warning)",
  "var(--color-danger)",
  "var(--color-secondary)",
  "var(--color-muted)",
];

interface TeamRow {
  id: string;
  name: string;
  color: string;
  members: string[];
  workspace_id?: string;
}

interface UserRow {
  id: string;
  name: string;
  email: string;
  role: string;
}

function TeamsPanel() {
  useDemoStoreTick();
  const [showNew, setShowNew] = useState(false);
  const [draftName, setDraftName] = useState("");
  const [draftColor, setDraftColor] = useState(TEAM_COLORS[0]);
  const [draftMembers, setDraftMembers] = useState<string[]>([]);
  const wsId = demoStore.getCurrentWorkspaceId();

  const teams = (demoStore.list("teams").data as unknown as TeamRow[]) ?? [];
  const users = (demoStore.list("users").data as unknown as UserRow[]) ?? [];
  const scoped = teams.filter((t) => !t.workspace_id || t.workspace_id === wsId);

  function submit() {
    const name = draftName.trim();
    if (!name) return;
    demoStore.create("teams", {
      name,
      color: draftColor,
      members: draftMembers,
      workspace_id: wsId,
    });
    setDraftName("");
    setDraftColor(TEAM_COLORS[0]);
    setDraftMembers([]);
    setShowNew(false);
  }

  function toggleMember(uid: string, current: string[], teamId?: string) {
    const next = current.includes(uid) ? current.filter((x) => x !== uid) : [...current, uid];
    if (teamId) demoStore.update("teams", teamId, { members: next });
    return next;
  }

  return (
    <div className="max-w-[1100px] px-8 py-6" data-settings-panel="Teams">
      <div className="mb-6 flex items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-[22px] font-semibold tracking-tight text-foreground">
            Teams
          </h1>
          <p className="mt-1 text-[13px] text-muted">
            {scoped.length} team{scoped.length === 1 ? "" : "s"} · assignable on projects and contacts
          </p>
        </div>
        <Button
          type="button"
          variant="secondary"
          className="h-auto gap-1.5 px-3.5 py-[7px] text-[13px] focus-visible:ring-foreground"
          onClick={() => setShowNew((v) => !v)}
        >
          <Plus className={iconClass} aria-hidden="true" />
          New team
        </Button>
      </div>

      {showNew ? (
        <Card className="mb-4 rounded-lg border-border bg-background">
          <CardContent className="space-y-3 px-[18px] py-4">
            <label className="block">
              <span className="text-[12px] font-medium text-secondary">Team name</span>
              <Input
                value={draftName}
                onChange={(e) => setDraftName(e.target.value)}
                placeholder="Procurement"
                className="mt-1 h-[34px] text-[13px]"
              />
            </label>
            <div>
              <span className="text-[12px] font-medium text-secondary">Color</span>
              <div className="mt-1 flex flex-wrap gap-2">
                {TEAM_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setDraftColor(c)}
                    aria-label={`Color ${c}`}
                    title={c}
                    data-active={draftColor === c ? "true" : "false"}
                    className={cn(
                      "size-6 rounded-md ring-offset-2 transition-shadow",
                      draftColor === c ? "ring-2 ring-foreground" : "",
                    )}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
            <div>
              <span className="text-[12px] font-medium text-secondary">Members</span>
              <div className="mt-1 flex flex-wrap gap-2">
                {users.map((u) => {
                  const selected = draftMembers.includes(u.id);
                  return (
                    <button
                      key={u.id}
                      type="button"
                      data-active={selected ? "true" : "false"}
                      onClick={() => setDraftMembers((cur) => toggleMember(u.id, cur))}
                      className={cn(
                        "rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors",
                        selected
                          ? "bg-primary-tint text-primary"
                          : "bg-border-subtle text-secondary hover:bg-hover hover:text-foreground",
                      )}
                    >
                      {u.name}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <Button
                type="button"
                onClick={submit}
                className="h-auto bg-primary px-3.5 py-[7px] text-[13px] text-background hover:bg-primary-hover"
              >
                Create team
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setShowNew(false);
                  setDraftName("");
                  setDraftMembers([]);
                }}
                className="h-auto px-3 py-[7px] text-[13px] text-secondary"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <Card className="rounded-lg border-border bg-background">
        <CardContent className="p-0">
          {scoped.length === 0 ? (
            <div className="px-5 py-8 text-center text-[12px] text-muted">
              No teams yet. Click <em>New team</em> to create one for this workspace.
            </div>
          ) : (
            scoped.map((t) => (
              <div
                key={t.id}
                data-team-id={t.id}
                className="flex items-center gap-3 border-b border-border-subtle px-5 py-3 last:border-b-0"
              >
                <div className="size-3 shrink-0 rounded-full" style={{ backgroundColor: t.color }} />
                <div className="flex-1">
                  <div className="text-[13px] font-semibold text-foreground">{t.name}</div>
                  <div className="text-[11px] text-muted">
                    {t.members.length} member{t.members.length === 1 ? "" : "s"}
                    {t.members.length > 0
                      ? ` · ${t.members
                          .map((m) => users.find((u) => u.id === m)?.name ?? m)
                          .join(", ")}`
                      : ""}
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => demoStore.remove("teams", t.id)}
                  aria-label="Delete team"
                  title="Delete team"
                  className="h-auto px-2 py-1.5 text-[12px] text-secondary hover:bg-hover hover:text-destructive focus-visible:ring-foreground"
                >
                  <Trash2 className={iconClass} aria-hidden="true" />
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}

interface PlanRow {
  id: string;
  name: string;
  seats_used: number; seats_total: number;
  projects_used: number; projects_limit: number;
  storage_gb_used: number; storage_gb_limit: number;
  ai_credits_used: number; ai_credits_cap: number;
  renews_on: string;
}

function PlanUsagePanel() {
  useDemoStoreTick();
  const plan = (demoStore.list("plan").data as unknown as PlanRow[])[0];
  const [showUpgrade, setShowUpgrade] = useState(false);
  if (!plan) return null;

  return (
    <div className="max-w-[1100px] px-8 py-6" data-settings-panel="Plan & usage">
      <div className="mb-6 flex items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-[22px] font-semibold tracking-tight text-foreground">
            Plan &amp; usage
          </h1>
          <p className="mt-1 text-[13px] text-muted">
            Current plan: <span className="font-semibold text-foreground">{plan.name}</span> · renews {plan.renews_on}
          </p>
        </div>
        <Button
          type="button"
          onClick={() => setShowUpgrade(true)}
          className="h-auto bg-primary px-3.5 py-[7px] text-[13px] text-background hover:bg-primary-hover"
        >
          Upgrade plan
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <PlanMeter label="Seats" used={plan.seats_used} limit={plan.seats_total} unit="" />
        <PlanMeter label="Projects" used={plan.projects_used} limit={plan.projects_limit} unit="" />
        <PlanMeter label="Storage" used={plan.storage_gb_used} limit={plan.storage_gb_limit} unit=" GB" />
        <PlanMeter label="AI credits" used={plan.ai_credits_used} limit={plan.ai_credits_cap} unit="" />
      </div>

      {showUpgrade ? <UpgradeModal onClose={() => setShowUpgrade(false)} /> : null}
    </div>
  );
}

function PlanMeter({ label, used, limit, unit }: { label: string; used: number; limit: number; unit: string }) {
  const pct = Math.min(100, Math.max(0, Math.round((used / limit) * 100)));
  const overHalf = pct >= 50;
  const overEighty = pct >= 80;
  return (
    <Card className="rounded-lg border-border bg-background" data-plan-meter={label}>
      <CardContent className="px-[18px] py-4">
        <div className="flex items-baseline justify-between">
          <div className="text-[13px] font-semibold text-foreground">{label}</div>
          <div className="text-[12px] text-muted">
            <span className="font-semibold text-foreground">{used.toLocaleString()}{unit}</span>
            {" / "}
            {limit.toLocaleString()}{unit}
          </div>
        </div>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-border-subtle">
          <div
            className={cn(
              "h-full rounded-full transition-[width]",
              overEighty ? "bg-warning" : overHalf ? "bg-primary" : "bg-primary",
            )}
            style={{ width: `${pct}%` }}
            data-pct={pct}
          />
        </div>
        <div className="mt-1 text-[11px] text-muted">{pct}% used</div>
      </CardContent>
    </Card>
  );
}

const PLAN_TIERS = [
  { name: "Solo", price: "₹2,900/mo", seats: 1, features: ["1 workspace", "10 projects", "10 GB storage", "Email support"] },
  { name: "Studio", price: "₹7,900/mo", seats: 12, features: ["3 workspaces", "50 projects", "100 GB storage", "Priority support", "Audit log"], current: true },
  { name: "Agency", price: "₹19,900/mo", seats: 40, features: ["Unlimited workspaces", "Unlimited projects", "1 TB storage", "Custom SSO", "Webhooks"] },
  { name: "Enterprise", price: "Contact us", seats: 9999, features: ["Dedicated CSM", "On-prem option", "SLA-backed support", "Custom integrations"] },
];

function UpgradeModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-[10000] flex items-start justify-center overflow-auto bg-foreground/40 px-4 py-12"
      role="dialog"
      aria-modal="true"
      aria-label="Upgrade plan"
      onClick={onClose}
      data-upgrade-modal="true"
    >
      <div
        className="w-full max-w-[920px] rounded-lg border border-border bg-background shadow-pop"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <div className="text-[15px] font-semibold text-foreground">Upgrade your plan</div>
            <div className="text-[12px] text-muted">Demo only · no real billing happens</div>
          </div>
          <IconButton title="Close" onClick={onClose}>
            <X className={iconClass} aria-hidden="true" />
          </IconButton>
        </div>
        <div className="grid grid-cols-4 gap-3 px-5 py-5">
          {PLAN_TIERS.map((tier) => (
            <div
              key={tier.name}
              data-tier={tier.name}
              data-current={tier.current ? "true" : "false"}
              className={cn(
                "rounded-lg border p-4",
                tier.current ? "border-primary bg-primary-tint/20" : "border-border bg-background",
              )}
            >
              <div className="flex items-baseline justify-between">
                <div className="text-[14px] font-semibold text-foreground">{tier.name}</div>
                {tier.current ? <Badge variant="success">Current</Badge> : null}
              </div>
              <div className="mt-1 text-[12px] text-muted">{tier.price}</div>
              <ul className="mt-3 space-y-1.5 text-[12px] text-secondary">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-1.5">
                    <CheckCircle2 className="mt-[1px] size-3.5 shrink-0 text-primary" aria-hidden="true" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
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

function InvoicesPanel() {
  useDemoStoreTick();
  const invoices = (demoStore.list("invoices").data as unknown as InvoiceRow[]) ?? [];

  return (
    <div className="max-w-[1100px] px-8 py-6" data-settings-panel="Invoices">
      <div className="mb-6">
        <h1 className="font-display text-[22px] font-semibold tracking-tight text-foreground">
          Invoices
        </h1>
        <p className="mt-1 text-[13px] text-muted">
          {invoices.length} invoice{invoices.length === 1 ? "" : "s"} · click <em>Download</em> for the PDF
        </p>
      </div>

      <Card className="rounded-lg border-border bg-background">
        <CardContent className="p-0">
          {invoices.map((inv) => {
            const statusVariant: BadgeVariant = inv.status === "paid" ? "success" : "neutral";
            return (
              <div
                key={inv.id}
                data-invoice-id={inv.id}
                data-invoice-status={inv.status}
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
                    {inv.paid_at ? ` · Paid ${inv.paid_at.slice(0, 10)}` : ""}
                  </div>
                </div>
                <Badge variant={statusVariant} dot={inv.status !== "paid"}>
                  {inv.status === "paid" ? "Paid" : inv.status === "due" ? "Due" : "Overdue"}
                </Badge>
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
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}

function VendorPortalAdminPanel() {
  useDemoStoreTick();
  const vendors = (demoStore.list("vendors").data as Array<{ id: string; name: string; tier: string; status: string }>) ?? [];
  const invited = vendors.filter((v) => v.status === "Active").length;

  return (
    <div className="max-w-[1100px] px-8 py-6" data-settings-panel="Vendor portal">
      <div className="mb-6 flex items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-[22px] font-semibold tracking-tight text-foreground">
            Vendor portal
          </h1>
          <p className="mt-1 text-[13px] text-muted">
            Read-only view at <code className="rounded bg-border-subtle px-1.5 py-0.5 text-[11px]">/vendor</code> — vendors see only their assigned projects, conversations, deliverables, and issued invoices.
          </p>
        </div>
        <a
          href="/vendor"
          data-open-vendor-view="true"
          className="inline-flex h-auto items-center gap-1.5 rounded-md bg-primary px-3.5 py-[7px] text-[13px] font-medium text-background hover:bg-primary-hover focus-visible:ring-foreground"
        >
          <ExternalLink className={iconClass} aria-hidden="true" />
          Open vendor view
        </a>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Card className="rounded-lg border-border bg-background">
          <CardContent className="px-[18px] py-4">
            <div className="text-[12px] text-muted">Vendors connected</div>
            <div className="mt-1 text-[22px] font-semibold text-foreground">{invited}</div>
          </CardContent>
        </Card>
        <Card className="rounded-lg border-border bg-background">
          <CardContent className="px-[18px] py-4">
            <div className="text-[12px] text-muted">Invitations sent (30d)</div>
            <div className="mt-1 text-[22px] font-semibold text-foreground">14</div>
          </CardContent>
        </Card>
        <Card className="rounded-lg border-border bg-background">
          <CardContent className="px-[18px] py-4">
            <div className="text-[12px] text-muted">Open deliverables</div>
            <div className="mt-1 text-[22px] font-semibold text-foreground">
              {(demoStore.list("vendor_deliverables").data as unknown as Array<{ status: string }>).filter((d) => d.status !== "approved").length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-4 rounded-lg border-border bg-background">
        <CardContent className="p-0">
          {vendors.slice(0, 6).map((v) => (
            <div
              key={v.id}
              data-vendor-row={v.id}
              className="flex items-center gap-3 border-b border-border-subtle px-5 py-3 last:border-b-0"
            >
              <Avatar size="sm">{v.name.slice(0, 2).toUpperCase()}</Avatar>
              <div className="flex-1">
                <div className="text-[13px] font-semibold text-foreground">{v.name}</div>
                <div className="text-[11px] text-muted">{v.tier} · {v.status}</div>
              </div>
              <Button
                type="button"
                variant="ghost"
                onClick={() => demoStore.create("vendor_invitations", { vendor_id: v.id, invited_at: new Date().toISOString() })}
                className="h-auto px-2.5 py-1.5 text-[12px] text-secondary hover:bg-hover hover:text-foreground focus-visible:ring-foreground"
              >
                Send invitation
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

export default function Settings() {
  const [activeItem, setActiveItem] = useState<string>(DEFAULT_SETTINGS_ITEM);

  const sectionsWithActive: SettingsSection[] = settingsSections.map((s) => ({
    ...s,
    items: s.items.map((it) => ({ ...it, active: it.label === activeItem })),
  }));

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
            <span className="text-muted">Settings</span>
            <ChevronRight className="size-4 text-disabled" aria-hidden="true" />
            <span className="font-medium text-foreground">{activeItem}</span>
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

        <main className="flex-1 overflow-auto bg-background">
          <div className="flex h-full">
            <aside className="w-[220px] overflow-y-auto border-r border-border px-2 py-4">
              {sectionsWithActive.map((section) => (
                <div key={section.label}>
                  <div className="mb-1 mt-3 px-3 text-[10.5px] font-semibold uppercase tracking-wider text-muted">
                    {section.label}
                  </div>
                  {section.items.map((item) => (
                    <SidebarNavItem
                      key={item.label}
                      item={item}
                      onClick={() => setActiveItem(item.label)}
                    />
                  ))}
                </div>
              ))}
            </aside>

            <div className="flex-1 overflow-auto">
              {activeItem === "General" ? (
                <GeneralPanel />
              ) : activeItem === "Branding" ? (
                <BrandingPanel />
              ) : activeItem === "Workspaces" ? (
                <WorkspacesPanel />
              ) : activeItem === "Users & roles" ? (
                <UsersRolesPanel />
              ) : activeItem === "SSO providers" ? (
                <SsoProvidersPanel />
              ) : activeItem === "Audit log" ? (
                <AuditLogPanel />
              ) : activeItem === "Locale & time" ? (
                <LocaleTimePanel />
              ) : activeItem === "Teams" ? (
                <TeamsPanel />
              ) : activeItem === "Plan & usage" ? (
                <PlanUsagePanel />
              ) : activeItem === "Invoices" ? (
                <InvoicesPanel />
              ) : activeItem === "Vendor portal" ? (
                <VendorPortalAdminPanel />
              ) : activeItem !== DEFAULT_SETTINGS_ITEM ? (
                <Phase2Panel
                  title={activeItem}
                  description={`${activeItem} configuration is scoped for the Phase 2 release.`}
                />
              ) : (
              <div className="max-w-[1100px] px-8 py-6">
                <div className="mb-6">
                  <h1 className="font-display text-[22px] font-semibold tracking-tight text-foreground">
                    Integrations
                  </h1>
                  <p className="mt-1 text-[13px] text-muted">
                    Connect Microsoft 365, Google Workspace, Shopify, Meta, and others. Your
                    workflows and email actions resolve through these.
                  </p>
                </div>

                <Card className="mb-6 rounded-lg border-border bg-background">
                  <CardHeader className="px-[18px] py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="flex size-8 items-center justify-center rounded-lg bg-border-subtle text-secondary">
                        <ShieldCheck className={iconClass} aria-hidden="true" />
                      </div>
                      <div>
                        <div className="text-[14px] font-semibold text-foreground">
                          Single sign-on (SSO)
                        </div>
                        <div className="text-[12px] text-muted">
                          All three providers wired at launch · users can link multiple identities
                        </div>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="secondary"
                      className="h-auto gap-1.5 px-3.5 py-[7px] text-[13px] focus-visible:ring-foreground"
                    >
                      <SettingsIcon className={iconClass} aria-hidden="true" />
                      Configure
                    </Button>
                  </CardHeader>
                  <CardContent className="p-[18px]">
                    <div className="grid grid-cols-3 gap-3">
                      <div className="rounded-lg border border-border p-4">
                        <div className="mb-3 flex items-start justify-between">
                          <MicrosoftLogo className="size-5 text-foreground" />
                          <Badge variant="success" dot>
                            Enabled
                          </Badge>
                        </div>
                        <div className="text-[13px] font-semibold text-foreground">
                          Microsoft Entra ID
                        </div>
                        <div className="mt-0.5 text-[11px] text-muted">
                          Multi-tenant · admin consented
                        </div>
                        <div className="mt-2 text-[11px] text-muted">
                          Default for Outlook/Teams users
                        </div>
                      </div>

                      <div className="rounded-lg border border-border p-4">
                        <div className="mb-3 flex items-start justify-between">
                          <GoogleLogo className="size-5 text-foreground" />
                          <Badge variant="success" dot>
                            Enabled
                          </Badge>
                        </div>
                        <div className="text-[13px] font-semibold text-foreground">
                          Google Identity
                        </div>
                        <div className="mt-0.5 text-[11px] text-muted">
                          OAuth · openid email profile
                        </div>
                        <div className="mt-2 text-[11px] text-muted">For Workspace tenants</div>
                      </div>

                      <div className="rounded-lg border border-border p-4">
                        <div className="mb-3 flex items-start justify-between">
                          <AppleLogo className="size-5 text-foreground" />
                          <Badge variant="success" dot>
                            Enabled
                          </Badge>
                        </div>
                        <div className="text-[13px] font-semibold text-foreground">
                          Sign in with Apple
                        </div>
                        <div className="mt-0.5 text-[11px] text-muted">
                          Services ID configured
                        </div>
                        <div className="mt-2 text-[11px] text-muted">
                          Fallback for personal accounts
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="mb-6 rounded-lg border-border bg-background">
                  <CardHeader className="px-[18px] py-3.5">
                    <div>
                      <div className="text-[14px] font-semibold text-foreground">Workspaces</div>
                      <div className="text-[12px] text-muted">
                        Multi-workspace is schema-ready · launch with one
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="secondary"
                      className="h-auto gap-1.5 px-3.5 py-[7px] text-[13px] focus-visible:ring-foreground"
                    >
                      <Plus className={iconClass} aria-hidden="true" />
                      New workspace
                    </Button>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="flex items-center gap-3 border-b border-border-subtle px-5 py-3">
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-md border border-border bg-background text-[11px] font-bold text-foreground">
                        HQ
                      </div>
                      <div className="flex-1">
                        <div className="text-[13px] font-semibold text-foreground">
                          DesignersMeet HQ
                        </div>
                        <div className="text-[11px] text-muted">
                          12 members · Bengaluru · designersmeet.com
                        </div>
                      </div>
                      <Badge variant="success" dot>
                        Active
                      </Badge>
                      <Button
                        type="button"
                        variant="ghost"
                        className="h-auto px-2.5 py-1.5 text-[13px] text-secondary hover:bg-hover hover:text-foreground focus-visible:ring-foreground"
                      >
                        Manage
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <div className="mb-6 grid grid-cols-2 gap-4">
                  {integrations.map((integration) => (
                    <IntegrationCard key={integration.name} integration={integration} />
                  ))}
                </div>
              </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
