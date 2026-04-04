import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { listAds, createResponsiveSearchAd, updateAdStatus } from '../services/ads.service';

export const adRoutes = Router();

// GET /api/ads?adGroupId=123
adRoutes.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { adGroupId } = z.object({ adGroupId: z.string() }).parse(req.query);
    const customerId = req.query.customerId as string | undefined;
    const data = await listAds(adGroupId, customerId);
    res.json({ data });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: err.issues } });
      return;
    }
    next(err);
  }
});

// POST /api/ads/responsive-search
const rsdSchema = z.object({
  adGroupId: z.string(),
  finalUrls: z.array(z.string().url()).min(1),
  headlines: z.array(z.object({ text: z.string().max(30) })).min(3).max(15),
  descriptions: z.array(z.object({ text: z.string().max(90) })).min(2).max(4),
  path1: z.string().max(15).optional(),
  path2: z.string().max(15).optional(),
});

adRoutes.post('/responsive-search', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const dto = rsdSchema.parse(req.body);
    const customerId = req.query.customerId as string | undefined;
    const resourceName = await createResponsiveSearchAd(dto, customerId);
    res.status(201).json({ data: { resourceName } });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: err.issues } });
      return;
    }
    next(err);
  }
});

// PATCH /api/ads/:adGroupId/:adId/status
adRoutes.patch('/:adGroupId/:adId/status', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { adGroupId, adId } = req.params;
    const { status } = z.object({ status: z.enum(['ENABLED', 'PAUSED']) }).parse(req.body);
    const customerId = req.query.customerId as string | undefined;
    await updateAdStatus(adGroupId, adId, status, customerId);
    res.json({ data: { success: true } });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: err.errors } });
      return;
    }
    next(err);
  }
});
