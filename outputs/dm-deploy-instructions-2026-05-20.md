# DM CRM Backend Deploy — Choose Your Path (2026-05-20)

Wave A frontend is live on Surge at **https://designersmeet-preview.surge.sh** running in `VITE_DEMO_MODE=true` (demoStore-backed). Wave B backend is built, tested (130/130 green), and ready. To flip the frontend to live-backend mode, ship `packages/backend/` to one of the targets below and set `VITE_BACKEND_URL` in the frontend env.

## Token Status (as of 2026-05-20 18:30 UTC+10)

| Token | Status | Used by |
|---|---|---|
| `SUPABASE_ACCESS_TOKEN` | MISSING | Path 1 — Supabase Edge Functions CLI |
| `FLY_API_TOKEN` | MISSING | Path 2 — Fly.io launch + deploy |
| `RENDER_API_KEY` | MISSING | Path 3 — Render REST API blueprint |
| `CLOUDFLARE_API_TOKEN` (Workers scope) | MISSING | Path 4 — Workers + Hono |
| `SUPABASE_DB_URL` | SET | Postgres database (any path) |
| `SUPABASE_POOLER_URL` | SET | Postgres pooled (any path) |
| `META_ACCESS_TOKEN` | SET | Meta Page Insights wired |
| `ENTRA_TENANT_ID`/`CLIENT_ID`/`CLIENT_SECRET` | MISSING | M365 OAuth — Configure state |
| `SHOPIFY_API_KEY`/`API_SECRET`/`STORE_DOMAIN` | MISSING | Shopify OAuth — Configure state |
| `BREVO_API_KEY` | MISSING | Brevo email — Configure state |

Action required: get **one** deploy token. The cheapest + fastest is Render (free tier, no card).

---

## Path 1 — Render Blueprint (RECOMMENDED, no card)

1. Push the branch to GitHub: `git push origin claude/confident-archimedes-a4d918`
2. Open https://dashboard.render.com → **New** → **Blueprint**
3. Pick the GitHub repo + branch.
4. Render reads `render.yaml` at the repo root (already present, see below). Set the secrets prompted:
   - `ENTRA_TENANT_ID` (optional — leave blank to skip M365 SSO)
   - `ENTRA_CLIENT_ID` (optional)
   - `ENTRA_AUDIENCE` (optional)
5. Deploy. ~2 min build. Health probe is `/health`.
6. Copy the live URL (e.g. `https://designersmeet-crm-api.onrender.com`).
7. **Frontend flip:**
   ```powershell
   cd packages/frontend
   $env:VITE_BACKEND_URL = "https://designersmeet-crm-api.onrender.com"
   $env:VITE_DEMO_MODE = "false"
   npx vite build
   npx surge dist designersmeet-preview.surge.sh
   ```

Current `render.yaml` ships `DATA_PROVIDER=memory`. Add `SUPABASE_DB_URL=…` env var after Path 1 to switch to Postgres (requires a new repo adapter — out of scope for Wave B).

---

## Path 2 — Fly.io (needs FLY_API_TOKEN)

Token: `fly auth token` (after `fly auth login`).

```powershell
cd packages/backend
fly launch --no-deploy --name dm-crm-backend --region syd --no-public-ips false
fly secrets set `
  NODE_ENV=production `
  AUTH_MODE=dev `
  DATA_PROVIDER=memory `
  CORS_ORIGIN=https://designersmeet-preview.surge.sh `
  META_ACCESS_TOKEN=...
fly deploy
```

Backend URL: `https://dm-crm-backend.fly.dev` → wire into frontend `.env.production` per Path 1 step 7.

---

## Path 3 — Supabase Edge Functions (needs SUPABASE_ACCESS_TOKEN)

Token from https://supabase.com/dashboard/account/tokens.

```powershell
$env:SUPABASE_ACCESS_TOKEN = "sbp_..."
cd packages/backend
# One function per route group. Port Express handlers → Deno (Hono-compatible).
supabase functions deploy crm --no-verify-jwt
supabase functions deploy wave-b --no-verify-jwt
```

