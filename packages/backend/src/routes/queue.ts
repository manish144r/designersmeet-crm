import { Router } from "express";
import { QueueName, QueueStatus } from "@dm/shared";
import { container } from "../container.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

export const queueRouter: ReturnType<typeof Router> = Router();

queueRouter.get(
  "/stats",
  asyncHandler(async (_req, res) => {
    const stats = await container.queue.stats();
    res.json({ data: stats });
  }),
);

queueRouter.get(
  "/items",
  asyncHandler(async (req, res) => {
    const queue_type = req.query.queue_type ? QueueName.parse(req.query.queue_type) : undefined;
    const status = req.query.status ? QueueStatus.parse(req.query.status) : undefined;
    const items = await container.repos.queueLog.list({ queue_type, status });
    res.json({ data: items });
  }),
);

queueRouter.post(
  "/test-message",
  asyncHandler(async (req, res) => {
    const queue_name = QueueName.parse(req.body?.queue_name ?? "orders.notification");
    const payload = (req.body?.payload as Record<string, unknown>) ?? { kind: "test" };
    const item = await container.queue.enqueue(queue_name, payload);
    res.status(201).json({ data: item });
  }),
);
