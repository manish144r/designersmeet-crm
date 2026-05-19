// Meta Graph adapter (brief §8.5): Facebook Pages + Instagram publishing.
// When META_ENABLED=true + META_ACCESS_TOKEN, uses real Graph v21.0.
// Disabled path returns existing stub shapes so crm.test.ts stays green.
import { config } from "../../config.js";

const BASE = "https://graph.facebook.com/v21.0";

async function metaFetch(
  path: string,
  options: RequestInit = {},
  extraParams: Record<string, string> = {},
): Promise<Response> {
  const token = config.META_ACCESS_TOKEN;
  if (!token) throw new Error("META_ACCESS_TOKEN not set");
  const url = new URL(path.startsWith("http") ? path : `${BASE}${path}`);
  url.searchParams.set("access_token", token);
  for (const [k, v] of Object.entries(extraParams)) {
    url.searchParams.set(k, v);
  }
  const headers = new Headers(options.headers as Record<string, string> | undefined);
  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }
  const res = await fetch(url.toString(), { ...options, headers });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Meta ${options.method ?? "GET"} ${path} → ${res.status}: ${body}`);
  }
  return res;
}

export const meta = {
  facebook: {
    async createPagePost(pageId: string, message: string, scheduledAt?: string) {
      if (!config.META_ENABLED || !config.META_ACCESS_TOKEN) {
        return { id: `fb-post-stub-${Date.now()}` };
      }
      const body: Record<string, string> = { message };
      if (scheduledAt) {
        body.scheduled_publish_time = String(Math.floor(new Date(scheduledAt).getTime() / 1000));
        body.published = "false";
      }
      const res = await metaFetch(`/${pageId}/feed`, {
        method: "POST",
        body: JSON.stringify(body),
      });
      const data = (await res.json()) as { id: string };
      return { id: data.id };
    },

    async pageInsights(pageId: string, metric: string) {
      if (!config.META_ENABLED || !config.META_ACCESS_TOKEN) {
        return { data: [] as unknown[] };
      }
      const res = await metaFetch(`/${pageId}/insights`, {}, { metric, period: "day" });
      const json = (await res.json()) as { data: unknown[] };
      return { data: json.data };
    },
  },

  instagram: {
    async publish(igUserId: string, imageUrl: string, caption: string) {
      if (!config.META_ENABLED || !config.META_ACCESS_TOKEN) {
        return { containerId: `ig-c-${Date.now()}`, mediaId: `ig-m-${Date.now()}` };
      }
      // Step 1: create container
      const containerRes = await metaFetch(`/${igUserId}/media`, {
        method: "POST",
        body: JSON.stringify({ image_url: imageUrl, caption }),
      });
      const container = (await containerRes.json()) as { id: string };
      const containerId = container.id;

      // Step 2: publish container
      const publishRes = await metaFetch(`/${igUserId}/media_publish`, {
        method: "POST",
        body: JSON.stringify({ creation_id: containerId }),
      });
      const published = (await publishRes.json()) as { id: string };
      return { containerId, mediaId: published.id };
    },
  },

  async status() {
    if (!config.META_ENABLED || !config.META_ACCESS_TOKEN) {
      return { ok: true, detail: "stub adapter — META_ENABLED=false" };
    }
    try {
      const res = await metaFetch("/me", {}, { fields: "id,name" });
      const data = (await res.json()) as { name?: string };
      return { ok: true, detail: `Meta user: ${data.name ?? "unknown"}` };
    } catch (err) {
      return { ok: false, detail: String(err) };
    }
  },
};
