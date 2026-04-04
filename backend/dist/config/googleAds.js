"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.googleAdsClient = void 0;
exports.getCustomerClient = getCustomerClient;
const google_ads_api_1 = require("google-ads-api");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const requiredEnvVars = [
    'GOOGLE_ADS_CLIENT_ID',
    'GOOGLE_ADS_CLIENT_SECRET',
    'GOOGLE_ADS_REFRESH_TOKEN',
    'GOOGLE_ADS_DEVELOPER_TOKEN',
    'GOOGLE_ADS_CUSTOMER_ID',
];
for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
        throw new Error(`Variável de ambiente obrigatória não definida: ${envVar}`);
    }
}
exports.googleAdsClient = new google_ads_api_1.GoogleAdsApi({
    client_id: process.env.GOOGLE_ADS_CLIENT_ID,
    client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET,
    developer_token: process.env.GOOGLE_ADS_DEVELOPER_TOKEN,
});
/**
 * Retorna um Customer client para o account ID informado.
 * Se login_customer_id for definido, usa como MCC (Manager Account).
 */
/** Remove hífens do customer ID (a API exige somente dígitos). */
function sanitizeCustomerId(id) {
    return id.replace(/-/g, '');
}
function getCustomerClient(customerId) {
    const cid = sanitizeCustomerId(customerId || process.env.GOOGLE_ADS_CUSTOMER_ID);
    const loginCid = process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID
        ? sanitizeCustomerId(process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID)
        : undefined;
    return exports.googleAdsClient.Customer({
        customer_id: cid,
        refresh_token: process.env.GOOGLE_ADS_REFRESH_TOKEN,
        login_customer_id: loginCid,
    });
}
//# sourceMappingURL=googleAds.js.map