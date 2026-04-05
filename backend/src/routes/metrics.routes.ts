import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { getCampaignMetrics, getDailyMetrics, getAdGroupMetrics } from '../services/metrics.service';

export const metricsRoutes = Router();

/**
 * @openapi
 * /api/metrics/campaigns:
 *   get:
 *     tags: [Metrics]
 *     summary: Métricas agregadas por campanha
 *     parameters:
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^\d{4}-\d{2}-\d{2}$'
 *         example: "2026-01-01"
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^\d{4}-\d{2}-\d{2}$'
 *         example: "2026-03-31"
 *       - $ref: '#/components/parameters/customerId'
 *     responses:
 *       200:
 *         description: Lista de métricas por campanha.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Metrics'
 *       400:
 *         description: Parâmetros de data inválidos.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @openapi
 * /api/metrics/daily:
 *   get:
 *     tags: [Metrics]
 *     summary: Métricas diárias
 *     parameters:
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^\d{4}-\d{2}-\d{2}$'
 *         example: "2026-01-01"
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^\d{4}-\d{2}-\d{2}$'
 *         example: "2026-03-31"
 *       - in: query
 *         name: campaignId
 *         schema:
 *           type: string
 *         description: Filtra por campanha específica (opcional).
 *       - $ref: '#/components/parameters/customerId'
 *     responses:
 *       200:
 *         description: Métricas diárias.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Metrics'
 *       400:
 *         description: Parâmetros de data inválidos.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @openapi
 * /api/metrics/ad-groups/{campaignId}:
 *   get:
 *     tags: [Metrics]
 *     summary: Métricas por grupo de anúncios de uma campanha
 *     parameters:
 *       - in: path
 *         name: campaignId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da campanha.
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^\d{4}-\d{2}-\d{2}$'
 *         example: "2026-01-01"
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^\d{4}-\d{2}-\d{2}$'
 *         example: "2026-03-31"
 *       - $ref: '#/components/parameters/customerId'
 *     responses:
 *       200:
 *         description: Métricas por grupo de anúncios.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Metrics'
 *       400:
 *         description: Parâmetros inválidos.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

const dateRangeSchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

// GET /api/metrics/campaigns?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
metricsRoutes.get('/campaigns', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { startDate, endDate } = dateRangeSchema.parse(req.query);
    const customerId = req.query.customerId as string | undefined;
    const data = await getCampaignMetrics({ startDate, endDate }, customerId);
    res.json({ data });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: err.issues } });
      return;
    }
    next(err);
  }
});

// GET /api/metrics/daily?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD&campaignId=123
metricsRoutes.get('/daily', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { startDate, endDate } = dateRangeSchema.parse(req.query);
    const campaignId = req.query.campaignId as string | undefined;
    const customerId = req.query.customerId as string | undefined;
    const data = await getDailyMetrics({ startDate, endDate }, campaignId, customerId);
    res.json({ data });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: err.issues } });
      return;
    }
    next(err);
  }
});

// GET /api/metrics/ad-groups/:campaignId?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
metricsRoutes.get('/ad-groups/:campaignId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { campaignId } = req.params;
    const { startDate, endDate } = dateRangeSchema.parse(req.query);
    const customerId = req.query.customerId as string | undefined;
    const data = await getAdGroupMetrics(campaignId, { startDate, endDate }, customerId);
    res.json({ data });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: err.issues } });
      return;
    }
    next(err);
  }
});
