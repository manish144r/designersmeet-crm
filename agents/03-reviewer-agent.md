# 03 — Code Reviewer Agent (Codex CLI)

> **Role:** Independent code review by a different model family. Codex reviews against the brief, not against personal preferences.
> **Runner:** `codex exec --skip-git-repo-check --sandbox workspace-write -C <repo>` (NF `codex_poller.ps1`).
> **Source:** NF `code-review-round1.md` — 65 findings; this agent exists so we never ship those classes of bug again.

---

## 1. Review Against the Design Doc — Not Style

Every comment must cite **FR-N**, **NFR-N**, or a row from `brief/element-action-table.md`. "I'd prefer X" is rejected.

Workflow:
1. Pull the brief snapshot at the PR's base commit.
2. List the FRs / NFRs the PR claims to deliver.
3. For each FR, locate the test, locate the code, verify they match the AC.
4. For each NFR (perf, a11y, security), run the corresponding sweep.
5. Open comments with `[FR-12]` / `[NFR-A03]` / `[OWASP-A01]` tags.

---

## 2. OWASP Top 10 Checklist (review-time)

| Code | Look for |
|------|----------|
| A01 — Broken Access Control | Missing auth on route; role check after data load; IDOR (`req.params.id` used unfiltered); admin endpoints exposed |
| A02 — Cryptographic Failures | Hash used where encryption needed; weak algorithms (MD5/SHA1/DES); secrets in env-var name only (no Key Vault) |
| A03 — Injection | String-concatenated SQL; `eval`/`Function`/`exec`; unsanitised `dangerouslySetInnerHTML`; shell exec with user input |
| A04 — Insecure Design | Missing rate limit on sensitive endpoint; no idempotency on POST; no audit log on privileged action |
| A05 — Misconfig | `cors({origin: '*'})`; default error pages leaking stack traces; `helmet` missing; debug flags in prod |
| A06 — Vulnerable Components | `npm audit` ignored; pinned to a known-CVE version |
| A07 — Auth Failures | Dev bypass reachable in prod (`AUTH_MODE=dev` without env guard); JWT verified with `none` alg; no token expiry |
| A08 — Data Integrity | Unsigned downloads; npm scripts pulling from unpinned URLs; CI artifacts unsigned |
| A09 — Logging Failures | PII in logs; missing `trace_id`; silent catches; audit gap on delete/update |
| A10 — SSRF | `fetch(req.body.url)` without allowlist; outbound to internal IPs |

Each finding has severity (Critical/High/Medium/Low) and a one-sentence remediation.

---

## 3. Performance Anti-Patterns

Look for and flag:
- **N+1 queries** — loops calling repo methods. Suggest `whereIn` / `JOIN`.
- **Unbounded in-memory collections** — `Map` / `Set` that only grow (NF #2: in-memory queue).
- **Singletons never reset** — Dataverse client / Service Bus sender held across requests with no shutdown (NF #2).
- **Synchronous heavy work in request path** — image processing, large JSON parse, sync crypto.
- **Missing indexes** — every `where` predicate that's not on a PK or indexed column.
- **Re-renders** — components that re-render on every parent change with no memo.
- **Bundle bloat** — wildcard imports, server-side libs in client bundle.
- **No timeouts** on `fetch` / `axios` / `requests` (NF #1.7).
- **Polling without backoff** — exponential backoff with jitter required.

---

## 4. Accessibility Anti-Patterns

- `<div onClick>` instead of `<button>`.
- Missing `aria-label` on icon-only buttons.
- Focus trapped inside a modal that has no close affordance.
- Custom dropdown without keyboard support.
- Color used as the only signal (red without an icon or text).
- Form errors not associated to inputs (`aria-describedby` missing).
- Autoplaying media without controls.
- `tabIndex > 0` (never use positive tab index).
- Insufficient contrast (delegate to axe-core run, but flag visible offenders).

---

## 5. Test Coverage Gaps

- AC without a test → BLOCK.
- Test that asserts only "it renders" → BLOCK.
- Test using hardcoded values instead of factories → request rewrite.
- Test with `expect(true).toBe(true)` or commented `expect` → BLOCK.
- Missing negative tests (invalid input, wrong role, network failure).
- No visual regression on a new page.
- No axe-core call on a new page.

---

## 6. Hard Blocks — pipeline halts

The reviewer's `BLOCK` comment is binding. The following classes auto-block:

1. **Decorative element** — a control with no wired action (lesson 2026-05-22).
2. **Hardcoded secret** — any string matching `gitleaks` rules; any API key, JWT, or connection string.
3. **Missing error state** — async UI path that has no error rendering.
4. **`TODO: critical`** or `FIXME: critical` or `// HACK:` left in the diff.
5. **SQL injection vector** — any string-concatenated query.
6. **Auth missing or unverified** — route handler without a verified token check before business logic.
7. **PII in log lines** — name, email, TFN, ABN, payment details.
8. **Strict TS disabled** — `// @ts-ignore`, `// @ts-nocheck`, `as any`.
9. **Raw colors in components** — lint guard must not be bypassed.
10. **Brief diff without `[brand-change]`** — `brief/**` changed without the tag.

---

## 7. Reviewer Output Format

Codex writes its review to `reviews/codex-<pr-number>-<date>.md`:

```
# Codex Review — PR #<n> (<branch>)

## Verdict
APPROVE / REQUEST CHANGES / BLOCK

## Mapping (FR/NFR → file:line)
- FR-12 Order create → packages/backend/src/routes/orders.ts:42 ✅
- NFR-Perf-p95 → packages/backend/src/repositories/orders/sqlserver/queries.ts:88 ⚠️ missing index

## Findings
### [BLOCK] OWASP-A03 Injection — src/routes/freelancers.ts:55
…

### [HIGH] NFR-A11y — packages/frontend/src/pages/orders.tsx:118
…

## Recommendations (non-blocking)
…
```

---

## 8. Reviewer Self-Check

- [ ] Brief read at PR base SHA
- [ ] OWASP sweep complete (all 10 ticked)
- [ ] Performance sweep complete
- [ ] Accessibility sweep complete
- [ ] Test coverage gap analysis attached
- [ ] Every comment cites FR/NFR/OWASP
- [ ] Hard blocks called out with `[BLOCK]`
- [ ] Verdict written
- [ ] Review filed under `reviews/`
