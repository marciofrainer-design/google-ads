"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adGroupRoutes = void 0;
const express_1 = require("express");
const zod_1 = require("zod");
const adGroups_service_1 = require("../services/adGroups.service");
exports.adGroupRoutes = (0, express_1.Router)();
// GET /api/ad-groups?campaignId=123
exports.adGroupRoutes.get('/', async (req, res, next) => {
    try {
        const { campaignId } = zod_1.z.object({ campaignId: zod_1.z.string() }).parse(req.query);
        const customerId = req.query.customerId;
        const data = await (0, adGroups_service_1.listAdGroups)(campaignId, customerId);
        res.json({ data });
    }
    catch (err) {
        if (err instanceof zod_1.z.ZodError) {
            res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: err.issues } });
            return;
        }
        next(err);
    }
});
// POST /api/ad-groups
const createAdGroupSchema = zod_1.z.object({
    campaignId: zod_1.z.string(),
    name: zod_1.z.string().min(1).max(255),
    status: zod_1.z.enum(['ENABLED', 'PAUSED']).optional(),
    cpcBidMicros: zod_1.z.number().int().positive().optional(),
});
exports.adGroupRoutes.post('/', async (req, res, next) => {
    try {
        const dto = createAdGroupSchema.parse(req.body);
        const customerId = req.query.customerId;
        const resourceName = await (0, adGroups_service_1.createAdGroup)(dto, customerId);
        res.status(201).json({ data: { resourceName } });
    }
    catch (err) {
        if (err instanceof zod_1.z.ZodError) {
            res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: err.issues } });
            return;
        }
        next(err);
    }
});
// PATCH /api/ad-groups/:id/status
exports.adGroupRoutes.patch('/:id/status', async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = zod_1.z.object({ status: zod_1.z.enum(['ENABLED', 'PAUSED']) }).parse(req.body);
        const customerId = req.query.customerId;
        await (0, adGroups_service_1.updateAdGroupStatus)(id, status, customerId);
        res.json({ data: { success: true } });
    }
    catch (err) {
        if (err instanceof zod_1.z.ZodError) {
            res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: err.issues } });
            return;
        }
        next(err);
    }
});
//# sourceMappingURL=adGroups.routes.js.map