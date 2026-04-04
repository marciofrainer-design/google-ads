import { getCustomerClient } from '../config/googleAds';
import { Ad, CreateResponsiveSearchAdDto } from '../types';
import { enums } from 'google-ads-api';

export async function listAds(
  adGroupId: string,
  customerId?: string
): Promise<Ad[]> {
  const customer = getCustomerClient(customerId);

  const results = await customer.query(`
    SELECT
      ad_group_ad.ad.id,
      ad_group_ad.status,
      ad_group_ad.ad.type,
      ad_group_ad.ad.final_urls,
      ad_group_ad.ad.responsive_search_ad.headlines,
      ad_group_ad.ad.responsive_search_ad.descriptions,
      ad_group.id
    FROM ad_group_ad
    WHERE ad_group.id = ${adGroupId}
      AND ad_group_ad.status != 'REMOVED'
  `);

  return results.map((row: Record<string, any>) => ({
    id: String(row.ad_group_ad?.ad?.id),
    adGroupId: String(row.ad_group?.id),
    finalUrls: (row.ad_group_ad?.ad?.final_urls as string[]) ?? [],
    status: row.ad_group_ad?.status as Ad['status'],
    type: row.ad_group_ad?.ad?.type ?? '',
    responsiveSearchAd: row.ad_group_ad?.ad?.responsive_search_ad
      ? {
          headlines: (row.ad_group_ad.ad.responsive_search_ad.headlines as Array<{ text: string }>) ?? [],
          descriptions: (row.ad_group_ad.ad.responsive_search_ad.descriptions as Array<{ text: string }>) ?? [],
        }
      : undefined,
  }));
}

/**
 * Cria um Responsive Search Ad (RSA) — formato padrão para campanhas de Search.
 * Exige mínimo 3 headlines e 2 descriptions; máximo 15 e 4 respectivamente.
 */
export async function createResponsiveSearchAd(
  dto: CreateResponsiveSearchAdDto,
  customerId?: string
): Promise<string> {
  const cid = customerId || process.env.GOOGLE_ADS_CUSTOMER_ID;
  const customer = getCustomerClient(customerId);

  const response = await customer.adGroupAds.create([
    {
      ad_group: `customers/${cid}/adGroups/${dto.adGroupId}`,
      status: enums.AdGroupAdStatus.ENABLED,
      ad: {
        final_urls: dto.finalUrls,
        responsive_search_ad: {
          headlines: dto.headlines.map((h) => ({ text: h.text })),
          descriptions: dto.descriptions.map((d) => ({ text: d.text })),
          path1: dto.path1,
          path2: dto.path2,
        },
      },
    },
  ]);
  const result = response.results[0];

  return String(result.resource_name);
}

export async function updateAdStatus(
  adGroupId: string,
  adId: string,
  status: 'ENABLED' | 'PAUSED',
  customerId?: string
): Promise<void> {
  const cid = customerId || process.env.GOOGLE_ADS_CUSTOMER_ID;
  const customer = getCustomerClient(customerId);
  await customer.adGroupAds.update([
    {
      resource_name: `customers/${cid}/adGroupAds/${adGroupId}~${adId}`,
      status:
        status === 'PAUSED'
          ? enums.AdGroupAdStatus.PAUSED
          : enums.AdGroupAdStatus.ENABLED,
    },
  ]);
}
