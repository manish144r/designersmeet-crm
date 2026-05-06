import { describe, it, expect } from "vitest";

describe("pagination utility logic", () => {
  const paginate = (items: number[], limit: number, offset: number) => {
    const safeLimit = Math.min(Math.max(limit, 1), 200);
    const safeOffset = Math.max(offset, 0);
    return items.slice(safeOffset, safeOffset + safeLimit);
  };

  it("returns first page with default params", () => {
    const items = Array.from({ length: 100 }, (_, i) => i);
    const result = paginate(items, 50, 0);
    expect(result.length).toBe(50);
    expect(result[0]).toBe(0);
    expect(result[49]).toBe(49);
  });

  it("returns second page with offset", () => {
    const items = Array.from({ length: 100 }, (_, i) => i);
    const result = paginate(items, 50, 50);
    expect(result.length).toBe(50);
    expect(result[0]).toBe(50);
  });

  it("caps limit at 200", () => {
    const items = Array.from({ length: 500 }, (_, i) => i);
    const result = paginate(items, 999, 0);
    expect(result.length).toBe(200);
  });

  it("floors limit at 1", () => {
    const items = Array.from({ length: 10 }, (_, i) => i);
    const result = paginate(items, -5, 0);
    expect(result.length).toBe(1);
  });

  it("handles offset beyond array length", () => {
    const items = [1, 2, 3];
    const result = paginate(items, 50, 100);
    expect(result.length).toBe(0);
  });

  it("handles negative offset", () => {
    const items = [1, 2, 3, 4, 5];
    const result = paginate(items, 3, -10);
    expect(result.length).toBe(3);
    expect(result[0]).toBe(1);
  });

  it("returns empty for empty array", () => {
    expect(paginate([], 50, 0).length).toBe(0);
  });
});
