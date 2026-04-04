import api from './api';
import { CampaignMetrics, DateRange } from '@/types';

export async function fetchCampaignMetrics(range: DateRange): Promise<CampaignMetrics[]> {
  const { data } = await api.get<{ data: CampaignMetrics[] }>('/metrics/campaigns', {
    params: range,
  });
  return data.data;
}

export async function fetchDailyMetrics(
  range: DateRange,
  campaignId?: string
): Promise<(CampaignMetrics & { date: string })[]> {
  const { data } = await api.get<{ data: (CampaignMetrics & { date: string })[] }>(
    '/metrics/daily',
    { params: { ...range, campaignId } }
  );
  return data.data;
}

export async function fetchAdGroupMetrics(
  campaignId: string,
  range: DateRange
): Promise<object[]> {
  const { data } = await api.get<{ data: object[] }>(
    `/metrics/ad-groups/${campaignId}`,
    { params: range }
  );
  return data.data;
}
