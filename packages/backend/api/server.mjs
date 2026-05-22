/**
 * api/server.mjs — Vercel serverless entry point for DesignersMeet CRM.
 *
 * Vercel's @vercel/node runtime detects that the default export is an Express
 * Application and wraps each incoming request through app(req, res).
 *
 * When Vercel's rootDirectory = packages/backend, this file is resolved as
 * api/server.mjs relative to that directory. It imports the Express app from
 * the TypeScript build output. The app must NOT call app.listen() — Vercel
 * wraps it as a serverless handler instead.
 *
 * Environment (set in vercel.json env block or Vercel project settings):
 *   AUTH_MODE=dev   DEMO_BYPASS=true   DATA_PROVIDER=memory   QUEUE_PROVIDER=memory
 */
import { createApp } from "../dist/crm/app.js";

export default createApp();
