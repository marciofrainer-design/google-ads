import { CampaignMetrics, DateRange } from '../types';
/**
 * Retorna métricas de desempenho por campanha no intervalo de datas informado.
 * Usa GAQL com segmentação por data.
 */
export declare function getCampaignMetrics(dateRange: DateRange, customerId?: string): Promise<CampaignMetrics[]>;
/**
 * Retorna métricas diárias para um gráfico de linha (série temporal).
 */
export declare function getDailyMetrics(dateRange: DateRange, campaignId?: string, customerId?: string): Promise<Array<CampaignMetrics & {
    date: string;
}>>;
/**
 * Retorna métricas de grupos de anúncios.
 */
export declare function getAdGroupMetrics(campaignId: string, dateRange: DateRange, customerId?: string): Promise<object[]>;
//# sourceMappingURL=metrics.service.d.ts.map