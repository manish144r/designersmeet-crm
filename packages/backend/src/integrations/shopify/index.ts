// Shopify adapter (brief §8.4): Admin GraphQL + Storefront + Marketing Activities.
// When SHOPIFY_ENABLED=true + SHOPIFY_STORE_DOMAIN + SHOPIFY_ADMIN_TOKEN, uses real API.
// Disabled path returns existing stub shapes so crm.test.ts stays green.
import { config } from "../../config.js";

const API_VERSION = "2024-10";

async function adminGraphQL(query: string, variables: Record<string, unknown> = {}): Promise<unknown> {
  const domain = config.SHOPIFY_STORE_DOMAIN;
  const token = config.SHOPIFY_ADMIN_TOKEN;
  if (!domain || !token) throw new Error("SHOPIFY_STORE_DOMAIN or SHOPIFY_ADMIN_TOKEN not set");
  const url = `https://${domain}/admin/api/${API_VERSION}/graphql.json`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": token,
    },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Shopify Admin GraphQL → ${res.status}: ${text}`);
  }
  const json = (await res.json()) as { data?: unknown; errors?: unknown[] };
  if (json.errors && json.errors.length > 0) {
    throw new Error(`Shopify GraphQL errors: ${JSON.stringify(json.errors)}`);
  }
  return json.data;
}

async function storefrontFetch(path: string): Promise<Response> {
  const domain = config.SHOPIFY_STORE_DOMAIN;
  if (!domain) throw new Error("SHOPIFY_STORE_DOMAIN not set");
  const url = `https://${domain}${path}`;
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Shopify Storefront ${path} → ${res.status}: ${text}`);
  }
  return res;
}

export const shopify = {
  admin: {
    async listProducts() {
      if (!config.SHOPIFY_ENABLED || !config.SHOPIFY_STORE_DOMAIN || !config.SHOPIFY_ADMIN_TOKEN) {
        return { products: [] as unknown[] };
      }
      const data = (await adminGraphQL(`{
        products(first: 50) {
          edges { node { id title handle status } }
        }
      }`)) as { products: { edges: { node: unknown }[] } };
      return { products: data.products.edges.map((e) => e.node) };
    },

    async listOrders() {
      if (!config.SHOPIFY_ENABLED || !config.SHOPIFY_STORE_DOMAIN || !config.SHOPIFY_ADMIN_TOKEN) {
        return { orders: [] as unknown[] };
      }
      const data = (await adminGraphQL(`{
        orders(first: 50, sortKey: CREATED_AT, reverse: true) {
          edges { node { id name email createdAt financialStatus fulfillmentStatus } }
        }
      }`)) as { orders: { edges: { node: unknown }[] } };
      return { orders: data.orders.edges.map((e) => e.node) };
    },

    async listCustomers() {
      if (!config.SHOPIFY_ENABLED || !config.SHOPIFY_STORE_DOMAIN || !config.SHOPIFY_ADMIN_TOKEN) {
        return { customers: [] as unknown[] };
      }
      const data = (await adminGraphQL(`{
        customers(first: 50) {
          edges { node { id email firstName lastName phone } }
        }
      }`)) as { customers: { edges: { node: unknown }[] } };
      return { customers: data.customers.edges.map((e) => e.node) };
    },
  },

  storefront: {
    async getProduct(handle: string) {
      if (!config.SHOPIFY_ENABLED || !config.SHOPIFY_STORE_DOMAIN) {
        return { product: null };
      }
      const res = await storefrontFetch(`/products/${handle}.json`);
      const json = (await res.json()) as { product: unknown };
      return { product: json.product };
    },
  },

  marketing: {
    async reportActivity(activity: { title: string; channel: string }) {
      if (!config.SHOPIFY_ENABLED || !config.SHOPIFY_STORE_DOMAIN || !config.SHOPIFY_ADMIN_TOKEN) {
        return { id: `shopify-marketing-stub-${Date.now()}` };
      }
      const domain = config.SHOPIFY_STORE_DOMAIN;
      const token = config.SHOPIFY_ADMIN_TOKEN!;
      const url = `https://${domain}/admin/api/${API_VERSION}/marketing_events.json`;
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": token,
        },
        body: JSON.stringify({
          marketing_event: {
            event_type: "ad",
            marketing_channel: activity.channel,
            description: activity.title,
            started_at: new Date().toISOString(),
          },
        }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Shopify marketing_events → ${res.status}: ${text}`);
      }
      const json = (await res.json()) as { marketing_event?: { id: number } };
      return { id: String(json.marketing_event?.id ?? `shopify-marketing-${Date.now()}`) };
    },
  },

  async status() {
    if (!config.SHOPIFY_ENABLED || !config.SHOPIFY_STORE_DOMAIN || !config.SHOPIFY_ADMIN_TOKEN) {
      return { ok: true, detail: "stub adapter — SHOPIFY_ENABLED=false" };
    }
    try {
      const data = (await adminGraphQL(`{ shop { name myshopifyDomain } }`)) as {
        shop: { name: string };
      };
      return { ok: true, detail: `Shopify shop: ${data.shop.name}` };
    } catch (err) {
      return { ok: false, detail: String(err) };
    }
  },
};
