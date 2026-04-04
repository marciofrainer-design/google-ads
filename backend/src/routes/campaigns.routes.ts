import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import {
  listCampaigns,
  getCampaignById,
  createCampaign,
  updateCampaignStatus,
} from "../services/campaigns.service";
export const campaignRoutes = Router();

// GET /api/campaigns
campaignRoutes.get(
  "/",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const customerId = req.query.customerId as string | undefined;
      const campaigns = await listCampaigns(customerId);
      res.json({ data: campaigns });
    } catch (err) {
      next(err);
    }
  },
);

// GET /api/campaigns/:id
campaignRoutes.get(
  "/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const customerId = req.query.customerId as string | undefined;
      const campaign = await getCampaignById(id, customerId);
      if (!campaign) {
        res.status(404).json({
          error: { code: "NOT_FOUND", message: "Campanha não encontrada" },
        });
        return;
      }
      res.json({ data: campaign });
    } catch (err) {
      next(err);
    }
  },
);

// POST /api/campaigns
const createCampaignSchema = z.object({
  create: z.object({
    name: z.string().min(1).max(255),
    status: z.enum(["ENABLED", "PAUSED"]).optional(),
    advertisingChannelType: z.enum([
      "SEARCH",
      "DISPLAY",
      "PERFORMANCE_MAX",
      "DEMAND_GEN",
      "SHOPPING",
    ]),
    dailyBudgetMicros: z.number().int().positive(),
    startDateTime: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/)
      .optional(),
    endDateTime: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/)
      .optional(),
    biddingStrategy: z.enum([
      "MAXIMIZE_CLICKS",
      "MAXIMIZE_CONVERSIONS",
      "MAXIMIZE_CONVERSION_VALUE",
      "TARGET_CPA",
      "TARGET_ROAS",
    ]),
    targetCpaMicros: z.number().int().positive().optional(),
    targetRoas: z.number().positive().optional(),
  }),
  contains_eu_political_advertising: z
    .enum([
      "UNSPECIFIED",
      "DOES_NOT_CONTAIN_EU_POLITICAL_ADVERTISING",
      "CONTAINS_EU_POLITICAL_ADVERTISING",
    ])
    .optional(),
});

campaignRoutes.post(
  "/",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = createCampaignSchema.parse(req.body);
      const customerId = req.query.customerId as string | undefined;
      const resourceName = await createCampaign(parsed, customerId);
      res.status(201).json({ data: { resourceName } });
    } catch (err) {
      if (err instanceof z.ZodError) {
        res
          .status(400)
          .json({ error: { code: "VALIDATION_ERROR", message: err.issues } });
        return;
      }
      next(err);
    }
  },
);

// PATCH /api/campaigns/:id/status
campaignRoutes.patch(
  "/:id/status",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { status } = z
        .object({ status: z.enum(["ENABLED", "PAUSED"]) })
        .parse(req.body);
      const customerId = req.query.customerId as string | undefined;
      await updateCampaignStatus(id, status, customerId);
      res.json({ data: { success: true } });
    } catch (err) {
      if (err instanceof z.ZodError) {
        res
          .status(400)
          .json({ error: { code: "VALIDATION_ERROR", message: err.issues } });
        return;
      }
      next(err);
    }
  },
);
