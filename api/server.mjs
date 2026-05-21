// Vercel serverless entry — wraps the Express app as a serverless function.
// The build step compiles packages/backend/src to packages/backend/dist before
// Vercel serves this file, so the relative import resolves correctly at runtime.
import { createApp } from '../packages/backend/dist/crm/app.js';

const app = createApp();
export default app;
