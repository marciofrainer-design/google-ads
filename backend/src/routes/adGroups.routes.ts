import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { listAdGroups, createAdGroup, updateAdGroupStatus } from '../services/adGroups.service';

export const adGroupRoutes = Router();

/**
 * @openapi
 * /api/ad-groups:
 *   get:
 *     tags: [Ad Groups]
 *     summary: Lista grupos de anúncios de uma campanha
 *     parameters:
 *       - in: query
 *         name: campaignId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da campanha.
 *       - $ref: '#/components/parameters/customerId'
 *     responses:
 *       200:
 *         description: Lista de grupos de anúncios.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/AdGroup'
 *       400:
 *         description: Parâmetro campaignId ausente ou inválido.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   post:
 *     tags: [Ad Groups]
 *     summary: Cria um novo grupo de anúncios
 *     parameters:
 *       - $ref: '#/components/parameters/customerId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [campaignId, name]
 *             properties:
 *               campaignId:
 *                 type: string
 *                 example: "1234567890"
 *               name:
 *                 type: string
 *                 example: "Grupo Principal"
 *               status:
 *                 type: string
 *                 enum: [ENABLED, PAUSED]
 *               cpcBidMicros:
 *                 type: integer
 *                 example: 1000000
 *     responses:
 *       201:
 *         description: Grupo de anúncios criado com sucesso.
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
 *                       example: "customers/123/adGroups/456"
 *       400:
 *         description: Dados inválidos.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @openapi
 * /api/ad-groups/{id}/status:
 *   patch:
 *     tags: [Ad Groups]
 *     summary: Atualiza o status de um grupo de anúncios
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do grupo de anúncios.
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
