import { Ad, CreateResponsiveSearchAdDto } from '../types';
export declare function listAds(adGroupId: string, customerId?: string): Promise<Ad[]>;
/**
 * Cria um Responsive Search Ad (RSA) — formato padrão para campanhas de Search.
 * Exige mínimo 3 headlines e 2 descriptions; máximo 15 e 4 respectivamente.
 */
export declare function createResponsiveSearchAd(dto: CreateResponsiveSearchAdDto, customerId?: string): Promise<string>;
export declare function updateAdStatus(adGroupId: string, adId: string, status: 'ENABLED' | 'PAUSED', customerId?: string): Promise<void>;
//# sourceMappingURL=ads.service.d.ts.map