/* Generated from brief/mockups/01-signin.html via Codex fidelity pass 2026-05-19. Do not hand-edit. */

import { Layers, Mail, ShieldCheck, Zap } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function DesignersMeetSignIn() {
  return (
    <div className="min-h-screen bg-white text-foreground antialiased">
      <div className="flex min-h-screen">
        <main className="flex flex-1 flex-col">
          <header className="flex items-center justify-between px-10 py-6">
            <div className="flex items-center gap-2 text-[14px] font-semibold text-slate-900">
              <span className="flex size-7 items-center justify-center rounded-md bg-slate-900 text-[13px] font-semibold text-white">
                D
              </span>
              <span>DesignersMeet</span>
            </div>

            <div className="text-[13px] text-slate-500">
              Need an account?{" "}
              <a className="font-medium text-slate-700 hover:underline" href="#">
                Request access
              </a>
            </div>
          </header>

          <section className="flex flex-1 items-center justify-center px-6">
            <div className="w-full max-w-[400px]">
              <div className="mb-8">
                <h1 className="font-display text-[28px] font-semibold tracking-tight text-slate-900">
                  Sign in to DesignersMeet
                </h1>
                <p className="mt-2 text-[14px] text-slate-500">
                  Use your work account to access the vendor platform.
                </p>
              </div>

              <div className="space-y-2.5">
                <Button className="h-auto w-full justify-center gap-2 rounded-md bg-primary py-2.5 text-[14px] font-medium text-primary-foreground hover:bg-primary/90">
                  <svg viewBox="0 0 21 21" className="size-4" aria-hidden="true">
                    <rect x="1" y="1" width="9" height="9" className="fill-orange-600" />
                    <rect x="11" y="1" width="9" height="9" className="fill-lime-500" />
                    <rect x="1" y="11" width="9" height="9" className="fill-sky-500" />
                    <rect x="11" y="11" width="9" height="9" className="fill-amber-400" />
                  </svg>
                  Continue with Microsoft
                </Button>

                <Button
                  variant="outline"
                  className="h-auto w-full justify-center gap-2 rounded-md border-slate-200 bg-white py-2.5 text-[14px] font-medium text-slate-700 shadow-sm hover:bg-slate-50 hover:text-slate-900"
                >
                  <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      className="fill-blue-500"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      className="fill-green-500"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22z"
                      className="fill-yellow-400"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      className="fill-red-500"
                    />
                  </svg>
                  Continue with Google
                </Button>

                <Button
                  variant="outline"
                  className="h-auto w-full justify-center gap-2 rounded-md border-slate-200 bg-white py-2.5 text-[14px] font-medium text-slate-700 shadow-sm hover:bg-slate-50 hover:text-slate-900"
                >
                  <svg viewBox="0 0 24 24" className="size-4 fill-current" aria-hidden="true">
                    <path d="M17.05 12.04c-.03-2.99 2.44-4.43 2.55-4.5-1.39-2.04-3.56-2.32-4.33-2.35-1.84-.19-3.6 1.09-4.54 1.09-.95 0-2.39-1.07-3.93-1.04-2.02.03-3.88 1.18-4.92 2.99-2.1 3.64-.54 9.02 1.51 11.97 1 1.45 2.19 3.07 3.74 3.01 1.5-.06 2.07-.97 3.88-.97 1.81 0 2.31.97 3.89.94 1.61-.03 2.62-1.46 3.6-2.92 1.14-1.67 1.6-3.31 1.63-3.39-.04-.02-3.13-1.2-3.16-4.77zM14.16 3.18c.83-1.01 1.39-2.4 1.24-3.8-1.2.05-2.66.8-3.51 1.8-.77.89-1.45 2.32-1.27 3.69 1.33.1 2.7-.68 3.54-1.69z" />
                  </svg>
                  Continue with Apple
                </Button>
              </div>

              <div className="my-6 flex items-center gap-3">
                <div className="h-px flex-1 bg-slate-200" />
                <span className="text-[11px] uppercase tracking-wider text-slate-400">Or use SSO</span>
                <div className="h-px flex-1 bg-slate-200" />
              </div>

              <div className="space-y-3">
                <label className="block">
                  <span className="text-[12px] font-medium text-slate-700">Work email</span>
                  <Input
                    type="email"
                    placeholder="you@yourcompany.com"
                    className="mt-1.5 h-10 rounded-md border-slate-200 bg-white text-[14px] text-slate-900 placeholder:text-slate-400 focus-visible:ring-slate-300"
                  />
                </label>

                <Button
                  variant="outline"
                  className="h-auto w-full justify-center gap-2 rounded-md border-slate-200 bg-white py-2.5 text-[14px] font-medium text-slate-700 shadow-sm hover:bg-slate-50 hover:text-slate-900"
                >
                  <ShieldCheck className="size-4" aria-hidden="true" />
                  Continue with SAML / OIDC
                </Button>
              </div>

              <p className="mt-8 text-center text-[12px] text-slate-400">
                By continuing you agree to the{" "}
                <a className="text-slate-600 hover:underline" href="#">
                  Terms
                </a>{" "}
                and{" "}
                <a className="text-slate-600 hover:underline" href="#">
                  Privacy policy
                </a>
                .
              </p>
            </div>
          </section>

          <footer className="flex items-center justify-between border-t border-slate-100 px-10 py-5 text-[11px] text-slate-400">
            <span>© 2026 DesignersMeet · v1.0</span>
            <div className="flex items-center gap-4">
              <span>
                Status: <span className="font-medium text-slate-600">All systems normal</span>
              </span>
              <a href="#" className="hover:text-slate-600">
                Privacy
              </a>
              <a href="#" className="hover:text-slate-600">
                Security
              </a>
            </div>
          </footer>
        </main>

        <aside className="relative hidden w-[44%] flex-col overflow-hidden border-l border-slate-200 bg-zinc-50 p-12 lg:flex">
          <div className="relative z-10 my-auto max-w-[420px]">
            <span className="mb-5 inline-flex rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-700">
              Wave 1 · Vendor Platform
            </span>

            <h2 className="font-display text-[32px] font-semibold leading-[1.15] tracking-tight text-slate-900">
              The CRM your project managers reach for instead of Excel.
            </h2>

            <p className="mt-4 text-[15px] leading-relaxed text-slate-600">
              Vendor coordination, project delivery, and client conversations — all one workspace,
              native inside Microsoft 365.
            </p>

            <div className="mt-8 space-y-3">
              <div className="flex items-start gap-3">
                <div className="flex size-8 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-700">
                  <Layers className="size-4" aria-hidden="true" />
                </div>
                <div>
                  <div className="text-[13px] font-semibold text-slate-900">Project delivery board</div>
                  <div className="text-[12px] text-slate-500">
                    Vendor assignments, deliverables, milestones in one view.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex size-8 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-700">
                  <Mail className="size-4" aria-hidden="true" />
                </div>
                <div>
                  <div className="text-[13px] font-semibold text-slate-900">Unified conversations</div>
                  <div className="text-[12px] text-slate-500">
                    Outlook + Gmail + WhatsApp threaded by contact.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex size-8 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-700">
                  <Zap className="size-4" aria-hidden="true" />
                </div>
                <div>
                  <div className="text-[13px] font-semibold text-slate-900">M365-native distribution</div>
                  <div className="text-[12px] text-slate-500">
                    Outlook add-in, Teams tab, launcher tile — same data.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
