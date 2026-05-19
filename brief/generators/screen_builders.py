"""Screen-body builders for DesignersMeet mockups.
Each function returns the inner HTML to render inside <main>.
Chromeless screens (signin, spec sheet) return their full-page body.
"""

# ─────────────────────── 1. Sign-in ───────────────────────
def s01_signin():
    return """
  <div class="min-h-screen flex">
    <!-- Left: form -->
    <div class="flex-1 flex flex-col">
      <div class="px-10 py-6 flex items-center justify-between">
        <div class="dm-brand">
          <span class="dm-brand-glyph">D</span>
          <span>DesignersMeet</span>
        </div>
        <div class="text-[13px] text-slate-500">
          Need an account? <a class="text-indigo-600 font-medium hover:underline" href="#">Request access</a>
        </div>
      </div>
      <div class="flex-1 flex items-center justify-center px-6">
        <div class="w-full max-w-[400px]">
          <div class="mb-8">
            <h1 class="font-display text-[28px] font-semibold tracking-tight text-slate-900">Sign in to DesignersMeet</h1>
            <p class="text-[14px] text-slate-500 mt-2">Use your work account to access the vendor platform.</p>
          </div>

          <div class="space-y-2.5">
            <button class="btn-primary w-full justify-center !py-2.5 !text-[14px]">
              <svg viewBox="0 0 21 21" class="w-4 h-4" aria-hidden="true">
                <rect x="1" y="1" width="9" height="9" fill="#F25022"/>
                <rect x="11" y="1" width="9" height="9" fill="#7FBA00"/>
                <rect x="1" y="11" width="9" height="9" fill="#00A4EF"/>
                <rect x="11" y="11" width="9" height="9" fill="#FFB900"/>
              </svg>
              Continue with Microsoft
            </button>

            <button class="btn-secondary w-full justify-center !py-2.5 !text-[14px]">
              <svg viewBox="0 0 24 24" class="w-4 h-4" aria-hidden="true">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22z" fill="#FBBC04"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>

            <button class="btn-secondary w-full justify-center !py-2.5 !text-[14px]">
              <svg viewBox="0 0 24 24" class="w-4 h-4" aria-hidden="true" fill="currentColor">
                <path d="M17.05 12.04c-.03-2.99 2.44-4.43 2.55-4.5-1.39-2.04-3.56-2.32-4.33-2.35-1.84-.19-3.6 1.09-4.54 1.09-.95 0-2.39-1.07-3.93-1.04-2.02.03-3.88 1.18-4.92 2.99-2.1 3.64-.54 9.02 1.51 11.97 1 1.45 2.19 3.07 3.74 3.01 1.5-.06 2.07-.97 3.88-.97 1.81 0 2.31.97 3.89.94 1.61-.03 2.62-1.46 3.6-2.92 1.14-1.67 1.6-3.31 1.63-3.39-.04-.02-3.13-1.2-3.16-4.77zM14.16 3.18c.83-1.01 1.39-2.4 1.24-3.8-1.2.05-2.66.8-3.51 1.8-.77.89-1.45 2.32-1.27 3.69 1.33.1 2.7-.68 3.54-1.69z"/>
              </svg>
              Continue with Apple
            </button>
          </div>

          <div class="flex items-center gap-3 my-6">
            <div class="flex-1 h-px bg-slate-200"></div>
            <span class="text-[11px] uppercase tracking-wider text-slate-400">Or use SSO</span>
            <div class="flex-1 h-px bg-slate-200"></div>
          </div>

          <div class="space-y-3">
            <label class="block">
              <span class="text-[12px] font-medium text-slate-700">Work email</span>
              <input type="email" placeholder="you@yourcompany.com" class="dm-input mt-1.5" />
            </label>
            <button class="btn-secondary w-full justify-center !py-2.5 !text-[14px]">
              <i data-lucide="shield-check" class="icon-sm"></i> Continue with SAML / OIDC
            </button>
          </div>

          <p class="mt-8 text-[12px] text-slate-400 text-center">
            By continuing you agree to the <a class="text-slate-600 hover:underline" href="#">Terms</a> and <a class="text-slate-600 hover:underline" href="#">Privacy policy</a>.
          </p>
        </div>
      </div>
      <div class="px-10 py-5 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-100">
        <span>© 2026 DesignersMeet · v1.0</span>
        <div class="flex items-center gap-4">
          <span>Status: <span class="text-emerald-600 font-medium">All systems normal</span></span>
          <a href="#" class="hover:text-slate-600">Privacy</a>
          <a href="#" class="hover:text-slate-600">Security</a>
        </div>
      </div>
    </div>

    <!-- Right: showcase panel -->
    <div class="hidden lg:flex w-[44%] bg-gradient-to-br from-indigo-50 via-white to-slate-50 border-l border-slate-200 flex-col p-12 relative overflow-hidden">
      <div class="absolute -top-32 -right-32 w-[400px] h-[400px] rounded-full bg-indigo-100 opacity-50 blur-3xl"></div>
      <div class="absolute bottom-0 -left-32 w-[300px] h-[300px] rounded-full bg-indigo-200 opacity-40 blur-3xl"></div>
      <div class="relative z-10 my-auto max-w-[420px]">
        <span class="badge badge-indigo mb-5">Wave 1 · Vendor Platform</span>
        <h2 class="font-display text-[32px] leading-[1.15] font-semibold tracking-tight text-slate-900">
          The CRM your project managers reach for instead of Excel.
        </h2>
        <p class="text-[15px] text-slate-600 mt-4 leading-relaxed">
          Vendor coordination, project delivery, and client conversations — all one workspace, native inside Microsoft 365.
        </p>
        <div class="mt-8 space-y-3">
          <div class="flex items-start gap-3">
            <div class="w-8 h-8 rounded-md bg-white border border-slate-200 flex items-center justify-center text-indigo-600">
              <i data-lucide="layers" class="icon-sm"></i>
            </div>
            <div>
              <div class="text-[13px] font-semibold text-slate-900">Project delivery board</div>
              <div class="text-[12px] text-slate-500">Vendor assignments, deliverables, milestones in one view.</div>
            </div>
          </div>
          <div class="flex items-start gap-3">
            <div class="w-8 h-8 rounded-md bg-white border border-slate-200 flex items-center justify-center text-indigo-600">
              <i data-lucide="mail" class="icon-sm"></i>
            </div>
            <div>
              <div class="text-[13px] font-semibold text-slate-900">Unified conversations</div>
              <div class="text-[12px] text-slate-500">Outlook + Gmail + WhatsApp threaded by contact.</div>
            </div>
          </div>
          <div class="flex items-start gap-3">
            <div class="w-8 h-8 rounded-md bg-white border border-slate-200 flex items-center justify-center text-indigo-600">
              <i data-lucide="zap" class="icon-sm"></i>
            </div>
            <div>
              <div class="text-[13px] font-semibold text-slate-900">M365-native distribution</div>
              <div class="text-[12px] text-slate-500">Outlook add-in, Teams tab, launcher tile — same data.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
    """


# ─────────────────────── 2. Onboarding ───────────────────────
def s02_onboarding():
    return """
  <div class="max-w-[1040px] mx-auto px-8 py-10">
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="font-display text-[24px] font-semibold tracking-tight text-slate-900">Welcome, Manish</h1>
        <p class="text-[14px] text-slate-500 mt-1">Let's set up DesignersMeet HQ. You can come back to any step from Settings.</p>
      </div>
      <button class="btn-ghost text-slate-500">Skip for now</button>
    </div>

    <!-- Progress -->
    <div class="dm-card mb-6">
      <div class="dm-card-body !p-5">
        <div class="flex items-center gap-4">
          <div class="flex items-center gap-2.5 flex-1">
            <span class="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 text-[11px] font-semibold flex items-center justify-center"><i data-lucide="check" class="icon-sm"></i></span>
            <span class="text-[13px] text-slate-900 font-medium">Workspace created</span>
          </div>
          <div class="flex-1 h-px bg-slate-200"></div>
          <div class="flex items-center gap-2.5 flex-1">
            <span class="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-[11px] font-semibold flex items-center justify-center">2</span>
            <span class="text-[13px] text-slate-900 font-medium">Connect Microsoft 365</span>
          </div>
          <div class="flex-1 h-px bg-slate-200"></div>
          <div class="flex items-center gap-2.5 flex-1">
            <span class="w-6 h-6 rounded-full bg-slate-100 text-slate-400 text-[11px] font-semibold flex items-center justify-center">3</span>
            <span class="text-[13px] text-slate-500 font-medium">Import vendors</span>
          </div>
          <div class="flex-1 h-px bg-slate-200"></div>
          <div class="flex items-center gap-2.5 flex-1">
            <span class="w-6 h-6 rounded-full bg-slate-100 text-slate-400 text-[11px] font-semibold flex items-center justify-center">4</span>
            <span class="text-[13px] text-slate-500 font-medium">Invite your team</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Active step -->
    <div class="dm-card mb-6">
      <div class="dm-card-header">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center">
            <svg viewBox="0 0 21 21" class="w-4 h-4">
              <rect x="1" y="1" width="9" height="9" fill="#F25022"/>
              <rect x="11" y="1" width="9" height="9" fill="#7FBA00"/>
              <rect x="1" y="11" width="9" height="9" fill="#00A4EF"/>
              <rect x="11" y="11" width="9" height="9" fill="#FFB900"/>
            </svg>
          </div>
          <div>
            <div class="text-[14px] font-semibold text-slate-900">Connect Microsoft 365</div>
            <div class="text-[12px] text-slate-500">We'll sync Outlook mail, Calendar, and SharePoint files.</div>
          </div>
        </div>
        <button class="btn-primary"><i data-lucide="link" class="icon-sm"></i> Connect tenant</button>
      </div>
      <div class="dm-card-body">
        <div class="grid grid-cols-3 gap-4">
          <div class="border border-slate-200 rounded-lg p-4">
            <i data-lucide="mail" class="icon-lg text-indigo-600 mb-3"></i>
            <div class="text-[13px] font-semibold text-slate-900">Outlook mail</div>
            <div class="text-[12px] text-slate-500 mt-1">Threaded into Conversations inbox.</div>
            <div class="text-[11px] text-slate-400 mt-3">Scopes: Mail.Read, Mail.Send</div>
          </div>
          <div class="border border-slate-200 rounded-lg p-4">
            <i data-lucide="calendar" class="icon-lg text-indigo-600 mb-3"></i>
            <div class="text-[13px] font-semibold text-slate-900">Calendar two-way</div>
            <div class="text-[12px] text-slate-500 mt-1">Booking page writes back to your calendar.</div>
            <div class="text-[11px] text-slate-400 mt-3">Scopes: Calendars.ReadWrite</div>
          </div>
          <div class="border border-slate-200 rounded-lg p-4">
            <i data-lucide="folder" class="icon-lg text-indigo-600 mb-3"></i>
            <div class="text-[13px] font-semibold text-slate-900">SharePoint drive</div>
            <div class="text-[12px] text-slate-500 mt-1">Project files & deliverables live in SharePoint.</div>
            <div class="text-[11px] text-slate-400 mt-3">Scopes: Files.ReadWrite.All</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Workspace switcher empty -->
    <div class="dm-card">
      <div class="dm-card-header">
        <div>
          <div class="text-[14px] font-semibold text-slate-900">Workspaces</div>
          <div class="text-[12px] text-slate-500">You can run multiple workspaces — one per design firm or business unit.</div>
        </div>
        <button class="btn-secondary"><i data-lucide="plus" class="icon-sm"></i> New workspace</button>
      </div>
      <div class="dm-card-body !p-0">
        <div class="px-5 py-4 flex items-center gap-3 border-b border-slate-100">
          <div class="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 text-white text-[12px] font-bold flex items-center justify-center">HQ</div>
          <div class="flex-1">
            <div class="text-[13px] font-semibold text-slate-900">DesignersMeet HQ</div>
            <div class="text-[12px] text-slate-500">12 members · Bengaluru · created today</div>
          </div>
          <span class="badge badge-success badge-dot">Active</span>
          <button class="btn-ghost">Manage</button>
        </div>
        <div class="px-5 py-8 text-center bg-slate-50/40">
          <div class="w-12 h-12 rounded-full bg-white border border-slate-200 flex items-center justify-center mx-auto mb-3 text-slate-400">
            <i data-lucide="building-2" class="icon-lg"></i>
          </div>
          <div class="text-[13px] font-medium text-slate-700">No additional workspaces yet</div>
          <div class="text-[12px] text-slate-500 mt-1">When you add a second design firm or studio, it'll appear here.</div>
        </div>
      </div>
    </div>
  </div>
    """


# ─────────────────────── 3. Dashboard ───────────────────────
def s03_dashboard():
    return """
  <div class="px-8 py-6">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="font-display text-[22px] font-semibold tracking-tight text-slate-900">Dashboard</h1>
        <p class="text-[13px] text-slate-500 mt-1">Monday, May 18 · 12 active projects · 3 deliverables awaiting approval</p>
      </div>
      <div class="flex items-center gap-2">
        <button class="btn-secondary"><i data-lucide="calendar" class="icon-sm"></i> Last 30 days <i data-lucide="chevron-down" class="icon-sm text-slate-400"></i></button>
        <button class="btn-secondary"><i data-lucide="download" class="icon-sm"></i> Export</button>
        <button class="btn-primary"><i data-lucide="plus" class="icon-sm"></i> New project</button>
      </div>
    </div>

    <!-- KPI row -->
    <div class="grid grid-cols-4 gap-4 mb-6">
      <div class="dm-card !p-5">
        <div class="flex items-start justify-between">
          <div class="text-[12px] font-medium text-slate-500 uppercase tracking-wider">Pipeline value</div>
          <i data-lucide="git-branch" class="icon-sm text-slate-300"></i>
        </div>
        <div class="font-display text-[28px] font-semibold text-slate-900 mt-2">₹ 84.2 L</div>
        <div class="flex items-center gap-1.5 text-[12px] mt-1">
          <span class="text-emerald-600 font-medium flex items-center"><i data-lucide="trending-up" class="icon-sm"></i> +12.4%</span>
          <span class="text-slate-400">vs last month</span>
        </div>
      </div>
      <div class="dm-card !p-5">
        <div class="flex items-start justify-between">
          <div class="text-[12px] font-medium text-slate-500 uppercase tracking-wider">Projects on track</div>
          <i data-lucide="layers" class="icon-sm text-slate-300"></i>
        </div>
        <div class="font-display text-[28px] font-semibold text-slate-900 mt-2">9 <span class="text-[16px] text-slate-400 font-normal">/ 12</span></div>
        <div class="flex items-center gap-2 mt-2">
          <div class="dm-progress flex-1"><div style="width:75%"></div></div>
          <span class="text-[11px] text-slate-500">75%</span>
        </div>
      </div>
      <div class="dm-card !p-5">
        <div class="flex items-start justify-between">
          <div class="text-[12px] font-medium text-slate-500 uppercase tracking-wider">Vendor utilization</div>
          <i data-lucide="hard-hat" class="icon-sm text-slate-300"></i>
        </div>
        <div class="font-display text-[28px] font-semibold text-slate-900 mt-2">68%</div>
        <div class="flex items-center gap-1.5 text-[12px] mt-1">
          <span class="text-slate-500">28 of 41 vendors active</span>
        </div>
      </div>
      <div class="dm-card !p-5">
        <div class="flex items-start justify-between">
          <div class="text-[12px] font-medium text-slate-500 uppercase tracking-wider">Deliverable cycle</div>
          <i data-lucide="clock" class="icon-sm text-slate-300"></i>
        </div>
        <div class="font-display text-[28px] font-semibold text-slate-900 mt-2">3.2 <span class="text-[16px] text-slate-400 font-normal">days</span></div>
        <div class="flex items-center gap-1.5 text-[12px] mt-1">
          <span class="text-amber-600 font-medium flex items-center"><i data-lucide="trending-up" class="icon-sm"></i> +0.4d</span>
          <span class="text-slate-400">vs last month</span>
        </div>
      </div>
    </div>

    <!-- Main grid -->
    <div class="grid grid-cols-3 gap-4 mb-6">
      <!-- Chart -->
      <div class="dm-card col-span-2">
        <div class="dm-card-header">
          <div>
            <div class="text-[14px] font-semibold text-slate-900">Pipeline by stage</div>
            <div class="text-[11px] text-slate-500 mt-0.5">Sales pipeline, indexed to expected close date</div>
          </div>
          <div class="flex items-center gap-2">
            <button class="btn-ghost !text-[12px]">Last 30 days</button>
            <button class="btn-icon"><i data-lucide="more-horizontal" class="icon-sm"></i></button>
          </div>
        </div>
        <div class="dm-card-body">
          <div class="h-[200px] relative flex items-end gap-4 px-4">
            """ + _chart_bars() + """
          </div>
          <div class="grid grid-cols-5 gap-4 px-4 mt-3 text-center">
            <div><div class="text-[11px] text-slate-500">New</div><div class="text-[13px] font-semibold text-slate-900">₹ 12L</div></div>
            <div><div class="text-[11px] text-slate-500">Qualified</div><div class="text-[13px] font-semibold text-slate-900">₹ 18L</div></div>
            <div><div class="text-[11px] text-slate-500">Brief</div><div class="text-[13px] font-semibold text-slate-900">₹ 22L</div></div>
            <div><div class="text-[11px] text-slate-500">Proposal</div><div class="text-[13px] font-semibold text-slate-900">₹ 16L</div></div>
            <div><div class="text-[11px] text-slate-500">Won</div><div class="text-[13px] font-semibold text-emerald-600">₹ 16.2L</div></div>
          </div>
        </div>
      </div>

      <!-- Recent activity -->
      <div class="dm-card">
        <div class="dm-card-header">
          <div class="text-[14px] font-semibold text-slate-900">Recent activity</div>
          <button class="btn-ghost !text-[12px]">See all</button>
        </div>
        <div class="dm-card-body !p-0">
          """ + _activity_feed() + """
        </div>
      </div>
    </div>

    <!-- Bottom row -->
    <div class="grid grid-cols-3 gap-4">
      <!-- Upcoming deliveries -->
      <div class="dm-card col-span-2">
        <div class="dm-card-header">
          <div class="text-[14px] font-semibold text-slate-900">Upcoming deliveries this week</div>
          <button class="btn-ghost !text-[12px]">View all projects</button>
        </div>
        <div class="dm-card-body !p-0">
          <table class="dm-table">
            <thead>
              <tr><th>Deliverable</th><th>Project</th><th>Vendor</th><th>Due</th><th>Status</th></tr>
            </thead>
            <tbody>
              <tr>
                <td><span class="font-medium text-slate-900">Concept board v3</span></td>
                <td><span class="text-slate-600">Brand Refresh — Lumen Café</span></td>
                <td><div class="flex items-center gap-2">""" + _avatar("AS", "b", "sm") + """<span class="text-slate-700">Aurora Studio</span></div></td>
                <td><span class="text-slate-500">Wed, May 20</span></td>
                <td><span class="status-pill status-design">In review</span></td>
              </tr>
              <tr>
                <td><span class="font-medium text-slate-900">Carpentry shop drawings</span></td>
                <td><span class="text-slate-600">Indiranagar Loft Reno</span></td>
                <td><div class="flex items-center gap-2">""" + _avatar("MK", "c", "sm") + """<span class="text-slate-700">Manjunath Karpenter Co</span></div></td>
                <td><span class="text-slate-500">Thu, May 21</span></td>
                <td><span class="status-pill status-procurement">On track</span></td>
              </tr>
              <tr>
                <td><span class="font-medium text-slate-900">Electrical load schedule</span></td>
                <td><span class="text-slate-600">HSR Penthouse</span></td>
                <td><div class="flex items-center gap-2">""" + _avatar("VE", "e", "sm") + """<span class="text-slate-700">Voltek Electricals</span></div></td>
                <td><span class="text-amber-600 font-medium">Tomorrow</span></td>
                <td><span class="status-pill status-snag">Blocked</span></td>
              </tr>
              <tr>
                <td><span class="font-medium text-slate-900">Final 3D walkthrough</span></td>
                <td><span class="text-slate-600">Whitefield Villa</span></td>
                <td><div class="flex items-center gap-2">""" + _avatar("RB", "f", "sm") + """<span class="text-slate-700">Render Boutique</span></div></td>
                <td><span class="text-slate-500">Fri, May 22</span></td>
                <td><span class="status-pill status-design">In review</span></td>
              </tr>
              <tr>
                <td><span class="font-medium text-slate-900">Snag list — site visit 4</span></td>
                <td><span class="text-slate-600">JP Nagar Bungalow</span></td>
                <td><div class="flex items-center gap-2">""" + _avatar("MS", "a", "sm") + """<span class="text-slate-700">Manish (PM)</span></div></td>
                <td><span class="text-slate-500">Fri, May 22</span></td>
                <td><span class="status-pill status-handover">Approved</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Today / This week -->
      <div class="dm-card">
        <div class="dm-card-header">
          <div class="text-[14px] font-semibold text-slate-900">Today's bookings</div>
          <button class="btn-ghost !text-[12px]">Calendar</button>
        </div>
        <div class="dm-card-body !p-0">
          <div class="divide-y divide-slate-100">
            <div class="px-5 py-3 flex items-start gap-3">
              <div class="text-center flex-shrink-0">
                <div class="text-[11px] text-slate-500">11:00</div>
                <div class="text-[10px] text-slate-400">AM</div>
              </div>
              <div class="flex-1 min-w-0">
                <div class="text-[13px] font-medium text-slate-900 truncate">Site walk-through</div>
                <div class="text-[12px] text-slate-500 truncate">Priya Raghavan · HSR Penthouse</div>
              </div>
              <span class="badge badge-indigo">in 1h</span>
            </div>
            <div class="px-5 py-3 flex items-start gap-3">
              <div class="text-center flex-shrink-0">
                <div class="text-[11px] text-slate-500">2:30</div>
                <div class="text-[10px] text-slate-400">PM</div>
              </div>
              <div class="flex-1 min-w-0">
                <div class="text-[13px] font-medium text-slate-900 truncate">Vendor sync — Aurora</div>
                <div class="text-[12px] text-slate-500 truncate">Concept board review</div>
              </div>
              <span class="badge badge-neutral">Teams</span>
            </div>
            <div class="px-5 py-3 flex items-start gap-3">
              <div class="text-center flex-shrink-0">
                <div class="text-[11px] text-slate-500">4:00</div>
                <div class="text-[10px] text-slate-400">PM</div>
              </div>
              <div class="flex-1 min-w-0">
                <div class="text-[13px] font-medium text-slate-900 truncate">Brief discovery — Suri Family</div>
                <div class="text-[12px] text-slate-500 truncate">Lead → Qualified</div>
              </div>
              <span class="badge badge-neutral">Outlook</span>
            </div>
            <div class="px-5 py-3 flex items-start gap-3">
              <div class="text-center flex-shrink-0">
                <div class="text-[11px] text-slate-500">5:30</div>
                <div class="text-[10px] text-slate-400">PM</div>
              </div>
              <div class="flex-1 min-w-0">
                <div class="text-[13px] font-medium text-slate-900 truncate">Weekly PM stand-up</div>
                <div class="text-[12px] text-slate-500 truncate">Internal · all PMs</div>
              </div>
              <span class="badge badge-neutral">Teams</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
    """


