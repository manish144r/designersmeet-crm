import { describe, it, expect, vi } from "vitest";
import { HttpError } from "../middleware/errorHandler.js";

describe("HttpError", () => {
  it("creates error with status and message", () => {
    const err = new HttpError(404, "Not found");
    expect(err.status).toBe(404);
    expect(err.message).toBe("Not found");
    expect(err).toBeInstanceOf(Error);
  });

  it("creates error with details", () => {
    const err = new HttpError(400, "Validation failed", { field: "email" });
    expect(err.status).toBe(400);
    expect(err.details).toEqual({ field: "email" });
  });
});

describe("asyncHandler", () => {
  it("should be importable", async () => {
    const mod = await import("../middleware/asyncHandler.js");
    expect(mod.asyncHandler).toBeDefined();
    expect(typeof mod.asyncHandler).toBe("function");
  });
});
