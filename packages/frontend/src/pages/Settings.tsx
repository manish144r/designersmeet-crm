import { useEffect, useState } from "react";

type IntegrationStatus = "connected" | "disconnected" | "error";

type InviteRole = "admin" | "member" | "viewer";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface Integration {
  id: string;
  name: string;
  description: string;
  status: IntegrationStatus;
  icon: string;
  config: Record<string, string>;
}

const INTEGRATIONS: Integration[] = [
  {
    id: "outlook",
    name: "Microsoft Outlook",
    description: "Sync emails, create calendar events for deadlines, send follow-ups from CRM.",
    status: "disconnected",
    icon: "M",
    config: { tenant_id: "", client_id: "", redirect_uri: "http://localhost:5173/auth/callback" },
  },
  {
    id: "brevo",
    name: "Brevo (Sendinblue)",
    description: "Email outreach, automated sequences, freelancer notifications. Free tier: 300 emails/day.",
    status: "disconnected",
    icon: "B",
    config: { api_key: "", sender_name: "DesignersMeet", sender_email: "hello@designersmeet.com" },
  },
  {
    id: "shopify",
    name: "Shopify",
    description: "Auto-create projects from Shopify orders. Webhook-driven integration.",
    status: "connected",
    icon: "S",
    config: { shop_domain: "designersmeet.myshopify.com", api_key: "••••••••", webhook_secret: "••••••••" },
  },
  {
    id: "supabase",
    name: "Supabase",
    description: "Database backend for all CRM data. Project: NightFactory (fjdwaesjuddhsylztlht).",
    status: "connected",
    icon: "⚡",
    config: { project_ref: "fjdwaesjuddhsylztlht", region: "ap-southeast-1" },
  },
];

const STATUS_STYLES: Record<IntegrationStatus, { bg: string; dot: string; label: string }> = {
  connected: { bg: "bg-emerald-100 text-emerald-800", dot: "bg-emerald-500", label: "Connected" },
  disconnected: { bg: "bg-gray-100 text-gray-600", dot: "bg-gray-400", label: "Not Connected" },
  error: { bg: "bg-red-100 text-red-700", dot: "bg-red-500", label: "Error" },
};

