// Shared in-memory store used by every memory repository.
// Lives at module scope so all repositories see the same state across the process.
import type {
  Freelancer,
  FreelancerService,
  Order,
  OrderQueueItem,
  Service,
  ShopifyMapping,
  SocialMediaAccount,
} from "@dm/shared";

export interface MemoryStore {
  orders: Map<string, Order>;
  freelancers: Map<string, Freelancer>;
  services: Map<string, Service>;
  freelancerServices: FreelancerService[];
  shopifyMappings: Map<string, ShopifyMapping>;
  socialAccounts: Map<string, SocialMediaAccount>;
  queueLog: Map<string, OrderQueueItem>;
}

export const store: MemoryStore = {
  orders: new Map(),
  freelancers: new Map(),
  services: new Map(),
  freelancerServices: [],
  shopifyMappings: new Map(),
  socialAccounts: new Map(),
  queueLog: new Map(),
};

export const now = () => new Date().toISOString();
