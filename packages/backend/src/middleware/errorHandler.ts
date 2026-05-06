import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { logger } from "../logger.js";

export class HttpError extends Error {
  constructor(public status: number, message: string, public details?: unknown) {
    super(message);
  }
}

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof ZodError) {
    res.status(400).json({ error: "ValidationError", issues: err.issues });
    return;
  }
  if (err instanceof HttpError) {
    res.status(err.status).json({ error: err.message, details: err.details });
    return;
  }
  logger.error({ err }, "Unhandled error");
  // Fix #6: Never expose internal error details in production
  const isProduction = process.env.NODE_ENV === "production";
  res.status(500).json({
    error: "InternalServerError",
    message: isProduction ? "An unexpected error occurred" : (err?.message ?? "unknown"),
  });
};
