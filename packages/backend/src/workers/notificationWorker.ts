// Logs notification events. Real email/SMS/Teams delivery is added later by
// swapping this function — the queue contract stays the same.
import { logger } from "../logger.js";
import type { QueueHandler } from "../queue/IQueueService.js";

export const notificationWorker: QueueHandler<{ order_id?: string; kind: string; [k: string]: unknown }> = async (
  msg,
) => {
  logger.info({ payload: msg.payload }, "Notification dispatched");
};
