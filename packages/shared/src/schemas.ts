import { z } from "zod";
import {
  FREELANCER_AVAILABILITY,
  ORDER_STATUSES,
  QUEUE_NAMES,
  QUEUE_STATUSES,
  SKILL_LEVELS,
  SOCIAL_PLATFORMS,
} from "./constants.js";

const isoDate = z.string().datetime({ offset: true });

export const OrderStatus = z.enum(ORDER_STATUSES);
export type OrderStatus = z.infer<typeof OrderStatus>;

export const QueueStatus = z.enum(QUEUE_STATUSES);
export type QueueStatus = z.infer<typeof QueueStatus>;

export const QueueName = z.enum(QUEUE_NAMES);
export type QueueName = z.infer<typeof QueueName>;

export const SocialPlatform = z.enum(SOCIAL_PLATFORMS);
export type SocialPlatform = z.infer<typeof SocialPlatform>;

export const FreelancerAvailability = z.enum(FREELANCER_AVAILABILITY);
export type FreelancerAvailability = z.infer<typeof FreelancerAvailability>;

export const SkillLevel = z.enum(SKILL_LEVELS);
export type SkillLevel = z.infer<typeof SkillLevel>;

// ─── Freelancer ───────────────────────────────────────────────────────────
export const Freelancer = z.object({
  freelancer_id: z.string().uuid(),
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().nullable().default(null),
  portfolio_url: z.string().url().nullable().default(null),
  rate_min: z.number().nonnegative(),
  rate_max: z.number().nonnegative(),
  quality_rating: z.number().min(0).max(5).default(0),
  availability_status: FreelancerAvailability.default("available"),
  ai_tools_used: z.array(z.string()).default([]),
  country: z.string().nullable().default(null),
  timezone: z.string().nullable().default(null),
  total_orders_completed: z.number().int().nonnegative().default(0),
  avg_delivery_time_hours: z.number().nonnegative().default(0),
  created_at: isoDate,
  updated_at: isoDate,
});
export type Freelancer = z.infer<typeof Freelancer>;
export const FreelancerCreate = Freelancer.omit({
  freelancer_id: true,
  created_at: true,
  updated_at: true,
}).partial({
  quality_rating: true,
  availability_status: true,
  ai_tools_used: true,
  country: true,
  timezone: true,
  total_orders_completed: true,
  avg_delivery_time_hours: true,
  phone: true,
  portfolio_url: true,
});
export type FreelancerCreate = z.infer<typeof FreelancerCreate>;

// ─── Service ─────────────────────────────────────────────────────────────
export const Service = z.object({
  service_id: z.string().uuid(),
  name: z.string().min(1),
  category: z.string().min(1),
  base_price: z.number().nonnegative(),
  estimated_hours: z.number().nonnegative().default(0),
  shopify_product_ids: z.array(z.string()).default([]),
  description: z.string().default(""),
  active: z.boolean().default(true),
  created_at: isoDate,
  updated_at: isoDate,
});
export type Service = z.infer<typeof Service>;
export const ServiceCreate = Service.omit({
  service_id: true,
  created_at: true,
  updated_at: true,
}).partial({
  estimated_hours: true,
  shopify_product_ids: true,
  description: true,
  active: true,
});
export type ServiceCreate = z.infer<typeof ServiceCreate>;

// ─── FreelancerService (junction) ────────────────────────────────────────
export const FreelancerService = z.object({
  freelancer_id: z.string().uuid(),
  service_id: z.string().uuid(),
  custom_rate: z.number().nonnegative().nullable().default(null),
  skill_level: SkillLevel.default("intermediate"),
});
export type FreelancerService = z.infer<typeof FreelancerService>;

