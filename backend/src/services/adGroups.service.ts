import { getCustomerClient } from '../config/googleAds';
import { AdGroup, CreateAdGroupDto } from '../types';
import { enums } from 'google-ads-api';

export async function listAdGroups(
  campaignId: string,
  customerId?: string
): Promise<AdGroup[]> {
  const customer = getCustomerClient(customerId);

  const results = await customer.query(`
    SELECT
      ad_group.id,
      ad_group.name,
      ad_group.status,
      ad_group.type,
      ad_group.cpc_bid_micros,
      campaign.id
    FROM ad_group
    WHERE campaign.id = ${campaignId}
      AND ad_group.status != 'REMOVED'
    ORDER BY ad_group.name ASC
  `);

  return results.map((row: Record<string, any>) => ({
    id: String(row.ad_group?.id),
    campaignId: String(row.campaign?.id),
    name: row.ad_group?.name ?? '',
    status: row.ad_group?.status as AdGroup['status'],
    type: row.ad_group?.type ?? '',
    cpcBidMicros: Number(row.ad_group?.cpc_bid_micros ?? 0),
  }));
}

export async function createAdGroup(
  dto: CreateAdGroupDto,
  customerId?: string
): Promise<string> {
  const cid = customerId || process.env.GOOGLE_ADS_CUSTOMER_ID;
  const customer = getCustomerClient(customerId);

  const response = await customer.adGroups.create([
    {
      name: dto.name,
      campaign: `customers/${cid}/campaigns/${dto.campaignId}`,
      status:
        dto.status === 'PAUSED'
          ? enums.AdGroupStatus.PAUSED
          : enums.AdGroupStatus.ENABLED,
      cpc_bid_micros: dto.cpcBidMicros,
    },
  ]);
  const result = response.results[0];

  return String(result.resource_name);
}

export async function updateAdGroupStatus(
  adGroupId: string,
  status: 'ENABLED' | 'PAUSED',
  customerId?: string
): Promise<void> {
  const cid = customerId || process.env.GOOGLE_ADS_CUSTOMER_ID;
  const customer = getCustomerClient(customerId);
  await customer.adGroups.update([
    {
      resource_name: `customers/${cid}/adGroups/${adGroupId}`,
      status:
        status === 'PAUSED'
          ? enums.AdGroupStatus.PAUSED
          : enums.AdGroupStatus.ENABLED,
    },
  ]);
}
