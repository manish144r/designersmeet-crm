// Express app for the DesignersMeet CRM (15-page surface from brief/mockups).
import cors from "cors";
import express, { type Express } from "express";
import helmet from "helmet";
import morgan from "morgan";
import { config } from "../config.js";
import { errorHandler } from "../middleware/errorHandler.js";
import { authMiddleware } from "../auth/authMiddleware.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { crmRouter } from "./router.js";
import { domainRouter } from "./domain.js";
import { waveBRouter } from "./waveBRouter.js";
import { integrationStatuses } from "../integrations/registry.js";
import { meta } from "../integrations/meta/index.js";

const metrics = { requests: 0, errors: 0, startedAt: Date.now() };

export function createApp(): Express {
  const app = express();

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'", "https://rsms.me"],
          fontSrc: ["'self'", "https://rsms.me"],
          imgSrc: ["'self'", "data:", "https:"],
          connectSrc: ["'self'"],
        },
      },
    }),
  );

  const allowed = config.CORS_ORIGIN.split(",").map((o) => o.trim());
  app.use(
    cors({
      origin: (origin, cb) =>
        !origin || allowed.includes("*") || allowed.includes(origin)
          ? cb(null, true)
          : cb(new Error("Not allowed by CORS")),
      credentials: true,
    }),
  );
  app.use(morgan("dev"));
  app.use(express.json({ limit: "2mb" }));
  app.use((_req, res, next) => {
    metrics.requests += 1;
    res.on("finish", () => {
      if (res.statusCode >= 500) metrics.errors += 1;
    });
    next();
  });

  const healthBody = () => ({
    status: "ok",
    app: "designersmeet-crm",
    data_provider: config.DATA_PROVIDER,
    auth_mode: config.AUTH_MODE,
    time: new Date().toISOString(),
  });
  // Liveness (/health kept for back-compat with render.yaml + existing tests).
  app.get("/health", (_req, res) => res.json(healthBody()));
  app.get("/healthz", (_req, res) => res.json(healthBody()));
  // Readiness — the in-memory store is always ready; a real DB provider would
  // ping its connection here.
  app.get("/readyz", (_req, res) =>
    res.json({ status: "ready", data_provider: config.DATA_PROVIDER }),
  );
  // Prometheus-style plaintext metrics.
  app.get("/metrics", (_req, res) => {
    res.type("text/plain").send(
      [
        "# HELP dm_http_requests_total Total HTTP requests received",
        "# TYPE dm_http_requests_total counter",
        `dm_http_requests_total ${metrics.requests}`,
        "# HELP dm_http_errors_total Total HTTP 5xx responses",
        "# TYPE dm_http_errors_total counter",
        `dm_http_errors_total ${metrics.errors}`,
        "# HELP dm_uptime_seconds Process uptime",
        "# TYPE dm_uptime_seconds gauge",
        `dm_uptime_seconds ${Math.floor((Date.now() - metrics.startedAt) / 1000)}`,
        "",
      ].join("\n"),
    );
  });

  // All /api routes auth-gated (AUTH_MODE=dev injects a stub user;
  // AUTH_MODE=entra validates the MSAL/Entra JWT).
  app.use("/api", authMiddleware);
  app.use("/api", domainRouter());
  // Wave B overrides mount BEFORE the generic CRUD so the targeted routes
  // (api-keys POST with plaintext-once, sessions DELETE-as-revoke, etc.) win.
  app.use("/api", waveBRouter());
  app.use("/api", crmRouter());
  app.get(
    "/api/integrations",
    asyncHandler(async (_req, res) => {
      res.json({ data: await integrationStatuses() });
    }),
  );

  // Wave B integration endpoints — credentials present = real call,
  // credentials absent = Configure-state hint with env vars to set.
  app.get(
    "/api/integrations/meta/insights",
    asyncHandler(async (req, res) => {
      if (!config.META_ACCESS_TOKEN) {
        return res.status(501).json({
          error: "provider_not_configured",
          message: "Set META_ACCESS_TOKEN in secrets.env to enable Meta Page Insights",
          env_required: ["META_ACCESS_TOKEN", "META_PAGE_ID (optional)"],
        });
      }
      const pageId =
        (typeof req.query.page_id === "string" && req.query.page_id) ||
        config.META_PAGE_ID ||
        "me";
      const metric =
        typeof req.query.metric === "string" && req.query.metric
          ? req.query.metric
          : "page_impressions";
      try {
        const result = await meta.facebook.pageInsights(pageId, metric);
        return res.json({
          data: result.data,
          page_id: pageId,
          metric,
          connected: true,
        });
      } catch (err) {
        return res.status(502).json({
          error: "meta_api_error",
          message: String(err),
        });
      }
    }),
  );

  app.use(errorHandler);
  return app;
}
