import { getCustomerClient } from '../config/googleAds';
import { CampaignMetrics, DateRange } from '../types';

/**
 * Retorna métricas de desempenho por campanha no intervalo de datas informado.
 * Usa GAQL com segmentação por data.
 */
export async function getCampaignMetrics(
  dateRange: DateRange,
  customerId?: string
): Promise<CampaignMetrics[]> {
  const customer = getCustomerClient(customerId);

  const results = await customer.query(`
    SELECT
      campaign.id,
      campaign.name,
      metrics.clicks,
      metrics.impressions,
      metrics.ctr,
      metrics.average_cpc,
      metrics.cost_micros,
      metrics.conversions,
      metrics.conversions_from_interactions_rate,
      metrics.value_per_conversion
    FROM campaign
    WHERE campaign.status != 'REMOVED'
      AND segments.date BETWEEN '${dateRange.startDate}' AND '${dateRange.endDate}'
    ORDER BY metrics.cost_micros DESC
  `);

  return results.map((row: Record<string, any>) => ({
    campaignId: String(row.campaign?.id),
    campaignName: row.campaign?.name ?? '',
    clicks: Number(row.metrics?.clicks ?? 0),
    impressions: Number(row.metrics?.impressions ?? 0),
    ctr: Number(row.metrics?.ctr ?? 0),
    averageCpc: Number(row.metrics?.average_cpc ?? 0),
    costMicros: Number(row.metrics?.cost_micros ?? 0),
    conversions: Number(row.metrics?.conversions ?? 0),
    conversionRate: Number(row.metrics?.conversions_from_interactions_rate ?? 0),
  }));
}

/**
 * Retorna métricas diárias para um gráfico de linha (série temporal).
 */
export async function getDailyMetrics(
  dateRange: DateRange,
  campaignId?: string,
  customerId?: string
): Promise<Array<CampaignMetrics & { date: string }>> {
  const customer = getCustomerClient(customerId);

  const campaignFilter = campaignId
    ? `AND campaign.id = ${campaignId}`
    : '';

  const results = await customer.query(`
    SELECT
      campaign.id,
      campaign.name,
      segments.date,
      metrics.clicks,
      metrics.impressions,
      metrics.ctr,
      metrics.average_cpc,
      metrics.cost_micros,
      metrics.conversions,
      metrics.conversions_from_interactions_rate
    FROM campaign
    WHERE campaign.status != 'REMOVED'
      AND segments.date BETWEEN '${dateRange.startDate}' AND '${dateRange.endDate}'
      ${campaignFilter}
    ORDER BY segments.date ASC
  `);

  return results.map((row: Record<string, any>) => ({
    campaignId: String(row.campaign?.id),
    campaignName: row.campaign?.name ?? '',
    date: String(row.segments?.date ?? ''),
    clicks: Number(row.metrics?.clicks ?? 0),
    impressions: Number(row.metrics?.impressions ?? 0),
    ctr: Number(row.metrics?.ctr ?? 0),
    averageCpc: Number(row.metrics?.average_cpc ?? 0),
    costMicros: Number(row.metrics?.cost_micros ?? 0),
    conversions: Number(row.metrics?.conversions ?? 0),
    conversionRate: Number(row.metrics?.conversions_from_interactions_rate ?? 0),
  }));
}

/**
 * Retorna métricas de grupos de anúncios.
 */
export async function getAdGroupMetrics(
  campaignId: string,
  dateRange: DateRange,
  customerId?: string
): Promise<object[]> {
  const customer = getCustomerClient(customerId);

  const results = await customer.query(`
    SELECT
      ad_group.id,
      ad_group.name,
      ad_group.status,
      metrics.clicks,
      metrics.impressions,
      metrics.ctr,
      metrics.average_cpc,
      metrics.cost_micros,
      metrics.conversions
    FROM ad_group
    WHERE campaign.id = ${campaignId}
      AND ad_group.status != 'REMOVED'
      AND segments.date BETWEEN '${dateRange.startDate}' AND '${dateRange.endDate}'
    ORDER BY metrics.cost_micros DESC
  `);

  return results.map((row: Record<string, any>) => ({
    adGroupId: String(row.ad_group?.id),
    adGroupName: row.ad_group?.name ?? '',
    status: row.ad_group?.status,
    clicks: Number(row.metrics?.clicks ?? 0),
    impressions: Number(row.metrics?.impressions ?? 0),
    ctr: Number(row.metrics?.ctr ?? 0),
    averageCpc: Number(row.metrics?.average_cpc ?? 0),
    costMicros: Number(row.metrics?.cost_micros ?? 0),
    conversions: Number(row.metrics?.conversions ?? 0),
  }));
}
