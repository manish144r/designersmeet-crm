import { describe, it, expect, beforeAll, afterAll } from "vitest";
import type { Server } from "http";
import { createApp } from "../app.js";
import { m365 } from "../../integrations/m365/index.js";
import { shopify } from "../../integrations/shopify/index.js";
import { meta } from "../../integrations/meta/index.js";
import { stripe } from "../../integrations/stripe/index.js";
import { resolveProvider } from "../../integrations/email/index.js";

let server: Server;
let base: string;
const j = async (r: Response): Promise<any> => (await r.json()) as any;

beforeAll(async () => {
  const app = createApp();
  await new Promise<void>((resolve) => {
    server = app.listen(0, () => {
      const addr = server.address();
      const port = typeof addr === "object" && addr ? addr.port : 0;
      base = `http://127.0.0.1:${port}`;
      resolve();
    });
  });
});

afterAll(() => {
  server?.close();
});

describe("CRM API (dev auth bypass)", () => {
  it("health probe is ok", async () => {
    const r = await fetch(`${base}/health`);
    expect(r.status).toBe(200);
    expect((await j(r)).status).toBe("ok");
  });

  it("lists seeded contacts with pagination envelope", async () => {
    const r = await fetch(`${base}/api/contacts`);
    expect(r.status).toBe(200);
    const body = await j(r);
    expect(body.data.total).toBeGreaterThan(0);
    expect(Array.isArray(body.data.data)).toBe(true);
  });

  it("creates then fetches a vendor", async () => {
    const create = await fetch(`${base}/api/vendors`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Test Co", email: "t@test.co" }),
    });
    expect(create.status).toBe(201);
    const { data } = await j(create);
    const got = await fetch(`${base}/api/vendors/${data.id}`);
    expect(got.status).toBe(200);
  });

  it("rejects an invalid vendor payload (zod 400)", async () => {
    const r = await fetch(`${base}/api/vendors`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "no email" }),
    });
    expect(r.status).toBe(400);
  });

  it("returns aggregated integration statuses", async () => {
    const r = await fetch(`${base}/api/integrations`);
    const { data } = await j(r);
    expect(data.m365.ok).toBe(true);
    expect(Array.isArray(data.email)).toBe(true);
  });
});

describe("integration adapters — happy path", () => {
  it("m365 sends stub mail + status ok", async () => {
    expect((await m365.outlook.sendMail("a@b.c", "hi", "<p>x</p>")).sent).toBe(true);
    expect((await m365.status()).ok).toBe(true);
  });
  it("shopify lists products + status ok", async () => {
    expect((await shopify.admin.listProducts()).products).toEqual([]);
    expect((await shopify.status()).ok).toBe(true);
  });
  it("meta publishes IG stub + status ok", async () => {
    expect((await meta.instagram.publish("ig", "u", "c")).mediaId).toMatch(/^ig-m-/);
    expect((await meta.status()).ok).toBe(true);
  });
  it("stripe payment intent stub + status ok", async () => {
    expect((await stripe.createPaymentIntent(1000)).id).toMatch(/^pi_stub_/);
    expect((await stripe.status()).ok).toBe(true);
  });
  it("email provider resolves by traffic class", async () => {
    expect(resolveProvider("system_transactional").kind).toBe("resend");
    expect(resolveProvider("human_outbound").kind).toBe("msgraph");
  });
});
