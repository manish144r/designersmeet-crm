# BRIEF-EXAMPLE — Settings → Invite Users (Design Doc)

**Feature:** Send an invite email from `Settings > Team > Invite` to add a new user with a role.
**Page:** `packages/frontend/src/pages/19-settings.tsx`
**Backend route:** `packages/backend/src/routes/invites.ts` (to be created)

---

## 1. Data Model

**InviteRecord** (new — add to `packages/shared/src/schemas/invite.ts`)

```ts
export const InviteRecordSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  role: z.enum(['admin', 'manager', 'member']),
  status: z.enum(['pending', 'accepted', 'expired']),
  created_at: z.string().datetime(),
});
export type InviteRecord = z.infer<typeof InviteRecordSchema>;
```

**API contract**

| Method | Path | Request body | Success response (200) | Error responses |
|--------|------|--------------|------------------------|-----------------|
| POST | `/api/invite` | `{ email: string, role: 'admin'\|'manager'\|'member' }` | `InviteRecord` with `status: 'pending'` | `400` malformed body (Zod fail); `409` email already invited (status `pending`); `500` mailer failed |
| GET | `/api/invite` | — | `InviteRecord[]` | `500` repo error |

Repository: `IInviteRepository` with `create(input)`, `list()`, `findByEmail(email)`. In-memory implementation only for this brief.

Store: `demoStore` adds resource key `invites`. No Dataverse / SQL Server work in this brief.

---

## 2. Frontend Interaction Spec

| Element | Trigger | Validation | API Call | Success Path | Error Path |
|---------|---------|------------|----------|--------------|------------|
| `+ Invite User` button (Settings → Team tab) | onClick | none | none | `useUIStore.openModal('invite-user')` opens modal | n/a |
| `Email` input (modal) | onChange | RFC-5322 email regex via Zod | none | enables Send button when valid | red border + helper text `Enter a valid email` when invalid and blurred |
| `Role` select (modal) | onChange | enum admin/manager/member | none | sets `formData.role` | n/a — defaulted to `member` |
| `Cancel` button (modal) | onClick | none | none | closes modal, clears form | n/a |
| `Send Invite` button (modal) | onClick | email valid AND role set | `POST /api/invite { email, role }` | toast `Invite sent to {email}`, modal closes, invite list refetches | toast `Failed to send invite` for any non-2xx; toast `{email} is already invited` for 409 |
| Invite row `Resend` icon | onClick | row status === pending | none (out of scope — disabled but visible) | n/a | n/a |

The Send button is disabled while `useMutation(postInvite).isPending` is true and shows spinner glyph.

---

## 3. Component Wiring Map

**File:** `packages/frontend/src/pages/19-settings.tsx`

- `useMutation(postInvite)` from `packages/frontend/src/hooks/useInvites.ts` (new)
  - mutationFn: `fetch('/api/invite', { method: 'POST', body: JSON.stringify(formData) })`
  - onSuccess: `toast.success('Invite sent to ' + email)`, `useUIStore.closeModal()`, `queryClient.invalidateQueries(['invites'])`
  - onError (409): `toast.error(email + ' is already invited')`
  - onError (other): `toast.error('Failed to send invite')`
- `useList('invites')` from `packages/frontend/src/hooks/useResource.ts` — drives the Team tab table
- `useUIStore` — `openModal('invite-user')`, `closeModal()`
- `react-hook-form` + `zodResolver(InviteRecordSchema.pick({ email: true, role: true }))`
- `toast` from `sonner` (already mounted in `main.tsx`)

**File:** `packages/backend/src/routes/invites.ts` (new)
- Mounts on `app.use('/api/invite', invitesRouter)` in `packages/backend/src/index.ts`
- Uses `container.invites` repository via dependency injection from `container.ts`
- POST handler: parse with `InviteRecordSchema.pick({email:true,role:true})`, check `findByEmail`, return 409 if pending exists, else `create` and return 200.

---

