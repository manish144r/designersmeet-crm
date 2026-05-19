// In-memory collection store (dev/demo) with list/get/create/update/remove.
// Same surface a knex/mssql repository exposes — DATA_PROVIDER=sqlserver swaps
// the implementation without touching routes (repository pattern, brief §7).
import { randomUUID } from "node:crypto";

export interface ListQuery {
  page?: number;
  pageSize?: number;
  sort?: string;
  order?: "asc" | "desc";
  [filter: string]: unknown;
}

export interface Page<T> {
  data: T[];
  page: number;
  pageSize: number;
  total: number;
}

const RESERVED = new Set(["page", "pageSize", "sort", "order"]);

export class Collection<T extends { id?: string }> {
  private rows = new Map<string, T>();

  constructor(seed: T[] = []) {
    for (const r of seed) {
      const id = r.id ?? randomUUID();
      this.rows.set(id, { ...r, id });
    }
  }

  list(q: ListQuery = {}): Page<T> {
    let items = [...this.rows.values()];
    for (const [k, v] of Object.entries(q)) {
      if (RESERVED.has(k) || v === undefined || v === "") continue;
      const needle = String(v).toLowerCase();
      items = items.filter((row) => {
        const cell = (row as Record<string, unknown>)[k];
        return cell != null && String(cell).toLowerCase().includes(needle);
      });
    }
    if (q.sort) {
      const dir = q.order === "desc" ? -1 : 1;
      items.sort((a, b) => {
        const av = (a as Record<string, unknown>)[q.sort!];
        const bv = (b as Record<string, unknown>)[q.sort!];
        return av === bv ? 0 : (av! > bv! ? 1 : -1) * dir;
      });
    }
    const page = Math.max(1, Number(q.page) || 1);
    const pageSize = Math.min(200, Math.max(1, Number(q.pageSize) || 25));
    const total = items.length;
    const start = (page - 1) * pageSize;
    return { data: items.slice(start, start + pageSize), page, pageSize, total };
  }

  get(id: string): T | undefined {
    return this.rows.get(id);
  }

  create(input: Omit<T, "id">): T {
    const id = randomUUID();
    const row = { ...(input as T), id, created_at: new Date().toISOString() };
    this.rows.set(id, row);
    return row;
  }

  update(id: string, patch: Partial<T>): T | undefined {
    const cur = this.rows.get(id);
    if (!cur) return undefined;
    const next = { ...cur, ...patch, id };
    this.rows.set(id, next);
    return next;
  }

  remove(id: string): boolean {
    return this.rows.delete(id);
  }

  count(): number {
    return this.rows.size;
  }
}
