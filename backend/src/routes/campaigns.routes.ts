import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import {
  listCampaigns,
  getCampaignById,
  createCampaign,
  updateCampaignStatus,
} from "../services/campaigns.service";
export const campaignRoutes = Router();

/**
 * @openapi
 * /api/campaigns:
 *   get:
 *     tags: [Campaigns]
 *     summary: Lista todas as campanhas
 *     parameters:
 *       - $ref: '#/components/parameters/customerId'
 *     responses:
 *       200:
 *         description: Lista de campanhas.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Campaign'
 *       500:
 *         description: Erro interno.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

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

/**
 * @openapi
 * /api/campaigns/{id}:
 *   get:
 *     tags: [Campaigns]
 *     summary: Busca uma campanha pelo ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da campanha.
 *       - $ref: '#/components/parameters/customerId'
 *     responses:
 *       200:
 *         description: Campanha encontrada.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Campaign'
 *       404:
 *         description: Campanha não encontrada.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

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

/**
 * @openapi
 * /api/campaigns:
 *   post:
 *     tags: [Campaigns]
 *     summary: Cria uma nova campanha
 *     parameters:
 *       - $ref: '#/components/parameters/customerId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [create]
 *             properties:
 *               create:
 *                 type: object
 *                 required: [name, advertisingChannelType, dailyBudgetMicros, biddingStrategy]
 *                 properties:
 *                   name:
 *                     type: string
 *                     example: "Campanha de Verão"
 *                   status:
 *                     type: string
 *                     enum: [ENABLED, PAUSED]
 *                   advertisingChannelType:
 *                     type: string
 *                     enum: [SEARCH, DISPLAY, PERFORMANCE_MAX, DEMAND_GEN, SHOPPING]
 *                   dailyBudgetMicros:
 *                     type: integer
 *                     example: 10000000
 *                   startDateTime:
 *                     type: string
 *                     example: "2026-01-01 00:00:00"
 *                   endDateTime:
 *                     type: string
 *                     example: "2026-12-31 23:59:59"
 *                   biddingStrategy:
 *                     type: string
 *                     enum: [MAXIMIZE_CLICKS, MAXIMIZE_CONVERSIONS, MAXIMIZE_CONVERSION_VALUE, TARGET_CPA, TARGET_ROAS]
 *                   targetCpaMicros:
 *                     type: integer
 *                     example: 5000000
 *                   targetRoas:
 *                     type: number
 *                     example: 3.5
 *               contains_eu_political_advertising:
 *                 type: string
 *                 enum: [UNSPECIFIED, DOES_NOT_CONTAIN_EU_POLITICAL_ADVERTISING, CONTAINS_EU_POLITICAL_ADVERTISING]
 *     responses:
 *       201:
 *         description: Campanha criada com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     resourceName:
 *                       type: string
 *                       example: "customers/123/campaigns/456"
 *       400:
 *         description: Dados inválidos.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

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

/**
 * @openapi
 * /api/campaigns/{id}/status:
 *   patch:
 *     tags: [Campaigns]
 *     summary: Atualiza o status de uma campanha
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da campanha.
 *       - $ref: '#/components/parameters/customerId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [ENABLED, PAUSED]
 *     responses:
 *       200:
 *         description: Status atualizado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     success:
 *                       type: boolean
 *       400:
 *         description: Dados inválidos.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

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
