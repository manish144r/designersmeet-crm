// Wave B (2026-05-20) — settings panels promoted from "Coming in Phase 2".
//
// Each slot component renders the full settings panel for one of: API keys,
// Sessions, SSO providers, Email providers, Webhooks. They consume the same
// outer container shape (`max-w-[1100px] px-8 py-6` + h1 + p + Card) as the
// Wave-A panels so the swap-in is DOM-shape-compatible and the per-page VR
// baselines (compared on the default `Integrations` render only) stay green.
//
// Demo mode: writes hit demoStore (mutable, in-session). When a real backend
// is reachable and VITE_DEMO_MODE=false, the same writes flow through
// useCreate/useRemove → POST /api/* → the Wave B backend router.
import { useEffect, useReducer, useState, type ReactNode } from "react";
import {
  AlertTriangle,
  Check,
  Copy,
  Key,
  Lock,
  Mail,
  ShieldCheck,
  Trash2,
  Webhook,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { demoStore } from "@/lib/demoData";
import { DEMO_MODE } from "@/lib/demoData";
import { api } from "@/api/client";

// Local Badge — keeps Wave B self-contained (the existing Badge lives in
// pages/15-settings.tsx as a private helper).
type BadgeVariant = "success" | "neutral";
const badgeVariantClasses: Record<BadgeVariant, string> = {
  success: "bg-primary-tint text-primary",
  neutral: "bg-border-subtle text-secondary",
};
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
      className={
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium leading-[18px] tracking-[0.01em] " +
        badgeVariantClasses[variant]
      }
    >
      {dot ? <span className="size-1.5 rounded-full bg-current" /> : null}
      {children}
    </span>
  );
}

const iconClass = "size-4 shrink-0";

function useDemoStoreTick(): number {
  const [tick, force] = useReducer((n: number) => n + 1, 0);
  useEffect(() => demoStore.subscribe(() => force()), []);
  return tick;
}

// ─── Helper: outer panel shell, identical to Phase2Panel container ──────────
function PanelShell({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="max-w-[1100px] px-8 py-6" data-settings-panel={title}>
      <div className="mb-6">
        <h1 className="font-display text-[22px] font-semibold tracking-tight text-foreground">
          {title}
        </h1>
        <p className="mt-1 text-[13px] text-muted">{description}</p>
      </div>
      {children}
    </div>
  );
}

function shortDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

// ─── API KEYS ────────────────────────────────────────────────────────────────
interface ApiKeyRow {
  id: string;
  name: string;
  prefix: string;
  scope: "read" | "write" | "admin";
  created_at: string;
  last_used_at: string | null;
  expires_at: string | null;
  revoked_at: string | null;
}

