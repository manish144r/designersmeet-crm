# OpenHands Architecture Review — DesignersMeet CRM
## Reviewer: OpenHands assessment (architecture focus)
## Date: 2026-05-06

---

## Architecture Assessment

### Overall Structure: B+
The monorepo layout is clean with proper workspace isolation:
```
packages/shared   → Zod schemas, constants (single source of truth)
packages/backend  → Express server, DI container, repository pattern
packages/frontend → React + Vite + TanStack Query + Tailwind
```

### Component Structure: B
**Good:**
- Pages are thin wrappers around API hooks + presentational markup
- Shared components (`KanbanBoard`, `MetricCard`) are properly extracted
- API layer is cleanly separated (`client.ts` for transport, `resources.ts` for domain)

**Needs work:**
- No component library or design system — raw Tailwind everywhere
- No form components (no create/edit modals for orders, freelancers, etc.)
- KanbanBoard is the only interactive component — rest is read-only tables
- Missing: pagination component, modal/dialog, toast/notification, confirmation dialog

### State Management: A-
**Good:**
- TanStack Query for server state — correct choice for a CRUD app
- No unnecessary client-side state stores (no Redux, no Zustand — appropriate)
- Query keys are well-structured: `["orders"]`, `["freelancers", filter1, filter2]`
- `staleTime: 30_000` is reasonable default

**Needs work:**
- No optimistic updates (mutations invalidate and refetch — acceptable for MVP)
- URL-based filter state would be better than `useState` for bookmarkability
- No global error/notification state (toasts)

### API Design: B-
**Good:**
- RESTful resource naming (`/api/orders`, `/api/freelancers`)
- Consistent `{ data: T }` response wrapper
- Zod validation on request bodies
- Proper HTTP status codes (201, 204, 400, 404)

**Needs work:**
- No pagination (critical gap)
- No sorting/ordering support
- No field selection (`?fields=name,email`)
- No bulk operations
- No API versioning
- No OpenAPI/Swagger documentation
- Webhook endpoint `/webhooks/shopify` is outside `/api` prefix (intentional but should be documented)

### Repository Pattern: A
**Good:**
- Clean `Repositories` interface aggregating all repos
- Three backend implementations (memory, Dataverse, SQL Server)
- Proper async/await throughout
- Dataverse client uses MSAL with fallback to DefaultAzureCredential

**Needs work:**
- No transaction support (order create + queue enqueue should be atomic)
- No soft delete support
- No audit trail (who changed what, when)

### Queue Architecture: B+
**Good:**
- `IQueueService` interface with 3 implementations
- Worker pattern with dedicated handlers per queue
- Retry with exponential backoff (0.5s, 1s, 2s)
- DLQ after 3 retries
- Queue stats introspection for dashboard

**Needs work:**
- In-memory queue loses messages on restart
- No backpressure mechanism
- No dead-letter queue processing/replay
- No circuit breaker for failing workers
- 250ms polling is wasteful

### Social Integration: C+
**Good:**
- Clean `ISocialPoster` interface
- Token stripping from API responses
- Queue-based async posting

**Needs work:**
- Only LinkedIn has a real implementation
- Facebook/Instagram are typed stubs that throw on `post()`
- No OAuth flow for connecting accounts (tokens must be manually inserted)
- No webhook handling for social platform callbacks
- No content scheduling (schema has `scheduled_at` but nothing reads it)

### Security Architecture: D (for production)
See codex-review.md for full findings. Summary:
- Auth is dev-only
- No RBAC
- Error message disclosure
- Missing input validation on some endpoints
- No rate limiting
- No CSRF protection (mitigated by API-only + CORS, but still)
- No request size limits per-endpoint

### Testing: F
- One test file exists: `cache.test.ts` for Dataverse cache
- No route tests, no worker tests, no frontend component tests
- `vitest.config.ts` is configured but empty test suites
- No E2E tests
- No CI configuration

---

## Recommendations (prioritized)

1. **Production auth** — MSAL integration (blocks deployment)
2. **RBAC middleware** — role-based route protection
3. **Pagination** — all list endpoints + frontend infinite scroll
4. **Error boundary** — prevent white-screen crashes
5. **Test coverage** — at minimum: route handler tests, worker tests
6. **API documentation** — OpenAPI spec auto-generated from Zod schemas
7. **Graceful shutdown** — SIGTERM handler
8. **Rate limiting** — express-rate-limit on all API routes
9. **Audit logging** — who did what, when
10. **Component library** — extract common UI patterns (tables, forms, modals)
