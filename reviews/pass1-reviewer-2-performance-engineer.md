# Pass 1 - Reviewer 2: Performance Engineer
## Model: mistral-small-latest | Date: 2026-05-06 19:36

I'll analyze the backend codebase for performance issues, focusing on memory leaks, unnecessary re-renders (though this is backend), bundle size, and query efficiency.

## Severity Summary
- **CRITICAL**: 0
- **HIGH**: 5
- **MEDIUM**: 3
- **LOW**: 2

---

## HIGH Issues (5)

### 1. HIGH | packages\backend\src\queue\inMemoryQueue.ts:25 | Memory leak in in-memory queue | fix
**Issue**: The in-memory queue maintains buckets in a Map that grows indefinitely. While messages are processed, the Map structure itself isn't cleared when messages complete.

**Fix**: Clear completed messages from buckets after processing. Add a cleanup mechanism:
```typescript
private async tick() {
  for (const [queueName, bucket] of this.buckets) {
    const handler = this.handlers.get(queueName);
    if (!handler) continue;
    const next = bucket.shift();
    if (!next) continue;
    // ... existing processing code ...
    // After successful processing, remove from bucket
    const index = bucket.findIndex(m => m.queue_id === next.queue_id);
    if (index !== -1) bucket.splice(index, 1);
  }
}
```

### 2. HIGH | packages\backend\src\repositories\dataverse\client.ts:30 | Singleton client not properly cleaned up | fix
**Issue**: The `cached` Dataverse client is never reset, which could cause issues during tests or when switching providers. Also, the client holds references that could prevent garbage collection.

**Fix**: Make the client creation more controlled:
```typescript
let cached: DataverseClient | null = null;

export function getDataverseClient(): DataverseClient {
  if (cached) return cached;
  // ... existing code ...
  return cached;
}

export function resetDataverseClient(): void {
  cached = null;
}
```

### 3. HIGH | packages\backend\src\queue\azureServiceBusQueue.ts:25 | Azure Service Bus client not properly disposed | fix
**Issue**: The Service Bus client maintains senders and receivers in Maps that aren't cleared on shutdown. This could lead to memory leaks.

**Fix**: Clear collections in shutdown:
```typescript
async shutdown() {
  await Promise.all(this.receivers.map((r) => r.close().catch(() => undefined)));
  await Promise.all(Array.from(this.senders.values()).map((s) => s.close().catch(() => undefined)));
  this.senders.clear();
  this.receivers = [];
  await this.client.close();
}
```

### 4. HIGH | packages\backend\src\repositories\dataverse\cache.ts:15 | Unbounded cache growth in LRU stores | fix
**Issue**: The `stores` Map holds all namespace stores indefinitely. While each store has a maxSize, the Map itself grows with every new namespace.

**Fix**: Add cleanup for unused namespaces:
```typescript
function getStore(namespace: string, maxSize: number): QuickLRU<string, Entry<unknown>> {
  let store = stores.get(namespace);
  if (!store) {
    store = new QuickLRU<string, Entry<unknown>>({ maxSize });
    stores.set(namespace, store);
  }
  return store;
}

export function cleanupUnusedNamespaces(): void {
  for (const [ns, store] of stores) {
    if (store.size === 0) {
      stores.delete(ns);
    }
  }
}
```

### 5. HIGH | packages\backend\src\queue\supabaseQueue.ts:25 | Supabase client polling interval too aggressive | fix
**Issue**: The polling interval is hardcoded to 2 seconds (2000ms), which is reasonable but could be made configurable. More importantly, the polling happens even when there are no handlers subscribed.

**Fix**: Make polling interval configurable and check for handlers:
```typescript
constructor(private queueLog: IQueueLogRepository) {
  if (!config.SUPABASE_URL || !config.SUPABASE_ANON_KEY) {
    throw new Error("SUPABASE_URL and SUPABASE_ANON_KEY are required when QUEUE_PROVIDER=supabase");
  }
  this.supabase = createClient(config.SUPABASE_URL, config.SUPABASE_ANON_KEY);
  // Only start polling if there are handlers
  if (this.handlers.size > 0) {
    this.polling = setInterval(() => this.poll().catch((e) => logger.error({ e }, "supabase queue poll failed")), config.QUEUE_POLL_INTERVAL_MS ?? POLL_INTERVAL_MS);
  }
}
```