Backend URL: `https://<project-ref>.supabase.co/functions/v1/`. **Note:** Express → Deno port is ~1 day of work; not auto-translated.

---

## Path 4 — Cloudflare Workers (needs CLOUDFLARE_API_TOKEN with Workers scope)

Token from https://dash.cloudflare.com/profile/api-tokens → "Edit Cloudflare Workers" template. NOT the existing `cfat_*` AI Gateway keys.

```powershell
$env:CLOUDFLARE_API_TOKEN = "..."
cd packages/backend
# Port Express → Hono; install wrangler.
npm install --save-dev wrangler hono
npx wrangler deploy
```

Express → Hono port is ~half a day of work; not auto-translated.

---

## After Any Path: Smoke Check

```powershell
$BACKEND = "https://<deployed-url>"
curl $BACKEND/health
curl $BACKEND/api/clients
curl $BACKEND/api/api-keys
curl $BACKEND/api/sessions
curl $BACKEND/api/sso-providers
curl $BACKEND/api/email-providers
curl $BACKEND/api/webhook-subscriptions
```

All should return 200 with `{ data: { data: [...] } }` envelope.

## Wave B Endpoint Inventory (verify after deploy)

| Method | Path | Notes |
|---|---|---|
| `GET` | `/api/api-keys` | hashed_key always `***` |
| `POST` | `/api/api-keys` | returns `plaintext_once` |
| `DELETE` | `/api/api-keys/:id` | marks `revoked_at`, doesn't remove |
| `GET` | `/api/sessions` | filters revoked + expired |
| `GET` | `/api/sessions?include_revoked=true` | all |
| `DELETE` | `/api/sessions/:id` | marks `revoked_at` |
| `GET/POST/PATCH/DELETE` | `/api/sso-providers` | CRUD via generic router |
| `GET` | `/api/sso/:type/callback?code=…` | 501 with `env_required` until SSO env set |
| `GET/POST/PATCH/DELETE` | `/api/email-providers` | CRUD; `api_key` stripped on read |
| `POST` | `/api/email-providers/:id/test` | simulates send |
| `GET/POST/DELETE` | `/api/webhook-subscriptions` | POST mints `signing_secret_once` |
| `GET` | `/api/integrations/meta/insights?page_id=…&metric=…` | live when `META_ACCESS_TOKEN` set |

## Integration Status Matrix

| Integration | Status | Env vars to set |
|---|---|---|
| Meta | **Connected** (META_ACCESS_TOKEN present, 211 chars) | none |
| Microsoft 365 | Configure | `ENTRA_TENANT_ID + ENTRA_CLIENT_ID + ENTRA_CLIENT_SECRET` |
| Shopify | Configure | `SHOPIFY_API_KEY + SHOPIFY_API_SECRET + SHOPIFY_STORE_DOMAIN` |
| Brevo | Configure | `BREVO_API_KEY` |
| Stripe | Configure | `STRIPE_SECRET_KEY` |

Configure-state means: the OAuth/connect button is disabled with `aria-disabled` + tooltip listing the env-var names. Clicking is a no-op until the env vars are present.

## render.yaml (already committed)

```yaml
services:
  - type: web
    name: designersmeet-crm-api
    runtime: node
    plan: free
    buildCommand: npm install && npm --workspace @dm/shared run build && npm --workspace @dm/backend run build
    startCommand: node packages/backend/dist/server.js
    healthCheckPath: /health
    envVars:
      - key: NODE_ENV
        value: production
      - key: AUTH_MODE
        value: entra
      - key: DATA_PROVIDER
        value: memory
      - key: BACKEND_PORT
        value: 4000
      - key: CORS_ORIGIN
        value: https://designersmeet-preview.surge.sh
      - key: ENTRA_TENANT_ID
        sync: false
      - key: ENTRA_CLIENT_ID
        sync: false
      - key: ENTRA_AUDIENCE
        sync: false
```

After picking a path and deploying, append the URL to this file under `Live URL` and check off this artifact in the Wave B report.
