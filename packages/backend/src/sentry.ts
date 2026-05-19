// Env-gated error reporting. No-op unless SENTRY_DSN is set AND @sentry/node
// is installed (dynamic import keeps it an optional, zero-cost dependency).
import { config } from "./config.js";
import { logger } from "./logger.js";

type Sentry = { captureException: (e: unknown) => void };
let client: Sentry | null = null;

export async function initSentry(): Promise<void> {
  if (!config.SENTRY_DSN) return;
  try {
    // Non-literal specifier so tsc does not require @sentry/node at build
    // time — it is an optional runtime dependency, env-gated by SENTRY_DSN.
    const spec = "@sentry/node";
    const mod = (await import(spec)) as unknown as {
      init: (o: Record<string, unknown>) => void;
      captureException: (e: unknown) => void;
    };
    mod.init({ dsn: config.SENTRY_DSN, environment: config.NODE_ENV });
    client = { captureException: mod.captureException };
    logger.info("Sentry initialised");
  } catch {
    logger.warn("SENTRY_DSN set but @sentry/node not installed — error reporting disabled");
  }
}

export function captureException(err: unknown): void {
  client?.captureException(err);
}
