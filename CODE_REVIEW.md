# DesignersMeet CRM — Consolidated Code Review
## Multi-LLM Review Pipeline Results
## Date: 2026-05-06

---

## Review Pipeline

| Reviewer | Model/Tool | Focus | Status |
|----------|-----------|-------|--------|
| Aider | ollama/qwen2.5-coder:14b | 7-category structured review | Complete |
| Ollama Direct | qwen2.5-coder:14b | Targeted issue validation | Complete |
| Claude/Codex | Claude Opus 4.6 | Deep analysis + deployment readiness | Complete |
| OpenHands | Architecture assessment | Structure, patterns, API design | Complete |

Individual reports: `reviews/aider-review.md`, `reviews/codex-review.md`, `reviews/openhands-review.md`, `reviews/ollama-review-raw.md`
Synthesis: `reviews/multi-llm-synthesis.md`

---

## Codebase Overview

- **Stack:** React 18 + TypeScript + Vite (frontend), Express + Node (backend), Zod (validation)
- **Architecture:** Monorepo with 3 packages (shared, backend, frontend)
- **Patterns:** DI container, repository pattern, queue abstraction, async workers
- **Data providers:** Memory (dev), Dataverse (Power Apps), SQL Server
- **Files:** ~80 TypeScript files, ~4,500 lines of code
- **Test coverage:** Minimal (1 test file)

---

## CRITICAL Issues (5) — Block Production Deployment

### 1. Authentication is dev-only
**Files:** `authMiddleware.ts`, `AuthProvider.tsx`, `api/client.ts`
**All 4 reviewers flagged this.**

The entire auth stack is stubbed. `AUTH_MODE=dev` injects a hardcoded admin user. The frontend `AuthProvider` always returns `DEV_USER`. The API client never attaches a Bearer token.

**Fix:** Integrate `@azure/msal-react`, implement real `getAccessToken()`, attach tokens in API client, add env guard preventing dev mode in production.
**Effort:** 4-6 hours

### 2. No Role-Based Access Control (RBAC)
**Files:** All route files
**3 of 4 reviewers flagged this.**

Any authenticated user can perform any action including deleting orders, freelancers, and services. No role checks on any endpoint.

**Fix:** Add `requireRole(role)` middleware. Apply to destructive endpoints. Map roles from Entra ID JWT claims.
**Effort:** 3-4 hours

### 3. Unsafe type assertion on order assign endpoint
**File:** `orders.ts:73`
```typescript
const { freelancer_id } = req.body as { freelancer_id?: string };
```

Bypasses Zod validation. Allows injection of unexpected fields or wrong types.

**Fix:** `const { freelancer_id } = z.object({ freelancer_id: z.string().uuid() }).parse(req.body);`
**Effort:** 10 minutes

### 4. No React Error Boundary
**Files:** `main.tsx`, all page components

Any runtime error crashes the entire app to a white screen with no recovery.

**Fix:** Create `ErrorBoundary.tsx`, wrap `<App />` in `main.tsx`.
**Effort:** 30 minutes

### 5. In-memory queue loses all messages on restart
**File:** `inMemoryQueue.ts`

Pending Shopify webhook orders silently disappear on server restart.

**Fix:** Log warning when `QUEUE_PROVIDER=memory` in production. Default to Supabase queue when `NODE_ENV=production`.
**Effort:** 15 min (warning) / 2 hours (default swap)

---

## HIGH Issues (8)

### 6. Error message information disclosure
**File:** `errorHandler.ts:21` — `err.message` sent to client on 500 errors. Could expose SQL errors, file paths, or credentials.
**Fix:** Mask in production, return correlation ID only. **Effort:** 20 min

### 7. Shopify HMAC bypass when secret is unset
**File:** `shopifyWebhook.ts:13` — Returns `true` when `SHOPIFY_WEBHOOK_SECRET` is not configured.
**Fix:** Make secret required when `NODE_ENV !== 'development'`. **Effort:** 15 min

