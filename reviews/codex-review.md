# Codex / Claude Deep Review — DesignersMeet CRM
## Reviewer: Claude Opus 4.6 (acting as Codex-level deep reviewer)
## Date: 2026-05-06

---

## Executive Summary

The DesignersMeet CRM is a well-architected monorepo with clean separation of concerns (DI container, repository pattern, typed schemas). However, it is currently in **MVP/dev-only state** and has significant gaps that block production deployment, particularly around authentication, authorization, and data integrity.

**Deployment Readiness for Power Apps: NOT READY**
- Auth is dev-only (stub user, no MSAL)
- No RBAC enforcement
- No pagination on any endpoint
- No error boundaries in UI
- No graceful shutdown
- No test coverage visible

---

## CRITICAL FINDINGS (Block Production)

### C1. Authentication is dev-only — no production path exists
**Files:** `authMiddleware.ts`, `AuthProvider.tsx`, `api/client.ts`
**Impact:** The entire app runs unauthenticated. Even when `AUTH_MODE=entra` is set, the frontend never attaches a Bearer token (`getAccessToken()` returns null and is never called by the API client).

**Fix chain:**
1. `AuthProvider.tsx` — integrate `@azure/msal-react`, implement `getAccessToken()` returning real Entra ID tokens
2. `api/client.ts` — call `getAccessToken()` in the `request()` function and attach `Authorization: Bearer <token>` header
3. `config.ts` — add `z.refine()` that enforces `AUTH_MODE !== 'dev'` when `NODE_ENV === 'production'`

**Effort:** 4-6 hours

### C2. No authorization / RBAC
**Files:** All route files
**Impact:** Any authenticated user can delete any order, freelancer, or service. No role checks anywhere.

**Fix:**
1. Add `requireRole('admin')` middleware to destructive endpoints (DELETE, POST for social)
2. Add `requireOwner()` middleware for order assignment (freelancer can only see own assignments)
3. Define roles in Entra ID app registration, map to `req.user.roles`

**Effort:** 3-4 hours

### C3. Unsafe type assertion on order assign endpoint
**File:** `orders.ts:73`
```typescript
const { freelancer_id } = req.body as { freelancer_id?: string };
```
**Impact:** Bypasses Zod validation. Attacker can send `{ freelancer_id: 123 }` (number) or inject unexpected fields.

**Fix:**
```typescript
const AssignBody = z.object({ freelancer_id: z.string().uuid() });
const { freelancer_id } = AssignBody.parse(req.body);
```
**Effort:** 10 minutes

### C4. No React Error Boundary
**Files:** `main.tsx`, all page components
**Impact:** Any uncaught error (e.g., undefined property access on a null API response) crashes the entire app to a white screen.

**Fix:** Add `ErrorBoundary` component wrapping `<App />` in `main.tsx`. Render a fallback UI with retry button.

**Effort:** 30 minutes

### C5. In-memory queue data loss
**File:** `inMemoryQueue.ts`
**Impact:** All pending/processing messages are lost on server restart. If used in any non-dev environment, orders from Shopify webhooks will silently disappear.

**Fix:** Add a warning log at startup when `QUEUE_PROVIDER=memory` and `NODE_ENV=production`. Better: default to Supabase queue in production.

**Effort:** 15 minutes (warning), 2 hours (Supabase queue default)

---

## HIGH FINDINGS

### H1. Error message information disclosure
**File:** `errorHandler.ts:21`
```typescript
res.status(500).json({ error: "InternalServerError", message: err?.message ?? "unknown" });
```
**Impact:** Stack traces, SQL errors, or credential paths could leak to the client.

**Fix:** Only include `err.message` when `NODE_ENV === 'development'`. In production, return a correlation ID instead.

### H2. Shopify HMAC bypass in dev
**File:** `shopifyWebhook.ts:13`
**Impact:** When `SHOPIFY_WEBHOOK_SECRET` is unset, HMAC verification returns `true`. If this config is missing in staging/production, anyone can inject fake orders.

