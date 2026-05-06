// System Dataverse table adapters: account, contact, lead.
// These wrap the standard Dataverse entities with our domain-specific helpers.
//
// Naming note: Dataverse's REST entity sets use plural lowercase names
// without the publisher prefix for system tables: "accounts", "contacts", "leads".
//
// Fields that we add to these tables via the DMCRM solution:
//   - contact: dm_freelancer_role (string), dm_skills (string), dm_availability_status (choice)
//
// These fields are added by the Codex deployment task, not by this file.

import { getDataverseClient } from "./client.js";
import { withCache, invalidate } from "./cache.js";

// ---------- Type definitions (minimal — extend as needed) ----------

export interface DataverseAccount {
  accountid?: string;
  name: string;
  emailaddress1?: string | null;
  telephone1?: string | null;
  websiteurl?: string | null;
  shopify_customer_id?: string | null; // alternate key for Shopify integration
  createdon?: string;
  modifiedon?: string;
}

export interface DataverseContact {
  contactid?: string;
  firstname?: string | null;
  lastname: string;
  emailaddress1?: string | null;
  telephone1?: string | null;
  parentcustomerid_account?: string | null; // lookup to account
  // Custom freelancer extensions
  dm_freelancer_role?: string | null;
  dm_skills?: string | null;
  dm_availability_status?: "available" | "busy" | "unavailable" | null;
  createdon?: string;
  modifiedon?: string;
}

export interface DataverseLead {
  leadid?: string;
  firstname?: string | null;
  lastname?: string | null;
  emailaddress1?: string | null;
  telephone1?: string | null;
  subject?: string | null;
  companyname?: string | null;
  leadsourcecode?: number | null; // 1=Advertisement, 2=Employee Referral, ... 10=Other
  shopify_order_id?: string | null; // captures the Shopify order that generated this lead
  createdon?: string;
  modifiedon?: string;
}

// ---------- Account repository ----------

export class AccountRepository {
  private c = getDataverseClient();
  private table = "accounts";

  /** Find an account by Shopify customer ID — used by webhook handler. */
  async findByShopifyCustomerId(shopifyCustomerId: string): Promise<DataverseAccount | null> {
    const rows = await this.c.retrieveMultiple<DataverseAccount>(
      this.table,
      `$filter=shopify_customer_id eq '${shopifyCustomerId}'&$top=1&$select=accountid,name,emailaddress1,shopify_customer_id`,
    );
    return rows[0] ?? null;
  }

  /** Idempotent upsert by Shopify customer ID. */
  async upsertByShopifyCustomerId(data: DataverseAccount): Promise<DataverseAccount> {
    if (!data.shopify_customer_id) {
      throw new Error("upsertByShopifyCustomerId requires shopify_customer_id");
    }
    const existing = await this.findByShopifyCustomerId(data.shopify_customer_id);
    if (existing?.accountid) {
      await this.c.update(this.table, existing.accountid, {
        name: data.name,
        emailaddress1: data.emailaddress1,
        telephone1: data.telephone1,
      });
      return { ...existing, ...data };
    }
    return this.c.create<DataverseAccount>(this.table, data as unknown as Record<string, unknown>);
  }

  async findById(accountId: string): Promise<DataverseAccount | null> {
    return this.c.retrieve<DataverseAccount>(this.table, accountId, [
      "accountid",
      "name",
      "emailaddress1",
      "telephone1",
      "shopify_customer_id",
    ]);
  }
}

// ---------- Contact repository ----------

export class ContactRepository {
  private c = getDataverseClient();
  private table = "contacts";

  /** Active freelancer roster — cached 30s because it's a hot read. */
  async listFreelancers(): Promise<DataverseContact[]> {
    return withCache(
      "freelancers",
      "all_active",
      30_000,
      () =>
        this.c.retrieveMultiple<DataverseContact>(
          this.table,
          "$filter=dm_freelancer_role ne null and dm_availability_status ne 'unavailable'" +
            "&$select=contactid,firstname,lastname,emailaddress1,dm_freelancer_role,dm_skills,dm_availability_status",
        ),
    );
  }

  /** Look up freelancers by skill — used by order matching. Cached 30s. */
  async findFreelancersBySkill(skill: string): Promise<DataverseContact[]> {
    const all = await this.listFreelancers();
    return all.filter((c) => c.dm_skills?.toLowerCase().includes(skill.toLowerCase()));
  }

  async findByEmail(email: string): Promise<DataverseContact | null> {
    const rows = await this.c.retrieveMultiple<DataverseContact>(
      this.table,
      `$filter=emailaddress1 eq '${email}'&$top=1&$select=contactid,firstname,lastname,emailaddress1,parentcustomerid_account`,
    );
    return rows[0] ?? null;
  }

  /** Idempotent upsert by email. */
  async upsertByEmail(data: DataverseContact & { emailaddress1: string }): Promise<DataverseContact> {
    const existing = await this.findByEmail(data.emailaddress1);
    if (existing?.contactid) {
      await this.c.update(this.table, existing.contactid, data as unknown as Record<string, unknown>);
      return { ...existing, ...data };
    }
    return this.c.create<DataverseContact>(this.table, data as unknown as Record<string, unknown>);
  }

  async updateAvailability(
    contactId: string,
    status: "available" | "busy" | "unavailable",
  ): Promise<void> {
    await this.c.update(this.table, contactId, { dm_availability_status: status });
    invalidate("freelancers"); // bust cache so next read sees fresh data
  }
}

// ---------- Lead repository ----------

export class LeadRepository {
  private c = getDataverseClient();
  private table = "leads";

  async findByShopifyOrderId(shopifyOrderId: string): Promise<DataverseLead | null> {
    const rows = await this.c.retrieveMultiple<DataverseLead>(
      this.table,
      `$filter=shopify_order_id eq '${shopifyOrderId}'&$top=1&$select=leadid,subject,emailaddress1,shopify_order_id`,
    );
    return rows[0] ?? null;
  }

  /** Create a lead from a Shopify order webhook — idempotent by shopify_order_id. */
  async createFromShopifyOrder(data: DataverseLead & { shopify_order_id: string }): Promise<DataverseLead> {
    const existing = await this.findByShopifyOrderId(data.shopify_order_id);
    if (existing) return existing;
    return this.c.create<DataverseLead>(this.table, {
      ...data,
      leadsourcecode: 8, // 8 = Web (closest match for Shopify)
    } as unknown as Record<string, unknown>);
  }
}

// ---------- Composite ----------

export class SystemTableRepositories {
  accounts = new AccountRepository();
  contacts = new ContactRepository();
  leads = new LeadRepository();
}

export const systemTables = new SystemTableRepositories();
