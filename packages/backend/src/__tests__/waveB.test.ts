// Wave B (2026-05-20) — endpoint contract tests for the 5 new resources.
// Spins up the real Express app on a random port and hits it via global fetch
// (Node 20+). Hits routing + middleware + Zod + the override router.
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import type { Server } from "node:http";
import { createApp } from "../crm/app.js";

let server: Server;
let base: string;

beforeAll(async () => {
  const app = createApp();
  await new Promise<void>((resolve) => {
    server = app.listen(0, () => resolve());
  });
  const addr = server.address();
  const port = typeof addr === "object" && addr ? addr.port : 0;
  base = `http://127.0.0.1:${port}`;
});

afterAll(async () => {
  await new Promise<void>((resolve, reject) =>
    server.close((err) => (err ? reject(err) : resolve())),
  );
});

interface JsonRow {
  id: string;
  [k: string]: unknown;
}
interface ListResponse {
  data: { data: JsonRow[]; page: number; pageSize: number; total: number };
}
interface CreateResponse {
  data: JsonRow;
  plaintext_once?: string;
  signing_secret_once?: string;
  warning?: string;
}
interface TestSendResponse {
  data: { to: string; from: string; sent: boolean; message: string };
}
interface ErrorResponse {
  error?: string;
  message?: string;
  env_required?: string[];
}

async function jpost(path: string, body: unknown): Promise<Response> {
  return fetch(`${base}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}
async function jdel(path: string): Promise<Response> {
  return fetch(`${base}${path}`, { method: "DELETE" });
}
async function jget(path: string): Promise<Response> {
  return fetch(`${base}${path}`);
}
async function jpatch(path: string, body: unknown): Promise<Response> {
  return fetch(`${base}${path}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}
async function asList(res: Response): Promise<ListResponse> {
  return (await res.json()) as ListResponse;
}
async function asCreate(res: Response): Promise<CreateResponse> {
  return (await res.json()) as CreateResponse;
}
async function asTestSend(res: Response): Promise<TestSendResponse> {
  return (await res.json()) as TestSendResponse;
}
async function asError(res: Response): Promise<ErrorResponse> {
  return (await res.json()) as ErrorResponse;
}

describe("Wave B — api-keys", () => {
  it("POST mints a key, returns plaintext_once, never echoes hash", async () => {
    const res = await jpost("/api/api-keys", { name: "test key", scope: "write" });
    expect(res.status).toBe(201);
    const body = await asCreate(res);
    expect(body.data.name).toBe("test key");
    expect(body.data.hashed_key).toBe("***");
    expect(body.plaintext_once).toMatch(/^dm_live_/);
    expect(body.warning).toContain("not be shown again");

    const list = await asList(await jget("/api/api-keys"));
    const row = list.data.data.find((r) => r.id === body.data.id);
    expect(row?.hashed_key).toBe("***");
  });

  it("POST rejects missing name", async () => {
    const res = await jpost("/api/api-keys", {});
    expect(res.status).toBe(400);
  });

  it("DELETE marks revoked_at rather than removing the row", async () => {
    const create = await asCreate(await jpost("/api/api-keys", { name: "revoke-me", scope: "read" }));
    const id = create.data.id;
    const del = await jdel(`/api/api-keys/${id}`);
    expect(del.status).toBe(204);
    const list = await asList(await jget("/api/api-keys"));
    const row = list.data.data.find((r) => r.id === id);
    expect(row).toBeDefined();
    expect(row?.revoked_at).toBeTruthy();
  });
});

describe("Wave B — sessions", () => {
  it("GET defaults to active sessions (filters revoked)", async () => {
    const before = await asList(await jget("/api/sessions"));
    expect(before.data.data.length).toBeGreaterThan(0);

    const target = before.data.data[0].id;
    const del = await jdel(`/api/sessions/${target}`);
    expect(del.status).toBe(204);

    const after = await asList(await jget("/api/sessions"));
    const stillThere = after.data.data.find((r) => r.id === target);
    expect(stillThere).toBeUndefined();

    const withRevoked = await asList(await jget("/api/sessions?include_revoked=true"));
    const revoked = withRevoked.data.data.find((r) => r.id === target);
    expect(revoked?.revoked_at).toBeTruthy();
  });
});

describe("Wave B — sso-providers", () => {
  it("GET lists seeded providers", async () => {
    const list = await asList(await jget("/api/sso-providers"));
    expect(list.data.data.length).toBeGreaterThanOrEqual(3);
  });

  it("callback returns 501 with env_required when unconfigured", async () => {
    const res = await jget("/api/sso/entra/callback?code=fake");
    expect(res.status).toBe(501);
    const body = await asError(res);
    expect(body.error).toBe("provider_not_configured");
    expect(body.env_required).toContain("ENTRA_CLIENT_ID");
  });

  it("PATCH toggles enabled flag", async () => {
    const list = await asList(await jget("/api/sso-providers"));
    const row = list.data.data[0];
    const upd = (await (await jpatch(`/api/sso-providers/${row.id}`, { enabled: true })).json()) as {
      data: { enabled: boolean };
    };
    expect(upd.data.enabled).toBe(true);
  });
});

describe("Wave B — email-providers", () => {
  it("POST /:id/test simulates a send with feedback", async () => {
    const list = await asList(await jget("/api/email-providers"));
    const row = list.data.data[0];
    const res = await jpost(`/api/email-providers/${row.id}/test`, { to: "hello@example.com" });
    expect(res.status).toBe(200);
    const body = await asTestSend(res);
    expect(body.data.to).toBe("hello@example.com");
    expect(body.data.sent).toBe(false); // demo seed has api_key_set=false
    expect(body.data.message).toContain("api_key_set");
  });

  it("POST /:id/test rejects missing recipient", async () => {
    const list = await asList(await jget("/api/email-providers"));
    const row = list.data.data[0];
    const res = await jpost(`/api/email-providers/${row.id}/test`, {});
    expect(res.status).toBe(400);
  });
});

describe("Wave B — webhook-subscriptions", () => {
  it("POST generates signing_secret, echoes plaintext once", async () => {
    const res = await jpost("/api/webhook-subscriptions", {
      url: "https://hooks.test.com/dm",
      events: ["order.created"],
      enabled: true,
    });
    expect(res.status).toBe(201);
    const body = await asCreate(res);
    expect(body.signing_secret_once).toMatch(/^whsec_/);
    expect(body.data.signing_secret).toBe("***");

    const list = await asList(await jget("/api/webhook-subscriptions"));
    const row = list.data.data.find((r) => r.id === body.data.id);
    expect(row?.signing_secret).toBe("***");
  });

  it("POST rejects invalid URL", async () => {
    const res = await jpost("/api/webhook-subscriptions", { url: "not a url", events: [] });
    expect(res.status).toBe(400);
  });
});
