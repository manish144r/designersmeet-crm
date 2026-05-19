// Mutable in-memory demo store. Powers the static surge deploy (no backend):
// every wired button performs a real CRUD op that persists for the session.
// Seeded from demoFixtures (the pages' own verbatim sample rows) so a wired
// page's first render is byte-identical to its locked baseline (≤2% drift).
import { demoFixtures } from "./demoFixtures.js";

export interface DemoRow {
  id: string;
  [k: string]: unknown;
}

type Store = Record<string, DemoRow[]>;

let seq = 1;
const newId = (r: string) => `${r}-demo-${seq++}`;

// Deep-clone the fixtures so mutations never leak back into the seed.
const store: Store = JSON.parse(JSON.stringify(demoFixtures));

function ensure(resource: string): DemoRow[] {
  if (!store[resource]) store[resource] = [];
  return store[resource];
}

export const demoStore = {
  list(resource: string, params: Record<string, string | number> = {}) {
    let rows = ensure(resource).slice();
    for (const [k, v] of Object.entries(params)) {
      if (["page", "pageSize", "sort", "order"].includes(k) || v === "" || v == null) continue;
      const needle = String(v).toLowerCase();
      rows = rows.filter((row) => {
        const cell = row[k];
        return cell != null && String(cell).toLowerCase().includes(needle);
      });
    }
    const sort = params.sort as string | undefined;
    if (sort) {
      const dir = params.order === "desc" ? -1 : 1;
      rows.sort((a, b) =>
        a[sort] === b[sort] ? 0 : ((a[sort] as number) > (b[sort] as number) ? 1 : -1) * dir,
      );
    }
    const total = rows.length;
    const page = Math.max(1, Number(params.page) || 1);
    const pageSize = Math.min(200, Math.max(1, Number(params.pageSize) || total || 1));
    return {
      data: rows.slice((page - 1) * pageSize, (page - 1) * pageSize + pageSize),
      page,
      pageSize,
      total,
    };
  },

  get(resource: string, id?: string) {
    if (!id) return undefined;
    return ensure(resource).find((r) => r.id === id);
  },

  create(resource: string, body: Record<string, unknown>) {
    const row: DemoRow = {
      ...body,
      id: (body.id as string) || newId(resource),
      created_at: body.created_at ?? new Date().toISOString(),
    };
    ensure(resource).unshift(row);
    return row;
  },

  update(resource: string, id: string, patch: Record<string, unknown>) {
    const rows = ensure(resource);
    const i = rows.findIndex((r) => r.id === id);
    if (i === -1) return undefined;
    rows[i] = { ...rows[i], ...patch, id };
    return rows[i];
  },

  remove(resource: string, id: string) {
    const rows = ensure(resource);
    const i = rows.findIndex((r) => r.id === id);
    if (i === -1) return false;
    rows.splice(i, 1);
    return true;
  },

  // Domain ops mirroring packages/backend/src/crm/domain.ts.
  moveProjectStage(id: string, status: string) {
    return this.update("projects", id, { status });
  },
  bookSlot(body: Record<string, unknown>) {
    return this.create("calendar-events", { ...body, status: "confirmed" });
  },
  mergeConversations(sourceId: string, targetId: string) {
    ensure("messages").forEach((m) => {
      if (m.conversation_id === sourceId) m.conversation_id = targetId;
    });
    this.remove("conversations", sourceId);
    return this.get("conversations", targetId);
  },
  submitForm(slug: string, payload: Record<string, unknown>) {
    const form = ensure("forms").find((f) => f.public_slug === slug);
    return this.create("form-submissions", {
      form_id: form?.id ?? slug,
      payload_json: payload,
      submitted_at: new Date().toISOString(),
    });
  },
};
