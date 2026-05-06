// Simple async in-memory queue with a per-queue worker loop, exponential backoff,
// and a DLQ. Persists each message to the queueLog repository so the dashboard
// can introspect — same surface as the cloud queue impls.
import { v4 as uuid } from "uuid";
import { QUEUE_NAMES, type QueueName, type OrderQueueItem, type QueueStats } from "@dm/shared";
import { logger } from "../logger.js";
import type { IQueueLogRepository } from "../repositories/interfaces.js";
import type { IQueueService, QueueHandler, QueueMessage } from "./IQueueService.js";

const MAX_RETRIES = 3;

export class InMemoryQueueService implements IQueueService {
  private buckets = new Map<QueueName, QueueMessage[]>();
  private handlers = new Map<QueueName, QueueHandler>();
  private workerHandle: NodeJS.Timeout | null = null;

  constructor(private queueLog: IQueueLogRepository) {
    for (const name of QUEUE_NAMES) this.buckets.set(name, []);
    this.workerHandle = setInterval(() => this.tick().catch((e) => logger.error({ e }, "queue tick failed")), 250);
  }

  async enqueue(queueName: QueueName, payload: Record<string, unknown>, orderId?: string) {
    const ts = new Date().toISOString();
    const item: OrderQueueItem = {
      queue_id: uuid(),
      order_id: orderId ?? null,
      queue_type: queueName,
      payload,
      status: "pending",
      retry_count: 0,
      last_error: null,
      created_at: ts,
      updated_at: ts,
    };
    await this.queueLog.record(item);
    this.buckets.get(queueName)?.push({
      queue_id: item.queue_id,
      queue_name: queueName,
      payload,
      retry_count: 0,
    });
    return item;
  }

  async subscribe<T = Record<string, unknown>>(queueName: QueueName, handler: QueueHandler<T>) {
    this.handlers.set(queueName, handler as unknown as QueueHandler);
    logger.debug({ queueName }, "Subscribed handler");
  }

  async stats(): Promise<QueueStats[]> {
    const out: QueueStats[] = [];
    for (const queueName of QUEUE_NAMES) {
      const rows = await this.queueLog.list({ queue_type: queueName });
      out.push({
        queue_name: queueName,
        pending: rows.filter((r) => r.status === "pending").length,
        processing: rows.filter((r) => r.status === "processing").length,
        completed: rows.filter((r) => r.status === "completed").length,
        failed: rows.filter((r) => r.status === "failed").length,
        dlq: rows.filter((r) => r.status === "dlq").length,
      });
    }
    return out;
  }

  async shutdown() {
    if (this.workerHandle) clearInterval(this.workerHandle);
    this.workerHandle = null;
  }

  private async tick() {
    for (const [queueName, bucket] of this.buckets) {
      const handler = this.handlers.get(queueName);
      if (!handler) continue;
      const next = bucket.shift();
      if (!next) continue;
      await this.queueLog.updateStatus(next.queue_id, "processing");
      try {
        await handler(next);
        await this.queueLog.updateStatus(next.queue_id, "completed");
      } catch (err) {
        const reason = err instanceof Error ? err.message : String(err);
        if (next.retry_count + 1 >= MAX_RETRIES) {
          await this.queueLog.updateStatus(next.queue_id, "dlq", reason);
          logger.warn({ queueName, queue_id: next.queue_id, reason }, "Queue message moved to DLQ");
        } else {
          next.retry_count += 1;
          await this.queueLog.updateStatus(next.queue_id, "failed", reason);
          // Exponential backoff: 0.5s, 1s, 2s
          const delay = 500 * Math.pow(2, next.retry_count - 1);
          setTimeout(() => bucket.push(next), delay);
        }
      }
    }
  }
}
