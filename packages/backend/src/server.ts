import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import type { Server } from "http";
import { config } from "./config.js";
import { container } from "./container.js";
import { logger } from "./logger.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { authMiddleware } from "./auth/authMiddleware.js";
import { freelancersRouter } from "./routes/freelancers.js";
import { ordersRouter } from "./routes/orders.js";
import { servicesRouter } from "./routes/services.js";
import { shopifyMappingsRouter } from "./routes/shopifyMappings.js";
import { queueRouter } from "./routes/queue.js";
import { socialRouter } from "./routes/social.js";
import { shopifyWebhookRouter } from "./routes/shopifyWebhook.js";
import { startWorkers } from "./workers/index.js";

let httpServer: Server | undefined;

async function gracefulShutdown(signal: string) {
  logger.info({ signal }, "Received shutdown signal, cleaning up…");
  try {
    await container.queue.shutdown();
  } catch (err) {
    logger.error({ err }, "Error shutting down queue");
  }
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

async function bootstrap() {
  await container.init();

  const app = express();

  // CSP headers via helmet
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", "data:", "https:"],
          connectSrc: ["'self'"],
        },
      },
    }),
  );

  // CORS with allowlist support (comma-separated CORS_ORIGIN)
  const allowedOrigins = config.CORS_ORIGIN
    ? config.CORS_ORIGIN.split(",").map((o: string) => o.trim())
    : [];
  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes("*") || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error("Not allowed by CORS"));
        }
      },
      credentials: true,
    }),
  );
  app.use(morgan("dev"));

  // Shopify webhook needs raw body for HMAC verification — mount BEFORE express.json()
  app.use("/webhooks/shopify", shopifyWebhookRouter);

  app.use(express.json({ limit: "2mb" }));

  app.get("/health", (_req, res) => {
    res.json({
      status: "ok",
      data_provider: config.DATA_PROVIDER,
      queue_provider: config.QUEUE_PROVIDER,
      auth_mode: config.AUTH_MODE,
      time: new Date().toISOString(),
    });
  });

  // All /api routes are auth-gated (dev bypass injects a stub user when AUTH_MODE=dev)
  app.use("/api", authMiddleware);
  app.use("/api/freelancers", freelancersRouter);
  app.use("/api/orders", ordersRouter);
  app.use("/api/services", servicesRouter);
  app.use("/api/shopify-mappings", shopifyMappingsRouter);
  app.use("/api/queue", queueRouter);
  app.use("/api/social", socialRouter);

  app.use(errorHandler);

  startWorkers();

  httpServer = app.listen(config.BACKEND_PORT, () => {
    logger.info(
      { port: config.BACKEND_PORT, data_provider: config.DATA_PROVIDER, queue_provider: config.QUEUE_PROVIDER },
      "DesignersMeet CRM backend listening",
    );
  });
}

bootstrap().catch((err) => {
  logger.error({ err }, "Failed to bootstrap server");
  process.exit(1);
});
