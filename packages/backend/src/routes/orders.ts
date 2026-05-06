import { Router } from "express";
import { z } from "zod";
import { OrderCreate, OrderStatus, OrderUpdate } from "@dm/shared";
import { container } from "../container.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { HttpError } from "../middleware/errorHandler.js";
import { requireRole } from "../auth/authMiddleware.js";

export const ordersRouter: ReturnType<typeof Router> = Router();

ordersRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const status = req.query.status ? OrderStatus.parse(req.query.status) : undefined;
    const assigned =
      typeof req.query.assigned_freelancer_id === "string"
        ? req.query.assigned_freelancer_id === "null"
          ? null
          : req.query.assigned_freelancer_id
        : undefined;
    const limit = Math.min(Math.max(parseInt(String(req.query.limit)) || 50, 1), 200);
    const offset = Math.max(parseInt(String(req.query.offset)) || 0, 0);
    const orders = await container.repos.orders.list({
      status,
      assigned_freelancer_id: assigned,
    });
    const paginated = orders.slice(offset, offset + limit);
    res.json({ data: paginated, meta: { total: orders.length, limit, offset } });
  }),
);

ordersRouter.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const order = await container.repos.orders.findById(req.params.id);
    if (!order) throw new HttpError(404, "Order not found");
    res.json({ data: order });
  }),
);

ordersRouter.post(
  "/",
  requireRole("admin", "designer"),
  asyncHandler(async (req, res) => {
    const data = OrderCreate.parse(req.body);
    const order = await container.repos.orders.create(data);
    await container.queue.enqueue("orders.assignment", { order_id: order.order_id }, order.order_id);
    res.status(201).json({ data: order });
  }),
);

ordersRouter.patch(
  "/:id",
  requireRole("admin", "designer"),
  asyncHandler(async (req, res) => {
    const data = OrderUpdate.parse(req.body);
    const order = await container.repos.orders.update(req.params.id, data);
    if (data.status) {
      await container.queue.enqueue(
        "orders.notification",
        { order_id: order.order_id, kind: "status_changed", status: order.status },
        order.order_id,
      );
    }
    res.json({ data: order });
  }),
);

ordersRouter.delete(
  "/:id",
  requireRole("admin"),
  asyncHandler(async (req, res) => {
    await container.repos.orders.delete(req.params.id);
    res.status(204).end();
  }),
);

// Fix #3: Replace unsafe `req.body as {...}` with Zod validation
const AssignBody = z.object({ freelancer_id: z.string().uuid() });

ordersRouter.post(
  "/:id/assign",
  requireRole("admin", "designer"),
  asyncHandler(async (req, res) => {
    const { freelancer_id } = AssignBody.parse(req.body);
    const order = await container.repos.orders.update(req.params.id, {
      assigned_freelancer_id: freelancer_id,
      status: "assigned",
    });
    await container.queue.enqueue(
      "orders.notification",
      { order_id: order.order_id, kind: "freelancer_assigned", freelancer_id },
      order.order_id,
    );
    res.json({ data: order });
  }),
);
