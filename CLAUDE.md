# DesignersMeet CRM

AI-augmented freelance arbitrage platform — React + TypeScript with switchable Dataverse/SQL Server/in-memory backends.

## Architecture

**Monorepo** (npm workspaces):
- `packages/shared/` — Zod schemas + TypeScript types (single source of truth)
- `packages/backend/` — Express API (port 4000), repositories, queue workers, integrations
- `packages/frontend/` — Vite + React + Tailwind UI (port 5173)

**Repository Pattern:**
- All data access goes through `packages/backend/src/repositories/`
- Composition root: `packages/backend/src/container.ts` wires the active provider
- Routes never import cloud SDKs directly — only repository interfaces
- Provider is selected at runtime via `DATA_PROVIDER` env var

**Provider Configuration:**

| Env Var | Values | Default | Notes |
|---------|--------|---------|-------|
| `DATA_PROVIDER` | `memory` / `dataverse` / `sqlserver` | `memory` | Selects active data store |
| `QUEUE_PROVIDER` | `memory` / `azure-service-bus` / `supabase` | `memory` | Selects queue implementation |
| `AUTH_MODE` | `dev` / `entra` | `dev` | Auth bypass in dev mode |

## Key Patterns

- **Zod first** — define schema in `packages/shared/`, infer types, share with backend and frontend
- **Repository interfaces** — `IFreelancerRepository`, `IOrderRepository`, etc. — implementations in `dataverse/`, `sqlserver/`, `memory/` subfolders
- **React Query** for all data fetching — never use raw fetch in components
- **Zustand** for UI state — never useState for cross-component state
- **React Hook Form + Zod resolver** for forms — always validate via shared schemas
- **MSAL** for Azure AD auth in production (`@azure/msal-react`)

## Dataverse Integration

Client: `packages/backend/src/repositories/dataverse/client.ts`
- Uses `@azure/identity` `ClientSecretCredential` (or `DefaultAzureCredential` in Azure)
- Web API endpoint: `${DATAVERSE_URL}/api/data/v9.2`
- Methods: `retrieveMultiple()`, `retrieve()`, `create()`, `update()`, `delete()`
- Token scope: `${DATAVERSE_URL}/.default`

Required env vars when `DATA_PROVIDER=dataverse`:
```
DATAVERSE_URL=https://orgXXXXXX.crm6.dynamics.com
AZURE_TENANT_ID=<tenant-guid>
AZURE_CLIENT_ID=<app-registration-id>
AZURE_CLIENT_SECRET=<secret-value>
```

## Dev Commands

```powershell
npm install              # Install all workspace deps
npm run dev              # Concurrently runs backend (4000) + frontend (5173)
npm run build            # Production build all 3 packages
npm run typecheck        # TypeScript check across all packages
npm run lint             # ESLint backend + frontend
npm run seed             # Seed in-memory DB with test data
npm test                 # Run Vitest (once configured)
```

## Backend Routes

- `/api/orders` — Order CRUD, status transitions, freelancer assignment
- `/api/freelancers` — Freelancer CRUD, skill matching
- `/api/services` — Service catalog management
- `/api/shopify-mappings` — Shopify product to service mappings
- `/api/queue` — Queue depth, retry, DLQ visibility
- `/api/social` — Social posting orchestration
- `/api/shopify-webhook` — Inbound Shopify order webhooks
- `/health` — Liveness probe

## Frontend Pages

7 pages in `packages/frontend/src/pages/`:
Dashboard, Orders (Kanban with @dnd-kit), Freelancers, Services, Shopify Mappings, Queue Monitor, Settings

## Testing

- Framework: **Vitest** (when configured)
- React tests: `@testing-library/react` + `jsdom`
- Setup file: `packages/frontend/src/test/setup.ts`
- Run: `npm test` (CI) or `npm run test:watch` (dev)

## Power Apps Deployment

Target: model-driven app in Manish's Power Apps environment.

**Strategy: Hybrid**
1. **PCF controls** for specialized UI (Kanban board, drag-drop components)
   - Scaffold: `pac pcf init --template react`
   - Deploy: `pac pcf push --publisher-prefix dm`
