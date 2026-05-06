import { Router } from "express";
import { ShopifyMappingCreate } from "@dm/shared";
import { container } from "../container.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

export const shopifyMappingsRouter: ReturnType<typeof Router> = Router();

shopifyMappingsRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const limit = Math.min(Math.max(parseInt(String(req.query.limit)) || 50, 1), 200);
    const offset = Math.max(parseInt(String(req.query.offset)) || 0, 0);
    const mappings = await container.repos.shopifyMappings.list();
    const paginated = mappings.slice(offset, offset + limit);
    res.json({ data: paginated, meta: { total: mappings.length, limit, offset } });
  }),
);

shopifyMappingsRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const data = ShopifyMappingCreate.parse(req.body);
    const mapping = await container.repos.shopifyMappings.create(data);
    res.status(201).json({ data: mapping });
  }),
);

shopifyMappingsRouter.patch(
  "/:id",
  asyncHandler(async (req, res) => {
    const data = ShopifyMappingCreate.partial().parse(req.body);
    const mapping = await container.repos.shopifyMappings.update(req.params.id, data);
    res.json({ data: mapping });
  }),
);

shopifyMappingsRouter.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    await container.repos.shopifyMappings.delete(req.params.id);
    res.status(204).end();
  }),
);
