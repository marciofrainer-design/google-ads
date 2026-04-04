import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { listAdGroups, createAdGroup, updateAdGroupStatus } from '../services/adGroups.service';

export const adGroupRoutes = Router();

// GET /api/ad-groups?campaignId=123
adGroupRoutes.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { campaignId } = z.object({ campaignId: z.string() }).parse(req.query);
    const customerId = req.query.customerId as string | undefined;
    const data = await listAdGroups(campaignId, customerId);
    res.json({ data });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: err.issues } });
      return;
    }
    next(err);
  }
});

// POST /api/ad-groups
const createAdGroupSchema = z.object({
  campaignId: z.string(),
  name: z.string().min(1).max(255),
  status: z.enum(['ENABLED', 'PAUSED']).optional(),
  cpcBidMicros: z.number().int().positive().optional(),
});

adGroupRoutes.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const dto = createAdGroupSchema.parse(req.body);
    const customerId = req.query.customerId as string | undefined;
    const resourceName = await createAdGroup(dto, customerId);
    res.status(201).json({ data: { resourceName } });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: err.issues } });
      return;
    }
    next(err);
  }
});

// PATCH /api/ad-groups/:id/status
adGroupRoutes.patch('/:id/status', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status } = z.object({ status: z.enum(['ENABLED', 'PAUSED']) }).parse(req.body);
    const customerId = req.query.customerId as string | undefined;
    await updateAdGroupStatus(id, status, customerId);
    res.json({ data: { success: true } });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: err.issues } });
      return;
    }
    next(err);
  }
});
