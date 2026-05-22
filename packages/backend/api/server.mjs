/**
 * Vercel serverless function entry point (packages/backend rootDirectory).
 *
 * When Vercel's rootDirectory = packages/backend, this file is resolved as
 * api/server.mjs relative to that directory. It imports the Express app from
 * the TypeScript build output. The app must NOT call app.listen() — Vercel
 * wraps it as a serverless handler instead.
 */
import { createApp } from '../dist/crm/app.js';

const app = createApp();

export default app;
