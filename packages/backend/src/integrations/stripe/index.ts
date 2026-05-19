// Stripe adapter (brief — future / Wave 5).
// When STRIPE_ENABLED=true + STRIPE_SECRET_KEY, uses real Stripe REST (form-encoded).
// Disabled path returns existing stub shapes so crm.test.ts stays green.
import { config } from "../../config.js";

const BASE = "https://api.stripe.com/v1";

async function stripeFetch(
  path: string,
  params: Record<string, string | number> = {},
  method: "GET" | "POST" = "POST",
): Promise<Response> {
  const key = config.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY not set");
  const url = `${BASE}${path}`;
  const body = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    body.set(k, String(v));
  }
  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: method === "POST" ? body.toString() : undefined,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Stripe ${method} ${path} → ${res.status}: ${text}`);
  }
  return res;
}

export const stripe = {
  async createPaymentIntent(amountCents: number, currency = "aud") {
    if (!config.STRIPE_ENABLED || !config.STRIPE_SECRET_KEY) {
      return { id: `pi_stub_${Date.now()}`, status: "requires_payment_method" };
    }
    const res = await stripeFetch("/payment_intents", { amount: amountCents, currency });
    const data = (await res.json()) as { id: string; status: string };
    return { id: data.id, status: data.status };
  },

  async createCustomer(email: string, name?: string) {
    if (!config.STRIPE_ENABLED || !config.STRIPE_SECRET_KEY) {
      return { id: `cus_stub_${Date.now()}`, email };
    }
    const params: Record<string, string> = { email };
    if (name) params.name = name;
    const res = await stripeFetch("/customers", params);
    const data = (await res.json()) as { id: string; email: string };
    return { id: data.id, email: data.email };
  },

  async createSubscription(customerId: string, priceId: string) {
    if (!config.STRIPE_ENABLED || !config.STRIPE_SECRET_KEY) {
      return { id: `sub_stub_${Date.now()}`, status: "active" };
    }
    const res = await stripeFetch("/subscriptions", {
      customer: customerId,
      "items[0][price]": priceId,
    });
    const data = (await res.json()) as { id: string; status: string };
    return { id: data.id, status: data.status };
  },

  async status() {
    if (!config.STRIPE_ENABLED || !config.STRIPE_SECRET_KEY) {
      return { ok: true, detail: "stub adapter — STRIPE_ENABLED=false" };
    }
    try {
      const res = await stripeFetch("/account", {}, "GET");
      const data = (await res.json()) as { id?: string };
      return { ok: true, detail: `Stripe account: ${data.id ?? "connected"}` };
    } catch (err) {
      return { ok: false, detail: String(err) };
    }
  },
};
