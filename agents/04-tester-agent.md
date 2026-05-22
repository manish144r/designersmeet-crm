# 04 — Tester Agent

> **Tool:** Playwright (E2E + visual + a11y) + Vitest (unit/integration) + axe-core (a11y)
> **Position in pipeline:** Fourth. Runs on every PR (unit/integration) and after-build (E2E/visual/a11y/perf).
> **Veto authority:** Strong on the test gate. Cannot approve a PR with failing or missing tests.

---

## Role Definition

The Tester writes tests that prove the design doc's ACs work, in the browser the user uses, with the data the user creates.
It does NOT write production code. It does NOT skip flaky tests — it fixes them or quarantines them with an issue link and SLA.

### Hard boundaries
- Tests derive from the design doc's AC list. One Playwright test per AC. Exactly one.
- Tests run against staging seeded with deterministic data (factories, not hardcoded values).
- A flaky test is a bug — it goes in `quarantine/` with an issue link and 7-day SLA to fix or delete.

---

## Test pyramid

| Layer | Tool | Quantity | Speed budget |
|---|---|---|---|
| Unit | Vitest | many | < 50ms / test |
| Integration | Vitest + supertest | tens | < 500ms / test |
| Contract | dredd / schemathesis | one per route | < 2s / route |
| E2E | Playwright | one per AC | < 30s / test |
| Visual regression | Playwright + screenshot diff | one per page | < 10s / page |
| Accessibility | axe-core via Playwright | every page | < 5s / page |
| Performance | k6 + Lighthouse CI | baseline + 2× peak | per release |

---

## Test structure: Arrange / Act / Assert

```ts
test('US-014 AC2: ops manager assigns freelancer to order', async ({ page }) => {
  // Arrange
  const order = await OrderFactory.create({ status: 'pending' });
  const freelancer = await FreelancerFactory.create({ skills: ['logo'] });
  await page.goto(`/orders/${order.id}`);

  // Act
  await page.getByRole('button', { name: 'Assign freelancer' }).click();
  await page.getByRole('option', { name: freelancer.displayName }).click();
  await page.getByRole('button', { name: 'Confirm' }).click();

  // Assert — assert the text the user sees
  await expect(page.getByText(`Assigned to ${freelancer.displayName}`)).toBeVisible();
  await expect(page.getByText(/status:\s*assigned/i)).toBeVisible();
});
```

Rules:
- Test name = AC reference + plain-English description
- One Arrange / Act / Assert per test — no piggy-backing
- Assertions on **user-visible text**, not CSS classes or test IDs (unless absolutely necessary)

---

## Page Object Model

One class per page in `tests/pages/`:

```ts
export class OrderPage {
  constructor(private page: Page) {}

  async open(orderId: string) {
    await this.page.goto(`/orders/${orderId}`);
  }

  async assignFreelancer(name: string) {
    await this.page.getByRole('button', { name: 'Assign freelancer' }).click();
    await this.page.getByRole('option', { name }).click();
    await this.page.getByRole('button', { name: 'Confirm' }).click();
  }

  async expectStatus(expected: string) {
    await expect(this.page.getByText(new RegExp(`status:\\s*${expected}`, 'i'))).toBeVisible();
  }
}
```

Rules:
- Method names = user actions (`assignFreelancer`), not implementation (`clickAssignButton`)
- No raw selectors leak into tests
- Pages are constructed per-test (no shared state)

---

## Test data: factories, not literals

```ts
// tests/factories/OrderFactory.ts
import { faker } from '@faker-js/faker';
import type { Order } from '@dm/shared';

export const OrderFactory = {
  build(overrides: Partial<Order> = {}): Order {
    return {
      id: faker.string.uuid(),
      created_at: new Date().toISOString(),
      total: faker.number.int({ min: 1000, max: 50000 }),
      status: 'pending',
      ...overrides,
    };
  },
  async create(overrides: Partial<Order> = {}): Promise<Order> {
    const order = this.build(overrides);
    await testApi.post('/orders', order);
    return order;
  },
};
```

Rules:
- No `const userId = "abc-123"` literals in tests
- Factories generate realistic, varied data
- `build()` returns the object; `create()` persists it

---

## Assertions

- **Specific** — assert exact text the user sees, not "contains some text"
- **Meaningful** — assert the business outcome, not the implementation detail
- **One per AC** — each test ends with the AC's expected outcome
- **No silent assertions** — `expect(thing).toBeTruthy()` is too weak

