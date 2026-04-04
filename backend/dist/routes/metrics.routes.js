"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.metricsRoutes = void 0;
const express_1 = require("express");
const zod_1 = require("zod");
const metrics_service_1 = require("../services/metrics.service");
exports.metricsRoutes = (0, express_1.Router)();
const dateRangeSchema = zod_1.z.object({
    startDate: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    endDate: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});
// GET /api/metrics/campaigns?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
exports.metricsRoutes.get('/campaigns', async (req, res, next) => {
    try {
        const { startDate, endDate } = dateRangeSchema.parse(req.query);
        const customerId = req.query.customerId;
        const data = await (0, metrics_service_1.getCampaignMetrics)({ startDate, endDate }, customerId);
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
// GET /api/metrics/daily?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD&campaignId=123
exports.metricsRoutes.get('/daily', async (req, res, next) => {
    try {
        const { startDate, endDate } = dateRangeSchema.parse(req.query);
        const campaignId = req.query.campaignId;
        const customerId = req.query.customerId;
        const data = await (0, metrics_service_1.getDailyMetrics)({ startDate, endDate }, campaignId, customerId);
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
// GET /api/metrics/ad-groups/:campaignId?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
exports.metricsRoutes.get('/ad-groups/:campaignId', async (req, res, next) => {
    try {
        const { campaignId } = req.params;
        const { startDate, endDate } = dateRangeSchema.parse(req.query);
        const customerId = req.query.customerId;
        const data = await (0, metrics_service_1.getAdGroupMetrics)(campaignId, { startDate, endDate }, customerId);
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
//# sourceMappingURL=metrics.routes.js.map