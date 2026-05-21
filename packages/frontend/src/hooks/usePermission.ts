// BRIEF-24 Part B — Role-based permission hook.
// Reads role-permissions from demoStore (or API in prod) for the current
// user's first role, returns whether that role may perform `action` on `page`.
// Admin short-circuits to true — they always have full access.
import { useAuth } from "../auth/AuthProvider.js";
import { useList } from "./useResource.js";

export type Action = "view" | "create" | "edit" | "delete";

interface RolePermission {
  id: string;
  role: string;
  page: string;
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

export function usePermission(page: string, action: Action): boolean {
  const { user } = useAuth();

  // No user → deny
  if (!user) return false;

  // Admin always has full access
  if (user.roles.includes("admin")) return true;

  const role = user.roles[0] ?? "viewer";
  const { data } = useList<RolePermission>("role-permissions", { role, page });
  const perm = data?.data?.[0];

  // No matching permission row → deny
  if (!perm) return false;

  if (action === "view")   return perm.canView;
  if (action === "create") return perm.canCreate;
  if (action === "edit")   return perm.canEdit;
  if (action === "delete") return perm.canDelete;
  return false;
}
