// API facade. The repo's transport is the fetch-based client in
// ./api/client.ts (relative /api, Bearer-token injection via setTokenGetter —
// the MSAL interceptor equivalent). In demo mode the resource hooks short-
// circuit to demoStore before any request is made, so this stays a thin,
// dependency-free re-export (no axios) honouring the existing contract.
import { api, setTokenGetter, type ApiResponse } from "../api/client.js";
import { DEMO_MODE } from "./demoData.js";

export { api, setTokenGetter, DEMO_MODE };
export type { ApiResponse };

/** Base URL for the real backend (prod). Empty → Vite proxy / same-origin. */
export const API_BASE_URL = import.meta.env.VITE_API_URL ?? "";
