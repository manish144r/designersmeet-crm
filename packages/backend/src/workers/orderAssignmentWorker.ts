// Picks a freelancer for an order. If the order's Shopify mapping has
// `auto_assign_enabled`, uses `default_freelancer_id`; otherwise picks the most
// available freelancer in the matching service category.
import { container } from "../container.js";
import { logger } from "../logger.js";
import type { QueueHandler } from "../queue/IQueueService.js";

export const orderAssignmentWorker: QueueHandler<{ order_id: string }> = async (msg) => {
  const { order_id } = msg.payload;
  if (!order_id) throw new Error("orders.assignment requires payload.order_id");

  const order = await container.repos.orders.findById(order_id);
  if (!order) throw new Error(`Order ${order_id} not found`);
  if (order.assigned_freelancer_id) {
    logger.debug({ order_id }, "Order already assigned, skipping");
    return;
  }

  let freelancerId: string | null = null;

  // 1. Check Shopify mapping for auto-assign default
  if (order.shopify_order_id && order.service_id) {
    const mappings = await container.repos.shopifyMappings.list();
    const mapping = mappings.find((m) => m.service_id === order.service_id && m.auto_assign_enabled);
    if (mapping?.default_freelancer_id) freelancerId = mapping.default_freelancer_id;
  }

  // 2. Otherwise round-robin among available freelancers in the service category
  if (!freelancerId && order.service_id) {
    const service = await container.repos.services.findById(order.service_id);
    if (service) {
      const candidates = await container.repos.freelancers.list({
        availability_status: "available",
        category: service.category,
      });
      if (candidates.length > 0) {
        freelancerId = candidates.sort(
          (a, b) => a.total_orders_completed - b.total_orders_completed,
        )[0]!.freelancer_id;
      }
    }
  }

  if (!freelancerId) {
    logger.warn({ order_id }, "No freelancer found for auto-assignment");
    return;
  }

  await container.repos.orders.update(order_id, {
    assigned_freelancer_id: freelancerId,
    status: "assigned",
  });
  await container.queue.enqueue(
    "orders.notification",
    { order_id, kind: "freelancer_assigned", freelancer_id: freelancerId },
    order_id,
  );
  logger.info({ order_id, freelancerId }, "Order assigned");
};
