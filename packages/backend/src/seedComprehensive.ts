// Comprehensive seed — loads seed_data.json with 20 designers, 15 clients,
// 10 projects, 5 invoices, 30 interactions into the in-memory store.
// Falls back gracefully if the JSON doesn't exist.
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { v4 as uuid } from "uuid";
import { Freelancer, Service, Order } from "@dm/shared";
import type { FreelancerService } from "@dm/shared";
import { logger } from "./logger.js";
import { store, now } from "./repositories/memory/store.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

interface SeedDesigner {
  name: string;
  email: string;
  category: string;
  rate_min: number;
  rate_max: number;
  quality_rating: number;
  country: string;
  ai_tools_used: string[];
  total_orders_completed: number;
}

interface SeedClient {
  name: string;
  email: string;
  phone: string;
  company: string;
  industry: string;
  location: string;
}

interface SeedProject {
  client_idx: number;
  designer_idx: number;
  service_type: string;
  status: string;
  priority: string;
  total_amount: number;
  notes: string;
}

interface SeedData {
  designers: SeedDesigner[];
  clients: SeedClient[];
  projects: SeedProject[];
  invoices: unknown[];
  interactions: unknown[];
}

export function seedComprehensive(): void {
  const seedPath = resolve(__dirname, "seed_data.json");
  if (!existsSync(seedPath)) {
    logger.debug("seed_data.json not found — skipping comprehensive seed");
    return;
  }

  let data: SeedData;
  try {
    data = JSON.parse(readFileSync(seedPath, "utf8")) as SeedData;
  } catch (err) {
    logger.error({ err }, "Failed to parse seed_data.json");
    return;
  }

  const ts = now();
  const categoryServiceMap = new Map<string, string>();

  // 1. Create services from unique categories
  const categories = [...new Set(data.designers.map((d) => d.category))];
  for (const cat of categories) {
    const serviceId = uuid();
    const service = Service.parse({
      service_id: serviceId,
      name: cat,
      category: cat,
      base_price: 150,
      estimated_hours: 20,
      shopify_product_ids: [],
      description: `Professional ${cat} services`,
      active: true,
      created_at: ts,
      updated_at: ts,
    });
    store.services.set(serviceId, service);
    categoryServiceMap.set(cat, serviceId);
  }

  // 2. Create freelancers (designers)
  const designerIds: string[] = [];
  for (const d of data.designers) {
    const id = uuid();
    designerIds.push(id);
    const freelancer = Freelancer.parse({
      freelancer_id: id,
      name: d.name,
      email: d.email,
      phone: null,
      portfolio_url: null,
      rate_min: d.rate_min,
      rate_max: d.rate_max,
      quality_rating: d.quality_rating,
      availability_status: "available",
      ai_tools_used: d.ai_tools_used,
      country: d.country,
      timezone: null,
      total_orders_completed: d.total_orders_completed,
      avg_delivery_time_hours: Math.floor(Math.random() * 48) + 24,
      created_at: ts,
      updated_at: ts,
    });
    store.freelancers.set(id, freelancer);

    // Link designer to their service category
    const serviceId = categoryServiceMap.get(d.category);
    if (serviceId) {
      const link: FreelancerService = {
        freelancer_id: id,
        service_id: serviceId,
        custom_rate: d.rate_min,
        skill_level: d.quality_rating >= 4.8 ? "lead" : d.quality_rating >= 4.5 ? "senior" : "intermediate",
      };
      store.freelancerServices.push(link);
    }
  }

  // 3. Create orders (projects)
  for (const proj of data.projects) {
    const client = data.clients[proj.client_idx];
    const designerId = designerIds[proj.designer_idx] ?? null;
    const serviceId = categoryServiceMap.get(proj.service_type) ?? null;
    const order = Order.parse({
      order_id: uuid(),
      shopify_order_id: `DM-${2000 + data.projects.indexOf(proj)}`,
      customer_name: client?.name ?? "Unknown Client",
      customer_email: client?.email ?? "unknown@example.com",
      service_id: serviceId,
      service_type: proj.service_type,
      assigned_freelancer_id: proj.status === "new" ? null : designerId,
      status: proj.status === "delivered" ? "delivered" : proj.status as any,
      priority: proj.priority as any,
      due_date: null,
      total_amount: proj.total_amount,
      currency: "AUD",
      notes: proj.notes,
      created_at: ts,
      updated_at: ts,
    });
    store.orders.set(order.order_id, order);
  }

  logger.info(
    {
      designers: store.freelancers.size,
      services: store.services.size,
      projects: store.orders.size,
      clients: data.clients.length,
      interactions: data.interactions.length,
    },
    "Comprehensive seed data loaded",
  );
}
