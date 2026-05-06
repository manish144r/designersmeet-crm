import { Router } from "express";
import { SOCIAL_PLATFORMS, SocialMediaAccountCreate, SocialPostRequest } from "@dm/shared";
import { container } from "../container.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { HttpError } from "../middleware/errorHandler.js";

export const socialRouter: ReturnType<typeof Router> = Router();

// Lists platforms and which ones are live vs. stubbed.
socialRouter.get(
  "/platforms",
  asyncHandler(async (_req, res) => {
    res.json({
      data: SOCIAL_PLATFORMS.map((platform) => ({
        platform,
        available: container.socialPoster(platform).available,
      })),
    });
  }),
);

socialRouter.get(
  "/accounts",
  asyncHandler(async (req, res) => {
    const platform = typeof req.query.platform === "string" ? req.query.platform : undefined;
    const accounts = await container.repos.socialAccounts.list({ platform });
    // Strip secrets from the wire response — keep tokens server-side only.
    res.json({
      data: accounts.map(({ access_token, refresh_token, ...rest }) => ({
        ...rest,
        has_access_token: Boolean(access_token),
        has_refresh_token: Boolean(refresh_token),
      })),
    });
  }),
);

socialRouter.post(
  "/accounts",
  asyncHandler(async (req, res) => {
    const data = SocialMediaAccountCreate.parse(req.body);
    const account = await container.repos.socialAccounts.create(data);
    res.status(201).json({
      data: { ...account, access_token: undefined, refresh_token: undefined },
    });
  }),
);

socialRouter.delete(
  "/accounts/:id",
  asyncHandler(async (req, res) => {
    await container.repos.socialAccounts.delete(req.params.id);
    res.status(204).end();
  }),
);

socialRouter.post(
  "/post",
  asyncHandler(async (req, res) => {
    const data = SocialPostRequest.parse(req.body);
    const account = await container.repos.socialAccounts.findById(data.account_id);
    if (!account) throw new HttpError(404, "Social account not found");
    const poster = container.socialPoster(account.platform);
    if (!poster.available) throw new HttpError(501, `${account.platform} poster not implemented yet`);

    const item = await container.queue.enqueue("social.post", {
      account_id: data.account_id,
      content: data.content,
      media_urls: data.media_urls,
    });
    res.status(202).json({ data: { queued: item } });
  }),
);