def _avatar(initials, variant, size=""):
    cls = f"avatar avatar-{variant}"
    if size: cls += f" avatar-{size}"
    return f'<div class="{cls}">{initials}</div>'


def _chart_bars():
    bars = [
        ("New", 35, "#94A3B8"),
        ("Qualified", 50, "#94A3B8"),
        ("Brief", 70, "#6366F1"),
        ("Proposal", 55, "#6366F1"),
        ("Won", 80, "#10B981"),
    ]
    out = []
    for label, pct, color in bars:
        out.append(f'<div class="flex-1 flex flex-col items-center gap-2"><div class="w-full max-w-[64px] rounded-t-md transition-all" style="height:{pct}%; background:{color}"></div></div>')
    return "".join(out)


def _activity_feed():
    items = [
        ("MS", "a", "Manish", "approved deliverable", "Concept board v2", "Brand Refresh — Lumen Café", "5m"),
        ("AS", "b", "Aurora Studio", "uploaded", "Concept board v3.pdf", "Brand Refresh — Lumen Café", "22m"),
        ("PR", "d", "Priya Raghavan", "replied to", "RE: Snag list review", "HSR Penthouse", "1h"),
        ("VE", "e", "Voltek Electricals", "marked task blocked", "Awaiting MCB spec confirmation", "HSR Penthouse", "2h"),
        ("MK", "c", "Manjunath Karpenter Co", "accepted assignment", "Carpentry — Phase 1", "Indiranagar Loft Reno", "4h"),
    ]
    out = []
    for ini, var, name, action, target, project, when in items:
        out.append(f"""
            <div class="px-5 py-3.5 flex items-start gap-3 border-b border-slate-100 last:border-b-0">
              {_avatar(ini, var, "sm")}
              <div class="flex-1 min-w-0">
                <div class="text-[12.5px] leading-snug text-slate-700">
                  <span class="font-medium text-slate-900">{name}</span> {action}
                  <span class="font-medium text-slate-900">{target}</span>
                </div>
                <div class="text-[11px] text-slate-400 mt-0.5">{project} · {when} ago</div>
              </div>
            </div>
        """)
    return "".join(out)


# ─────────────────────── 4. Contacts list ───────────────────────
def s04_contacts_list():
    rows = [
        ("PR","d","Priya Raghavan","priya@lumencafe.in","Client","HSR Penthouse",  "Anita M.",  "2d ago", "Hot lead"),
        ("AS","b","Aurora Studio", "hello@aurorastudio.in","Vendor","3 active projects","Manish",   "5h ago", "Tier-1 partner"),
        ("SK","f","Suri Kapoor",   "suri@example.com",      "Lead","—",            "Manish",   "Today",  "Discovery scheduled"),
        ("MK","c","Manjunath Karpenter Co","manju@mkcarp.com","Vendor","2 active projects","Rohit", "1d ago", "Carpentry"),
        ("VE","e","Voltek Electricals","ops@voltek.in",     "Vendor","1 active project","Rohit",  "4h ago", "Electrical"),
        ("LR","g","Lakshmi & Ravi","lakshmi.ravi@gmail.com","Client","JP Nagar Bungalow","Anita M.","3d ago", "Repeat client"),
        ("RB","f","Render Boutique","studio@renderboutique.co","Vendor","Whitefield Villa","Manish","6h ago","3D + VR"),
        ("DN","h","Deepa Nair",    "deepa.nair@kestrel.in", "Client","Brand Refresh — Lumen Café","Manish","Today","Approved concept"),
        ("FT","a","FabTextiles",   "orders@fabtextiles.in",  "Vendor","Indiranagar Loft Reno","Anita M.","1w ago","Soft furnishings"),
        ("AK","b","Arjun Kapoor",  "arjun.k@signalpoint.com","Lead","—",           "Rohit",    "2d ago", "Cold inbound"),
        ("MN","c","Marble & Stone Mart","sales@msmart.in",  "Vendor","JP Nagar Bungalow","Anita M.","4d ago","Stone supplier"),
        ("PG","d","Priti Goyal",   "priti@studiosaffron.in","Client","—",          "Anita M.", "1w ago", "Past client"),
    ]
    rows_html = ""
    for ini,var,name,email,kind,proj,owner,seen,tag in rows:
        kind_pill = {
            "Client":  '<span class="badge badge-info">Client</span>',
            "Vendor":  '<span class="badge badge-indigo">Vendor</span>',
            "Lead":    '<span class="badge badge-warning">Lead</span>',
        }[kind]
        rows_html += f"""
              <tr>
                <td><input type="checkbox" class="rounded border-slate-300" /></td>
                <td>
                  <div class="flex items-center gap-3">
                    {_avatar(ini, var, "sm")}
                    <div>
                      <div class="font-medium text-slate-900">{name}</div>
                      <div class="text-[11px] text-slate-500">{email}</div>
                    </div>
                  </div>
                </td>
                <td>{kind_pill}</td>
                <td><span class="text-slate-600">{proj}</span></td>
                <td><span class="badge badge-neutral">{tag}</span></td>
                <td><span class="text-slate-600">{owner}</span></td>
                <td><span class="text-slate-500">{seen}</span></td>
                <td class="text-right">
                  <button class="btn-icon"><i data-lucide="more-horizontal" class="icon-sm"></i></button>
                </td>
              </tr>
        """

    return """
  <div class="flex flex-col h-full">
    <div class="px-8 pt-6 pb-3 flex items-center justify-between">
      <div>
        <h1 class="font-display text-[22px] font-semibold tracking-tight text-slate-900">Contacts</h1>
        <p class="text-[13px] text-slate-500 mt-0.5">2,438 records · 41 vendors · 312 clients · 89 open leads</p>
      </div>
      <div class="flex items-center gap-2">
        <button class="btn-secondary"><i data-lucide="upload" class="icon-sm"></i> Import CSV</button>
        <button class="btn-secondary"><i data-lucide="download" class="icon-sm"></i> Export</button>
        <button class="btn-primary"><i data-lucide="plus" class="icon-sm"></i> New contact</button>
      </div>
    </div>

    <!-- Saved filter chips -->
    <div class="px-8 pb-3 flex items-center gap-2 border-b border-slate-100">
      <button class="badge badge-indigo">All <span class="text-indigo-400 ml-1">2,438</span></button>
      <button class="badge badge-neutral hover:bg-slate-200">Clients <span class="text-slate-400 ml-1">312</span></button>
      <button class="badge badge-neutral hover:bg-slate-200">Vendors <span class="text-slate-400 ml-1">41</span></button>
      <button class="badge badge-neutral hover:bg-slate-200">Open leads <span class="text-slate-400 ml-1">89</span></button>
      <button class="badge badge-neutral hover:bg-slate-200">Tier-1 partners <span class="text-slate-400 ml-1">7</span></button>
      <button class="badge badge-neutral hover:bg-slate-200">+ Saved filter</button>
    </div>

    <!-- Filter bar -->
    <div class="px-8 py-3 flex items-center gap-2 border-b border-slate-200 bg-slate-50/40">
      <div class="dm-search w-[280px]">
        <i data-lucide="search"></i>
        <input placeholder="Filter contacts…" />
      </div>
      <button class="btn-secondary !text-[12px]"><i data-lucide="filter" class="icon-sm"></i> Type: Any <i data-lucide="chevron-down" class="icon-sm text-slate-400"></i></button>
      <button class="btn-secondary !text-[12px]">Tag: Any <i data-lucide="chevron-down" class="icon-sm text-slate-400"></i></button>
      <button class="btn-secondary !text-[12px]">Owner: Anyone <i data-lucide="chevron-down" class="icon-sm text-slate-400"></i></button>
      <button class="btn-secondary !text-[12px]">Last seen: 30 days <i data-lucide="chevron-down" class="icon-sm text-slate-400"></i></button>
      <button class="btn-ghost !text-[12px]"><i data-lucide="plus" class="icon-sm"></i> Add filter</button>
      <div class="flex-1"></div>
      <button class="btn-ghost !text-[12px]"><i data-lucide="bookmark" class="icon-sm"></i> Save view</button>
      <div class="flex items-center bg-white border border-slate-300 rounded-md">
        <button class="px-2 py-1.5 text-indigo-600 bg-indigo-50 rounded-l-md"><i data-lucide="list" class="icon-sm"></i></button>
        <button class="px-2 py-1.5 text-slate-400 hover:text-slate-600"><i data-lucide="layout-grid" class="icon-sm"></i></button>
      </div>
    </div>

    <!-- Table -->
    <div class="flex-1 overflow-auto">
      <table class="dm-table">
        <thead>
          <tr>
            <th style="width:32px"><input type="checkbox" class="rounded border-slate-300" /></th>
            <th>Name</th>
            <th>Type</th>
            <th>Active project</th>
            <th>Tag</th>
            <th>Owner</th>
            <th>Last contact</th>
            <th></th>
          </tr>
        </thead>
        <tbody>""" + rows_html + """</tbody>
      </table>
    </div>

    <!-- Footer -->
    <div class="px-8 py-3 border-t border-slate-200 flex items-center justify-between bg-white">
      <div class="text-[12px] text-slate-500">Showing 1–12 of 2,438</div>
      <div class="flex items-center gap-1">
        <button class="btn-icon" disabled><i data-lucide="chevron-left" class="icon-sm text-slate-300"></i></button>
        <button class="btn-secondary !text-[12px] !px-2 bg-indigo-50 !border-indigo-200 text-indigo-700">1</button>
        <button class="btn-ghost !text-[12px] !px-2">2</button>
        <button class="btn-ghost !text-[12px] !px-2">3</button>
        <span class="text-slate-400 text-[12px] px-1">…</span>
        <button class="btn-ghost !text-[12px] !px-2">204</button>
        <button class="btn-icon"><i data-lucide="chevron-right" class="icon-sm"></i></button>
      </div>
    </div>
  </div>
    """


# ─────────────────────── 5. Contact detail (Client) ───────────────────────
def s05_contact_detail():
    return """
  <div class="flex h-full">
    <div class="flex-1 overflow-auto">
      <!-- Header -->
      <div class="px-8 pt-6 pb-4 border-b border-slate-100">
        <div class="flex items-start gap-4">
          """ + _avatar("PR", "d", "xl") + """
          <div class="flex-1">
            <div class="flex items-center gap-3">
              <h1 class="font-display text-[24px] font-semibold tracking-tight text-slate-900">Priya Raghavan</h1>
              <span class="badge badge-info">Client</span>
              <span class="badge badge-success badge-dot">Active</span>
            </div>
            <div class="text-[13px] text-slate-500 mt-1">Founder · Lumen Café · Bengaluru · Owner: Anita M.</div>
            <div class="flex items-center gap-4 mt-3 text-[12px] text-slate-600">
              <span class="flex items-center gap-1.5"><i data-lucide="mail" class="icon-sm text-slate-400"></i> priya@lumencafe.in</span>
              <span class="flex items-center gap-1.5"><i data-lucide="phone" class="icon-sm text-slate-400"></i> +91 98450 12345</span>
              <span class="flex items-center gap-1.5"><i data-lucide="map-pin" class="icon-sm text-slate-400"></i> HSR Layout</span>
              <span class="flex items-center gap-1.5"><i data-lucide="building" class="icon-sm text-slate-400"></i> Lumen Café Pvt. Ltd.</span>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <button class="btn-secondary"><i data-lucide="phone" class="icon-sm"></i> Call</button>
            <button class="btn-secondary"><i data-lucide="mail" class="icon-sm"></i> Email</button>
            <button class="btn-primary"><i data-lucide="plus" class="icon-sm"></i> Log activity</button>
            <button class="btn-icon"><i data-lucide="more-horizontal" class="icon-sm"></i></button>
          </div>
        </div>
        <div class="dm-tabs mt-5">
          <div class="dm-tab" data-active="true">Profile</div>
          <div class="dm-tab">Timeline <span class="badge badge-neutral ml-1">42</span></div>
          <div class="dm-tab">Conversations <span class="badge badge-neutral ml-1">7</span></div>
          <div class="dm-tab">Opportunities <span class="badge badge-neutral ml-1">2</span></div>
          <div class="dm-tab">Projects <span class="badge badge-neutral ml-1">1</span></div>
          <div class="dm-tab">Files <span class="badge badge-neutral ml-1">14</span></div>
          <div class="dm-tab">Custom fields</div>
        </div>
      </div>

      <!-- Body: two columns -->
      <div class="grid grid-cols-3 gap-6 px-8 py-6">
        <div class="col-span-2 space-y-4">
          <!-- Properties -->
          <div class="dm-card">
            <div class="dm-card-header">
              <div class="text-[13px] font-semibold text-slate-900">Properties</div>
              <button class="btn-ghost !text-[12px]"><i data-lucide="pencil" class="icon-sm"></i> Edit</button>
            </div>
            <div class="dm-card-body !p-0">
              """ + _props_grid([
                  ("Lifecycle stage", "Customer", "info"),
                  ("Lead source", "Referral · Designed by V.", None),
                  ("First contact", "Mar 4, 2026", None),
                  ("Last contact", "May 16, 2026 (2 days ago)", None),
                  ("Lifetime value", "₹ 18.4 L", None),
                  ("Birthday", "Aug 22", None),
                  ("Tags", "Hot lead · Café · F&B", None),
                  ("Preferred channel", "WhatsApp", "success"),
              ]) + """
            </div>
          </div>

          <!-- Timeline -->
          <div class="dm-card">
            <div class="dm-card-header">
              <div class="flex items-center gap-3">
                <div class="text-[13px] font-semibold text-slate-900">Recent timeline</div>
                <div class="flex items-center gap-1">
                  <span class="badge badge-neutral">All</span>
                  <span class="badge badge-neutral">Emails</span>
                  <span class="badge badge-neutral">Notes</span>
                  <span class="badge badge-neutral">Calls</span>
                </div>
              </div>
              <button class="btn-ghost !text-[12px]">Full timeline</button>
            </div>
            <div class="dm-card-body !p-0">
              """ + _timeline_items() + """
            </div>
          </div>
        </div>

        <!-- Right rail -->
        <div class="col-span-1 space-y-4">
          <div class="dm-card">
            <div class="dm-card-header"><div class="text-[13px] font-semibold text-slate-900">Active project</div></div>
            <div class="dm-card-body">
              <div class="text-[14px] font-semibold text-slate-900">Brand Refresh — Lumen Café</div>
              <div class="text-[12px] text-slate-500 mt-0.5">Started Mar 12 · Target Jun 30</div>
              <div class="mt-3">
                <div class="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                  <span>Design phase</span><span>62%</span>
                </div>
                <div class="dm-progress"><div style="width:62%"></div></div>
              </div>
              <div class="mt-4 flex items-center justify-between">
                <span class="status-pill status-design">Design</span>
                <button class="btn-ghost !text-[12px]">Open project →</button>
              </div>
            </div>
          </div>

          <div class="dm-card">
            <div class="dm-card-header"><div class="text-[13px] font-semibold text-slate-900">Upcoming</div></div>
            <div class="dm-card-body !p-0">
              <div class="px-4 py-3 border-b border-slate-100">
                <div class="text-[12px] text-slate-500">Today, 11:00 AM</div>
                <div class="text-[13px] font-medium text-slate-900 mt-0.5">Site walk-through</div>
                <div class="text-[11px] text-slate-500 mt-0.5">HSR Penthouse · 1h</div>
              </div>
              <div class="px-4 py-3 border-b border-slate-100">
                <div class="text-[12px] text-slate-500">Wed, May 20</div>
                <div class="text-[13px] font-medium text-slate-900 mt-0.5">Concept board approval</div>
                <div class="text-[11px] text-slate-500 mt-0.5">Async — link sent</div>
              </div>
              <div class="px-4 py-3">
                <div class="text-[12px] text-slate-500">Mon, Jun 2</div>
                <div class="text-[13px] font-medium text-slate-900 mt-0.5">Material samples review</div>
                <div class="text-[11px] text-slate-500 mt-0.5">In-studio · 90 min</div>
              </div>
            </div>
          </div>

          <div class="dm-card">
            <div class="dm-card-header"><div class="text-[13px] font-semibold text-slate-900">Attachments</div></div>
            <div class="dm-card-body !p-0">
              """ + _file_row("Brief deck v2.pptx", "Manish · Mar 14", "ppt") + """
              """ + _file_row("Lumen — concept board v2.pdf", "Aurora Studio · May 12", "pdf") + """
              """ + _file_row("Site survey photos.zip", "Rohit · Apr 8", "zip") + """
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
    """


