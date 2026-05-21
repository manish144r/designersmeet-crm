import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

// Config lives inside packages/frontend/ so CJS require('@vitejs/plugin-react')
// resolves from packages/frontend/node_modules/ -- guaranteed installed as a
// production dependency regardless of Vercel's devDep hoisting behaviour.

const srcDir = fileURLToPath(new URL("src", import.meta.url));
const distDir = fileURLToPath(new URL("dist", import.meta.url));

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const port = Number(env.FRONTEND_PORT ?? 5173);
  const backendPort = Number(env.BACKEND_PORT ?? 4000);
  return {
    plugins: [react()],
    resolve: {
      alias: { "@": srcDir },
    },
    build: {
      outDir: distDir,
      emptyOutDir: true,
    },
    server: {
      port,
      proxy: {
        "/api": { target: `http://localhost:${backendPort}`, changeOrigin: true },
        "/health": { target: `http://localhost:${backendPort}`, changeOrigin: true },
      },
    },
  };
});