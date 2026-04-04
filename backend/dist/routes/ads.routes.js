"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adRoutes = void 0;
const express_1 = require("express");
const zod_1 = require("zod");
const ads_service_1 = require("../services/ads.service");
exports.adRoutes = (0, express_1.Router)();
// GET /api/ads?adGroupId=123
exports.adRoutes.get('/', async (req, res, next) => {
    try {
        const { adGroupId } = zod_1.z.object({ adGroupId: zod_1.z.string() }).parse(req.query);
        const customerId = req.query.customerId;
        const data = await (0, ads_service_1.listAds)(adGroupId, customerId);
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
// POST /api/ads/responsive-search
const rsdSchema = zod_1.z.object({
    adGroupId: zod_1.z.string(),
    finalUrls: zod_1.z.array(zod_1.z.string().url()).min(1),
    headlines: zod_1.z.array(zod_1.z.object({ text: zod_1.z.string().max(30) })).min(3).max(15),
    descriptions: zod_1.z.array(zod_1.z.object({ text: zod_1.z.string().max(90) })).min(2).max(4),
    path1: zod_1.z.string().max(15).optional(),
    path2: zod_1.z.string().max(15).optional(),
});
exports.adRoutes.post('/responsive-search', async (req, res, next) => {
    try {
        const dto = rsdSchema.parse(req.body);
        const customerId = req.query.customerId;
        const resourceName = await (0, ads_service_1.createResponsiveSearchAd)(dto, customerId);
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
// PATCH /api/ads/:adGroupId/:adId/status
exports.adRoutes.patch('/:adGroupId/:adId/status', async (req, res, next) => {
    try {
        const { adGroupId, adId } = req.params;
        const { status } = zod_1.z.object({ status: zod_1.z.enum(['ENABLED', 'PAUSED']) }).parse(req.body);
        const customerId = req.query.customerId;
        await (0, ads_service_1.updateAdStatus)(adGroupId, adId, status, customerId);
        res.json({ data: { success: true } });
    }
    catch (err) {
        if (err instanceof zod_1.z.ZodError) {
            res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: err.errors } });
            return;
        }
        next(err);
    }
});
//# sourceMappingURL=ads.routes.js.map