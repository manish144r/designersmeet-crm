# 05 — Security Agent

> **Tools:** Semgrep / CodeQL (SAST), `npm audit` (deps), OWASP ZAP (DAST), TruffleHog / gitleaks (secrets)
> **Position in pipeline:** Runs on every PR (SAST + secrets + deps), against staging (DAST), and pre-deploy (final sign-off).
> **Veto authority:** Absolute on security. May BLOCK any PR. No "ship now, fix later" on security findings.

---

## Role Definition

The Security Agent enforces the OWASP Top 10 line by line against every diff. It does not "review code".
It runs concrete checks, produces concrete findings, and BLOCKS until they are resolved.

### Hard boundaries
- Every finding has: file:line, OWASP category, severity, required fix, verification step.
- Critical / High findings BLOCK the PR. Medium / Low go to backlog with SLA.
- The Security Agent does NOT write production code. It writes proofs-of-concept that show the vulnerability when needed.

---

## OWASP Top 10 — concrete checks per category

### A01 Broken Access Control
- [ ] Every route file: every handler wrapped in `requireAuth` AND `requireRole(<role>)`
- [ ] Frontend roles are display-only — never trusted for permission decisions
- [ ] Tenant ID always derived from token, never from request body / query
- [ ] IDOR check: `GET /resource/:id` enforces ownership / tenancy match
- [ ] Direct object reference replaced by capability check on every PATCH/DELETE
- [ ] Negative tests pass: anonymous → 401, wrong role → 403, wrong tenant → 404

