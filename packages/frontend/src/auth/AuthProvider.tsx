// DesignersMeet auth context.
// Real path: Microsoft Entra (MSAL loginPopup) when VITE_MSAL_CLIENT_ID is set.
// Demo path: instant bypass when VITE_MSAL_CLIENT_ID is not configured.
//
// Backend token strategy: we send the MSAL ID token (aud=client_id) rather than
// the access token (aud=graph.microsoft.com) so the backend JWKS validation
// works without requiring a custom API scope in Azure App Registration.
import {
  createContext,
  useContext,
  useMemo,
  useCallback,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import {
  PublicClientApplication,
  type AccountInfo,
  InteractionRequiredAuthError,
  BrowserAuthError,
} from "@azure/msal-browser";
import { setTokenGetter } from "../api/client.js";

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
  sub: "admin-user",
  email: "admin@designersmeet.com",
  name: "Manish Sharma",
  roles: ["admin"],
  via: "demo",
};

// Demo mode when MSAL client ID is not configured.
// Set VITE_MSAL_CLIENT_ID in Vercel env vars to enable real Microsoft auth.
const MSAL_CLIENT_ID = import.meta.env.VITE_MSAL_CLIENT_ID ?? "";
const MSAL_TENANT = import.meta.env.VITE_MSAL_TENANT ?? "designersmeet.com";
const DEMO_MODE = !MSAL_CLIENT_ID;

const MSAL_SCOPES = ["openid", "profile", "email", "User.Read"];

export const msalConfig = {
  auth: {
    clientId: MSAL_CLIENT_ID,
    authority: `https://login.microsoftonline.com/${MSAL_TENANT}`,
    redirectUri: typeof window !== "undefined" ? window.location.origin : "",
  },
  cache: { cacheLocation: "localStorage" as const, storeAuthStateInCookie: true },
  system: { allowNativeBroker: false },
};

// MSAL singleton — only created when client ID is present.
let _msalApp: PublicClientApplication | null = null;
function getMsalApp(): PublicClientApplication | null {
  if (DEMO_MODE) return null;
  if (!_msalApp) _msalApp = new PublicClientApplication(msalConfig);
  return _msalApp;
}

function accountToUser(account: AccountInfo): AuthUser {
  return {
    sub: account.homeAccountId,
    email: account.username,
    name: account.name ?? account.username,
    roles: ["admin"],
    via: "microsoft",
  };
}

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
  const [ready, setReady] = useState(DEMO_MODE); // demo is always ready

  // Initialise MSAL and restore any existing session.
  useEffect(() => {
    if (DEMO_MODE) return;
    const app = getMsalApp()!;
    app
      .initialize()
      .then(() => app.handleRedirectPromise())
      .then((resp) => {
        if (resp?.account) {
          setUser(accountToUser(resp.account));
        } else {
          const accounts = app.getAllAccounts();
          if (accounts.length > 0) setUser(accountToUser(accounts[0]));
        }
      })
      .catch(console.error)
      .finally(() => setReady(true));
  }, []);

  const signIn = useCallback(async (via: AuthProviderKind) => {
    if (DEMO_MODE) {
      setUser({ ...DEMO_USER, via });
      return;
    }
    if (via !== "microsoft") {
      // Google / Apple not wired yet — use demo user as placeholder.
      setUser({ ...DEMO_USER, via });
      return;
    }
    const app = getMsalApp();
    if (!app) return;
    try {
      const resp = await app.loginPopup({ scopes: MSAL_SCOPES });
      if (resp?.account) setUser(accountToUser(resp.account));
    } catch (err) {
      if (err instanceof BrowserAuthError && err.errorCode === "popup_window_error") {
        // Popup blocked — fall back to redirect flow.
        await app.loginRedirect({ scopes: MSAL_SCOPES });
      } else {
        console.error("MSAL login error", err);
      }
    }
  }, []);

  const signOut = useCallback(() => {
    if (DEMO_MODE) {
      setUser(null);
      return;
    }
    const app = getMsalApp();
    const accounts = app?.getAllAccounts() ?? [];
    setUser(null);
    if (app && accounts.length > 0) {
      app.logoutRedirect({
        account: accounts[0],
        postLogoutRedirectUri: window.location.origin,
      });
    }
  }, []);

  const getAccessToken = useCallback(async (): Promise<string | null> => {
    if (DEMO_MODE) return "demo-token";
    const app = getMsalApp();
    if (!app) return null;
    const accounts = app.getAllAccounts();
    if (!accounts.length) return null;
    try {
      // Return idToken (aud=client_id) — backend validates against ENTRA_CLIENT_ID.
      // Access token has aud=graph.microsoft.com and would fail backend JWKS check.
      const result = await app.acquireTokenSilent({ scopes: MSAL_SCOPES, account: accounts[0] });
      return result.idToken;
    } catch (err) {
      if (err instanceof InteractionRequiredAuthError) {
        try {
          const result = await app.acquireTokenPopup({ scopes: MSAL_SCOPES, account: accounts[0] });
          return result.idToken;
        } catch {
          return null;
        }
      }
      return null;
    }
  }, []);

  // Wire the token getter into the API client so every fetch includes Bearer header.
  useEffect(() => {
    setTokenGetter(getAccessToken);
  }, [getAccessToken]);

  const value = useMemo<AuthContextValue>(
    () => ({ user, signedIn: !!user, demoMode: DEMO_MODE, signIn, getAccessToken, signOut }),
    [user, signIn, getAccessToken, signOut],
  );

  // Don't render until MSAL is initialised (prevents auth flicker on redirect).
  if (!ready) return null;

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
