# DesignersMeet CRM

Custom CRM for **DesignersMeet** — Shopify-driven order intake, freelancer database, Microsoft-queue-driven workflows, LinkedIn pipeline (Facebook/Instagram ready). Replaces the role of a Power Apps app with a fully owned React + TypeScript stack.

## Why this exists

- **Frontend:** React 18 + Vite + TypeScript + Tailwind, themed in DesignersMeet Navy/Gold.
- **Backend:** Express + TypeScript with a strict **repository pattern** so swapping **Dataverse → SQL Server** is one env var (`DATA_PROVIDER=dataverse|sqlserver|memory`). No route ever touches a Dataverse SDK directly.
- **Queue:** Same swap shape via `QUEUE_PROVIDER=memory|azure-service-bus|supabase`. Workers handle order assignment, notifications, Shopify sync, and social posts asynchronously.
- **Vibe-coding friendly:** runs out of the box with `DATA_PROVIDER=memory` + `QUEUE_PROVIDER=memory` + `AUTH_MODE=dev` — no Azure tenant required to start iterating.

## Quickstart

```bash
cd crm-app
npm install
cp .env.example .env
npm run dev
```

Frontend → http://localhost:5173, backend → http://localhost:4000. The dashboard ships with 18 seeded freelancers across 10 categories (loaded from `../dm_launch/freelancer_db.json`).

## Switching backends

| Want | Set |
|------|-----|
| Local dev with seed data | `DATA_PROVIDER=memory`, `QUEUE_PROVIDER=memory`, `AUTH_MODE=dev` (defaults) |
| Dataverse | `DATA_PROVIDER=dataverse` + `DATAVERSE_URL` + `AZURE_TENANT_ID` + `AZURE_CLIENT_ID` + `AZURE_CLIENT_SECRET` |
| SQL Server | `DATA_PROVIDER=sqlserver` + `SQLSERVER_*` (or `docker compose up sqlserver`) |
| Azure Service Bus queue | `QUEUE_PROVIDER=azure-service-bus` + `SERVICE_BUS_CONNECTION_STRING` |
| Production auth | `AUTH_MODE=entra` + `ENTRA_TENANT_ID` + `ENTRA_CLIENT_ID` + `ENTRA_AUDIENCE` |

## Project layout

```
crm-app/
├─ packages/
│  ├─ shared/    Zod schemas & types — single source of truth for FE+BE
│  ├─ backend/   Express API, repositories, queue, workers, integrations
│  └─ frontend/  Vite + React + Tailwind UI (7 pages)
├─ docker-compose.yml
├─ .env.example
└─ README.md
```

## Verification

```bash
npm run typecheck                      # All three packages clean
npm run dev                            # FE + BE up; dashboard shows seeded data
curl -X POST http://localhost:4000/webhooks/shopify/orders/create \
  -H "X-Shopify-Hmac-SHA256: <signed>" -d @test/order.json
```

Drag an order between Kanban columns → status persists, Queue page shows a `notification` message in flight.

## Extending

- **New data backend:** add `packages/backend/src/repositories/<name>/`, register in `container.ts`. Routes do not change.
- **New queue backend:** add `packages/backend/src/queue/<name>Queue.ts`, register in `container.ts`.
- **New social channel:** add `packages/backend/src/integrations/social/<name>Poster.ts` implementing `ISocialPoster`. Frontend Social page picks it up automatically.

## Business context

Operational backbone for the DesignersMeet AI-augmented freelance arbitrage business (target $10K/month). Designed to feed the LinkedIn outbound pipeline and extend to other social channels.
