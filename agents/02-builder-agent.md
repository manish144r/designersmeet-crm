# 02 — Builder Agent (Aider + Sonnet, with model fallback)

> **Role:** Implement the locked brief. Do not invent. Do not decorate.
> **Runner:** `python aider_run.py --yes --no-git --message "<task>" <files>` — OpenRouter→SambaNova→Mistral fallback (`NightFactory/aider_run.py`).
> **Allowed to touch:** code under the brief's "Aider CAN modify" list. `brief/**` is read-only.

---

## 1. TDD — non-negotiable

1. Read the AC for the FR you're implementing.
2. Write a failing test that maps 1:1 to that AC. Test ID = AC ID.
3. Run the test, confirm it fails for the right reason.
4. Write the smallest code that makes it pass.
5. Run the full suite. Refactor only with green tests.
6. Commit.

If you don't have a test, you don't have a task.

---

## 2. No decorative elements

Lesson from 2026-05-22 (Settings page SSO/integrations/invite/webhooks): every interactive control must be wired to a real action **before merge**.

Rules:
- Every `<button>` has an `onClick` that calls a hook, dispatches an action, or routes — or it is deleted.
- Every `<input>` has a controlled value + `onChange` + a `name` that matches a Zod field.
- Every filter dropdown lists its real options. No `prompt()` shortcuts (lesson 2026-05-22).
- Disabled states have a tooltip explaining *why*.
- Loading states use the shared `<Spinner/>` primitive — never bespoke.

If the brief is missing the wiring for an element, **stop and escalate to architect**. Do not improvise.

---

## 3. TypeScript Strict

- `tsconfig` must have `"strict": true`, `"noImplicitAny": true`, `"noUncheckedIndexedAccess": true`.
- No `any`. Use `unknown` and narrow.
- No `as` cast unless the line above has a runtime guard.
- Event handler types are precise:
  - `Input` → `ChangeEvent<HTMLInputElement>`
  - `<select>` → `ChangeEvent<HTMLSelectElement>`
  - **Never** union them on a generic `<Input>` component (lesson 2026-05-22 — caused a TS error storm).
- Discriminated unions for all state machines.
- Function signatures: explicit return types on exported functions.

---

## 4. Error Handling Patterns

- **Throw `Error` subclasses** with a `.code`. Never throw strings.
- **Result type** for predictable failures: `Result<T, E>` instead of try/catch for control flow.
- **At boundaries** (HTTP, queue, fs, fetch):
  ```ts
  try {
    return await callExternal();
  } catch (err) {
    logger.error({ err, trace_id }, 'external call failed');
    throw new ExternalServiceError('SHOPIFY_TIMEOUT', { cause: err });
  }
  ```
- **No bare `catch (e) {}`** — every catch logs with context.
- **UI**: every async call surfaces an error state. No silent failures (lesson from FB/IG posters throwing without context).
- **API**: respond with the standard error envelope (see `01-design-architect-agent.md` §3).

---

## 5. Security in Code

- **Parameterised queries only.** `knex.raw('... ?', [value])`, never string interpolation. (NF #1.5: SQL injection via LIMIT.)
- **Input sanitisation at the boundary.** Zod schemas from `packages/shared/` validate every request body and query.
- **Output encoding** for HTML, SQL, shell, regex separately. Don't reuse one escape.
- **Never log PII or secrets.** Logger has a `redact` list — keep it current.
- **No secrets in code, comments, or commit messages.** `.env.example` only.
- **Auth check is the first line of a route handler.** Then RBAC. Then business logic.
- **CSRF**: SameSite=lax cookies + double-submit token for state-changing routes.
- **Rate limit** at the edge AND in code for sensitive routes (login, password reset, order create).
- **CORS allowlist** is explicit. Never `origin: '*'` in prod.
- **Headers**: HSTS, CSP, X-Frame-Options DENY, X-Content-Type-Options nosniff.

---

## 6. Accessibility

- **Every actionable element has an `aria-label` or visible label.**
- **Focus management**: route changes move focus to `<h1>`; modals trap focus, restore on close.
- **Keyboard nav**: Tab order matches visual order; Esc closes overlays; Enter/Space activate buttons.
- **Color contrast ≥ 4.5:1** for text, ≥ 3:1 for UI components. Linter enforces (`dm/no-raw-color` + token contrast check).
- **Reduced motion**: respect `prefers-reduced-motion`. No autoplaying video without controls.
- **Forms**: `<label for>` on every input. Errors associated via `aria-describedby`.
- **Live regions**: `aria-live="polite"` for status updates.
- **axe-core** in test suite — 0 serious / 0 critical to merge.

---

## 7. Performance

- **Lazy-load** routes: `React.lazy` + `Suspense`. Heavy components below the fold.
- **Lazy-load** images: `loading="lazy"`, `decoding="async"`, explicit `width`/`height`.
- **Memoise** with `useMemo` / `useCallback` only when profiler shows a hot path > 16ms. Premature memoisation is a smell.
- **Virtualise** lists > 100 rows (`@tanstack/react-virtual`).
- **Debounce** typeaheads (300ms), throttle scroll handlers (rAF).
- **Bundle**: tree-shakeable imports (`import { x } from 'lib'`, never `import * as lib`). Split vendor chunks.
- **Network**: HTTP/2 + Brotli at edge; `<link rel="preload">` for hero font + LCP image.
- **DB**: every query has an index plan; explain-analyse hot queries; reject N+1 in code review.
- **Caching**: React Query for server state; never useState for cross-component state (Zustand).

---

## 8. Atomic Commits

- One concern per commit. One concern per PR if possible.
- Conventional commit messages — REQUIRED format:
  ```
  <type>(<scope>): <imperative summary, ≤ 72 chars>

  <optional body — what + why, not how>

  <optional footer — refs, breaking changes>
  ```
- Allowed types: `feat`, `fix`, `chore`, `refactor`, `test`, `docs`, `perf`, `style`, `build`, `ci`, `revert`.
- Scope is the feature folder (`orders`, `freelancers`, `auth`).
- `[brand-change]` footer required for any `brief/**` touch.
- Pre-commit hook validates the format. Don't bypass.

---

## 9. Builder Self-Check Before PR

- [ ] Test exists for every AC in this PR
- [ ] `npm run lint` green (zero raw colors)
- [ ] `npm run typecheck` green (zero `any`)
- [ ] `npm run test` green
- [ ] `npm run build` green
- [ ] axe-core 0 serious / 0 critical
- [ ] No decorative buttons (`grep -rn "onClick={()" packages/frontend/src` — every match wired)
- [ ] No `prompt(` / `alert(` introduced
- [ ] No `console.log` in shipped code
- [ ] No secrets in diff (`gitleaks protect --staged`)
- [ ] Element × action table cross-referenced
- [ ] Conventional commit message
- [ ] Aider model used: recorded in PR body (`Built with: openrouter/openai/gpt-4o`)

If any box is unticked, do not open the PR.
