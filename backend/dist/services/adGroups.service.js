"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listAdGroups = listAdGroups;
exports.createAdGroup = createAdGroup;
exports.updateAdGroupStatus = updateAdGroupStatus;
const googleAds_1 = require("../config/googleAds");
const google_ads_api_1 = require("google-ads-api");
async function listAdGroups(campaignId, customerId) {
    const customer = (0, googleAds_1.getCustomerClient)(customerId);
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
    return results.map((row) => ({
        id: String(row.ad_group?.id),
        campaignId: String(row.campaign?.id),
        name: row.ad_group?.name ?? '',
        status: row.ad_group?.status,
        type: row.ad_group?.type ?? '',
        cpcBidMicros: Number(row.ad_group?.cpc_bid_micros ?? 0),
    }));
}
async function createAdGroup(dto, customerId) {
    const cid = customerId || process.env.GOOGLE_ADS_CUSTOMER_ID;
    const customer = (0, googleAds_1.getCustomerClient)(customerId);
    const response = await customer.adGroups.create([
        {
            name: dto.name,
            campaign: `customers/${cid}/campaigns/${dto.campaignId}`,
            status: dto.status === 'PAUSED'
                ? google_ads_api_1.enums.AdGroupStatus.PAUSED
                : google_ads_api_1.enums.AdGroupStatus.ENABLED,
            cpc_bid_micros: dto.cpcBidMicros,
        },
    ]);
    const result = response.results[0];
    return String(result.resource_name);
}
async function updateAdGroupStatus(adGroupId, status, customerId) {
    const cid = customerId || process.env.GOOGLE_ADS_CUSTOMER_ID;
    const customer = (0, googleAds_1.getCustomerClient)(customerId);
    await customer.adGroups.update([
        {
            resource_name: `customers/${cid}/adGroups/${adGroupId}`,
            status: status === 'PAUSED'
                ? google_ads_api_1.enums.AdGroupStatus.PAUSED
                : google_ads_api_1.enums.AdGroupStatus.ENABLED,
        },
    ]);
}
//# sourceMappingURL=adGroups.service.js.map