def _props_grid(items):
    out = []
    for i, (label, value, badge) in enumerate(items):
        last = "border-b-0" if i >= len(items) - 2 else ""
        if i % 2 == 0:
            out.append(f'<div class="grid grid-cols-2 border-b border-slate-100 {last}">')
        val_html = value
        if badge:
            val_html = f'<span class="badge badge-{badge}">{value}</span>'
        else:
            val_html = f'<span class="text-slate-700">{value}</span>'
        out.append(f"""
          <div class="px-5 py-3 border-r border-slate-100 last:border-r-0">
            <div class="text-[11px] text-slate-500 uppercase tracking-wider mb-1">{label}</div>
            <div class="text-[13px]">{val_html}</div>
          </div>""")
        if i % 2 == 1:
            out.append('</div>')
    if len(items) % 2 == 1:
        out.append('</div>')
    return "".join(out)


def _timeline_items():
    items = [
        ("mail", "indigo", "Email · Inbound", "RE: Lumen concept board v2", "Looks gorgeous. Two small tweaks — the brass detail above the bar and the cane chair fabric. Otherwise approved!", "Yesterday at 4:21 PM"),
        ("phone", "info", "Call · 18 min", "Discussion about concept board", "Walked through tweaks. Confirmed Pune install timeline still holds.", "Yesterday at 3:30 PM"),
        ("file", "warning", "File uploaded", "Aurora Studio shared concept board v2.pdf", "—", "May 16 at 10:02 AM"),
        ("sticky-note", "neutral", "Internal note · Manish", "Priya mentioned a second outlet in Pune — flag for cross-sell after this project closes.", "—", "May 15 at 7:42 PM"),
        ("calendar", "success", "Meeting · 60 min", "Site walk-through · HSR Penthouse", "Recorded in Teams.", "May 12 at 11:00 AM"),
    ]
    out = []
    for icon, color, kind, title, body, when in items:
        out.append(f"""
            <div class="px-5 py-4 flex gap-3 border-b border-slate-100 last:border-b-0">
              <div class="w-7 h-7 rounded-full bg-{color}-50 text-{color}-600 flex items-center justify-center flex-shrink-0" style="background:var(--accent-tint);color:var(--accent)">
                <i data-lucide="{icon}" class="icon-sm"></i>
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 text-[11px] text-slate-500 uppercase tracking-wider">
                  <span>{kind}</span><span>·</span><span>{when}</span>
                </div>
                <div class="text-[13px] font-medium text-slate-900 mt-1">{title}</div>
                {f'<div class="text-[12.5px] text-slate-600 mt-1 leading-relaxed">{body}</div>' if body != "—" else ""}
              </div>
            </div>
        """)
    return "".join(out)


def _file_row(name, meta, kind):
    icons = {"pdf": "file-text", "ppt": "presentation", "zip": "archive", "doc": "file-text", "img": "image"}
    return f"""
        <div class="px-4 py-2.5 flex items-center gap-3 border-b border-slate-100 last:border-b-0 hover:bg-slate-50/40">
          <div class="w-8 h-8 rounded-md bg-slate-100 text-slate-500 flex items-center justify-center"><i data-lucide="{icons.get(kind, 'file')}" class="icon-sm"></i></div>
          <div class="flex-1 min-w-0">
            <div class="text-[12.5px] font-medium text-slate-900 truncate">{name}</div>
            <div class="text-[11px] text-slate-500 truncate">{meta}</div>
          </div>
          <button class="btn-icon"><i data-lucide="download" class="icon-sm"></i></button>
        </div>
    """


# ─────────────────────── 6. Vendors list ───────────────────────
def s06_vendors_list():
    vendors = [
        ("AS","b","Aurora Studio",         "Concept · 3D viz · Brand",     ["KA","TN"], 4.9, 12, "Yes", "Tier-1", "Active"),
        ("MK","c","Manjunath Karpenter Co","Carpentry · Modular",          ["KA"],      4.7,  8, "Yes", "Tier-1", "Active"),
        ("VE","e","Voltek Electricals",    "Electrical · Smart home",      ["KA"],      4.5,  6, "Yes", "Tier-2", "Active"),
        ("RB","f","Render Boutique",       "3D · VR walk-throughs",        ["KA","MH"], 4.8,  4, "Yes", "Tier-1", "Active"),
        ("FT","a","FabTextiles",           "Soft furnishings · Drapery",   ["KA","TN"], 4.6, 11, "Yes", "Tier-2", "Active"),
        ("MN","c","Marble & Stone Mart",   "Stone · Marble · Granite",     ["KA"],      4.4,  9, "Yes", "Tier-2", "Active"),
        ("PP","d","Plumbline Pros",        "Plumbing · Sanitaryware",      ["KA"],      4.2,  3, "Yes", "Tier-3", "Active"),
        ("LP","g","Light & Form",          "Lighting · Fixtures",          ["KA","MH"], 4.7,  5, "Yes", "Tier-1", "Active"),
        ("WB","h","Woodbarn Joinery",      "Joinery · Veneers",            ["KA"],      4.3,  4, "Yes", "Tier-2", "Paused"),
        ("AC","b","AC Climate Solutions",  "HVAC · Climate",               ["KA"],      4.1,  2, "Pending", "Tier-3", "Onboarding"),
        ("PS","f","Patel Steel Fab",       "Metalwork · Steel",            ["KA","MH"], 4.5,  6, "Yes", "Tier-2", "Active"),
        ("GF","e","Green Foliage Co",      "Landscaping · Planters",       ["KA"],      4.6,  3, "Yes", "Tier-2", "Active"),
    ]
    rows = ""
    for ini,var,name,skills,regions,rating,projs,nda,tier,status in vendors:
        region_html = " ".join(f'<span class="badge badge-neutral !text-[10px]">{r}</span>' for r in regions)
        tier_color = {"Tier-1": "indigo", "Tier-2": "info", "Tier-3": "neutral"}[tier]
        status_html = {"Active":'<span class="badge badge-success badge-dot">Active</span>',
                       "Paused":'<span class="badge badge-warning badge-dot">Paused</span>',
                       "Onboarding":'<span class="badge badge-info badge-dot">Onboarding</span>'}[status]
        nda_html = '<span class="text-emerald-600 inline-flex items-center gap-1"><i data-lucide="shield-check" class="icon-sm"></i> Signed</span>' if nda == "Yes" else '<span class="text-amber-600">Pending</span>'
        rows += f"""
              <tr>
                <td><input type="checkbox" class="rounded border-slate-300" /></td>
                <td>
                  <div class="flex items-center gap-3">
                    {_avatar(ini, var, "sm")}
                    <div>
                      <div class="font-medium text-slate-900">{name}</div>
                      <div class="text-[11px] text-slate-500">{skills}</div>
                    </div>
                  </div>
                </td>
                <td><div class="flex flex-wrap gap-1">{region_html}</div></td>
                <td><span class="badge badge-{tier_color}">{tier}</span></td>
                <td>
                  <div class="flex items-center gap-1.5">
                    <i data-lucide="star" class="icon-sm text-amber-400" style="fill:currentColor"></i>
                    <span class="font-medium text-slate-900">{rating}</span>
                    <span class="text-slate-400 text-[11px]">({projs})</span>
                  </div>
                </td>
                <td>{nda_html}</td>
                <td>{status_html}</td>
                <td class="text-right"><button class="btn-icon"><i data-lucide="more-horizontal" class="icon-sm"></i></button></td>
              </tr>
        """

    return """
  <div class="flex flex-col h-full">
    <div class="px-8 pt-6 pb-3 flex items-center justify-between">
      <div>
        <h1 class="font-display text-[22px] font-semibold tracking-tight text-slate-900">Vendors</h1>
        <p class="text-[13px] text-slate-500 mt-0.5">41 vendors · 28 active this month · 7 Tier-1 partners</p>
      </div>
      <div class="flex items-center gap-2">
        <button class="btn-secondary"><i data-lucide="upload" class="icon-sm"></i> Import from old CRM</button>
        <button class="btn-secondary"><i data-lucide="send" class="icon-sm"></i> Send onboarding form</button>
        <button class="btn-primary"><i data-lucide="plus" class="icon-sm"></i> Invite vendor</button>
      </div>
    </div>

    <!-- Saved chips -->
    <div class="px-8 pb-3 flex items-center gap-2 border-b border-slate-100">
      <button class="badge badge-indigo">All vendors <span class="text-indigo-400 ml-1">41</span></button>
      <button class="badge badge-neutral">Tier-1 partners <span class="text-slate-400 ml-1">7</span></button>
      <button class="badge badge-neutral">Active this month <span class="text-slate-400 ml-1">28</span></button>
      <button class="badge badge-neutral">Onboarding <span class="text-slate-400 ml-1">3</span></button>
      <button class="badge badge-neutral">NDA expiring &lt; 30d <span class="text-amber-600 ml-1">2</span></button>
    </div>

    <!-- Filter bar -->
    <div class="px-8 py-3 flex items-center gap-2 border-b border-slate-200 bg-slate-50/40">
      <div class="dm-search w-[280px]">
        <i data-lucide="search"></i>
        <input placeholder="Filter vendors…" />
      </div>
      <button class="btn-secondary !text-[12px]"><i data-lucide="filter" class="icon-sm"></i> Skill: Any <i data-lucide="chevron-down" class="icon-sm text-slate-400"></i></button>
      <button class="btn-secondary !text-[12px]">Region: Karnataka <i data-lucide="chevron-down" class="icon-sm text-slate-400"></i></button>
      <button class="btn-secondary !text-[12px]">Tier: Any <i data-lucide="chevron-down" class="icon-sm text-slate-400"></i></button>
      <button class="btn-secondary !text-[12px]">Status: Any <i data-lucide="chevron-down" class="icon-sm text-slate-400"></i></button>
      <div class="flex-1"></div>
      <button class="btn-ghost !text-[12px]"><i data-lucide="bookmark" class="icon-sm"></i> Save view</button>
    </div>

    <div class="flex-1 overflow-auto">
      <table class="dm-table">
        <thead>
          <tr>
            <th style="width:32px"><input type="checkbox" class="rounded border-slate-300" /></th>
            <th>Vendor</th>
            <th>Regions</th>
            <th>Tier</th>
            <th>Rating</th>
            <th>NDA / MSA</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>""" + rows + """</tbody>
      </table>
    </div>

    <div class="px-8 py-3 border-t border-slate-200 flex items-center justify-between bg-white">
      <div class="text-[12px] text-slate-500">Showing 1–12 of 41</div>
      <div class="flex items-center gap-1">
        <button class="btn-secondary !text-[12px] !px-2 bg-indigo-50 !border-indigo-200 text-indigo-700">1</button>
        <button class="btn-ghost !text-[12px] !px-2">2</button>
        <button class="btn-ghost !text-[12px] !px-2">3</button>
        <button class="btn-ghost !text-[12px] !px-2">4</button>
        <button class="btn-icon"><i data-lucide="chevron-right" class="icon-sm"></i></button>
      </div>
    </div>
  </div>
    """


# ─────────────────────── 7. Vendor detail ───────────────────────
def s07_vendor_detail():
    return """
  <div class="flex h-full">
    <div class="flex-1 overflow-auto">
      <!-- Header -->
      <div class="px-8 pt-6 pb-4 border-b border-slate-100">
        <div class="flex items-start gap-4">
          """ + _avatar("AS", "b", "xl") + """
          <div class="flex-1">
            <div class="flex items-center gap-3">
              <h1 class="font-display text-[24px] font-semibold tracking-tight text-slate-900">Aurora Studio</h1>
              <span class="badge badge-indigo">Tier-1 partner</span>
              <span class="badge badge-success badge-dot">Active</span>
              <div class="flex items-center gap-1 ml-2">
                <i data-lucide="star" class="icon-sm text-amber-400" style="fill:currentColor"></i>
                <span class="font-semibold text-slate-900 text-[13px]">4.9</span>
                <span class="text-slate-400 text-[12px]">· 12 projects</span>
              </div>
            </div>
            <div class="text-[13px] text-slate-500 mt-1">Concept · 3D visualization · Brand refresh · Founded 2018 · Bengaluru + Chennai</div>
            <div class="flex items-center gap-4 mt-3 text-[12px] text-slate-600">
              <span class="flex items-center gap-1.5"><i data-lucide="mail" class="icon-sm text-slate-400"></i> hello@aurorastudio.in</span>
              <span class="flex items-center gap-1.5"><i data-lucide="phone" class="icon-sm text-slate-400"></i> +91 80 4123 5678</span>
              <span class="flex items-center gap-1.5"><i data-lucide="globe" class="icon-sm text-slate-400"></i> aurorastudio.in</span>
              <span class="flex items-center gap-1.5"><i data-lucide="instagram" class="icon-sm text-slate-400"></i> @aurora.studio</span>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <button class="btn-secondary"><i data-lucide="message-circle" class="icon-sm"></i> WhatsApp</button>
            <button class="btn-secondary"><i data-lucide="mail" class="icon-sm"></i> Email</button>
            <button class="btn-primary"><i data-lucide="user-plus" class="icon-sm"></i> Assign to project</button>
            <button class="btn-icon"><i data-lucide="more-horizontal" class="icon-sm"></i></button>
          </div>
        </div>
        <div class="dm-tabs mt-5">
          <div class="dm-tab" data-active="true">Profile</div>
          <div class="dm-tab">Projects <span class="badge badge-neutral ml-1">12</span></div>
          <div class="dm-tab">Tasks <span class="badge badge-neutral ml-1">8</span></div>
          <div class="dm-tab">Deliverables <span class="badge badge-neutral ml-1">47</span></div>
          <div class="dm-tab">Conversations</div>
          <div class="dm-tab">Files</div>
          <div class="dm-tab">Reviews <span class="badge badge-neutral ml-1">12</span></div>
        </div>
      </div>

      <!-- Body -->
      <div class="grid grid-cols-3 gap-6 px-8 py-6">
        <div class="col-span-2 space-y-4">
          <!-- Skills -->
          <div class="dm-card">
            <div class="dm-card-header">
              <div class="text-[13px] font-semibold text-slate-900">Skills & specialization</div>
              <button class="btn-ghost !text-[12px]"><i data-lucide="pencil" class="icon-sm"></i> Edit</button>
            </div>
            <div class="dm-card-body">
              <div class="flex flex-wrap gap-2">
                <span class="badge badge-indigo">Concept design</span>
                <span class="badge badge-indigo">3D visualization</span>
                <span class="badge badge-indigo">Brand identity</span>
                <span class="badge badge-neutral">Mood boards</span>
                <span class="badge badge-neutral">Material palette</span>
                <span class="badge badge-neutral">F&B interiors</span>
                <span class="badge badge-neutral">Residential</span>
                <span class="badge badge-neutral">VR walk-throughs</span>
              </div>
              <div class="grid grid-cols-3 gap-4 mt-5 pt-4 border-t border-slate-100">
                <div>
                  <div class="text-[11px] text-slate-500 uppercase tracking-wider">Avg. project value</div>
                  <div class="text-[16px] font-semibold text-slate-900 mt-1">₹ 4.2 L</div>
                </div>
                <div>
                  <div class="text-[11px] text-slate-500 uppercase tracking-wider">On-time delivery</div>
                  <div class="text-[16px] font-semibold text-emerald-600 mt-1">94%</div>
                </div>
                <div>
                  <div class="text-[11px] text-slate-500 uppercase tracking-wider">Last assignment</div>
                  <div class="text-[16px] font-semibold text-slate-900 mt-1">5h ago</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Rate card -->
          <div class="dm-card">
            <div class="dm-card-header">
              <div class="text-[13px] font-semibold text-slate-900">Rate card</div>
              <button class="btn-ghost !text-[12px]"><i data-lucide="external-link" class="icon-sm"></i> View MSA</button>
            </div>
            <div class="dm-card-body !p-0">
              <table class="dm-table">
                <thead><tr><th>Deliverable</th><th>Unit</th><th>Rate</th><th>Notes</th></tr></thead>
                <tbody>
                  <tr><td><span class="font-medium text-slate-900">Concept board</span></td><td>per project</td><td>₹ 45,000</td><td class="text-slate-500">3 revision rounds incl.</td></tr>
                  <tr><td><span class="font-medium text-slate-900">3D rendered view</span></td><td>per view</td><td>₹ 8,500</td><td class="text-slate-500">2 days SLA</td></tr>
                  <tr><td><span class="font-medium text-slate-900">VR walk-through</span></td><td>per project</td><td>₹ 1,20,000</td><td class="text-slate-500">10–15 day SLA</td></tr>
                  <tr><td><span class="font-medium text-slate-900">Brand identity refresh</span></td><td>per scope</td><td>₹ 2,80,000</td><td class="text-slate-500">Logo, palette, type</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Project history -->
          <div class="dm-card">
            <div class="dm-card-header">
              <div class="text-[13px] font-semibold text-slate-900">Project history</div>
              <button class="btn-ghost !text-[12px]">All 12 →</button>
            </div>
            <div class="dm-card-body !p-0">
              <table class="dm-table">
                <thead><tr><th>Project</th><th>Role</th><th>Period</th><th>Fee</th><th>Status</th></tr></thead>
                <tbody>
                  <tr><td><span class="font-medium text-slate-900">Brand Refresh — Lumen Café</span></td><td>Concept lead</td><td>Mar 12 → Jun 30</td><td>₹ 3,25,000</td><td><span class="status-pill status-design">Active</span></td></tr>
                  <tr><td><span class="font-medium text-slate-900">Whitefield Villa</span></td><td>3D + VR</td><td>Feb 2 → May 18</td><td>₹ 4,80,000</td><td><span class="status-pill status-install">Install</span></td></tr>
                  <tr><td><span class="font-medium text-slate-900">Indiranagar Loft Reno</span></td><td>Concept board</td><td>Jan 15 → Feb 10</td><td>₹ 95,000</td><td><span class="status-pill status-handover">Closed</span></td></tr>
                  <tr><td><span class="font-medium text-slate-900">Koramangala Co-work</span></td><td>Brand + interiors</td><td>Nov 4 → Jan 8</td><td>₹ 5,40,000</td><td><span class="status-pill status-handover">Closed</span></td></tr>
                  <tr><td><span class="font-medium text-slate-900">Café Espresso Roastery</span></td><td>Concept</td><td>Sep 1 → Oct 30</td><td>₹ 1,20,000</td><td><span class="status-pill status-closed">Closed</span></td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Right rail -->
        <div class="col-span-1 space-y-4">
          <div class="dm-card">
            <div class="dm-card-header"><div class="text-[13px] font-semibold text-slate-900">Compliance</div></div>
            <div class="dm-card-body !p-0">
              <div class="px-4 py-3 flex items-center justify-between border-b border-slate-100">
                <div>
                  <div class="text-[12.5px] font-medium text-slate-900">NDA</div>
                  <div class="text-[11px] text-slate-500">Signed Jan 12, 2024</div>
                </div>
                <span class="badge badge-success badge-dot">Valid</span>
              </div>
              <div class="px-4 py-3 flex items-center justify-between border-b border-slate-100">
                <div>
                  <div class="text-[12.5px] font-medium text-slate-900">MSA</div>
                  <div class="text-[11px] text-slate-500">Signed Jan 12, 2024 · renews Jan 2027</div>
                </div>
                <span class="badge badge-success badge-dot">Valid</span>
              </div>
              <div class="px-4 py-3 flex items-center justify-between border-b border-slate-100">
                <div>
                  <div class="text-[12.5px] font-medium text-slate-900">GST registration</div>
                  <div class="text-[11px] text-slate-500">29AABCT1234X1Z5</div>
                </div>
                <span class="badge badge-success badge-dot">Verified</span>
              </div>
              <div class="px-4 py-3 flex items-center justify-between">
                <div>
                  <div class="text-[12.5px] font-medium text-slate-900">Insurance</div>
                  <div class="text-[11px] text-amber-600">Expires Jul 14, 2026</div>
                </div>
                <span class="badge badge-warning badge-dot">Renew soon</span>
              </div>
            </div>
          </div>

          <div class="dm-card">
            <div class="dm-card-header"><div class="text-[13px] font-semibold text-slate-900">Portfolio</div></div>
            <div class="dm-card-body !p-0">
              <div class="grid grid-cols-2 gap-px bg-slate-100 p-px">
                """ + "".join(_portfolio_thumb() for _ in range(4)) + """
              </div>
              <div class="px-4 py-2.5 border-t border-slate-100 text-center">
                <a href="#" class="text-[12px] text-indigo-600 font-medium hover:underline">Open SharePoint folder →</a>
              </div>
            </div>
          </div>

          <div class="dm-card">
            <div class="dm-card-header"><div class="text-[13px] font-semibold text-slate-900">Team contacts</div></div>
            <div class="dm-card-body !p-0">
              <div class="px-4 py-2.5 flex items-center gap-3 border-b border-slate-100">
                """ + _avatar("RB", "b", "sm") + """
                <div class="flex-1 min-w-0">
                  <div class="text-[12.5px] font-medium text-slate-900">Rohan Batra</div>
                  <div class="text-[11px] text-slate-500">Founder · Primary contact</div>
                </div>
              </div>
              <div class="px-4 py-2.5 flex items-center gap-3 border-b border-slate-100">
                """ + _avatar("SK", "d", "sm") + """
                <div class="flex-1 min-w-0">
                  <div class="text-[12.5px] font-medium text-slate-900">Sneha Kapur</div>
                  <div class="text-[11px] text-slate-500">3D lead</div>
                </div>
              </div>
              <div class="px-4 py-2.5 flex items-center gap-3">
                """ + _avatar("DP", "e", "sm") + """
                <div class="flex-1 min-w-0">
                  <div class="text-[12.5px] font-medium text-slate-900">Devika Pillai</div>
                  <div class="text-[11px] text-slate-500">Project coordinator</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
    """


