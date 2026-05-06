# Aider Code Review — DesignersMeet CRM
## Reviewer: Aider v0.86.2 + Ollama qwen2.5-coder:14b
## Date: 2026-05-06

---

## 1. Security Vulnerabilities

### CRITICAL
- **authMiddleware.ts:14** — Hardcoded `DEV_USER` with admin role. If `AUTH_MODE=dev` leaks to production, entire app is unauthenticated with full admin access.

### HIGH
- **shopifyWebhook.ts:13** — HMAC verification returns `true` when `SHOPIFY_WEBHOOK_SECRET` is not configured. Any external actor can inject fake Shopify orders in dev/staging.
- **social.ts:61** — `data.account_id` is validated by Zod (`SocialPostRequest`), but the account lookup doesn't verify ownership — any authenticated user can post via any social account.

### MEDIUM
- **orders.ts:12** — `OrderStatus.parse(req.query.status)` throws ZodError on invalid input. While asyncHandler catches it, the error message reveals schema details.
- **freelancers.ts:13-14** — `availability_status` query param is passed directly as string without Zod validation against allowed enum values.

### LOW
- **shopifyWebhook.ts:38** — `JSON.parse` on raw body is inside try/catch (via the outer handler), but malformed JSON produces a generic 500 rather than a clear 400.

## 2. Performance Issues

### CRITICAL
- **All list endpoints** — Orders, freelancers, services, mappings all return unbounded result sets. No `limit`, `offset`, or cursor pagination. Will degrade as data grows.

### HIGH
- **Dashboard.tsx:6-12** — Fetches ALL orders and ALL freelancers just to compute 6 metric counts. Should use server-side aggregation endpoints.
- **Orders.tsx:8-9** — Same issue — fetches full order + freelancer lists for the Kanban board.

### MEDIUM
- **inMemoryQueue.ts:19** — `setInterval(250ms)` polling runs continuously even when all queues are empty. Wastes CPU cycles.
- **Dashboard.tsx:11** — `refetchInterval: 5_000` on queue stats is aggressive for a dashboard.
- **KanbanBoard.tsx:32** — `freelancerById` Map is recreated on every render. Should be wrapped in `useMemo`.

## 3. Code Quality

### HIGH
- **Query parameter parsing** — Each route file reimplements the same pattern of extracting/validating query strings. Should be extracted to a shared middleware or utility.
- **DRY violation** — `asyncHandler` pattern repeated across all route files.

### MEDIUM  
- **Inconsistent error handling** — Webhook routes use manual try/catch, other routes rely on asyncHandler. Should pick one pattern.

## 4. Missing Error Handling

### CRITICAL
- **No React Error Boundary** — Any runtime error in a component crashes the entire app with a white screen.

### HIGH
- **No graceful shutdown** — `server.ts` doesn't handle SIGTERM/SIGINT. Queue `shutdown()` is never called. In-flight messages are lost.
- **No error state in UI** — React Query's `isError`/`error` states are never rendered in any page component.

### MEDIUM
- **OrderStatus.parse** can throw in asyncHandler, but the ZodError → 400 response reveals internal schema structure.

## 5. TypeScript Type Safety

### HIGH
- **orders.ts:73** — `req.body as { freelancer_id?: string }` — inline type assertion bypasses Zod validation on the assign endpoint.
- **api/client.ts:24** — `return undefined as T` on 204 responses is an unsafe type assertion.

### MEDIUM
- **socialPostWorker.ts:17** — `account.platform as SocialPlatform` redundant cast. The platform field already comes from the DB as SocialPlatform.
- **inMemoryQueue.ts:45** — `handler as unknown as QueueHandler` double cast to erase generic type info.

## 6. React Anti-Patterns

### MEDIUM
- **KanbanBoard.tsx:32** — `freelancerById` Map allocated every render. Wrap in `useMemo(…, [freelancers])`.
- **Freelancers.tsx filter state** — `availability` and `category` state could use URL search params for shareable/bookmarkable filters.

### LOW
- **No Suspense boundaries** — React Query's loading states are handled manually instead of using React Suspense.

## 7. Accessibility

### CRITICAL
- **KanbanBoard.tsx** — Drag-drop has no keyboard alternative. Screen reader users cannot move orders between columns.

### HIGH
- **App.tsx nav** — `NavLink` elements lack `aria-current="page"` (react-router adds it, but custom className doesn't reflect it for screen readers).
- **All tables** — No `<caption>` elements. `<th>` elements lack `scope` attribute.
- **Select dropdowns** — No associated `<label>` elements on Freelancers page filters.

### MEDIUM
- **Dashboard metric cards** — No semantic structure (e.g., `role="status"` or `aria-label`).
- **Color contrast** — `text-textDim` and `text-ice-dim` classes likely fail WCAG AA contrast ratios against dark backgrounds.

---

**Total findings: 28**
- CRITICAL: 5
- HIGH: 10  
- MEDIUM: 10
- LOW: 3
