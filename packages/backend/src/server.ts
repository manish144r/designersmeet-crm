import type { Server } from "http";
import { config } from "./config.js";
import { logger } from "./logger.js";
import { createApp } from "./crm/app.js";
import { initSentry } from "./sentry.js";

let httpServer: Server | undefined;

function gracefulShutdown(signal: string) {
  logger.info({ signal }, "Received shutdown signal, cleaning up…");
  if (httpServer) {
    httpServer.close(() => {
      logger.info("HTTP server closed");
      process.exit(0);
    });
    setTimeout(() => {
      logger.warn("Forced shutdown after timeout");
      process.exit(1);
    }, 10_000);
  } else {
    process.exit(0);
  }
}

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

void initSentry();

const app = createApp();
httpServer = app.listen(config.BACKEND_PORT, () => {
  logger.info(
    { port: config.BACKEND_PORT, data_provider: config.DATA_PROVIDER, auth_mode: config.AUTH_MODE },
    "DesignersMeet CRM backend listening",
  );
});