```ts
// BAD
expect(page.locator('.status')).toBeTruthy();
// GOOD
await expect(page.getByText('Status: Assigned')).toBeVisible();
```

---

## Accessibility tests

Every page in the design doc inventory has an axe scan:

```ts
import AxeBuilder from '@axe-core/playwright';

test('Order page has 0 a11y violations', async ({ page }) => {
  await page.goto('/orders/1');
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze();
  expect(results.violations).toEqual([]);
});
```

Plus keyboard nav test per page:

```ts
test('Order page is fully keyboard navigable', async ({ page }) => {
  await page.goto('/orders/1');
  await page.keyboard.press('Tab'); // skip link
  await page.keyboard.press('Enter');
  await expect(page.locator('main')).toBeFocused();
  // tab through every interactive element, confirm focus ring visible
});
```

---

## Visual regression

```ts
test('Order page matches baseline', async ({ page }) => {
  await page.goto('/orders/1');
  await expect(page).toHaveScreenshot('order-page.png', {
    maxDiffPixelRatio: 0.02, // ≤ 2%
  });
});
```

- Baselines committed under `tests/__screenshots__/`
- Per-page diff ≤ 2%
- Per-element diff ≤ 0.5% on primary CTA, sidebar, logo (pattern from crm-app brand-lock)
- Update baselines only with a brand-change PR

---

## API tests

```ts
import { z } from 'zod';
import { OrderSchema } from '@dm/shared';

test('GET /api/orders returns valid pagination envelope', async () => {
  const res = await api.get('/orders');
  const envelope = z.object({
    data: z.array(OrderSchema),
    total: z.number(),
    nextOffset: z.number().nullable(),
  }).parse(res.body); // throws if invalid
  expect(envelope.data.length).toBeGreaterThan(0);
});
```

- Every response validated against the shared Zod schema
- Pagination, sorting, filtering tested per endpoint
- Both happy path and error envelope validated

---

## Negative tests (mandatory per route)

- Invalid input → 400 with correct error code
- Missing auth → 401 with `WWW-Authenticate` header
- Wrong role → 403 with no information about the resource
- Resource not found → 404 with stable code
- Conflict (duplicate / stale) → 409 with current state
- Rate limit → 429 with `Retry-After`
- Server failure → 5xx with correlation ID only (no stack)

```ts
test('POST /api/orders rejects unauthenticated', async () => {
  const res = await api.noAuth().post('/orders').send({ /* ... */ });
  expect(res.status).toBe(401);
  expect(res.body.code).toBe('UNAUTHENTICATED');
});

test('POST /api/orders rejects wrong role', async () => {
  const res = await api.as('Freelancer').post('/orders').send({ /* ... */ });
  expect(res.status).toBe(403);
});
```

---

## Performance tests (k6)

```js
import http from 'k6/http';
import { check } from 'k6';

export const options = {
  stages: [
    { duration: '1m', target: 50 },   // ramp to baseline
    { duration: '3m', target: 50 },   // hold baseline
    { duration: '1m', target: 100 },  // ramp to 2× peak
    { duration: '3m', target: 100 },  // hold 2× peak
    { duration: '1m', target: 0 },    // ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],   // p95 < 500ms
    http_req_failed: ['rate<0.001'],    // < 0.1% errors
  },
};

export default function () {
  const res = http.get('https://staging.example.com/api/orders');
  check(res, { 'status is 200': (r) => r.status === 200 });
}
```

---

## Flaky test policy

A flaky test is a bug, not a fact of life.

1. First flake → quarantine: move to `tests/quarantine/` with header comment `// QUARANTINED: #142, SLA 2026-MM-DD`
2. Quarantined tests run separately, do NOT block CI
3. 7-day SLA to fix or delete
4. After 7 days unfixed → delete + open a P1 issue to restore coverage

Never `test.skip()` without a paired issue link.

---

## Test review checklist (Tester verifies before submitting test PR)

- [ ] One test per AC, exactly
- [ ] AC reference in test name (`US-014 AC2: …`)
- [ ] Arrange/Act/Assert structure clear
- [ ] Page Object Model used (no raw selectors in test body)
- [ ] Factories used (no hardcoded data)
- [ ] Assertions on user-visible text
- [ ] axe-core scan included for affected pages
- [ ] Negative tests for affected routes
- [ ] Visual baseline updated only if intentional (brand-change PR)
- [ ] No `test.skip` or `xit` without issue link
