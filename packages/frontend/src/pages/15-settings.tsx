/* Generated from brief/mockups/15-settings.html via Codex fidelity pass 2026-05-19.
 * Visual DOM untouched. Behaviour-only patch 2026-05-20 wires the secondary
 * Settings sub-menu (was decorative — clicking any of the 18 items did not
 * change `data-active` or swap the right pane). The default active selection
 * stays "Integrations", so the FIRST render is byte-identical to the locked
 * baseline. Clicking switches active state + right-pane content; items with no
 * Wave-1 implementation render a "Coming in Phase 2" panel and carry
 * data-disabled/aria-disabled so the new D-DECORATIVE probe accepts them as
 * intentionally inert (not as silent defects).
 */

import { useState, type ReactNode } from "react";
import {
  BarChart3,
  Bell,
  Building2,
  Calendar,
  ChevronDown,
  ChevronRight,
  ChevronsUpDown,
  CircleHelp,
  ClipboardList,
  CreditCard,
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
  Users,
  UsersRound,
  Webhook,
  Workflow,
  Zap,
  type LucideIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

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
      { label: "Locale & time", icon: Globe, phase2: true },
    ],
  },
  {
    label: "People",
    items: [
      { label: "Users & roles", icon: Users },
      { label: "Teams", icon: UsersRound, phase2: true },
      { label: "Vendor portal", icon: HardHat, phase2: true },
    ],
  },
  {
    label: "Identity",
    items: [
      { label: "SSO providers", icon: ShieldCheck },
      { label: "Sessions", icon: Lock, phase2: true },
      { label: "Audit log", icon: Scroll, phase2: true },
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
      { label: "Plan & usage", icon: CreditCard, phase2: true },
      { label: "Invoices", icon: Receipt, phase2: true },
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
  const [primary, setPrimary] = useState("#0F172A");
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
              className="mt-1 h-[34px] text-[13px]"
            />
          </label>
          <div className="flex items-center gap-3">
            <div
              className="size-8 rounded-md border border-border"
              style={{ backgroundColor: primary }}
              aria-label="Primary colour preview"
            />
            <span className="text-[12px] text-muted">{primary}</span>
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

function WorkspacesPanel() {
  return (
    <div className="max-w-[1100px] px-8 py-6" data-settings-panel="Workspaces">
      <div className="mb-6 flex items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-[22px] font-semibold tracking-tight text-foreground">
            Workspaces
          </h1>
          <p className="mt-1 text-[13px] text-muted">
            Multi-workspace is schema-ready · launch with one
          </p>
        </div>
        <Button
          type="button"
          variant="secondary"
          className="h-auto gap-1.5 px-3.5 py-[7px] text-[13px] focus-visible:ring-foreground"
          onClick={() => undefined}
        >
          <Plus className={iconClass} aria-hidden="true" />
          New workspace
        </Button>
      </div>
      <Card className="rounded-lg border-border bg-background">
        <CardContent className="p-0">
          <div className="flex items-center gap-3 border-b border-border-subtle px-5 py-3">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-md border border-border bg-background text-[11px] font-bold text-foreground">
              HQ
            </div>
            <div className="flex-1">
              <div className="text-[13px] font-semibold text-foreground">DesignersMeet HQ</div>
              <div className="text-[11px] text-muted">
                12 members · Bengaluru · designersmeet.com
              </div>
            </div>
            <Badge variant="success" dot>
              Active
            </Badge>
          </div>
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
