// BRIEF-24 Part C — Sidebar nav-item access guard.
// Per-item usage: <NavGuard page="contacts"><SidebarNavItem .../></NavGuard>
// If the user's role lacks canView for that page, the nav item disappears
// (renders null) instead of showing access-denied chrome — mirrors PageGuard
// shape but stays silent in the sidebar surface.
// When `page` is omitted, NavGuard is a pass-through (used as a top-level
// wrapper around the app tree in main.tsx without changing behaviour).
import { usePermission } from "../hooks/usePermission.js";

interface Props {
  page?: string;
  children: React.ReactNode;
}

export function NavGuard({ page, children }: Props) {
  // Hooks must be called unconditionally — pass an empty page string when
  // omitted; usePermission defaults that to "allow" (no gate).
  const canView = usePermission(page ?? "", "view");
  if (page && !canView) return null;
  return <>{children}</>;
}