---

## MEDIUM Issues (3)

### 6. MEDIUM | packages\backend\src\repositories\dataverse\client.ts:60 | Inefficient token fetching in Dataverse client | fix
**Issue**: The `getToken()` function is called for every request, which could be optimized. The token is cached by the credential but we're not leveraging that.

**Fix**: Cache the token for its lifetime:
```typescript
let cachedToken: { token: string; expiresOn: Date } | null = null;

async function getToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresOn > new Date()) {
    return cachedToken.token;
  }
  const token = await credential.getToken(scope);
  if (!token) throw new Error("Failed to acquire Dataverse access token");
  cachedToken = { token: token.token, expiresOn: token.expiresOn };
  return cachedToken.token;
}
```

### 7. MEDIUM | packages\backend\src\queue\IQueueService.ts:1 | Type safety issue with QueueMessage | fix
**Issue**: The `QueueMessage` type uses `Record<string, unknown>` for payload, which loses type safety. This could lead to runtime errors when accessing specific fields.

**Fix**: Make the type generic and properly typed:
```typescript
export interface QueueMessage<T = Record<string, unknown>> {
  queue_id: string;
  queue_name: QueueName;
  payload: T;
  retry_count: number;
}
```

### 8. MEDIUM | packages\backend\src\repositories\dataverse\systemTables.ts:80 | Inefficient freelancer listing with cache busting | fix
**Issue**: The `listFreelancers()` method caches results for 30 seconds, but every call to `updateAvailability()` invalidates the entire cache, even if it's for a single freelancer.

**Fix**: Implement fine-grained cache invalidation:
```typescript
async updateAvailability(
  contactId: string,
  status: "available" | "busy" | "unavailable",
): Promise<void> {
  await this.c.update(this.table, contactId, { dm_availability_status: status });
  invalidate("freelancers", `freelancer_${contactId}`); // Only invalidate this freelancer
}
```

---

## LOW Issues (2)

### 9. LOW | packages\backend\src\repositories\memory\freelancerRepository.ts | Memory repository not properly typed | info
**Issue**: The memory freelancer repository implementation is cut off in the provided code, but likely needs proper type safety similar to other repositories.

**Fix**: Ensure all memory repositories implement their interfaces with proper typing.

### 10. LOW | packages\backend\src\queue\supabaseQueue.ts:50 | Error handling in Supabase queue could be more robust | info
**Issue**: The error handling in the Supabase queue's `poll()` method doesn't distinguish between different types of errors, which could mask important issues.

**Fix**: Add more detailed error handling:
```typescript
private async poll() {
  try {
    for (const [queueName, handler] of this.handlers) {
      try {
        // ... existing polling code ...
      } catch (err) {
        logger.error({ err, queueName }, "Error processing queue messages");
      }
    }
  } catch (err) {
    logger.error({ err }, "Critical error in Supabase queue poll");
  }
}
```

---

## Verdict: CONDITIONAL PASS

The codebase is generally well-structured with good separation of concerns and proper use of patterns like repository and DI container. However, there are several memory management issues that need attention:

1. **Memory leaks** in the in-memory queue and unmanaged caches could cause unbounded memory growth in long-running processes
2. **Resource cleanup** is inconsistent across queue implementations
3. **Cache invalidation** could be more granular to reduce unnecessary cache busting
4. **Type safety** could be improved in the queue message handling

**Recommended actions**:
1. Implement proper cleanup mechanisms for all queue services
2. Add cache cleanup and fine-grained invalidation
3. Ensure all resources (clients, connections) are properly disposed
4. Consider adding memory monitoring to detect leaks in production

The authentication and RBAC implementation in `authMiddleware.ts` is solid and addresses the critical security concerns identified in the prior review. The container pattern is well-implemented, though the singleton nature of some services could be improved for testability.

**Estimated effort to fix**: ~8-10 hours for the HIGH priority issues, plus additional time for testing and monitoring setup.