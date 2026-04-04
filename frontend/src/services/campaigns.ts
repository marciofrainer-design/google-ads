import api from './api';
import { Campaign, CreateCampaignPayload } from '@/types';

export async function fetchCampaigns(): Promise<Campaign[]> {
  const { data } = await api.get<{ data: Campaign[] }>('/campaigns');
  return data.data;
}

export async function fetchCampaign(id: string): Promise<Campaign> {
  const { data } = await api.get<{ data: Campaign }>(`/campaigns/${id}`);
  return data.data;
}

export async function createCampaign(payload: CreateCampaignPayload): Promise<{ resourceName: string }> {
  const { data } = await api.post<{ data: { resourceName: string } }>('/campaigns', { create: payload });
  return data.data;
}

export async function updateCampaignStatus(
  id: string,
  status: 'ENABLED' | 'PAUSED'
): Promise<void> {
  await api.patch(`/campaigns/${id}/status`, { status });
}
