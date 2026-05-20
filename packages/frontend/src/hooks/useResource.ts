// Generic TanStack Query CRUD + domain hooks for any CRM resource.
// DEMO_MODE (default, static surge deploy): resolves from the mutable
// demoStore so every wired button performs real, persistent-for-session CRUD.
// Otherwise: hits /api/<resource> (+ /api/domain/*) via the api client.
import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryResult,
} from "@tanstack/react-query";
import { api } from "../api/client.js";
import { DEMO_MODE, demoStore } from "../lib/demoData.js";

export interface PageEnvelope<T> {
  data: T[];
  page: number;
  pageSize: number;
  total: number;
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
      if (DEMO_MODE) return demoStore.list(resource, params) as PageEnvelope<T>;
      return api.get<PageEnvelope<T>>(`/${resource}${qs ? `?${qs}` : ""}`);
    },
  });
}

export function useItem<T = unknown>(resource: string, id?: string) {
  return useQuery({
    queryKey: [resource, id],
    enabled: !!id,
    queryFn: async () => {
      if (DEMO_MODE) return demoStore.get(resource, id) as T;
      return api.get<T>(`/${resource}/${id}`);
    },
  });
}

// Wave-A: every mutation also invalidates `audit_events` so the Settings >
// Audit log panel updates live without polling. Cheap — single extra query
// invalidation per mutation.
function invalidateMutated(qc: ReturnType<typeof useQueryClient>, resource: string) {
  qc.invalidateQueries({ queryKey: [resource] });
  if (resource !== "audit_events") qc.invalidateQueries({ queryKey: ["audit_events"] });
}

export function useCreate<T = unknown>(resource: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: Partial<T>) => {
      if (DEMO_MODE) return demoStore.create(resource, body as Record<string, unknown>) as T;
      return api.post<T>(`/${resource}`, body);
    },
    onSuccess: () => invalidateMutated(qc, resource),
  });
}

export function useUpdate<T = unknown>(resource: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Partial<T> }) => {
      if (DEMO_MODE)
        return demoStore.update(resource, id, patch as Record<string, unknown>) as T;
      return api.patch<T>(`/${resource}/${id}`, patch);
    },
    onSuccess: () => invalidateMutated(qc, resource),
  });
}

export function useRemove(resource: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (DEMO_MODE) return demoStore.remove(resource, id);
      return api.delete<void>(`/${resource}/${id}`);
    },
    onSuccess: () => invalidateMutated(qc, resource),
  });
}

// ── Domain (non-CRUD) hooks — mirror packages/backend/src/crm/domain.ts ────
export function useMoveProjectStage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      if (DEMO_MODE) return demoStore.moveProjectStage(id, status);
      return api.post(`/domain/projects/${id}/stage`, { status });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["projects"] }),
  });
}

export function useBookSlot() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: Record<string, unknown>) => {
      if (DEMO_MODE) return demoStore.bookSlot(body);
      return api.post(`/domain/calendar/book`, body);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["calendar-events"] }),
  });
}

export function useMergeConversations() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ sourceId, targetId }: { sourceId: string; targetId: string }) => {
      if (DEMO_MODE) return demoStore.mergeConversations(sourceId, targetId);
      return api.post(`/domain/conversations/merge`, { sourceId, targetId });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["conversations"] }),
  });
}

export function useSubmitForm() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      slug,
      payload,
    }: {
      slug: string;
      payload: Record<string, unknown>;
    }) => {
      if (DEMO_MODE) return demoStore.submitForm(slug, payload);
      return api.post(`/domain/forms/${slug}/submit`, { payload });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["form-submissions"] }),
  });
}
