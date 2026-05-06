import type { SocialMediaAccount, SocialPlatform } from "@dm/shared";

export interface SocialPostResult {
  platform: SocialPlatform;
  external_post_id: string;
  posted_at: string;
  url?: string;
  success?: boolean;
  error?: string;
}

export interface ISocialPoster {
  readonly platform: SocialPlatform;
  readonly available: boolean;
  post(account: SocialMediaAccount, content: string, mediaUrls?: string[]): Promise<SocialPostResult>;
  refreshToken?(account: SocialMediaAccount): Promise<SocialMediaAccount>;
}

export class NotImplementedSocialPosterError extends Error {
  constructor(platform: SocialPlatform) {
    super(`${platform} poster is not implemented in this build`);
  }
}
