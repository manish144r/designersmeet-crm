/* Generated from brief/mockups/16-spec-sheet.html via Codex fidelity pass 2026-05-19. Do not hand-edit. */

import { Printer } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const screens = [
  {
    number: "01",
    file: "01-signin.html",
    title: "Sign in",
    description: "SSO trio (Microsoft, Google, Apple) + SAML/OIDC fallback. White card, primary CTA.",
  },
  {
    number: "02",
    file: "02-onboarding.html",
    title: "Onboarding",
    description: "4-step setup wizard. Workspace switcher empty state, M365 connect cards.",
  },
  {
    number: "03",
    file: "03-dashboard.html",
    title: "Dashboard",
    description:
      "4 KPIs (pipeline value, on-track projects, vendor utilization, deliverable cycle) + pipeline chart, activity feed, upcoming deliveries table, today's bookings.",
  },
  {
    number: "04",
    file: "04-contacts.html",
    title: "Contacts list",
    description: "Virtual-scroll table, saved-filter chips, bulk actions, type pills (Client/Vendor/Lead).",
  },
  {
    number: "05",
    file: "05-contact-detail.html",
    title: "Contact detail",
    description:
      "Tabbed shell (Profile/Timeline/Conversations/Opps/Projects/Files). Properties grid + timeline + right rail.",
  },
  {
    number: "06",
    file: "06-vendors.html",
    title: "Vendors list",
    description: "Vendor-specific columns: regions, tier, rating, NDA/MSA status.",
  },
  {
    number: "07",
    file: "07-vendor-detail.html",
    title: "Vendor detail",
    description:
      "Skills, rate card, project history, compliance card (NDA/MSA/GST/Insurance), portfolio thumbs.",
  },
  {
    number: "08",
    file: "08-projects-board.html",
    title: "Projects board",
    description:
      "7-column kanban (Brief to Handover) - the differentiator. Vendor avatars + milestone progress on every card.",
  },
  {
    number: "09",
    file: "09-project-detail.html",
    title: "Project detail",
    description:
      "Milestone bar, deliverable card grid with version history, next-up tasks, assigned vendors, threaded comments.",
  },
  {
    number: "10",
    file: "10-pipelines.html",
    title: "Pipelines kanban",
    description: "5-stage Sales pipeline. Stage totals at top of each column.",
  },
  {
    number: "11",
    file: "11-calendar.html",
    title: "Calendar",
    description: "Week view + public booking page mockup in right rail. M365 calendar overlay.",
  },
  {
    number: "12",
    file: "12-conversations.html",
    title: "Conversations inbox",
    description: "Three-pane: list / thread / context. Channel-aware reply composer (email/WhatsApp/note).",
  },
  {
    number: "13",
    file: "13-workflows.html",
    title: "Workflows builder",
    description: "V1 rule-based linear: trigger to filter to ordered actions. Right inspector configures each step.",
  },
  {
    number: "14",
    file: "14-forms.html",
    title: "Forms builder",
    description:
      "Drag-and-drop field types (left) to canvas (center) to field inspector (right). Workflow trigger callout.",
  },
  {
    number: "15",
    file: "15-settings.html",
    title: "Settings - Integrations",
    description:
      "SSO summary, workspaces card, 8-tile integration grid (M365, Resend, WhatsApp, Google, Shopify, Meta, Stripe, Power Automate).",
  },
] as const;

const waves = [
  {
    title: "Wave 1 (Days 1-5)",
    description: "Auth, scaffold, vendor CRUD, email provider stub, Dashboard placeholder.",
  },
  {
    title: "Wave 2 (Days 6-12)",
    description: "Pipelines, Calendar, Contact detail, Conversations (email), Forms V1.",
  },
  {
    title: "Wave 3 (Days 13-21)",
    description: "Projects + Deliverables + Vendor portal + Workflows + WhatsApp.",
  },
] as const;

function Brand({ label, labelClassName }: { label: string; labelClassName?: string }) {
  return (
    <div className="inline-flex items-center gap-2 text-[14px] font-semibold tracking-normal text-foreground">
      <span className="inline-flex size-[22px] items-center justify-center rounded-[5px] bg-foreground text-[12px] font-bold text-background">
        D
      </span>
      <span className={labelClassName}>{label}</span>
    </div>
  );
}

