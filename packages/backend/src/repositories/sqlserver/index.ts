// SQL Server adapter — same surface as the in-memory and Dataverse adapters.
// Knex handles parameterization. JSON-typed columns (ai_tools_used, shopify_product_ids,
// queue payload) are stored as text and (de)serialized at the boundary.
import { v4 as uuid } from "uuid";
import {
  Freelancer,
  type FreelancerCreate,
  type FreelancerService,
  Order,
  type OrderCreate,
  type OrderStatus,
  type OrderUpdate,
  type OrderQueueItem,
  Service,
  type ServiceCreate,
  ShopifyMapping,
  type ShopifyMappingCreate,
  SocialMediaAccount,
  type SocialMediaAccountCreate,
} from "@dm/shared";
import type {
  IFreelancerRepository,
  IOrderRepository,
  IQueueLogRepository,
  IServiceRepository,
  IShopifyMappingRepository,
  ISocialAccountRepository,
  Repositories,
} from "../interfaces.js";
import { getDb } from "./db.js";

const now = () => new Date().toISOString();

interface FreelancerRow extends Omit<Freelancer, "ai_tools_used"> {
  ai_tools_used_json: string;
}
interface ServiceRow extends Omit<Service, "shopify_product_ids"> {
  shopify_product_ids_json: string;
}
interface QueueRow extends Omit<OrderQueueItem, "payload"> {
  payload_json: string;
}

const fromFreelancerRow = (r: FreelancerRow): Freelancer =>
  Freelancer.parse({ ...r, ai_tools_used: JSON.parse(r.ai_tools_used_json || "[]") });
const toFreelancerRow = (f: Freelancer): FreelancerRow => {
  const { ai_tools_used, ...rest } = f;
  return { ...rest, ai_tools_used_json: JSON.stringify(ai_tools_used ?? []) };
};
const fromServiceRow = (r: ServiceRow): Service =>
  Service.parse({ ...r, shopify_product_ids: JSON.parse(r.shopify_product_ids_json || "[]") });
const toServiceRow = (s: Service): ServiceRow => {
  const { shopify_product_ids, ...rest } = s;
  return { ...rest, shopify_product_ids_json: JSON.stringify(shopify_product_ids ?? []) };
};
const fromQueueRow = (r: QueueRow): OrderQueueItem => ({
  queue_id: r.queue_id,
  order_id: r.order_id,
  queue_type: r.queue_type,
  payload: JSON.parse(r.payload_json || "{}"),
  status: r.status,
  retry_count: r.retry_count,
  last_error: r.last_error,
  created_at: r.created_at,
  updated_at: r.updated_at,
});

class SqlOrderRepository implements IOrderRepository {
  private db = getDb();
  async list(filter?: { status?: OrderStatus; assigned_freelancer_id?: string | null }) {
    let q = this.db<Order>("orders").orderBy("created_at", "desc");
    if (filter?.status) q = q.where({ status: filter.status });
    if (filter?.assigned_freelancer_id !== undefined) {
      q = filter.assigned_freelancer_id === null
        ? q.whereNull("assigned_freelancer_id")
        : q.where({ assigned_freelancer_id: filter.assigned_freelancer_id });
    }
    return (await q).map((r) => Order.parse(r));
  }
  async findById(id: string) {
    const row = await this.db<Order>("orders").where({ order_id: id }).first();
    return row ? Order.parse(row) : null;
  }
  async findByShopifyId(shopifyOrderId: string) {
    const row = await this.db<Order>("orders").where({ shopify_order_id: shopifyOrderId }).first();
    return row ? Order.parse(row) : null;
  }
  async create(data: OrderCreate) {
    const ts = now();
    const order = Order.parse({ ...data, order_id: uuid(), created_at: ts, updated_at: ts });
    await this.db("orders").insert(order);
    return order;
  }
  async update(id: string, data: OrderUpdate) {
    await this.db("orders").where({ order_id: id }).update({ ...data, updated_at: now() });
    const row = await this.findById(id);
    if (!row) throw new Error(`Order ${id} not found after update`);
    return row;
  }
  async delete(id: string) {
    await this.db("orders").where({ order_id: id }).del();
  }
}

