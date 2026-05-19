import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

function mockFetch(body: unknown, status = 200) {
  const r = new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
  return vi.fn().mockResolvedValue(r);
}

// ─── disabled path ────────────────────────────────────────────────────────────

describe("shopify adapter — disabled path (SHOPIFY_ENABLED=false)", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv("SHOPIFY_ENABLED", "false");
    vi.stubEnv("SHOPIFY_STORE_DOMAIN", "");
    vi.stubEnv("SHOPIFY_ADMIN_TOKEN", "");
  });
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("listProducts returns { products: [] }", async () => {
    const { shopify } = await import("../shopify/index.js");
    expect(await shopify.admin.listProducts()).toEqual({ products: [] });
  });

  it("listOrders returns { orders: [] }", async () => {
    const { shopify } = await import("../shopify/index.js");
    expect(await shopify.admin.listOrders()).toEqual({ orders: [] });
  });

  it("listCustomers returns { customers: [] }", async () => {
    const { shopify } = await import("../shopify/index.js");
    expect(await shopify.admin.listCustomers()).toEqual({ customers: [] });
  });

  it("storefront.getProduct returns { product: null }", async () => {
    const { shopify } = await import("../shopify/index.js");
    expect(await shopify.storefront.getProduct("my-product")).toEqual({ product: null });
  });

  it("marketing.reportActivity returns stub id", async () => {
    const { shopify } = await import("../shopify/index.js");
    const r = await shopify.marketing.reportActivity({ title: "Summer campaign", channel: "social" });
    expect(r.id).toMatch(/^shopify-marketing-stub-/);
  });

  it("status returns { ok: true }", async () => {
    const { shopify } = await import("../shopify/index.js");
    expect((await shopify.status()).ok).toBe(true);
  });
});

// ─── enabled path ─────────────────────────────────────────────────────────────

describe("shopify adapter — enabled path (fetch mocked)", () => {
  let fetchSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv("SHOPIFY_ENABLED", "true");
    vi.stubEnv("SHOPIFY_STORE_DOMAIN", "test-shop.myshopify.com");
    vi.stubEnv("SHOPIFY_ADMIN_TOKEN", "shpat_test123");
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("listProducts: POST to Admin GraphQL, X-Shopify-Access-Token header set", async () => {
    fetchSpy = mockFetch({ data: { products: { edges: [{ node: { id: "gid://shopify/Product/1", title: "T-Shirt" } }] } } });
    vi.stubGlobal("fetch", fetchSpy);
    const { shopify } = await import("../shopify/index.js");
    const result = await shopify.admin.listProducts();
    expect(result.products).toHaveLength(1);
    const [url, opts] = fetchSpy.mock.calls[0] as [string, RequestInit & { headers: Record<string, string> }];
    expect(url).toContain("test-shop.myshopify.com");
    expect(url).toContain("2024-10/graphql.json");
    expect((opts.headers as Record<string, string>)["X-Shopify-Access-Token"]).toBe("shpat_test123");
    expect(opts.method).toBe("POST");
  });

  it("listCustomers: returns mapped nodes", async () => {
    fetchSpy = mockFetch({
      data: {
        customers: {
          edges: [
            { node: { id: "gid://shopify/Customer/1", email: "bob@shop.com" } },
            { node: { id: "gid://shopify/Customer/2", email: "alice@shop.com" } },
          ],
        },
      },
    });
    vi.stubGlobal("fetch", fetchSpy);
    const { shopify } = await import("../shopify/index.js");
    const result = await shopify.admin.listCustomers();
    expect(result.customers).toHaveLength(2);
  });

  it("status: queries shop name, returns ok=true", async () => {
    fetchSpy = mockFetch({ data: { shop: { name: "Test Shop", myshopifyDomain: "test-shop.myshopify.com" } } });
    vi.stubGlobal("fetch", fetchSpy);
    const { shopify } = await import("../shopify/index.js");
    const status = await shopify.status();
    expect(status.ok).toBe(true);
    expect(status.detail).toContain("Test Shop");
  });

  it("status: returns ok=false on error", async () => {
    fetchSpy = vi.fn().mockRejectedValue(new Error("DNS lookup failed"));
    vi.stubGlobal("fetch", fetchSpy);
    const { shopify } = await import("../shopify/index.js");
    const status = await shopify.status();
    expect(status.ok).toBe(false);
    expect(status.detail).toContain("DNS lookup failed");
  });

  it("listProducts: throws on GraphQL errors array", async () => {
    fetchSpy = mockFetch({ data: null, errors: [{ message: "Access denied" }] });
    vi.stubGlobal("fetch", fetchSpy);
    const { shopify } = await import("../shopify/index.js");
    await expect(shopify.admin.listProducts()).rejects.toThrow("GraphQL errors");
  });
});
