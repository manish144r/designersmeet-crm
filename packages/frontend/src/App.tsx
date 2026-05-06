import { NavLink, Route, Routes, Navigate } from "react-router-dom";
import { useAuth } from "./auth/AuthProvider.js";
import { Dashboard } from "./pages/Dashboard.js";
import { Orders } from "./pages/Orders.js";
import { Freelancers } from "./pages/Freelancers.js";
import { Services } from "./pages/Services.js";
import { ShopifyMappings } from "./pages/ShopifyMappings.js";
import { Queue } from "./pages/Queue.js";
import { Social } from "./pages/Social.js";

const tabs = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/orders", label: "Orders" },
  { to: "/freelancers", label: "Freelancers" },
  { to: "/services", label: "Services" },
  { to: "/mappings", label: "Shopify" },
  { to: "/queue", label: "Queue" },
  { to: "/social", label: "Social" },
];

export function App() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-navy-dark border-b border-borderc px-6 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-gold flex items-center justify-center text-navy-dark font-extrabold">
            DM
          </div>
          <div>
            <h1 className="text-gold text-lg font-semibold tracking-wider">DesignersMeet CRM</h1>
            <span className="text-ice-dim text-[11px] uppercase tracking-widest">Operations</span>
          </div>
        </div>
        <div className="text-textDim text-xs">{user?.email}</div>
      </header>

      <nav className="bg-navy-dark border-b-2 border-borderc px-6 flex gap-0 overflow-x-auto">
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
          <Route path="/orders" element={<Orders />} />
          <Route path="/freelancers" element={<Freelancers />} />
          <Route path="/services" element={<Services />} />
          <Route path="/mappings" element={<ShopifyMappings />} />
          <Route path="/queue" element={<Queue />} />
          <Route path="/social" element={<Social />} />
        </Routes>
      </main>
    </div>
  );
}
