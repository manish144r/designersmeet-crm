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
