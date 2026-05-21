/**
 * Root-level Vite config for the frontend workspace package.
 *
 * WHY THIS FILE EXISTS AT ROOT:
 * Vercel forces npm production install which causes the npm workspace dedup
 * algorithm to place hoisted packages (vite, @vitejs/plugin-react, etc.) at
 * /vercel/path0/node_modules/. When vite compiles its config file, it writes a
 * temporary .mjs bundle adjacent to the config file. If that config is inside
 * packages/frontend/, the temp file lives there too — and Node.js ESM bare-
 * specifier resolution walks UP from packages/frontend/ looking for node_modules,
 * but Vercel's hoisting puts them at root level (/vercel/path0/node_modules/).
 * The walk SHOULD reach root, but Vercel's install places these packages at an
 * intermediate hoisted location that the ESM resolver can't find from the sub-dir.
 *
 * Solution: keep the config at root so vite's temp file is also at root, where
 * Node.js immediately finds @vitejs/plugin-react in ./node_modules/.
 */
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

// At runtime import.meta.url is the compiled temp file at the REPO ROOT level,
// so URL resolution from here correctly reaches packages/frontend/.
const frontendDir = fileURLToPath(new URL("packages/frontend", import.meta.url));
const srcDir = fileURLToPath(new URL("packages/frontend/src", import.meta.url));
const distDir = fileURLToPath(new URL("packages/frontend/dist", import.meta.url));

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const port = Number(env.FRONTEND_PORT ?? 5173);
  const backendPort = Number(env.BACKEND_PORT ?? 4000);
  return {
    root: frontendDir,
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