def _portfolio_thumb():
    return """
      <div class="aspect-[4/3] bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
        <svg viewBox="0 0 60 45" class="w-12 h-9 text-slate-400">
          <rect x="2" y="6" width="56" height="33" rx="2" fill="none" stroke="currentColor" stroke-width="1.5"/>
          <circle cx="14" cy="18" r="3" fill="currentColor" opacity="0.4"/>
          <path d="M2 32 L20 22 L34 30 L48 18 L58 28 L58 39 L2 39 Z" fill="currentColor" opacity="0.25"/>
        </svg>
      </div>
    """


# ─────────────────────── 8. Vendor Projects board ───────────────────────
def s08_projects_board():
    cols = [
        ("Brief",        "indigo",  3, [
            ("Brand Refresh — Café Espresso 2", "Anita M.", "Jun 14", ["AS"], 0, 8),
            ("Whitefield Townhouse",           "Manish",    "Jun 28", ["MS"], 0, 6),
            ("Suri Family Home",               "Rohit",     "Jul 02", [],     0, 4),
        ]),
        ("Concept",      "info",    2, [
            ("Brand Refresh — Lumen Café",     "Manish",    "Jun 30", ["AS","RB"], 4, 12),
            ("Koramangala Bar Lounge",         "Anita M.",  "Jul 18", ["AS","LP"], 2, 9),
        ]),
        ("Design",       "indigo",  3, [
            ("HSR Penthouse",                  "Rohit",     "Jul 22", ["AS","VE","FT"], 9, 14),
            ("JP Nagar Bungalow",              "Anita M.",  "Aug 04", ["MK","MN","PP"], 6, 11),
            ("Indiranagar Loft Reno",          "Manish",    "Jun 18", ["MK","FT"], 11, 13),
        ]),
        ("Procurement",  "warning", 2, [
            ("Whitefield Villa",               "Manish",    "Jul 30", ["AS","MN","PS"], 14, 18),
            ("Hennur Apartment",               "Rohit",     "Jul 12", ["MK","FT"], 8, 10),
        ]),
        ("Install",      "warning", 2, [
            ("MG Road Boutique",               "Anita M.",  "May 30", ["MK","VE","LP"], 20, 22),
            ("Banashankari Duplex",            "Rohit",     "Jun 06", ["MK","PP","AC"], 18, 21),
        ]),
        ("Handover",     "success", 1, [
            ("Sarjapur Cottage",               "Manish",    "May 22", ["FT","GF"], 24, 24),
        ]),
    ]

    cols_html = ""
    for title, color, count, items in cols:
        cards_html = ""
        for name, owner, due, vendors, done, total in items:
            avatars = ""
            palette = ["b", "c", "e", "f", "a", "d"]
            for i, v in enumerate(vendors[:3]):
                avatars += f'<div class="avatar avatar-sm avatar-{palette[i%6]}">{v}</div>'
            if len(vendors) > 3:
                avatars += f'<div class="avatar avatar-sm" style="background:#F1F5F9;color:#64748B">+{len(vendors)-3}</div>'
            pct = int(done / total * 100) if total else 0
            cards_html += f"""
              <div class="kanban-card">
                <div class="flex items-start justify-between mb-2">
                  <div class="text-[13px] font-semibold text-slate-900 leading-snug">{name}</div>
                  <button class="btn-icon !w-6 !h-6"><i data-lucide="more-horizontal" class="icon-sm"></i></button>
                </div>
                <div class="flex items-center gap-2 mb-2.5 text-[11px] text-slate-500">
                  <i data-lucide="calendar" class="icon-sm"></i> <span>{due}</span>
                  <span class="text-slate-300">·</span>
                  <i data-lucide="user" class="icon-sm"></i> <span>{owner}</span>
                </div>
                <div class="mb-2.5">
                  <div class="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                    <span>Milestones</span><span>{done}/{total}</span>
                  </div>
                  <div class="dm-progress" style="height:4px"><div style="width:{pct}%"></div></div>
                </div>
                <div class="flex items-center justify-between">
                  <div class="avatar-stack flex">{avatars or '<span class="text-[11px] text-slate-400">No vendors yet</span>'}</div>
                  <div class="flex items-center gap-2 text-[11px] text-slate-500">
                    <i data-lucide="message-square" class="icon-sm"></i> <span>3</span>
                    <i data-lucide="paperclip" class="icon-sm"></i> <span>7</span>
                  </div>
                </div>
              </div>
            """
        cols_html += f"""
          <div class="kanban-col">
            <div class="kanban-col-header">
              <div class="flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-{color}-500" style="background:var(--accent)"></span>
                <span>{title}</span>
                <span class="text-slate-400 font-normal">{count}</span>
              </div>
              <button class="btn-icon !w-6 !h-6"><i data-lucide="plus" class="icon-sm"></i></button>
            </div>
            <div class="kanban-col-body">{cards_html}</div>
          </div>
        """

    return """
  <div class="flex flex-col h-full">
    <div class="px-8 pt-6 pb-4 flex items-center justify-between">
      <div>
        <h1 class="font-display text-[22px] font-semibold tracking-tight text-slate-900">Projects</h1>
        <p class="text-[13px] text-slate-500 mt-0.5">13 active · 9 on track · 3 at risk · 1 in handover this week</p>
      </div>
      <div class="flex items-center gap-2">
        <div class="flex items-center bg-white border border-slate-300 rounded-md">
          <button class="px-2.5 py-1.5 text-indigo-600 bg-indigo-50 rounded-l-md flex items-center gap-1.5 text-[12px] font-medium"><i data-lucide="kanban" class="icon-sm"></i> Board</button>
          <button class="px-2.5 py-1.5 text-slate-500 hover:bg-slate-50 flex items-center gap-1.5 text-[12px]"><i data-lucide="list" class="icon-sm"></i> List</button>
          <button class="px-2.5 py-1.5 text-slate-500 hover:bg-slate-50 flex items-center gap-1.5 text-[12px]"><i data-lucide="calendar-days" class="icon-sm"></i> Timeline</button>
        </div>
        <button class="btn-secondary"><i data-lucide="filter" class="icon-sm"></i> Filter</button>
        <button class="btn-secondary"><i data-lucide="layout-template" class="icon-sm"></i> Templates</button>
        <button class="btn-primary"><i data-lucide="plus" class="icon-sm"></i> New project</button>
      </div>
    </div>

    <!-- Filter chips -->
    <div class="px-8 pb-3 flex items-center gap-2 border-b border-slate-200 bg-slate-50/40">
      <button class="badge badge-indigo">Active <span class="text-indigo-400 ml-1">13</span></button>
      <button class="badge badge-neutral">My projects <span class="text-slate-400 ml-1">5</span></button>
      <button class="badge badge-neutral">Anita M. <span class="text-slate-400 ml-1">4</span></button>
      <button class="badge badge-neutral">Rohit <span class="text-slate-400 ml-1">4</span></button>
      <button class="badge badge-warning">At risk <span class="text-amber-600 ml-1">3</span></button>
      <button class="badge badge-neutral">+ Add filter</button>
      <div class="flex-1"></div>
      <div class="text-[12px] text-slate-500 flex items-center gap-2">
        <span>Group by</span>
        <button class="btn-ghost !text-[12px] !py-1">Status <i data-lucide="chevron-down" class="icon-sm text-slate-400"></i></button>
      </div>
    </div>

    <!-- Kanban -->
    <div class="flex-1 overflow-x-auto scroll-clean">
      <div class="flex gap-4 p-6 min-w-min">
        """ + cols_html + """
      </div>
    </div>
  </div>
    """


# ─────────────────────── 9. Project detail ───────────────────────
def s09_project_detail():
    return """
  <div class="flex flex-col h-full">
    <!-- Header -->
    <div class="px-8 pt-6 pb-4 border-b border-slate-100">
      <div class="flex items-start gap-4">
        <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 text-white flex items-center justify-center">
          <i data-lucide="layers" class="icon-lg"></i>
        </div>
        <div class="flex-1">
          <div class="flex items-center gap-3">
            <h1 class="font-display text-[22px] font-semibold tracking-tight text-slate-900">Brand Refresh — Lumen Café</h1>
            <span class="status-pill status-design">Design</span>
            <span class="badge badge-success badge-dot">On track</span>
          </div>
          <div class="text-[12.5px] text-slate-500 mt-1">
            <span class="font-medium text-slate-700">Priya Raghavan</span> ·
            PM <span class="font-medium text-slate-700">Manish</span> ·
            Designer <span class="font-medium text-slate-700">Anita M.</span> ·
            Target <span class="font-medium text-slate-700">Jun 30, 2026</span> · 43 days remaining
          </div>
        </div>
        <div class="flex items-center gap-2">
          <button class="btn-secondary"><i data-lucide="folder-open" class="icon-sm"></i> SharePoint</button>
          <button class="btn-secondary"><i data-lucide="users-round" class="icon-sm"></i> Teams channel</button>
          <button class="btn-primary"><i data-lucide="check-circle" class="icon-sm"></i> Mark milestone done</button>
          <button class="btn-icon"><i data-lucide="more-horizontal" class="icon-sm"></i></button>
        </div>
      </div>

      <!-- Milestone bar -->
      <div class="mt-5 grid grid-cols-7 gap-2">
        """ + _milestones_bar() + """
      </div>

      <div class="dm-tabs mt-5">
        <div class="dm-tab" data-active="true">Overview</div>
        <div class="dm-tab">Tasks <span class="badge badge-neutral ml-1">23</span></div>
        <div class="dm-tab">Deliverables <span class="badge badge-neutral ml-1">12</span></div>
        <div class="dm-tab">Vendors <span class="badge badge-neutral ml-1">3</span></div>
        <div class="dm-tab">Files <span class="badge badge-neutral ml-1">47</span></div>
        <div class="dm-tab">Activity</div>
      </div>
    </div>

    <!-- Body -->
    <div class="flex-1 overflow-auto">
      <div class="grid grid-cols-3 gap-6 px-8 py-6">
        <div class="col-span-2 space-y-4">
          <!-- Deliverables (current focus) -->
          <div class="dm-card">
            <div class="dm-card-header">
              <div class="text-[13px] font-semibold text-slate-900">Deliverables — current milestone</div>
              <button class="btn-secondary !text-[12px]"><i data-lucide="plus" class="icon-sm"></i> New deliverable</button>
            </div>
            <div class="dm-card-body">
              <div class="grid grid-cols-2 gap-3">
                """ + _deliverable_card("Concept board v3", "Aurora Studio", "In review", "design", _portfolio_thumb()) + """
                """ + _deliverable_card("Material palette v2", "Aurora Studio", "Approved", "handover", _portfolio_thumb()) + """
                """ + _deliverable_card("3D — bar elevation", "Render Boutique", "Awaiting upload", "brief", _portfolio_thumb()) + """
                """ + _deliverable_card("Brand mark refresh", "Aurora Studio", "In review", "design", _portfolio_thumb()) + """
              </div>
            </div>
          </div>

          <!-- Tasks -->
          <div class="dm-card">
            <div class="dm-card-header">
              <div class="text-[13px] font-semibold text-slate-900">Next-up tasks</div>
              <button class="btn-ghost !text-[12px]">Full task list →</button>
            </div>
            <div class="dm-card-body !p-0">
              """ + _task_row("Approve concept board v3", "Manish", "Today", "in_progress") + """
              """ + _task_row("Order brass bar fittings (sample)", "Aurora Studio", "Wed, May 20", "todo") + """
              """ + _task_row("Confirm cane fabric — alternate from FabTextiles", "Anita M.", "Thu, May 21", "todo") + """
              """ + _task_row("Send Pune install timeline to Priya", "Manish", "Fri, May 22", "todo") + """
              """ + _task_row("Lock floor plan (final)", "Anita M.", "Mon, May 25", "blocked") + """
            </div>
          </div>

          <!-- Activity -->
          <div class="dm-card">
            <div class="dm-card-header">
              <div class="text-[13px] font-semibold text-slate-900">Activity</div>
              <div class="flex items-center gap-2">
                <span class="badge badge-neutral">All</span><span class="badge badge-neutral">Comments</span><span class="badge badge-neutral">Status</span>
              </div>
            </div>
            <div class="dm-card-body !p-0">
              """ + _activity_for_project() + """
            </div>
          </div>
        </div>

        <!-- Right rail -->
        <div class="col-span-1 space-y-4">
          <div class="dm-card">
            <div class="dm-card-header">
              <div class="text-[13px] font-semibold text-slate-900">Assigned vendors</div>
              <button class="btn-ghost !text-[12px]"><i data-lucide="user-plus" class="icon-sm"></i> Invite</button>
            </div>
            <div class="dm-card-body !p-0">
              """ + _vendor_assignment("AS", "b", "Aurora Studio", "Concept lead · 3D", "₹ 3,25,000", "active") + """
              """ + _vendor_assignment("RB", "f", "Render Boutique", "VR walk-through", "₹ 1,20,000", "active") + """
              """ + _vendor_assignment("FT", "a", "FabTextiles", "Soft furnishings", "₹ 78,000", "invited") + """
            </div>
          </div>

          <div class="dm-card">
            <div class="dm-card-header"><div class="text-[13px] font-semibold text-slate-900">Comments</div></div>
            <div class="dm-card-body !p-0">
              <div class="px-4 py-3 border-b border-slate-100">
                <div class="flex items-start gap-2.5">
                  """ + _avatar("MS", "a", "sm") + """
                  <div class="flex-1 min-w-0">
                    <div class="text-[12px]"><span class="font-medium text-slate-900">Manish</span> <span class="text-slate-400">· 2h ago</span></div>
                    <div class="text-[12.5px] text-slate-700 mt-1 leading-snug">Priya is in on Wed for the concept review — let's batch the material samples + brand mark in the same session.</div>
                  </div>
                </div>
              </div>
              <div class="px-4 py-3 border-b border-slate-100">
                <div class="flex items-start gap-2.5">
                  """ + _avatar("AS", "b", "sm") + """
                  <div class="flex-1 min-w-0">
                    <div class="text-[12px]"><span class="font-medium text-slate-900">Aurora Studio</span> <span class="text-slate-400">· 5h ago</span></div>
                    <div class="text-[12.5px] text-slate-700 mt-1 leading-snug">v3 uploaded. Brass detail above the bar revised per call. Cane fabric option B from FabTextiles in slide 12.</div>
                  </div>
                </div>
              </div>
              <div class="px-4 py-2.5">
                <textarea class="w-full border-0 text-[13px] resize-none focus:outline-none" rows="2" placeholder="Comment or @mention…"></textarea>
                <div class="flex items-center justify-between mt-1">
                  <div class="flex gap-1">
                    <button class="btn-icon"><i data-lucide="paperclip" class="icon-sm"></i></button>
                    <button class="btn-icon"><i data-lucide="at-sign" class="icon-sm"></i></button>
                  </div>
                  <button class="btn-primary !text-[11px] !px-3 !py-1">Comment</button>
                </div>
              </div>
            </div>
          </div>

          <div class="dm-card">
            <div class="dm-card-header"><div class="text-[13px] font-semibold text-slate-900">Project details</div></div>
            <div class="dm-card-body !p-0 text-[12.5px]">
              <div class="px-4 py-2.5 flex justify-between border-b border-slate-100"><span class="text-slate-500">Started</span><span class="text-slate-900">Mar 12, 2026</span></div>
              <div class="px-4 py-2.5 flex justify-between border-b border-slate-100"><span class="text-slate-500">Target end</span><span class="text-slate-900">Jun 30, 2026</span></div>
              <div class="px-4 py-2.5 flex justify-between border-b border-slate-100"><span class="text-slate-500">Budget</span><span class="text-slate-900">₹ 18.4 L</span></div>
              <div class="px-4 py-2.5 flex justify-between border-b border-slate-100"><span class="text-slate-500">Spent</span><span class="text-slate-900">₹ 6.2 L (34%)</span></div>
              <div class="px-4 py-2.5 flex justify-between"><span class="text-slate-500">Opportunity source</span><span class="text-slate-900">Referral</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
    """


def _milestones_bar():
    ms = [
        ("Brief sign-off",  "done"),
        ("Concept",         "done"),
        ("Design dev",      "active"),
        ("Procurement",     "pending"),
        ("Install",         "pending"),
        ("Snag",            "pending"),
        ("Handover",        "pending"),
    ]
    out = []
    for label, state in ms:
        if state == "done":
            color = "bg-emerald-500 text-white"
            line = "bg-emerald-200"
            tcolor = "text-slate-900"
            icon = '<i data-lucide="check" class="icon-sm"></i>'
        elif state == "active":
            color = "bg-indigo-600 text-white ring-4 ring-indigo-100"
            line = "bg-slate-200"
            tcolor = "text-indigo-700 font-semibold"
            icon = '<span class="text-[10px] font-bold">●</span>'
        else:
            color = "bg-white border border-slate-300 text-slate-400"
            line = "bg-slate-200"
            tcolor = "text-slate-400"
            icon = '<span class="text-[10px]">·</span>'
        out.append(f"""
          <div class="flex flex-col items-center text-center gap-2">
            <div class="w-7 h-7 rounded-full flex items-center justify-center {color}">{icon}</div>
            <div class="text-[11px] {tcolor} leading-tight">{label}</div>
          </div>
        """)
    return "".join(out)


