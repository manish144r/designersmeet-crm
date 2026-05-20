// Wave B (2026-05-20) targeted overrides on top of the generic crmRouter.
// Generic CRUD handles list/get/update/delete for the 5 new resources. This
// router only adds the bits CRUD can't express:
//   • POST /api/api-keys              → returns plaintext_once (mints + hashes server-side)
//   • POST /api/email-providers/:id/test → simulates a send; returns provider feedback
//   • POST /api/webhook-subscriptions → injects a generated signing_secret
//   • DELETE /api/sessions/:id        → marks revoked_at instead of removing the row
import { Router } from "express";
import { createHash, randomBytes } from "node:crypto";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { HttpError } from "../middleware/errorHandler.js";
import { stores } from "./seed.js";

interface ApiKeyRow {
  id?: string;
  name: string;
  prefix: string;
  hashed_key: string;
  scope: "read" | "write" | "admin";
  created_by: string;
  created_at?: string;
  last_used_at: string | null;
  expires_at: string | null;
  revoked_at: string | null;
}

interface SessionRow {
  id?: string;
  user_id: string;
  device: string;
  ip: string;
  started_at?: string;
  last_active_at?: string;
  expires_at?: string;
  revoked_at: string | null;
}

interface EmailProviderRow {
  id?: string;
  provider: string;
  sender: string;
  api_key_set: boolean;
  config_json: Record<string, unknown>;
  is_default: boolean;
  created_at?: string;
}

interface WebhookRow {
  id?: string;
  url: string;
  events: string[];
  signing_secret: string;
  enabled: boolean;
  last_fired_at: string | null;
  last_status: string | null;
  created_at?: string;
}

function mintApiKey(scope: string): { plaintext: string; prefix: string; hashed: string } {
  // dm_<scope-letter>_<24 hex chars> — the prefix the user sees in the UI is
  // the first 16 chars of this string ("dm_l_a3f7b921...").
  const tag = scope === "admin" ? "adm" : scope === "write" ? "live" : "ro";
  const body = randomBytes(18).toString("hex");
  const plaintext = `dm_${tag}_${body}`;
  const prefix = plaintext.slice(0, 16);
  const hashed = createHash("sha256").update(plaintext).digest("hex");
  return { plaintext, prefix, hashed };
}

