import { Router } from "express";
import { FreelancerCreate, FreelancerService } from "@dm/shared";
import { container } from "../container.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { HttpError } from "../middleware/errorHandler.js";

export const freelancersRouter: ReturnType<typeof Router> = Router();

freelancersRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const limit = Math.min(Math.max(parseInt(String(req.query.limit)) || 50, 1), 200);
    const offset = Math.max(parseInt(String(req.query.offset)) || 0, 0);
    const freelancers = await container.repos.freelancers.list({
      availability_status:
        typeof req.query.availability_status === "string" ? req.query.availability_status : undefined,
      category: typeof req.query.category === "string" ? req.query.category : undefined,
    });
    const paginated = freelancers.slice(offset, offset + limit);
    res.json({ data: paginated, meta: { total: freelancers.length, limit, offset } });
  }),
);

freelancersRouter.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const freelancer = await container.repos.freelancers.findById(req.params.id);
    if (!freelancer) throw new HttpError(404, "Freelancer not found");
    const services = await container.repos.freelancers.listServices(req.params.id);
    res.json({ data: { ...freelancer, services } });
  }),
);

freelancersRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const data = FreelancerCreate.parse(req.body);
    const freelancer = await container.repos.freelancers.create(data);
    res.status(201).json({ data: freelancer });
  }),
);

freelancersRouter.patch(
  "/:id",
  asyncHandler(async (req, res) => {
    const data = FreelancerCreate.partial().parse(req.body);
    const freelancer = await container.repos.freelancers.update(req.params.id, data);
    res.json({ data: freelancer });
  }),
);

freelancersRouter.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    await container.repos.freelancers.delete(req.params.id);
    res.status(204).end();
  }),
);

freelancersRouter.post(
  "/:id/services",
  asyncHandler(async (req, res) => {
    const link = FreelancerService.parse({ ...req.body, freelancer_id: req.params.id });
    const result = await container.repos.freelancers.attachService(link);
    res.status(201).json({ data: result });
  }),
);

freelancersRouter.delete(
  "/:id/services/:serviceId",
  asyncHandler(async (req, res) => {
    await container.repos.freelancers.detachService(req.params.id, req.params.serviceId);
    res.status(204).end();
  }),
);
