import type { OrderQueueItem, QueueName, QueueStats } from "@dm/shared";

export interface QueueMessage<T = Record<string, unknown>> {
  queue_id: string;
  queue_name: QueueName;
  payload: T;
  retry_count: number;
}

export type QueueHandler<T = Record<string, unknown>> = (message: QueueMessage<T>) => Promise<void>;

export interface IQueueService {
  enqueue(queueName: QueueName, payload: Record<string, unknown>, orderId?: string): Promise<OrderQueueItem>;
  // Accepts a typed handler — internally treated as opaque since the queue layer
  // doesn't know the worker's payload shape. Workers narrow at the use site.
  subscribe<T = Record<string, unknown>>(queueName: QueueName, handler: QueueHandler<T>): Promise<void>;
  stats(): Promise<QueueStats[]>;
  shutdown(): Promise<void>;
}
