// Shopify adapter (brief §8.4): Admin GraphQL + Storefront + Marketing
// Activities (report-back). Stub — Aider wires the 2026-04 GraphQL endpoint.
export const shopify = {
  admin: {
    async listProducts() {
      return { products: [] as unknown[] };
    },
    async listOrders() {
      return { orders: [] as unknown[] };
    },
  },
  storefront: {
    async getProduct(_handle: string) {
      return { product: null };
    },
  },
  marketing: {
    async reportActivity(_activity: { title: string; channel: string }) {
      return { id: `shopify-marketing-stub-${Date.now()}` };
    },
  },
  async status() {
    return { ok: true, detail: "stub adapter — Admin GraphQL 2026-04 wired by Aider" };
  },
};