class SqlFreelancerRepository implements IFreelancerRepository {
  private db = getDb();
  async list(filter?: { availability_status?: string; category?: string }) {
    let q = this.db<FreelancerRow>("freelancers").orderBy("name", "asc");
    if (filter?.availability_status) q = q.where({ availability_status: filter.availability_status });
    if (filter?.category) {
      const sub = this.db("freelancer_services as fs")
        .join("services as s", "fs.service_id", "s.service_id")
        .where("s.category", filter.category)
        .select("fs.freelancer_id");
      q = q.whereIn("freelancer_id", sub);
    }
    return (await q).map(fromFreelancerRow);
  }
  async findById(id: string) {
    const row = await this.db<FreelancerRow>("freelancers").where({ freelancer_id: id }).first();
    return row ? fromFreelancerRow(row) : null;
  }
  async create(data: FreelancerCreate) {
    const ts = now();
    const f = Freelancer.parse({ ...data, freelancer_id: uuid(), created_at: ts, updated_at: ts });
    await this.db("freelancers").insert(toFreelancerRow(f));
    return f;
  }
  async update(id: string, data: Partial<FreelancerCreate>) {
    const existing = await this.findById(id);
    if (!existing) throw new Error(`Freelancer ${id} not found`);
    const updated = Freelancer.parse({ ...existing, ...data, freelancer_id: id, updated_at: now() });
    await this.db("freelancers").where({ freelancer_id: id }).update(toFreelancerRow(updated));
    return updated;
  }
  async delete(id: string) {
    await this.db("freelancers").where({ freelancer_id: id }).del();
    await this.db("freelancer_services").where({ freelancer_id: id }).del();
  }
  async listServices(freelancerId: string) {
    const rows = await this.db<FreelancerService>("freelancer_services").where({ freelancer_id: freelancerId });
    return rows;
  }
  async attachService(link: FreelancerService) {
    await this.db("freelancer_services")
      .where({ freelancer_id: link.freelancer_id, service_id: link.service_id })
      .del();
    await this.db("freelancer_services").insert(link);
    return link;
  }
  async detachService(freelancerId: string, serviceId: string) {
    await this.db("freelancer_services").where({ freelancer_id: freelancerId, service_id: serviceId }).del();
  }
}

class SqlServiceRepository implements IServiceRepository {
  private db = getDb();
  async list(filter?: { category?: string; active?: boolean }) {
    let q = this.db<ServiceRow>("services").orderBy("name", "asc");
    if (filter?.category) q = q.where({ category: filter.category });
    if (filter?.active !== undefined) q = q.where({ active: filter.active });
    return (await q).map(fromServiceRow);
  }
  async findById(id: string) {
    const row = await this.db<ServiceRow>("services").where({ service_id: id }).first();
    return row ? fromServiceRow(row) : null;
  }
  async create(data: ServiceCreate) {
    const ts = now();
    const s = Service.parse({ ...data, service_id: uuid(), created_at: ts, updated_at: ts });
    await this.db("services").insert(toServiceRow(s));
    return s;
  }
  async update(id: string, data: Partial<ServiceCreate>) {
    const existing = await this.findById(id);
    if (!existing) throw new Error(`Service ${id} not found`);
    const updated = Service.parse({ ...existing, ...data, service_id: id, updated_at: now() });
    await this.db("services").where({ service_id: id }).update(toServiceRow(updated));
    return updated;
  }
  async delete(id: string) {
    await this.db("services").where({ service_id: id }).del();
  }
}

