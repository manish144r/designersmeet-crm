/**
 * Shared auth types and Zod schemas — used by both frontend and backend.
 *
 * Single source of truth for user/session/Graph entity shapes.
 * Import from @dm/shared/auth in any package.
 */
import { z } from "zod";

// ─── Core auth types ──────────────────────────────────────────────────────────

export const AppRole = z.enum(["admin", "pm", "designer", "vendor", "viewer"]);
export type AppRole = z.infer<typeof AppRole>;

export const AuthProviderKind = z.enum(["microsoft", "google", "apple", "demo"]);
export type AuthProviderKind = z.infer<typeof AuthProviderKind>;

export const AuthUser = z.object({
  sub: z.string(),
  email: z.string().email(),
  name: z.string(),
  roles: z.array(AppRole),
  via: AuthProviderKind,
  /** Microsoft Entra tenantId — present when via="microsoft" */
  tenantId: z.string().optional(),
});
export type AuthUser = z.infer<typeof AuthUser>;

export const AuthSession = z.object({
  user: AuthUser,
  idToken: z.string(),
  expiresAt: z.number(), // unix ms
  graphTokenAvailable: z.boolean().default(false),
});
export type AuthSession = z.infer<typeof AuthSession>;

// ─── Microsoft Graph entity shapes ───────────────────────────────────────────

export const GraphEmailAddress = z.object({
  name: z.string(),
  address: z.string().email(),
});
export type GraphEmailAddress = z.infer<typeof GraphEmailAddress>;

export const GraphMessage = z.object({
  id: z.string(),
  subject: z.string(),
  bodyPreview: z.string(),
  from: z.object({ emailAddress: GraphEmailAddress }),
  receivedDateTime: z.string().datetime({ offset: true }),
  isRead: z.boolean(),
  hasAttachments: z.boolean(),
  importance: z.enum(["low", "normal", "high"]),
  webLink: z.string().url(),
});
export type GraphMessage = z.infer<typeof GraphMessage>;

export const GraphCalendarEvent = z.object({
  id: z.string(),
  subject: z.string(),
  start: z.object({ dateTime: z.string(), timeZone: z.string() }),
  end: z.object({ dateTime: z.string(), timeZone: z.string() }),
  location: z.object({ displayName: z.string() }).optional(),
  bodyPreview: z.string(),
  organizer: z.object({ emailAddress: GraphEmailAddress }),
  attendees: z.array(
    z.object({
      emailAddress: GraphEmailAddress,
      status: z.object({ response: z.string() }),
    }),
  ),
  webLink: z.string().url(),
  isOnlineMeeting: z.boolean(),
  onlineMeetingUrl: z.string().url().optional(),
});
export type GraphCalendarEvent = z.infer<typeof GraphCalendarEvent>;

export const GraphContact = z.object({
  id: z.string(),
  displayName: z.string(),
  emailAddresses: z.array(GraphEmailAddress).default([]),
  phones: z.array(z.object({ type: z.string(), number: z.string() })).default([]),
  companyName: z.string().optional(),
  jobTitle: z.string().optional(),
  businessHomePage: z.string().url().optional(),
});
export type GraphContact = z.infer<typeof GraphContact>;

export const GraphUserProfile = z.object({
  id: z.string(),
  displayName: z.string(),
  mail: z.string().email().nullable(),
  userPrincipalName: z.string(),
  jobTitle: z.string().optional(),
  department: z.string().optional(),
  officeLocation: z.string().optional(),
  mobilePhone: z.string().optional(),
  businessPhones: z.array(z.string()).default([]),
});
export type GraphUserProfile = z.infer<typeof GraphUserProfile>;

// ─── API request/response schemas ─────────────────────────────────────────────

export const SendMailRequest = z.object({
  to: z.string().email(),
  subject: z.string().min(1).max(998),
  html: z.string().min(1),
  cc: z.string().optional(),
});
export type SendMailRequest = z.infer<typeof SendMailRequest>;

export const CreateEventRequest = z.object({
  subject: z.string().min(1).max(255),
  start: z.string().datetime({ offset: true }),
  end: z.string().datetime({ offset: true }),
  body: z.string().optional(),
  attendees: z.array(z.string().email()).optional(),
  location: z.string().optional(),
});
export type CreateEventRequest = z.infer<typeof CreateEventRequest>;

// ─── Env var requirements (documentation schema — not parsed at runtime) ──────

/**
 * Env vars required for Entra SSO to work in production.
 * These map to Vercel / Azure App Service environment variables.
 *
 * Frontend (VITE_ prefix = exposed to browser):
 *   VITE_MSAL_CLIENT_ID   — Azure App Registration Application (client) ID
 *   VITE_MSAL_TENANT      — Azure tenant ID (e.g. f3b2a859-acd8-433c-be2f-f361fd729743)
 *   VITE_AUTH_MODE        — "entra" in production, "dev" locally
 *
 * Backend (server-side only):
 *   ENTRA_CLIENT_ID       — Same as VITE_MSAL_CLIENT_ID (used for JWT audience validation)
 *   ENTRA_TENANT_ID       — Same as VITE_MSAL_TENANT (used for JWKS endpoint)
 *   AUTH_MODE             — "entra" in production, "dev" locally
 *   GRAPH_ENABLED         — "true" to enable app-level Graph (optional; user Graph always works)
 *   GRAPH_ACCESS_TOKEN    — App-level Graph token (only needed if GRAPH_ENABLED=true)
 */
export const SSO_ENV_VARS = {
  frontend: ["VITE_MSAL_CLIENT_ID", "VITE_MSAL_TENANT", "VITE_AUTH_MODE"] as const,
  backend: ["ENTRA_CLIENT_ID", "ENTRA_TENANT_ID", "AUTH_MODE"] as const,
  graphAppLevel: ["GRAPH_ENABLED", "GRAPH_ACCESS_TOKEN"] as const,
} as const;
