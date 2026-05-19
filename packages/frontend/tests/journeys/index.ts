// 20 user journeys. Each maps to the primary route a user lands on for that
// task and the ordered interaction ids that compose it. `route` targets the
// deployed 16-page CRM. `demoBypassed` journeys cannot truly complete on the
// static Surge preview (no IdP / no server) and are recorded as SKIP with a
// reason rather than a false PASS.

export interface Journey {
  id: string;
  label: string;
  route: string;
  /** Ordered interaction ids exercised by this journey. */
  steps: string[];
  /** True when the static demo deploy structurally cannot complete this. */
  demoBypassed?: boolean;
}

export const journeys: Journey[] = [
  {
    id: "sign-in",
    label: "Sign in",
    route: "/signin",
    steps: ["email-input", "password-input", "primary-cta-click", "form-submit"],
    demoBypassed: true,
  },
  {
    id: "sign-out",
    label: "Sign out",
    route: "/dashboard",
    steps: ["icon-button-click", "modal-open", "destructive-cta-click"],
    demoBypassed: true,
  },
  {
    id: "profile-update",
    label: "Update profile",
    route: "/settings",
    steps: ["text-input", "email-input", "select-input", "primary-cta-click", "form-submit"],
  },
  {
    id: "password-reset",
    label: "Reset password",
    route: "/signin",
    steps: ["email-input", "secondary-cta-click", "form-submit"],
    demoBypassed: true,
  },
  {
    id: "add-entity",
    label: "Add record",
    route: "/contacts",
    steps: ["primary-cta-click", "modal-open", "text-input", "email-input", "form-submit"],
  },
  {
    id: "edit-entity",
    label: "Edit record",
    route: "/contacts",
    steps: ["icon-button-click", "modal-open", "text-input", "form-submit"],
  },
  {
    id: "delete-entity",
    label: "Delete record",
    route: "/contacts",
    steps: ["destructive-cta-click", "modal-open", "destructive-cta-click", "modal-cancel"],
  },
  {
    id: "search",
    label: "Search",
    route: "/contacts",
    steps: ["search-typing", "search-typing", "keyboard-tab"],
  },
  {
    id: "filter",
    label: "Filter list",
    route: "/contacts",
    steps: ["select-input", "multi-select-input", "secondary-cta-click"],
  },
  {
    id: "sort",
    label: "Sort column",
    route: "/contacts",
    steps: ["icon-button-click", "scroll"],
  },
  {
    id: "paginate",
    label: "Paginate",
    route: "/contacts",
    steps: ["secondary-cta-click", "scroll", "secondary-cta-click"],
  },
  {
    id: "bulk-select",
    label: "Bulk select",
    route: "/contacts",
    steps: ["icon-button-click", "icon-button-click", "destructive-cta-click"],
  },
  {
    id: "export",
    label: "Export data",
    route: "/dashboard",
    steps: ["secondary-cta-click", "modal-open", "primary-cta-click"],
  },
  {
    id: "import",
    label: "Import data",
    route: "/contacts",
    steps: ["secondary-cta-click", "modal-open", "file-upload", "form-submit"],
  },
  {
    id: "send-message",
    label: "Send message",
    route: "/conversations",
    steps: ["text-input", "primary-cta-click", "form-submit"],
  },
  {
    id: "schedule-meeting",
    label: "Schedule meeting",
    route: "/calendar",
    steps: ["primary-cta-click", "modal-open", "date-input", "text-input", "form-submit"],
  },
  {
    id: "upload-file",
    label: "Upload file",
    route: "/forms",
    steps: ["file-upload", "primary-cta-click", "form-submit"],
  },
  {
    id: "approve",
    label: "Approve item",
    route: "/dashboard",
    steps: ["primary-cta-click", "modal-open", "primary-cta-click"],
  },
  {
    id: "reject",
    label: "Reject item",
    route: "/dashboard",
    steps: ["destructive-cta-click", "modal-open", "text-input", "destructive-cta-click"],
  },
  {
    id: "generate-report",
    label: "Generate report",
    route: "/dashboard",
    steps: ["select-input", "primary-cta-click", "scroll"],
  },
];

export const journeyById = (id: string): Journey | undefined =>
  journeys.find((j) => j.id === id);
