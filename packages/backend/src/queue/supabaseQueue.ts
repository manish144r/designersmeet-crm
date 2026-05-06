// Supabase-backed queue. Polls a `order_queue` table for pending rows and dispatches
// to subscribed handlers. Useful when the rest of the platform already runs on
// Supabase (matches NightFactory's heartbeat/Supabase backend).
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { v4 as uuid } from "uuid";
import { QUEUE_NAMES, type QueueName, type OrderQueueItem, type QueueStats } from "@dm/shared";
import { config } from "../config.js";
import { logger } from "../logger.js";
import type { IQueueLogRepository } from "../repositories/interfaces.js";
import type { IQueueService, QueueHandler } from "./IQueueService.js";

const POLL_INTERVAL_MS = 2_000;
const MAX_RETRIES = 5;

export class SupabaseQueueService implements IQueueService {
  private supabase: SupabaseClient;
  private handlers = new Map<QueueName, QueueHandler>();
  private polling: NodeJS.Timeout | null = null;

  constructor(private queueLog: IQueueLogRepository) {
    if (!config.SUPABASE_URL || !config.SUPABASE_ANON_KEY) {
      throw new Error("SUPABASE_URL and SUPABASE_ANON_KEY are required when QUEUE_PROVIDER=supabase");
    }
    this.supabase = createClient(config.SUPABASE_URL, config.SUPABASE_ANON_KEY);
    this.polling = setInterval(() => this.poll().catch((e) => logger.error({ e }, "supabase queue poll failed")), POLL_INTERVAL_MS);
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
    const { error } = await this.supabase.from(config.SUPABASE_QUEUE_TABLE).insert({
      queue_id: item.queue_id,
      order_id: item.order_id,
      queue_type: queueName,
      payload,
      status: "pending",
      retry_count: 0,
      created_at: ts,
      updated_at: ts,
    });
    if (error) throw new Error(`Supabase queue insert failed: ${error.message}`);
    return item;
  }

  async subscribe<T = Record<string, unknown>>(queueName: QueueName, handler: QueueHandler<T>) {
    this.handlers.set(queueName, handler as unknown as QueueHandler);
  }

  async stats(): Promise<QueueStats[]> {
    const out: QueueStats[] = [];
    for (const queueName of QUEUE_NAMES) {
      const { data, error } = await this.supabase
        .from(config.SUPABASE_QUEUE_TABLE)
        .select("status")
        .eq("queue_type", queueName);
      if (error || !data) {
        out.push({ queue_name: queueName, pending: 0, processing: 0, completed: 0, failed: 0, dlq: 0 });
        continue;
      }
      const counts = { pending: 0, processing: 0, completed: 0, failed: 0, dlq: 0 };
      for (const row of data) counts[row.status as keyof typeof counts] = (counts[row.status as keyof typeof counts] ?? 0) + 1;
      out.push({ queue_name: queueName, ...counts });
    }
    return out;
  }

  async shutdown() {
    if (this.polling) clearInterval(this.polling);
    this.polling = null;
  }

  private async poll() {
    for (const [queueName, handler] of this.handlers) {
      const { data, error } = await this.supabase
        .from(config.SUPABASE_QUEUE_TABLE)
        .update({ status: "processing", updated_at: new Date().toISOString() })
        .eq("status", "pending")
        .eq("queue_type", queueName)
        .select()
        .limit(5);
      if (error || !data) continue;

      for (const row of data) {
        try {
          await handler({
            queue_id: row.queue_id,
            queue_name: queueName,
            payload: row.payload ?? {},
            retry_count: row.retry_count ?? 0,
          });
          await this.supabase
            .from(config.SUPABASE_QUEUE_TABLE)
            .update({ status: "completed", updated_at: new Date().toISOString() })
            .eq("queue_id", row.queue_id);
          await this.queueLog.updateStatus(row.queue_id, "completed");
        } catch (err) {
          const reason = err instanceof Error ? err.message : String(err);
          const next = (row.retry_count ?? 0) + 1;
          const status = next >= MAX_RETRIES ? "dlq" : "pending";
          await this.supabase
            .from(config.SUPABASE_QUEUE_TABLE)
            .update({
              status,
              retry_count: next,
              last_error: reason,
              updated_at: new Date().toISOString(),
            })
            .eq("queue_id", row.queue_id);
          await this.queueLog.updateStatus(row.queue_id, status, reason);
        }
      }
    }
  }
}
