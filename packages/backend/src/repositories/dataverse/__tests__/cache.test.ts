import { describe, it, expect, vi, beforeEach } from "vitest";
import { withCache, invalidate, cacheStats } from "../cache.js";

describe("withCache", () => {
  beforeEach(() => {
    invalidate("test_ns");
  });

  it("returns fetched value on first call", async () => {
    const fetcher = vi.fn().mockResolvedValue("fresh-value");
    const result = await withCache("test_ns", "key1", 1000, fetcher);
    expect(result).toBe("fresh-value");
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it("returns cached value within TTL", async () => {
    const fetcher = vi.fn().mockResolvedValue("v1").mockResolvedValueOnce("v1");
    const r1 = await withCache("test_ns", "key1", 1000, fetcher);
    const r2 = await withCache("test_ns", "key1", 1000, fetcher);
    expect(r1).toBe("v1");
    expect(r2).toBe("v1");
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it("re-fetches after TTL expiry", async () => {
    const fetcher = vi.fn().mockResolvedValueOnce("v1").mockResolvedValueOnce("v2");
    const r1 = await withCache("test_ns", "key1", 10, fetcher);
    await new Promise((res) => setTimeout(res, 20));
    const r2 = await withCache("test_ns", "key1", 10, fetcher);
    expect(r1).toBe("v1");
    expect(r2).toBe("v2");
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it("invalidate clears the namespace", async () => {
    const fetcher = vi.fn().mockResolvedValueOnce("v1").mockResolvedValueOnce("v2");
    await withCache("test_ns", "key1", 60_000, fetcher);
    invalidate("test_ns");
    const r2 = await withCache("test_ns", "key1", 60_000, fetcher);
    expect(r2).toBe("v2");
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it("different keys are isolated within namespace", async () => {
    const fetcher = vi.fn().mockImplementation((seed: string) => Promise.resolve(`v-${seed}`));
    const r1 = await withCache("test_ns", "k1", 1000, () => fetcher("a"));
    const r2 = await withCache("test_ns", "k2", 1000, () => fetcher("b"));
    expect(r1).toBe("v-a");
    expect(r2).toBe("v-b");
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it("cacheStats reports namespaces", async () => {
    await withCache("test_ns", "k1", 1000, () => Promise.resolve(1));
    const stats = cacheStats();
    expect(stats.test_ns).toBeDefined();
    expect(stats.test_ns.size).toBeGreaterThan(0);
  });
});