def _deliverable_card(name, vendor, status, status_class, thumb_svg):
    status_pill = f'<span class="status-pill status-{status_class}">{status}</span>'
    return f"""
        <div class="border border-slate-200 rounded-lg overflow-hidden hover:border-slate-300 transition-colors group">
          {thumb_svg}
          <div class="p-3 border-t border-slate-200">
            <div class="flex items-start justify-between gap-2">
              <div class="min-w-0">
                <div class="text-[13px] font-semibold text-slate-900 truncate">{name}</div>
                <div class="text-[11px] text-slate-500 truncate">{vendor} · v3</div>
              </div>
              {status_pill}
            </div>
            <div class="flex items-center justify-between mt-2.5 pt-2.5 border-t border-slate-100">
              <div class="flex items-center gap-2 text-[11px] text-slate-500">
                <span class="flex items-center gap-1"><i data-lucide="history" class="icon-sm"></i> 3 versions</span>
              </div>
              <button class="text-[11px] text-indigo-600 font-medium opacity-0 group-hover:opacity-100">Request approval →</button>
            </div>
          </div>
        </div>
    """


def _task_row(title, owner, due, status):
    if status == "in_progress":
        chk = '<button class="w-4 h-4 rounded-sm border-2 border-indigo-500 bg-indigo-50 flex items-center justify-center"><span class="w-1.5 h-1.5 bg-indigo-500 rounded-sm"></span></button>'
        pill = '<span class="badge badge-indigo">In progress</span>'
    elif status == "blocked":
        chk = '<button class="w-4 h-4 rounded-sm border-2 border-red-300 flex items-center justify-center"><i data-lucide="x" class="icon-sm text-red-500" style="width:10px;height:10px"></i></button>'
        pill = '<span class="badge badge-danger">Blocked</span>'
    elif status == "done":
        chk = '<button class="w-4 h-4 rounded-sm border-2 border-emerald-500 bg-emerald-500 flex items-center justify-center"><i data-lucide="check" class="icon-sm text-white" style="width:10px;height:10px"></i></button>'
        pill = '<span class="badge badge-success">Done</span>'
    else:
        chk = '<button class="w-4 h-4 rounded-sm border-2 border-slate-300"></button>'
        pill = '<span class="badge badge-neutral">To do</span>'
    return f"""
        <div class="px-4 py-2.5 flex items-center gap-3 border-b border-slate-100 last:border-b-0 hover:bg-slate-50/40">
          {chk}
          <div class="flex-1 min-w-0 text-[13px] text-slate-900">{title}</div>
          {pill}
          <span class="text-[11px] text-slate-500 w-[90px] text-right">{due}</span>
          <span class="text-[11px] text-slate-500 w-[80px] text-right">{owner}</span>
        </div>
    """


def _activity_for_project():
    items = [
        ("AS", "b", "Aurora Studio", "uploaded", "Concept board v3.pdf", "5h ago"),
        ("MS", "a", "Manish", "marked deliverable", "Material palette v2 → Approved", "1d ago"),
        ("VE", "e", "Voltek Electricals", "left a comment on", "Electrical load schedule", "2d ago"),
        ("SY", "f", "System", "renewed", "Microsoft Graph mail subscription", "3d ago"),
        ("AS", "b", "Aurora Studio", "accepted assignment for", "Concept lead · 3D", "1w ago"),
    ]
    out = []
    for ini,var,name,action,target,when in items:
        out.append(f"""
          <div class="px-4 py-2.5 flex items-start gap-3 border-b border-slate-100 last:border-b-0">
            {_avatar(ini, var, "sm")}
            <div class="flex-1 min-w-0">
              <div class="text-[12.5px] text-slate-700"><span class="font-medium text-slate-900">{name}</span> {action} <span class="font-medium text-slate-900">{target}</span></div>
              <div class="text-[11px] text-slate-400">{when}</div>
            </div>
          </div>
        """)
    return "".join(out)


def _vendor_assignment(ini, var, name, role, fee, state):
    state_pill = {
        "active":  '<span class="badge badge-success badge-dot">Active</span>',
        "invited": '<span class="badge badge-warning badge-dot">Invited</span>',
        "completed": '<span class="badge badge-neutral badge-dot">Completed</span>',
    }[state]
    return f"""
        <div class="px-4 py-3 flex items-center gap-3 border-b border-slate-100 last:border-b-0">
          {_avatar(ini, var, "")}
          <div class="flex-1 min-w-0">
            <div class="text-[13px] font-semibold text-slate-900 truncate">{name}</div>
            <div class="text-[11px] text-slate-500 truncate">{role} · {fee}</div>
          </div>
          {state_pill}
        </div>
    """


# ─────────────────────── 10. Pipelines kanban ───────────────────────
def s10_pipelines():
    stages = [
        ("New",       "neutral", 8, "₹ 12.4 L", [
            ("Suri Kapoor",       "Residential · 3BHK · HSR",                "₹ 2,40,000", "Rohit", "4d"),
            ("Arjun K. (Signal)", "Co-work expansion · Indiranagar",         "₹ 5,80,000", "Anita", "2d"),
            ("Tanvi Joshi",       "Café fit-out · MG Road",                  "₹ 1,80,000", "Manish","1d"),
        ]),
        ("Qualified", "info",    6, "₹ 18.2 L", [
            ("Mehta Family",      "Villa · Whitefield",                      "₹ 8,40,000", "Anita", "6d"),
            ("Lumen Café (2)",    "Pune outlet expansion",                   "₹ 4,60,000", "Manish","3d"),
            ("Kotha Bros LLP",    "Showroom · Koramangala",                  "₹ 2,80,000", "Rohit", "1d"),
        ]),
        ("Brief",     "indigo",  5, "₹ 22.0 L", [
            ("Hennur Apartment",  "2BHK · soft refurb",                      "₹ 3,40,000", "Rohit", "8d"),
            ("Yelahanka Duplex",  "4BHK · full design",                      "₹ 9,80,000", "Anita", "5d"),
            ("Mantra Studios",    "Yoga studio interior",                    "₹ 2,20,000", "Manish","2d"),
        ]),
        ("Proposal",  "warning", 4, "₹ 16.4 L", [
            ("Banashankari Duplex","Full design + install",                  "₹ 7,20,000", "Rohit", "12d"),
            ("Café Espresso 2",   "Brand refresh + interior",                "₹ 4,80,000", "Anita", "5d"),
            ("Koramangala Bar",   "Lounge concept",                          "₹ 4,40,000", "Manish","2d"),
        ]),
        ("Won",       "success", 3, "₹ 16.2 L", [
            ("MG Road Boutique",  "Install in progress",                     "₹ 5,40,000", "Anita", "1mo"),
            ("Brand Refresh — Lumen", "Active project",                      "₹ 3,25,000", "Manish","2mo"),
            ("Indiranagar Loft",  "In design",                               "₹ 3,80,000", "Manish","3mo"),
        ]),
    ]
    cols = ""
    for title, color, count, value, items in stages:
        cards = ""
        for name, sub, val, owner, days in items:
            color_dot = {"neutral":"#94A3B8","info":"#0284C7","indigo":"#4F46E5","warning":"#D97706","success":"#16A34A"}[color]
            cards += f"""
              <div class="kanban-card">
                <div class="flex items-start justify-between mb-1.5">
                  <div class="text-[13px] font-semibold text-slate-900 leading-snug">{name}</div>
                  <button class="btn-icon !w-5 !h-5"><i data-lucide="more-horizontal" class="icon-sm"></i></button>
                </div>
                <div class="text-[11.5px] text-slate-500 mb-2.5 leading-snug">{sub}</div>
                <div class="flex items-center justify-between text-[12px]">
                  <div class="font-semibold text-slate-900">{val}</div>
                  <div class="flex items-center gap-2 text-[11px] text-slate-500">
                    <span>{days}</span>
                    <span class="avatar avatar-sm avatar-a">{owner[0]}</span>
                  </div>
                </div>
              </div>
            """
        cols += f"""
          <div class="kanban-col">
            <div class="kanban-col-header">
              <div class="flex items-center gap-2">
                <span class="w-2 h-2 rounded-full" style="background:{color_dot}"></span>
                <span>{title}</span>
                <span class="text-slate-400 font-normal">{count}</span>
              </div>
              <button class="btn-icon !w-6 !h-6"><i data-lucide="plus" class="icon-sm"></i></button>
            </div>
            <div class="px-3 py-2 border-b border-slate-200 bg-white">
              <div class="text-[11px] text-slate-500 uppercase tracking-wider">Total value</div>
              <div class="text-[13px] font-semibold text-slate-900">{value}</div>
            </div>
            <div class="kanban-col-body">{cards}</div>
          </div>
        """

    return """
  <div class="flex flex-col h-full">
    <!-- Pipeline switcher -->
    <div class="px-8 pt-6 pb-3 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <h1 class="font-display text-[22px] font-semibold tracking-tight text-slate-900">Sales pipeline</h1>
        <button class="btn-ghost !text-[12px]"><i data-lucide="chevron-down" class="icon-sm text-slate-400"></i></button>
        <span class="badge badge-neutral">5 stages</span>
        <span class="badge badge-neutral">26 open opps</span>
        <span class="badge badge-indigo">₹ 85.2 L total value</span>
      </div>
      <div class="flex items-center gap-2">
        <div class="flex items-center bg-white border border-slate-300 rounded-md">
          <button class="px-2.5 py-1.5 text-indigo-600 bg-indigo-50 rounded-l-md flex items-center gap-1.5 text-[12px] font-medium"><i data-lucide="kanban" class="icon-sm"></i> Board</button>
          <button class="px-2.5 py-1.5 text-slate-500 hover:bg-slate-50 flex items-center gap-1.5 text-[12px]"><i data-lucide="list" class="icon-sm"></i> List</button>
          <button class="px-2.5 py-1.5 text-slate-500 hover:bg-slate-50 flex items-center gap-1.5 text-[12px]"><i data-lucide="bar-chart-3" class="icon-sm"></i> Forecast</button>
        </div>
        <button class="btn-secondary"><i data-lucide="filter" class="icon-sm"></i> Filter</button>
        <button class="btn-primary"><i data-lucide="plus" class="icon-sm"></i> New opportunity</button>
      </div>
    </div>

    <div class="px-8 pb-3 flex items-center gap-2 border-b border-slate-200 bg-slate-50/40">
      <button class="badge badge-indigo">Owner: Anyone</button>
      <button class="badge badge-neutral">Source: Any</button>
      <button class="badge badge-neutral">Close date: This quarter</button>
      <button class="badge badge-neutral">Value: Any</button>
      <button class="badge badge-neutral">+ Add filter</button>
    </div>

    <div class="flex-1 overflow-x-auto scroll-clean">
      <div class="flex gap-4 p-6 min-w-min">""" + cols + """</div>
    </div>
  </div>
    """


# ─────────────────────── 11. Calendar ───────────────────────
def s11_calendar():
    days = ["Mon 18", "Tue 19", "Wed 20", "Thu 21", "Fri 22", "Sat 23", "Sun 24"]
    hours = ["8 AM", "9 AM", "10 AM", "11 AM", "12 PM", "1 PM", "2 PM", "3 PM", "4 PM", "5 PM", "6 PM"]
    # event positions: (day_idx 0-6, hour_start, hour_span, title, sub, variant)
    events = [
        (0, 1, 1, "PM stand-up",           "Internal · Teams",         "neutral"),
        (0, 3, 1, "Site walk — HSR",       "Priya Raghavan",           "indigo"),
        (1, 2, 2, "Concept review",        "Aurora Studio · Teams",    "indigo"),
        (1, 6, 1, "Brief discovery",       "Suri Kapoor",              "info"),
        (2, 1, 1, "Vendor sync",           "Voltek + MK Carpenter",    "warning"),
        (2, 4, 2, "Site visit — JP Nagar", "Lakshmi & Ravi",           "indigo"),
        (3, 0, 1, "Coffee — Tanvi Joshi",  "Discovery · MG Road",      "info"),
        (3, 3, 1, "Sample review",         "FabTextiles + Aurora",     "neutral"),
        (4, 2, 3, "Whitefield install QC", "Half-day on site",         "warning"),
        (4, 7, 1, "Weekly review",         "Internal",                 "neutral"),
        (1, 8, 1, "Q3 board update",       "Internal · Outlook",       "neutral"),
    ]
    # Build grid
    cells = ""
    for h_idx, hour in enumerate(hours):
        row = f'<div class="text-[10px] text-slate-400 text-right pr-2 py-1 border-r border-slate-100">{hour}</div>'
        for d_idx in range(7):
            # find events that start at this hour
            ev_in_cell = [e for e in events if e[0] == d_idx and e[1] == h_idx]
            ev_html = ""
            for d, hs, hsp, title, sub, var in ev_in_cell:
                color_map = {
                    "indigo": ("#EEF2FF", "#4F46E5", "#C7D2FE"),
                    "info": ("#E0F2FE", "#0369A1", "#BAE6FD"),
                    "warning": ("#FEF3C7", "#B45309", "#FDE68A"),
                    "neutral": ("#F8FAFC", "#475569", "#E2E8F0"),
                }
                bg, fg, bd = color_map[var]
                ev_html += f'<div class="absolute left-1 right-1 rounded p-1.5 text-[10px] leading-tight overflow-hidden cursor-pointer" style="top:2px;height:calc({hsp*100}% - 4px);background:{bg};border-left:3px solid {fg};color:{fg};border-top:1px solid {bd};border-right:1px solid {bd};border-bottom:1px solid {bd}"><div class="font-semibold truncate" style="color:{fg}">{title}</div><div class="opacity-75 truncate">{sub}</div></div>'
            row += f'<div class="relative border-r border-b border-slate-100 h-[60px]">{ev_html}</div>'
        cells += f'<div class="grid grid-cols-[60px_repeat(7,1fr)]">{row}</div>'

    day_headers = '<div class="border-r border-b border-slate-100 bg-slate-50/40 h-12"></div>'
    for d in days:
        is_today = "Mon 18" in d
        bg = "bg-indigo-50" if is_today else "bg-slate-50/40"
        fg = "text-indigo-700" if is_today else "text-slate-700"
        day_headers += f'<div class="border-r border-b border-slate-100 {bg} h-12 flex flex-col items-center justify-center"><div class="text-[10px] text-slate-500 uppercase">{d.split()[0]}</div><div class="text-[15px] {fg} font-semibold">{d.split()[1]}</div></div>'

    return f"""
  <div class="flex h-full">
    <!-- Main calendar -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <div class="px-8 pt-6 pb-4 flex items-center justify-between">
        <div class="flex items-center gap-4">
          <button class="btn-primary"><i data-lucide="plus" class="icon-sm"></i> New event</button>
          <div class="flex items-center gap-1">
            <button class="btn-icon"><i data-lucide="chevron-left" class="icon-sm"></i></button>
            <button class="btn-icon"><i data-lucide="chevron-right" class="icon-sm"></i></button>
            <button class="btn-ghost !text-[12px]">Today</button>
          </div>
          <h1 class="font-display text-[18px] font-semibold text-slate-900">May 18 — 24, 2026</h1>
        </div>
        <div class="flex items-center gap-2">
          <div class="flex items-center bg-white border border-slate-300 rounded-md">
            <button class="px-2.5 py-1.5 text-slate-500 hover:bg-slate-50 text-[12px] rounded-l-md">Day</button>
            <button class="px-2.5 py-1.5 text-indigo-600 bg-indigo-50 text-[12px] font-medium">Week</button>
            <button class="px-2.5 py-1.5 text-slate-500 hover:bg-slate-50 text-[12px]">Month</button>
            <button class="px-2.5 py-1.5 text-slate-500 hover:bg-slate-50 text-[12px] rounded-r-md">Agenda</button>
          </div>
          <button class="btn-secondary"><i data-lucide="link" class="icon-sm"></i> Booking link</button>
        </div>
      </div>
      <div class="flex-1 overflow-auto border-t border-slate-200">
        <div class="grid grid-cols-[60px_repeat(7,1fr)]">{day_headers}</div>
        {cells}
      </div>
    </div>

    <!-- Right rail: booking page + calendars -->
    <aside class="w-[340px] border-l border-slate-200 bg-slate-50/30 overflow-auto">
      <div class="p-5 border-b border-slate-200 bg-white">
        <div class="text-[12px] font-semibold uppercase tracking-wider text-slate-500 mb-3">Public booking page</div>
        <div class="border border-slate-200 rounded-lg bg-white p-4">
          <div class="dm-brand mb-3">
            <span class="dm-brand-glyph">D</span>
            <span class="text-[12px]">DesignersMeet</span>
          </div>
          <div class="text-[14px] font-semibold text-slate-900">Book a discovery call with Manish</div>
          <div class="text-[11.5px] text-slate-500 mt-1">30 minutes · Google Meet or Teams</div>
          <div class="mt-4">
            <div class="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-2">Select a date</div>
            <div class="grid grid-cols-7 gap-1 text-center text-[10px]">
              <div class="text-slate-400">S</div><div class="text-slate-400">M</div><div class="text-slate-400">T</div><div class="text-slate-400">W</div><div class="text-slate-400">T</div><div class="text-slate-400">F</div><div class="text-slate-400">S</div>
              {''.join(f'<div class="py-1.5 rounded text-slate-300">{d}</div>' for d in range(1,4))}
              {''.join(f'<div class="py-1.5 rounded text-slate-700 hover:bg-indigo-50 cursor-pointer">{d}</div>' for d in range(4,18))}
              <div class="py-1.5 rounded bg-indigo-600 text-white font-semibold">18</div>
              {''.join(f'<div class="py-1.5 rounded text-slate-700 hover:bg-indigo-50 cursor-pointer">{d}</div>' for d in range(19,32))}
            </div>
          </div>
          <div class="mt-4">
            <div class="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-2">Available · Mon May 18</div>
            <div class="grid grid-cols-3 gap-1.5">
              <button class="border border-slate-200 rounded py-1.5 text-[11px] text-slate-700 hover:border-indigo-600 hover:text-indigo-600">9:30</button>
              <button class="border border-indigo-600 bg-indigo-50 rounded py-1.5 text-[11px] text-indigo-700 font-semibold">10:00</button>
              <button class="border border-slate-200 rounded py-1.5 text-[11px] text-slate-700 hover:border-indigo-600 hover:text-indigo-600">10:30</button>
              <button class="border border-slate-200 rounded py-1.5 text-[11px] text-slate-700 hover:border-indigo-600 hover:text-indigo-600">2:00</button>
              <button class="border border-slate-200 rounded py-1.5 text-[11px] text-slate-700 hover:border-indigo-600 hover:text-indigo-600">2:30</button>
              <button class="border border-slate-200 rounded py-1.5 text-[11px] text-slate-700 hover:border-indigo-600 hover:text-indigo-600">5:00</button>
            </div>
          </div>
          <button class="btn-primary w-full justify-center mt-4">Confirm booking</button>
          <div class="text-[10px] text-slate-400 mt-3 text-center">Powered by DesignersMeet · book.designersmeet.com/manish</div>
        </div>
      </div>

      <div class="p-5">
        <div class="text-[12px] font-semibold uppercase tracking-wider text-slate-500 mb-3">My calendars</div>
        <div class="space-y-1">
          <label class="flex items-center gap-2.5 text-[12.5px] text-slate-700">
            <input type="checkbox" checked class="rounded border-slate-300" style="accent-color:#4F46E5" />
            <span class="w-3 h-3 rounded-sm bg-indigo-500"></span>
            <span>Personal (Outlook)</span>
          </label>
          <label class="flex items-center gap-2.5 text-[12.5px] text-slate-700">
            <input type="checkbox" checked class="rounded border-slate-300" style="accent-color:#0284C7" />
            <span class="w-3 h-3 rounded-sm bg-sky-500"></span>
            <span>Discovery calls</span>
          </label>
          <label class="flex items-center gap-2.5 text-[12.5px] text-slate-700">
            <input type="checkbox" checked class="rounded border-slate-300" style="accent-color:#B45309" />
            <span class="w-3 h-3 rounded-sm bg-amber-500"></span>
            <span>Site visits</span>
          </label>
          <label class="flex items-center gap-2.5 text-[12.5px] text-slate-700">
            <input type="checkbox" class="rounded border-slate-300" />
            <span class="w-3 h-3 rounded-sm bg-slate-400"></span>
            <span>Team — Anita M.</span>
          </label>
          <label class="flex items-center gap-2.5 text-[12.5px] text-slate-700">
            <input type="checkbox" class="rounded border-slate-300" />
            <span class="w-3 h-3 rounded-sm bg-slate-400"></span>
            <span>Team — Rohit</span>
          </label>
        </div>

        <div class="text-[12px] font-semibold uppercase tracking-wider text-slate-500 mb-3 mt-6">Bookable services</div>
        <div class="space-y-1.5">
          <div class="flex items-center justify-between p-2.5 border border-slate-200 rounded-md bg-white">
            <div>
              <div class="text-[12.5px] font-semibold text-slate-900">Discovery — 30 min</div>
              <div class="text-[11px] text-slate-500">Round-robin · 12 bookings</div>
            </div>
            <button class="btn-icon"><i data-lucide="copy" class="icon-sm"></i></button>
          </div>
          <div class="flex items-center justify-between p-2.5 border border-slate-200 rounded-md bg-white">
            <div>
              <div class="text-[12.5px] font-semibold text-slate-900">Site walk — 90 min</div>
              <div class="text-[11px] text-slate-500">Manish only · 6 bookings</div>
            </div>
            <button class="btn-icon"><i data-lucide="copy" class="icon-sm"></i></button>
          </div>
        </div>
      </div>
    </aside>
  </div>
    """


