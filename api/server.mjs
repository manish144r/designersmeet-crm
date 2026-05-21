// Vercel serverless entry point — wraps the Express app without calling listen().
// Vercel routes /api/* here; the frontend static files are served from
// packages/frontend/dist via Vercel CDN (see vercel.json outputDirectory).
import { createApp } from "../packages/backend/dist/crm/app.js";

const app = createApp();
export default app;
