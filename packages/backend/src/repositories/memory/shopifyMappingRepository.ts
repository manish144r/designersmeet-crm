import { v4 as uuid } from "uuid";
import { ShopifyMapping, type ShopifyMappingCreate } from "@dm/shared";
import type { IShopifyMappingRepository } from "../interfaces.js";
import { now, store } from "./store.js";

export class InMemoryShopifyMappingRepository implements IShopifyMappingRepository {
  async list() {
    return Array.from(store.shopifyMappings.values());
  }

  async findByShopifyProductId(shopifyProductId: string) {
    return (
      Array.from(store.shopifyMappings.values()).find((m) => m.shopify_product_id === shopifyProductId) ?? null
    );
  }

  async create(data: ShopifyMappingCreate) {
    const ts = now();
    const mapping = ShopifyMapping.parse({
      ...data,
      mapping_id: uuid(),
      created_at: ts,
      updated_at: ts,
    });
    store.shopifyMappings.set(mapping.mapping_id, mapping);
    return mapping;
  }

  async update(id: string, data: Partial<ShopifyMappingCreate>) {
    const existing = store.shopifyMappings.get(id);
    if (!existing) throw new Error(`Mapping ${id} not found`);
    const updated = ShopifyMapping.parse({ ...existing, ...data, mapping_id: id, updated_at: now() });
    store.shopifyMappings.set(id, updated);
    return updated;
  }

  async delete(id: string) {
    store.shopifyMappings.delete(id);
  }
}
