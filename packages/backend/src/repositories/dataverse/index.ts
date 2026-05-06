// Dataverse adapter — thin pass-through over the Web API client.
// NOTE: Dataverse table & column names below assume a `dm_*` solution prefix
// and were chosen to match the entity names in @dm/shared. Adjust the
// `entitySet` and column maps below to match your actual Dataverse environment.
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
import { getDataverseClient } from "./client.js";

const now = () => new Date().toISOString();

// Generic helpers — Dataverse returns column-prefixed records; our schemas use the
// same field names, so we trust the row shape but force a Zod parse for safety.
function id(): string {
  return uuid();
}

class DataverseOrderRepository implements IOrderRepository {
  private c = getDataverseClient();
  private table = "dm_orders";
  async list(filter?: { status?: OrderStatus; assigned_freelancer_id?: string | null }) {
    const filters: string[] = [];
    if (filter?.status) filters.push(`status eq '${filter.status}'`);
    if (filter?.assigned_freelancer_id !== undefined) {
      filters.push(
        filter.assigned_freelancer_id === null
          ? "assigned_freelancer_id eq null"
          : `assigned_freelancer_id eq '${filter.assigned_freelancer_id}'`,
      );
    }
    const q = filters.length ? `$filter=${filters.join(" and ")}` : "";
    const rows = await this.c.retrieveMultiple<Order>(this.table, q);
    return rows.map((r) => Order.parse(r));
  }
  async findById(orderId: string) {
    const row = await this.c.retrieve<Order>(this.table, orderId);
    return row ? Order.parse(row) : null;
  }
  async findByShopifyId(shopifyOrderId: string) {
    const rows = await this.c.retrieveMultiple<Order>(
      this.table,
      `$filter=shopify_order_id eq '${shopifyOrderId}'&$top=1`,
    );
    return rows[0] ? Order.parse(rows[0]) : null;
  }
  async create(data: OrderCreate) {
    const ts = now();
    const payload = Order.parse({ ...data, order_id: id(), created_at: ts, updated_at: ts });
    const created = await this.c.create<Order>(this.table, payload as unknown as Record<string, unknown>);
    return Order.parse(created);
  }
  async update(orderId: string, data: OrderUpdate) {
    await this.c.update(this.table, orderId, { ...data, updated_at: now() });
    const row = await this.findById(orderId);
    if (!row) throw new Error(`Order ${orderId} not found after update`);
    return row;
  }
  async delete(orderId: string) {
    await this.c.delete(this.table, orderId);
  }
}

class DataverseFreelancerRepository implements IFreelancerRepository {
  private c = getDataverseClient();
  private table = "dm_freelancers";
  private junctionTable = "dm_freelancerservices";
  async list(filter?: { availability_status?: string; category?: string }) {
    const filters: string[] = [];
    if (filter?.availability_status) filters.push(`availability_status eq '${filter.availability_status}'`);
    const q = filters.length ? `$filter=${filters.join(" and ")}` : "";
    const rows = await this.c.retrieveMultiple<Freelancer>(this.table, q);
    return rows.map((r) => Freelancer.parse(r));
  }
  async findById(freelancerId: string) {
    const row = await this.c.retrieve<Freelancer>(this.table, freelancerId);
    return row ? Freelancer.parse(row) : null;
  }
  async create(data: FreelancerCreate) {
    const ts = now();
    const payload = Freelancer.parse({
      ...data,
      freelancer_id: id(),
      created_at: ts,
      updated_at: ts,
    });
    const created = await this.c.create<Freelancer>(this.table, payload as unknown as Record<string, unknown>);
    return Freelancer.parse(created);
  }
  async update(freelancerId: string, data: Partial<FreelancerCreate>) {
    await this.c.update(this.table, freelancerId, { ...data, updated_at: now() });
    const row = await this.findById(freelancerId);
    if (!row) throw new Error(`Freelancer ${freelancerId} not found after update`);
    return row;
  }
  async delete(freelancerId: string) {
    await this.c.delete(this.table, freelancerId);
  }
  async listServices(freelancerId: string) {
    return this.c.retrieveMultiple<FreelancerService>(
      this.junctionTable,
      `$filter=freelancer_id eq '${freelancerId}'`,
    );
  }
  async attachService(link: FreelancerService) {
    await this.c.create<FreelancerService>(this.junctionTable, link as unknown as Record<string, unknown>);
    return link;
  }
  async detachService(freelancerId: string, serviceId: string) {
    const rows = await this.c.retrieveMultiple<{ freelancerservice_id?: string }>(
      this.junctionTable,
      `$filter=freelancer_id eq '${freelancerId}' and service_id eq '${serviceId}'`,
    );
    for (const r of rows) {
      if (r.freelancerservice_id) await this.c.delete(this.junctionTable, r.freelancerservice_id);
    }
  }
}

