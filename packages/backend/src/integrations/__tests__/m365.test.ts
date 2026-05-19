import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// ─── helpers ──────────────────────────────────────────────────────────────────

function mockFetch(body: unknown, status = 200) {
  const r = new Response(
    status === 204 || body === null ? null : JSON.stringify(body),
    { status, headers: { "Content-Type": "application/json" } },
  );
  return vi.fn().mockResolvedValue(r);
}

// ─── disabled path ────────────────────────────────────────────────────────────

describe("m365 adapter — disabled path (GRAPH_ENABLED=false)", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv("GRAPH_ENABLED", "false");
    vi.stubEnv("GRAPH_ACCESS_TOKEN", "");
  });
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("sendMail returns stub shape (sent=true)", async () => {
    const { m365 } = await import("../m365/index.js");
    const result = await m365.outlook.sendMail("a@b.com", "Hi", "<p>body</p>");
    expect(result.sent).toBe(true);
    expect(result.id).toMatch(/^graph-mail-stub-/);
  });

  it("listInbox returns { value: [] }", async () => {
    const { m365 } = await import("../m365/index.js");
    const result = await m365.outlook.listInbox();
    expect(result).toEqual({ value: [] });
  });

  it("calendar.listEvents returns { value: [] }", async () => {
    const { m365 } = await import("../m365/index.js");
    const result = await m365.calendar.listEvents("2026-01-01T00:00Z", "2026-01-31T23:59Z");
    expect(result).toEqual({ value: [] });
  });

  it("calendar.createEvent returns stub id", async () => {
    const { m365 } = await import("../m365/index.js");
    const result = await m365.calendar.createEvent("Meeting", "2026-01-01T10:00Z", "2026-01-01T11:00Z");
    expect(result.id).toMatch(/^graph-event-stub-/);
  });

  it("teams.postChannelMessage returns stub id", async () => {
    const { m365 } = await import("../m365/index.js");
    const result = await m365.teams.postChannelMessage("team1", "chan1", "hello");
    expect(result.id).toMatch(/^teams-msg-stub-/);
  });

  it("sharepoint.listDriveItems returns { value: [] }", async () => {
    const { m365 } = await import("../m365/index.js");
    const result = await m365.sharepoint.listDriveItems("drive1");
    expect(result).toEqual({ value: [] });
  });

  it("planner.createTask returns stub id", async () => {
    const { m365 } = await import("../m365/index.js");
    const result = await m365.planner.createTask("plan1", "Do thing");
    expect(result.id).toMatch(/^planner-task-stub-/);
  });

  it("status returns { ok: true }", async () => {
    const { m365 } = await import("../m365/index.js");
    const result = await m365.status();
    expect(result.ok).toBe(true);
  });
});

// ─── enabled path ─────────────────────────────────────────────────────────────

describe("m365 adapter — enabled path (fetch mocked)", () => {
  let fetchSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv("GRAPH_ENABLED", "true");
    vi.stubEnv("GRAPH_ACCESS_TOKEN", "test-token-abc");
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("sendMail: POST /me/sendMail with Bearer token, returns sent=true", async () => {
    fetchSpy = mockFetch({}, 202);
    vi.stubGlobal("fetch", fetchSpy);
    const { m365 } = await import("../m365/index.js");
    const result = await m365.outlook.sendMail("x@y.com", "Test", "<b>hello</b>");
    expect(result.sent).toBe(true);
    expect(fetchSpy).toHaveBeenCalledOnce();
    const [url, opts] = fetchSpy.mock.calls[0] as [string, RequestInit & { headers: Headers }];
    expect(url).toContain("/me/sendMail");
    expect(opts.method).toBe("POST");
    const authHeader = (opts.headers as Headers).get("Authorization");
    expect(authHeader).toBe("Bearer test-token-abc");
    const body = JSON.parse(opts.body as string);
    expect(body.message.subject).toBe("Test");
    expect(body.message.toRecipients[0].emailAddress.address).toBe("x@y.com");
  });

  it("listInbox: GET /me/messages with $top param", async () => {
    fetchSpy = mockFetch({ value: [{ id: "msg1" }] });
    vi.stubGlobal("fetch", fetchSpy);
    const { m365 } = await import("../m365/index.js");
    const result = await m365.outlook.listInbox(10);
    expect(result.value).toHaveLength(1);
    const [url] = fetchSpy.mock.calls[0] as [string];
    expect(url).toContain("/me/messages");
    expect(url).toContain("$top=10");
  });

  it("calendar.createEvent: POST /me/events, returns id", async () => {
    fetchSpy = mockFetch({ id: "event-real-id-123" }, 201);
    vi.stubGlobal("fetch", fetchSpy);
    const { m365 } = await import("../m365/index.js");
    const result = await m365.calendar.createEvent("Team Sync", "2026-03-01T09:00Z", "2026-03-01T10:00Z");
    expect(result.id).toBe("event-real-id-123");
    const [url, opts] = fetchSpy.mock.calls[0] as [string, RequestInit];
    expect(url).toContain("/me/events");
    expect(opts.method).toBe("POST");
  });

  it("planner.createTask: POST /planner/tasks, returns id", async () => {
    fetchSpy = mockFetch({ id: "task-real-456" }, 201);
    vi.stubGlobal("fetch", fetchSpy);
    const { m365 } = await import("../m365/index.js");
    const result = await m365.planner.createTask("plan-abc", "Write docs", "bucket-1");
    expect(result.id).toBe("task-real-456");
    const [url, opts] = fetchSpy.mock.calls[0] as [string, RequestInit];
    expect(url).toContain("/planner/tasks");
    const body = JSON.parse(opts.body as string);
    expect(body.planId).toBe("plan-abc");
    expect(body.bucketId).toBe("bucket-1");
  });

  it("status: GET /me?$select=id, returns ok=true", async () => {
    fetchSpy = mockFetch({ id: "user-id-999" });
    vi.stubGlobal("fetch", fetchSpy);
    const { m365 } = await import("../m365/index.js");
    const result = await m365.status();
    expect(result.ok).toBe(true);
    const [url] = fetchSpy.mock.calls[0] as [string];
    expect(url).toContain("/me");
  });

  it("status: returns ok=false when fetch rejects", async () => {
    fetchSpy = vi.fn().mockRejectedValue(new Error("Network timeout"));
    vi.stubGlobal("fetch", fetchSpy);
    const { m365 } = await import("../m365/index.js");
    const result = await m365.status();
    expect(result.ok).toBe(false);
    expect(result.detail).toContain("Network timeout");
  });

  it("sendMail: throws on non-ok response", async () => {
    fetchSpy = mockFetch({ error: { message: "Unauthorized" } }, 401);
    vi.stubGlobal("fetch", fetchSpy);
    const { m365 } = await import("../m365/index.js");
    await expect(m365.outlook.sendMail("a@b.com", "x", "<p/>")).rejects.toThrow("401");
  });
});