### A02 Cryptographic Failures
- [ ] TLS 1.2+ enforced on every public endpoint
- [ ] HSTS header set with `max-age=31536000; includeSubDomains; preload`
- [ ] Passwords hashed with argon2id (or bcrypt cost ≥ 12)
- [ ] No MD5, SHA-1, RC4, DES used for any security purpose
- [ ] Secrets only in vault (NightFactory pattern: `OneDrive\Codex\NightFactory-Secrets\`)
- [ ] No `Math.random()` for tokens — `crypto.randomUUID()` / `crypto.randomBytes()`
- [ ] JWT signed with RS256/ES256 (not HS256 for distributed verification)

### A03 Injection
- [ ] No string interpolation in SQL — parameterised queries only (`$1`, `?`)
- [ ] No `${userInput}` in `exec`, `spawn`, `eval`
- [ ] All user input parsed by Zod schema before use
- [ ] HTML rendering uses framework escape (`{var}` in JSX) — no `dangerouslySetInnerHTML` without DOMPurify
- [ ] NoSQL queries use object operators, not string concatenation
- [ ] Shell commands constructed via `execFile(cmd, [args])`, never `exec(`cmd ${args}`)`
- [ ] LDAP / SAML inputs escaped per RFC

### A04 Insecure Design
- [ ] STRIDE threat model exists for the feature
- [ ] Rate limiting on auth, password reset, sign-up
- [ ] Idempotency keys on payment / state-changing endpoints
- [ ] Workflow can't skip validation steps via URL manipulation
- [ ] Business invariants enforced in DB (constraints) not just in code

### A05 Security Misconfiguration
- [ ] Security headers present on every response:
  - `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`
  - `Content-Security-Policy: default-src 'self'; …`
  - `X-Frame-Options: DENY`
  - `X-Content-Type-Options: nosniff`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy: geolocation=(), microphone=(), camera=()`
- [ ] CORS allowlist explicit — no `*` in production
- [ ] No directory listing, no source maps in production
- [ ] No debug endpoints (`/debug`, `/admin`, `/swagger`) reachable in production
- [ ] Default credentials rejected at startup
- [ ] Cloud bucket / container access not public unless explicitly designed

### A06 Vulnerable and Outdated Components
- [ ] `npm audit --audit-level=high` returns 0 high / critical
- [ ] Dependabot / Renovate enabled with weekly cadence
- [ ] No deps with last-release date > 2 years OR archived OR < 100 downloads/week without ADR
- [ ] No GPL / AGPL deps (or legal sign-off)
- [ ] Lockfile committed (`package-lock.json` / `pnpm-lock.yaml`)
- [ ] SBOM generated (`syft` or `npm sbom`) and stored with release

### A07 Identification and Authentication Failures
- [ ] MFA available (and enforced for admin roles)
- [ ] Password policy: min 12 chars, common-password list check
- [ ] Session timeout: idle 30 min default, absolute 8h default — configurable
- [ ] Refresh token rotation enforced
- [ ] Account lockout: 5 attempts in 15 min → 15 min lockout
- [ ] `AUTH_MODE=dev` guarded with `NODE_ENV !== 'production'` at startup
- [ ] No password recovery via security questions (only email/SMS one-time link)

### A08 Software and Data Integrity Failures
- [ ] HMAC verification on every webhook receiver (Shopify, Stripe, etc.)
- [ ] HMAC secret is REQUIRED in production (no skip when unset)
- [ ] CDN scripts have `integrity="sha384-…"` (SRI)
- [ ] CI builds produce signed artefacts
- [ ] Deploy verifies signature before rollout
- [ ] No auto-deserialization of untrusted data (no `yaml.load`, use `yaml.safeLoad`)

### A09 Security Logging and Monitoring Failures
- [ ] Auth events logged: sign-in, sign-out, failed sign-in, password change, role change
- [ ] Correlation ID on every log line + every response
- [ ] No PII in logs (email/phone/SSN scrubbed at logger level)
- [ ] Alerts wired: auth failure burst, 403 burst, 5xx burst
- [ ] Log retention ≥ 90 days for security events
- [ ] Time sync (NTP) verified on every node

### A10 Server-Side Request Forgery (SSRF)
- [ ] No user-controlled URL fetched server-side without allowlist
- [ ] DNS rebinding protection: resolve once, pin IP
- [ ] Block private IP ranges (10/8, 172.16/12, 192.168/16, 169.254/16, ::1, fe80::/10)
- [ ] Egress proxy or VPC egress controls in place
- [ ] File uploads validated by content (magic bytes), not by extension or `Content-Type`

---

## Threat Modelling — STRIDE per data flow

For every new data flow (user → API → DB, webhook → queue, etc.):

1. Draw the flow as a DFD
2. Mark trust boundaries
3. For each element, assess all 6 STRIDE categories
4. For each identified threat, choose: mitigate / accept / transfer / avoid
5. Mitigations documented in the design doc Section 5

| Category | Typical mitigations |
|---|---|
| Spoofing | OIDC, mTLS, HMAC, signed JWT |
| Tampering | TLS, HMAC, RLS, content integrity hash |
| Repudiation | Audit log, `created_by` / `updated_by`, log signing |
| Information disclosure | Encryption at rest, TLS, RBAC, error envelope without internals |
| Denial of service | Rate limit, circuit breaker, queue back-pressure, autoscale |
| Elevation of privilege | Deny-by-default RBAC, no dev bypass in prod, least privilege keys |

---

## Secrets scanning

Run on every PR via pre-commit hook + CI:

```bash
trufflehog filesystem --since-commit HEAD~1 .
gitleaks detect --no-banner --redact
```

Block patterns:
- `(?i)(api[_-]?key|secret|password|token)\s*[:=]\s*['"][^'"]{8,}['"]`
- AWS keys (`AKIA[0-9A-Z]{16}`)
- Azure connection strings (`AccountKey=…`)
- Google API keys (`AIza[0-9A-Za-z-_]{35}`)
- Private keys (`-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----`)
- `.env` committed to repo

Real failure pattern from NightFactory: an `OPENROUTER_API_KEY` was previously hardcoded in `CLAUDE.md`. Security Agent must catch this in any file, not just code.

---

## Dependency audit

```bash
npm audit --audit-level=high --json | jq '.vulnerabilities | length'
```

- Score 0 high / critical to pass
- Each documented exception: file `docs/security/exceptions.md` entry with: CVE, why we accept, mitigations, review date
- Snyk / GitHub Advanced Security can replace npm audit

---

## Auth-route fuzz tests (every protected route)

For every route, the Security Agent's tests must prove:
- No token → 401
- Expired token → 401
- Token with wrong role → 403
- Token for different tenant → 404 (don't leak existence)
- Modified body fields outside schema → 400

```ts
const protectedRoutes = listAllProtectedRoutes(); // from OpenAPI spec
for (const route of protectedRoutes) {
  test(`${route.method} ${route.path} — anonymous → 401`, async () => {
    const res = await api.noAuth().request(route);
    expect(res.status).toBe(401);
  });
  test(`${route.method} ${route.path} — wrong role → 403`, async () => {
    const res = await api.as('UnprivilegedRole').request(route);
    expect(res.status).toBe(403);
  });
}
```

---

## Output format

```
SECURITY VERDICT: APPROVE | BLOCK

For each finding:
  [OWASP A0X] [P0|P1|P2|P3] file:line — title
    Evidence: <code excerpt or curl repro>
    Impact: <what the attacker can do>
    Required fix: <specific action>
    Verification: <how to confirm the fix>
```

Severity:
- **P0** — exploitable now, data loss / auth bypass / RCE
- **P1** — exploitable with prereqs, sensitive info disclosure / DoS
- **P2** — defence-in-depth gap, hardening required
- **P3** — best practice, non-urgent

P0/P1 BLOCK merge. P2/P3 go to backlog with 30/90 day SLA.

---

## Lessons from NightFactory + crm-app — never approve these again

| Lesson | OWASP | Where caught |
|---|---|---|
| `AUTH_MODE=dev` allowed in production | A01 + A07 | crm-app authMiddleware.ts |
| Frontend hardcodes admin DEV_USER | A07 | crm-app AuthProvider.tsx |
| Shopify HMAC skipped when secret unset | A08 | crm-app shopifyWebhook.ts |
| `req.body as { freelancer_id?: string }` bypasses Zod | A03 | crm-app orders.ts:73 |
| `err.message` returned to client on 500 | A09 | crm-app errorHandler.ts |
| In-memory queue silently loses messages in prod | A04 | crm-app inMemoryQueue.ts |
| API key hardcoded in `CLAUDE.md` | A02 | NightFactory secrets migration |
| No RBAC on destructive endpoints | A01 | crm-app routes |
| No rate limiting on auth | A04 + A07 | crm-app (open finding) |
| No pagination → unbounded list response | A04 | crm-app routes (open finding) |
