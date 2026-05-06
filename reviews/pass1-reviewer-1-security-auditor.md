# Pass 1 - Reviewer 1: Security Auditor
## Model: mistral-small-latest (Mistral Key 3) | 2026-05-06 19:39

Here's a comprehensive security audit of the CRM codebase:

---

### **Security Audit Findings**

#### **HIGH SEVERity**
1. **`authMiddleware.ts:40-42`** | **Insecure Dev Mode Bypass in Production**
   - **Description**: The application allows `AUTH_MODE=dev` in production (`NODE_ENV=production`), which injects a hardcoded admin user (`DEV_USER`) without token validation. This bypasses all authentication and authorization checks.
   - **Impact**: An attacker could trivially gain admin access by setting `AUTH_MODE=dev` in production.
   - **Recommended Fix**:
     - Remove `AUTH_MODE=dev` entirely or enforce a strict check:
       ```ts
       if (config.AUTH_MODE === "dev") {
         if (config.NODE_ENV === "production") {
           throw new Error("AUTH_MODE=dev is not allowed in production");
         }
         req.user = DEV_USER;
         return next();
       }
       ```
     - Alternatively, use a feature flag system with stricter controls.

---

#### **MEDIUM SEVERITY**
2. **`shopifyWebhook.ts:20-30`** | **Missing HMAC Verification in Dev Mode**
   - **Description**: In dev mode (`SHOPIFY_WEBHOOK_SECRET` not set), the webhook accepts all requests without HMAC verification, which could allow attackers to spoof Shopify webhooks.
   - **Impact**: Unauthorized order creation/updates could occur.
   - **Recommended Fix**:
     - Disable dev mode entirely for webhooks or enforce HMAC verification even in dev:
       ```ts
       if (!config.SHOPIFY_WEBHOOK_SECRET) {
         throw new Error("SHOPIFY_WEBHOOK_SECRET is required");
       }
       ```

3. **`orders.ts:100-110`** | **Unsafe Role Assignment**
   - **Description**: The `AssignBody` schema only validates `freelancer_id` as a UUID but does not validate the `order_id` in the URL. An attacker could assign a freelancer to a non-existent or unauthorized order.
   - **Impact**: Privilege escalation or unauthorized order manipulation.
   - **Recommended Fix**:
     - Validate `req.params.id` against the order's existence before assignment:
       ```ts
       const order = await container.repos.orders.findById(req.params.id);
       if (!order) throw new HttpError(404, "Order not found");
       ```

4. **`container.ts:50-60`** | **Insecure Default Queue Provider in Production**
   - **Description**: The code logs a warning but does not block `QUEUE_PROVIDER=memory` in production, risking data loss on restarts.
   - **Impact**: Pending queue items may be lost during deployments or crashes.
   - **Recommended Fix**:
     - Throw an error in production if `QUEUE_PROVIDER=memory`:
       ```ts
       if (config.NODE_ENV === "production" && config.QUEUE_PROVIDER === "memory") {
         throw new Error("QUEUE_PROVIDER=memory is not allowed in production");
       }
       ```

5. **`client.ts:30-35`** | **Weak Token Acquisition**
   - **Description**: The `DefaultAzureCredential` falls back to managed identity, which may not be configured, leading to silent failures or token leaks.
   - **Impact**: Unauthorized access to Dataverse if tokens are exposed.
   - **Recommended Fix**:
     - Explicitly require `AZURE_CLIENT_ID`, `AZURE_CLIENT_SECRET`, and `AZURE_TENANT_ID` in production:
       ```ts
       if (config.NODE_ENV === "production" && !config.AZURE_CLIENT_SECRET) {
         throw new Error("AZURE_CLIENT_SECRET is required in production");
       }
       ```

6. **`AuthProvider.tsx:15-30`** | **Hardcoded Dev User in Frontend**
   - **Description**: The frontend (`AuthProvider.tsx`) hardcodes `DEV_USER` in dev mode, which could leak admin credentials if the frontend code is exposed.
   - **Impact**: Credential leakage or impersonation.
   - **Recommended Fix**:
     - Remove hardcoded users and rely solely on backend authentication:
       ```tsx
       const AuthContext = createContext<AuthContextValue>({
         user: null,
         signedIn: false,
         // ...
       });
       ```

---

#### **LOW SEVERITY**
7. **`errorHandler.ts:15-25`** | **Potential Information Leak in Error Responses**
   - **Description**: While `errorHandler.ts` masks errors in production, the `HttpError` class exposes `details` in non-production environments, which could leak sensitive data (e.g., stack traces).
   - **Impact**: Information disclosure.
   - **Recommended Fix**:
     - Sanitize `err.details` in all environments:
       ```ts
       res.status(err.status).json({
         error: err.message,
         details: isProduction ? undefined : sanitizeDetails(err.details),
       });
       ```

8. **`config.ts:20-25`** | **Missing Validation for Sensitive Fields**
   - **Description**: Fields like `SQLSERVER_PASSWORD` and `AZURE_CLIENT_SECRET` are not marked as sensitive in the schema, which could lead to accidental logging.
   - **Impact**: Credential leakage via logs.
   - **Recommended Fix**:
     - Use `z.string().optional().describe("Sensitive field")` for secrets.

9. **`server.ts:20-30`** | **Missing Rate Limiting**
   - **Description**: The server does not implement rate limiting, exposing it to brute-force attacks on `/health` or auth endpoints.
   - **Impact**: Denial-of-service or credential stuffing.
   - **Recommended Fix**:
     - Add `express-rate-limit` middleware:
       ```ts
       import rateLimit from "express-rate-limit";
       app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));
       ```

10. **`orders.ts:20-30`** | **Missing Input Sanitization for Query Params**
    - **Description**: The `status` query param is parsed directly from `req.query.status` without trimming or validation, which could lead to injection if the underlying data provider is vulnerable.
    - **Impact**: SQL/NoSQL injection (if using SQL Server/Dataverse).
    - **Recommended Fix**:
      - Sanitize inputs:
        ```ts
        const status = req.query.status ? OrderStatus.parse(String(req.query.status).trim()) : undefined;
        ```

---

### **Overall Verdict**
**CONDITIONAL PASS**

- **Strengths**:
  - Strong JWT validation in `authMiddleware.ts` for `AUTH_MODE=entra`.
  - Zod validation used in most routes (e.g., `orders.ts`).
  - Secure error handling in production (`errorHandler.ts`).
  - RBAC implemented via `requireRole` middleware.

- **Critical Risks**:
  - Dev mode bypass in production (`authMiddleware.ts`) is a **showstopper**.
  - Shopify webhook HMAC bypass in dev mode (`shopifyWebhook.ts`).

- **Mitigation**:
  - The dev mode bypass must be fixed **immediately** before deploying to production.
  - Enforce HMAC verification for webhooks in all environments.

**Next Steps**:
1. Fix `authMiddleware.ts` to block `AUTH_MODE=dev` in production.
2. Enforce `SHOPIFY_WEBHOOK_SECRET` in all environments.
3. Add rate limiting and input sanitization.
4. Audit other integrations (e.g., Dataverse client) for similar issues.
