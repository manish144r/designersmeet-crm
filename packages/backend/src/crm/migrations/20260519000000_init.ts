// Schema for the 14 CRM resources (brief/spec.md §4). Targets mssql in prod;
// dev/demo uses the in-memory store, so this runs only when DATA_PROVIDER=sqlserver.
import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("vendors", (t) => {
    t.string("id").primary();
    t.string("name").notNullable();
    t.string("email").notNullable();
    t.string("phone");
    t.string("tier").defaultTo("standard");
    t.json("skills");
    t.json("regions");
    t.float("rating_avg").defaultTo(0);
    t.timestamp("nda_signed_at");
    t.timestamp("msa_signed_at");
    t.json("rate_card_json");
    t.timestamp("last_project_at");
    t.timestamp("created_at").defaultTo(knex.fn.now());
  });

  await knex.schema.createTable("clients", (t) => {
    t.string("id").primary();
    t.string("name").notNullable();
    t.string("email").notNullable();
    t.string("phone");
    t.string("company");
    t.string("owner_user_id");
    t.timestamp("created_at").defaultTo(knex.fn.now());
  });

  await knex.schema.createTable("contacts", (t) => {
    t.string("id").primary();
    t.string("type").defaultTo("lead");
    t.string("first_name").notNullable();
    t.string("last_name");
    t.string("primary_email").notNullable();
    t.string("primary_phone");
    t.string("address");
    t.json("custom_fields_json");
    t.string("owner_user_id");
    t.timestamp("created_at").defaultTo(knex.fn.now());
  });

  await knex.schema.createTable("pipelines", (t) => {
    t.string("id").primary();
    t.string("name").notNullable();
    t.timestamp("created_at").defaultTo(knex.fn.now());
  });

  await knex.schema.createTable("pipeline_stages", (t) => {
    t.string("id").primary();
    t.string("pipeline_id").notNullable();
    t.string("name").notNullable();
    t.integer("order").defaultTo(0);
  });

  await knex.schema.createTable("projects", (t) => {
    t.string("id").primary();
    t.string("name").notNullable();
    t.string("contact_id");
    t.string("status").defaultTo("brief");
    t.string("manager_user_id");
    t.string("designer_user_id");
    t.timestamp("start_date");
    t.timestamp("target_end_date");
    t.bigInteger("budget_cents").defaultTo(0);
    t.timestamp("created_at").defaultTo(knex.fn.now());
  });

  await knex.schema.createTable("project_stages", (t) => {
    t.string("id").primary();
    t.string("project_id").notNullable();
    t.string("name").notNullable();
    t.integer("order").defaultTo(0);
    t.string("status").defaultTo("pending");
  });

  await knex.schema.createTable("conversations", (t) => {
    t.string("id").primary();
    t.string("contact_id").notNullable();
    t.string("subject");
    t.string("channel").defaultTo("email");
    t.string("status").defaultTo("open");
    t.timestamp("last_message_at");
    t.string("assigned_user_id");
  });

  await knex.schema.createTable("messages", (t) => {
    t.string("id").primary();
    t.string("conversation_id").notNullable();
    t.string("channel").defaultTo("email");
    t.string("direction").defaultTo("inbound");
    t.string("from_address");
    t.string("to_address");
    t.text("body");
    t.timestamp("sent_at").defaultTo(knex.fn.now());
  });

  await knex.schema.createTable("calendar_events", (t) => {
    t.string("id").primary();
    t.string("title").notNullable();
    t.string("contact_id");
    t.timestamp("start_at").notNullable();
    t.timestamp("end_at").notNullable();
    t.string("type").defaultTo("personal");
    t.string("status").defaultTo("confirmed");
  });

  await knex.schema.createTable("workflows", (t) => {
    t.string("id").primary();
    t.string("name").notNullable();
    t.string("trigger_type").notNullable();
    t.json("trigger_filters_json");
    t.json("steps_json");
    t.string("status").defaultTo("draft");
    t.timestamp("created_at").defaultTo(knex.fn.now());
  });

  await knex.schema.createTable("workflow_runs", (t) => {
    t.string("id").primary();
    t.string("workflow_id").notNullable();
    t.string("status").defaultTo("queued");
    t.timestamp("started_at").defaultTo(knex.fn.now());
    t.timestamp("completed_at");
    t.text("error_text");
  });

  await knex.schema.createTable("forms", (t) => {
    t.string("id").primary();
    t.string("name").notNullable();
    t.json("schema_json");
    t.string("public_slug").notNullable();
    t.string("on_submit_workflow_id");
    t.timestamp("created_at").defaultTo(knex.fn.now());
  });

  await knex.schema.createTable("form_submissions", (t) => {
    t.string("id").primary();
    t.string("form_id").notNullable();
    t.string("contact_id");
    t.json("payload_json");
    t.timestamp("submitted_at").defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  for (const tbl of [
    "form_submissions",
    "forms",
    "workflow_runs",
    "workflows",
    "calendar_events",
    "messages",
    "conversations",
    "project_stages",
    "projects",
    "pipeline_stages",
    "pipelines",
    "contacts",
    "clients",
    "vendors",
  ]) {
    await knex.schema.dropTableIfExists(tbl);
  }
}
