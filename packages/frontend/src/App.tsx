import { NavLink, Route, Routes, Navigate } from "react-router-dom";
import { useAuth } from "./auth/AuthProvider.js";
import { Dashboard } from "./pages/Dashboard.js";
import { Clients } from "./pages/Clients.js";
import { Projects } from "./pages/Projects.js";
import { Orders } from "./pages/Orders.js";
import { Freelancers } from "./pages/Freelancers.js";
import { Services } from "./pages/Services.js";
import { ShopifyMappings } from "./pages/ShopifyMappings.js";
import { Queue } from "./pages/Queue.js";
import { Social } from "./pages/Social.js";
import { Settings } from "./pages/Settings.js";
import { Workflows } from "./pages/Workflows.js";
import { Reporting } from "./pages/Reporting.js";

// Forms page intentionally omitted from nav/routes (hidden per Wave 5 directive).

const tabs = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/clients", label: "Clients" },
  { to: "/projects", label: "Projects" },
  { to: "/orders", label: "Orders" },
  { to: "/freelancers", label: "Freelancers" },
  { to: "/services", label: "Services" },
  { to: "/queue", label: "Queue" },
  { to: "/social", label: "Social" },
  { to: "/workflows", label: "Workflows" },
  { to: "/reporting", label: "Reporting" },
  { to: "/settings", label: "Settings" },
];

export function App() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-navy-dark px-6 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" className="w-9 h-9 flex-shrink-0">
            <defs>
              <linearGradient id="logo-bg" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#D5D52C"/>
                <stop offset="100%" stopColor="#82C341"/>
              </linearGradient>
            </defs>
            <rect width="64" height="64" rx="14" fill="url(#logo-bg)"/>
            <text x="50%" y="58%" textAnchor="middle" fontFamily="Inter, -apple-system, 'Segoe UI', sans-serif" fontWeight="800" fontSize="26" fill="#002a23" letterSpacing="-1">DM</text>
          </svg>
          <div>
            <h1 className="text-white text-lg font-bold tracking-wide">DesignersMeet</h1>
            <span className="text-gray-400 text-[11px] uppercase tracking-widest">CRM &middot; Operations</span>
          </div>
        </div>
        <div className="text-gray-400 text-sm">{user?.email}</div>
      </header>

      <nav className="bg-navy-dark border-b border-navy-light px-6 flex gap-0 overflow-x-auto">
        {tabs.map((t) => (
          <NavLink
            key={t.to}
            to={t.to}
            className={({ isActive }) => `nav-tab ${isActive ? "active" : ""}`}
          >
            {t.label}
          </NavLink>
        ))}
      </nav>

      <main className="flex-1 px-6 py-5">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/clients" element={<Clients />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/freelancers" element={<Freelancers />} />
          <Route path="/services" element={<Services />} />
          <Route path="/mappings" element={<ShopifyMappings />} />
          <Route path="/queue" element={<Queue />} />
          <Route path="/social" element={<Social />} />
          <Route path="/workflows" element={<Workflows />} />
          <Route path="/reporting" element={<Reporting />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>
    </div>
  );
}
