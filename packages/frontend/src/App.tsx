import { Suspense, lazy } from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import { useAuth } from "./auth/AuthProvider.js";

// Pages translated 1:1 from brief/mockups/*.html by Codex (design-locked).
const SignIn = lazy(() => import("./pages/01-signin.js"));
const Onboarding = lazy(() => import("./pages/02-onboarding.js"));
const Dashboard = lazy(() => import("./pages/03-dashboard.js"));
const Contacts = lazy(() => import("./pages/04-contacts.js"));
const ContactDetail = lazy(() => import("./pages/05-contact-detail.js"));
const Vendors = lazy(() => import("./pages/06-vendors.js"));
const VendorDetail = lazy(() => import("./pages/07-vendor-detail.js"));
const ProjectsBoard = lazy(() => import("./pages/08-projects-board.js"));
const ProjectDetail = lazy(() => import("./pages/09-project-detail.js"));
const Pipelines = lazy(() => import("./pages/10-pipelines.js"));
const Calendar = lazy(() => import("./pages/11-calendar.js"));
const Conversations = lazy(() => import("./pages/12-conversations.js"));
const Workflows = lazy(() => import("./pages/13-workflows.js"));
const Forms = lazy(() => import("./pages/14-forms.js"));
const Settings = lazy(() => import("./pages/15-settings.js"));
const SpecSheet = lazy(() => import("./pages/16-spec-sheet.js"));
const VendorPortal = lazy(() => import("./pages/vendor-portal.js"));
const Reports = lazy(() => import("./pages/reports.js"));

const Loading = () => (
  <div className="flex h-screen items-center justify-center text-sm text-muted">Loading…</div>
);

export function App() {
  const { signedIn } = useAuth();

  if (!signedIn) {
    return (
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="*" element={<SignIn />} />
        </Routes>
      </Suspense>
    );
  }

  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/signin" element={<Navigate to="/dashboard" replace />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/contacts" element={<Contacts />} />
        <Route path="/contacts/:id" element={<ContactDetail />} />
        <Route path="/contact-detail" element={<ContactDetail />} />
        <Route path="/vendors" element={<Vendors />} />
        <Route path="/vendors/:id" element={<VendorDetail />} />
        <Route path="/vendor-detail" element={<VendorDetail />} />
        <Route path="/projects" element={<ProjectsBoard />} />
        <Route path="/projects/:id" element={<ProjectDetail />} />
        <Route path="/project-detail" element={<ProjectDetail />} />
        <Route path="/pipelines" element={<Pipelines />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/conversations" element={<Conversations />} />
        <Route path="/workflows" element={<Workflows />} />
        <Route path="/forms" element={<Forms />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/spec" element={<SpecSheet />} />
        <Route path="/vendor" element={<VendorPortal />} />
        <Route path="/vendor/*" element={<VendorPortal />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Suspense>
  );
}
