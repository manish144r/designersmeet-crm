# 04 — Tester Agent (Playwright)

> **Role:** Verify every AC, every screen, every persona.
> **Stack:** Playwright + axe-core + Page Object Model + factories.
> **Source:** DM persona suite (5×20×25×4 = 10,000 cases), scheduled runner `scripts/dm-ux-run.ps1`.

---

## 1. One Test Per AC

- Test ID equals AC ID. `FR-12.AC-2` → test file `tests/specs/FR-12.AC-2.spec.ts`.
- If you cannot point a test at an AC, the test should not exist — or the brief is missing an AC.
- "Smoke test" tests are allowed only as cross-cutting layer; they do not substitute for AC tests.

---

## 2. Page Object Model

- One POM class per page in `tests/poms/<Page>.ts`.
- POMs expose **semantic methods** — `loginAs(role)`, `createOrder({...})` — never raw `page.click('#submit-x7y2')`.
- Selectors use `data-testid="<role>-<noun>-<verb?>"` only. No class/id selectors in specs.
- POMs encapsulate waits — caller never writes `waitForTimeout`.

```ts
// tests/poms/OrdersPage.ts
export class OrdersPage {
  constructor(private page: Page) {}
  async open() { await this.page.goto('/orders'); }
  async create(input: OrderInput) {
    await this.page.getByTestId('orders-new').click();
    await this.page.getByTestId('order-customer').fill(input.customer);
    await this.page.getByTestId('order-submit').click();
    await this.page.getByTestId('toast-success').waitFor();
  }
}
```

---

## 3. Test Factories, Not Hardcoded Values

- `tests/factories/order.factory.ts` exports `orderFactory.build({ overrides })`.
- Use `@faker-js/faker` seeded with the spec name (deterministic).
- Reject any spec containing `'john@example.com'`, `'Order 1'`, or other hardcoded literals — they hide coupling.

```ts
const order = orderFactory.build({ status: 'draft' });
```

---

## 4. axe-core On Every Page

```ts
import AxeBuilder from '@axe-core/playwright';

test('orders page is accessible', async ({ page }) => {
  await new OrdersPage(page).open();
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa'])
    .analyze();
  expect(results.violations.filter(v => ['serious','critical'].includes(v.impact!))).toEqual([]);
});
```

- Run on every named page.
- 0 serious / 0 critical to merge.
- Mediums logged but not blocking — track via lessons-learned.

---

## 5. Visual Regression

- Self-baseline only (lesson `feedback_vr_self_baseline_control.md`). Generate baselines from the exact base commit; never reuse a committed baseline that has rotted.
- Tolerance: ≤ 2% drift per page; ≤ 0.5% on logo, primary CTA, sidebar.
- Re-baseline only with `[brand-change]` commit footer.
- Storybook stories drive component-level VR. Page-level VR runs against staging URL.

```ts
await expect(page).toHaveScreenshot('orders-empty.png', { maxDiffPixelRatio: 0.02 });
```

---

## 6. API Schema Validation

- Validate every response against the OpenAPI 3.1 contract using `openapi-response-validator` or equivalent.
- A 200 with wrong shape is a test failure, not a warning.
- Negative cases: 4xx responses must match the error envelope `{ error: { code, message, trace_id } }`.

```ts
const res = await request.get('/api/v1/orders/abc');
expect(res.status()).toBe(404);
const body = await res.json();
expect(body).toMatchSchema(openapi.paths['/orders/{id}'].get.responses['404']);
expect(body.error.code).toBe('ORDER_NOT_FOUND');
```

---

## 7. Negative Tests — Mandatory

For every endpoint and every interactive flow, include:

| Class | Example |
|-------|---------|
| Invalid input | empty required field, wrong type, max-length+1 |
| Wrong role | `external_partner` tries to delete an admin record |
| Missing/expired token | omit Authorization; send `exp` in the past |
| Wrong tenant | tenantId on token differs from resource tenantId |
| Network failure | `await route.abort('failed')` mid-flow |
| Timeout | `await route.fulfill({ ...delay: 30s })` |
| Replay attack | reuse the same `idempotency_key` with different body — must reject |
| XSS payload | `<img src=x onerror=alert(1)>` in any text field |
| SQL-style payload | `' OR 1=1 --` in any text/search field |
| Concurrency | two clients update the same record; expect optimistic-lock error |

---

## 8. Persona Suite — 10,000 Cases

DM TIER-1 standard (`feedback_ux_testing_personas.md`):
- 5 personas (e.g. admin, internal ops, external partner, auditor, guest)
- 20 journeys (per persona)
- 25 interactions (per journey)
- 4 states (idle, loading, error, success)

= 10,000 test cases per app build.

Two scheduled scopes (from `scripts/dm-ux-run.ps1`):
- `critical` daily at 04:00 (subset)
- `full` Sun 02:00 (all 10k)

Regression alert auto-writes `dm-ux-regression-YYYY-MM-DD.md` when fail count rises vs the previous same-scope run.

Pass score gate: model-pair tier ≥ 95% (lesson `feedback_aider_95_gate.md`). Below 95 → PR opens as DRAFT with a gap report; no force-merge.

---

## 9. Tester Self-Check

- [ ] Every AC has a spec
- [ ] Every page has axe-core
- [ ] Every page has VR baseline (self-baselined from base SHA)
- [ ] Every endpoint has schema validation
- [ ] Every endpoint has the 10 negative classes
- [ ] Persona suite run; report attached
- [ ] Regression alert checked
- [ ] Pass score ≥ 95% OR DRAFT + gap report
