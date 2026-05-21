// BRIEF-24 Part D — Page-level access guard.
// Wrap each page's root element: <PageGuard page="contacts">...</PageGuard>
// If the user's role lacks canView for that page, renders an access-denied
// state instead of the page content. Zero visual change to the page itself.
import { ShieldCheck } from "lucide-react";
import { usePermission } from "../hooks/usePermission.js";

interface Props {
  page: string;
  children: React.ReactNode;
}

export function PageGuard({ page, children }: Props) {
  const canView = usePermission(page, "view");

  if (!canView) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 text-secondary">
        <ShieldCheck size={32} className="text-muted" aria-hidden="true" />
        <p className="text-[14px] font-medium text-foreground">
          You don&apos;t have access to this page.
        </p>
        <p className="text-[12px] text-muted">
          Ask your admin to update your role permissions in Settings → Role permissions.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
