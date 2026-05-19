import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

function mockFetch(body: unknown, status = 200) {
  const r = new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
  return vi.fn().mockResolvedValue(r);
}

// ─── jose module mock — hoisted at module level ───────────────────────────────
// We intercept jose at the module level so dynamic imports of sso/index.js
// receive the mocked version. The mock functions are replaced per-test.

const mockJwtVerify = vi.fn();
const mockCreateRemoteJWKSet = vi.fn().mockReturnValue({});

vi.mock("jose", () => ({
  jwtVerify: (...args: unknown[]) => mockJwtVerify(...args),
  createRemoteJWKSet: (...args: unknown[]) => mockCreateRemoteJWKSet(...args),
}));

// ─── Google tokeninfo ─────────────────────────────────────────────────────────

describe("verifyGoogleIdToken — disabled (no client ID)", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv("GOOGLE_OAUTH_CLIENT_ID", "");
  });
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("throws when GOOGLE_OAUTH_CLIENT_ID not configured", async () => {
    const { verifyGoogleIdToken } = await import("../sso/index.js");
    await expect(verifyGoogleIdToken("any-token")).rejects.toThrow("GOOGLE_OAUTH_CLIENT_ID not configured");
  });
});

describe("verifyGoogleIdToken — enabled path (fetch mocked)", () => {
  let fetchSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv("GOOGLE_OAUTH_CLIENT_ID", "client-id-abc.apps.googleusercontent.com");
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("GET tokeninfo URL, returns typed payload", async () => {
    fetchSpy = mockFetch({
      sub: "user-sub-123",
      email: "alice@gmail.com",
      email_verified: true,
      name: "Alice",
      aud: "client-id-abc.apps.googleusercontent.com",
    });
    vi.stubGlobal("fetch", fetchSpy);
    const { verifyGoogleIdToken } = await import("../sso/index.js");
    const payload = await verifyGoogleIdToken("fake.id.token");
    expect(payload.sub).toBe("user-sub-123");
    expect(payload.email).toBe("alice@gmail.com");
    expect(payload.email_verified).toBe(true);
    const [url] = fetchSpy.mock.calls[0] as [string];
    expect(url).toContain("oauth2.googleapis.com/tokeninfo");
    expect(url).toContain("id_token=");
  });

  it("throws on audience mismatch", async () => {
    fetchSpy = mockFetch({
      sub: "sub-999",
      email: "bob@gmail.com",
      email_verified: true,
      aud: "wrong-client-id.apps.googleusercontent.com",
    });
    vi.stubGlobal("fetch", fetchSpy);
    const { verifyGoogleIdToken } = await import("../sso/index.js");
    await expect(verifyGoogleIdToken("fake.token")).rejects.toThrow("audience mismatch");
  });

  it("throws on non-ok HTTP response", async () => {
    fetchSpy = mockFetch({ error: "invalid_token" }, 400);
    vi.stubGlobal("fetch", fetchSpy);
    const { verifyGoogleIdToken } = await import("../sso/index.js");
    await expect(verifyGoogleIdToken("bad.token")).rejects.toThrow("400");
  });

  it("throws when payload contains error field", async () => {
    fetchSpy = mockFetch({ error: "Token used too late" });
    vi.stubGlobal("fetch", fetchSpy);
    const { verifyGoogleIdToken } = await import("../sso/index.js");
    await expect(verifyGoogleIdToken("expired.token")).rejects.toThrow("Token used too late");
  });
});

// ─── Apple verifyAppleIdToken ─────────────────────────────────────────────────

describe("verifyAppleIdToken — disabled (no client ID)", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv("APPLE_OAUTH_CLIENT_ID", "");
  });
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("throws when APPLE_OAUTH_CLIENT_ID not configured", async () => {
    const { verifyAppleIdToken } = await import("../sso/index.js");
    await expect(verifyAppleIdToken("any-token")).rejects.toThrow("APPLE_OAUTH_CLIENT_ID not configured");
  });
});

describe("verifyAppleIdToken — enabled path (jose mocked)", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv("APPLE_OAUTH_CLIENT_ID", "com.example.app");
    mockJwtVerify.mockReset();
    mockCreateRemoteJWKSet.mockReset();
    mockCreateRemoteJWKSet.mockReturnValue({});
  });
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("calls jwtVerify and returns typed payload", async () => {
    const mockPayload = {
      sub: "apple-sub-456",
      email: "bob@privaterelay.appleid.com",
      email_verified: "true",
      iss: "https://appleid.apple.com",
      aud: "com.example.app",
    };
    mockJwtVerify.mockResolvedValue({ payload: mockPayload });
    const { verifyAppleIdToken } = await import("../sso/index.js");
    const result = await verifyAppleIdToken("apple.id.token.here");
    expect(result.sub).toBe("apple-sub-456");
    expect(result.email).toBe("bob@privaterelay.appleid.com");
    expect(result.aud).toBe("com.example.app");
    expect(mockJwtVerify).toHaveBeenCalledOnce();
  });

  it("propagates jwtVerify errors (invalid signature)", async () => {
    mockJwtVerify.mockRejectedValue(new Error("JWSSignatureVerificationFailed"));
    const { verifyAppleIdToken } = await import("../sso/index.js");
    await expect(verifyAppleIdToken("bad.apple.token")).rejects.toThrow("JWSSignatureVerificationFailed");
  });
});