**Fix:** Make `SHOPIFY_WEBHOOK_SECRET` required when `NODE_ENV !== 'development'`. Add Zod refinement in `config.ts`.

### H3. No pagination on any list endpoint
**Files:** All route files, all frontend API calls
**Impact:** As data grows, list endpoints return unbounded result sets. 10K orders = ~5MB JSON per request.

**Fix:** Add `limit` (default 50, max 200) and `offset` query params to all list endpoints. Update frontend to paginate or use infinite scroll.

### H4. No graceful shutdown
**File:** `server.ts`
**Impact:** SIGTERM kills the process instantly. In-flight queue messages, DB connections, and HTTP requests are terminated mid-operation.

**Fix:**
```typescript
const server = app.listen(config.BACKEND_PORT, ...);
process.on('SIGTERM', async () => {
  server.close();
  await container.queue.shutdown();
  process.exit(0);
});
```

### H5. Frontend API client never sends auth token
**File:** `api/client.ts`
**Impact:** Even if backend auth is enabled, frontend requests will always fail with 401.

**Fix:** Import `useAuth` or pass `getAccessToken` to the API client. Add an interceptor that attaches the Bearer token.

### H6. Social token storage security
**File:** `social.ts:29`, memory store
**Impact:** `access_token` and `refresh_token` are stored in plain text in the repository. While stripped from API responses, they could leak through error messages, logs, or debug endpoints.

**Fix:** Encrypt tokens at rest. Use Azure Key Vault or environment-level encryption for production.

---

## MEDIUM FINDINGS

### M1. Dashboard fetches all data for metrics
Fetch ALL orders + ALL freelancers to compute 6 counts. Add `/api/dashboard/stats` aggregate endpoint.

### M2. Queue polling at 250ms
`inMemoryQueue.ts` polls every 250ms. Use event-driven approach or at minimum increase to 1000ms.

### M3. KanbanBoard Map recreation
`freelancerById` Map created every render. Wrap in `useMemo(() => new Map(freelancers.map(...)), [freelancers])`.

### M4. Container is a singleton module
`container.ts` exports a module-level singleton. Makes unit testing routes difficult. Consider accepting container as middleware parameter.

### M5. No health checks for dependencies
`/health` only returns static config info. Should actually ping Dataverse/SQL Server/queue to verify connectivity.

### M6. Workers start synchronously
`startWorkers()` is called synchronously in `bootstrap()`. If one queue subscription fails, the entire server fails to start.

### M7. CORS origin is single-value
`config.CORS_ORIGIN` is a single string. Multi-origin support (e.g., staging + production) requires comma-separated parsing.

---

## LOW FINDINGS

### L1. No loading skeletons in UI
### L2. No test files for routes, workers, or frontend components (except one cache test)
### L3. `seed.ts` path uses relative path `../../../dm_launch/` — fragile
### L4. Shopify webhook limit `5mb` is generous — most orders are <100KB
### L5. Missing `.env.example` file for developer onboarding

---

## Architecture Assessment

**Strengths:**
- Clean DI pattern with swappable providers (memory/Dataverse/SQL Server)
- Zod schemas in shared package — single source of truth
- Queue abstraction supports 3 backends
- Proper HMAC verification logic (when configured)
- TypeScript end-to-end with no `any` types in shared schemas

**Weaknesses:**
- No test infrastructure beyond one unit test
- No CI/CD pipeline configuration
- No API documentation (OpenAPI/Swagger)
- No database migration tooling
- No rate limiting on any endpoint
- No request logging/tracing beyond morgan
- No WebSocket/SSE for real-time updates (queue stats poll instead)

**Power Apps Deployment Gaps:**
1. Dataverse entity definitions not included (need solution XML or PCF)
2. No PAC CLI deployment scripts
3. No Dataverse-specific error handling (throttling, batch limits)
4. No model-driven app shell or canvas app wrapper