## 4. Acceptance Criteria

1. Clicking `+ Invite User` opens the modal (`data-testid="invite-modal"` visible).
2. Send button is disabled when email field is empty or invalid; enabled when both email and role are valid.
3. Submitting a valid form calls `POST /api/invite` exactly once with the form values; a success response closes the modal and triggers a toast containing the exact text `Invite sent to <email>`.
4. A 409 response shows a toast with the exact text `<email> is already invited` and leaves the modal open with the email field retained.
5. After a successful submit, the Team tab table refetches and the new invite row appears with status `pending`.

---

## 5. Playwright Test Stubs

```ts
import { test, expect } from '@playwright/test';

test.describe('Settings → Invite Users', () => {
  test('AC-1: + Invite User opens modal', async ({ page }) => {
    await page.goto('/settings#team');
    await page.getByRole('button', { name: '+ Invite User' }).click();
    await expect(page.getByTestId('invite-modal')).toBeVisible();
  });

  test('AC-2: Send button disabled until form valid', async ({ page }) => {
    await page.goto('/settings#team');
    await page.getByRole('button', { name: '+ Invite User' }).click();
    const send = page.getByRole('button', { name: 'Send Invite' });
    await expect(send).toBeDisabled();
    await page.getByLabel('Email').fill('not-an-email');
    await expect(send).toBeDisabled();
    await page.getByLabel('Email').fill('alice@example.com');
    await page.getByLabel('Role').selectOption('member');
    await expect(send).toBeEnabled();
  });

  test('AC-3: Valid submit POSTs once and toasts success', async ({ page }) => {
    await page.goto('/settings#team');
    const calls: string[] = [];
    await page.route('**/api/invite', (route) => {
      calls.push(route.request().method());
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ id: 'i1', email: 'alice@example.com', role: 'member', status: 'pending', created_at: new Date().toISOString() }) });
    });
    await page.getByRole('button', { name: '+ Invite User' }).click();
    await page.getByLabel('Email').fill('alice@example.com');
    await page.getByLabel('Role').selectOption('member');
    await page.getByRole('button', { name: 'Send Invite' }).click();
    await expect(page.getByText('Invite sent to alice@example.com')).toBeVisible();
    await expect(page.getByTestId('invite-modal')).toBeHidden();
    expect(calls.filter((m) => m === 'POST').length).toBe(1);
  });

  test('AC-4: 409 shows already-invited toast and keeps modal open', async ({ page }) => {
    await page.goto('/settings#team');
    await page.route('**/api/invite', (route) => route.fulfill({ status: 409, body: '{}' }));
    await page.getByRole('button', { name: '+ Invite User' }).click();
    await page.getByLabel('Email').fill('dup@example.com');
    await page.getByLabel('Role').selectOption('member');
    await page.getByRole('button', { name: 'Send Invite' }).click();
    await expect(page.getByText('dup@example.com is already invited')).toBeVisible();
    await expect(page.getByTestId('invite-modal')).toBeVisible();
    await expect(page.getByLabel('Email')).toHaveValue('dup@example.com');
  });

  test('AC-5: Successful invite appears in Team table', async ({ page }) => {
    await page.goto('/settings#team');
    await page.route('**/api/invite', (route) => {
      if (route.request().method() === 'POST') {
        route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ id: 'i2', email: 'bob@example.com', role: 'manager', status: 'pending', created_at: new Date().toISOString() }) });
      } else {
        route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([{ id: 'i2', email: 'bob@example.com', role: 'manager', status: 'pending', created_at: new Date().toISOString() }]) });
      }
    });
    await page.getByRole('button', { name: '+ Invite User' }).click();
    await page.getByLabel('Email').fill('bob@example.com');
    await page.getByLabel('Role').selectOption('manager');
    await page.getByRole('button', { name: 'Send Invite' }).click();
    await expect(page.getByRole('row', { name: /bob@example.com/ })).toContainText('pending');
  });
});
```
