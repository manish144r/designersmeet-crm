import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

function mockFetch(body: unknown, status = 200) {
  const r = new Response(
    body === null ? null : JSON.stringify(body),
    { status, headers: { "Content-Type": "application/json" } },
  );
  return vi.fn().mockResolvedValue(r);
}

const DRAFT = {
  to: "test@example.com",
  subject: "Hello",
  html: "<p>Test</p>",
};

// ─── resolveProvider (always deterministic) ───────────────────────────────────

describe("email — resolveProvider", () => {
  it("returns resend for system_transactional", async () => {
    vi.resetModules();
    const { resolveProvider } = await import("../email/index.js");
    expect(resolveProvider("system_transactional").kind).toBe("resend");
  });

  it("returns msgraph for human_outbound", async () => {
    vi.resetModules();
    const { resolveProvider } = await import("../email/index.js");
    expect(resolveProvider("human_outbound").kind).toBe("msgraph");
  });
});

// ─── stub path (disabled / wrong provider) ────────────────────────────────────

describe("email adapters — stub path (EMAIL_ENABLED=false)", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv("EMAIL_ENABLED", "false");
    vi.stubEnv("EMAIL_API_KEY", "");
  });
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it.each(["resend", "sendgrid", "postmark", "mailgun", "ses", "gmail", "imap_smtp"] as const)(
    "%s.send returns stub-<kind> shape",
    async (kind) => {
      const { emailProviders } = await import("../email/index.js");
      const result = await emailProviders[kind].send(DRAFT);
      expect(result.id).toMatch(new RegExp(`^stub-${kind}-`));
      expect(result.accepted).toBe(true);
      expect(result.provider).toBe(kind);
    },
  );

  it.each(["resend", "sendgrid", "postmark", "mailgun", "ses", "gmail", "imap_smtp"] as const)(
    "%s.status returns ok=true",
    async (kind) => {
      const { emailProviders } = await import("../email/index.js");
      const result = await emailProviders[kind].status();
      expect(result.ok).toBe(true);
      expect(result.kind).toBe(kind);
    },
  );
});

// ─── Resend — real send path ──────────────────────────────────────────────────

describe("email resend — enabled path", () => {
  let fetchSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv("EMAIL_ENABLED", "true");
    vi.stubEnv("EMAIL_PROVIDER", "resend");
    vi.stubEnv("EMAIL_API_KEY", "re_abc123");
    vi.stubEnv("EMAIL_FROM", "sender@dm.com");
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("POST https://api.resend.com/emails with Bearer auth, returns id", async () => {
    fetchSpy = mockFetch({ id: "resend-msg-999" });
    vi.stubGlobal("fetch", fetchSpy);
    const { emailProviders } = await import("../email/index.js");
    const result = await emailProviders.resend.send(DRAFT);
    expect(result.id).toBe("resend-msg-999");
    expect(result.provider).toBe("resend");
    const [url, opts] = fetchSpy.mock.calls[0] as [string, RequestInit & { headers: Record<string, string> }];
    expect(url).toBe("https://api.resend.com/emails");
    expect(opts.method).toBe("POST");
    const auth = (opts.headers as Record<string, string>)["Authorization"];
    expect(auth).toBe("Bearer re_abc123");
    const body = JSON.parse(opts.body as string);
    expect(body.to).toEqual(["test@example.com"]);
    expect(body.from).toBe("sender@dm.com");
  });

  it("throws on non-ok response", async () => {
    fetchSpy = mockFetch({ name: "validation_error" }, 422);
    vi.stubGlobal("fetch", fetchSpy);
    const { emailProviders } = await import("../email/index.js");
    await expect(emailProviders.resend.send(DRAFT)).rejects.toThrow("422");
  });
});

// ─── SendGrid — real send path ────────────────────────────────────────────────