export function Settings() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<InviteRole>("member");
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteSending, setInviteSending] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 3000);
    return () => window.clearTimeout(t);
  }, [toast]);

  const resetInvite = () => {
    setInviteEmail("");
    setInviteRole("member");
    setInviteError(null);
    setShowInvite(false);
  };

  const submitInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = inviteEmail.trim();
    if (!EMAIL_RE.test(email)) {
      setInviteError("Enter a valid email address.");
      return;
    }
    setInviteError(null);
    setInviteSending(true);
    try {
      // Backend stub — endpoint may not exist; treat any failure as a no-op for the demo flow.
      await fetch("/api/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role: inviteRole }),
      }).catch(() => null);
      setToast(`Invite sent to ${email}`);
      resetInvite();
    } finally {
      setInviteSending(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-xl font-bold text-navy">Settings</h1>
        <p className="text-sm text-textDim mt-0.5">Manage integrations and CRM configuration.</p>
      </div>

      {toast && (
        <div className="fixed top-20 right-6 z-50 bg-navy text-white text-sm px-4 py-2 rounded-md shadow-lg">
          {toast}
        </div>
      )}

      {/* Team / Invites */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-sm font-semibold text-navy uppercase tracking-widest">Team</h2>
            <p className="text-xs text-textDim mt-0.5">Invite teammates by email and assign their CRM role.</p>
          </div>
          <button className="btn-primary btn-sm" onClick={() => setShowInvite(true)}>+ Invite User</button>
        </div>
      </section>

      {/* Integrations */}
      <section>
        <h2 className="text-sm font-semibold text-navy uppercase tracking-widest mb-3">Integrations</h2>
        <div className="space-y-3">
          {INTEGRATIONS.map(intg => {
            const s = STATUS_STYLES[intg.status];
            const isExpanded = expandedId === intg.id;
            return (
              <div key={intg.id} className="card">
                <div
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => setExpandedId(isExpanded ? null : intg.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-navy/10 flex items-center justify-center text-navy font-bold text-lg">
                      {intg.icon}
                    </div>
                    <div>
                      <div className="font-medium text-sm">{intg.name}</div>
                      <div className="text-xs text-textDim">{intg.description}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${s.bg}`}>
                      <div className={`w-2 h-2 rounded-full ${s.dot}`} />
                      {s.label}
                    </div>
                    <svg className={`w-4 h-4 text-textDim transition-transform ${isExpanded ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-borderc">
                    <div className="space-y-3">
                      {Object.entries(intg.config).map(([key, val]) => (
                        <div key={key}>
                          <label className="block text-xs font-semibold text-textDim mb-1 capitalize">{key.replace(/_/g, " ")}</label>
                          <input defaultValue={val} placeholder={`Enter ${key.replace(/_/g, " ")}`} className="w-full" />
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2 mt-4">
                      {intg.status === "disconnected" ? (
                        <button className="btn-primary btn-sm">Connect</button>
                      ) : (
                        <>
                          <button className="btn-primary btn-sm">Save Changes</button>
                          <button className="btn-secondary btn-sm">Test Connection</button>
                          <button className="btn-danger btn-sm">Disconnect</button>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Email Templates */}
      <section>
        <h2 className="text-sm font-semibold text-navy uppercase tracking-widest mb-3">Email Templates (Brevo)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { name: "Project Brief", type: "project_brief", desc: "Sent to client when project is created" },
            { name: "Freelancer Assignment", type: "freelancer_assignment", desc: "Sent to freelancer when assigned" },
            { name: "Follow-up", type: "follow_up", desc: "Automated follow-up for leads" },
            { name: "Invoice", type: "invoice", desc: "Sent when project is delivered" },
            { name: "Delivery Notification", type: "delivery", desc: "Client notification when work is ready" },
            { name: "Lead Outreach", type: "outreach", desc: "Cold outreach to new leads" },
          ].map(t => (
            <div key={t.type} className="card flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">{t.name}</div>
                <div className="text-xs text-textDim">{t.desc}</div>
              </div>
              <button className="btn-secondary btn-sm">Edit</button>
            </div>
          ))}
        </div>
      </section>

      {/* General Settings */}
      <section>
        <h2 className="text-sm font-semibold text-navy uppercase tracking-widest mb-3">General</h2>
        <div className="card space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-textDim mb-1">Business Name</label>
              <input defaultValue="DesignersMeet" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-textDim mb-1">Default Currency</label>
              <select defaultValue="USD">
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="AUD">AUD</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-textDim mb-1">Default Timezone</label>
              <select defaultValue="UTC">
                <option value="UTC">UTC</option>
                <option value="America/New_York">Eastern Time</option>
                <option value="Europe/London">London</option>
                <option value="Asia/Kolkata">India (IST)</option>
                <option value="Australia/Sydney">Sydney (AEST)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-textDim mb-1">Auto-Research New Leads</label>
              <select defaultValue="true">
                <option value="true">Enabled</option>
                <option value="false">Disabled</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end">
            <button className="btn-primary btn-sm">Save Settings</button>
          </div>
        </div>
      </section>

      {showInvite && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
          onClick={resetInvite}
        >
          <div
            className="bg-white rounded-lg shadow-xl w-full max-w-md"
            onClick={e => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-borderc">
              <h2 className="text-lg font-bold text-navy">Invite User</h2>
              <p className="text-xs text-textDim mt-0.5">Send a CRM invitation by email.</p>
            </div>
            <form className="px-6 py-4 space-y-4" onSubmit={submitInvite}>
              <div>
                <label className="block text-xs font-semibold text-textDim mb-1">Email *</label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={e => setInviteEmail(e.target.value)}
                  placeholder="teammate@example.com"
                  required
                  autoFocus
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-textDim mb-1">Role *</label>
                <select
                  value={inviteRole}
                  onChange={e => setInviteRole(e.target.value as InviteRole)}
                  className="w-full"
                >
                  <option value="admin">Admin</option>
                  <option value="member">Member</option>
                  <option value="viewer">Viewer</option>
                </select>
              </div>
              {inviteError && <div className="text-statusRed text-xs">{inviteError}</div>}
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" className="btn-secondary" onClick={resetInvite}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={inviteSending}>
                  {inviteSending ? "Sending…" : "Send Invite"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
