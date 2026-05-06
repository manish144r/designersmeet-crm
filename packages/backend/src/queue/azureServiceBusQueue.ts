// Azure Service Bus implementation of IQueueService.
// Uses connection-string when SERVICE_BUS_CONNECTION_STRING is set, otherwise falls
// back to AAD via DefaultAzureCredential against SERVICE_BUS_NAMESPACE.
import {
  ServiceBusClient,
  ServiceBusAdministrationClient,
  type ServiceBusReceivedMessage,
  type ServiceBusSender,
  type ServiceBusReceiver,
} from "@azure/service-bus";
import { DefaultAzureCredential } from "@azure/identity";
import { v4 as uuid } from "uuid";
import { QUEUE_NAMES, type QueueName, type OrderQueueItem, type QueueStats } from "@dm/shared";
import { config } from "../config.js";
import { logger } from "../logger.js";
import type { IQueueLogRepository } from "../repositories/interfaces.js";
import type { IQueueService, QueueHandler } from "./IQueueService.js";

export class AzureServiceBusQueueService implements IQueueService {
  private client: ServiceBusClient;
  private adminClient: ServiceBusAdministrationClient | null = null;
  private senders = new Map<QueueName, ServiceBusSender>();
  private receivers: ServiceBusReceiver[] = [];

  constructor(private queueLog: IQueueLogRepository) {
    if (config.SERVICE_BUS_CONNECTION_STRING) {
      this.client = new ServiceBusClient(config.SERVICE_BUS_CONNECTION_STRING);
      this.adminClient = new ServiceBusAdministrationClient(config.SERVICE_BUS_CONNECTION_STRING);
    } else if (config.SERVICE_BUS_NAMESPACE) {
      const cred = new DefaultAzureCredential();
      this.client = new ServiceBusClient(config.SERVICE_BUS_NAMESPACE, cred);
      this.adminClient = new ServiceBusAdministrationClient(config.SERVICE_BUS_NAMESPACE, cred);
    } else {
      throw new Error(
        "Either SERVICE_BUS_CONNECTION_STRING or SERVICE_BUS_NAMESPACE is required when QUEUE_PROVIDER=azure-service-bus",
      );
    }
  }

  private getSender(queueName: QueueName): ServiceBusSender {
    let sender = this.senders.get(queueName);
    if (!sender) {
      sender = this.client.createSender(queueName);
      this.senders.set(queueName, sender);
    }
    return sender;
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
    await this.getSender(queueName).sendMessages({
      messageId: item.queue_id,
      body: payload,
      applicationProperties: { order_id: orderId ?? null },
    });
    return item;
  }

  async subscribe<T = Record<string, unknown>>(queueName: QueueName, handler: QueueHandler<T>) {
    const receiver = this.client.createReceiver(queueName, { receiveMode: "peekLock" });
    this.receivers.push(receiver);
    receiver.subscribe(
      {
        processMessage: async (msg: ServiceBusReceivedMessage) => {
          const queueId = msg.messageId?.toString() ?? uuid();
          await this.queueLog.updateStatus(queueId, "processing");
          try {
            await handler({
              queue_id: queueId,
              queue_name: queueName,
              payload: (msg.body ?? {}) as T,
              retry_count: msg.deliveryCount ?? 0,
            });
            await receiver.completeMessage(msg);
            await this.queueLog.updateStatus(queueId, "completed");
          } catch (err) {
            const reason = err instanceof Error ? err.message : String(err);
            if ((msg.deliveryCount ?? 0) >= 5) {
              await receiver.deadLetterMessage(msg, {
                deadLetterReason: "MaxRetriesExceeded",
                deadLetterErrorDescription: reason,
              });
              await this.queueLog.updateStatus(queueId, "dlq", reason);
            } else {
              await receiver.abandonMessage(msg);
              await this.queueLog.updateStatus(queueId, "failed", reason);
            }
          }
        },
        processError: async ({ error }) => {
          logger.error({ err: error, queueName }, "Service Bus receiver error");
        },
      },
      { autoCompleteMessages: false },
    );
  }

  async stats(): Promise<QueueStats[]> {
    if (!this.adminClient) {
      // Fall back to queueLog-derived stats when no admin client is available.
      return this.statsFromLog();
    }
    const out: QueueStats[] = [];
    for (const queueName of QUEUE_NAMES) {
      try {
        const props = await this.adminClient.getQueueRuntimeProperties(queueName);
        out.push({
          queue_name: queueName,
          pending: props.activeMessageCount ?? 0,
          processing: 0,
          completed: 0,
          failed: 0,
          dlq: props.deadLetterMessageCount ?? 0,
        });
      } catch {
        out.push({ queue_name: queueName, pending: 0, processing: 0, completed: 0, failed: 0, dlq: 0 });
      }
    }
    return out;
  }

  private async statsFromLog(): Promise<QueueStats[]> {
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
    await Promise.all(this.receivers.map((r) => r.close().catch(() => undefined)));
    await Promise.all(Array.from(this.senders.values()).map((s) => s.close().catch(() => undefined)));
    await this.client.close();
  }
}
