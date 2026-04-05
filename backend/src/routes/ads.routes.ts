import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { listAds, createResponsiveSearchAd, updateAdStatus } from '../services/ads.service';

export const adRoutes = Router();

/**
 * @openapi
 * /api/ads:
 *   get:
 *     tags: [Ads]
 *     summary: Lista anúncios de um grupo de anúncios
 *     parameters:
 *       - in: query
 *         name: adGroupId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do grupo de anúncios.
 *       - $ref: '#/components/parameters/customerId'
 *     responses:
 *       200:
 *         description: Lista de anúncios.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Ad'
 *       400:
 *         description: Parâmetro adGroupId ausente ou inválido.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @openapi
 * /api/ads/responsive-search:
 *   post:
 *     tags: [Ads]
 *     summary: Cria um Responsive Search Ad
 *     parameters:
 *       - $ref: '#/components/parameters/customerId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [adGroupId, finalUrls, headlines, descriptions]
 *             properties:
 *               adGroupId:
 *                 type: string
 *                 example: "9876543210"
 *               finalUrls:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["https://example.com"]
 *               headlines:
 *                 type: array
 *                 minItems: 3
 *                 maxItems: 15
 *                 items:
 *                   type: object
 *                   properties:
 *                     text:
 *                       type: string
 *                       maxLength: 30
 *               descriptions:
 *                 type: array
 *                 minItems: 2
 *                 maxItems: 4
 *                 items:
 *                   type: object
 *                   properties:
 *                     text:
 *                       type: string
 *                       maxLength: 90
 *               path1:
 *                 type: string
 *                 maxLength: 15
 *               path2:
 *                 type: string
 *                 maxLength: 15
 *     responses:
 *       201:
 *         description: Anúncio criado com sucesso.
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
 *                       example: "customers/123/adGroupAds/456~789"
 *       400:
 *         description: Dados inválidos.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @openapi
 * /api/ads/{adGroupId}/{adId}/status:
 *   patch:
 *     tags: [Ads]
 *     summary: Atualiza o status de um anúncio
 *     parameters:
 *       - in: path
 *         name: adGroupId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: adId
 *         required: true
 *         schema:
 *           type: string
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
