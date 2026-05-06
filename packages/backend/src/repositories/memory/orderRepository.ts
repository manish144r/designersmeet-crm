import { v4 as uuid } from "uuid";
import { Order, type OrderCreate, type OrderStatus, type OrderUpdate } from "@dm/shared";
import type { IOrderRepository } from "../interfaces.js";
import { now, store } from "./store.js";

export class InMemoryOrderRepository implements IOrderRepository {
  async list(filter?: { status?: OrderStatus; assigned_freelancer_id?: string | null }) {
    let rows = Array.from(store.orders.values());
    if (filter?.status) rows = rows.filter((r) => r.status === filter.status);
    if (filter?.assigned_freelancer_id !== undefined)
      rows = rows.filter((r) => r.assigned_freelancer_id === filter.assigned_freelancer_id);
    return rows.sort((a, b) => b.created_at.localeCompare(a.created_at));
  }

  async findById(id: string) {
    return store.orders.get(id) ?? null;
  }

  async findByShopifyId(shopifyOrderId: string) {
    return Array.from(store.orders.values()).find((o) => o.shopify_order_id === shopifyOrderId) ?? null;
  }

  async create(data: OrderCreate) {
    const ts = now();
    const order = Order.parse({
      ...data,
      order_id: uuid(),
      created_at: ts,
      updated_at: ts,
    });
    store.orders.set(order.order_id, order);
    return order;
  }

  async update(id: string, data: OrderUpdate) {
    const existing = store.orders.get(id);
    if (!existing) throw new Error(`Order ${id} not found`);
    const updated = Order.parse({ ...existing, ...data, order_id: id, updated_at: now() });
    store.orders.set(id, updated);
    return updated;
  }

  async delete(id: string) {
    store.orders.delete(id);
  }
}
