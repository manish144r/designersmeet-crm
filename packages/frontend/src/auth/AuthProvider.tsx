/**
 * AuthProvider.tsx — Clerk-backed auth context for DesignersMeet CRM.
 *
 * Clerk handles all identity providers:
 *   - Microsoft 365 / Entra (for internal staff)
 *   - Google (for freelancers with personal accounts)
 *   - Email/password fallback
 *
 * Demo mode (no VITE_CLERK_PUBLISHABLE_KEY set):
 *   Instantly bypasses auth — full UI accessible without credentials.
 *   Never allowed in production (config.ts throws if auth=clerk and no key).
 *
 * API surface is identical to the previous MSAL implementation so no
 * component code needs to change. Just swap env vars in Vercel:
 *   VITE_CLERK_PUBLISHABLE_KEY   (frontend)
 *   CLERK_SECRET_KEY             (backend)
 *
 * Microsoft Graph tokens:
 *   When a user signs in with Microsoft, Clerk stores the OAuth access token.
 *   getGraphToken() retrieves it via session.getToken({ template: "microsoft-graph" })
 *   — configure the "microsoft-graph" JWT template in Clerk dashboard with the
 *   Graph scopes (Mail.ReadWrite, Calendars.ReadWrite, Contacts.ReadWrite, etc.)
 *   OR set GRAPH_ENABLED=false and use app-level GRAPH_ACCESS_TOKEN on the backend.
 */
import {
  createContext,
  useContext,
  useMemo,
  useCallback,
  type ReactNode,
} from "react";
import {
  ClerkProvider,
  useUser,
  useAuth as useClerkAuth,
  useClerk,
  useSession,
  SignIn,
} from "@clerk/clerk-react";
import { setTokenGetter } from "../api/client.js";

// ─── Types (unchanged from MSAL implementation) ───────────────────────────────

export type AppRole = "admin" | "pm" | "designer" | "vendor" | "viewer";
export type AuthProviderKind = "microsoft" | "google" | "apple";

export interface AuthUser {
  sub: string;
  email: string;
  name: string;
  roles: AppRole[];
  via: AuthProviderKind | "demo";
  tenantId?: string;
}

export interface AuthContextValue {
  user: AuthUser | null;
  signedIn: boolean;
  demoMode: boolean;
  signIn: (via: AuthProviderKind) => Promise<void>;
  /** Returns a short-lived Clerk session token — sent as Authorization: Bearer to the backend. */
  getAccessToken: () => Promise<string | null>;
  /**
   * Returns the Microsoft Graph access token when the user signed in with Microsoft.
   * Requires the "microsoft-graph" JWT template configured in Clerk dashboard.
   * Returns "demo-graph-token" in demo mode (backend stubs Graph calls).
   */
  getGraphToken: () => Promise<string | null>;
  signOut: () => void;
}

// ─── Demo mode ────────────────────────────────────────────────────────────────

const CLERK_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY ?? "";
const DEMO_MODE = !CLERK_KEY;

const DEMO_USER: AuthUser = {
  sub: "demo-admin",
  email: "admin@designersmeet.com",
  name: "Manish Sharma",
  roles: ["admin"],
  via: "demo",
};

// ─── Demo auth context (no Clerk, instant bypass) ─────────────────────────────

const DemoAuthContext = createContext<AuthContextValue>({
  user: DEMO_USER,
  signedIn: true,
  demoMode: true,
  signIn: async () => undefined,
  getAccessToken: async () => "demo-token",
  getGraphToken: async () => "demo-graph-token",
  signOut: () => undefined,
});

function DemoAuthProvider({ children }: { children: ReactNode }) {
  const value = useMemo<AuthContextValue>(
    () => ({
      user: DEMO_USER,
      signedIn: true,
      demoMode: true,
      signIn: async () => undefined,
      getAccessToken: async () => "demo-token",
      getGraphToken: async () => "demo-graph-token",
      signOut: () => undefined,
    }),
    [],
  );

  // Wire demo token into API client
  useMemo(() => setTokenGetter(async () => "demo-token"), []);

  return <DemoAuthContext.Provider value={value}>{children}</DemoAuthContext.Provider>;
}

// ─── Clerk auth context ───────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue>({
  user: null,
  signedIn: false,
  demoMode: false,
  signIn: async () => undefined,
  getAccessToken: async () => null,
  getGraphToken: async () => null,
  signOut: () => undefined,
});

