// DesignersMeet auth context — powered by Clerk.
// Demo path: instant bypass when VITE_CLERK_PUBLISHABLE_KEY is not configured.
// Real path: Clerk hosted sign-in (Microsoft 365 + Google social connections).
//
// Same useAuth() API surface as the previous MSAL implementation so all
// consumers (NavGuard, page components, API client token getter) work unchanged.
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
  ClerkProvider,
  useUser,
  useAuth as useClerkAuth,
  SignIn,
} from "@clerk/clerk-react";
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

// Demo mode when Clerk publishable key is not configured.
// Set VITE_CLERK_PUBLISHABLE_KEY in Vercel env vars to enable real Clerk auth.
const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY ?? "";
const DEMO_MODE = !CLERK_PUBLISHABLE_KEY;

const AuthContext = createContext<AuthContextValue>({
  user: DEMO_MODE ? DEMO_USER : null,
  signedIn: DEMO_MODE,
  demoMode: DEMO_MODE,
  signIn: async () => undefined,
  getAccessToken: async () => null,
  signOut: () => undefined,
});

// ─── Inner provider — only rendered when Clerk is active ─────────────────────
function ClerkAuthInner({ children }: { children: ReactNode }) {
  const { user: clerkUser, isLoaded, isSignedIn } = useUser();
  const { getToken, signOut: clerkSignOut } = useClerkAuth();

  const user = useMemo<AuthUser | null>(() => {
    if (!isLoaded || !isSignedIn || !clerkUser) return null;
    // Derive app role: check publicMetadata.role first, default to admin.
    const metaRole = (clerkUser.publicMetadata?.role as AppRole | undefined) ?? "admin";
    const via: AuthProviderKind =
      clerkUser.primaryEmailAddress?.emailAddress?.endsWith("@microsoft.com")
        ? "microsoft"
        : "google";
    return {
      sub: clerkUser.id,
      email: clerkUser.primaryEmailAddress?.emailAddress ?? "",
      name: clerkUser.fullName ?? clerkUser.primaryEmailAddress?.emailAddress ?? "",
      roles: [metaRole],
      via,
    };
  }, [clerkUser, isLoaded, isSignedIn]);

  const signIn = useCallback(async (_via: AuthProviderKind) => {
    // Clerk handles sign-in via its hosted UI — this is a no-op in the Clerk path.
    // The ClerkProvider renders <SignIn> when the user is not signed in.
  }, []);

  const signOut = useCallback(() => {
    clerkSignOut();
  }, [clerkSignOut]);

  const getAccessToken = useCallback(async (): Promise<string | null> => {
    try {
      return await getToken();
    } catch {
      return null;
    }
  }, [getToken]);

  // Wire the token getter into the API client so every fetch includes Bearer header.
  useEffect(() => {
    setTokenGetter(getAccessToken);
  }, [getAccessToken]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      signedIn: !!user,
      demoMode: false,
      signIn,
      getAccessToken,
      signOut,
    }),
    [user, signIn, getAccessToken, signOut],
  );

  // Show Clerk sign-in screen when not authenticated (replaces loginPopup).
  if (isLoaded && !isSignedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <SignIn routing="hash" />
      </div>
    );
  }

  // Don't render children until Clerk has resolved the session.
  if (!isLoaded) return null;

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ─── Demo inner provider — when no Clerk key is configured ────────────────────
function DemoAuthInner({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(DEMO_USER);

  const signIn = useCallback(async (via: AuthProviderKind) => {
    setUser({ ...DEMO_USER, via });
  }, []);

  const signOut = useCallback(() => {
    setUser(null);
  }, []);

  const getAccessToken = useCallback(async (): Promise<string | null> => {
    return "demo-token";
  }, []);

  useEffect(() => {
    setTokenGetter(getAccessToken);
  }, [getAccessToken]);

  const value = useMemo<AuthContextValue>(
    () => ({ user, signedIn: !!user, demoMode: true, signIn, getAccessToken, signOut }),
    [user, signIn, getAccessToken, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ─── Public AuthProvider ──────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: ReactNode }) {
  if (DEMO_MODE) {
    return <DemoAuthInner>{children}</DemoAuthInner>;
  }

  return (
    <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY} afterSignOutUrl="/">
      <ClerkAuthInner>{children}</ClerkAuthInner>
    </ClerkProvider>
  );
}

export const useAuth = () => useContext(AuthContext);
