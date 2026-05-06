// Shopify webhook receiver. Mounted before express.json() so we can verify the
// HMAC against the raw body. In dev mode (no SHOPIFY_WEBHOOK_SECRET configured)
// HMAC verification is skipped and a debug-friendly 200 is returned.
import crypto from "node:crypto";
import { Router, raw } from "express";
import { container } from "../container.js";
import { config } from "../config.js";
import { logger } from "../logger.js";

export const shopifyWebhookRouter: ReturnType<typeof Router> = Router();

function verifyHmac(rawBody: Buffer, signature: string | undefined): boolean {
  if (!config.SHOPIFY_WEBHOOK_SECRET) return true; // dev mode — accept everything
  if (!signature) return false;
  const expected = crypto
    .createHmac("sha256", config.SHOPIFY_WEBHOOK_SECRET)
    .update(rawBody)
    .digest("base64");
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  } catch {
    return false;
  }
}

shopifyWebhookRouter.post(
  "/orders/create",
  raw({ type: "*/*", limit: "5mb" }),
  async (req, res, next) => {
    try {
      const sig = req.header("X-Shopify-Hmac-SHA256") ?? undefined;
      if (!verifyHmac(req.body as Buffer, sig)) {
        logger.warn({ sig }, "Shopify webhook HMAC verification failed");
        res.status(401).json({ error: "Invalid HMAC" });
        return;
      }

      const order = JSON.parse(req.body.toString("utf8"));
      const item = await container.queue.enqueue("shopify.sync", { order });
      logger.info({ shopifyOrderId: order?.id, queue_id: item.queue_id }, "Shopify order/create webhook accepted");
      res.status(202).json({ ok: true, queued: item.queue_id });
    } catch (err) {
      next(err);
    }
  },
);

shopifyWebhookRouter.post(
  "/orders/updated",
  raw({ type: "*/*", limit: "5mb" }),
  async (req, res, next) => {
    try {
      const sig = req.header("X-Shopify-Hmac-SHA256") ?? undefined;
      if (!verifyHmac(req.body as Buffer, sig)) {
        res.status(401).json({ error: "Invalid HMAC" });
        return;
      }
      const order = JSON.parse(req.body.toString("utf8"));
      const existing = await container.repos.orders.findByShopifyId(String(order.id));
      if (existing) {
        await container.repos.orders.update(existing.order_id, {
          total_amount: Number(order.total_price ?? existing.total_amount),
          notes: existing.notes,
        });
      }
      res.status(202).json({ ok: true });
    } catch (err) {
      next(err);
    }
  },
);
