// Stripe stub (brief — future / Wave 5). Present so the integration grid and
// settings page have a slot; no live keys, no charges.
export const stripe = {
  async createPaymentIntent(_amountCents: number, _currency = "aud") {
    return { id: `pi_stub_${Date.now()}`, status: "requires_payment_method" };
  },
  async status() {
    return { ok: true, detail: "stub adapter — payment flows deferred to Wave 5" };
  },
};
