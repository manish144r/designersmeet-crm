// Demo-mode flag + back-compat accessor. The real data now lives in the
// mutable demoStore (seeded from demoFixtures — the pages' own verbatim rows),
// so wired buttons perform real CRUD on the static surge deploy.
import { demoStore } from "./demoStore.js";

export { demoStore };

// VITE_DEMO_MODE=true (default) OR dev auth → no backend; hooks use demoStore.
export const DEMO_MODE =
  (import.meta.env.VITE_DEMO_MODE ?? "true") === "true" ||
  (import.meta.env.VITE_AUTH_MODE ?? "dev") === "dev";

// Back-compat: `demoData[resource]` returns the current live rows.
export const demoData: Record<string, Array<Record<string, unknown>>> = new Proxy(
  {},
  {
    get: (_t, key: string) => demoStore.list(key).data,
  },
) as Record<string, Array<Record<string, unknown>>>;
