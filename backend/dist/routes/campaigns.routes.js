"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.campaignRoutes = void 0;
const express_1 = require("express");
const zod_1 = require("zod");
const campaigns_service_1 = require("../services/campaigns.service");
exports.campaignRoutes = (0, express_1.Router)();
// GET /api/campaigns
exports.campaignRoutes.get("/", async (req, res, next) => {
    try {
        const customerId = req.query.customerId;
        const campaigns = await (0, campaigns_service_1.listCampaigns)(customerId);
        res.json({ data: campaigns });
    }
    catch (err) {
        next(err);
    }
});
// GET /api/campaigns/:id
exports.campaignRoutes.get("/:id", async (req, res, next) => {
    try {
        const { id } = req.params;
        const customerId = req.query.customerId;
        const campaign = await (0, campaigns_service_1.getCampaignById)(id, customerId);
        if (!campaign) {
            res.status(404).json({
                error: { code: "NOT_FOUND", message: "Campanha não encontrada" },
            });
            return;
        }
        res.json({ data: campaign });
    }
    catch (err) {
        next(err);
    }
});
// POST /api/campaigns
const createCampaignSchema = zod_1.z.object({
    create: zod_1.z.object({
        name: zod_1.z.string().min(1).max(255),
        status: zod_1.z.enum(["ENABLED", "PAUSED"]).optional(),
        advertisingChannelType: zod_1.z.enum([
            "SEARCH",
            "DISPLAY",
            "PERFORMANCE_MAX",
            "DEMAND_GEN",
            "SHOPPING",
        ]),
        dailyBudgetMicros: zod_1.z.number().int().positive(),
        startDateTime: zod_1.z
            .string()
            .regex(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/)
            .optional(),
        endDateTime: zod_1.z
            .string()
            .regex(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/)
            .optional(),
        biddingStrategy: zod_1.z.enum([
            "MAXIMIZE_CLICKS",
            "MAXIMIZE_CONVERSIONS",
            "MAXIMIZE_CONVERSION_VALUE",
            "TARGET_CPA",
            "TARGET_ROAS",
        ]),
        targetCpaMicros: zod_1.z.number().int().positive().optional(),
        targetRoas: zod_1.z.number().positive().optional(),
    }),
    contains_eu_political_advertising: zod_1.z
        .enum([
        "UNSPECIFIED",
        "DOES_NOT_CONTAIN_EU_POLITICAL_ADVERTISING",
        "CONTAINS_EU_POLITICAL_ADVERTISING",
    ])
        .optional(),
});
exports.campaignRoutes.post("/", async (req, res, next) => {
    try {
        const parsed = createCampaignSchema.parse(req.body);
        const customerId = req.query.customerId;
        const resourceName = await (0, campaigns_service_1.createCampaign)(parsed, customerId);
        res.status(201).json({ data: { resourceName } });
    }
    catch (err) {
        if (err instanceof zod_1.z.ZodError) {
            res
                .status(400)
                .json({ error: { code: "VALIDATION_ERROR", message: err.issues } });
            return;
        }
        next(err);
    }
});
// PATCH /api/campaigns/:id/status
exports.campaignRoutes.patch("/:id/status", async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = zod_1.z
            .object({ status: zod_1.z.enum(["ENABLED", "PAUSED"]) })
            .parse(req.body);
        const customerId = req.query.customerId;
        await (0, campaigns_service_1.updateCampaignStatus)(id, status, customerId);
        res.json({ data: { success: true } });
    }
    catch (err) {
        if (err instanceof zod_1.z.ZodError) {
            res
                .status(400)
                .json({ error: { code: "VALIDATION_ERROR", message: err.issues } });
            return;
        }
        next(err);
    }
});
//# sourceMappingURL=campaigns.routes.js.map