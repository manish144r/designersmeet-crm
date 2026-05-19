import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

function mockFetch(body: unknown, status = 200) {
  const r = new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
  return vi.fn().mockResolvedValue(r);
}

// ─── disabled path ────────────────────────────────────────────────────────────

describe("meta adapter — disabled path (META_ENABLED=false)", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv("META_ENABLED", "false");
    vi.stubEnv("META_ACCESS_TOKEN", "");
  });
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("createPagePost returns stub id", async () => {
    const { meta } = await import("../meta/index.js");
    const r = await meta.facebook.createPagePost("page1", "Hello world");
    expect(r.id).toMatch(/^fb-post-stub-/);
  });

  it("pageInsights returns { data: [] }", async () => {
    const { meta } = await import("../meta/index.js");
    expect(await meta.facebook.pageInsights("page1", "page_impressions")).toEqual({ data: [] });
  });

  it("instagram.publish returns stub shape matching /^ig-m-/", async () => {
    const { meta } = await import("../meta/index.js");
    const r = await meta.instagram.publish("ig123", "https://img.url/pic.jpg", "A caption");
    expect(r.mediaId).toMatch(/^ig-m-/);
    expect(r.containerId).toMatch(/^ig-c-/);
  });

  it("status returns { ok: true }", async () => {
    const { meta } = await import("../meta/index.js");
    expect((await meta.status()).ok).toBe(true);
  });
});

// ─── enabled path ─────────────────────────────────────────────────────────────

describe("meta adapter — enabled path (fetch mocked)", () => {
  let fetchSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv("META_ENABLED", "true");
    vi.stubEnv("META_ACCESS_TOKEN", "EAAtest123");
    vi.stubEnv("META_PAGE_ID", "page-xyz");
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("createPagePost: POST /<pageId>/feed, includes access_token query param", async () => {
    fetchSpy = mockFetch({ id: "123456789_98765" }, 200);
    vi.stubGlobal("fetch", fetchSpy);
    const { meta } = await import("../meta/index.js");
    const result = await meta.facebook.createPagePost("mypage", "Hello!");
    expect(result.id).toBe("123456789_98765");
    const [url, opts] = fetchSpy.mock.calls[0] as [string, RequestInit];
    expect(url).toContain("graph.facebook.com");
    expect(url).toContain("/mypage/feed");
    expect(url).toContain("access_token=EAAtest123");
    expect(opts.method).toBe("POST");
  });

  it("instagram.publish: two-step — container create then media_publish", async () => {
    const containerRes = new Response(JSON.stringify({ id: "container-111" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
    const publishRes = new Response(JSON.stringify({ id: "media-real-222" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
    fetchSpy = vi.fn()
      .mockResolvedValueOnce(containerRes)
      .mockResolvedValueOnce(publishRes);
    vi.stubGlobal("fetch", fetchSpy);
    const { meta } = await import("../meta/index.js");
    const result = await meta.instagram.publish("ig_user_1", "https://cdn.example.com/photo.jpg", "My caption");
    expect(result.containerId).toBe("container-111");
    expect(result.mediaId).toBe("media-real-222");
    expect(fetchSpy).toHaveBeenCalledTimes(2);
    const [url1] = fetchSpy.mock.calls[0] as [string];
    const [url2] = fetchSpy.mock.calls[1] as [string];
    expect(url1).toContain("/ig_user_1/media");
    expect(url2).toContain("/ig_user_1/media_publish");
  });

  it("pageInsights: GET /<pageId>/insights with metric param", async () => {
    fetchSpy = mockFetch({ data: [{ name: "page_impressions", values: [] }] });
    vi.stubGlobal("fetch", fetchSpy);
    const { meta } = await import("../meta/index.js");
    const result = await meta.facebook.pageInsights("mypage", "page_impressions");
    expect(Array.isArray(result.data)).toBe(true);
    const [url] = fetchSpy.mock.calls[0] as [string];
    expect(url).toContain("/mypage/insights");
    expect(url).toContain("metric=page_impressions");
  });

  it("status: GET /me, returns ok=true with name", async () => {
    fetchSpy = mockFetch({ id: "user-123", name: "Test Page" });
    vi.stubGlobal("fetch", fetchSpy);
    const { meta } = await import("../meta/index.js");
    const result = await meta.status();
    expect(result.ok).toBe(true);
    expect(result.detail).toContain("Test Page");
  });

  it("status: returns ok=false when fetch throws", async () => {
    fetchSpy = vi.fn().mockRejectedValue(new Error("ECONNREFUSED"));
    vi.stubGlobal("fetch", fetchSpy);
    const { meta } = await import("../meta/index.js");
    const result = await meta.status();
    expect(result.ok).toBe(false);
  });

  it("createPagePost: throws on 400 error from Graph", async () => {
    fetchSpy = mockFetch({ error: { message: "Page not found" } }, 400);
    vi.stubGlobal("fetch", fetchSpy);
    const { meta } = await import("../meta/index.js");
    await expect(meta.facebook.createPagePost("bad-page", "msg")).rejects.toThrow("400");
  });
});
