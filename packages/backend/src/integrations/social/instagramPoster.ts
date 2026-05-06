// Stub. Instagram Graph API requires a Business or Creator account linked to
// a Facebook Page; deferred to a future release.
import type { SocialMediaAccount } from "@dm/shared";
import { NotImplementedSocialPosterError, type ISocialPoster, type SocialPostResult } from "./ISocialPoster.js";

export class InstagramPoster implements ISocialPoster {
  readonly platform = "instagram" as const;
  readonly available = false;
  async post(_account: SocialMediaAccount, _content: string, _mediaUrls?: string[]): Promise<SocialPostResult> {
    return {
      platform: "instagram",
      external_post_id: "",
      posted_at: new Date().toISOString(),
      success: false,
      error: "Instagram posting is not yet implemented. This integration is planned for a future release.",
    };
  }
}
