import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { getCampaignMetrics, getDailyMetrics, getAdGroupMetrics } from '../services/metrics.service';

export const metricsRoutes = Router();

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
