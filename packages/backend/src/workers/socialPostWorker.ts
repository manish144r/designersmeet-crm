// Dispatches a queued social post via the appropriate ISocialPoster.
import { container } from "../container.js";
import { logger } from "../logger.js";
import type { QueueHandler } from "../queue/IQueueService.js";
import type { SocialPlatform } from "@dm/shared";

export const socialPostWorker: QueueHandler<{
  account_id: string;
  content: string;
  media_urls?: string[];
}> = async (msg) => {
  const { account_id, content, media_urls } = msg.payload;
  const account = await container.repos.socialAccounts.findById(account_id);
  if (!account) throw new Error(`Social account ${account_id} not found`);
  if (!account.active) throw new Error(`Social account ${account_id} is inactive`);

  const poster = container.socialPoster(account.platform as SocialPlatform);
  const result = await poster.post(account, content, media_urls ?? []);
  logger.info({ account_id, platform: account.platform, external_post_id: result.external_post_id }, "Social post sent");
};
