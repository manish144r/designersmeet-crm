/**
 * api/server.mjs — Vercel serverless entry point for DesignersMeet CRM.
 *
 * Vercel's @vercel/node runtime detects that the default export is an Express
 * Application and wraps each incoming request through app(req, res).
 *
 * The compiled TypeScript output lives in ../dist/ (produced by `tsc` in the
 * vercel-build step). All routes, middleware, and auth are wired in createApp().
 *
 * Environment (set in vercel.json env block or Vercel project settings):
 *   AUTH_MODE=dev   DEMO_BYPASS=true   DATA_PROVIDER=memory   QUEUE_PROVIDER=memory
 */
import { createApp } from "../dist/crm/app.js";

export default createApp();
