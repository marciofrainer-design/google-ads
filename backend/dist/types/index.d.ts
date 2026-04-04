export interface Campaign {
    id: string;
    name: string;
    status: "ENABLED" | "PAUSED" | "REMOVED";
    advertisingChannelType: string;
    budget?: {
        amountMicros: number;
        deliveryMethod: string;
    };
    biddingStrategy?: string;
    contains_eu_political_advertising?: boolean;
}
export interface AdGroup {
    id: string;
    campaignId: string;
    name: string;
    status: "ENABLED" | "PAUSED" | "REMOVED";
    type: string;
    cpcBidMicros?: number;
}
export interface Ad {
    id: string;
    adGroupId: string;
    finalUrls: string[];
    status: "ENABLED" | "PAUSED" | "REMOVED";
    type: string;
    responsiveSearchAd?: {
        headlines: Array<{
            text: string;
            pinned_field?: string;
        }>;
        descriptions: Array<{
            text: string;
            pinned_field?: string;
        }>;
    };
}
export interface CampaignMetrics {
    campaignId: string;
    campaignName: string;
    clicks: number;
    impressions: number;
    ctr: number;
    averageCpc: number;
    costMicros: number;
    conversions: number;
    conversionRate: number;
    roas?: number;
    date?: string;
}
export interface DateRange {
    startDate: string;
    endDate: string;
}
export interface CreateCampaignDto {
    create: {
        name: string;
        advertisingChannelType: "SEARCH" | "DISPLAY" | "PERFORMANCE_MAX" | "DEMAND_GEN" | "SHOPPING";
        status?: "ENABLED" | "PAUSED";
        dailyBudgetMicros: number;
        startDateTime?: string;
        endDateTime?: string;
        biddingStrategy: "MAXIMIZE_CLICKS" | "MAXIMIZE_CONVERSIONS" | "MAXIMIZE_CONVERSION_VALUE" | "TARGET_CPA" | "TARGET_ROAS";
        targetCpaMicros?: number;
        targetRoas?: number;
        contains_eu_political_advertising?: "UNSPECIFIED" | "DOES_NOT_CONTAIN_EU_POLITICAL_ADVERTISING" | "CONTAINS_EU_POLITICAL_ADVERTISING";
    };
}
export interface CreateAdGroupDto {
    campaignId: string;
    name: string;
    status?: "ENABLED" | "PAUSED";
    cpcBidMicros?: number;
}
export interface CreateResponsiveSearchAdDto {
    adGroupId: string;
    finalUrls: string[];
    headlines: Array<{
        text: string;
    }>;
    descriptions: Array<{
        text: string;
    }>;
    path1?: string;
    path2?: string;
}
export interface ApiError {
    code: string;
    message: string;
    details?: unknown;
}
//# sourceMappingURL=index.d.ts.map