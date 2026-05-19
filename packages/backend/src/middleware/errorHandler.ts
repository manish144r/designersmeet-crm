import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { logger } from "../logger.js";
import { captureException } from "../sentry.js";

export class HttpError extends Error {
  constructor(public status: number, message: string, public details?: unknown) {
    super(message);
  }
}

// Stable, machine-readable error envelope: { error, code, details }.
export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof ZodError) {
    res
      .status(400)
      .json({ error: "ValidationError", code: "VALIDATION_ERROR", details: err.issues });
    return;
  }
  if (err instanceof HttpError) {
    const det = (err.details ?? {}) as Record<string, unknown>;
    const code =
      typeof det.code === "string" ? det.code : `HTTP_${err.status}`;
    res.status(err.status).json({ error: err.message, code, details: err.details ?? null });
    return;
  }
  logger.error({ err }, "Unhandled error");
  captureException(err);
  // Fix #6: Never expose internal error details in production
  const isProduction = process.env.NODE_ENV === "production";
  res.status(500).json({
    error: "InternalServerError",
    code: "INTERNAL_ERROR",
    details: isProduction ? null : { message: err?.message ?? "unknown" },
  });
};
