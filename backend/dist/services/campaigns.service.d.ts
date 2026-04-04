import { Campaign, CreateCampaignDto } from '../types';
/**
 * Lista todas as campanhas da conta.
 * Usa GAQL (Google Ads Query Language) via GoogleAdsService.search
 */
export declare function listCampaigns(customerId?: string): Promise<Campaign[]>;
/**
 * Retorna detalhes de uma campanha específica pelo ID.
 */
export declare function getCampaignById(campaignId: string, customerId?: string): Promise<Campaign | null>;
/**
 * Cria uma nova campanha com seu orçamento.
 * Segue o fluxo obrigatório da API: criar CampaignBudget → criar Campaign.
 */
export declare function createCampaign(dto: CreateCampaignDto, customerId?: string): Promise<string>;
/**
 * Pausa ou ativa uma campanha.
 */
export declare function updateCampaignStatus(campaignId: string, status: 'ENABLED' | 'PAUSED', customerId?: string): Promise<void>;
//# sourceMappingURL=campaigns.service.d.ts.map