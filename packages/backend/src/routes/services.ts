import { Router } from "express";
import { ServiceCreate } from "@dm/shared";
import { container } from "../container.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { HttpError } from "../middleware/errorHandler.js";

export const servicesRouter: ReturnType<typeof Router> = Router();

servicesRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const limit = Math.min(Math.max(parseInt(String(req.query.limit)) || 50, 1), 200);
    const offset = Math.max(parseInt(String(req.query.offset)) || 0, 0);
    const services = await container.repos.services.list({
      category: typeof req.query.category === "string" ? req.query.category : undefined,
      active: req.query.active === "true" ? true : req.query.active === "false" ? false : undefined,
    });
    const paginated = services.slice(offset, offset + limit);
    res.json({ data: paginated, meta: { total: services.length, limit, offset } });
  }),
);

servicesRouter.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const service = await container.repos.services.findById(req.params.id);
    if (!service) throw new HttpError(404, "Service not found");
    res.json({ data: service });
  }),
);

servicesRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const data = ServiceCreate.parse(req.body);
    const service = await container.repos.services.create(data);
    res.status(201).json({ data: service });
  }),
);

servicesRouter.patch(
  "/:id",
  asyncHandler(async (req, res) => {
    const data = ServiceCreate.partial().parse(req.body);
    const service = await container.repos.services.update(req.params.id, data);
    res.json({ data: service });
  }),
);

servicesRouter.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    await container.repos.services.delete(req.params.id);
    res.status(204).end();
  }),
);
