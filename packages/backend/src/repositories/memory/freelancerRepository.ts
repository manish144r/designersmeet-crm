import { v4 as uuid } from "uuid";
import { Freelancer, type FreelancerCreate, type FreelancerService } from "@dm/shared";
import type { IFreelancerRepository } from "../interfaces.js";
import { now, store } from "./store.js";

export class InMemoryFreelancerRepository implements IFreelancerRepository {
  async list(filter?: { availability_status?: string; category?: string }) {
    let rows = Array.from(store.freelancers.values());
    if (filter?.availability_status)
      rows = rows.filter((r) => r.availability_status === filter.availability_status);
    if (filter?.category) {
      const ids = new Set(
        store.freelancerServices
          .filter((fs) => {
            const svc = store.services.get(fs.service_id);
            return svc?.category === filter.category;
          })
          .map((fs) => fs.freelancer_id),
      );
      rows = rows.filter((r) => ids.has(r.freelancer_id));
    }
    return rows.sort((a, b) => a.name.localeCompare(b.name));
  }

  async findById(id: string) {
    return store.freelancers.get(id) ?? null;
  }

  async create(data: FreelancerCreate) {
    const ts = now();
    const freelancer = Freelancer.parse({
      ...data,
      freelancer_id: uuid(),
      created_at: ts,
      updated_at: ts,
    });
    store.freelancers.set(freelancer.freelancer_id, freelancer);
    return freelancer;
  }

  async update(id: string, data: Partial<FreelancerCreate>) {
    const existing = store.freelancers.get(id);
    if (!existing) throw new Error(`Freelancer ${id} not found`);
    const updated = Freelancer.parse({ ...existing, ...data, freelancer_id: id, updated_at: now() });
    store.freelancers.set(id, updated);
    return updated;
  }

  async delete(id: string) {
    store.freelancers.delete(id);
    store.freelancerServices = store.freelancerServices.filter((fs) => fs.freelancer_id !== id);
  }

  async listServices(freelancerId: string) {
    return store.freelancerServices.filter((fs) => fs.freelancer_id === freelancerId);
  }

  async attachService(link: FreelancerService) {
    store.freelancerServices = store.freelancerServices.filter(
      (fs) => !(fs.freelancer_id === link.freelancer_id && fs.service_id === link.service_id),
    );
    store.freelancerServices.push(link);
    return link;
  }

  async detachService(freelancerId: string, serviceId: string) {
    store.freelancerServices = store.freelancerServices.filter(
      (fs) => !(fs.freelancer_id === freelancerId && fs.service_id === serviceId),
    );
  }
}
