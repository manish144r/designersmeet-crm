// Generic TanStack Query CRUD hooks for any CRM resource.
// In demo mode (no backend) they resolve from src/lib/demoData.ts so the
// static deploy works; otherwise they hit /api/<resource> via the api client.
import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryResult,
} from "@tanstack/react-query";
import { api } from "../api/client.js";
import { demoData, DEMO_MODE } from "../lib/demoData.js";

export interface PageEnvelope<T> {
  data: T[];
  page: number;
  pageSize: number;
  total: number;
}

function demoPage<T>(resource: string): PageEnvelope<T> {
  const rows = (demoData[resource] ?? []) as T[];
  return { data: rows, page: 1, pageSize: rows.length || 1, total: rows.length };
}

export function useList<T = unknown>(
  resource: string,
  params: Record<string, string | number> = {},
): UseQueryResult<PageEnvelope<T>> {
  const qs = new URLSearchParams(
    Object.entries(params).map(([k, v]) => [k, String(v)]),
  ).toString();
  return useQuery({
    queryKey: [resource, params],
    queryFn: async () => {
      if (DEMO_MODE) return demoPage<T>(resource);
      return api.get<PageEnvelope<T>>(`/${resource}${qs ? `?${qs}` : ""}`);
    },
  });
}

export function useItem<T = unknown>(resource: string, id?: string) {
  return useQuery({
    queryKey: [resource, id],
    enabled: !!id,
    queryFn: async () => {
      if (DEMO_MODE) return (demoData[resource] ?? []).find((r) => r.id === id) as T;
      return api.get<T>(`/${resource}/${id}`);
    },
  });
}

export function useCreate<T = unknown>(resource: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: Partial<T>) => {
      if (DEMO_MODE) return { ...body, id: `demo-${Date.now()}` } as T;
      return api.post<T>(`/${resource}`, body);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [resource] }),
  });
}

export function useUpdate<T = unknown>(resource: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Partial<T> }) => {
      if (DEMO_MODE) return { id, ...patch } as T;
      return api.patch<T>(`/${resource}/${id}`, patch);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [resource] }),
  });
}

export function useRemove(resource: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (DEMO_MODE) return true;
      return api.delete<void>(`/${resource}/${id}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [resource] }),
  });
}
