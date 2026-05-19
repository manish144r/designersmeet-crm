import "dotenv/config";
import { z } from "zod";

const Env = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  BACKEND_PORT: z.coerce.number().int().positive().default(4000),
  CORS_ORIGIN: z.string().default("http://localhost:5173"),

  DATA_PROVIDER: z.enum(["memory", "dataverse", "sqlserver"]).default("memory"),
  QUEUE_PROVIDER: z.enum(["memory", "azure-service-bus", "supabase"]).default("memory"),
  AUTH_MODE: z.enum(["dev", "entra"]).default("dev"),

  DATAVERSE_URL: z.string().optional(),
  AZURE_TENANT_ID: z.string().optional(),
  AZURE_CLIENT_ID: z.string().optional(),
  AZURE_CLIENT_SECRET: z.string().optional(),

  SQLSERVER_HOST: z.string().default("localhost"),
  SQLSERVER_PORT: z.coerce.number().int().default(1433),
  SQLSERVER_DATABASE: z.string().default("designersmeet"),
  SQLSERVER_USER: z.string().default("sa"),
  SQLSERVER_PASSWORD: z.string().default(""),
  SQLSERVER_ENCRYPT: z.coerce.boolean().default(false),
  SQLSERVER_TRUST_SERVER_CERT: z.coerce.boolean().default(true),

  SERVICE_BUS_NAMESPACE: z.string().optional(),
  SERVICE_BUS_CONNECTION_STRING: z.string().optional(),

  SUPABASE_URL: z.string().optional(),
  SUPABASE_ANON_KEY: z.string().optional(),
  SUPABASE_QUEUE_TABLE: z.string().default("order_queue"),

  ENTRA_TENANT_ID: z.string().optional(),
  ENTRA_CLIENT_ID: z.string().optional(),
  ENTRA_AUDIENCE: z.string().optional(),

  SENTRY_DSN: z.string().optional(),
  DEMO_BYPASS_EMAIL: z.string().default("vendor@designersmeet.demo"),

  // ── Integration feature flags (default OFF; build runs with no external
  //    deps; demo mode forces all off; smoke tests skip cleanly w/o creds) ──
  GRAPH_ENABLED: z.coerce.boolean().default(false),
  GRAPH_ACCESS_TOKEN: z.string().optional(),
  SHOPIFY_ENABLED: z.coerce.boolean().default(false),
  META_ENABLED: z.coerce.boolean().default(false),
  META_ACCESS_TOKEN: z.string().optional(),
  META_PAGE_ID: z.string().optional(),
  STRIPE_ENABLED: z.coerce.boolean().default(false),
  STRIPE_SECRET_KEY: z.string().optional(),
  EMAIL_PROVIDER: z
    .enum(["msgraph", "gmail", "imap_smtp", "resend", "ses", "sendgrid", "postmark", "mailgun"])
    .default("resend"),
  EMAIL_ENABLED: z.coerce.boolean().default(false),
  EMAIL_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().default("no-reply@designersmeet.com"),
  SMTP_URL: z.string().optional(),
  GOOGLE_OAUTH_CLIENT_ID: z.string().optional(),
  APPLE_OAUTH_CLIENT_ID: z.string().optional(),

  SHOPIFY_STORE_DOMAIN: z.string().optional(),
  SHOPIFY_API_SECRET: z.string().optional(),
  SHOPIFY_WEBHOOK_SECRET: z.string().optional(),
  SHOPIFY_ADMIN_TOKEN: z.string().optional(),

  LINKEDIN_CLIENT_ID: z.string().optional(),
  LINKEDIN_CLIENT_SECRET: z.string().optional(),
  LINKEDIN_REDIRECT_URI: z.string().optional(),

  SEED_FREELANCERS_PATH: z.string().default("../../../dm_launch/freelancer_db.json"),
  SEED_SHOPIFY_CSV_PATH: z.string().default("../../../dm_launch/shopify_import.csv"),
});

export const config = Env.parse(process.env);
export type Config = z.infer<typeof Env>;

// Production safety validation — fail fast on dangerous configs
if (config.NODE_ENV === "production") {
  if (config.AUTH_MODE === "dev") {
    throw new Error(
      "FATAL: AUTH_MODE=dev is not allowed in production. Set AUTH_MODE=entra and configure ENTRA_* variables.",
    );
  }
  if (config.QUEUE_PROVIDER === "memory" && !config.SUPABASE_URL && !config.SERVICE_BUS_CONNECTION_STRING) {
    throw new Error(
      "FATAL: QUEUE_PROVIDER=memory with no persistent fallback is not allowed in production. " +
        "Set SUPABASE_URL+SUPABASE_ANON_KEY or SERVICE_BUS_CONNECTION_STRING.",
    );
  }
  if (config.AUTH_MODE === "entra" && (!config.ENTRA_TENANT_ID || !config.ENTRA_CLIENT_ID)) {
    throw new Error(
      "FATAL: AUTH_MODE=entra requires ENTRA_TENANT_ID and ENTRA_CLIENT_ID in production.",
    );
  }
}
