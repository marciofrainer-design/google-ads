import { useQuery } from '@tanstack/react-query';
import { fetchCampaignMetrics, fetchDailyMetrics } from '@/services/metrics';
import { DateRange } from '@/types';

export function useCampaignMetrics(range: DateRange) {
  return useQuery({
    queryKey: ['metrics', 'campaigns', range],
    queryFn: () => fetchCampaignMetrics(range),
    enabled: !!range.startDate && !!range.endDate,
  });
}

export function useDailyMetrics(range: DateRange, campaignId?: string) {
  return useQuery({
    queryKey: ['metrics', 'daily', range, campaignId],
    queryFn: () => fetchDailyMetrics(range, campaignId),
    enabled: !!range.startDate && !!range.endDate,
  });
}