# ─────────────────────── 12. Conversations inbox ───────────────────────
def s12_conversations():
    threads = [
        ("PR","d","Priya Raghavan","RE: Lumen concept board v2", "Looks gorgeous. Two small tweaks — the brass detail above…", "11:21", "email", True, 1),
        ("AS","b","Aurora Studio","Concept board v3 uploaded", "Sharing v3 with the revisions we discussed yesterday. Brass…", "10:02", "email", True, 0),
        ("VE","e","Voltek Electricals","Need MCB spec confirmation", "Hi Manish, blocked on the MCB rating for the kitchen circuit…", "9:14", "whatsapp", True, 2),
        ("MK","c","Manjunath Karpenter Co","Carpentry shop drawings — v1", "Attaching the first cut. Will revise after tomorrow's site visit.", "Yesterday", "email", False, 0),
        ("SK","f","Suri Kapoor","Discovery call confirmation", "Confirming 4pm today on Teams.", "Yesterday", "email", False, 0),
        ("LR","g","Lakshmi & Ravi","Snag list — site visit 4", "Punch list attached. Most items resolved!", "May 16", "email", False, 0),
        ("DN","h","Deepa Nair","Re: Studio Saffron — Q3 newsletter", "Loved the project highlight! Sharing internally.", "May 15", "email", False, 0),
        ("FT","a","FabTextiles","Cane fabric — alt swatches", "Sending two alternates. Option B has the warmer undertone…", "May 14", "whatsapp", False, 0),
    ]
    list_html = ""
    for i, (ini,var,name,subj,prev,when,ch,active,unread) in enumerate(threads):
        is_active = (i == 0)
        bg = "bg-indigo-50/60 border-l-2 border-l-indigo-600" if is_active else "border-l-2 border-l-transparent"
        unread_dot = '<span class="w-2 h-2 rounded-full bg-indigo-600 flex-shrink-0"></span>' if unread else ''
        ch_badge = f'<span class="channel-badge channel-{ch}">{ch}</span>'
        title_weight = "font-semibold" if unread else "font-medium"
        list_html += f"""
          <div class="px-4 py-3 {bg} hover:bg-slate-50 cursor-pointer border-b border-slate-100">
            <div class="flex items-start gap-2.5">
              {_avatar(ini, var, "")}
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between gap-2">
                  <span class="text-[13px] {title_weight} text-slate-900 truncate">{name}</span>
                  <span class="text-[10px] text-slate-400 flex-shrink-0">{when}</span>
                </div>
                <div class="text-[12px] {title_weight} text-slate-700 truncate mt-0.5">{subj}</div>
                <div class="text-[11.5px] text-slate-500 truncate mt-0.5">{prev}</div>
                <div class="flex items-center gap-2 mt-1.5">{ch_badge}{unread_dot}</div>
              </div>
            </div>
          </div>
        """

    return f"""
  <div class="flex h-full">
    <!-- Inbox list -->
    <aside class="w-[340px] border-r border-slate-200 flex flex-col">
      <div class="px-4 py-3 border-b border-slate-200">
        <div class="flex items-center justify-between mb-3">
          <h2 class="font-semibold text-[15px] text-slate-900">Inbox</h2>
          <button class="btn-primary !text-[12px] !px-2.5 !py-1"><i data-lucide="pencil" class="icon-sm"></i> Compose</button>
        </div>
        <div class="dm-search">
          <i data-lucide="search"></i>
          <input placeholder="Search messages…" />
        </div>
        <div class="flex items-center gap-1 mt-3 text-[11px]">
          <button class="badge badge-indigo">All <span class="text-indigo-400 ml-1">137</span></button>
          <button class="badge badge-neutral">Unread <span class="text-slate-500 ml-1">12</span></button>
          <button class="badge badge-neutral">Assigned to me <span class="text-slate-500 ml-1">8</span></button>
        </div>
      </div>
      <div class="flex-1 overflow-y-auto">{list_html}</div>
    </aside>

    <!-- Thread view -->
    <div class="flex-1 flex flex-col overflow-hidden min-w-0">
      <div class="px-6 py-3 border-b border-slate-200 flex items-center gap-3">
        <div class="flex-1">
          <div class="text-[15px] font-semibold text-slate-900">RE: Lumen concept board v2</div>
          <div class="text-[12px] text-slate-500 mt-0.5 flex items-center gap-2">
            <span>3 participants</span>·
            <span class="channel-badge channel-email">email</span>
            <span class="channel-badge channel-note">internal note</span>
          </div>
        </div>
        <button class="btn-secondary"><i data-lucide="user-plus" class="icon-sm"></i> Assign</button>
        <button class="btn-secondary"><i data-lucide="tag" class="icon-sm"></i> Label</button>
        <button class="btn-icon"><i data-lucide="archive" class="icon-sm"></i></button>
        <button class="btn-icon"><i data-lucide="more-horizontal" class="icon-sm"></i></button>
      </div>

      <div class="flex-1 overflow-auto px-6 py-5 space-y-4 bg-slate-50/30">
        {_msg("MS","a","Manish","Sent via Outlook · May 14 at 5:02 PM","Hi Priya — sharing the latest concept board from Aurora. Let us know what jumps out; we can iterate before the Wednesday call.","email")}
        {_msg("PR","d","Priya Raghavan","Received via Outlook · Yesterday at 4:21 PM","Looks gorgeous! Two small tweaks — the brass detail above the bar feels heavy, and I'd like to see the cane chair fabric in a warmer tone. Otherwise approved — let's move to procurement after this round.","email")}
        {_msg("MS","a","Manish (internal note)","Internal note · Today at 9:18 AM","@Anita — let's get Aurora to revise just the brass + fabric. Also flag for cross-sell after this project: Priya mentioned a Pune outlet.","note")}
        {_msg("AS","b","Aurora Studio","Sent via Outlook · Today at 10:02 AM","v3 uploaded — brass simplified, two cane fabric options from FabTextiles (slide 12). Holding on procurement pending your sign-off.","email")}
      </div>

      <!-- Reply composer -->
      <div class="border-t border-slate-200 bg-white">
        <div class="px-6 py-2 border-b border-slate-100 flex items-center gap-3 text-[12px]">
          <span class="text-slate-500">Reply via</span>
          <div class="flex items-center bg-slate-100 rounded-md p-0.5">
            <button class="px-2.5 py-1 bg-white shadow-sm rounded text-slate-900 font-medium">📧 Email</button>
            <button class="px-2.5 py-1 text-slate-500">💬 WhatsApp</button>
            <button class="px-2.5 py-1 text-slate-500">🟡 Internal note</button>
          </div>
          <span class="text-slate-400 ml-auto">Sending as <span class="font-medium text-slate-700">manish@designersmeet.com</span> via Microsoft Graph</span>
        </div>
        <div class="px-6 py-3">
          <textarea class="w-full text-[13.5px] resize-none focus:outline-none" rows="4" placeholder="Type your reply… (⌘+Enter to send)">Priya — v3 looks great. Going to share with the bar-fit vendors today and lock procurement Friday.

Best,
Manish</textarea>
          <div class="flex items-center justify-between mt-2">
            <div class="flex items-center gap-1">
              <button class="btn-icon"><i data-lucide="paperclip" class="icon-sm"></i></button>
              <button class="btn-icon"><i data-lucide="link" class="icon-sm"></i></button>
              <button class="btn-icon"><i data-lucide="sparkles" class="icon-sm text-indigo-500"></i></button>
              <button class="btn-icon"><i data-lucide="image" class="icon-sm"></i></button>
            </div>
            <div class="flex items-center gap-2">
              <button class="btn-secondary !text-[12px]">Save draft</button>
              <button class="btn-primary"><i data-lucide="send" class="icon-sm"></i> Send</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Right context rail -->
    <aside class="w-[300px] border-l border-slate-200 overflow-auto bg-slate-50/20">
      <div class="p-5 border-b border-slate-200 bg-white">
        <div class="flex items-center gap-3">
          {_avatar("PR", "d", "lg")}
          <div class="flex-1 min-w-0">
            <div class="text-[14px] font-semibold text-slate-900 truncate">Priya Raghavan</div>
            <div class="text-[11px] text-slate-500 truncate">Founder · Lumen Café</div>
          </div>
        </div>
        <div class="flex items-center gap-2 mt-3">
          <button class="btn-ghost !text-[11px] flex-1 justify-center"><i data-lucide="user" class="icon-sm"></i> Profile</button>
          <button class="btn-ghost !text-[11px] flex-1 justify-center"><i data-lucide="phone" class="icon-sm"></i> Call</button>
        </div>
      </div>

      <div class="p-5">
        <div class="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-2">Active project</div>
        <div class="dm-card !p-3 mb-4">
          <div class="text-[13px] font-semibold text-slate-900">Brand Refresh — Lumen Café</div>
          <div class="text-[11px] text-slate-500 mt-1">Design phase · 62%</div>
          <div class="dm-progress mt-2"><div style="width:62%"></div></div>
        </div>

        <div class="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-2">Open invoices</div>
        <div class="dm-card !p-3 mb-4">
          <div class="flex items-center justify-between">
            <div>
              <div class="text-[13px] font-semibold text-slate-900">INV-2026-0142</div>
              <div class="text-[11px] text-slate-500">Due May 28</div>
            </div>
            <div class="text-[13px] font-semibold text-slate-900">₹ 4.6 L</div>
          </div>
        </div>

        <div class="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-2">Recent deliverables</div>
        <div class="space-y-1.5 mb-4">
          <div class="text-[12px] text-slate-700 flex items-center gap-2"><i data-lucide="file-text" class="icon-sm text-slate-400"></i> Concept board v3</div>
          <div class="text-[12px] text-slate-700 flex items-center gap-2"><i data-lucide="file-text" class="icon-sm text-slate-400"></i> Material palette v2</div>
          <div class="text-[12px] text-slate-700 flex items-center gap-2"><i data-lucide="file-text" class="icon-sm text-slate-400"></i> Brand mark refresh</div>
        </div>

        <div class="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-2">Upcoming</div>
        <div class="text-[12px] text-slate-700">
          <div class="font-medium">Today 11:00 AM</div>
          <div class="text-slate-500">Site walk-through · HSR Penthouse</div>
        </div>
      </div>
    </aside>
  </div>
    """


def _msg(ini, var, name, meta, body, channel):
    ch_classes = {
        "email": "border-l-indigo-500 bg-white",
        "whatsapp": "border-l-emerald-500 bg-white",
        "note": "border-l-amber-400 bg-amber-50/40"
    }
    return f"""
        <div class="flex gap-3">
          {_avatar(ini, var, "")}
          <div class="flex-1 min-w-0">
            <div class="text-[12px] text-slate-500"><span class="font-medium text-slate-900">{name}</span> · {meta}</div>
            <div class="mt-1.5 border border-slate-200 border-l-2 {ch_classes[channel]} rounded-md p-3 text-[13px] text-slate-700 leading-relaxed whitespace-pre-line">{body}</div>
          </div>
        </div>
    """


# ─────────────────────── 13. Workflows ───────────────────────
def s13_workflows():
    return """
  <div class="flex h-full">
    <!-- Workflow list -->
    <aside class="w-[280px] border-r border-slate-200 flex flex-col">
      <div class="px-4 py-3 border-b border-slate-200">
        <div class="flex items-center justify-between mb-3">
          <h2 class="font-semibold text-[15px] text-slate-900">Workflows</h2>
          <button class="btn-primary !text-[12px] !px-2.5 !py-1"><i data-lucide="plus" class="icon-sm"></i> New</button>
        </div>
        <div class="dm-search"><i data-lucide="search"></i><input placeholder="Filter…" /></div>
      </div>
      <div class="flex-1 overflow-y-auto p-2 space-y-1">
        """ + _workflow_list_item("Vendor onboarding sequence",   "Form submitted",         "Live",     12, True) + """
        """ + _workflow_list_item("Won opportunity → project",     "Pipeline stage = Won",   "Live",     34, False) + """
        """ + _workflow_list_item("Deliverable approved → next ms","Deliverable approved",   "Live",     22, False) + """
        """ + _workflow_list_item("Vendor NDA expiring (30d)",     "Daily cron",             "Live",      4, False) + """
        """ + _workflow_list_item("Client status digest (weekly)", "Sunday 6 PM",            "Live",      8, False) + """
        """ + _workflow_list_item("Booking → SMS reminder",        "Booking created",        "Paused",   18, False) + """
        """ + _workflow_list_item("Tag added: Hot lead",           "Tag applied",            "Draft",     0, False) + """
        """ + _workflow_list_item("Shopify order → vendor fee",    "Webhook: orders/paid",   "Draft",     0, False) + """
      </div>
    </aside>

    <!-- Builder canvas -->
    <div class="flex-1 flex flex-col overflow-hidden min-w-0">
      <div class="px-6 py-3 border-b border-slate-200 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div>
            <div class="flex items-center gap-2">
              <h1 class="font-semibold text-[16px] text-slate-900">Vendor onboarding sequence</h1>
              <span class="badge badge-success badge-dot">Live</span>
            </div>
            <div class="text-[11.5px] text-slate-500">12 runs this month · 100% success · last run 4h ago</div>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <button class="btn-ghost !text-[12px]"><i data-lucide="history" class="icon-sm"></i> Run history</button>
          <button class="btn-secondary"><i data-lucide="play" class="icon-sm"></i> Test run</button>
          <button class="btn-secondary"><i data-lucide="pause" class="icon-sm"></i> Pause</button>
          <button class="btn-primary"><i data-lucide="save" class="icon-sm"></i> Save</button>
        </div>
      </div>

      <div class="flex-1 overflow-auto p-8 bg-slate-50/30">
        <div class="max-w-[640px] mx-auto">
          <!-- Trigger -->
          """ + _wf_node("trigger", "When form is submitted", "Form: Vendor onboarding (vendor-onboarding · public)", "zap", "indigo") + """
          """ + _wf_arrow() + """
          <!-- Filter -->
          """ + _wf_filter() + """
          """ + _wf_arrow() + """
          <!-- Actions -->
          """ + _wf_node("action", "1. Apply tag", "Add tag “New vendor — pending review” to contact", "tag", "info") + """
          """ + _wf_arrow() + """
          """ + _wf_node("action", "2. Create vendor draft", "Create Contact (type=vendor) with profile from form", "user-plus", "info") + """
          """ + _wf_arrow() + """
          """ + _wf_node("action", "3. Send welcome email", "Template: vendor-welcome · sender: mail.designersmeet.com (Resend) · traffic: system_transactional", "mail", "info") + """
          """ + _wf_arrow() + """
          """ + _wf_node("action", "4. Send WhatsApp template", "Template: VENDOR_WELCOME_V2 · channel: WhatsApp Cloud API · approved", "message-circle", "info") + """
          """ + _wf_arrow() + """
          """ + _wf_node("action", "5. Wait 3 days", "Pause workflow run, resume on May 21", "clock", "neutral") + """
          """ + _wf_arrow() + """
          """ + _wf_node("action", "6. Post to Teams channel", "Channel: #vendor-onboarding · message: “New vendor {name} ready for review”", "users-round", "info") + """
          """ + _wf_arrow() + """
          """ + _wf_node("action", "7. Create task for PM", "Assign to: Manish · title: “Review new vendor {name}” · due: +2d", "check-square", "info") + """

          <!-- Add step button -->
          <div class="flex justify-center mt-2">
            <button class="btn-secondary !text-[12px]"><i data-lucide="plus" class="icon-sm"></i> Add step</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Right inspector -->
    <aside class="w-[300px] border-l border-slate-200 overflow-auto bg-white">
      <div class="px-5 py-3 border-b border-slate-200">
        <div class="text-[12px] font-semibold uppercase tracking-wider text-slate-500">Inspector</div>
        <div class="text-[15px] font-semibold text-slate-900 mt-1">Send welcome email</div>
      </div>
      <div class="p-5 space-y-4">
        <div>
          <label class="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Email provider</label>
          <select class="dm-input">
            <option>Resend (mail.designersmeet.com) — system_transactional</option>
            <option>Microsoft Graph — human_outbound</option>
            <option>Postmark — system_transactional</option>
          </select>
        </div>
        <div>
          <label class="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Template</label>
          <select class="dm-input">
            <option>vendor-welcome (v3)</option>
            <option>vendor-welcome (v2 — archived)</option>
          </select>
        </div>
        <div>
          <label class="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Subject</label>
          <input class="dm-input" value="Welcome to DesignersMeet, {{contact.first_name}}" />
        </div>
        <div>
          <label class="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Variables available</label>
          <div class="flex flex-wrap gap-1.5">
            <span class="badge badge-neutral">{{contact.first_name}}</span>
            <span class="badge badge-neutral">{{vendor.skills}}</span>
            <span class="badge badge-neutral">{{vendor.regions}}</span>
            <span class="badge badge-neutral">{{onboarding_link}}</span>
          </div>
        </div>
        <div>
          <label class="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1.5">On failure</label>
          <select class="dm-input">
            <option>Skip & continue · log error</option>
            <option>Pause workflow run</option>
            <option>Retry once after 30 min</option>
          </select>
        </div>
        <div class="pt-3 border-t border-slate-100">
          <div class="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-2">Last 5 runs</div>
          <div class="space-y-1.5 text-[12px]">
            <div class="flex items-center justify-between"><span class="text-slate-700">4h ago</span><span class="badge badge-success">success</span></div>
            <div class="flex items-center justify-between"><span class="text-slate-700">1d ago</span><span class="badge badge-success">success</span></div>
            <div class="flex items-center justify-between"><span class="text-slate-700">2d ago</span><span class="badge badge-success">success</span></div>
            <div class="flex items-center justify-between"><span class="text-slate-700">3d ago</span><span class="badge badge-success">success</span></div>
            <div class="flex items-center justify-between"><span class="text-slate-700">5d ago</span><span class="badge badge-warning">retried</span></div>
          </div>
        </div>
      </div>
    </aside>
  </div>
    """