export function waveBRouter(): Router {
  const router = Router();

  // ── API keys ──────────────────────────────────────────────────────────────
  // POST returns plaintext ONCE. The generic CRUD POST is shadowed by this
  // because Express matches this router first.
  router.post(
    "/api-keys",
    asyncHandler(async (req, res) => {
      const name = String(req.body?.name ?? "").trim();
      if (!name) throw new HttpError(400, "name is required");
      const scope = (["read", "write", "admin"] as const).includes(req.body?.scope)
        ? (req.body.scope as "read" | "write" | "admin")
        : "read";
      const expires_at: string | null =
        typeof req.body?.expires_at === "string" ? req.body.expires_at : null;
      const { plaintext, prefix, hashed } = mintApiKey(scope);
      const row = stores["api-keys"].create({
        name,
        prefix,
        hashed_key: hashed,
        scope,
        created_by: "u1",
        last_used_at: null,
        expires_at,
        revoked_at: null,
      } as ApiKeyRow) as ApiKeyRow;
      res.status(201).json({
        data: { ...row, hashed_key: "***" }, // never echo hash
        plaintext_once: plaintext,
        warning: "Save this token now — it will not be shown again.",
      });
    }),
  );

  // Override GET list to redact hashed_key on every row (defence in depth).
  router.get(
    "/api-keys",
    asyncHandler(async (req, res) => {
      const result = stores["api-keys"].list(req.query as Record<string, unknown>);
      result.data = (result.data as unknown as ApiKeyRow[]).map((r) => ({
        ...r,
        hashed_key: "***",
      })) as unknown as typeof result.data;
      res.json({ data: result });
    }),
  );

  // DELETE = revoke (mark revoked_at instead of removing). UI calls this; row
  // stays for audit.
  router.delete(
    "/api-keys/:id",
    asyncHandler(async (req, res) => {
      const row = stores["api-keys"].get(req.params.id) as ApiKeyRow | undefined;
      if (!row) throw new HttpError(404, "api-key not found");
      stores["api-keys"].update(req.params.id, {
        revoked_at: new Date().toISOString(),
      } as Partial<ApiKeyRow>);
      res.status(204).end();
    }),
  );

  // ── Sessions ──────────────────────────────────────────────────────────────
  // GET list filters to active by default. ?include_revoked=true returns all.
  router.get(
    "/sessions",
    asyncHandler(async (req, res) => {
      const { include_revoked, ...passthrough } = req.query as Record<string, unknown>;
      const includeRevoked = include_revoked === "true";
      const result = stores.sessions.list(passthrough);
      const nowIso = new Date().toISOString();
      result.data = (result.data as unknown as SessionRow[]).filter((r) => {
        if (!includeRevoked && r.revoked_at) return false;
        if (!includeRevoked && r.expires_at && r.expires_at < nowIso) return false;
        return true;
      }) as unknown as typeof result.data;
      result.total = (result.data as unknown[]).length;
      res.json({ data: result });
    }),
  );

  router.delete(
    "/sessions/:id",
    asyncHandler(async (req, res) => {
      const row = stores.sessions.get(req.params.id) as SessionRow | undefined;
      if (!row) throw new HttpError(404, "session not found");
      stores.sessions.update(req.params.id, {
        revoked_at: new Date().toISOString(),
      } as Partial<SessionRow>);
      res.status(204).end();
    }),
  );

  // ── Email providers — test send ───────────────────────────────────────────
  router.post(
    "/email-providers/:id/test",
    asyncHandler(async (req, res) => {
      const row = stores["email-providers"].get(req.params.id) as EmailProviderRow | undefined;
      if (!row) throw new HttpError(404, "email-provider not found");
      const to = String(req.body?.to ?? "");
      if (!to.includes("@")) throw new HttpError(400, "to (email) is required");
      // No real send in demo / unconfigured providers. When api_key_set=true
      // the route would dispatch via the provider — out of scope for Wave B.
      const sent = row.api_key_set;
      res.json({
        data: {
          provider: row.provider,
          to,
          from: row.sender,
          sent,
          message: sent
            ? `Test queued to ${row.provider}`
            : "Provider has no API key configured — set api_key_set via PATCH first.",
          attempted_at: new Date().toISOString(),
        },
      });
    }),
  );

  // Strip plaintext api_key on read; the value lives in config_json but we
  // never echo it.
  router.get(
    "/email-providers",
    asyncHandler(async (req, res) => {
      const result = stores["email-providers"].list(req.query as Record<string, unknown>);
      result.data = (result.data as unknown as EmailProviderRow[]).map((r) => ({
        ...r,
        config_json: { ...r.config_json, api_key: undefined },
      })) as unknown as typeof result.data;
      res.json({ data: result });
    }),
  );

  // ── Webhook subscriptions ─────────────────────────────────────────────────
  router.post(
    "/webhook-subscriptions",
    asyncHandler(async (req, res) => {
      const url = String(req.body?.url ?? "");
      try {
        new URL(url);
      } catch {
        throw new HttpError(400, "url must be a valid URL");
      }
      const events = Array.isArray(req.body?.events) ? (req.body.events as string[]) : [];
      const enabled = req.body?.enabled !== false;
      const signing_secret = `whsec_${randomBytes(24).toString("hex")}`;
      const row = stores["webhook-subscriptions"].create({
        url,
        events,
        signing_secret,
        enabled,
        last_fired_at: null,
        last_status: null,
      } as WebhookRow) as WebhookRow;
      // Plaintext signing_secret echoed ONCE on creation (same pattern as API
      // keys). Subsequent GETs return "***".
      res.status(201).json({
        data: { ...row, signing_secret: "***" },
        signing_secret_once: signing_secret,
        warning: "Save the signing secret now — it will not be shown again.",
      });
    }),
  );

  router.get(
    "/webhook-subscriptions",
    asyncHandler(async (req, res) => {
      const result = stores["webhook-subscriptions"].list(req.query as Record<string, unknown>);
      result.data = (result.data as unknown as WebhookRow[]).map((r) => ({
        ...r,
        signing_secret: "***",
      })) as unknown as typeof result.data;
      res.json({ data: result });
    }),
  );

  // ── SSO providers — OAuth callback stub ───────────────────────────────────
  // Wired so the UI's "Test" button has a real endpoint to call. Returns a
  // structured 501 with the env-vars the prod flow needs — UI surfaces them
  // as the "Configure" state for unconfigured providers.
  router.get(
    "/sso/:type/callback",
    asyncHandler(async (req, res) => {
      const type = String(req.params.type ?? "");
      const code = req.query.code;
      if (!code) {
        return res
          .status(400)
          .json({ error: "missing_code", message: "OAuth callback must receive ?code" });
      }
      const envNeeded =
        type === "entra"
          ? ["ENTRA_TENANT_ID", "ENTRA_CLIENT_ID", "ENTRA_CLIENT_SECRET"]
          : type === "google"
            ? ["GOOGLE_OAUTH_CLIENT_ID", "GOOGLE_OAUTH_CLIENT_SECRET"]
            : ["APPLE_OAUTH_CLIENT_ID"];
      res.status(501).json({
        error: "provider_not_configured",
        message: `Set ${envNeeded.join(" + ")} in secrets.env to enable ${type} SSO`,
        type,
        env_required: envNeeded,
      });
    }),
  );

  return router;
}
