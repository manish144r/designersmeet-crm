// LinkedIn UGC Posts API. Requires an OAuth2 access token with `w_member_social`
// scope, stored in the SocialMediaAccount.access_token field.
// Reference: https://learn.microsoft.com/en-us/linkedin/marketing/integrations/community-management/shares/ugc-post-api
import type { SocialMediaAccount } from "@dm/shared";
import type { ISocialPoster, SocialPostResult } from "./ISocialPoster.js";

export class LinkedInPoster implements ISocialPoster {
  readonly platform = "linkedin" as const;
  readonly available = true;

  async post(account: SocialMediaAccount, content: string, mediaUrls: string[] = []): Promise<SocialPostResult> {
    if (!account.access_token) throw new Error("LinkedIn account is missing access_token");

    // account.account_name is expected to be the LinkedIn person URN, e.g. urn:li:person:abc123
    const author = account.account_name.startsWith("urn:li:") ? account.account_name : `urn:li:person:${account.account_name}`;

    const body = {
      author,
      lifecycleState: "PUBLISHED",
      specificContent: {
        "com.linkedin.ugc.ShareContent": {
          shareCommentary: { text: content },
          shareMediaCategory: mediaUrls.length > 0 ? "ARTICLE" : "NONE",
          ...(mediaUrls.length > 0 && {
            media: mediaUrls.map((url) => ({
              status: "READY",
              originalUrl: url,
            })),
          }),
        },
      },
      visibility: { "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC" },
    };

    const res = await fetch("https://api.linkedin.com/v2/ugcPosts", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${account.access_token}`,
        "Content-Type": "application/json",
        "X-Restli-Protocol-Version": "2.0.0",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`LinkedIn UGC post failed: ${res.status} ${text}`);
    }

    const externalPostId = res.headers.get("x-restli-id") ?? "";
    return {
      platform: "linkedin",
      external_post_id: externalPostId,
      posted_at: new Date().toISOString(),
      url: externalPostId ? `https://www.linkedin.com/feed/update/${externalPostId}` : undefined,
    };
  }
}
