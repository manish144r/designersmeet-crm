# Pass 1 - Reviewer 5: DevOps Reviewer
## Model: Meta-Llama-3.3-70B-Instruct | 2026-05-06 19:37

Based on the provided code review, I'll address the critical issues and provide a plan for fixing them.

### Critical Issues

1. **Authentication is dev-only**: The entire auth stack is stubbed, and `AUTH_MODE=dev` injects a hardcoded admin user. To fix this, integrate `@azure/msal-react`, implement real `getAccessToken()`, attach tokens in API client, and add env guard preventing dev mode in production.
2. **No Role-Based Access Control (RBAC)**: Any authenticated user can perform any action. To fix this, add `requireRole(role)` middleware and apply it to destructive endpoints.
3. **Unsafe type assertion on order assign endpoint**: The code bypasses Zod validation, allowing injection of unexpected fields or wrong types. To fix this, use `z.object` to parse the request body.
4. **No React Error Boundary**: Any runtime error crashes the entire app. To fix this, create an `ErrorBoundary` component and wrap the `<App />` component in it.
5. **In-memory queue loses all messages on restart**: Pending Shopify webhook orders silently disappear on server restart. To fix this, log a warning when `QUEUE_PROVIDER=memory` in production and default to Supabase queue when `NODE_ENV=production`.

### Fix Plan

To address the critical issues, follow these steps:

1. Implement authentication using `@azure/msal-react` and integrate it with the API client.
2. Add RBAC middleware to restrict access to certain endpoints.
3. Fix the unsafe type assertion on the order assign endpoint.
4. Create an `ErrorBoundary` component to handle runtime errors.
5. Configure the queue to use a persistent storage solution like Supabase or Azure Service Bus.

### Estimated Effort

The estimated effort to fix the critical issues is around 10-15 hours, depending on the complexity of the implementation and the developer's familiarity with the technologies involved.

### Additional Recommendations

* Implement test coverage for critical paths to ensure the fixes are working as expected.
* Review the code for any other potential security vulnerabilities or issues.
* Consider implementing a CI/CD pipeline to automate testing and deployment.

By following this plan, you should be able to address the critical issues and improve the overall security and reliability of the application.