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
import { integrationStatuses } from "../integrations/registry.js";

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

  app.get("/health", (_req, res) => {
    res.json({
      status: "ok",
      app: "designersmeet-crm",
      data_provider: config.DATA_PROVIDER,
      auth_mode: config.AUTH_MODE,
      time: new Date().toISOString(),
    });
  });

  // All /api routes auth-gated (AUTH_MODE=dev injects a stub user;
  // AUTH_MODE=entra validates the MSAL/Entra JWT).
  app.use("/api", authMiddleware);
  app.use("/api", crmRouter());
  app.get(
    "/api/integrations",
    asyncHandler(async (_req, res) => {
      res.json({ data: await integrationStatuses() });
    }),
  );

  app.use(errorHandler);
  return app;
}
