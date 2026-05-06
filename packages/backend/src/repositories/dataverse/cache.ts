// Tiny in-process LRU cache for hot Dataverse reads.
// Use sparingly — only for entities that change rarely (service catalog, freelancer roster).
// Cache keys must be stable strings that include the query/filter so different shapes get separate slots.
import QuickLRU from "quick-lru";

interface Entry<T> {
  value: T;
  expiresAt: number;
}

const stores = new Map<string, QuickLRU<string, Entry<unknown>>>();

function getStore(namespace: string, maxSize: number): QuickLRU<string, Entry<unknown>> {
  let store = stores.get(namespace);
  if (!store) {
    store = new QuickLRU<string, Entry<unknown>>({ maxSize });
    stores.set(namespace, store);
  }
  return store;
}

/**
 * Cache wrapper for async fetch fns. Returns cached value if not expired,
 * otherwise calls `fetcher`, caches the result, and returns it.
 *
 * @param namespace - Logical bucket (e.g. "services", "freelancers")
 * @param key - Stable cache key (include filter/select args)
 * @param ttlMs - Time-to-live in milliseconds
 * @param fetcher - Async function that returns the value to cache
 * @param maxSize - LRU cap per namespace (default 200)
 */
export async function withCache<T>(
  namespace: string,
  key: string,
  ttlMs: number,
  fetcher: () => Promise<T>,
  maxSize = 200,
): Promise<T> {
  const store = getStore(namespace, maxSize);
  const now = Date.now();
  const hit = store.get(key) as Entry<T> | undefined;
  if (hit && hit.expiresAt > now) {
    return hit.value;
  }
  const fresh = await fetcher();
  store.set(key, { value: fresh, expiresAt: now + ttlMs });
  return fresh;
}

/** Invalidate a specific key inside a namespace. Call after writes. */
export function invalidate(namespace: string, key?: string): void {
  const store = stores.get(namespace);
  if (!store) return;
  if (key) {
    store.delete(key);
  } else {
    store.clear();
  }
}

/** Stats for /health or admin endpoints. */
export function cacheStats(): Record<string, { size: number; maxSize: number }> {
  const out: Record<string, { size: number; maxSize: number }> = {};
  for (const [ns, store] of stores) {
    out[ns] = { size: store.size, maxSize: store.maxSize };
  }
  return out;
}