/** Maps a Clerk user to our internal AuthUser shape. */
function clerkUserToAuthUser(clerkUser: ReturnType<typeof useUser>["user"]): AuthUser | null {
  if (!clerkUser) return null;

  // Determine which provider was used for the primary identity
  const primaryAccount = clerkUser.externalAccounts?.[0];
  let via: AuthUser["via"] = "demo";
  let tenantId: string | undefined;

  if (primaryAccount?.provider === "microsoft") {
    via = "microsoft";
    // Clerk stores the tenant in the externalAccount metadata
    tenantId = (primaryAccount as unknown as Record<string, unknown>)["publicMetadata"]
      ? String((primaryAccount as unknown as Record<string, unknown>)["publicMetadata"])
      : undefined;
  } else if (primaryAccount?.provider === "google") {
    via = "google";
  } else if (primaryAccount?.provider === "apple") {
    via = "apple";
  }

  // App roles — read from Clerk public metadata (set via Clerk dashboard or your backend)
  const metaRoles = clerkUser.publicMetadata?.roles as string[] | undefined;
  const roles: AppRole[] = Array.isArray(metaRoles) && metaRoles.length > 0
    ? (metaRoles as AppRole[])
    : ["admin"]; // default all users to admin until RBAC is configured

  return {
    sub: clerkUser.id,
    email: clerkUser.primaryEmailAddress?.emailAddress ?? "",
    name: clerkUser.fullName ?? clerkUser.username ?? "Unknown",
    roles,
    via,
    tenantId,
  };
}

function ClerkAuthProvider({ children }: { children: ReactNode }) {
  const { user: clerkUser, isLoaded, isSignedIn } = useUser();
  const { getToken, signOut: clerkSignOut } = useClerkAuth();
  const { openSignIn } = useClerk();
  const { session } = useSession();

  const user = useMemo(() => clerkUserToAuthUser(clerkUser ?? null), [clerkUser]);

  const signIn = useCallback(async (_via: AuthProviderKind) => {
    // Clerk's unified sign-in modal handles all providers.
    // The user can pick Microsoft, Google, or email/password from the Clerk UI.
    openSignIn();
  }, [openSignIn]);

  const signOut = useCallback(() => {
    clerkSignOut();
  }, [clerkSignOut]);

  /**
   * Returns a Clerk session token (short-lived JWT, aud=your Clerk app).
   * The backend validates this via @clerk/express clerkMiddleware().
   */
  const getAccessToken = useCallback(async (): Promise<string | null> => {
    try {
      return await getToken();
    } catch {
      return null;
    }
  }, [getToken]);

  /**
   * Returns the Microsoft Graph access token stored by Clerk when the user
   * signed in with Microsoft OAuth.
   *
   * Prerequisites in Clerk dashboard:
   *   1. Enable Microsoft OAuth connection
   *   2. Add Graph scopes: User.Read Mail.ReadWrite Mail.Send Calendars.ReadWrite Contacts.ReadWrite
   *   3. Create JWT template named "microsoft-graph" that embeds the Microsoft access token
   */
  const getGraphToken = useCallback(async (): Promise<string | null> => {
    if (!session) return null;
    try {
      // "microsoft-graph" is a named JWT template configured in Clerk dashboard.
      // Falls back to null if the user did not sign in with Microsoft.
      const token = await session.getToken({ template: "microsoft-graph" });
      return token;
    } catch {
      // Template not configured or user didn't sign in with Microsoft — Graph calls
      // will fall back to backend stub responses.
      return null;
    }
  }, [session]);

  // Wire Clerk token into the API client for every fetch.
  useMemo(() => {
    setTokenGetter(getAccessToken);
  }, [getAccessToken]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      signedIn: !!isSignedIn,
      demoMode: false,
      signIn,
      getAccessToken,
      getGraphToken,
      signOut,
    }),
    [user, isSignedIn, signIn, getAccessToken, getGraphToken, signOut],
  );

  // Wait for Clerk to initialise before rendering the app (prevents auth flicker).
  if (!isLoaded) return null;

  // Not signed in — show Clerk's sign-in modal centred on screen.
  if (!isSignedIn) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <SignIn routing="hash" />
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ─── Public AuthProvider ──────────────────────────────────────────────────────

/**
 * Drop-in replacement for the MSAL AuthProvider.
 * Wraps the app in ClerkProvider (real mode) or a demo context (no key set).
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  if (DEMO_MODE) {
    return <DemoAuthProvider>{children}</DemoAuthProvider>;
  }

  return (
    <ClerkProvider publishableKey={CLERK_KEY} afterSignOutUrl="/">
      <ClerkAuthProvider>{children}</ClerkAuthProvider>
    </ClerkProvider>
  );
}

/** Identical API to the previous MSAL useAuth hook. */
export function useAuth(): AuthContextValue {
  const clerkCtx = useContext(AuthContext);
  const demoCtx = useContext(DemoAuthContext);
  // Return whichever context is populated
  return DEMO_MODE ? demoCtx : clerkCtx;
}
