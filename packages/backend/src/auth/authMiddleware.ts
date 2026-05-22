/**
 * authMiddleware.ts — Clerk-backed authentication for the Express backend.
 *
 * AUTH_MODE=dev  → inject stub user, no token required (local dev only)
 * AUTH_MODE=clerk → validate Clerk session token via @clerk/express
 *
 * SECURITY: dev mode is blocked in production (NODE_ENV=production forces clerk mode).
 *
 * Required env vars (AUTH_MODE=clerk):
 *   CLERK_SECRET_KEY   — from Clerk dashboard → API Keys
 *
 * The frontend sends the Clerk session token as: Authorization: Bearer <token>
 * @clerk/express validates it against Clerk's JWKS automatically.
 */
import type { Request, Response, NextFunction } from "express";
import { createClerkClient, verifyToken } from "@clerk/backend";
import { config } from "../config.js";
import { HttpError } from "../middleware/errorHandler.js";
import { logger } from "../logger.js";

// ─── Types ───────────────────────────────────────────────────────────────────

export type AppRole = "admin" | "pm" | "designer" | "vendor" | "viewer";

declare module "express-serve-static-core" {
  interface Request {
    user?: {
      sub: string;
      email: string;
      name: string;
      roles: AppRole[];
      clerkUserId?: string;
    };
  }
}

// ─── Dev stub user ────────────────────────────────────────────────────────────

const DEV_USER = {
  sub: "demo-user",
  email: config.DEMO_BYPASS_EMAIL,
  name: "Demo Admin",
  roles: ["admin"] as AppRole[],
};

// ─── Clerk client singleton ───────────────────────────────────────────────────

let _clerk: ReturnType<typeof createClerkClient> | null = null;

function getClerkClient() {
  if (!config.CLERK_SECRET_KEY) {
    throw new Error("CLERK_SECRET_KEY is required when AUTH_MODE=clerk");
  }
  if (!_clerk) {
    _clerk = createClerkClient({ secretKey: config.CLERK_SECRET_KEY });
  }
  return _clerk;
}

// ─── Auth Middleware ──────────────────────────────────────────────────────────

export async function authMiddleware(req: Request, _res: Response, next: NextFunction) {
  // SECURITY: Block dev mode in production unless DEMO_BYPASS=true
  if (config.AUTH_MODE === "dev" && config.NODE_ENV === "production" && !config.DEMO_BYPASS) {
    logger.error("AUTH_MODE=dev is not allowed in production. Set CLERK_SECRET_KEY and AUTH_MODE=clerk.");
    return next(new HttpError(500, "Server misconfiguration"));
  }

  // Dev bypass — inject stub user without touching tokens
  if (config.AUTH_MODE === "dev" || (config.DEMO_BYPASS && config.AUTH_MODE !== "clerk")) {
    req.user = DEV_USER;
    return next();
  }

  // Clerk token validation
  try {
    const header = req.headers.authorization ?? "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token || token === "demo-token") {
      throw new HttpError(401, "Missing or invalid bearer token");
    }

    // Verify the Clerk session token
    const payload = await verifyToken(token, {
      secretKey: config.CLERK_SECRET_KEY!,
    });

    const clerkUserId = payload.sub;

    // Fetch full user from Clerk to get email, name, and roles from publicMetadata
    const clerk = getClerkClient();
    const clerkUser = await clerk.users.getUser(clerkUserId);

    const metaRoles = clerkUser.publicMetadata?.roles as string[] | undefined;
    const roles: AppRole[] =
      Array.isArray(metaRoles) && metaRoles.length > 0
        ? (metaRoles as AppRole[])
        : ["admin"]; // default until RBAC is configured in Clerk dashboard

    req.user = {
      sub: clerkUserId,
      email: clerkUser.emailAddresses?.[0]?.emailAddress ?? "",
      name:
        [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") ||
        clerkUser.username ||
        "Unknown",
      roles,
      clerkUserId,
    };

    next();
  } catch (err) {
    if (err instanceof HttpError) return next(err);
    next(
      new HttpError(
        401,
        "Invalid or expired session token",
        err instanceof Error ? err.message : undefined,
      ),
    );
  }
}

// ─── RBAC Middleware ──────────────────────────────────────────────────────────

/**
 * Require the authenticated user to have at least one of the specified roles.
 * Roles are set in Clerk dashboard → Users → publicMetadata → { roles: ["admin"] }
 * or via Clerk webhooks when a user is created.
 *
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
