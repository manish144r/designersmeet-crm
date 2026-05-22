/**
 * /api/graph/* — Microsoft Graph proxy routes.
 *
 * These routes sit behind authMiddleware (user identity validated via Entra JWKS).
 * The user's Graph access token is passed in the X-Graph-Token header from the
 * frontend (MSAL acquireTokenSilent with Graph scopes).
 *
 * In demo mode (AUTH_MODE=dev / DEMO_BYPASS=true):
 *   - X-Graph-Token = "demo-graph-token" → stubs are returned; no real Graph calls.
 *   - This keeps the entire UI functional without an Azure App Registration.
 *
 * Endpoints:
 *   GET  /api/graph/me                    — signed-in user profile
 *   GET  /api/graph/mail/inbox            — inbox messages (?top=25&filter=...)
 *   POST /api/graph/mail/send             — send email {to, subject, html, cc?}
 *   GET  /api/graph/calendar/events       — calendar events (?from=ISO&to=ISO)
 *   POST /api/graph/calendar/events       — create event
 *   GET  /api/graph/contacts/search       — search contacts (?q=term)
 *   GET  /api/graph/contacts              — list contacts (?top=50)
 *   POST /api/graph/contacts              — create contact
 */
import { Router } from "express";
import { z } from "zod";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { makeUserGraphClient } from "../integrations/m365/index.js";
import { config } from "../config.js";

const DEMO_GRAPH_TOKENS = new Set(["demo-graph-token", "demo-token", ""]);

function getGraphClient(graphToken: string | undefined) {
  const token = graphToken ?? "";

  // Demo mode — return a stub client with empty/placeholder data.
  if (config.AUTH_MODE === "dev" || config.DEMO_BYPASS || DEMO_GRAPH_TOKENS.has(token)) {
    return makeDemoGraphClient();
  }

  return makeUserGraphClient(token);
}

/** Stub client for demo mode — returns sensible empty shapes, never calls Graph. */
function makeDemoGraphClient() {
  return {
    me: {
      getProfile: async () => ({
        id: "demo-user",
        displayName: "Manish Sharma",
        mail: "admin@designersmeet.com",
        userPrincipalName: "admin@designersmeet.com",
        jobTitle: "Admin",
        department: "Operations",
        officeLocation: null,
        mobilePhone: null,
        businessPhones: [],
      }),
    },
    mail: {
      listInbox: async () => ({ value: [], "@odata.count": 0 }),
      sendMail: async () => ({ sent: true }),
      getMessage: async (id: string) => ({ id, subject: "Demo message", bodyPreview: "" }),
      markRead: async () => undefined,
      deleteMessage: async () => undefined,
    },
    calendar: {
      listEvents: async () => ({ value: [] }),
      createEvent: async () => ({ id: `demo-event-${Date.now()}` }),
      updateEvent: async () => undefined,
      deleteEvent: async () => undefined,
    },
    contacts: {
      search: async () => ({ value: [] }),
      list: async () => ({ value: [] }),
      create: async (c: unknown) => ({ id: `demo-contact-${Date.now()}`, ...(c as Record<string, unknown>) }),
      update: async () => undefined,
      delete: async () => undefined,
    },
  };
}

// ─── Validation schemas ───────────────────────────────────────────────────────

const SendMailSchema = z.object({
  to: z.string().email(),
  subject: z.string().min(1),
  html: z.string().min(1),
  cc: z.string().optional(),
});

const CreateEventSchema = z.object({
  subject: z.string().min(1),
  start: z.string().datetime({ offset: true }),
  end: z.string().datetime({ offset: true }),
  body: z.string().optional(),
  attendees: z.array(z.string().email()).optional(),
  location: z.string().optional(),
});

const ContactSchema = z.object({
  displayName: z.string().min(1),
  emailAddresses: z.array(z.object({ name: z.string(), address: z.string().email() })).optional(),
  phones: z.array(z.object({ type: z.string(), number: z.string() })).optional(),
  companyName: z.string().optional(),
  jobTitle: z.string().optional(),
  businessHomePage: z.string().url().optional(),
}).passthrough();

// ─── Router ───────────────────────────────────────────────────────────────────

export function graphRouter(): Router {
  const router = Router();

  // Extract Graph token from header (set by frontend MSAL flow).
  const getToken = (req: import("express").Request): string | undefined =>
    req.headers["x-graph-token"] as string | undefined;

  // ── Me ──────────────────────────────────────────────────────────────────────
  router.get(
    "/graph/me",
    asyncHandler(async (req, res) => {
      const client = getGraphClient(getToken(req));
      const profile = await client.me.getProfile();
      res.json({ data: profile });
    }),
  );

  // ── Mail ────────────────────────────────────────────────────────────────────
  router.get(
    "/graph/mail/inbox",
    asyncHandler(async (req, res) => {
      const top = Math.min(Number(req.query.top ?? 25), 100);
      const filter = req.query.filter as string | undefined;
      const client = getGraphClient(getToken(req));
      const result = await client.mail.listInbox(top, filter);
      res.json({ data: result });
    }),
  );

  router.post(
    "/graph/mail/send",
    asyncHandler(async (req, res) => {
      const body = SendMailSchema.parse(req.body);
      const client = getGraphClient(getToken(req));
      const result = await client.mail.sendMail(body.to, body.subject, body.html, body.cc);
      res.json({ data: result });
    }),
  );

  // ── Calendar ────────────────────────────────────────────────────────────────
  router.get(
    "/graph/calendar/events",
    asyncHandler(async (req, res) => {
      const from = String(req.query.from ?? new Date().toISOString());
      const to = String(req.query.to ?? new Date(Date.now() + 30 * 86400_000).toISOString());
      const client = getGraphClient(getToken(req));
      const result = await client.calendar.listEvents(from, to);
      res.json({ data: result });
    }),
  );

  router.post(
    "/graph/calendar/events",
    asyncHandler(async (req, res) => {
      const body = CreateEventSchema.parse(req.body);
      const client = getGraphClient(getToken(req));
      const result = await client.calendar.createEvent(body.subject, body.start, body.end, {
        body: body.body,
        attendees: body.attendees,
        location: body.location,
      });
      res.json({ data: result });
    }),
  );

  // ── Contacts ────────────────────────────────────────────────────────────────
  router.get(
    "/graph/contacts/search",
    asyncHandler(async (req, res) => {
      const q = String(req.query.q ?? "");
      if (!q) return res.json({ data: { value: [] } });
      const client = getGraphClient(getToken(req));
      const result = await client.contacts.search(q);
      res.json({ data: result });
    }),
  );

  router.get(
    "/graph/contacts",
    asyncHandler(async (req, res) => {
      const top = Math.min(Number(req.query.top ?? 50), 200);
      const client = getGraphClient(getToken(req));
      const result = await client.contacts.list(top);
      res.json({ data: result });
    }),
  );

  router.post(
    "/graph/contacts",
    asyncHandler(async (req, res) => {
      const body = ContactSchema.parse(req.body);
      const client = getGraphClient(getToken(req));
      const result = await client.contacts.create(body);
      res.json({ data: result });
    }),
  );

  return router;
}
