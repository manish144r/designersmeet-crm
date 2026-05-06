import type {
  Freelancer,
  FreelancerCreate,
  Order,
  OrderCreate,
  OrderQueueItem,
  OrderUpdate,
  QueueStats,
  Service,
  ServiceCreate,
  ShopifyMapping,
  ShopifyMappingCreate,
  SocialMediaAccount,
  SocialPlatform,
} from "@dm/shared";
import { api } from "./client.js";

export const ordersApi = {
  list: (params?: { status?: string; assigned_freelancer_id?: string | null }) => {
    const query = new URLSearchParams();
    if (params?.status) query.set("status", params.status);
    if (params?.assigned_freelancer_id !== undefined)
      query.set("assigned_freelancer_id", params.assigned_freelancer_id ?? "null");
    const qs = query.toString();
    return api.get<Order[]>(`/orders${qs ? `?${qs}` : ""}`);
  },
  get: (id: string) => api.get<Order>(`/orders/${id}`),
  create: (data: OrderCreate) => api.post<Order>(`/orders`, data),
  update: (id: string, data: OrderUpdate) => api.patch<Order>(`/orders/${id}`, data),
  assign: (id: string, freelancer_id: string) => api.post<Order>(`/orders/${id}/assign`, { freelancer_id }),
  delete: (id: string) => api.delete<void>(`/orders/${id}`),
};

export const freelancersApi = {
  list: (params?: { availability_status?: string; category?: string }) => {
    const query = new URLSearchParams();
    if (params?.availability_status) query.set("availability_status", params.availability_status);
    if (params?.category) query.set("category", params.category);
    const qs = query.toString();
    return api.get<Freelancer[]>(`/freelancers${qs ? `?${qs}` : ""}`);
  },
  get: (id: string) => api.get<Freelancer>(`/freelancers/${id}`),
  create: (data: FreelancerCreate) => api.post<Freelancer>(`/freelancers`, data),
  update: (id: string, data: Partial<FreelancerCreate>) => api.patch<Freelancer>(`/freelancers/${id}`, data),
  delete: (id: string) => api.delete<void>(`/freelancers/${id}`),
};

export const servicesApi = {
  list: () => api.get<Service[]>(`/services`),
  create: (data: ServiceCreate) => api.post<Service>(`/services`, data),
  update: (id: string, data: Partial<ServiceCreate>) => api.patch<Service>(`/services/${id}`, data),
  delete: (id: string) => api.delete<void>(`/services/${id}`),
};

export const mappingsApi = {
  list: () => api.get<ShopifyMapping[]>(`/shopify-mappings`),
  create: (data: ShopifyMappingCreate) => api.post<ShopifyMapping>(`/shopify-mappings`, data),
  update: (id: string, data: Partial<ShopifyMappingCreate>) =>
    api.patch<ShopifyMapping>(`/shopify-mappings/${id}`, data),
  delete: (id: string) => api.delete<void>(`/shopify-mappings/${id}`),
};

export const queueApi = {
  stats: () => api.get<QueueStats[]>(`/queue/stats`),
  items: (params?: { queue_type?: string; status?: string }) => {
    const query = new URLSearchParams();
    if (params?.queue_type) query.set("queue_type", params.queue_type);
    if (params?.status) query.set("status", params.status);
    const qs = query.toString();
    return api.get<OrderQueueItem[]>(`/queue/items${qs ? `?${qs}` : ""}`);
  },
  testMessage: (queue_name: string, payload: Record<string, unknown>) =>
    api.post<OrderQueueItem>(`/queue/test-message`, { queue_name, payload }),
};

export type SocialAccountSummary = Omit<SocialMediaAccount, "access_token" | "refresh_token"> & {
  has_access_token: boolean;
  has_refresh_token: boolean;
};

export const socialApi = {
  platforms: () => api.get<{ platform: SocialPlatform; available: boolean }[]>(`/social/platforms`),
  accounts: (platform?: string) =>
    api.get<SocialAccountSummary[]>(`/social/accounts${platform ? `?platform=${platform}` : ""}`),
  createAccount: (data: { platform: SocialPlatform; account_name: string; access_token: string; refresh_token?: string | null }) =>
    api.post<SocialAccountSummary>(`/social/accounts`, data),
  deleteAccount: (id: string) => api.delete<void>(`/social/accounts/${id}`),
  post: (data: { account_id: string; content: string; media_urls?: string[] }) =>
    api.post<{ queued: OrderQueueItem }>(`/social/post`, data),
};
