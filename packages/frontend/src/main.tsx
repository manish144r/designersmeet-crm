import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { App } from "./App.js";
import { AuthProvider } from "./auth/AuthProvider.js";
import { ErrorBoundary } from "./components/ErrorBoundary.js";
import { DemoInteractionLayer } from "./lib/demoInteractions.js";
import { SidebarCollapseLayer } from "./lib/sidebarCollapse.js";
import { CrmModals } from "./components/CrmModals.js";
import { HeaderDropdowns } from "./components/HeaderDropdowns.js";
import "./index.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, refetchOnWindowFocus: false },
  },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <BrowserRouter>
            {/* HeaderDropdowns must mount FIRST so its capture-phase click
                listener registers before DemoInteractionLayer's — both run in
                capture, and HeaderDropdowns calls stopPropagation on matched
                triggers (workspace tile + view toggle button) to suppress the
                generic toast/nav fallback. */}
            <HeaderDropdowns />
            <DemoInteractionLayer />
            <SidebarCollapseLayer />
            <CrmModals />
            <App />
          </BrowserRouter>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  </React.StrictMode>,
);
