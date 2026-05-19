// Smoke tests — one real call per service.
// Each test uses it.skipIf to skip when the env flag is off or creds are missing.
// These NEVER fail the CI suite when run without real credentials.
import { it, describe, expect } from "vitest";
import { config } from "../config.js";
import { m365 } from "./m365/index.js";
import { shopify } from "./shopify/index.js";
import { meta } from "./meta/index.js";
import { stripe } from "./stripe/index.js";
import { emailProviders } from "./email/index.js";

const graphReady = config.GRAPH_ENABLED && !!config.GRAPH_ACCESS_TOKEN;
const shopifyReady =
  config.SHOPIFY_ENABLED && !!config.SHOPIFY_STORE_DOMAIN && !!config.SHOPIFY_ADMIN_TOKEN;
const metaReady = config.META_ENABLED && !!config.META_ACCESS_TOKEN;
const stripeReady = config.STRIPE_ENABLED && !!config.STRIPE_SECRET_KEY;
const emailReady = config.EMAIL_ENABLED && !!config.EMAIL_API_KEY;

describe("integration smoke tests (skip if creds absent)", () => {
  it.skipIf(!graphReady)("m365 status is ok", async () => {
    const result = await m365.status();
    expect(result.ok).toBe(true);
  });

  it.skipIf(!graphReady)("m365 listInbox returns value array", async () => {
    const result = await m365.outlook.listInbox(1);
    expect(Array.isArray(result.value)).toBe(true);
  });

  it.skipIf(!shopifyReady)("shopify status is ok", async () => {
    const result = await shopify.status();
    expect(result.ok).toBe(true);
  });

  it.skipIf(!shopifyReady)("shopify listProducts returns products array", async () => {
    const result = await shopify.admin.listProducts();
    expect(Array.isArray(result.products)).toBe(true);
  });

  it.skipIf(!metaReady)("meta status is ok", async () => {
    const result = await meta.status();
    expect(result.ok).toBe(true);
  });

  it.skipIf(!stripeReady)("stripe status is ok", async () => {
    const result = await stripe.status();
    expect(result.ok).toBe(true);
  });

  it.skipIf(!emailReady)("active email provider status is ok", async () => {
    const provider = emailProviders[config.EMAIL_PROVIDER];
    const result = await provider.status();
    expect(result.ok).toBe(true);
  });
});