export default function SpecSheet() {
  return (
    <div className="min-h-screen bg-background text-foreground antialiased">
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-[1200px] px-8 py-10">
          <div className="mb-8 flex items-start justify-between border-b border-border pb-6">
            <div>
              <div className="mb-3">
                <Brand label="DesignersMeet" />
              </div>
              <h1 className="font-display text-[32px] font-semibold tracking-normal text-foreground">
                Vendor Platform - V1 mockup spec sheet
              </h1>
              <p className="mt-2 text-[14px] text-muted">
                15 screens - primary accent - M365-native chrome - for vendor + project stakeholder review.
              </p>
              <div className="mt-3 flex items-center gap-4 text-[12px] text-muted">
                <span>Manish - DesignersMeet HQ</span>
                <span>-</span>
                <span>May 18, 2026</span>
                <span>-</span>
                <span>v0.1 draft</span>
                <span>-</span>
                <span>SPEC.md cross-reference</span>
              </div>
            </div>
            <Button
              type="button"
              onClick={() => window.print()}
              className="h-auto gap-1.5 rounded-md border-primary bg-primary px-3.5 py-[7px] text-[13px] font-medium text-background hover:border-primary-hover hover:bg-primary-hover"
            >
              <Printer className="size-3.5 stroke-[1.75]" aria-hidden="true" />
              Print / save as PDF
            </Button>
          </div>

          <div className="mb-8 grid grid-cols-4 gap-4">
            <Card className="p-4">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-muted">Surfaces</div>
              <div className="mt-2 flex items-center gap-2">
                <div className="size-8 rounded-md border border-border bg-background" />
                <div className="size-8 rounded-md border border-border bg-sidebar" />
                <div className="size-8 rounded-md border border-border bg-subtle" />
              </div>
              <div className="mt-2 text-[11px] text-muted">background - sidebar - subtle</div>
            </Card>

            <Card className="p-4">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-muted">Accent</div>
              <div className="mt-2 flex items-center gap-2">
                <div className="size-8 rounded-md bg-primary" />
                <div className="size-8 rounded-md bg-primary-tint-2" />
                <div className="size-8 rounded-md bg-primary-tint" />
              </div>
              <div className="mt-2 text-[11px] text-muted">primary - primary tint 2 - primary tint</div>
            </Card>

            <Card className="p-4">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-muted">Status</div>
              <div className="mt-2 flex items-center gap-2">
                <div className="size-8 rounded-md bg-success" />
                <div className="size-8 rounded-md bg-warning" />
                <div className="size-8 rounded-md bg-danger" />
                <div className="size-8 rounded-md bg-info" />
              </div>
              <div className="mt-2 text-[11px] text-muted">success - warning - danger - info</div>
            </Card>

            <Card className="p-4">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-muted">Typography</div>
              <div className="font-display mt-1 text-[22px] font-semibold leading-none tracking-normal text-foreground">
                Aa
              </div>
              <div className="mt-2 text-[11px] text-muted">Inter - 12 / 14 / 16 / 20 / 24 / 32</div>
            </Card>
          </div>

          <h2 className="font-display mb-4 text-[18px] font-semibold tracking-normal text-foreground">
            Screen inventory
          </h2>
          <div className="grid grid-cols-3 gap-4">
            {screens.map((screen) => (
              <Card key={screen.number} className="overflow-hidden">
                <div className="flex aspect-[16/10] items-center justify-center border-b border-border bg-gradient-to-br from-subtle to-border-subtle p-4">
                  <Brand label={screen.file} labelClassName="text-[11px] text-muted" />
                </div>
                <div className="p-4">
                  <div className="mb-1 flex items-baseline justify-between gap-3">
                    <div className="text-[13px] font-semibold text-foreground">{screen.title}</div>
                    <div className="font-mono text-[10px] text-muted">{screen.number}</div>
                  </div>
                  <div className="text-[11.5px] leading-snug text-secondary">{screen.description}</div>
                </div>
              </Card>
            ))}
          </div>

          <div className="mt-10 grid grid-cols-3 gap-6 border-t border-border pt-6 text-[12px] text-secondary">
            {waves.map((wave) => (
              <div key={wave.title}>
                <div className="mb-1 font-semibold text-foreground">{wave.title}</div>
                <div>{wave.description}</div>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center text-[11px] text-muted">
            DesignersMeet Vendor Platform - Mockups generated May 18, 2026 - Single source of truth:
            outputs/designersmeet-vendor-platform/SPEC.md
          </div>
        </div>
      </div>
    </div>
  );
}
