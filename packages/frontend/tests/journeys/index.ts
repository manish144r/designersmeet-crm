// 20 user journeys, mapped to the route where the task is ACTUALLY performed
// on the wired demo, with steps = interactions verified to exist there (live
// affordance map, 2026-05-20). This makes a step's pass/fail reflect real app
// behaviour. Genuinely-absent affordances (file upload, real auth) remain
// honest blocks (B-LOCK / B-AUTH) — never remapped to hide a gap.

export interface Journey {
  id: string;
  label: string;
  route: string;
  steps: string[];
  demoBypassed?: boolean;
}

export const journeys: Journey[] = [
  { id: "sign-in", label: "Sign in", route: "/signin", demoBypassed: true,
    steps: ["email-input", "password-input", "primary-cta-click", "form-submit"] },
  { id: "sign-out", label: "Sign out", route: "/dashboard", demoBypassed: true,
    steps: ["icon-button-click", "modal-open", "form-submit"] },
  { id: "profile-update", label: "Update profile", route: "/settings",
    steps: ["text-input", "primary-cta-click", "form-submit"] },
  { id: "password-reset", label: "Reset password", route: "/signin", demoBypassed: true,
    steps: ["email-input", "primary-cta-click", "form-submit"] },
  { id: "add-entity", label: "Add record", route: "/contacts",
    steps: ["primary-cta-click", "modal-open", "text-input", "email-input", "form-submit"] },
  { id: "edit-entity", label: "Edit record", route: "/contacts",
    steps: ["icon-button-click", "modal-open", "text-input", "form-submit"] },
  { id: "delete-entity", label: "Delete record", route: "/contacts",
    steps: ["icon-button-click", "destructive-cta-click", "modal-open", "modal-close"] },
  { id: "search", label: "Search", route: "/contacts",
    steps: ["search-typing", "text-input", "keyboard-tab"] },
  { id: "filter", label: "Filter list", route: "/contacts",
    steps: ["multi-select-input", "secondary-cta-click"] },
  { id: "sort", label: "Sort column", route: "/contacts",
    steps: ["icon-button-click", "scroll"] },
  { id: "paginate", label: "Paginate", route: "/contacts",
    steps: ["secondary-cta-click", "scroll"] },
  { id: "bulk-select", label: "Bulk select", route: "/contacts",
    steps: ["multi-select-input", "icon-button-click"] },
  { id: "export", label: "Export data", route: "/dashboard",
    steps: ["secondary-cta-click", "primary-cta-click"] },
  { id: "import", label: "Import data", route: "/contacts",
    steps: ["secondary-cta-click", "modal-open", "text-input"] },
  { id: "send-message", label: "Send message", route: "/conversations",
    steps: ["text-input", "primary-cta-click", "form-submit"] },
  { id: "schedule-meeting", label: "Schedule meeting", route: "/calendar",
    steps: ["primary-cta-click", "modal-open", "date-input", "text-input", "form-submit"] },
  { id: "upload-file", label: "Upload file", route: "/forms",
    steps: ["file-upload", "primary-cta-click", "form-submit"] },
  { id: "approve", label: "Approve item", route: "/project-detail",
    steps: ["primary-cta-click", "modal-open", "text-input"] },
  { id: "reject", label: "Reject item", route: "/project-detail",
    steps: ["secondary-cta-click", "text-input", "modal-open"] },
  { id: "generate-report", label: "Generate report", route: "/dashboard",
    steps: ["date-input", "primary-cta-click", "scroll"] },
  // exhaustive-ui-walk: methodology fix from feedback_no_decorative_interactive_elements.md.
  // The persona matrix tests journey completion; this journey adds "every
  // clickable-looking element on the route is wired or intentionally inert".
  // Executed via the dedicated D-DECORATIVE probe in decorative-walk.spec.ts
  // (runs as a separate Playwright config — see test:ux:decorative). Listed
  // here so the journey set documentation stays the single source of truth.
  { id: "exhaustive-ui-walk", label: "Exhaustive UI walk (D-DECORATIVE)", route: "/settings",
    steps: ["sidebar-nav", "primary-cta-click", "icon-button-click", "tab-switch"] },

  // ── Wave-A Phase-2 Settings journeys (2026-05-20) ────────────────────────
  // Each journey walks the Settings sub-nav into a specific item, then
  // exercises the panel's primary CRUD/affordance. These journeys lift the
  // sub-items from B-LOCK ("Coming in Phase 2") to PASS / FAIL — they should
  // never block on the missing baseline because the panels render real DOM.
  { id: "walk-audit-log", label: "Settings · Audit log", route: "/settings",
    steps: ["sidebar-nav", "tab-switch", "secondary-cta-click", "scroll"] },
  { id: "walk-workspaces-crud", label: "Settings · Workspaces CRUD", route: "/settings",
    steps: ["sidebar-nav", "tab-switch", "primary-cta-click", "text-input", "form-submit"] },
  { id: "walk-locale-preferences", label: "Settings · Locale & time", route: "/settings",
    steps: ["sidebar-nav", "tab-switch", "multi-select-input", "form-submit"] },
  { id: "walk-teams-crud", label: "Settings · Teams CRUD", route: "/settings",
    steps: ["sidebar-nav", "tab-switch", "primary-cta-click", "text-input", "multi-select-input", "form-submit"] },
  { id: "walk-plan-usage", label: "Settings · Plan & usage", route: "/settings",
    steps: ["sidebar-nav", "tab-switch", "primary-cta-click", "modal-open", "modal-close"] },
  { id: "walk-invoices-pdf-download", label: "Settings · Invoices PDF download", route: "/settings",
    steps: ["sidebar-nav", "tab-switch", "secondary-cta-click"] },
  { id: "walk-vendor-portal", label: "Vendor portal", route: "/vendor",
    steps: ["sidebar-nav", "tab-switch", "text-input", "form-submit"] },
];

export const journeyById = (id: string): Journey | undefined =>
  journeys.find((j) => j.id === id);
