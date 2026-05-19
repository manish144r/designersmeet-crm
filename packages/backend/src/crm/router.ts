// Generic CRUD router factory — one per resource, paginated + filterable.
// Routes never touch a cloud SDK; they go through the Collection store
// (swap to a knex/mssql repo via DATA_PROVIDER without changing this file).
import { Router } from "express";
import type { AnyZodObject } from "zod";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { HttpError } from "../middleware/errorHandler.js";
import { stores } from "./seed.js";
import { RESOURCES, type ResourceName } from "./types.js";

export function crmRouter(): Router {
  const router = Router();

  (Object.keys(RESOURCES) as ResourceName[]).forEach((name) => {
    const schema = RESOURCES[name] as unknown as AnyZodObject;
    const store = stores[name];
    const base = `/${name}`;

    router.get(
      base,
      asyncHandler(async (req, res) => {
        res.json({ data: store.list(req.query as Record<string, unknown>) });
      }),
    );

    router.get(
      `${base}/:id`,
      asyncHandler(async (req, res) => {
        const row = store.get(req.params.id);
        if (!row) throw new HttpError(404, `${name} not found`);
        res.json({ data: row });
      }),
    );

    router.post(
      base,
      asyncHandler(async (req, res) => {
        const parsed = schema.parse(req.body);
        res.status(201).json({ data: store.create(parsed) });
      }),
    );

    const updateHandler = asyncHandler(async (req, res) => {
      const parsed = schema.partial().parse(req.body);
      const row = store.update(req.params.id, parsed);
      if (!row) throw new HttpError(404, `${name} not found`);
      res.json({ data: row });
    });
    router.put(`${base}/:id`, updateHandler);
    router.patch(`${base}/:id`, updateHandler);

    router.delete(
      `${base}/:id`,
      asyncHandler(async (req, res) => {
        if (!store.remove(req.params.id)) throw new HttpError(404, `${name} not found`);
        res.status(204).end();
      }),
    );
  });

  return router;
}
