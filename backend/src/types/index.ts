// Tipos que espelham os recursos da Google Ads API v23

export interface Campaign {
  id: string;
  name: string;
  status: "ENABLED" | "PAUSED" | "REMOVED";
  advertisingChannelType: string;
  budget?: {
    amountMicros: number; // orçamento em micros (1 BRL = 1_000_000 micros)
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
    headlines: Array<{ text: string; pinned_field?: string }>;
    descriptions: Array<{ text: string; pinned_field?: string }>;
  };
}

export interface CampaignMetrics {
  campaignId: string;
  campaignName: string;
  clicks: number;
  impressions: number;
  ctr: number; // Click-through rate
  averageCpc: number; // em micros
  costMicros: number; // custo total em micros
  conversions: number;
  conversionRate: number;
  roas?: number; // Return on Ad Spend
  date?: string;
}

export interface DateRange {
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
}

export interface CreateCampaignDto {
  create: {
    name: string;
    advertisingChannelType:
      | "SEARCH"
      | "DISPLAY"
      | "PERFORMANCE_MAX"
      | "DEMAND_GEN"
      | "SHOPPING";
    status?: "ENABLED" | "PAUSED";
    dailyBudgetMicros: number;
    startDateTime?: string;
    endDateTime?: string;
    biddingStrategy:
      | "MAXIMIZE_CLICKS"
      | "MAXIMIZE_CONVERSIONS"
      | "MAXIMIZE_CONVERSION_VALUE"
      | "TARGET_CPA"
      | "TARGET_ROAS";
    targetCpaMicros?: number;
    targetRoas?: number;
    contains_eu_political_advertising?:
      | "UNSPECIFIED"
      | "DOES_NOT_CONTAIN_EU_POLITICAL_ADVERTISING"
      | "CONTAINS_EU_POLITICAL_ADVERTISING";
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
  headlines: Array<{ text: string }>;
  descriptions: Array<{ text: string }>;
  path1?: string;
  path2?: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}
