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

describe("CRUD router — full lifecycle + envelope", () => {
  it("paginates, filters and sorts the list", async () => {
    const r = await fetch(`${base}/api/vendors?page=1&pageSize=2&sort=name&order=asc`);
    expect(r.status).toBe(200);
    const { data } = await j(r);
    expect(data.page).toBe(1);
    expect(data.pageSize).toBe(2);
    expect(data.data.length).toBeLessThanOrEqual(2);
    const f = await fetch(`${base}/api/vendors?name=Northwood`);
    const fb = await j(f);
    expect(fb.data.data.every((v: { name: string }) => /northwood/i.test(v.name))).toBe(true);
  });

  it("updates (PATCH) then deletes a row, 404 after", async () => {
    const c = await fetch(`${base}/api/clients`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Temp Client", email: "temp@c.co" }),
    });
    const { data } = await j(c);
    const u = await fetch(`${base}/api/clients/${data.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ company: "Renamed Pvt Ltd" }),
    });
    expect(u.status).toBe(200);
    expect((await j(u)).data.company).toBe("Renamed Pvt Ltd");
    const del = await fetch(`${base}/api/clients/${data.id}`, { method: "DELETE" });
    expect(del.status).toBe(204);
    const gone = await fetch(`${base}/api/clients/${data.id}`);
    expect(gone.status).toBe(404);
  });

  it("returns the {error,code,details} envelope on validation failure", async () => {
    const r = await fetch(`${base}/api/vendors`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "x" }),
    });
    expect(r.status).toBe(400);
    const b = await j(r);
    expect(b.code).toBe("VALIDATION_ERROR");
    expect(b.error).toBe("ValidationError");
    expect(Array.isArray(b.details)).toBe(true);
  });

  it("404 on missing single resource has HTTP_404 code", async () => {
    const r = await fetch(`${base}/api/vendors/does-not-exist`);
    expect(r.status).toBe(404);
    expect((await j(r)).code).toBe("HTTP_404");
  });
});

describe("health / readiness / metrics", () => {
  it("healthz + readyz respond", async () => {
    expect((await fetch(`${base}/healthz`)).status).toBe(200);
    const ready = await fetch(`${base}/readyz`);
    expect(ready.status).toBe(200);
    expect((await j(ready)).status).toBe("ready");
  });
  it("metrics exposes prometheus counters", async () => {
    const r = await fetch(`${base}/metrics`);
    expect(r.status).toBe(200);
    const t = await r.text();
    expect(t).toContain("dm_http_requests_total");
    expect(t).toContain("dm_uptime_seconds");
  });
});

describe("domain endpoints", () => {
  it("moves a project to a new stage", async () => {
    const list = await j(await fetch(`${base}/api/projects`));
    const id = list.data.data[0].id;
    const r = await fetch(`${base}/api/domain/projects/${id}/stage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "install" }),
    });
    expect(r.status).toBe(200);
    expect((await j(r)).data.status).toBe("install");
  });

  it("rejects an invalid stage value", async () => {
    const list = await j(await fetch(`${base}/api/projects`));
    const id = list.data.data[0].id;
    const r = await fetch(`${base}/api/domain/projects/${id}/stage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "not-a-stage" }),
    });
    expect(r.status).toBe(400);
  });

  it("books a calendar slot", async () => {
    const r = await fetch(`${base}/api/domain/calendar/book`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "Discovery call",
        start_at: "2027-01-01T10:00:00Z",
        end_at: "2027-01-01T10:30:00Z",
      }),
    });
    expect(r.status).toBe(201);
    expect((await j(r)).data.status).toBe("confirmed");
  });

  it("ingests a public form submission and upserts a contact", async () => {
    const r = await fetch(`${base}/api/domain/forms/vendor-onboarding/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        payload: { "Business name": "Banjara Woodworks" },
        contact: { first_name: "Kiran", primary_email: "kiran@banjara.co" },
      }),
    });
    expect(r.status).toBe(201);
    expect((await j(r)).data.form_id).toBeTruthy();
  });

  it("merges two conversation threads", async () => {
    const a = await j(
      await fetch(`${base}/api/conversations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contact_id: "ct1", subject: "Target" }),
      }),
    );
    const b = await j(
      await fetch(`${base}/api/conversations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contact_id: "ct1", subject: "Source" }),
      }),
    );
    const r = await fetch(`${base}/api/domain/conversations/merge`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sourceId: b.data.id, targetId: a.data.id }),
    });
    expect(r.status).toBe(200);
    const gone = await fetch(`${base}/api/conversations/${b.data.id}`);
    expect(gone.status).toBe(404);
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
