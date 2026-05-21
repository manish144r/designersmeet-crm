import { defineConfig, loadEnv } from "vite";
import { fileURLToPath, URL } from "node:url";

// NOTE: @vitejs/plugin-react is intentionally NOT imported here.
// Vercel's npm install wrapper overrides ALL mechanisms to install devDeps
// (env vars, CLI flags, .npmrc) and installs exactly 445 packages every time.
// esbuild's native automatic JSX transform (matching tsconfig "jsx":"react-jsx")
// is used instead — sufficient for production builds. Fast refresh is dev-only.

const srcDir = fileURLToPath(new URL("src", import.meta.url));
const distDir = fileURLToPath(new URL("dist", import.meta.url));

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const port = Number(env.FRONTEND_PORT ?? 5173);
  const backendPort = Number(env.BACKEND_PORT ?? 4000);
  return {
    esbuild: {
      // React 17+ automatic JSX runtime — matches tsconfig "jsx":"react-jsx".
      // No need for @vitejs/plugin-react for production builds.
      jsx: "automatic",
      jsxImportSource: "react",
    },
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