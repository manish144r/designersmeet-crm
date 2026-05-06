import type {
  Freelancer,
  FreelancerCreate,
  FreelancerService,
  Order,
  OrderCreate,
  OrderQueueItem,
  OrderStatus,
  OrderUpdate,
  Service,
  ServiceCreate,
  ShopifyMapping,
  ShopifyMappingCreate,
  SocialMediaAccount,
  SocialMediaAccountCreate,
} from "@dm/shared";

export interface IOrderRepository {
  list(filter?: { status?: OrderStatus; assigned_freelancer_id?: string | null }): Promise<Order[]>;
  findById(id: string): Promise<Order | null>;
  findByShopifyId(shopifyOrderId: string): Promise<Order | null>;
  create(data: OrderCreate): Promise<Order>;
  update(id: string, data: OrderUpdate): Promise<Order>;
  delete(id: string): Promise<void>;
}

export interface IFreelancerRepository {
  list(filter?: { availability_status?: string; category?: string }): Promise<Freelancer[]>;
  findById(id: string): Promise<Freelancer | null>;
  create(data: FreelancerCreate): Promise<Freelancer>;
  update(id: string, data: Partial<FreelancerCreate>): Promise<Freelancer>;
  delete(id: string): Promise<void>;
  // junction
  listServices(freelancerId: string): Promise<FreelancerService[]>;
  attachService(link: FreelancerService): Promise<FreelancerService>;
  detachService(freelancerId: string, serviceId: string): Promise<void>;
}

export interface IServiceRepository {
  list(filter?: { category?: string; active?: boolean }): Promise<Service[]>;
  findById(id: string): Promise<Service | null>;
  create(data: ServiceCreate): Promise<Service>;
  update(id: string, data: Partial<ServiceCreate>): Promise<Service>;
  delete(id: string): Promise<void>;
}

export interface IShopifyMappingRepository {
  list(): Promise<ShopifyMapping[]>;
  findByShopifyProductId(shopifyProductId: string): Promise<ShopifyMapping | null>;
  create(data: ShopifyMappingCreate): Promise<ShopifyMapping>;
  update(id: string, data: Partial<ShopifyMappingCreate>): Promise<ShopifyMapping>;
  delete(id: string): Promise<void>;
}

export interface ISocialAccountRepository {
  list(filter?: { platform?: string }): Promise<SocialMediaAccount[]>;
  findById(id: string): Promise<SocialMediaAccount | null>;
  create(data: SocialMediaAccountCreate): Promise<SocialMediaAccount>;
  update(id: string, data: Partial<SocialMediaAccountCreate>): Promise<SocialMediaAccount>;
  delete(id: string): Promise<void>;
}

// Optional persistence for queue inspection (used by /api/queue routes when the queue
// implementation supports introspection — in-memory does, Service Bus does via mgmt API).
export interface IQueueLogRepository {
  list(filter?: { queue_type?: string; status?: string }): Promise<OrderQueueItem[]>;
  record(item: OrderQueueItem): Promise<OrderQueueItem>;
  updateStatus(queueId: string, status: OrderQueueItem["status"], lastError?: string | null): Promise<void>;
}

export interface Repositories {
  orders: IOrderRepository;
  freelancers: IFreelancerRepository;
  services: IServiceRepository;
  shopifyMappings: IShopifyMappingRepository;
  socialAccounts: ISocialAccountRepository;
  queueLog: IQueueLogRepository;
}
