import { getCustomerClient } from '../config/googleAds';
import { Campaign, CreateCampaignDto } from '../types';
import { enums } from 'google-ads-api';

/**
 * Lista todas as campanhas da conta.
 * Usa GAQL (Google Ads Query Language) via GoogleAdsService.search
 */
export async function listCampaigns(customerId?: string): Promise<Campaign[]> {
  const customer = getCustomerClient(customerId);

  const results = await customer.query(`
    SELECT
      campaign.id,
      campaign.name,
      campaign.status,
      campaign.advertising_channel_type,
      campaign_budget.amount_micros,
      campaign_budget.delivery_method
    FROM campaign
    WHERE campaign.status != 'REMOVED'
    ORDER BY campaign.name ASC
  `);

  return results.map((row: Record<string, any>) => ({
    id: String(row.campaign?.id),
    name: row.campaign?.name ?? '',
    status: row.campaign?.status as Campaign['status'],
    advertisingChannelType: row.campaign?.advertising_channel_type ?? '',
    budget: row.campaign_budget
      ? {
          amountMicros: Number(row.campaign_budget.amount_micros),
          deliveryMethod: row.campaign_budget.delivery_method ?? '',
        }
      : undefined,
  }));
}

/**
 * Retorna detalhes de uma campanha específica pelo ID.
 */
export async function getCampaignById(
  campaignId: string,
  customerId?: string
): Promise<Campaign | null> {
  const customer = getCustomerClient(customerId);

  const results = await customer.query(`
    SELECT
      campaign.id,
      campaign.name,
      campaign.status,
      campaign.advertising_channel_type,
      campaign_budget.amount_micros,
      campaign_budget.delivery_method
    FROM campaign
    WHERE campaign.id = ${campaignId}
    LIMIT 1
  `);

  if (!results.length) return null;

  const row: Record<string, any> = results[0];
  return {
    id: String(row.campaign?.id),
    name: row.campaign?.name ?? '',
    status: row.campaign?.status as Campaign['status'],
    advertisingChannelType: row.campaign?.advertising_channel_type ?? '',
    budget: row.campaign_budget
      ? {
          amountMicros: Number(row.campaign_budget.amount_micros),
          deliveryMethod: row.campaign_budget.delivery_method ?? '',
        }
      : undefined,
  };
}

/**
 * Cria uma nova campanha com seu orçamento.
 * Segue o fluxo obrigatório da API: criar CampaignBudget → criar Campaign.
 */
export async function createCampaign(
  dto: CreateCampaignDto,
  customerId?: string
): Promise<string> {
  const customer = getCustomerClient(customerId);

  // 1. Criar o orçamento da campanha
  // O nome do budget deve ser único na conta; o sufixo de timestamp garante isso.
  const budgetName = `Budget - ${dto.create.name} - ${Date.now()}`;
  const budgetResponse = await customer.campaignBudgets.create([
    {
      name: budgetName,
      amount_micros: dto.create.dailyBudgetMicros,
      delivery_method: enums.BudgetDeliveryMethod.STANDARD,
      explicitly_shared: false,
    },
  ]);
  const budgetResult = budgetResponse.results[0];

  const budgetResourceName = budgetResult.resource_name;

  // 2. Montar a estratégia de lance
  // Nota: na API v23, MAXIMIZE_CLICKS usa o campo `target_spend` (sem target = maximize clicks).
  const biddingConfig: Record<string, unknown> = {};
  switch (dto.create.biddingStrategy) {
    case 'MAXIMIZE_CLICKS':
      biddingConfig.target_spend = {};
      break;
    case 'MAXIMIZE_CONVERSIONS':
      biddingConfig.maximize_conversions = {};
      break;
    case 'MAXIMIZE_CONVERSION_VALUE':
      biddingConfig.maximize_conversion_value = dto.create.targetRoas
        ? { target_roas: dto.create.targetRoas }
        : {};
      break;
    case 'TARGET_CPA':
      biddingConfig.target_cpa = { target_cpa_micros: dto.create.targetCpaMicros };
      break;
    case 'TARGET_ROAS':
      biddingConfig.target_roas = { target_roas: dto.create.targetRoas };
      break;
  }

  // 3. Criar a campanha
  // start_date/end_date foram removidos do tipo ICampaign na Google Ads API v23;
  // usamos cast para manter suporte a quem enviar esses campos via DTO.
  const campaignPayload: Record<string, unknown> = {
    name: dto.create.name,
    status: dto.create.status === 'PAUSED' ? enums.CampaignStatus.PAUSED : enums.CampaignStatus.ENABLED,
    advertising_channel_type: dto.create.advertisingChannelType,
    campaign_budget: budgetResourceName,
    contains_eu_political_advertising: dto.create.contains_eu_political_advertising ?? "UNSPECIFIED",
    ...biddingConfig,
  };
  if (dto.create.startDateTime) campaignPayload.start_date_time = dto.create.startDateTime;
  if (dto.create.endDateTime) campaignPayload.end_date_time = dto.create.endDateTime;

  const campaignResponse = await customer.campaigns.create([campaignPayload as never]);
  const campaignResult = campaignResponse.results[0];

  return String(campaignResult.resource_name);
}

/**
 * Pausa ou ativa uma campanha.
 */
export async function updateCampaignStatus(
  campaignId: string,
  status: 'ENABLED' | 'PAUSED',
  customerId?: string
): Promise<void> {
  const customer = getCustomerClient(customerId);
  await customer.campaigns.update([
    {
      resource_name: `customers/${customerId || process.env.GOOGLE_ADS_CUSTOMER_ID}/campaigns/${campaignId}`,
      status: status === 'PAUSED' ? enums.CampaignStatus.PAUSED : enums.CampaignStatus.ENABLED,
    },
  ]);
}