class DataverseServiceRepository implements IServiceRepository {
  private c = getDataverseClient();
  private table = "dm_services";
  async list(filter?: { category?: string; active?: boolean }) {
    const filters: string[] = [];
    if (filter?.category) filters.push(`category eq '${filter.category}'`);
    if (filter?.active !== undefined) filters.push(`active eq ${filter.active}`);
    const q = filters.length ? `$filter=${filters.join(" and ")}` : "";
    const rows = await this.c.retrieveMultiple<Service>(this.table, q);
    return rows.map((r) => Service.parse(r));
  }
  async findById(serviceId: string) {
    const row = await this.c.retrieve<Service>(this.table, serviceId);
    return row ? Service.parse(row) : null;
  }
  async create(data: ServiceCreate) {
    const ts = now();
    const payload = Service.parse({ ...data, service_id: id(), created_at: ts, updated_at: ts });
    const created = await this.c.create<Service>(this.table, payload as unknown as Record<string, unknown>);
    return Service.parse(created);
  }
  async update(serviceId: string, data: Partial<ServiceCreate>) {
    await this.c.update(this.table, serviceId, { ...data, updated_at: now() });
    const row = await this.findById(serviceId);
    if (!row) throw new Error(`Service ${serviceId} not found after update`);
    return row;
  }
  async delete(serviceId: string) {
    await this.c.delete(this.table, serviceId);
  }
}

class DataverseShopifyMappingRepository implements IShopifyMappingRepository {
  private c = getDataverseClient();
  private table = "dm_shopifymappings";
  async list() {
    const rows = await this.c.retrieveMultiple<ShopifyMapping>(this.table);
    return rows.map((r) => ShopifyMapping.parse(r));
  }
  async findByShopifyProductId(shopifyProductId: string) {
    const rows = await this.c.retrieveMultiple<ShopifyMapping>(
      this.table,
      `$filter=shopify_product_id eq '${shopifyProductId}'&$top=1`,
    );
    return rows[0] ? ShopifyMapping.parse(rows[0]) : null;
  }
  async create(data: ShopifyMappingCreate) {
    const ts = now();
    const payload = ShopifyMapping.parse({
      ...data,
      mapping_id: id(),
      created_at: ts,
      updated_at: ts,
    });
    const created = await this.c.create<ShopifyMapping>(this.table, payload as unknown as Record<string, unknown>);
    return ShopifyMapping.parse(created);
  }
  async update(mappingId: string, data: Partial<ShopifyMappingCreate>) {
    await this.c.update(this.table, mappingId, { ...data, updated_at: now() });
    const rows = await this.c.retrieveMultiple<ShopifyMapping>(
      this.table,
      `$filter=mapping_id eq '${mappingId}'&$top=1`,
    );
    if (!rows[0]) throw new Error(`Mapping ${mappingId} not found after update`);
    return ShopifyMapping.parse(rows[0]);
  }
  async delete(mappingId: string) {
    await this.c.delete(this.table, mappingId);
  }
}

class DataverseSocialAccountRepository implements ISocialAccountRepository {
  private c = getDataverseClient();
  private table = "dm_socialmediaaccounts";
  async list(filter?: { platform?: string }) {
    const q = filter?.platform ? `$filter=platform eq '${filter.platform}'` : "";
    const rows = await this.c.retrieveMultiple<SocialMediaAccount>(this.table, q);
    return rows.map((r) => SocialMediaAccount.parse(r));
  }
  async findById(accountId: string) {
    const row = await this.c.retrieve<SocialMediaAccount>(this.table, accountId);
    return row ? SocialMediaAccount.parse(row) : null;
  }
  async create(data: SocialMediaAccountCreate) {
    const ts = now();
    const payload = SocialMediaAccount.parse({
      ...data,
      account_id: id(),
      created_at: ts,
      updated_at: ts,
    });
    const created = await this.c.create<SocialMediaAccount>(this.table, payload as unknown as Record<string, unknown>);
    return SocialMediaAccount.parse(created);
  }
  async update(accountId: string, data: Partial<SocialMediaAccountCreate>) {
    await this.c.update(this.table, accountId, { ...data, updated_at: now() });
    const row = await this.findById(accountId);
    if (!row) throw new Error(`Social account ${accountId} not found after update`);
    return row;
  }
  async delete(accountId: string) {
    await this.c.delete(this.table, accountId);
  }
}

class DataverseQueueLogRepository implements IQueueLogRepository {
  private c = getDataverseClient();
  private table = "dm_orderqueue";
  async list(filter?: { queue_type?: string; status?: string }) {
    const filters: string[] = [];
    if (filter?.queue_type) filters.push(`queue_type eq '${filter.queue_type}'`);
    if (filter?.status) filters.push(`status eq '${filter.status}'`);
    const q = filters.length ? `$filter=${filters.join(" and ")}` : "";
    return this.c.retrieveMultiple<OrderQueueItem>(this.table, q);
  }
  async record(item: OrderQueueItem) {
    const created = await this.c.create<OrderQueueItem>(this.table, item as unknown as Record<string, unknown>);
    return created ?? item;
  }
  async updateStatus(queueId: string, status: OrderQueueItem["status"], lastError?: string | null) {
    await this.c.update(this.table, queueId, { status, last_error: lastError ?? null, updated_at: now() });
  }
}

export function buildDataverseRepos(): Repositories {
  return {
    orders: new DataverseOrderRepository(),
    freelancers: new DataverseFreelancerRepository(),
    services: new DataverseServiceRepository(),
    shopifyMappings: new DataverseShopifyMappingRepository(),
    socialAccounts: new DataverseSocialAccountRepository(),
    queueLog: new DataverseQueueLogRepository(),
  };
}
