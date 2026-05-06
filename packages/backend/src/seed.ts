// Seeds the in-memory store with the curated freelancer DB + Shopify product catalog
// from C:\Users\smani\CompanyWorkspaces\dm_launch\. Skipped silently when the source
// files don't exist — the app still boots clean.
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { v4 as uuid } from "uuid";
import {
  Freelancer,
  type FreelancerService,
  Service,
  ShopifyMapping,
  Order,
} from "@dm/shared";
import { config } from "./config.js";
import { logger } from "./logger.js";
import { store, now } from "./repositories/memory/store.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

interface SeedFreelancerRow {
  name: string;
  category: string;
  rate: number;
  ourPrice: number;
  platform: string;
  reviews: number;
  margin: number;
  stars: number;
  fit: number;
  tier: string;
  country: string;
}

interface SeedFile {
  categories: { name: string; basic: number; pro: number; premium: number }[];
  freelancers: SeedFreelancerRow[];
}

function slugifyEmail(name: string): string {
  return `${name.toLowerCase().replace(/[^a-z0-9]+/g, ".")}@designersmeet.app`;
}

function resolveSeedPath(): string | null {
  // Try the configured path resolved from a few likely roots, plus an absolute
  // fallback to the known dm_launch location described in CLAUDE.md.
  const candidates = [
    resolve(__dirname, "..", config.SEED_FREELANCERS_PATH),
    resolve(__dirname, "..", "..", config.SEED_FREELANCERS_PATH),
    resolve(process.cwd(), config.SEED_FREELANCERS_PATH),
    resolve(__dirname, "..", "..", "..", "..", "..", "dm_launch", "freelancer_db.json"),
  ];
  return candidates.find((p) => existsSync(p)) ?? null;
}

export function seedInMemory(): void {
  const seedPath = resolveSeedPath();
  if (!seedPath) {
    logger.warn(
      { configured: config.SEED_FREELANCERS_PATH },
      "Seed file not found — starting with empty store. Set SEED_FREELANCERS_PATH to a valid freelancer_db.json.",
    );
    return;
  }

  let raw: SeedFile;
  try {
    // Strip a UTF-8 BOM if present (PowerShell-generated JSON often has one)
    const text = readFileSync(seedPath, "utf8").replace(/^﻿/, "");
    raw = JSON.parse(text) as SeedFile;
  } catch (err) {
    logger.error({ err, seedPath }, "Failed to parse seed file");
    return;
  }

  const ts = now();
  const categoryToServiceId = new Map<string, string>();

  // 1. Services — one row per category with Pro pricing as base_price
  for (const cat of raw.categories ?? []) {
    const service = Service.parse({
      service_id: uuid(),
      name: cat.name,
      category: cat.name,
      base_price: cat.pro,
      estimated_hours: 0,
      shopify_product_ids: [],
      description: `${cat.name} — Basic $${cat.basic} / Pro $${cat.pro} / Premium $${cat.premium}`,
      active: true,
      created_at: ts,
      updated_at: ts,
    });
    store.services.set(service.service_id, service);
    categoryToServiceId.set(cat.name, service.service_id);
  }

  // 2. Freelancers + junction
  for (const row of raw.freelancers ?? []) {
    const freelancer = Freelancer.parse({
      freelancer_id: uuid(),
      name: row.name,
      email: slugifyEmail(row.name),
      phone: null,
      portfolio_url: null,
      rate_min: row.rate,
      rate_max: row.ourPrice,
      quality_rating: row.stars ?? 0,
      availability_status: "available",
      ai_tools_used: [],
      country: row.country ?? null,
      timezone: null,
      total_orders_completed: row.reviews ?? 0,
      avg_delivery_time_hours: 0,
      created_at: ts,
      updated_at: ts,
    });
    store.freelancers.set(freelancer.freelancer_id, freelancer);

    const serviceId = categoryToServiceId.get(row.category);
    if (serviceId) {
      const link: FreelancerService = {
        freelancer_id: freelancer.freelancer_id,
        service_id: serviceId,
        custom_rate: row.rate,
        skill_level: row.tier?.toLowerCase().includes("premium")
          ? "lead"
          : row.tier?.toLowerCase().includes("pro")
            ? "senior"
            : "intermediate",
      };
      store.freelancerServices.push(link);
    }
  }

  // 3. A handful of demo Shopify mappings + sample orders for the Kanban demo
  const services = Array.from(store.services.values());
  const freelancers = Array.from(store.freelancers.values());
  for (let i = 0; i < Math.min(3, services.length); i++) {
    const svc = services[i]!;
    const fl = freelancers[i] ?? null;
    const mapping = ShopifyMapping.parse({
      mapping_id: uuid(),
      shopify_product_id: `demo-product-${i + 1}`,
      shopify_product_title: svc.name,
      service_id: svc.service_id,
      auto_assign_enabled: i === 0,
      default_freelancer_id: fl?.freelancer_id ?? null,
      created_at: ts,
      updated_at: ts,
    });
    store.shopifyMappings.set(mapping.mapping_id, mapping);
  }

  const sampleStatuses = ["new", "assigned", "in_progress", "review"] as const;
  for (let i = 0; i < 4 && i < services.length; i++) {
    const svc = services[i]!;
    const fl = i === 0 ? null : freelancers[i % freelancers.length]!;
    const order = Order.parse({
      order_id: uuid(),
      shopify_order_id: `SHOP-${1000 + i}`,
      customer_name: `Demo Customer ${i + 1}`,
      customer_email: `customer${i + 1}@example.com`,
      service_id: svc.service_id,
      service_type: svc.name,
      assigned_freelancer_id: fl?.freelancer_id ?? null,
      status: sampleStatuses[i % sampleStatuses.length]!,
      priority: "normal",
      due_date: null,
      total_amount: svc.base_price,
      currency: "USD",
      notes: "Seeded demo order",
      created_at: ts,
      updated_at: ts,
    });
    store.orders.set(order.order_id, order);
  }

  logger.info(
    {
      services: store.services.size,
      freelancers: store.freelancers.size,
      mappings: store.shopifyMappings.size,
      orders: store.orders.size,
    },
    "Seed data loaded",
  );
}

// Allow running standalone via `npm run seed`
const isMainModule = import.meta.url === `file://${process.argv[1]?.replace(/\\/g, "/")}`;
if (isMainModule) {
  seedInMemory();
  console.log(`Seeded ${store.freelancers.size} freelancers, ${store.services.size} services.`);
}
