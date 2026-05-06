import type { Repositories } from "../interfaces.js";
import { InMemoryFreelancerRepository } from "./freelancerRepository.js";
import { InMemoryOrderRepository } from "./orderRepository.js";
import { InMemoryQueueLogRepository } from "./queueLogRepository.js";
import { InMemoryServiceRepository } from "./serviceRepository.js";
import { InMemoryShopifyMappingRepository } from "./shopifyMappingRepository.js";
import { InMemorySocialAccountRepository } from "./socialAccountRepository.js";

export function buildInMemoryRepos(): Repositories {
  return {
    orders: new InMemoryOrderRepository(),
    freelancers: new InMemoryFreelancerRepository(),
    services: new InMemoryServiceRepository(),
    shopifyMappings: new InMemoryShopifyMappingRepository(),
    socialAccounts: new InMemorySocialAccountRepository(),
    queueLog: new InMemoryQueueLogRepository(),
  };
}
