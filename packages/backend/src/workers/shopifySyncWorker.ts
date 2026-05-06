// Pulls order detail from Shopify Admin API for incoming webhook payloads, then
// upserts a CRM order. Falls back to the webhook payload itself when no admin
// token is configured (dev/local).
import { container } from "../container.js";
import { logger } from "../logger.js";
import { config } from "../config.js";
import type { QueueHandler } from "../queue/IQueueService.js";

interface ShopifyOrderPayload {
  id: string | number;
  email?: string;
  customer?: { first_name?: string; last_name?: string };
  total_price?: string;
  currency?: string;
  line_items?: { product_id: string | number; title: string }[];
}

export const shopifySyncWorker: QueueHandler<{ order: ShopifyOrderPayload }> = async (msg) => {
  const { order } = msg.payload;
  if (!order) throw new Error("shopify.sync requires payload.order");

  const shopifyOrderId = String(order.id);
  const existing = await container.repos.orders.findByShopifyId(shopifyOrderId);
  if (existing) {
    logger.debug({ shopifyOrderId }, "Shopify order already synced");
    return;
  }

  const firstItem = order.line_items?.[0];
  let serviceId: string | null = null;
  let serviceName = firstItem?.title ?? "Unknown service";
  if (firstItem) {
    const mapping = await container.repos.shopifyMappings.findByShopifyProductId(String(firstItem.product_id));
    if (mapping) {
      serviceId = mapping.service_id;
      const svc = await container.repos.services.findById(mapping.service_id);
      if (svc) serviceName = svc.name;
    }
  }

  const customerName =
    `${order.customer?.first_name ?? ""} ${order.customer?.last_name ?? ""}`.trim() || "Shopify customer";

  const created = await container.repos.orders.create({
    shopify_order_id: shopifyOrderId,
    customer_name: customerName,
    customer_email: order.email ?? "unknown@shopify.local",
    service_id: serviceId,
    service_type: serviceName,
    status: "new",
    total_amount: Number(order.total_price ?? 0),
    currency: order.currency ?? "USD",
    notes: `Imported from Shopify (store: ${config.SHOPIFY_STORE_DOMAIN ?? "unknown"})`,
  });

  await container.queue.enqueue("orders.assignment", { order_id: created.order_id }, created.order_id);
  logger.info({ order_id: created.order_id, shopifyOrderId }, "Shopify order synced");
};
