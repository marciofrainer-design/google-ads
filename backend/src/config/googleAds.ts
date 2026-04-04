import { GoogleAdsApi } from 'google-ads-api';
import dotenv from 'dotenv';

dotenv.config();

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

export const googleAdsClient = new GoogleAdsApi({
  client_id: process.env.GOOGLE_ADS_CLIENT_ID!,
  client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET!,
  developer_token: process.env.GOOGLE_ADS_DEVELOPER_TOKEN!,
});

/**
 * Retorna um Customer client para o account ID informado.
 * Se login_customer_id for definido, usa como MCC (Manager Account).
 */
/** Remove hífens do customer ID (a API exige somente dígitos). */
function sanitizeCustomerId(id: string): string {
  return id.replace(/-/g, '');
}

export function getCustomerClient(customerId?: string) {
  const cid = sanitizeCustomerId(customerId || process.env.GOOGLE_ADS_CUSTOMER_ID!);
  const loginCid = process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID
    ? sanitizeCustomerId(process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID)
    : undefined;
  return googleAdsClient.Customer({
    customer_id: cid,
    refresh_token: process.env.GOOGLE_ADS_REFRESH_TOKEN!,
    login_customer_id: loginCid,
  });
}
