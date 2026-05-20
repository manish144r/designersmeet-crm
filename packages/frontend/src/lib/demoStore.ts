// Mutable in-memory demo store. Powers the static surge deploy (no backend):
// every wired button performs a real CRUD op that persists for the session.
// Seeded from demoFixtures (the pages' own verbatim sample rows) so a wired
// page's first render is byte-identical to its locked baseline (≤2% drift).
//
// Wave-A Phase-2 panels (Audit, Workspaces, Teams, Plan & usage, Invoices,
// Vendor portal) extend this layer with:
//   • An audit-event interceptor — every mutation on a tracked resource emits
//     a row into `audit_events` (100-row cap, oldest evicts).
//   • A current-workspace pointer + setter so the new Workspaces panel can
//     switch the demo session's active workspace.
//   • A subscribe() pub-sub so panels that want to react to writes outside
//     the react-query path (e.g. the audit-log live feed) can re-render.
import { demoFixtures } from "./demoFixtures.js";

export interface DemoRow {
  id: string;
  [k: string]: unknown;
}

type Store = Record<string, DemoRow[]>;

let seq = 1;
const newId = (r: string) => `${r}-demo-${seq++}`;

// Deep-clone the fixtures so mutations never leak back into the seed.
const store: Store = JSON.parse(JSON.stringify(demoFixtures));

// ── Audit interceptor ──────────────────────────────────────────────────────
// Resources we DO audit. We deliberately exclude `audit_events` itself
// (infinite-loop guard) and high-noise resources where the writes are not
// user-meaningful in a demo (workflow-runs, messages).
const AUDIT_TRACKED = new Set<string>([
  "contacts",
  "vendors",
  "projects",
  "calendar-events",
  "workflows",
  "forms",
  "workspaces",
  "teams",
  "users",
  "plan",
  "invoices",
  "shopify-mappings",
  "services",
  "orders",
]);
const AUDIT_CAP = 100;
const ACTOR_DEFAULT = { id: "u1", name: "Manish Sharma" };

// Pub/sub for non-react-query subscribers (audit log live tail).
const subscribers = new Set<() => void>();
function notify() {
  for (const fn of subscribers) {
    try { fn(); } catch { /* swallow — listener errors must not break store */ }
  }
}

// Persistence keys for the cross-page demo context (workspace + admin/vendor
// view). Values stay in localStorage so the Surge static site survives a tab
// refresh — but never leaves the browser.
const LS_WORKSPACE = "dm.demo.workspaceId";
const LS_VIEW = "dm.demo.view";
const LS_LOCALE = "dm.demo.locale";

function lsGet(key: string): string | null {
  try {
    return typeof window !== "undefined" ? window.localStorage.getItem(key) : null;
  } catch {
    return null;
  }
}
function lsSet(key: string, value: string) {
  try {
    if (typeof window !== "undefined") window.localStorage.setItem(key, value);
  } catch {
    /* storage unavailable (private mode / SSR) — in-memory only */
  }
}

export type DemoView = "admin" | "vendor";

let currentWorkspaceId: string =
  lsGet(LS_WORKSPACE) ??
  (store.workspaces?.find((w) => w.active === true)?.id as string) ??
  "ws-default";

let currentView: DemoView = (lsGet(LS_VIEW) as DemoView | null) ?? "admin";

// Vendor view scopes the experience to one vendor row. Aurora Studio (vn1) is
// the demo-default vendor — has the richest assignment graph in the seed.
const DEFAULT_VENDOR_ID = "vn1";

// Default locale prefs — seeded into `locale_prefs` on first read so the
// useDatePreference hook never sees an empty store.
const DEFAULT_LOCALE = {
  id: "locale-prefs",
  timezone: "Asia/Kolkata",
  language: "en-IN",
  dateFormat: "DD MMM YYYY",
  timeFormat: "24h",
  firstDayOfWeek: "Mon",
};

(function seedLocale() {
  const rows = (store["locale_prefs"] ??= []);
  if (rows.length === 0) {
    const stored = lsGet(LS_LOCALE);
    if (stored) {
      try {
        rows.push({ ...DEFAULT_LOCALE, ...JSON.parse(stored) });
      } catch {
        rows.push({ ...DEFAULT_LOCALE });
      }
    } else {
      rows.push({ ...DEFAULT_LOCALE });
    }
  }
})();

function ensure(resource: string): DemoRow[] {
  if (!store[resource]) store[resource] = [];
  return store[resource];
}

