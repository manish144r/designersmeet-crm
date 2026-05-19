// DesignersMeet auth context.
// Three production providers (Microsoft Entra/MSAL — mandatory for Graph,
// Google, Apple). A demo flag bypasses all three so the rebuilt UI is
// reviewable without any IdP. Dev mode also bypasses (backend dev-bypass
// accepts the request).
import {
  createContext,
  useContext,
  useMemo,
  useCallback,
  useState,
  type ReactNode,
} from "react";

export type AppRole = "admin" | "pm" | "designer" | "vendor" | "viewer";
export type AuthProviderKind = "microsoft" | "google" | "apple";

interface AuthUser {
  sub: string;
  email: string;
  name: string;
  roles: AppRole[];
  via: AuthProviderKind | "demo";
}

interface AuthContextValue {
  user: AuthUser | null;
  signedIn: boolean;
  demoMode: boolean;
  signIn: (via: AuthProviderKind) => Promise<void>;
  getAccessToken: () => Promise<string | null>;
  signOut: () => void;
}

const DEMO_USER: AuthUser = {
  sub: "demo-user",
  email: "demo@designersmeet.com",
  name: "Demo Admin",
  roles: ["admin"],
  via: "demo",
};

// Demo bypass: explicit VITE_DEMO_MODE, or dev AUTH_MODE (the default).
const DEMO_MODE =
  (import.meta.env.VITE_DEMO_MODE ?? "true") === "true" ||
  (import.meta.env.VITE_AUTH_MODE ?? "dev") === "dev";

// MSAL config preserved from wave-1/msal-sso (production path, Graph token source).
export const msalConfig = {
  auth: {
    clientId: import.meta.env.VITE_MSAL_CLIENT_ID ?? "",
    authority: `https://login.microsoftonline.com/${import.meta.env.VITE_MSAL_TENANT ?? "common"}`,
    redirectUri: import.meta.env.VITE_MSAL_REDIRECT ?? window.location.origin,
  },
  cache: { cacheLocation: "localStorage" as const },
};
export const msalScopes = (import.meta.env.VITE_MSAL_SCOPE ?? "User.Read Mail.Send")
  .split(/\s+/)
  .filter(Boolean);
export const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? "";
export const appleClientId = import.meta.env.VITE_APPLE_CLIENT_ID ?? "";

const AuthContext = createContext<AuthContextValue>({
  user: DEMO_MODE ? DEMO_USER : null,
  signedIn: DEMO_MODE,
  demoMode: DEMO_MODE,
  signIn: async () => undefined,
  getAccessToken: async () => null,
  signOut: () => undefined,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(DEMO_MODE ? DEMO_USER : null);

  const signIn = useCallback(async (via: AuthProviderKind) => {
    if (DEMO_MODE) {
      setUser({ ...DEMO_USER, via });
      return;
    }
    // Production: MSAL loginRedirect / GIS / Apple JS. Wired in Phase 5.
    window.location.href = `/api/auth/${via}/start`;
  }, []);

  const signOut = useCallback(() => {
    if (DEMO_MODE) {
      setUser(null);
      return;
    }
    window.location.href = "/api/auth/signout";
  }, []);

  const getAccessToken = useCallback(async (): Promise<string | null> => {
    if (DEMO_MODE) return "demo-token";
    // Production: msalInstance.acquireTokenSilent({ scopes: msalScopes })
    return null;
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      signedIn: !!user,
      demoMode: DEMO_MODE,
      signIn,
      getAccessToken,
      signOut,
    }),
    [user, signIn, getAccessToken, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