2. **Custom Page** for the full dashboard SPA
   - Build: `npm run build` then upload `packages/frontend/dist/` as Web Resource
3. **Backend** runs as Azure Function (consumption plan, ~$0-5/mo)

## PAC CLI Quick Reference

```powershell
pac auth create --environment <url>     # Create auth profile
pac auth list                            # List profiles
pac org who                              # Verify connection
pac env list                             # List environments
pac solution list                        # List solutions in current env
pac solution export --path ./solution --name DesignersMeetCRM --managed false
pac solution import --path ./solution/DesignersMeetCRM.zip
pac pcf init --name <X> --namespace DesignersMeet --template react
pac pcf push --publisher-prefix dm
```

## Anti-Patterns (Never Do)

1. Don't import cloud SDKs (`@azure/service-bus`, `mssql`, etc.) directly in routes — use the repository interface
2. Don't define types twice — define Zod schema in `packages/shared/`, infer types, import everywhere
3. Don't use `fetch` in components — use React Query hooks
4. Don't put credentials in code — always `.env` (and `.env.example` for docs only)
5. Don't write Dataverse OData queries inline — wrap in repository methods
6. Don't run `pac` commands without first verifying `pac auth list` shows the right environment

## Business Context

DesignersMeet is an AI-augmented freelance arbitrage business in the Night Factory portfolio. The CRM coordinates:
- Inbound Shopify orders to freelancer pool, with delivery monitoring
- Social media posting pipeline (drives inbound)
- Queue-driven workers (memory in dev, Azure Service Bus or Supabase in prod)

Target revenue: $10K/month at scale.

## Design Architecture Agent (legacy invocation)

**Model:** `claude-opus-4-7`

The Design Architect runs at two mandatory points around every Aider UI brief.

1. **Pre-build** — consumes one BRIEF section and produces `brief/design-docs/BRIEF-XX-design.md` with five fixed sections: Data Model, Frontend Interaction Spec, Component Wiring Map, Acceptance Criteria, Playwright Test Stubs. No "TBD". Every UI element has a defined action; every API call has a full contract; every AC is binary. Aider only runs after this doc exists.
2. **Post-build** — consumes the design doc plus the git diff produced by Aider and emits `brief/reviews/BRIEF-XX-conformance.md`. Each AC is reported PASS or BLOCK with `file:line` and `found vs expected`. The report ends with exactly `Overall verdict: PASS` or `Overall verdict: BLOCK`. BLOCK reruns Aider with the report attached, up to 2 reruns, then escalates to a human.

**Command:**

```bash
./brief/run-with-design-architect.sh BRIEF-XX
```

**Hard rules:**
- NO brief goes to Aider without a design doc.
- NO build merges without a conformance PASS.

Full spec: `brief/design-architecture-agent-spec.md`. Worked example: `brief/design-docs/BRIEF-EXAMPLE-design.md`.

## Agent Training Framework
All agents are trained via the `agents/` directory in this repo. The Design Architecture Agent above is the runtime invocation; the files below are the per-agent training docs that govern its behaviour (and every other agent in the pipeline).

Before starting any build: read the relevant agent training file.
After any failure: update `agents/lessons-learned.md`.
Run `./agents/retro-runner.sh` weekly.

- `agents/00-pipeline-master-checklist.md` — phase-by-phase pass/fail gates
- `agents/01-design-architect-agent.md` — Opus 4.7, first gate, design doc owner
- `agents/02-builder-agent.md` — Aider + Sonnet, implements against the doc
- `agents/03-reviewer-agent.md` — Codex, BLOCKs anything that drifts
- `agents/04-tester-agent.md` — Playwright + Vitest + axe-core
- `agents/05-security-agent.md` — OWASP Top 10, SAST/DAST, secrets
- `agents/06-devops-agent.md` — CI/CD, IaC, monitoring, runbooks
- `agents/07-self-learning-system.md` — how lessons feed back into training
- `agents/08-mobile-ios-windows-linux.md` — platform-specific add-ons
- `agents/09-website-specific.md` — SEO, perf, a11y, analytics, e-commerce
- `agents/lessons-learned.md` — append-only failure log
- `agents/retro-runner.sh` — weekly retro generator
