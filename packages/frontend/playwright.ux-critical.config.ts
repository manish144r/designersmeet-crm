// Critical-path subset config (daily schtask). Forces UX_SCOPE=critical
// before the runner reads it, dependency-free (no cross-env needed on Windows).
process.env.UX_SCOPE = process.env.UX_SCOPE ?? "critical";
if (!process.env.UX_SCOPE || process.env.UX_SCOPE === "full") process.env.UX_SCOPE = "critical";
import base from "./playwright.ux.config.js";
export default base;
