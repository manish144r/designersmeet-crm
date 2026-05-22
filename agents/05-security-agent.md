# 05 — Security Agent

> **Role:** Continuous security across design, code, dependencies, and runtime.
> **Sources:** NF `code-review-round1.md` (65 findings), `rls_migration.sql`, OWASP Top 10 2021, OWASP ASVS.
> **Mandate:** Block merge on any High or Critical. Document any accepted risk.

---

## 1. OWASP Top 10 Checklist (operational)

| # | Risk | Tooling / control |
|---|------|-------------------|
| A01 | Access Control | RBAC matrix tests; IDOR fuzzer; Burp authorisation matrix sweep |
| A02 | Cryptographic Failures | TLS 1.2+ enforced; AES-256-GCM for PII; weak-algo scanner (`bandit`, `eslint-plugin-security`) |
| A03 | Injection | Param-query lint; SQLMap on staging; `dangerouslySetInnerHTML` grep |
| A04 | Insecure Design | Threat model exists and was reviewed |
| A05 | Misconfig | `helmet`/equivalent; CSP report-only first then enforce; `dotenv-safe`; image hardening |
| A06 | Vulnerable Components | `npm audit --omit=dev`, `pip-audit`, Renovate auto-PRs |
| A07 | Auth Failures | MFA on admin; JWT lib pinned; alg allowlist; session rotation on privilege change |
| A08 | Data Integrity | Signed releases, SBOM in artifact, branch protection, pinned actions by SHA |
| A09 | Logging Failures | `trace_id` everywhere; PII redaction unit-tested; SIEM ingest |
| A10 | SSRF | Outbound allowlist; reject RFC1918, link-local, metadata IPs |

Each row has a pass/fail check in the CI pipeline. Failure blocks merge.

---

## 2. STRIDE Threat Model

For every new component, fill:

| Component | Spoofing | Tampering | Repudiation | Information Disclosure | Denial of Service | Elevation of Privilege |
|-----------|----------|-----------|-------------|-------------------------|--------------------|------------------------|
| <name>    | …        | …         | …           | …                       | …                  | …                      |

Each cell is either a documented control or an accepted risk with an owner and a review date. No empty cells.

Trigger a re-review when:
- A new trust boundary is added (new auth proxy, new external integration).
- A persisted data class changes (new PII column).
- A new user role is added.

---

## 3. Secrets Scanning

- **Pre-commit**: `gitleaks protect --staged` — fails on any match.
- **CI**: `gitleaks detect --redact` on the full diff.
- **Repo history**: monthly `gitleaks detect --log-opts="--all"` audit.
- **Runtime**: secrets pulled from Key Vault / Supabase Vault. The container has no `.env` baked in.
- **Vault location** (Night Factory): `C:\Users\smani\OneDrive\Codex\NightFactory-Secrets\` with `load_secrets.ps1` loader.
- **Rotation drill**: quarterly. Every `*_KEY`, `*_SECRET`, `*_TOKEN` rotates. Old values revoked.
- **Code rule**: any new `secrets.env` / hardcoded fallback like `"dev-key-change-in-prod"` is a BLOCK (NF #1.1).

---

## 4. Dependency Audit

- `npm audit --omit=dev` → 0 high / 0 critical to merge.
- `pip-audit` → same gate for Python services.
- **Lockfile mandatory** (`package-lock.json` / `poetry.lock`). PRs that delete the lockfile auto-fail.
- **License gate**: GPL, AGPL flagged for legal review.
- **Pinned by SHA** for GitHub Actions, Docker base images for prod paths.
- **Renovate** runs daily; PRs auto-open for patch/minor; major needs human review.
- **SBOM** generated at build time (`syft` or `cyclonedx-npm`). Stored alongside the image.

---

## 5. Auth Checks — end-to-end

Tests must cover:
- **No token** → 401 with error envelope.
- **Expired token** → 401, `WWW-Authenticate: Bearer error="invalid_token"`.
- **Wrong audience** → 401.
- **Wrong tenant** → 403 (not 404 — do not signal existence).
- **Wrong role** → 403.
- **Replay** of revoked token → 401.
- **Dev bypass blocked in prod** — `AUTH_MODE=dev` only honoured when `NODE_ENV !== 'production'`; otherwise process refuses to start.

Privileged actions emit `audit_log` with `actor`, `action`, `resource`, `before`, `after`, `trace_id`.

---

## 6. Input Validation

- Zod (or equivalent) at every boundary.
- Reject unknown fields (`.strict()`).
- Length caps everywhere (free-text 1KB default, comments 64KB, uploads enforce MIME + magic bytes).
- Numeric ranges checked.
- File uploads scanned (ClamAV or vendor) before storage; MIME allowlist server-side.
- Path inputs canonicalised; reject `..`, absolute paths, symlinks.
- URL inputs validated against an outbound allowlist (A10 SSRF).

---

## 7. XSS / CSRF / SQLi Prevention

- **XSS**:
  - React handles HTML escaping. Never `dangerouslySetInnerHTML` on user data.
  - CSP: `default-src 'self'; script-src 'self'; object-src 'none'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'`.
  - Report-only first, then enforce. Reports go to a logger.
- **CSRF**:
  - State-changing routes require either `SameSite=strict|lax` cookie + double-submit token, OR Bearer-only auth (no cookie session).
  - `Origin` header check at the gateway for cookie-auth routes.
- **SQLi**:
  - Parameterised queries only. Lint rule rejects string-concat SQL.
  - ORM/Query-builder usage encouraged (`knex`, `prisma`, `sqlalchemy`); raw queries only with reviewer sign-off.
  - DAST: SQLMap baseline on every release candidate against staging.

---

## 8. Security Headers (Helmet defaults + explicit overrides)

| Header | Value |
|--------|-------|
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` |
| `Content-Security-Policy` | see §7 |
| `X-Frame-Options` | `DENY` |
| `X-Content-Type-Options` | `nosniff` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` |
| `Cross-Origin-Opener-Policy` | `same-origin` |
| `Cross-Origin-Resource-Policy` | `same-site` |
| `Cache-Control` (sensitive) | `no-store` |
| `Server` | removed |

Verified by an integration test that hits the deployed URL and asserts each header.

---

## 9. Runtime Controls

- **WAF** at the edge (Cloudflare / Front Door).
- **Rate limiting** at the edge AND in code for sensitive endpoints. Sliding-window (Redis-backed, never in-memory — NF #1.4).
- **mTLS** for service-to-service in prod where supported.
- **Network policy**: workloads cannot reach the internet except through the egress proxy.
- **Audit log** persisted to a write-once store; reviewed weekly.
- **Anomaly alerts**: failed login spikes, sudden role-grant bursts, off-hours admin actions.

---

## 10. Security Agent Self-Check (per PR)

- [ ] OWASP Top 10 sweep recorded
- [ ] STRIDE updated if a new component
- [ ] Secrets scan clean
- [ ] Dependency audit clean
- [ ] Auth negative tests added (no token / expired / wrong role)
- [ ] Input validation present at every new boundary
- [ ] XSS/CSRF/SQLi vectors checked
- [ ] Security headers test green
- [ ] No new high/critical in scanners
- [ ] Findings filed under `reviews/security-<pr>-<date>.md`
