import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

function mockFetch(body: unknown, status = 200) {
  const r = new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
  return vi.fn().mockResolvedValue(r);
}

// ─── disabled path ────────────────────────────────────────────────────────────

describe("stripe adapter — disabled path (STRIPE_ENABLED=false)", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv("STRIPE_ENABLED", "false");
    vi.stubEnv("STRIPE_SECRET_KEY", "");
  });
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("createPaymentIntent returns stub shape matching /^pi_stub_/", async () => {
    const { stripe } = await import("../stripe/index.js");
    const result = await stripe.createPaymentIntent(1000);
    expect(result.id).toMatch(/^pi_stub_/);
    expect(result.status).toBe("requires_payment_method");
  });

  it("createCustomer returns stub shape", async () => {
    const { stripe } = await import("../stripe/index.js");
    const result = await stripe.createCustomer("bob@example.com");
    expect(result.id).toMatch(/^cus_stub_/);
    expect(result.email).toBe("bob@example.com");
  });

  it("createSubscription returns stub shape", async () => {
    const { stripe } = await import("../stripe/index.js");
    const result = await stripe.createSubscription("cus_abc", "price_xyz");
    expect(result.id).toMatch(/^sub_stub_/);
    expect(result.status).toBe("active");
  });

  it("status returns { ok: true }", async () => {
    const { stripe } = await import("../stripe/index.js");
    expect((await stripe.status()).ok).toBe(true);
  });
});

// ─── enabled path ─────────────────────────────────────────────────────────────

describe("stripe adapter — enabled path (fetch mocked)", () => {
  let fetchSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv("STRIPE_ENABLED", "true");
    vi.stubEnv("STRIPE_SECRET_KEY", "sk_test_abc123");
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("createPaymentIntent: POST /v1/payment_intents, form-encoded, Bearer auth", async () => {
    fetchSpy = mockFetch({ id: "pi_real_abc123", status: "requires_payment_method" });
    vi.stubGlobal("fetch", fetchSpy);
    const { stripe } = await import("../stripe/index.js");
    const result = await stripe.createPaymentIntent(2000, "usd");
    expect(result.id).toBe("pi_real_abc123");
    const [url, opts] = fetchSpy.mock.calls[0] as [string, RequestInit & { headers: Record<string, string> }];
    expect(url).toBe("https://api.stripe.com/v1/payment_intents");
    expect(opts.method).toBe("POST");
    const authHeader = (opts.headers as Record<string, string>)["Authorization"];
    expect(authHeader).toBe("Bearer sk_test_abc123");
    const contentType = (opts.headers as Record<string, string>)["Content-Type"];
    expect(contentType).toBe("application/x-www-form-urlencoded");
    const bodyStr = opts.body as string;
    expect(bodyStr).toContain("amount=2000");
    expect(bodyStr).toContain("currency=usd");
  });

  it("createCustomer: POST /v1/customers with email and name", async () => {
    fetchSpy = mockFetch({ id: "cus_real_xyz", email: "alice@example.com" });
    vi.stubGlobal("fetch", fetchSpy);
    const { stripe } = await import("../stripe/index.js");
    const result = await stripe.createCustomer("alice@example.com", "Alice");
    expect(result.id).toBe("cus_real_xyz");
    const [url, opts] = fetchSpy.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://api.stripe.com/v1/customers");
    const body = opts.body as string;
    expect(body).toContain("email=alice%40example.com");
    expect(body).toContain("name=Alice");
  });

  it("createSubscription: POST /v1/subscriptions with customer and price", async () => {
    fetchSpy = mockFetch({ id: "sub_real_123", status: "active" });
    vi.stubGlobal("fetch", fetchSpy);
    const { stripe } = await import("../stripe/index.js");
    const result = await stripe.createSubscription("cus_real_xyz", "price_monthly");
    expect(result.id).toBe("sub_real_123");
    const [url, opts] = fetchSpy.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://api.stripe.com/v1/subscriptions");
    const body = opts.body as string;
    expect(body).toContain("customer=cus_real_xyz");
    expect(body).toContain("price_monthly");
  });

  it("status: GET /v1/account, returns ok=true with id", async () => {
    fetchSpy = mockFetch({ id: "acct_real_001", charges_enabled: true });
    vi.stubGlobal("fetch", fetchSpy);
    const { stripe } = await import("../stripe/index.js");
    const result = await stripe.status();
    expect(result.ok).toBe(true);
    expect(result.detail).toContain("acct_real_001");
  });

  it("status: returns ok=false on network error", async () => {
    fetchSpy = vi.fn().mockRejectedValue(new Error("socket hang up"));
    vi.stubGlobal("fetch", fetchSpy);
    const { stripe } = await import("../stripe/index.js");
    const result = await stripe.status();
    expect(result.ok).toBe(false);
    expect(result.detail).toContain("socket hang up");
  });

  it("createPaymentIntent: throws on 402 error", async () => {
    fetchSpy = mockFetch({ error: { message: "Your card was declined" } }, 402);
    vi.stubGlobal("fetch", fetchSpy);
    const { stripe } = await import("../stripe/index.js");
    await expect(stripe.createPaymentIntent(500)).rejects.toThrow("402");
  });
});
