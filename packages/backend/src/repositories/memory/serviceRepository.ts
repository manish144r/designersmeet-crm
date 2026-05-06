import { v4 as uuid } from "uuid";
import { Service, type ServiceCreate } from "@dm/shared";
import type { IServiceRepository } from "../interfaces.js";
import { now, store } from "./store.js";

export class InMemoryServiceRepository implements IServiceRepository {
  async list(filter?: { category?: string; active?: boolean }) {
    let rows = Array.from(store.services.values());
    if (filter?.category) rows = rows.filter((r) => r.category === filter.category);
    if (filter?.active !== undefined) rows = rows.filter((r) => r.active === filter.active);
    return rows.sort((a, b) => a.name.localeCompare(b.name));
  }

  async findById(id: string) {
    return store.services.get(id) ?? null;
  }

  async create(data: ServiceCreate) {
    const ts = now();
    const service = Service.parse({
      ...data,
      service_id: uuid(),
      created_at: ts,
      updated_at: ts,
    });
    store.services.set(service.service_id, service);
    return service;
  }

  async update(id: string, data: Partial<ServiceCreate>) {
    const existing = store.services.get(id);
    if (!existing) throw new Error(`Service ${id} not found`);
    const updated = Service.parse({ ...existing, ...data, service_id: id, updated_at: now() });
    store.services.set(id, updated);
    return updated;
  }

  async delete(id: string) {
    store.services.delete(id);
  }
}
