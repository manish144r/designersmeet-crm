// Domain (non-CRUD) endpoints the generic resource router cannot express:
// kanban stage move, calendar slot booking, conversation thread merge,
// public form submission ingest. All operate on the same in-memory `stores`
// (DATA_PROVIDER=memory) the CRUD router uses, so demo + dev share state.
import { Router } from "express";
import { z } from "zod";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { HttpError } from "../middleware/errorHandler.js";
import { stores } from "./seed.js";

// Mirrors ProjectSchema.status enum in types.js (kept literal: ZodDefault
// hides .options behind .removeDefault(); a literal is clearer and the
// generic CRUD router still enforces the schema on direct writes).
const PROJECT_STAGES = [
  "brief",
  "concept",
  "design",
  "procurement",
  "install",
  "snag",
  "handover",
  "closed",
] as const;

export function domainRouter(): Router {
  const router = Router();

  // ── Kanban: move a project to another stage ────────────────────────────
  // POST /api/domain/projects/:id/stage  { status }
  const StageBody = z.object({ status: z.enum(PROJECT_STAGES) });
  router.post(
    "/domain/projects/:id/stage",
    asyncHandler(async (req, res) => {
      const { status } = StageBody.parse(req.body);
      const row = stores.projects.update(req.params.id, { status } as Record<string, unknown>);
      if (!row) throw new HttpError(404, "project not found");
      res.json({ data: row });
    }),
  );

  // ── Calendar: book a slot ──────────────────────────────────────────────
  // POST /api/domain/calendar/book  { title, contact_id?, start_at, end_at, type? }
  const BookBody = z.object({
    title: z.string().min(1),
    contact_id: z.string().optional().default(""),
    start_at: z.string().min(1),
    end_at: z.string().min(1),
    type: z
      .enum(["personal", "service_menu", "team_collective", "class"])
      .default("service_menu"),
  });
  router.post(
    "/domain/calendar/book",
    asyncHandler(async (req, res) => {
      const b = BookBody.parse(req.body);
      const overlap = stores["calendar-events"]
        .list({ pageSize: 200 })
        .data.some((e) => {
          const ev = e as Record<string, string>;
          return ev.start_at < b.end_at && b.start_at < ev.end_at;
        });
      if (overlap) throw new HttpError(409, "slot already booked", { code: "SLOT_TAKEN" });
      const created = stores["calendar-events"].create({
        ...b,
        status: "confirmed",
      } as Record<string, unknown>);
      res.status(201).json({ data: created });
    }),
  );

  // ── Conversations: merge thread B into thread A ────────────────────────
  // POST /api/domain/conversations/merge  { sourceId, targetId }
  const MergeBody = z.object({ sourceId: z.string().min(1), targetId: z.string().min(1) });
  router.post(
    "/domain/conversations/merge",
    asyncHandler(async (req, res) => {
      const { sourceId, targetId } = MergeBody.parse(req.body);
      if (sourceId === targetId) throw new HttpError(400, "cannot merge a thread into itself");
      const target = stores.conversations.get(targetId);
      const source = stores.conversations.get(sourceId);
      if (!target || !source) throw new HttpError(404, "conversation not found");
      const moved = stores.messages
        .list({ pageSize: 200, conversation_id: sourceId })
        .data.filter((m) => (m as Record<string, string>).conversation_id === sourceId);
      for (const m of moved) {
        stores.messages.update((m as { id: string }).id, {
          conversation_id: targetId,
        } as Record<string, unknown>);
      }
      stores.conversations.remove(sourceId);
      res.json({ data: { ...target, merged_from: sourceId, moved_messages: moved.length } });
    }),
  );

  // ── Forms: public submission ingest (+ optional contact upsert) ────────
  // POST /api/domain/forms/:slug/submit  { payload, contact? }
  const SubmitBody = z.object({
    payload: z.record(z.any()).default({}),
    contact: z
      .object({ first_name: z.string(), primary_email: z.string().email() })
      .partial()
      .optional(),
  });
  router.post(
    "/domain/forms/:slug/submit",
    asyncHandler(async (req, res) => {
      const body = SubmitBody.parse(req.body);
      const form = stores.forms
        .list({ pageSize: 200 })
        .data.find((f) => (f as Record<string, string>).public_slug === req.params.slug);
      if (!form) throw new HttpError(404, "form not found");
      let contactId: string | null = null;
      if (body.contact?.primary_email) {
        const created = stores.contacts.create({
          type: "lead",
          first_name: body.contact.first_name ?? "Form lead",
          primary_email: body.contact.primary_email,
        } as Record<string, unknown>);
        contactId = (created as { id: string }).id;
      }
      const submission = stores["form-submissions"].create({
        form_id: (form as { id: string }).id,
        contact_id: contactId,
        payload_json: body.payload,
        submitted_at: new Date().toISOString(),
      } as Record<string, unknown>);
      res.status(201).json({ data: submission });
    }),
  );

  return router;
}