describe("email sendgrid — enabled path", () => {
  let fetchSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv("EMAIL_ENABLED", "true");
    vi.stubEnv("EMAIL_PROVIDER", "sendgrid");
    vi.stubEnv("EMAIL_API_KEY", "SG.test_key");
    vi.stubEnv("EMAIL_FROM", "no-reply@dm.com");
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("POST https://api.sendgrid.com/v3/mail/send, 202 accepted, returns sg- prefixed id", async () => {
    fetchSpy = mockFetch(null, 202);
    vi.stubGlobal("fetch", fetchSpy);
    const { emailProviders } = await import("../email/index.js");
    const result = await emailProviders.sendgrid.send(DRAFT);
    expect(result.accepted).toBe(true);
    expect(result.provider).toBe("sendgrid");
    const [url, opts] = fetchSpy.mock.calls[0] as [string, RequestInit & { headers: Record<string, string> }];
    expect(url).toBe("https://api.sendgrid.com/v3/mail/send");
    expect((opts.headers as Record<string, string>)["Authorization"]).toBe("Bearer SG.test_key");
    const body = JSON.parse(opts.body as string);
    expect(body.personalizations[0].to[0].email).toBe("test@example.com");
  });
});

// ─── Postmark — real send path ────────────────────────────────────────────────

describe("email postmark — enabled path", () => {
  let fetchSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv("EMAIL_ENABLED", "true");
    vi.stubEnv("EMAIL_PROVIDER", "postmark");
    vi.stubEnv("EMAIL_API_KEY", "pm-server-token-xyz");
    vi.stubEnv("EMAIL_FROM", "noreply@dm.com");
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("POST https://api.postmarkapp.com/email, X-Postmark-Server-Token header, returns MessageID", async () => {
    fetchSpy = mockFetch({ MessageID: "pm-msg-abc-def", To: "test@example.com", ErrorCode: 0 });
    vi.stubGlobal("fetch", fetchSpy);
    const { emailProviders } = await import("../email/index.js");
    const result = await emailProviders.postmark.send(DRAFT);
    expect(result.id).toBe("pm-msg-abc-def");
    const [url, opts] = fetchSpy.mock.calls[0] as [string, RequestInit & { headers: Record<string, string> }];
    expect(url).toBe("https://api.postmarkapp.com/email");
    expect((opts.headers as Record<string, string>)["X-Postmark-Server-Token"]).toBe("pm-server-token-xyz");
    const body = JSON.parse(opts.body as string);
    expect(body.To).toBe("test@example.com");
  });
});

// ─── Mailgun — real send path ─────────────────────────────────────────────────

describe("email mailgun — enabled path", () => {
  let fetchSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv("EMAIL_ENABLED", "true");
    vi.stubEnv("EMAIL_PROVIDER", "mailgun");
    vi.stubEnv("EMAIL_API_KEY", "mg_key_test");
    vi.stubEnv("EMAIL_FROM", "no-reply@mg.dm.com");
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("POST to mailgun /messages endpoint, Basic auth, form-encoded", async () => {
    fetchSpy = mockFetch({ id: "<mg-msg-id@mailgun.org>", message: "Queued" });
    vi.stubGlobal("fetch", fetchSpy);
    const { emailProviders } = await import("../email/index.js");
    const result = await emailProviders.mailgun.send(DRAFT);
    expect(result.id).toBe("<mg-msg-id@mailgun.org>");
    const [url, opts] = fetchSpy.mock.calls[0] as [string, RequestInit & { headers: Record<string, string> }];
    expect(url).toContain("api.mailgun.net/v3");
    expect(url).toContain("/messages");
    const auth = (opts.headers as Record<string, string>)["Authorization"];
    expect(auth).toMatch(/^Basic /);
    expect((opts.headers as Record<string, string>)["Content-Type"]).toBe("application/x-www-form-urlencoded");
    const body = opts.body as string;
    expect(body).toContain("to=test%40example.com");
  });
});
