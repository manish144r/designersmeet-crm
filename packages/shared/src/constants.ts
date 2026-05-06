export const ORDER_STATUSES = [
  "new",
  "assigned",
  "in_progress",
  "review",
  "revision",
  "completed",
  "delivered",
] as const;

export const QUEUE_STATUSES = [
  "pending",
  "processing",
  "completed",
  "failed",
  "dlq",
] as const;

export const QUEUE_NAMES = [
  "orders.assignment",
  "orders.notification",
  "shopify.sync",
  "social.post",
] as const;

export const SOCIAL_PLATFORMS = ["linkedin", "facebook", "instagram"] as const;

export const SERVICE_CATEGORIES = [
  "Logo Animation",
  "Brand Identity",
  "Motion Graphics",
  "Web Design",
  "Immersive Web",
  "UI/UX Design",
  "Video Production",
  "AI Content",
  "Presentation Design",
  "Packaging Design",
] as const;

export const FREELANCER_AVAILABILITY = [
  "available",
  "busy",
  "off",
  "inactive",
] as const;

export const SKILL_LEVELS = ["junior", "intermediate", "senior", "lead"] as const;
