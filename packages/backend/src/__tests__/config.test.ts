import { describe, it, expect } from "vitest";

describe("config production validation", () => {
  it("should export config object with expected defaults", async () => {
    // Dynamic import so test env vars don't clash
    const { config } = await import("../config.js");
    expect(config.NODE_ENV).toBeDefined();
    expect(config.BACKEND_PORT).toBe(4000);
    expect(config.DATA_PROVIDER).toBe("memory");
    expect(config.QUEUE_PROVIDER).toBe("memory");
    expect(config.AUTH_MODE).toBe("dev");
  });

  it("should have valid CORS_ORIGIN default", async () => {
    const { config } = await import("../config.js");
    expect(config.CORS_ORIGIN).toBeTruthy();
    expect(typeof config.CORS_ORIGIN).toBe("string");
  });

  it("should default to development environment", async () => {
    const { config } = await import("../config.js");
    // In test env, NODE_ENV should be 'test' or 'development'
    expect(["development", "test"]).toContain(config.NODE_ENV);
  });
});
