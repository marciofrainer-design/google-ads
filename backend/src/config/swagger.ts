import swaggerJSDoc from 'swagger-jsdoc';
import path from 'path';

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'Google Ads Dashboard API',
      version: '1.0.0',
      description:
        'API REST para gerenciamento de campanhas, grupos de anúncios, anúncios e métricas do Google Ads.',
      contact: {
        name: 'Suporte',
        email: 'support@example.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:3001',
        description: 'Servidor de desenvolvimento',
      },
    ],
    components: {
      parameters: {
        customerId: {
          in: 'query',
          name: 'customerId',
          schema: { type: 'string' },
          description: 'ID do cliente Google Ads (sobrescreve o valor do .env)',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'object',
              properties: {
                code: { type: 'string', example: 'NOT_FOUND' },
                message: { type: 'string', example: 'Recurso não encontrado' },
              },
            },
          },
        },
        Campaign: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '1234567890' },
            name: { type: 'string', example: 'Minha Campanha' },
            status: { type: 'string', enum: ['ENABLED', 'PAUSED', 'REMOVED'] },
            advertisingChannelType: {
              type: 'string',
              enum: ['SEARCH', 'DISPLAY', 'PERFORMANCE_MAX', 'DEMAND_GEN', 'SHOPPING'],
            },
            dailyBudgetMicros: { type: 'integer', example: 10000000 },
            biddingStrategy: {
              type: 'string',
              enum: [
                'MAXIMIZE_CLICKS',
                'MAXIMIZE_CONVERSIONS',
                'MAXIMIZE_CONVERSION_VALUE',
                'TARGET_CPA',
                'TARGET_ROAS',
              ],
            },
          },
        },
        AdGroup: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '9876543210' },
            name: { type: 'string', example: 'Grupo de Anúncios 1' },
            status: { type: 'string', enum: ['ENABLED', 'PAUSED', 'REMOVED'] },
            campaignId: { type: 'string', example: '1234567890' },
            cpcBidMicros: { type: 'integer', example: 1000000 },
          },
        },
        Ad: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '111222333' },
            adGroupId: { type: 'string', example: '9876543210' },
            status: { type: 'string', enum: ['ENABLED', 'PAUSED', 'REMOVED'] },
            type: { type: 'string', example: 'RESPONSIVE_SEARCH_AD' },
            finalUrls: {
              type: 'array',
              items: { type: 'string' },
              example: ['https://example.com'],
            },
          },
        },
        Metrics: {
          type: 'object',
          properties: {
            campaignId: { type: 'string', example: '1234567890' },
            campaignName: { type: 'string', example: 'Minha Campanha' },
            impressions: { type: 'integer', example: 15000 },
            clicks: { type: 'integer', example: 450 },
            costMicros: { type: 'integer', example: 5000000 },
            conversions: { type: 'number', example: 12.0 },
            ctr: { type: 'number', example: 0.03 },
            averageCpc: { type: 'number', example: 11111 },
          },
        },
      },
    },
    tags: [
      { name: 'Auth', description: 'Autenticação OAuth2 com Google Ads' },
      { name: 'Campaigns', description: 'Gerenciamento de campanhas' },
      { name: 'Ad Groups', description: 'Gerenciamento de grupos de anúncios' },
      { name: 'Ads', description: 'Gerenciamento de anúncios' },
      { name: 'Metrics', description: 'Consulta de métricas e relatórios' },
    ],
  },
  apis: [path.join(__dirname, '../routes/*.routes.{ts,js}')],
};

export const swaggerSpec = swaggerJSDoc(options);