class SqlShopifyMappingRepository implements IShopifyMappingRepository {
  private db = getDb();
  async list() {
    const rows = await this.db<ShopifyMapping>("shopify_mappings");
    return rows.map((r) => ShopifyMapping.parse(r));
  }
  async findByShopifyProductId(shopifyProductId: string) {
    const row = await this.db<ShopifyMapping>("shopify_mappings")
      .where({ shopify_product_id: shopifyProductId })
      .first();
    return row ? ShopifyMapping.parse(row) : null;
  }
  async create(data: ShopifyMappingCreate) {
    const ts = now();
    const m = ShopifyMapping.parse({ ...data, mapping_id: uuid(), created_at: ts, updated_at: ts });
    await this.db("shopify_mappings").insert(m);
    return m;
  }
  async update(id: string, data: Partial<ShopifyMappingCreate>) {
    await this.db("shopify_mappings").where({ mapping_id: id }).update({ ...data, updated_at: now() });
    const row = await this.db<ShopifyMapping>("shopify_mappings").where({ mapping_id: id }).first();
    if (!row) throw new Error(`Mapping ${id} not found`);
    return ShopifyMapping.parse(row);
  }
  async delete(id: string) {
    await this.db("shopify_mappings").where({ mapping_id: id }).del();
  }
}

class SqlSocialAccountRepository implements ISocialAccountRepository {
  private db = getDb();
  async list(filter?: { platform?: string }) {
    let q = this.db<SocialMediaAccount>("social_accounts");
    if (filter?.platform) q = q.where({ platform: filter.platform });
    return (await q).map((r) => SocialMediaAccount.parse(r));
  }
  async findById(id: string) {
    const row = await this.db<SocialMediaAccount>("social_accounts").where({ account_id: id }).first();
    return row ? SocialMediaAccount.parse(row) : null;
  }
  async create(data: SocialMediaAccountCreate) {
    const ts = now();
    const a = SocialMediaAccount.parse({ ...data, account_id: uuid(), created_at: ts, updated_at: ts });
    await this.db("social_accounts").insert(a);
    return a;
  }
  async update(id: string, data: Partial<SocialMediaAccountCreate>) {
    await this.db("social_accounts").where({ account_id: id }).update({ ...data, updated_at: now() });
    const row = await this.findById(id);
    if (!row) throw new Error(`Social account ${id} not found after update`);
    return row;
  }
  async delete(id: string) {
    await this.db("social_accounts").where({ account_id: id }).del();
  }
}

class SqlQueueLogRepository implements IQueueLogRepository {
  private db = getDb();
  async list(filter?: { queue_type?: string; status?: string }) {
    let q = this.db<QueueRow>("order_queue").orderBy("created_at", "desc");
    if (filter?.queue_type) q = q.where({ queue_type: filter.queue_type });
    if (filter?.status) q = q.where({ status: filter.status });
    return (await q).map(fromQueueRow);
  }
  async record(item: OrderQueueItem) {
    await this.db("order_queue").insert({
      queue_id: item.queue_id,
      order_id: item.order_id,
      queue_type: item.queue_type,
      payload_json: JSON.stringify(item.payload),
      status: item.status,
      retry_count: item.retry_count,
      last_error: item.last_error,
      created_at: item.created_at,
      updated_at: item.updated_at,
    });
    return item;
  }
  async updateStatus(queueId: string, status: OrderQueueItem["status"], lastError?: string | null) {
    await this.db("order_queue").where({ queue_id: queueId }).update({
      status,
      last_error: lastError ?? null,
      updated_at: now(),
    });
  }
}

export function buildSqlServerRepos(): Repositories {
  return {
    orders: new SqlOrderRepository(),
    freelancers: new SqlFreelancerRepository(),
    services: new SqlServiceRepository(),
    shopifyMappings: new SqlShopifyMappingRepository(),
    socialAccounts: new SqlSocialAccountRepository(),
    queueLog: new SqlQueueLogRepository(),
  };
}
