"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
const campaigns_routes_1 = require("./routes/campaigns.routes");
const adGroups_routes_1 = require("./routes/adGroups.routes");
const ads_routes_1 = require("./routes/ads.routes");
const metrics_routes_1 = require("./routes/metrics.routes");
const auth_routes_1 = require("./routes/auth.routes");
const errorHandler_1 = require("./middleware/errorHandler");
const logger_1 = require("./config/logger");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
// Lista de origens permitidas (segurança OWASP A5)
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173')
    .split(',')
    .map((o) => o.trim());
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            callback(new Error(`Origin ${origin} not allowed by CORS`));
        }
    },
    credentials: true,
}));
// Segurança: cabeçalhos HTTP (OWASP A5/A6)
app.use((0, helmet_1.default)());
// Parse JSON com limite para evitar DoS (OWASP A4)
app.use(express_1.default.json({ limit: '1mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '1mb' }));
// Logging de requisições
app.use((0, morgan_1.default)('combined', { stream: { write: (msg) => logger_1.logger.info(msg.trim()) } }));
// Rotas
app.use('/api/auth', auth_routes_1.authRoutes);
app.use('/api/campaigns', campaigns_routes_1.campaignRoutes);
app.use('/api/ad-groups', adGroups_routes_1.adGroupRoutes);
app.use('/api/ads', ads_routes_1.adRoutes);
app.use('/api/metrics', metrics_routes_1.metricsRoutes);
// Health check
app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
// Handler de erros centralizado
app.use(errorHandler_1.errorHandler);
app.listen(PORT, () => {
    logger_1.logger.info(`Server running on port ${PORT}`);
});
exports.default = app;
//# sourceMappingURL=index.js.map