// ─── Order ───────────────────────────────────────────────────────────────
export const Order = z.object({
  order_id: z.string().uuid(),
  shopify_order_id: z.string().nullable().default(null),
  customer_name: z.string().min(1),
  customer_email: z.string().email(),
  service_id: z.string().uuid().nullable().default(null),
  service_type: z.string().min(1),
  assigned_freelancer_id: z.string().uuid().nullable().default(null),
  status: OrderStatus.default("new"),
  priority: z.enum(["low", "normal", "high", "urgent"]).default("normal"),
  due_date: isoDate.nullable().default(null),
  total_amount: z.number().nonnegative().default(0),
  currency: z.string().length(3).default("USD"),
  notes: z.string().default(""),
  created_at: isoDate,
  updated_at: isoDate,
});
export type Order = z.infer<typeof Order>;
export const OrderCreate = Order.omit({
  order_id: true,
  created_at: true,
  updated_at: true,
}).partial({
  shopify_order_id: true,
  service_id: true,
  assigned_freelancer_id: true,
  status: true,
  priority: true,
  due_date: true,
  total_amount: true,
  currency: true,
  notes: true,
});
export type OrderCreate = z.infer<typeof OrderCreate>;

export const OrderUpdate = OrderCreate.partial();
export type OrderUpdate = z.infer<typeof OrderUpdate>;

// ─── Shopify mapping ─────────────────────────────────────────────────────
export const ShopifyMapping = z.object({
  mapping_id: z.string().uuid(),
  shopify_product_id: z.string().min(1),
  shopify_product_title: z.string().default(""),
  service_id: z.string().uuid(),
  auto_assign_enabled: z.boolean().default(false),
  default_freelancer_id: z.string().uuid().nullable().default(null),
  created_at: isoDate,
  updated_at: isoDate,
});
export type ShopifyMapping = z.infer<typeof ShopifyMapping>;
export const ShopifyMappingCreate = ShopifyMapping.omit({
  mapping_id: true,
  created_at: true,
  updated_at: true,
}).partial({
  shopify_product_title: true,
  auto_assign_enabled: true,
  default_freelancer_id: true,
});
export type ShopifyMappingCreate = z.infer<typeof ShopifyMappingCreate>;

// ─── Queue item ──────────────────────────────────────────────────────────
export const OrderQueueItem = z.object({
  queue_id: z.string().uuid(),
  order_id: z.string().uuid().nullable().default(null),
  queue_type: QueueName,
  payload: z.record(z.unknown()),
  status: QueueStatus.default("pending"),
  retry_count: z.number().int().nonnegative().default(0),
  last_error: z.string().nullable().default(null),
  created_at: isoDate,
  updated_at: isoDate,
});
export type OrderQueueItem = z.infer<typeof OrderQueueItem>;

// ─── Social media account ────────────────────────────────────────────────
export const SocialMediaAccount = z.object({
  account_id: z.string().uuid(),
  platform: SocialPlatform,
  account_name: z.string().min(1),
  access_token: z.string(),
  refresh_token: z.string().nullable().default(null),
  token_expires_at: isoDate.nullable().default(null),
  active: z.boolean().default(true),
  created_at: isoDate,
  updated_at: isoDate,
});
export type SocialMediaAccount = z.infer<typeof SocialMediaAccount>;
export const SocialMediaAccountCreate = SocialMediaAccount.omit({
  account_id: true,
  created_at: true,
  updated_at: true,
}).partial({
  refresh_token: true,
  token_expires_at: true,
  active: true,
});
export type SocialMediaAccountCreate = z.infer<typeof SocialMediaAccountCreate>;

export const SocialPostRequest = z.object({
  account_id: z.string().uuid(),
  content: z.string().min(1).max(3000),
  media_urls: z.array(z.string().url()).default([]),
  scheduled_at: isoDate.nullable().default(null),
});
export type SocialPostRequest = z.infer<typeof SocialPostRequest>;

// ─── Queue stats (for dashboard) ─────────────────────────────────────────
export const QueueStats = z.object({
  queue_name: QueueName,
  pending: z.number().int().nonnegative(),
  processing: z.number().int().nonnegative(),
  completed: z.number().int().nonnegative(),
  failed: z.number().int().nonnegative(),
  dlq: z.number().int().nonnegative(),
});
export type QueueStats = z.infer<typeof QueueStats>;
