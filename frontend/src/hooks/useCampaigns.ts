import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchCampaigns,
  fetchCampaign,
  createCampaign,
  updateCampaignStatus,
} from '@/services/campaigns';
import { CreateCampaignPayload } from '@/types';

export const campaignKeys = {
  all: ['campaigns'] as const,
  detail: (id: string) => ['campaigns', id] as const,
};

export function useCampaigns() {
  return useQuery({
    queryKey: campaignKeys.all,
    queryFn: fetchCampaigns,
  });
}

export function useCampaign(id: string) {
  return useQuery({
    queryKey: campaignKeys.detail(id),
    queryFn: () => fetchCampaign(id),
    enabled: !!id,
  });
}

export function useCreateCampaign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateCampaignPayload) => createCampaign(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: campaignKeys.all }),
  });
}

export function useUpdateCampaignStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'ENABLED' | 'PAUSED' }) =>
      updateCampaignStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: campaignKeys.all }),
  });
}
