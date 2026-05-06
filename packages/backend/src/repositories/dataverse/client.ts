// Lazy-instantiated Dataverse Web API client. Uses MSAL client-credentials flow
// (DefaultAzureCredential when running in Azure with managed identity).
import { ClientSecretCredential, DefaultAzureCredential } from "@azure/identity";
import { config } from "../../config.js";

export interface DataverseClient {
  retrieveMultiple<T>(entitySet: string, query?: string): Promise<T[]>;
  retrieve<T>(entitySet: string, id: string, select?: string[]): Promise<T | null>;
  create<T>(entitySet: string, payload: Record<string, unknown>): Promise<T>;
  update(entitySet: string, id: string, payload: Record<string, unknown>): Promise<void>;
  delete(entitySet: string, id: string): Promise<void>;
}

let cached: DataverseClient | null = null;

export function getDataverseClient(): DataverseClient {
  if (cached) return cached;

  if (!config.DATAVERSE_URL) {
    throw new Error("DATAVERSE_URL is required when DATA_PROVIDER=dataverse");
  }

  const baseUrl = config.DATAVERSE_URL.replace(/\/$/, "") + "/api/data/v9.2";
  const scope = `${config.DATAVERSE_URL.replace(/\/$/, "")}/.default`;

  const credential =
    config.AZURE_TENANT_ID && config.AZURE_CLIENT_ID && config.AZURE_CLIENT_SECRET
      ? new ClientSecretCredential(config.AZURE_TENANT_ID, config.AZURE_CLIENT_ID, config.AZURE_CLIENT_SECRET)
      : new DefaultAzureCredential();

  async function getToken(): Promise<string> {
    const token = await credential.getToken(scope);
    if (!token) throw new Error("Failed to acquire Dataverse access token");
    return token.token;
  }

  async function request<T>(
    method: "GET" | "POST" | "PATCH" | "DELETE",
    path: string,
    body?: unknown,
    extraHeaders?: Record<string, string>,
  ): Promise<T | null> {
    const token = await getToken();
    const res = await fetch(`${baseUrl}/${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        "OData-MaxVersion": "4.0",
        "OData-Version": "4.0",
        Accept: "application/json",
        "Content-Type": "application/json; charset=utf-8",
        Prefer: "return=representation",
        ...extraHeaders,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (res.status === 204 || res.status === 404) return null;
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Dataverse ${method} ${path} failed: ${res.status} ${text}`);
    }
    return (await res.json()) as T;
  }

  cached = {
    async retrieveMultiple<T>(entitySet: string, query?: string): Promise<T[]> {
      const path = query ? `${entitySet}?${query}` : entitySet;
      const result = await request<{ value: T[] }>("GET", path);
      return result?.value ?? [];
    },
    async retrieve<T>(entitySet: string, id: string, select?: string[]): Promise<T | null> {
      const q = select?.length ? `?$select=${select.join(",")}` : "";
      return request<T>("GET", `${entitySet}(${id})${q}`);
    },
    async create<T>(entitySet: string, payload: Record<string, unknown>): Promise<T> {
      const created = await request<T>("POST", entitySet, payload);
      if (!created) throw new Error(`Dataverse create returned no entity for ${entitySet}`);
      return created;
    },
    async update(entitySet: string, id: string, payload: Record<string, unknown>) {
      await request("PATCH", `${entitySet}(${id})`, payload);
    },
    async delete(entitySet: string, id: string) {
      await request("DELETE", `${entitySet}(${id})`);
    },
  };

  return cached;
}
