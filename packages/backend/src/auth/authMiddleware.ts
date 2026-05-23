// Auth middleware. AUTH_MODE=dev injects a stub user (no token required).
// AUTH_MODE=clerk validates a Clerk JWT using @clerk/backend verifyToken().
// AUTH_MODE=entra kept for backwards-compat / Dataverse service-principal flows.
// SECURITY: dev mode is blocked in production (NODE_ENV=production requires AUTH_MODE=clerk or entra).
import type { Request, Response, NextFunction } from "express";
import { createRemoteJWKSet, jwtVerify } from "jose";
import { config } from "../config.js";
import { HttpError } from "../middleware/errorHandler.js";
import { logger } from "../logger.js";

// ─── Clerk ───────────────────────────────────────────────────────────────────
// Lazy import so the module loads even when @clerk/backend is not installed
// (demo / entra environments).
let _verifyClerkToken: ((token: string) => Promise<{ sub: string; [k: string]: unknown }>) | null = null;

async function getClerkVerifier() {
  if (_verifyClerkToken) return _verifyClerkToken;
  try {
    const { verifyToken } = await import("@clerk/backend");
    _verifyClerkToken = async (token: string) => {
      const payload = await verifyToken(token, { secretKey: config.CLERK_SECRET_KEY! });
      return payload as { sub: string; [k: string]: unknown };
    };
  } catch {
    throw new Error("@clerk/backend not installed. Run: npm install @clerk/backend -w @dm/backend");
  }
  return _verifyClerkToken!;
}

// ─── Types ───────────────────────────────────────────────────────────────────
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

// ─── JWKS singleton (entra back-compat) ──────────────────────────────────────
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

// ─── Auth Middleware ─────────────────────────────────────────────────────────
export async function authMiddleware(req: Request, _res: Response, next: NextFunction) {
  // SECURITY: Block dev mode in production unless DEMO_BYPASS=true
  if (config.AUTH_MODE === "dev" && config.NODE_ENV === "production" && !config.DEMO_BYPASS) {
    logger.error("AUTH_MODE=dev is not allowed in production. Set AUTH_MODE=clerk or DEMO_BYPASS=true.");
    return next(new HttpError(500, "Server misconfiguration"));
  }

  if (config.AUTH_MODE === "dev") {
    req.user = DEV_USER;
    return next();
  }

  const header = req.headers.authorization ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return next(new HttpError(401, "Missing bearer token"));

  // ── Clerk path ─────────────────────────────────────────────────────────────
  if (config.AUTH_MODE === "clerk") {
    try {
      if (!config.CLERK_SECRET_KEY) {
        throw new Error("CLERK_SECRET_KEY is required for AUTH_MODE=clerk");
      }
      const verify = await getClerkVerifier();
      const payload = await verify(token);

      const metaRole = (payload["public_metadata"] as Record<string, unknown> | undefined)?.["role"];
      const role: AppRole =
        metaRole === "designer" || metaRole === "client" ? metaRole : "admin";

      req.user = {
        sub: String(payload.sub ?? ""),
        email: String(payload.email ?? ""),
        name: String((payload as Record<string, unknown>).name ?? ""),
        roles: [role],
      };
      return next();
    } catch (err) {
      return next(new HttpError(401, "Invalid or expired Clerk token", err instanceof Error ? err.message : undefined));
    }
  }

  // ── Entra / MSAL back-compat path ─────────────────────────────────────────
  try {
    const { payload } = await jwtVerify(token, getJwks(), {
      audience: config.ENTRA_AUDIENCE ?? config.ENTRA_CLIENT_ID,
      issuer: `https://login.microsoftonline.com/${config.ENTRA_TENANT_ID}/v2.0`,
    });

    req.user = {
      sub: String(payload.sub ?? ""),
      email: String(payload.preferred_username ?? payload.email ?? ""),
      name: String(payload.name ?? ""),
      roles: Array.isArray(payload.roles) && (payload.roles as string[]).length > 0
        ? (payload.roles as AppRole[])
        : ["admin"],
    };
    next();
  } catch (err) {
    next(new HttpError(401, "Invalid or expired token", err instanceof Error ? err.message : undefined));
  }
}

// ─── RBAC Middleware ─────────────────────────────────────────────────────────
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
