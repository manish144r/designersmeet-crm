import { describe, it, expect } from "vitest";
import { FacebookPoster } from "../integrations/social/facebookPoster.js";
import { InstagramPoster } from "../integrations/social/instagramPoster.js";
import type { SocialMediaAccount } from "@dm/shared";

const mockAccount: SocialMediaAccount = {
  account_id: "test-123",
  platform: "facebook",
  account_name: "test-account",
  access_token: "tok",
  refresh_token: null,
  token_expires_at: null,
  active: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

describe("FacebookPoster", () => {
  it("should be marked as unavailable", () => {
    const poster = new FacebookPoster();
    expect(poster.available).toBe(false);
    expect(poster.platform).toBe("facebook");
  });

  it("should return error result instead of throwing", async () => {
    const poster = new FacebookPoster();
    const result = await poster.post(mockAccount, "test content");
    expect(result.success).toBe(false);
    expect(result.error).toContain("not yet implemented");
    expect(result.platform).toBe("facebook");
  });
});

describe("InstagramPoster", () => {
  it("should be marked as unavailable", () => {
    const poster = new InstagramPoster();
    expect(poster.available).toBe(false);
    expect(poster.platform).toBe("instagram");
  });

  it("should return error result instead of throwing", async () => {
    const poster = new InstagramPoster();
    const result = await poster.post({ ...mockAccount, platform: "instagram" }, "test content");
    expect(result.success).toBe(false);
    expect(result.error).toContain("not yet implemented");
    expect(result.platform).toBe("instagram");
  });
});
