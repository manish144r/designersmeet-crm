// Subscribes worker handlers to the queue at boot. Each worker owns one queue.
import { container } from "../container.js";
import { logger } from "../logger.js";
import { orderAssignmentWorker } from "./orderAssignmentWorker.js";
import { notificationWorker } from "./notificationWorker.js";
import { shopifySyncWorker } from "./shopifySyncWorker.js";
import { socialPostWorker } from "./socialPostWorker.js";

export function startWorkers(): void {
  const q = container.queue;
  void q.subscribe("orders.assignment", orderAssignmentWorker);
  void q.subscribe("orders.notification", notificationWorker);
  void q.subscribe("shopify.sync", shopifySyncWorker);
  void q.subscribe("social.post", socialPostWorker);
  logger.info("Workers subscribed: assignment, notification, shopify.sync, social.post");
}
