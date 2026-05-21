// Auth middleware. AUTH_MODE=dev injects a stub user (no token required).
// AUTH_MODE=entra validates a JWT against Entra ID's JWKS.
// SECURITY: dev mode is blocked in production (NODE_ENV=production requires AUTH_MODE=entra).
import type { Request, Response, NextFunction } from "express";
import { createRemoteJWKSet, jwtVerify } from "jose";
import { config } from "../config.js";
import { HttpError } from "../middleware/errorHandler.js";
import { logger } from "../logger.js";

// ─── Types ───────────────────────────────────────────────────────────────
export type AppRole = "admin" | "designer" | "client";

declare module "express-serve-static-core" {
  interface Request {
    user?: { sub: string; email: string; name: string; roles: AppRole[] };
  }
}

const DEV_USER = {
  sub: "demo-user",
  email: config.DEMO_BYPASS_EMAIL,
  name: "Demo Vendor Admin",
  roles: ["admin"] as AppRole[],
};

// ─── JWKS singleton ──────────────────────────────────────────────────────
let jwks: ReturnType<typeof createRemoteJWKSet> | null = null;
function getJwks() {
  if (!config.ENTRA_TENANT_ID) throw new Error("ENTRA_TENANT_ID required for AUTH_MODE=entra");
  if (!jwks) {
    jwks = createRemoteJWKSet(
      new URL(`https://login.microsoftonline.com/${config.ENTRA_TENANT_ID}/discovery/v2.0/keys`),
    );
  }
  return jwks;
}

// ─── Auth Middleware ─────────────────────────────────────────────────────
export async function authMiddleware(req: Request, _res: Response, next: NextFunction) {
  // SECURITY: Block dev mode in production unless DEMO_BYPASS=true
  if (config.AUTH_MODE === "dev" && config.NODE_ENV === "production" && !config.DEMO_BYPASS) {
    logger.error("AUTH_MODE=dev is not allowed in production. Set AUTH_MODE=entra or DEMO_BYPASS=true.");
    return next(new HttpError(500, "Server misconfiguration"));
  }

  if (config.AUTH_MODE === "dev") {
    req.user = DEV_USER;
    return next();
  }

  try {
    const header = req.headers.authorization ?? "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) throw new HttpError(401, "Missing bearer token");

    const { payload } = await jwtVerify(token, getJwks(), {
      audience: config.ENTRA_AUDIENCE ?? config.ENTRA_CLIENT_ID,
      issuer: `https://login.microsoftonline.com/${config.ENTRA_TENANT_ID}/v2.0`,
    });

    req.user = {
      sub: String(payload.sub ?? ""),
      email: String(payload.preferred_username ?? payload.email ?? ""),
      name: String(payload.name ?? ""),
      roles: Array.isArray(payload.roles) ? (payload.roles as AppRole[]) : ["client"],
    };
    next();
  } catch (err) {
    next(new HttpError(401, "Invalid or expired token", err instanceof Error ? err.message : undefined));
  }
}

// ─── RBAC Middleware ─────────────────────────────────────────────────────
/**
 * Require the authenticated user to have at least one of the specified roles.
 * Usage: router.delete("/:id", requireRole("admin"), asyncHandler(...))
 */
export function requireRole(...roles: AppRole[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const userRoles = req.user?.roles ?? [];
    const hasRole = roles.some((r) => userRoles.includes(r));
    if (!hasRole) {
      return next(new HttpError(403, "Forbidden: insufficient permissions"));
    }
    next();
  };
}
