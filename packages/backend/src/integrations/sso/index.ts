// SSO helpers: Google + Apple ID token verification.
// google: calls tokeninfo endpoint (no SDK needed).
// apple: fetches Apple JWKS then verifies with jose (already a dependency).
// Env-gated by GOOGLE_OAUTH_CLIENT_ID / APPLE_OAUTH_CLIENT_ID.
import { config } from "../../config.js";
import { createRemoteJWKSet, jwtVerify } from "jose";

export interface GoogleTokenPayload {
  sub: string;
  email: string;
  email_verified: boolean;
  name?: string;
  picture?: string;
  aud: string;
}

export interface AppleTokenPayload {
  sub: string;
  email?: string;
  email_verified?: boolean | string;
  aud: string;
}

// ─── Google ──────────────────────────────────────────────────────────────────

export async function verifyGoogleIdToken(idToken: string): Promise<GoogleTokenPayload> {
  if (!config.GOOGLE_OAUTH_CLIENT_ID) {
    throw new Error("GOOGLE_OAUTH_CLIENT_ID not configured");
  }
  const url = `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`;
  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Google tokeninfo → ${res.status}: ${text}`);
  }
  const payload = (await res.json()) as GoogleTokenPayload & { error?: string };
  if (payload.error) {
    throw new Error(`Google tokeninfo error: ${payload.error}`);
  }
  if (payload.aud !== config.GOOGLE_OAUTH_CLIENT_ID) {
    throw new Error(
      `Google token audience mismatch: got ${payload.aud}, expected ${config.GOOGLE_OAUTH_CLIENT_ID}`,
    );
  }
  return payload;
}

// ─── Apple ───────────────────────────────────────────────────────────────────

// Apple JWKS — reuse same RemoteJWKSet instance per process
let _appleJWKS: ReturnType<typeof createRemoteJWKSet> | null = null;
function getAppleJWKS() {
  if (!_appleJWKS) {
    _appleJWKS = createRemoteJWKSet(new URL("https://appleid.apple.com/auth/keys"));
  }
  return _appleJWKS;
}

export async function verifyAppleIdToken(idToken: string): Promise<AppleTokenPayload> {
  if (!config.APPLE_OAUTH_CLIENT_ID) {
    throw new Error("APPLE_OAUTH_CLIENT_ID not configured");
  }
  const { payload } = await jwtVerify(idToken, getAppleJWKS(), {
    issuer: "https://appleid.apple.com",
    audience: config.APPLE_OAUTH_CLIENT_ID,
  });
  return {
    sub: payload.sub as string,
    email: payload["email"] as string | undefined,
    email_verified: payload["email_verified"] as boolean | string | undefined,
    aud: config.APPLE_OAUTH_CLIENT_ID,
  };
}
