import type { OrderQueueItem } from "@dm/shared";
import type { IQueueLogRepository } from "../interfaces.js";
import { now, store } from "./store.js";

export class InMemoryQueueLogRepository implements IQueueLogRepository {
  async list(filter?: { queue_type?: string; status?: string }) {
    let rows = Array.from(store.queueLog.values());
    if (filter?.queue_type) rows = rows.filter((r) => r.queue_type === filter.queue_type);
    if (filter?.status) rows = rows.filter((r) => r.status === filter.status);
    return rows.sort((a, b) => b.created_at.localeCompare(a.created_at));
  }

  async record(item: OrderQueueItem) {
    store.queueLog.set(item.queue_id, item);
    return item;
  }

  async updateStatus(queueId: string, status: OrderQueueItem["status"], lastError?: string | null) {
    const existing = store.queueLog.get(queueId);
    if (!existing) return;
    store.queueLog.set(queueId, {
      ...existing,
      status,
      last_error: lastError ?? existing.last_error,
      updated_at: now(),
    });
  }
}
