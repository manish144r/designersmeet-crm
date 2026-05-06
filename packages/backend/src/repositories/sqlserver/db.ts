// Lazy Knex connection for SQL Server. Schema is created on first init() so the
// app boots clean against an empty database (no separate migration step required
// for this v1 — call createSchema() from container.init when DATA_PROVIDER=sqlserver).
import Knex, { type Knex as KnexType } from "knex";
import { config } from "../../config.js";

let cached: KnexType | null = null;

export function getDb(): KnexType {
  if (cached) return cached;
  cached = Knex({
    client: "mssql",
    connection: {
      host: config.SQLSERVER_HOST,
      port: config.SQLSERVER_PORT,
      user: config.SQLSERVER_USER,
      password: config.SQLSERVER_PASSWORD,
      database: config.SQLSERVER_DATABASE,
      options: {
        encrypt: config.SQLSERVER_ENCRYPT,
        trustServerCertificate: config.SQLSERVER_TRUST_SERVER_CERT,
      },
    },
    pool: { min: 0, max: 10 },
  });
  return cached;
}

export async function ensureSchema(): Promise<void> {
  const db = getDb();

  if (!(await db.schema.hasTable("freelancers"))) {
    await db.schema.createTable("freelancers", (t) => {
      t.uuid("freelancer_id").primary();
      t.string("name").notNullable();
      t.string("email").notNullable();
      t.string("phone").nullable();
      t.string("portfolio_url", 500).nullable();
      t.decimal("rate_min", 10, 2).notNullable().defaultTo(0);
      t.decimal("rate_max", 10, 2).notNullable().defaultTo(0);
      t.decimal("quality_rating", 3, 2).notNullable().defaultTo(0);
      t.string("availability_status").notNullable().defaultTo("available");
      t.text("ai_tools_used_json").notNullable().defaultTo("[]");
      t.string("country").nullable();
      t.string("timezone").nullable();
      t.integer("total_orders_completed").notNullable().defaultTo(0);
      t.decimal("avg_delivery_time_hours", 10, 2).notNullable().defaultTo(0);
      t.string("created_at").notNullable();
      t.string("updated_at").notNullable();
    });
  }

  if (!(await db.schema.hasTable("services"))) {
    await db.schema.createTable("services", (t) => {
      t.uuid("service_id").primary();
      t.string("name").notNullable();
      t.string("category").notNullable();
      t.decimal("base_price", 10, 2).notNullable().defaultTo(0);
      t.decimal("estimated_hours", 10, 2).notNullable().defaultTo(0);
      t.text("shopify_product_ids_json").notNullable().defaultTo("[]");
      t.text("description").notNullable().defaultTo("");
      t.boolean("active").notNullable().defaultTo(true);
      t.string("created_at").notNullable();
      t.string("updated_at").notNullable();
    });
  }

  if (!(await db.schema.hasTable("freelancer_services"))) {
    await db.schema.createTable("freelancer_services", (t) => {
      t.uuid("freelancer_id").notNullable();
      t.uuid("service_id").notNullable();
      t.decimal("custom_rate", 10, 2).nullable();
      t.string("skill_level").notNullable().defaultTo("intermediate");
      t.primary(["freelancer_id", "service_id"]);
    });
  }

  if (!(await db.schema.hasTable("orders"))) {
    await db.schema.createTable("orders", (t) => {
      t.uuid("order_id").primary();
      t.string("shopify_order_id").nullable();
      t.string("customer_name").notNullable();
      t.string("customer_email").notNullable();
      t.uuid("service_id").nullable();
      t.string("service_type").notNullable();
      t.uuid("assigned_freelancer_id").nullable();
      t.string("status").notNullable().defaultTo("new");
      t.string("priority").notNullable().defaultTo("normal");
      t.string("due_date").nullable();
      t.decimal("total_amount", 10, 2).notNullable().defaultTo(0);
      t.string("currency", 3).notNullable().defaultTo("USD");
      t.text("notes").notNullable().defaultTo("");
      t.string("created_at").notNullable();
      t.string("updated_at").notNullable();
    });
  }

  if (!(await db.schema.hasTable("shopify_mappings"))) {
    await db.schema.createTable("shopify_mappings", (t) => {
      t.uuid("mapping_id").primary();
      t.string("shopify_product_id").notNullable();
      t.string("shopify_product_title").notNullable().defaultTo("");
      t.uuid("service_id").notNullable();
      t.boolean("auto_assign_enabled").notNullable().defaultTo(false);
      t.uuid("default_freelancer_id").nullable();
      t.string("created_at").notNullable();
      t.string("updated_at").notNullable();
    });
  }

  if (!(await db.schema.hasTable("social_accounts"))) {
    await db.schema.createTable("social_accounts", (t) => {
      t.uuid("account_id").primary();
      t.string("platform").notNullable();
      t.string("account_name").notNullable();
      t.text("access_token").notNullable();
      t.text("refresh_token").nullable();
      t.string("token_expires_at").nullable();
      t.boolean("active").notNullable().defaultTo(true);
      t.string("created_at").notNullable();
      t.string("updated_at").notNullable();
    });
  }

  if (!(await db.schema.hasTable("order_queue"))) {
    await db.schema.createTable("order_queue", (t) => {
      t.uuid("queue_id").primary();
      t.uuid("order_id").nullable();
      t.string("queue_type").notNullable();
      t.text("payload_json").notNullable().defaultTo("{}");
      t.string("status").notNullable().defaultTo("pending");
      t.integer("retry_count").notNullable().defaultTo(0);
      t.text("last_error").nullable();
      t.string("created_at").notNullable();
      t.string("updated_at").notNullable();
    });
  }
}
