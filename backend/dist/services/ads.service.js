"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listAds = listAds;
exports.createResponsiveSearchAd = createResponsiveSearchAd;
exports.updateAdStatus = updateAdStatus;
const googleAds_1 = require("../config/googleAds");
const google_ads_api_1 = require("google-ads-api");
async function listAds(adGroupId, customerId) {
    const customer = (0, googleAds_1.getCustomerClient)(customerId);
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
    return results.map((row) => ({
        id: String(row.ad_group_ad?.ad?.id),
        adGroupId: String(row.ad_group?.id),
        finalUrls: row.ad_group_ad?.ad?.final_urls ?? [],
        status: row.ad_group_ad?.status,
        type: row.ad_group_ad?.ad?.type ?? '',
        responsiveSearchAd: row.ad_group_ad?.ad?.responsive_search_ad
            ? {
                headlines: row.ad_group_ad.ad.responsive_search_ad.headlines ?? [],
                descriptions: row.ad_group_ad.ad.responsive_search_ad.descriptions ?? [],
            }
            : undefined,
    }));
}
/**
 * Cria um Responsive Search Ad (RSA) — formato padrão para campanhas de Search.
 * Exige mínimo 3 headlines e 2 descriptions; máximo 15 e 4 respectivamente.
 */
async function createResponsiveSearchAd(dto, customerId) {
    const cid = customerId || process.env.GOOGLE_ADS_CUSTOMER_ID;
    const customer = (0, googleAds_1.getCustomerClient)(customerId);
    const response = await customer.adGroupAds.create([
        {
            ad_group: `customers/${cid}/adGroups/${dto.adGroupId}`,
            status: google_ads_api_1.enums.AdGroupAdStatus.ENABLED,
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
async function updateAdStatus(adGroupId, adId, status, customerId) {
    const cid = customerId || process.env.GOOGLE_ADS_CUSTOMER_ID;
    const customer = (0, googleAds_1.getCustomerClient)(customerId);
    await customer.adGroupAds.update([
        {
            resource_name: `customers/${cid}/adGroupAds/${adGroupId}~${adId}`,
            status: status === 'PAUSED'
                ? google_ads_api_1.enums.AdGroupAdStatus.PAUSED
                : google_ads_api_1.enums.AdGroupAdStatus.ENABLED,
        },
    ]);
}
//# sourceMappingURL=ads.service.js.map