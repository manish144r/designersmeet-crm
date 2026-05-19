// Persona definitions for the DesignersMeet CRM persona-driven UX suite.
//
// In the deployed Surge preview DEMO_MODE forces a single demo admin (auth is
// bypassed), so per-persona RBAC is NOT enforced by the app. The suite still
// models the *intended* role matrix: when a persona attempts a journey their
// role should not have, the runner records a SKIP with the governance reason
// instead of a false PASS — that gap is itself a UX/security finding.

export type PersonaName =
  | "owner-admin"
  | "vendor"
  | "client"
  | "project-manager"
  | "finance";

export interface Persona {
  name: PersonaName;
  role: string;
  /** Journey ids this role is allowed to perform. */
  permissions: string[];
  /** Ordered journeys this persona realistically runs (subset of permissions). */
  typicalJourneys: string[];
  /** Demo-mode mock credentials (never real). */
  creds: { email: string; password: string };
}

const ALL_JOURNEYS = [
  "sign-in",
  "sign-out",
  "profile-update",
  "password-reset",
  "add-entity",
  "edit-entity",
  "delete-entity",
  "search",
  "filter",
  "sort",
  "paginate",
  "bulk-select",
  "export",
  "import",
  "send-message",
  "schedule-meeting",
  "upload-file",
  "approve",
  "reject",
  "generate-report",
];

export const personas: Persona[] = [
  {
    name: "owner-admin",
    role: "Workspace owner — full access",
    permissions: [...ALL_JOURNEYS],
    typicalJourneys: [
      "sign-in",
      "add-entity",
      "edit-entity",
      "delete-entity",
      "generate-report",
      "export",
      "profile-update",
      "sign-out",
    ],
    creds: { email: "owner@designersmeet.demo", password: "demo-owner-pw" },
  },
  {
    name: "vendor",
    role: "Vendor — manages own projects + deliverables",
    permissions: [
      "sign-in",
      "sign-out",
      "profile-update",
      "password-reset",
      "add-entity",
      "edit-entity",
      "search",
      "filter",
      "sort",
      "paginate",
      "send-message",
      "schedule-meeting",
      "upload-file",
    ],
    typicalJourneys: [
      "sign-in",
      "add-entity",
      "edit-entity",
      "upload-file",
      "send-message",
      "schedule-meeting",
      "sign-out",
    ],
    creds: { email: "vendor@designersmeet.demo", password: "demo-vendor-pw" },
  },
  {
    name: "client",
    role: "Client — views own projects, approves milestones",
    permissions: [
      "sign-in",
      "sign-out",
      "profile-update",
      "password-reset",
      "search",
      "filter",
      "paginate",
      "send-message",
      "approve",
      "reject",
    ],
    typicalJourneys: [
      "sign-in",
      "search",
      "approve",
      "reject",
      "send-message",
      "sign-out",
    ],
    creds: { email: "client@designersmeet.demo", password: "demo-client-pw" },
  },
  {
    name: "project-manager",
    role: "Project manager — cross-vendor coordination",
    permissions: [
      "sign-in",
      "sign-out",
      "profile-update",
      "password-reset",
      "add-entity",
      "edit-entity",
      "delete-entity",
      "search",
      "filter",
      "sort",
      "paginate",
      "bulk-select",
      "send-message",
      "schedule-meeting",
      "approve",
      "reject",
      "generate-report",
    ],
    typicalJourneys: [
      "sign-in",
      "add-entity",
      "edit-entity",
      "schedule-meeting",
      "approve",
      "generate-report",
      "sign-out",
    ],
    creds: { email: "pm@designersmeet.demo", password: "demo-pm-pw" },
  },
  {
    name: "finance",
    role: "Finance — invoicing, payments, reporting",
    permissions: [
      "sign-in",
      "sign-out",
      "profile-update",
      "password-reset",
      "search",
      "filter",
      "sort",
      "paginate",
      "export",
      "import",
      "generate-report",
      "approve",
    ],
    typicalJourneys: [
      "sign-in",
      "generate-report",
      "export",
      "import",
      "approve",
      "sign-out",
    ],
    creds: { email: "finance@designersmeet.demo", password: "demo-finance-pw" },
  },
];

export function personaCan(p: Persona, journeyId: string): boolean {
  return p.permissions.includes(journeyId);
}