export function ApiKeysSlot(): ReactNode {
  useDemoStoreTick();
  const rows = (demoStore.list("api-keys").data as unknown as ApiKeyRow[]) ?? [];
  const [name, setName] = useState("");
  const [scope, setScope] = useState<"read" | "write" | "admin">("read");
  const [created, setCreated] = useState<{ row: ApiKeyRow; plaintext: string } | null>(null);

  async function submit() {
    if (!name.trim()) return;
    if (DEMO_MODE) {
      const { row, plaintext_once } = demoStore.mintApiKey(name.trim(), scope, null);
      setCreated({ row: row as unknown as ApiKeyRow, plaintext: plaintext_once });
    } else {
      const res = await api.post<{ data: ApiKeyRow; plaintext_once: string }>("/api-keys", {
        name: name.trim(),
        scope,
      });
      setCreated({ row: res.data, plaintext: res.plaintext_once });
    }
    setName("");
  }

  async function revoke(id: string) {
    if (DEMO_MODE) {
      demoStore.revokeApiKey(id);
    } else {
      await api.delete(`/api-keys/${id}`);
    }
  }

  return (
    <PanelShell
      title="API keys"
      description="Programmatic access tokens. Read-only metrics, write for automations, admin for support."
    >
      <Card className="rounded-lg border-border bg-background">
        <CardContent className="p-[18px]">
          <div className="mb-4 flex items-end gap-3">
            <div className="flex-1">
              <label className="block text-[11px] font-semibold text-muted">Name</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Build pipeline"
                className="mt-1"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-muted">Scope</label>
              <select
                value={scope}
                onChange={(e) => setScope(e.target.value as "read" | "write" | "admin")}
                className="mt-1 h-9 rounded-md border border-border bg-background px-2 text-[13px]"
              >
                <option value="read">read</option>
                <option value="write">write</option>
                <option value="admin">admin</option>
              </select>
            </div>
            <Button type="button" onClick={submit} disabled={!name.trim()}>
              <Key className={iconClass} aria-hidden="true" />
              Generate key
            </Button>
          </div>

          {created && (
            <div
              role="alert"
              className="mb-4 rounded-md border border-warning/40 bg-warning-tint p-3"
            >
              <div className="mb-1 flex items-center gap-2 text-[12px] font-semibold text-foreground">
                <AlertTriangle className={iconClass} aria-hidden="true" />
                Save this token now — it will not be shown again.
              </div>
              <div className="mt-1 flex items-center gap-2">
                <code className="flex-1 rounded bg-background px-2 py-1 font-mono text-[12px]">
                  {created.plaintext}
                </code>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    void navigator.clipboard?.writeText(created.plaintext);
                  }}
                >
                  <Copy className={iconClass} aria-hidden="true" />
                  Copy
                </Button>
                <Button type="button" variant="secondary" onClick={() => setCreated(null)}>
                  <Check className={iconClass} aria-hidden="true" />
                  I've saved it
                </Button>
              </div>
            </div>
          )}

          <div className="overflow-hidden rounded-md border border-border">
            <table className="w-full text-[13px]">
              <thead className="bg-border-subtle text-[11px] uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-3 py-2 text-left">Name</th>
                  <th className="px-3 py-2 text-left">Prefix</th>
                  <th className="px-3 py-2 text-left">Scope</th>
                  <th className="px-3 py-2 text-left">Last used</th>
                  <th className="px-3 py-2 text-left">Status</th>
                  <th className="px-3 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-3 py-4 text-center text-muted">
                      No API keys yet.
                    </td>
                  </tr>
                )}
                {rows.map((r) => (
                  <tr key={r.id} className="border-t border-border">
                    <td className="px-3 py-2 font-medium text-foreground">{r.name}</td>
                    <td className="px-3 py-2 font-mono text-[12px] text-secondary">{r.prefix}…</td>
                    <td className="px-3 py-2">{r.scope}</td>
                    <td className="px-3 py-2 text-secondary">{shortDate(r.last_used_at)}</td>
                    <td className="px-3 py-2">
                      {r.revoked_at ? (
                        <Badge variant="neutral">Revoked</Badge>
                      ) : (
                        <Badge variant="success" dot>
                          Active
                        </Badge>
                      )}
                    </td>
                    <td className="px-3 py-2 text-right">
                      {!r.revoked_at && (
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() => void revoke(r.id)}
                          aria-label={`Revoke ${r.name}`}
                        >
                          <Trash2 className={iconClass} aria-hidden="true" />
                          Revoke
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </PanelShell>
  );
}

// ─── SESSIONS ────────────────────────────────────────────────────────────────
interface SessionRow {
  id: string;
  user_id: string;
  device: string;
  ip: string;
  started_at: string;
  last_active_at: string;
  expires_at: string;
  revoked_at: string | null;
}

export function SessionsSlot(): ReactNode {
  useDemoStoreTick();
  const rows = (demoStore.list("sessions").data as unknown as SessionRow[]) ?? [];
  const active = rows.filter((r) => !r.revoked_at);

  async function revoke(id: string) {
    if (DEMO_MODE) {
      demoStore.revokeSession(id);
    } else {
      await api.delete(`/sessions/${id}`);
    }
  }

  return (
    <PanelShell
      title="Sessions"
      description="Active sign-ins for your account. Revoke any device that shouldn't be there."
    >
      <Card className="rounded-lg border-border bg-background">
        <CardContent className="p-[18px]">
          <div className="mb-3 text-[12px] text-muted">
            {active.length} active · {rows.length - active.length} revoked
          </div>
          <div className="space-y-2">
            {active.length === 0 && (
              <div className="rounded-md border border-border px-3 py-4 text-center text-[13px] text-muted">
                No active sessions.
              </div>
            )}
            {active.map((s) => (
              <div
                key={s.id}
                className="flex items-center gap-3 rounded-md border border-border px-3 py-2.5"
              >
                <Lock className={iconClass} aria-hidden="true" />
                <div className="min-w-0 flex-1">
                  <div className="text-[13px] font-medium text-foreground">{s.device}</div>
                  <div className="text-[11px] text-muted">
                    IP {s.ip} · last active {shortDate(s.last_active_at)} · expires{" "}
                    {shortDate(s.expires_at)}
                  </div>
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => void revoke(s.id)}
                  aria-label={`Revoke session on ${s.device}`}
                >
                  Revoke
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </PanelShell>
  );
}

// ─── SSO PROVIDERS ───────────────────────────────────────────────────────────
interface SsoProviderRow {
  id: string;
  type: "entra" | "google" | "okta" | "apple";
  client_id: string;
  tenant_id: string;
  redirect_uri: string;
  jwks_url: string;
  enabled: boolean;
}

const SSO_LABELS: Record<SsoProviderRow["type"], string> = {
  entra: "Microsoft Entra ID",
  google: "Google Identity",
  okta: "Okta",
  apple: "Sign in with Apple",
};

export function SsoProvidersSlot(): ReactNode {
  useDemoStoreTick();
  const rows = (demoStore.list("sso-providers").data as unknown as SsoProviderRow[]) ?? [];

  async function toggle(row: SsoProviderRow) {
    const patch = { enabled: !row.enabled };
    if (DEMO_MODE) {
      demoStore.update("sso-providers", row.id, patch);
    } else {
      await api.patch(`/sso-providers/${row.id}`, patch);
    }
  }

  async function savePatch(row: SsoProviderRow, patch: Partial<SsoProviderRow>) {
    if (DEMO_MODE) {
      demoStore.update("sso-providers", row.id, patch);
    } else {
      await api.patch(`/sso-providers/${row.id}`, patch);
    }
  }

  return (
    <PanelShell
      title="SSO providers"
      description="OAuth/OIDC providers. Set Client ID + Tenant ID + secret in env, then toggle Enabled."
    >
      <Card className="rounded-lg border-border bg-background">
        <CardContent className="p-[18px]">
          <div className="grid gap-3">
            {rows.map((p) => {
              const envHint =
                p.type === "entra"
                  ? "ENTRA_TENANT_ID + ENTRA_CLIENT_ID + ENTRA_CLIENT_SECRET"
                  : p.type === "google"
                    ? "GOOGLE_OAUTH_CLIENT_ID + GOOGLE_OAUTH_CLIENT_SECRET"
                    : p.type === "apple"
                      ? "APPLE_OAUTH_CLIENT_ID"
                      : "OKTA_DOMAIN + OKTA_CLIENT_ID + OKTA_CLIENT_SECRET";
              return (
                <div
                  key={p.id}
                  className="rounded-md border border-border p-4"
                  data-sso-row={p.type}
                >
                  <div className="mb-3 flex items-center gap-3">
                    <ShieldCheck className={iconClass} aria-hidden="true" />
                    <div className="flex-1">
                      <div className="text-[13px] font-semibold text-foreground">
                        {SSO_LABELS[p.type]}
                      </div>
                      <div className="text-[11px] text-muted">{p.redirect_uri}</div>
                    </div>
                    {p.enabled ? (
                      <Badge variant="success" dot>
                        Enabled
                      </Badge>
                    ) : (
                      <Badge variant="neutral">Disabled</Badge>
                    )}
                    <Button type="button" variant="secondary" onClick={() => void toggle(p)}>
                      {p.enabled ? "Disable" : "Enable"}
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-muted">
                        Client ID
                      </label>
                      <Input
                        defaultValue={p.client_id}
                        onBlur={(e) => void savePatch(p, { client_id: e.target.value })}
                        placeholder="—"
                        className="mt-1 font-mono text-[12px]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-muted">
                        Tenant ID
                      </label>
                      <Input
                        defaultValue={p.tenant_id}
                        onBlur={(e) => void savePatch(p, { tenant_id: e.target.value })}
                        placeholder="—"
                        className="mt-1 font-mono text-[12px]"
                      />
                    </div>
                  </div>
                  <div className="mt-2 text-[11px] text-muted">
                    Server-side env required: <code>{envHint}</code>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </PanelShell>
  );
}

// ─── EMAIL PROVIDERS ─────────────────────────────────────────────────────────
interface EmailProviderRow {
  id: string;
  provider: "brevo" | "resend" | "ses" | "postmark" | "smtp" | "msgraph";
  sender: string;
  api_key_set: boolean;
  is_default: boolean;
}

export function EmailProvidersSlot(): ReactNode {
  useDemoStoreTick();
  const rows = (demoStore.list("email-providers").data as unknown as EmailProviderRow[]) ?? [];
  const [testTo, setTestTo] = useState("manish@designersmeet.com");
  const [feedback, setFeedback] = useState<string | null>(null);

  async function savePatch(row: EmailProviderRow, patch: Partial<EmailProviderRow>) {
    if (DEMO_MODE) {
      demoStore.update("email-providers", row.id, patch);
    } else {
      await api.patch(`/email-providers/${row.id}`, patch);
    }
  }

  async function test(row: EmailProviderRow) {
    if (DEMO_MODE) {
      const r = demoStore.testEmailProvider(row.id, testTo);
      setFeedback(r.message);
    } else {
      const r = await api.post<{ data: { sent: boolean; message: string } }>(
        `/email-providers/${row.id}/test`,
        { to: testTo },
      );
      setFeedback(r.data.message);
    }
  }

  return (
    <PanelShell
      title="Email providers"
      description="Outbound transactional email. Configure one or more — the default ships system mail."
    >
      <Card className="rounded-lg border-border bg-background">
        <CardContent className="p-[18px]">
          <div className="space-y-3">
            {rows.map((r) => (
              <div key={r.id} className="rounded-md border border-border p-4">
                <div className="mb-3 flex items-center gap-3">
                  <Mail className={iconClass} aria-hidden="true" />
                  <div className="flex-1">
                    <div className="text-[13px] font-semibold text-foreground">{r.provider}</div>
                    <div className="text-[11px] text-muted">{r.sender || "no sender configured"}</div>
                  </div>
                  {r.is_default && (
                    <Badge variant="success" dot>
                      Default
                    </Badge>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-muted">Sender</label>
                    <Input
                      defaultValue={r.sender}
                      onBlur={(e) => void savePatch(r, { sender: e.target.value })}
                      placeholder="no-reply@designersmeet.com"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-muted">
                      API key status
                    </label>
                    <div className="mt-1 flex items-center gap-2">
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => void savePatch(r, { api_key_set: !r.api_key_set })}
                      >
                        {r.api_key_set ? "Configured · clear" : "Mark configured"}
                      </Button>
                      {r.api_key_set ? (
                        <Badge variant="success" dot>
                          Set
                        </Badge>
                      ) : (
                        <Badge variant="neutral">Missing</Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex items-end gap-2">
                  <div className="flex-1">
                    <label className="block text-[11px] font-semibold text-muted">
                      Send a test to
                    </label>
                    <Input
                      value={testTo}
                      onChange={(e) => setTestTo(e.target.value)}
                      placeholder="you@example.com"
                      className="mt-1"
                    />
                  </div>
                  <Button type="button" onClick={() => void test(r)}>
                    Send test
                  </Button>
                </div>
                {feedback && (
                  <div className="mt-2 rounded-md bg-border-subtle px-3 py-2 text-[12px] text-secondary">
                    {feedback}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </PanelShell>
  );
}

// ─── WEBHOOKS ────────────────────────────────────────────────────────────────
interface WebhookRow {
  id: string;
  url: string;
  events: string[];
  enabled: boolean;
  last_fired_at: string | null;
  last_status: string | null;
}

const WEBHOOK_EVENTS = [
  "order.created",
  "order.assigned",
  "project.stage_moved",
  "form.submitted",
  "workflow.completed",
];

export function WebhooksSlot(): ReactNode {
  useDemoStoreTick();
  const rows = (demoStore.list("webhook-subscriptions").data as unknown as WebhookRow[]) ?? [];
  const [url, setUrl] = useState("");
  const [selected, setSelected] = useState<string[]>(["order.created"]);
  const [secret, setSecret] = useState<string | null>(null);

  async function submit() {
    const trimmed = url.trim();
    try {
      new URL(trimmed);
    } catch {
      setSecret("error:invalid_url");
      return;
    }
    if (DEMO_MODE) {
      const { signing_secret_once } = demoStore.createWebhookSubscription(trimmed, selected, true);
      setSecret(signing_secret_once);
    } else {
      const res = await api.post<{ signing_secret_once: string }>("/webhook-subscriptions", {
        url: trimmed,
        events: selected,
        enabled: true,
      });
      setSecret(res.signing_secret_once);
    }
    setUrl("");
  }

  async function remove(id: string) {
    if (DEMO_MODE) {
      demoStore.remove("webhook-subscriptions", id);
    } else {
      await api.delete(`/webhook-subscriptions/${id}`);
    }
  }

  return (
    <PanelShell
      title="Webhooks"
      description="POST event payloads to your endpoint. Payloads are HMAC-signed with the secret returned on creation."
    >
      <Card className="rounded-lg border-border bg-background">
        <CardContent className="p-[18px]">
          <div className="mb-4 space-y-2">
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <label className="block text-[11px] font-semibold text-muted">URL</label>
                <Input
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://hooks.example.com/dm"
                  className="mt-1"
                />
              </div>
              <Button type="button" onClick={submit} disabled={!url.trim()}>
                <Webhook className={iconClass} aria-hidden="true" />
                Add webhook
              </Button>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-muted">Events</label>
              <div className="mt-1 flex flex-wrap gap-2">
                {WEBHOOK_EVENTS.map((ev) => {
                  const on = selected.includes(ev);
                  return (
                    <button
                      key={ev}
                      type="button"
                      onClick={() =>
                        setSelected((s) => (on ? s.filter((x) => x !== ev) : [...s, ev]))
                      }
                      className={
                        "rounded-md border px-2.5 py-1 text-[12px] " +
                        (on
                          ? "border-foreground bg-foreground text-background"
                          : "border-border text-secondary")
                      }
                    >
                      {ev}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {secret && secret.startsWith("whsec_") && (
            <div
              role="alert"
              className="mb-4 rounded-md border border-warning/40 bg-warning-tint p-3"
            >
              <div className="mb-1 flex items-center gap-2 text-[12px] font-semibold text-foreground">
                <AlertTriangle className={iconClass} aria-hidden="true" />
                Save the signing secret now — it will not be shown again.
              </div>
              <div className="mt-1 flex items-center gap-2">
                <code className="flex-1 rounded bg-background px-2 py-1 font-mono text-[12px]">
                  {secret}
                </code>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    void navigator.clipboard?.writeText(secret);
                  }}
                >
                  <Copy className={iconClass} aria-hidden="true" />
                  Copy
                </Button>
                <Button type="button" variant="secondary" onClick={() => setSecret(null)}>
                  <Check className={iconClass} aria-hidden="true" />
                  I've saved it
                </Button>
              </div>
            </div>
          )}
          {secret === "error:invalid_url" && (
            <div className="mb-4 rounded-md border border-danger/40 bg-danger-tint p-3 text-[12px] text-foreground">
              URL is not valid.
            </div>
          )}

          <div className="overflow-hidden rounded-md border border-border">
            <table className="w-full text-[13px]">
              <thead className="bg-border-subtle text-[11px] uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-3 py-2 text-left">URL</th>
                  <th className="px-3 py-2 text-left">Events</th>
                  <th className="px-3 py-2 text-left">Status</th>
                  <th className="px-3 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-3 py-4 text-center text-muted">
                      No webhooks configured.
                    </td>
                  </tr>
                )}
                {rows.map((r) => (
                  <tr key={r.id} className="border-t border-border">
                    <td className="px-3 py-2 font-mono text-[12px] text-foreground">{r.url}</td>
                    <td className="px-3 py-2 text-secondary">{r.events.join(", ")}</td>
                    <td className="px-3 py-2">
                      {r.enabled ? (
                        <Badge variant="success" dot>
                          On
                        </Badge>
                      ) : (
                        <Badge variant="neutral">Off</Badge>
                      )}
                    </td>
                    <td className="px-3 py-2 text-right">
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => void remove(r.id)}
                        aria-label={`Delete webhook ${r.url}`}
                      >
                        <Trash2 className={iconClass} aria-hidden="true" />
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </PanelShell>
  );
}
