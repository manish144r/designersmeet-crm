// Stub. Facebook Graph API integration deferred to a future release. Replace this
// file with a working implementation when `available = true` is needed.
import type { SocialMediaAccount } from "@dm/shared";
import { NotImplementedSocialPosterError, type ISocialPoster, type SocialPostResult } from "./ISocialPoster.js";

export class FacebookPoster implements ISocialPoster {
  readonly platform = "facebook" as const;
  readonly available = false;
  async post(_account: SocialMediaAccount, _content: string, _mediaUrls?: string[]): Promise<SocialPostResult> {
    return {
      platform: "facebook",
      external_post_id: "",
      posted_at: new Date().toISOString(),
      success: false,
      error: "Facebook posting is not yet implemented. This integration is planned for a future release.",
    };
  }
}