def _workflow_list_item(name, trigger, status, runs, active):
    bg = "bg-indigo-50/60 border-indigo-200" if active else "bg-white border-slate-200"
    pill = {
        "Live":   '<span class="badge badge-success badge-dot">Live</span>',
        "Paused": '<span class="badge badge-warning badge-dot">Paused</span>',
        "Draft":  '<span class="badge badge-neutral badge-dot">Draft</span>',
    }[status]
    return f"""
        <div class="border {bg} rounded-md px-3 py-2.5 cursor-pointer hover:bg-slate-50">
          <div class="flex items-start justify-between gap-2">
            <div class="text-[12.5px] font-semibold text-slate-900 leading-snug min-w-0">{name}</div>
            {pill}
          </div>
          <div class="text-[11px] text-slate-500 mt-1 truncate">{trigger}</div>
          <div class="text-[10.5px] text-slate-400 mt-1">{runs} runs · 30d</div>
        </div>
    """


def _wf_node(kind, title, body, icon, color):
    color_map = {
        "indigo": ("#EEF2FF", "#4F46E5"),
        "info":   ("#FFFFFF", "#475569"),
        "neutral":("#F8FAFC", "#475569"),
    }
    bg, fg = color_map[color]
    border = "border-indigo-300" if color == "indigo" else "border-slate-200"
    label = "TRIGGER" if kind == "trigger" else "ACTION"
    return f"""
        <div class="border-2 {border} rounded-lg p-4 bg-white shadow-sm">
          <div class="flex items-start gap-3">
            <div class="w-9 h-9 rounded-md flex items-center justify-center flex-shrink-0" style="background:{bg};color:{fg}">
              <i data-lucide="{icon}" class="icon-lg"></i>
            </div>
            <div class="flex-1 min-w-0">
              <div class="text-[10px] font-semibold uppercase tracking-wider text-slate-500">{label}</div>
              <div class="text-[14px] font-semibold text-slate-900 mt-0.5">{title}</div>
              <div class="text-[12px] text-slate-600 mt-1 leading-snug">{body}</div>
            </div>
            <button class="btn-icon"><i data-lucide="more-horizontal" class="icon-sm"></i></button>
          </div>
        </div>
    """


def _wf_filter():
    return """
        <div class="border border-amber-200 bg-amber-50/60 rounded-lg p-3.5">
          <div class="flex items-start gap-3">
            <div class="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 bg-amber-100 text-amber-700">
              <i data-lucide="filter" class="icon-sm"></i>
            </div>
            <div class="flex-1">
              <div class="text-[10px] font-semibold uppercase tracking-wider text-amber-700">FILTER</div>
              <div class="text-[12.5px] text-slate-700 mt-0.5">
                <span class="font-mono">vendor.tier ≠ "Tier-3"</span>
                <span class="text-slate-400 mx-1.5">AND</span>
                <span class="font-mono">contact.email_verified = true</span>
              </div>
            </div>
          </div>
        </div>
    """


def _wf_arrow():
    return '<div class="flex justify-center py-1"><div class="w-px h-6 bg-slate-300"></div></div>'


# ─────────────────────── 14. Forms builder ───────────────────────
def s14_forms():
    return """
  <div class="flex h-full">
    <!-- Field types palette -->
    <aside class="w-[240px] border-r border-slate-200 flex flex-col bg-slate-50/40">
      <div class="px-4 py-3 border-b border-slate-200 bg-white">
        <div class="text-[12px] font-semibold uppercase tracking-wider text-slate-500">Field types</div>
      </div>
      <div class="flex-1 overflow-y-auto p-3 space-y-2">
        <div class="text-[10.5px] font-semibold uppercase tracking-wider text-slate-400 px-2 mb-1">Text</div>
        """ + _field_type("Short text", "text-cursor-input") + """
        """ + _field_type("Long text", "align-left") + """
        """ + _field_type("Rich text", "type") + """

        <div class="text-[10.5px] font-semibold uppercase tracking-wider text-slate-400 px-2 mb-1 mt-3">Contact</div>
        """ + _field_type("Email", "mail") + """
        """ + _field_type("Phone", "phone") + """
        """ + _field_type("Address", "map-pin") + """

        <div class="text-[10.5px] font-semibold uppercase tracking-wider text-slate-400 px-2 mb-1 mt-3">Choice</div>
        """ + _field_type("Dropdown", "chevron-down-square") + """
        """ + _field_type("Radio", "circle") + """
        """ + _field_type("Checkboxes", "check-square") + """
        """ + _field_type("Multi-select", "list-checks") + """

        <div class="text-[10.5px] font-semibold uppercase tracking-wider text-slate-400 px-2 mb-1 mt-3">Other</div>
        """ + _field_type("Number", "hash") + """
        """ + _field_type("Date", "calendar") + """
        """ + _field_type("File upload", "upload") + """
        """ + _field_type("Section break", "minus") + """
      </div>
    </aside>

    <!-- Canvas -->
    <div class="flex-1 flex flex-col overflow-hidden min-w-0">
      <div class="px-6 py-3 border-b border-slate-200 flex items-center justify-between">
        <div>
          <div class="flex items-center gap-2">
            <h1 class="font-semibold text-[16px] text-slate-900">Vendor onboarding form</h1>
            <span class="badge badge-success badge-dot">Published</span>
          </div>
          <div class="text-[11.5px] text-slate-500 flex items-center gap-2 mt-0.5">
            <i data-lucide="link" class="icon-sm"></i>
            <code class="font-mono text-[11px] bg-slate-100 px-1.5 py-0.5 rounded">forms.designersmeet.com/vendor-onboarding</code>
            <button class="btn-icon !w-5 !h-5"><i data-lucide="copy" class="icon-sm"></i></button>
            <span>· 47 submissions · last 2h ago</span>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <div class="flex items-center bg-white border border-slate-300 rounded-md">
            <button class="px-2.5 py-1.5 text-indigo-600 bg-indigo-50 rounded-l-md flex items-center gap-1.5 text-[12px] font-medium"><i data-lucide="pencil-ruler" class="icon-sm"></i> Build</button>
            <button class="px-2.5 py-1.5 text-slate-500 hover:bg-slate-50 flex items-center gap-1.5 text-[12px]"><i data-lucide="eye" class="icon-sm"></i> Preview</button>
            <button class="px-2.5 py-1.5 text-slate-500 hover:bg-slate-50 flex items-center gap-1.5 text-[12px]"><i data-lucide="code" class="icon-sm"></i> Embed</button>
            <button class="px-2.5 py-1.5 text-slate-500 hover:bg-slate-50 rounded-r-md flex items-center gap-1.5 text-[12px]"><i data-lucide="zap" class="icon-sm"></i> Logic</button>
          </div>
          <button class="btn-secondary">Save draft</button>
          <button class="btn-primary"><i data-lucide="check" class="icon-sm"></i> Publish</button>
        </div>
      </div>

      <div class="flex-1 overflow-auto p-8 bg-slate-100/40">
        <div class="max-w-[640px] mx-auto bg-white border border-slate-200 rounded-lg shadow-sm">
          <!-- Form header -->
          <div class="px-7 py-6 border-b border-slate-100">
            <div class="dm-brand mb-3"><span class="dm-brand-glyph">D</span><span class="text-[12px]">DesignersMeet</span></div>
            <h2 class="font-display text-[22px] font-semibold text-slate-900 tracking-tight">Vendor onboarding</h2>
            <p class="text-[13px] text-slate-500 mt-1">Tell us about your studio and we'll get you set up in the DesignersMeet vendor pool.</p>
          </div>

          <div class="px-7 py-6 space-y-5">
            """ + _form_field("Studio / company name", "short text", "Required", True, "Aurora Studio") + """
            """ + _form_field("Primary contact email", "email", "Required", True, "hello@aurorastudio.in") + """
            """ + _form_field("WhatsApp number", "phone", "Required", False, "+91 80 4123 5678") + """
            """ + _form_field("Skills / disciplines", "multi-select", "Required · 1–6 selections", False, "", multi=True) + """
            """ + _form_field("Regions you serve", "multi-select", "Required", False, "", multi=True, regions=True) + """
            """ + _form_field("Years in business", "number", "Optional", False, "8") + """
            """ + _form_field("Portfolio link", "url", "Required", False, "https://aurorastudio.in/work") + """
            """ + _form_field("Upload latest case studies (PDF)", "file upload", "Optional · max 25MB", False, "") + """

            <div class="pt-5 border-t border-slate-100 flex items-center justify-between">
              <label class="flex items-center gap-2 text-[12px] text-slate-600"><input type="checkbox" class="rounded border-slate-300" /> I agree to the vendor terms.</label>
              <button class="btn-primary" disabled style="opacity:0.7">Submit application</button>
            </div>
          </div>
        </div>

        <!-- On-submit hint -->
        <div class="max-w-[640px] mx-auto mt-4 flex items-center gap-3 px-4 py-3 bg-indigo-50/50 border border-indigo-100 rounded-md">
          <i data-lucide="zap" class="icon-sm text-indigo-600 flex-shrink-0"></i>
          <div class="text-[12px] text-slate-700 flex-1">On submit, this form triggers the workflow <span class="font-semibold">Vendor onboarding sequence</span> (7 steps).</div>
          <a class="text-[12px] text-indigo-600 font-medium hover:underline">Edit workflow →</a>
        </div>
      </div>
    </div>

    <!-- Field inspector -->
    <aside class="w-[280px] border-l border-slate-200 overflow-auto bg-white">
      <div class="px-5 py-3 border-b border-slate-200">
        <div class="text-[10.5px] font-semibold uppercase tracking-wider text-slate-500">Selected field</div>
        <div class="text-[14px] font-semibold text-slate-900 mt-1">Skills / disciplines</div>
        <div class="text-[11px] text-slate-500">Multi-select</div>
      </div>
      <div class="p-5 space-y-4">
        <div>
          <label class="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Label</label>
          <input class="dm-input" value="Skills / disciplines" />
        </div>
        <div>
          <label class="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Help text</label>
          <input class="dm-input" value="Pick 1–6 specialities" />
        </div>
        <div>
          <label class="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Options</label>
          <div class="space-y-1.5">
            <div class="flex items-center gap-2"><input class="dm-input flex-1" value="Carpentry" /><button class="btn-icon"><i data-lucide="grip-vertical" class="icon-sm"></i></button></div>
            <div class="flex items-center gap-2"><input class="dm-input flex-1" value="Electrical" /><button class="btn-icon"><i data-lucide="grip-vertical" class="icon-sm"></i></button></div>
            <div class="flex items-center gap-2"><input class="dm-input flex-1" value="Plumbing" /><button class="btn-icon"><i data-lucide="grip-vertical" class="icon-sm"></i></button></div>
            <div class="flex items-center gap-2"><input class="dm-input flex-1" value="Painting & finishes" /><button class="btn-icon"><i data-lucide="grip-vertical" class="icon-sm"></i></button></div>
            <div class="flex items-center gap-2"><input class="dm-input flex-1" value="Soft furnishings" /><button class="btn-icon"><i data-lucide="grip-vertical" class="icon-sm"></i></button></div>
            <div class="flex items-center gap-2"><input class="dm-input flex-1" value="3D / visualization" /><button class="btn-icon"><i data-lucide="grip-vertical" class="icon-sm"></i></button></div>
            <button class="btn-ghost !text-[12px]"><i data-lucide="plus" class="icon-sm"></i> Add option</button>
          </div>
        </div>
        <div>
          <label class="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Required</label>
          <label class="flex items-center gap-2 text-[12.5px] text-slate-700"><input type="checkbox" checked class="rounded border-slate-300" style="accent-color:#4F46E5" /> Required to submit</label>
        </div>
        <div>
          <label class="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Selection limit</label>
          <div class="flex items-center gap-2"><input class="dm-input w-16" value="1" /><span class="text-[12px] text-slate-500">to</span><input class="dm-input w-16" value="6" /></div>
        </div>
        <div>
          <label class="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Maps to contact field</label>
          <select class="dm-input">
            <option>vendor.skills (array)</option>
            <option>custom_fields.skills</option>
            <option>Don't map</option>
          </select>
        </div>
      </div>
    </aside>
  </div>
    """


def _field_type(label, icon):
    return f"""
        <div class="flex items-center gap-2.5 px-2.5 py-2 bg-white border border-slate-200 rounded-md hover:border-indigo-300 hover:bg-indigo-50/30 cursor-grab text-[12.5px] text-slate-700">
          <i data-lucide="{icon}" class="icon-sm text-slate-500"></i>
          <span>{label}</span>
        </div>
    """


def _form_field(label, kind, hint, required, value, multi=False, regions=False):
    is_selected = "Skills" in label
    border = "border-indigo-400 ring-2 ring-indigo-100" if is_selected else "border-slate-200 hover:border-slate-300"
    req = '<span class="text-red-500 ml-0.5">*</span>' if required else ''
    handle = '<button class="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-white border border-slate-200 rounded flex items-center justify-center opacity-0 group-hover:opacity-100"><i data-lucide="grip-vertical" class="icon-sm text-slate-400"></i></button>'

    if kind == "file upload":
        input_html = '<div class="border-2 border-dashed border-slate-200 rounded-md py-6 text-center text-[12px] text-slate-500"><i data-lucide="upload-cloud" class="w-5 h-5 inline-block mb-1 text-slate-400"></i><div>Click or drop a file here</div></div>'
    elif multi and regions:
        input_html = '<div class="flex flex-wrap gap-1.5"><span class="badge badge-indigo">Karnataka ×</span><span class="badge badge-indigo">Tamil Nadu ×</span><span class="badge badge-neutral">+ Add region</span></div>'
    elif multi:
        input_html = '<div class="flex flex-wrap gap-1.5"><span class="badge badge-indigo">Concept design ×</span><span class="badge badge-indigo">3D visualization ×</span><span class="badge badge-neutral">+ Add skill</span></div>'
    else:
        input_html = f'<input class="dm-input" value="{value}" placeholder="Type your answer…" />'

    return f"""
        <div class="group relative border {border} rounded-md p-4">
          {handle}
          <div class="flex items-start justify-between mb-2">
            <div>
              <label class="text-[13px] font-semibold text-slate-900">{label}{req}</label>
              <div class="text-[11px] text-slate-500 mt-0.5">{hint}</div>
            </div>
            <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100">
              <button class="btn-icon !w-6 !h-6"><i data-lucide="copy" class="icon-sm"></i></button>
              <button class="btn-icon !w-6 !h-6"><i data-lucide="trash-2" class="icon-sm"></i></button>
            </div>
          </div>
          {input_html}
        </div>
    """


# ─────────────────────── 15. Settings ───────────────────────
def s15_settings():
    return """
  <div class="flex h-full">
    <!-- Settings nav -->
    <aside class="w-[220px] border-r border-slate-200 overflow-y-auto py-4 px-2">
      """ + _settings_nav_section("Workspace", [
            ("General",        "settings",      False),
            ("Workspaces",     "building-2",    False),
            ("Branding",       "palette",       False),
            ("Locale & time",  "globe",         False),
        ]) + """
      """ + _settings_nav_section("People", [
            ("Users & roles",  "users",         False),
            ("Teams",          "users-round",   False),
            ("Vendor portal",  "hard-hat",      False),
        ]) + """
      """ + _settings_nav_section("Identity", [
            ("SSO providers",  "shield-check",  False),
            ("Sessions",       "lock",          False),
            ("Audit log",      "scroll",        False),
        ]) + """
      """ + _settings_nav_section("Connections", [
            ("Integrations",   "puzzle",        True),
            ("Email providers","mail",          False),
            ("Webhooks",       "webhook",       False),
            ("API keys",       "key",           False),
        ]) + """
      """ + _settings_nav_section("Billing", [
            ("Plan & usage",   "credit-card",   False),
            ("Invoices",       "receipt",       False),
        ]) + """
    </aside>

    <!-- Main content -->
    <div class="flex-1 overflow-auto">
      <div class="px-8 py-6 max-w-[1100px]">
        <div class="mb-6">
          <h1 class="font-display text-[22px] font-semibold tracking-tight text-slate-900">Integrations</h1>
          <p class="text-[13px] text-slate-500 mt-1">Connect Microsoft 365, Google Workspace, Shopify, Meta, and others. Your workflows and email actions resolve through these.</p>
        </div>

        <!-- SSO config callout -->
        <div class="dm-card mb-6">
          <div class="dm-card-header">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center"><i data-lucide="shield-check" class="icon-sm text-indigo-600"></i></div>
              <div>
                <div class="text-[14px] font-semibold text-slate-900">Single sign-on (SSO)</div>
                <div class="text-[12px] text-slate-500">All three providers wired at launch · users can link multiple identities</div>
              </div>
            </div>
            <button class="btn-secondary"><i data-lucide="settings" class="icon-sm"></i> Configure</button>
          </div>
          <div class="dm-card-body">
            <div class="grid grid-cols-3 gap-3">
              """ + _sso_card("Microsoft Entra ID", "Multi-tenant · admin consented", "Default for Outlook/Teams users", True, "ms") + """
              """ + _sso_card("Google Identity",    "OAuth · openid email profile",    "For Workspace tenants", True, "google") + """
              """ + _sso_card("Sign in with Apple", "Services ID configured",          "Fallback for personal accounts", True, "apple") + """
            </div>
          </div>
        </div>

        <!-- Workspaces -->
        <div class="dm-card mb-6">
          <div class="dm-card-header">
            <div>
              <div class="text-[14px] font-semibold text-slate-900">Workspaces</div>
              <div class="text-[12px] text-slate-500">Multi-workspace is schema-ready · launch with one</div>
            </div>
            <button class="btn-secondary"><i data-lucide="plus" class="icon-sm"></i> New workspace</button>
          </div>
          <div class="dm-card-body !p-0">
            <div class="px-5 py-3 flex items-center gap-3 border-b border-slate-100">
              <div class="w-8 h-8 rounded-md bg-gradient-to-br from-indigo-500 to-indigo-600 text-white text-[11px] font-bold flex items-center justify-center">HQ</div>
              <div class="flex-1">
                <div class="text-[13px] font-semibold text-slate-900">DesignersMeet HQ</div>
                <div class="text-[11px] text-slate-500">12 members · Bengaluru · designersmeet.com</div>
              </div>
              <span class="badge badge-success badge-dot">Active</span>
              <button class="btn-ghost">Manage</button>
            </div>
          </div>
        </div>

        <!-- Integration grid -->
        <div class="grid grid-cols-2 gap-4 mb-6">
          """ + _integration_card("Microsoft 365",   "Outlook · Calendar · SharePoint · Teams", "Connected", True,  "ms",      "Mail.ReadWrite, Calendars.ReadWrite, Files.ReadWrite.All, Group.ReadWrite.All") + """
          """ + _integration_card("Resend",          "Transactional email · mail.designersmeet.com", "Connected", True,  "resend",  "SPF · DKIM · DMARC quarantine") + """
          """ + _integration_card("WhatsApp Cloud",  "Meta Cloud API · Business number",        "Connected", True,  "whatsapp","2 templates approved · 5 pending") + """
          """ + _integration_card("Google Workspace","Gmail · Calendar (for vendor SSO)",       "Available", False, "google",  "Activate when first Gmail-based vendor onboards") + """
          """ + _integration_card("Shopify",         "Admin GraphQL · Marketing activities",    "Connected", True,  "shopify", "1 store · 47 products · webhook health green") + """
          """ + _integration_card("Meta (FB + IG)",  "Pages API · Instagram Graph",             "App review", False, "meta",    "Submitted May 12 · expected 14d") + """
          """ + _integration_card("Stripe",          "Stripe Connect for vendor payouts",       "Wave 5",    False, "stripe",  "Deferred to Wave 5 per roadmap") + """
          """ + _integration_card("Power Automate",  "HTTP triggers · bidirectional webhooks",  "Connected", True,  "pa",      "3 flows subscribed · last fire 12m ago") + """
        </div>
      </div>
    </div>
  </div>
    """


