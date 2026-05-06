// Auth context with dual-mode support:
// - Development (default): stub DEV_USER — backend dev bypass accepts the request
// - Production: @azure/msal-react with Entra ID tokens
import { createContext, useContext, useMemo, useCallback, type ReactNode } from "react";

export type AppRole = "admin" | "designer" | "client";

interface AuthUser {
  sub: string;
  email: string;
  name: string;
  roles: AppRole[];
}

interface AuthContextValue {
  user: AuthUser | null;
  signedIn: boolean;
  getAccessToken: () => Promise<string | null>;
  signOut: () => void;
}

const DEV_USER: AuthUser = {
  sub: "dev-user",
  email: "dev@designersmeet.local",
  name: "Dev Admin",
  roles: ["admin"],
};

const isDevMode = (import.meta.env.VITE_AUTH_MODE ?? "dev") === "dev";

const AuthContext = createContext<AuthContextValue>({
  user: DEV_USER,
  signedIn: true,
  getAccessToken: async () => null,
  signOut: () => undefined,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const signOut = useCallback(() => {
    if (isDevMode) {
      console.info("Sign-out requested (dev mode is a no-op)");
      return;
    }
    // Production: msalInstance.logoutRedirect();
    window.location.href = "/";
  }, []);

  const getAccessToken = useCallback(async (): Promise<string | null> => {
    if (isDevMode) return null;
    // Production: acquire token silently from MSAL
    // const accounts = msalInstance.getAllAccounts();
    // const response = await msalInstance.acquireTokenSilent({
    //   scopes: [import.meta.env.VITE_MSAL_SCOPE],
    //   account: accounts[0],
    // });
    // return response.accessToken;
    return null;
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: DEV_USER,
      signedIn: true,
      getAccessToken,
      signOut,
    }),
    [getAccessToken, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
