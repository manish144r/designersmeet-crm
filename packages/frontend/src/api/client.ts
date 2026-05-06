// Typed fetch wrapper with auth token support.
// Vite dev proxy forwards /api to the backend, so relative URLs work in both dev and prod.

export interface ApiResponse<T> {
  data: T;
}

let _getAccessToken: (() => Promise<string | null>) | null = null;

/** Called once from AuthProvider to inject the token getter */
export function setTokenGetter(fn: () => Promise<string | null>) {
  _getAccessToken = fn;
}

async function request<T>(
  path: string,
  init: RequestInit & { json?: unknown } = {},
): Promise<T> {
  const { json, headers, ...rest } = init;

  // Attach Bearer token if available (Fix #9: frontend API client now sends auth token)
  const authHeaders: Record<string, string> = {};
  if (_getAccessToken) {
    const token = await _getAccessToken();
    if (token) authHeaders["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`/api${path}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...authHeaders,
      ...(headers as Record<string, string> | undefined),
    },
    body: json !== undefined ? JSON.stringify(json) : (init.body ?? undefined),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status} ${res.statusText}: ${text}`);
  }
  if (res.status === 204) return undefined as T;
  const payload = (await res.json()) as ApiResponse<T>;
  return payload.data;
}

export const api = {
  get: <T,>(path: string) => request<T>(path),
  post: <T,>(path: string, body?: unknown) => request<T>(path, { method: "POST", json: body }),
  patch: <T,>(path: string, body?: unknown) => request<T>(path, { method: "PATCH", json: body }),
  delete: <T,>(path: string) => request<T>(path, { method: "DELETE" }),
};