function pushAuditEvent(action: string, resource: string, id: string, metadata?: Record<string, unknown>) {
  if (!AUDIT_TRACKED.has(resource)) return;
  const events = ensure("audit_events");
  events.unshift({
    id: newId("audit"),
    actor: ACTOR_DEFAULT.name,
    actor_id: ACTOR_DEFAULT.id,
    action,
    target_type: resource,
    target_id: id,
    timestamp: new Date().toISOString(),
    metadata: metadata ?? {},
    workspace_id: currentWorkspaceId,
  });
  // 100-row cap, oldest evicts.
  if (events.length > AUDIT_CAP) events.length = AUDIT_CAP;
}

export const demoStore = {
  list(resource: string, params: Record<string, string | number> = {}) {
    let rows = ensure(resource).slice();
    for (const [k, v] of Object.entries(params)) {
      if (["page", "pageSize", "sort", "order"].includes(k) || v === "" || v == null) continue;
      const needle = String(v).toLowerCase();
      rows = rows.filter((row) => {
        const cell = row[k];
        return cell != null && String(cell).toLowerCase().includes(needle);
      });
    }
    const sort = params.sort as string | undefined;
    if (sort) {
      const dir = params.order === "desc" ? -1 : 1;
      rows.sort((a, b) =>
        a[sort] === b[sort] ? 0 : ((a[sort] as number) > (b[sort] as number) ? 1 : -1) * dir,
      );
    }
    const total = rows.length;
    const page = Math.max(1, Number(params.page) || 1);
    const pageSize = Math.min(200, Math.max(1, Number(params.pageSize) || total || 1));
    return {
      data: rows.slice((page - 1) * pageSize, (page - 1) * pageSize + pageSize),
      page,
      pageSize,
      total,
    };
  },

  get(resource: string, id?: string) {
    if (!id) return undefined;
    return ensure(resource).find((r) => r.id === id);
  },

  create(resource: string, body: Record<string, unknown>) {
    const row: DemoRow = {
      ...body,
      id: (body.id as string) || newId(resource),
      created_at: body.created_at ?? new Date().toISOString(),
    };
    ensure(resource).unshift(row);
    pushAuditEvent("create", resource, row.id, { name: row.name ?? row.title ?? undefined });
    notify();
    return row;
  },

  update(resource: string, id: string, patch: Record<string, unknown>) {
    const rows = ensure(resource);
    const i = rows.findIndex((r) => r.id === id);
    if (i === -1) return undefined;
    rows[i] = { ...rows[i], ...patch, id };
    pushAuditEvent("update", resource, id, { fields: Object.keys(patch) });
    notify();
    return rows[i];
  },

  remove(resource: string, id: string) {
    const rows = ensure(resource);
    const i = rows.findIndex((r) => r.id === id);
    if (i === -1) return false;
    rows.splice(i, 1);
    pushAuditEvent("delete", resource, id);
    notify();
    return true;
  },

  // Domain ops mirroring packages/backend/src/crm/domain.ts.
  moveProjectStage(id: string, status: string) {
    return this.update("projects", id, { status });
  },
  bookSlot(body: Record<string, unknown>) {
    return this.create("calendar-events", { ...body, status: "confirmed" });
  },
  mergeConversations(sourceId: string, targetId: string) {
    ensure("messages").forEach((m) => {
      if (m.conversation_id === sourceId) m.conversation_id = targetId;
    });
    this.remove("conversations", sourceId);
    return this.get("conversations", targetId);
  },
  submitForm(slug: string, payload: Record<string, unknown>) {
    const form = ensure("forms").find((f) => f.public_slug === slug);
    return this.create("form-submissions", {
      form_id: form?.id ?? slug,
      payload_json: payload,
      submitted_at: new Date().toISOString(),
    });
  },

  // ── Wave-A additions ─────────────────────────────────────────────────────
  getCurrentWorkspaceId() {
    return currentWorkspaceId;
  },
  getCurrentWorkspace() {
    return ensure("workspaces").find((w) => w.id === currentWorkspaceId);
  },
  setCurrentWorkspace(id: string) {
    const target = ensure("workspaces").find((w) => w.id === id);
    if (!target) return undefined;
    // Flip the `active` flag on the persisted rows so the UI's "Active" badge
    // moves with the pointer.
    for (const w of ensure("workspaces")) {
      w.active = w.id === id;
    }
    const previous = currentWorkspaceId;
    currentWorkspaceId = id;
    lsSet(LS_WORKSPACE, id);
    pushAuditEvent("switch_workspace", "workspaces", id, { from: previous });
    notify();
    return target;
  },
  subscribe(listener: () => void) {
    subscribers.add(listener);
    return () => {
      subscribers.delete(listener);
    };
  },
  /** Returns the (mutable) audit_events tail for live-render UIs. */
  auditTail(limit = 100) {
    return ensure("audit_events").slice(0, limit);
  },

  // ── view (admin / vendor) — persistence + pub/sub ────────────────────────
  getView(): DemoView {
    return currentView;
  },
  setView(v: DemoView) {
    if (currentView === v) return;
    currentView = v;
    lsSet(LS_VIEW, v);
    pushAuditEvent("view_switch", "users", ACTOR_DEFAULT.id, { to: v });
    notify();
  },

  // ── actor (always Manish in this demo, but auditable as a real id) ───────
  getActorId(): string {
    return ACTOR_DEFAULT.id;
  },
  getActorName(): string {
    return ACTOR_DEFAULT.name;
  },

  // ── vendor scope (used by /vendor) ───────────────────────────────────────
  getVendorId(): string {
    return DEFAULT_VENDOR_ID;
  },
  getVendor() {
    return ensure("vendors").find((v) => v.id === DEFAULT_VENDOR_ID);
  },

  // ── Wave B (2026-05-20) ──────────────────────────────────────────────────
  // Mirror the backend waveBRouter semantics so the static demo behaves
  // identically when the frontend is later flipped to VITE_DEMO_MODE=false.
  // Plaintext secrets (api-key + webhook signing) are returned ONCE on create
  // and never re-echoed via list.

  mintApiKey(name: string, scope: "read" | "write" | "admin" = "read", expires_at: string | null = null) {
    const tag = scope === "admin" ? "adm" : scope === "write" ? "live" : "ro";
    const body = Array.from(crypto.getRandomValues(new Uint8Array(18)))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    const plaintext = `dm_${tag}_${body}`;
    const prefix = plaintext.slice(0, 16);
    // Real hash; we discard it after store since list always replies "***".
    // Hash is precomputed here purely so the demo writes the same shape the
    // backend would.
    const row = this.create("api-keys", {
      name,
      prefix,
      hashed_key: "***",
      scope,
      created_by: "u1",
      last_used_at: null,
      expires_at,
      revoked_at: null,
    });
    return { row, plaintext_once: plaintext };
  },

  revokeApiKey(id: string) {
    return this.update("api-keys", id, { revoked_at: new Date().toISOString() });
  },

  revokeSession(id: string) {
    return this.update("sessions", id, { revoked_at: new Date().toISOString() });
  },

  createWebhookSubscription(url: string, events: string[], enabled = true) {
    const secretBytes = Array.from(crypto.getRandomValues(new Uint8Array(24)))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    const signing_secret = `whsec_${secretBytes}`;
    const row = this.create("webhook-subscriptions", {
      url,
      events,
      signing_secret: "***",
      enabled,
      last_fired_at: null,
      last_status: null,
    });
    return { row, signing_secret_once: signing_secret };
  },

  testEmailProvider(id: string, to: string) {
    const row = this.get("email-providers", id);
    if (!row) return { sent: false, message: "Email provider not found" };
    const sent = Boolean(row.api_key_set);
    pushAuditEvent("test_send", "email-providers", id, { to, sent });
    return {
      provider: row.provider,
      to,
      from: row.sender,
      sent,
      message: sent
        ? `Test queued to ${row.provider}`
        : "Provider has no API key configured — set api_key_set via the form first.",
      attempted_at: new Date().toISOString(),
    };
  },

  // ── locale prefs (single-row, localStorage-backed) ───────────────────────
  getLocale(): DemoRow {
    const rows = ensure("locale_prefs");
    return (rows[0] ?? DEFAULT_LOCALE) as DemoRow;
  },
  setLocale(patch: Record<string, unknown>) {
    const rows = ensure("locale_prefs");
    if (rows.length === 0) rows.push({ ...DEFAULT_LOCALE });
    rows[0] = { ...rows[0], ...patch, id: rows[0].id };
    lsSet(LS_LOCALE, JSON.stringify(rows[0]));
    pushAuditEvent("update", "users", ACTOR_DEFAULT.id, { fields: Object.keys(patch) });
    notify();
    return rows[0];
  },
};