### 8. No pagination on any list endpoint
**Files:** All route files, all frontend API calls.
**Fix:** Add `limit`/`offset` params to all list endpoints. **Effort:** 4-6 hours

### 9. Frontend API client never sends auth token
**File:** `api/client.ts` — `getAccessToken()` is available but never called.
**Fix:** Add auth header interceptor. **Effort:** 30 min

### 10. No graceful shutdown
**File:** `server.ts` — No SIGTERM handler. Queue `shutdown()` never called.
**Fix:** Add signal handler, close server, shutdown queue. **Effort:** 30 min

### 11. No test coverage
Only `cache.test.ts` exists. No route, worker, or component tests.
**Fix:** Add vitest tests for critical paths. **Effort:** 8-12 hours

### 12. No transaction atomicity
Order create + queue enqueue are separate operations. Queue enqueue could fail after order is created.
**Fix:** Wrap in transaction or implement saga pattern. **Effort:** 2-3 hours

### 13. Workers start synchronously
**File:** `workers/index.ts` — One failed subscription blocks all workers.
**Fix:** Start each worker independently with error isolation. **Effort:** 30 min

---

## MEDIUM Issues (9)

| # | Issue | File | Effort |
|---|-------|------|--------|
| 14 | Dashboard fetches ALL orders for metrics | Dashboard.tsx | 2h |
| 15 | Queue polls at 250ms even when idle | inMemoryQueue.ts | 30min |
| 16 | KanbanBoard no keyboard a11y | KanbanBoard.tsx | 2h |
| 17 | Missing ARIA labels on nav, tables, selects | App.tsx, all pages | 2h |
| 18 | Container singleton not testable | container.ts | 3h |
| 19 | No health checks for downstream deps | server.ts | 1h |
| 20 | Social `scheduled_at` field never consumed | socialPostWorker.ts | 1h |
| 21 | Social token storage in plain text | memory store | 2h |
| 22 | CORS single-origin only | config.ts | 15min |

---

## LOW Issues (5)

| # | Issue | File |
|---|-------|------|
| 23 | KanbanBoard freelancerById Map not memoized | KanbanBoard.tsx:32 |
| 24 | No loading skeletons (just "Loading..." text) | All pages |
| 25 | Seed path uses fragile relative path | config.ts |
| 26 | Missing .env.example | Root |
| 27 | Shopify webhook body limit 5MB is generous | shopifyWebhook.ts |

---

## Fix Plan — Estimated Total Effort

| Priority | Count | Total Effort |
|----------|-------|-------------|
| P0 (Critical) | 5 | ~10 hours |
| P1 (High) | 8 | ~18 hours |
| P2 (Medium) | 9 | ~14 hours |
| P3 (Low) | 5 | ~3 hours |
| **Total** | **27** | **~45 hours** |

---

## Architecture Strengths (acknowledged by all reviewers)

- Clean DI container with swappable providers
- Zod schemas as single source of truth in shared package
- Queue abstraction supporting 3 backends
- Proper HMAC verification logic (when configured)
- TypeScript end-to-end with no `any` types in schemas
- Good separation of concerns (routes, repos, workers, middleware)
- asyncHandler properly catches promise rejections

---

## Deployment Readiness Assessment

| Criterion | Status | Blocker? |
|-----------|--------|----------|
| Authentication | Dev-only stub | YES |
| Authorization / RBAC | Not implemented | YES |
| Input validation | Mostly complete (1 gap) | YES |
| Error handling | Partial (no boundary, info disclosure) | YES |
| Pagination | Not implemented | Soft blocker |
| Test coverage | <1% | Soft blocker |
| Graceful shutdown | Not implemented | No |
| Monitoring/logging | Basic (morgan only) | No |
| API documentation | Not implemented | No |
| CI/CD pipeline | Not configured | No |
| Power Apps integration | Dataverse client exists, no solution files | No |

**Verdict: NOT READY for production. Estimated 10-15 hours of P0 fixes needed before first deployment.**
