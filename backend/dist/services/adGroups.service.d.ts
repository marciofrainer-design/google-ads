import { AdGroup, CreateAdGroupDto } from '../types';
export declare function listAdGroups(campaignId: string, customerId?: string): Promise<AdGroup[]>;
export declare function createAdGroup(dto: CreateAdGroupDto, customerId?: string): Promise<string>;
export declare function updateAdGroupStatus(adGroupId: string, status: 'ENABLED' | 'PAUSED', customerId?: string): Promise<void>;
//# sourceMappingURL=adGroups.service.d.ts.map