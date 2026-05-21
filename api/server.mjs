/**
 * Vercel serverless function entry point.
 *
 * Vercel routes /api/* and /health* here (see vercel.json rewrites).
 * The Express app is imported from the TypeScript build output; it must NOT
 * call app.listen() — Vercel wraps it as a serverless handler instead.
 */
import { createApp } from '../packages/backend/dist/crm/app.js';

const app = createApp();

export default app;