def _settings_nav_section(title, items):
    out = [f'<div class="text-[10.5px] font-semibold uppercase tracking-wider text-slate-400 px-3 mt-3 mb-1">{title}</div>']
    for label, icon, active in items:
        a = "true" if active else "false"
        out.append(f'<div class="nav-item" data-active="{a}"><i data-lucide="{icon}"></i><span>{label}</span></div>')
    return "".join(out)


def _sso_card(name, sub, hint, enabled, vendor):
    logo_svg = {
        "ms": '<svg viewBox="0 0 21 21" class="w-5 h-5"><rect x="1" y="1" width="9" height="9" fill="#F25022"/><rect x="11" y="1" width="9" height="9" fill="#7FBA00"/><rect x="1" y="11" width="9" height="9" fill="#00A4EF"/><rect x="11" y="11" width="9" height="9" fill="#FFB900"/></svg>',
        "google": '<svg viewBox="0 0 24 24" class="w-5 h-5"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22z" fill="#FBBC04"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>',
        "apple": '<svg viewBox="0 0 24 24" class="w-5 h-5" fill="#000"><path d="M17.05 12.04c-.03-2.99 2.44-4.43 2.55-4.5-1.39-2.04-3.56-2.32-4.33-2.35-1.84-.19-3.6 1.09-4.54 1.09-.95 0-2.39-1.07-3.93-1.04-2.02.03-3.88 1.18-4.92 2.99-2.1 3.64-.54 9.02 1.51 11.97 1 1.45 2.19 3.07 3.74 3.01 1.5-.06 2.07-.97 3.88-.97 1.81 0 2.31.97 3.89.94 1.61-.03 2.62-1.46 3.6-2.92 1.14-1.67 1.6-3.31 1.63-3.39-.04-.02-3.13-1.2-3.16-4.77zM14.16 3.18c.83-1.01 1.39-2.4 1.24-3.8-1.2.05-2.66.8-3.51 1.8-.77.89-1.45 2.32-1.27 3.69 1.33.1 2.7-.68 3.54-1.69z"/></svg>',
    }[vendor]
    return f"""
        <div class="border border-slate-200 rounded-lg p-4">
          <div class="flex items-start justify-between mb-3">
            {logo_svg}
            <span class="badge badge-success badge-dot">Enabled</span>
          </div>
          <div class="text-[13px] font-semibold text-slate-900">{name}</div>
          <div class="text-[11px] text-slate-500 mt-0.5">{sub}</div>
          <div class="text-[11px] text-slate-400 mt-2">{hint}</div>
        </div>
    """


def _integration_card(name, sub, status, connected, vendor, footnote):
    status_pill = {
        "Connected":   '<span class="badge badge-success badge-dot">Connected</span>',
        "Available":   '<span class="badge badge-neutral">Available</span>',
        "App review":  '<span class="badge badge-warning badge-dot">In review</span>',
        "Wave 5":      '<span class="badge badge-neutral">Wave 5</span>',
    }[status]

    logos = {
        "ms":       '<svg viewBox="0 0 21 21" class="w-6 h-6"><rect x="1" y="1" width="9" height="9" fill="#F25022"/><rect x="11" y="1" width="9" height="9" fill="#7FBA00"/><rect x="1" y="11" width="9" height="9" fill="#00A4EF"/><rect x="11" y="11" width="9" height="9" fill="#FFB900"/></svg>',
        "resend":   '<div class="w-6 h-6 rounded-md bg-slate-900 text-white text-[10px] font-bold flex items-center justify-center">R</div>',
        "whatsapp": '<svg viewBox="0 0 24 24" class="w-6 h-6"><circle cx="12" cy="12" r="11" fill="#25D366"/><path d="M17.5 14.4c-.3-.2-1.8-.9-2.1-1-.3-.1-.5-.2-.7.2-.2.3-.8 1-1 1.2-.2.2-.4.2-.7 0-.3-.2-1.2-.4-2.3-1.4-.9-.8-1.4-1.7-1.6-2-.2-.3 0-.5.1-.6.1-.1.3-.4.4-.5.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5-.1-.2-.7-1.6-.9-2.2-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.4 0 1.4 1 2.8 1.2 3 .2.2 2.1 3.2 5 4.5.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.8-.7 2-1.5.2-.7.2-1.4.2-1.5-.1-.1-.3-.2-.6-.3z" fill="#FFF"/></svg>',
        "google":   '<svg viewBox="0 0 24 24" class="w-6 h-6"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22z" fill="#FBBC04"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>',
        "shopify":  '<div class="w-6 h-6 rounded-md bg-[#95BF47] text-white flex items-center justify-center"><i data-lucide="shopping-bag" class="icon-sm"></i></div>',
        "meta":     '<div class="w-6 h-6 rounded-md bg-gradient-to-br from-[#0866FF] to-[#5856D6] text-white flex items-center justify-center"><i data-lucide="facebook" class="icon-sm"></i></div>',
        "stripe":   '<div class="w-6 h-6 rounded-md bg-[#635BFF] text-white text-[10px] font-bold flex items-center justify-center">S</div>',
        "pa":       '<div class="w-6 h-6 rounded-md bg-[#0078D4] text-white flex items-center justify-center"><i data-lucide="workflow" class="icon-sm"></i></div>',
    }
    logo = logos.get(vendor, "")

    return f"""
        <div class="border border-slate-200 rounded-lg p-4 hover:border-slate-300 transition-colors">
          <div class="flex items-start gap-3">
            <div class="flex-shrink-0">{logo}</div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between gap-2">
                <div class="text-[14px] font-semibold text-slate-900 truncate">{name}</div>
                {status_pill}
              </div>
              <div class="text-[12px] text-slate-500 mt-0.5">{sub}</div>
              <div class="text-[11px] text-slate-400 mt-2 leading-relaxed">{footnote}</div>
              <div class="flex items-center gap-2 mt-3">
                {"<button class='btn-secondary !text-[12px]'>Configure</button>" if connected else "<button class='btn-primary !text-[12px]'>Connect</button>"}
                {"<button class='btn-ghost !text-[12px]'>Logs</button>" if connected else ""}
              </div>
            </div>
          </div>
        </div>
    """


# ─────────────────────── 16. Spec sheet (bonus) ───────────────────────
def s16_spec_sheet():
    screens = [
        ("01-signin",          "Sign in",                  "SSO trio (Microsoft, Google, Apple) + SAML/OIDC fallback. White card, indigo CTA."),
        ("02-onboarding",      "Onboarding",               "4-step setup wizard. Workspace switcher empty state, M365 connect cards."),
        ("03-dashboard",       "Dashboard",                "4 KPIs (pipeline value, on-track projects, vendor utilization, deliverable cycle) + pipeline chart, activity feed, upcoming deliveries table, today's bookings."),
        ("04-contacts",        "Contacts list",            "Virtual-scroll table, saved-filter chips, bulk actions, type pills (Client/Vendor/Lead)."),
        ("05-contact-detail",  "Contact detail",           "Tabbed shell (Profile/Timeline/Conversations/Opps/Projects/Files). Properties grid + timeline + right rail."),
        ("06-vendors",         "Vendors list",             "Vendor-specific columns: regions, tier, rating, NDA/MSA status."),
        ("07-vendor-detail",   "Vendor detail",            "Skills, rate card, project history, compliance card (NDA/MSA/GST/Insurance), portfolio thumbs."),
        ("08-projects-board",  "Projects board",           "7-column kanban (Brief→Handover) — the differentiator. Vendor avatars + milestone progress on every card."),
        ("09-project-detail",  "Project detail",           "Milestone bar, deliverable card grid with version history, next-up tasks, assigned vendors, threaded comments."),
        ("10-pipelines",       "Pipelines kanban",         "5-stage Sales pipeline. Stage totals at top of each column."),
        ("11-calendar",        "Calendar",                 "Week view + public booking page mockup in right rail. M365 calendar overlay."),
        ("12-conversations",   "Conversations inbox",      "Three-pane: list / thread / context. Channel-aware reply composer (email/WhatsApp/note)."),
        ("13-workflows",       "Workflows builder",        "V1 rule-based linear: trigger → filter → ordered actions. Right inspector configures each step."),
        ("14-forms",           "Forms builder",            "Drag-and-drop field types (left) → canvas (center) → field inspector (right). Workflow trigger callout."),
        ("15-settings",        "Settings · Integrations",  "SSO summary, workspaces card, 8-tile integration grid (M365, Resend, WhatsApp, Google, Shopify, Meta, Stripe, Power Automate)."),
    ]
    cards = ""
    for slug, name, desc in screens:
        cards += f"""
          <div class="border border-slate-200 rounded-lg overflow-hidden bg-white">
            <div class="aspect-[16/10] bg-gradient-to-br from-slate-50 to-slate-100 border-b border-slate-200 flex items-center justify-center p-4">
              <div class="dm-brand"><span class="dm-brand-glyph">D</span><span class="text-[11px] text-slate-400">{slug}.html</span></div>
            </div>
            <div class="p-4">
              <div class="flex items-baseline justify-between gap-3 mb-1">
                <div class="text-[13px] font-semibold text-slate-900">{name}</div>
                <div class="text-[10px] text-slate-400 font-mono">{slug.split('-')[0]}</div>
              </div>
              <div class="text-[11.5px] text-slate-600 leading-snug">{desc}</div>
            </div>
          </div>
        """

    return f"""
  <div class="min-h-screen bg-white">
    <div class="max-w-[1200px] mx-auto px-8 py-10">
      <div class="flex items-start justify-between mb-8 pb-6 border-b border-slate-200">
        <div>
          <div class="dm-brand mb-3"><span class="dm-brand-glyph">D</span><span>DesignersMeet</span></div>
          <h1 class="font-display text-[32px] font-semibold tracking-tight text-slate-900">Vendor Platform — V1 mockup spec sheet</h1>
          <p class="text-[14px] text-slate-500 mt-2">15 screens · indigo-600 accent · M365-native chrome · for vendor + project stakeholder review.</p>
          <div class="flex items-center gap-4 mt-3 text-[12px] text-slate-500">
            <span>Manish · DesignersMeet HQ</span><span>·</span>
            <span>May 18, 2026</span><span>·</span>
            <span>v0.1 draft</span><span>·</span>
            <span>SPEC.md cross-reference</span>
          </div>
        </div>
        <button onclick="window.print()" class="btn-primary"><i data-lucide="printer" class="icon-sm"></i> Print / save as PDF</button>
      </div>

      <!-- Design tokens summary -->
      <div class="grid grid-cols-4 gap-4 mb-8">
        <div class="border border-slate-200 rounded-lg p-4">
          <div class="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Surfaces</div>
          <div class="flex items-center gap-2 mt-2">
            <div class="w-8 h-8 rounded-md bg-white border border-slate-200"></div>
            <div class="w-8 h-8 rounded-md bg-slate-50 border border-slate-200"></div>
            <div class="w-8 h-8 rounded-md bg-slate-100 border border-slate-200"></div>
          </div>
          <div class="text-[11px] text-slate-500 mt-2">#FFFFFF · #FAFAFA · #F8FAFC</div>
        </div>
        <div class="border border-slate-200 rounded-lg p-4">
          <div class="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Accent</div>
          <div class="flex items-center gap-2 mt-2">
            <div class="w-8 h-8 rounded-md bg-indigo-600"></div>
            <div class="w-8 h-8 rounded-md bg-indigo-100"></div>
            <div class="w-8 h-8 rounded-md bg-indigo-50"></div>
          </div>
          <div class="text-[11px] text-slate-500 mt-2">Indigo-600 · #4F46E5</div>
        </div>
        <div class="border border-slate-200 rounded-lg p-4">
          <div class="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Status</div>
          <div class="flex items-center gap-2 mt-2">
            <div class="w-8 h-8 rounded-md bg-emerald-500"></div>
            <div class="w-8 h-8 rounded-md bg-amber-500"></div>
            <div class="w-8 h-8 rounded-md bg-red-500"></div>
            <div class="w-8 h-8 rounded-md bg-sky-500"></div>
          </div>
          <div class="text-[11px] text-slate-500 mt-2">success · warning · danger · info</div>
        </div>
        <div class="border border-slate-200 rounded-lg p-4">
          <div class="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Typography</div>
          <div class="font-display text-[22px] font-semibold text-slate-900 mt-1 leading-none">Aa</div>
          <div class="text-[11px] text-slate-500 mt-2">Inter · 12 / 14 / 16 / 20 / 24 / 32</div>
        </div>
      </div>

      <h2 class="font-display text-[18px] font-semibold text-slate-900 mb-4">Screen inventory</h2>
      <div class="grid grid-cols-3 gap-4">{cards}</div>

      <div class="mt-10 pt-6 border-t border-slate-200 grid grid-cols-3 gap-6 text-[12px] text-slate-600">
        <div>
          <div class="font-semibold text-slate-900 mb-1">Wave 1 (Days 1–5)</div>
          <div>Auth, scaffold, vendor CRUD, email provider stub, Dashboard placeholder.</div>
        </div>
        <div>
          <div class="font-semibold text-slate-900 mb-1">Wave 2 (Days 6–12)</div>
          <div>Pipelines, Calendar, Contact detail, Conversations (email), Forms V1.</div>
        </div>
        <div>
          <div class="font-semibold text-slate-900 mb-1">Wave 3 (Days 13–21)</div>
          <div>Projects + Deliverables + Vendor portal + Workflows + WhatsApp.</div>
        </div>
      </div>

      <div class="mt-8 text-[11px] text-slate-400 text-center">
        DesignersMeet Vendor Platform · Mockups generated May 18, 2026 · Single source of truth: outputs/designersmeet-vendor-platform/SPEC.md
      </div>
    </div>
  </div>
    """


# ─────────────────────── Gallery (index.html) ───────────────────────
def gallery_body():
    cards = [
        ("01-signin",        "Sign in · SSO",            "Microsoft + Google + Apple trio, white card, indigo CTA."),
        ("02-onboarding",    "Onboarding",               "4-step setup wizard with M365 connect cards."),
        ("03-dashboard",     "Dashboard",                "4 KPIs + pipeline chart + activity + upcoming deliveries."),
        ("04-contacts",      "Contacts list",            "Virtual-scroll table, saved filters, type pills."),
        ("05-contact-detail","Contact detail",           "Tabbed shell · Profile + Timeline + right rail."),
        ("06-vendors",       "Vendors list",             "Tier, rating, NDA/MSA, regions in one row."),
        ("07-vendor-detail", "Vendor detail",            "Skills · rate card · project history · compliance."),
        ("08-projects-board","Projects board",           "★ The differentiator. 7-stage delivery kanban."),
        ("09-project-detail","Project detail",           "Milestones, deliverables, tasks, vendors, comments."),
        ("10-pipelines",     "Pipelines kanban",         "Sales pipeline · stage totals · drag affordance."),
        ("11-calendar",      "Calendar + booking",       "Week view + public booking page mockup."),
        ("12-conversations", "Conversations inbox",      "Three-pane unified inbox · email + WhatsApp + notes."),
        ("13-workflows",     "Workflows builder",        "V1 rule-based linear · trigger + filter + actions."),
        ("14-forms",         "Forms builder",            "Drag-and-drop · field inspector · workflow link."),
        ("15-settings",      "Settings · Integrations",  "SSO + integration grid (M365, Resend, WhatsApp…)"),
        ("16-spec-sheet",    "★ Printable spec sheet",   "All 15 screens at a glance — distribute to stakeholders."),
    ]
    cards_html = ""
    for slug, name, desc in cards:
        star = "★ " if slug == "08-projects-board" or slug == "16-spec-sheet" else ""
        cards_html += f"""
          <a href="screens/{slug}.html" class="group block border border-slate-200 rounded-lg overflow-hidden bg-white hover:border-indigo-300 hover:shadow-md transition-all">
            <div class="aspect-[16/10] bg-gradient-to-br from-slate-50 to-slate-100 border-b border-slate-200 flex items-center justify-center relative overflow-hidden">
              <div class="absolute inset-3 border border-slate-200 rounded bg-white/60 flex items-center justify-center">
                <div class="text-center">
                  <div class="dm-brand justify-center mb-1"><span class="dm-brand-glyph">D</span></div>
                  <div class="text-[10px] text-slate-400 font-mono">screens/{slug}.html</div>
                </div>
              </div>
              <div class="absolute top-2 left-2 text-[10px] text-slate-400 font-mono">{slug.split('-')[0]}</div>
            </div>
            <div class="p-4">
              <div class="text-[13.5px] font-semibold text-slate-900 group-hover:text-indigo-600">{name}</div>
              <div class="text-[11.5px] text-slate-500 mt-1 leading-snug">{desc}</div>
            </div>
          </a>
        """

    return f"""
  <div class="min-h-screen">
    <header class="border-b border-slate-200 bg-white">
      <div class="max-w-[1280px] mx-auto px-8 py-5 flex items-center justify-between">
        <div class="dm-brand"><span class="dm-brand-glyph">D</span><span>DesignersMeet · Mockups</span></div>
        <div class="flex items-center gap-3 text-[12px] text-slate-500">
          <span>Wave 1 design system</span>
          <span class="text-slate-300">·</span>
          <span>15 screens + spec sheet</span>
          <span class="text-slate-300">·</span>
          <a href="screens/16-spec-sheet.html" class="text-indigo-600 font-medium hover:underline">Open spec sheet →</a>
        </div>
      </div>
    </header>

    <div class="max-w-[1280px] mx-auto px-8 py-10">
      <div class="mb-8 max-w-[640px]">
        <h1 class="font-display text-[32px] font-semibold tracking-tight text-slate-900">DesignersMeet Vendor Platform — V1 mockups</h1>
        <p class="text-[14px] text-slate-600 mt-3 leading-relaxed">
          Click any tile to open the full screen. All mockups are static HTML — the Wave 1 code team can port the Tailwind classes and SVGs directly into React components.
        </p>
        <div class="flex items-center gap-2 mt-5">
          <span class="badge badge-indigo">Indigo-600</span>
          <span class="badge badge-neutral">All-white surfaces</span>
          <span class="badge badge-neutral">Inter</span>
          <span class="badge badge-neutral">shadcn-style primitives</span>
          <span class="badge badge-neutral">Linear-grade density</span>
          <span class="badge badge-neutral">M365-native chrome</span>
        </div>
      </div>

      <div class="grid grid-cols-4 gap-4">{cards_html}</div>

      <div class="mt-10 pt-6 border-t border-slate-200 text-[12px] text-slate-500 leading-relaxed max-w-[800px]">
        <strong class="text-slate-900">Build instructions for Wave 1:</strong> the Tailwind classes used here mirror shadcn/ui's primitive vocabulary (button variants, badge, card, table, tabs). Lift each screen's body into a Next.js App Router page, swap inline SVG and Lucide icon refs for <code class="font-mono bg-slate-100 px-1 rounded">lucide-react</code>, and the design system tokens in <code class="font-mono bg-slate-100 px-1 rounded">shared/styles.css</code> port to <code class="font-mono bg-slate-100 px-1 rounded">globals.css</code> as a Tailwind v4 <code class="font-mono bg-slate-100 px-1 rounded">@theme</code> block.
      </div>
    </div>
  </div>
    """


