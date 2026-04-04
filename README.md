# Google Ads Dashboard — Relatório Técnico e Plano de Implementação

## Visão Geral

Dashboard fullstack para gestão e monitoramento de campanhas Google Ads via API oficial (v23), com interface React no frontend e API Node.js no backend.

---

## Estrutura do Projeto

```
google-ads-aut/
├── backend/          # API Node.js + TypeScript + Express
└── frontend/         # SPA React + TypeScript + Vite + Tailwind
```

---

## O que você precisa para concluir o projeto

### 1. Credenciais Google Ads API (OBRIGATÓRIO)

| Item | Como Obter | Onde usar |
|------|-----------|-----------|
| **Developer Token** | [Google Ads → Ferramentas → Centro da API](https://ads.google.com/aw/apicenter) | `GOOGLE_ADS_DEVELOPER_TOKEN` |
| **Client ID (OAuth2)** | [Google Cloud Console → APIs → Credenciais](https://console.cloud.google.com/apis/credentials) | `GOOGLE_ADS_CLIENT_ID` |
| **Client Secret** | Mesmo projeto acima | `GOOGLE_ADS_CLIENT_SECRET` |
| **Refresh Token** | Gerado via fluxo OAuth2 com scope `adwords` | `GOOGLE_ADS_REFRESH_TOKEN` |
| **Customer ID** | ID da conta Google Ads (sem hífens) | `GOOGLE_ADS_CUSTOMER_ID` |
| **Login Customer ID** | Apenas se usar conta Manager (MCC) | `GOOGLE_ADS_LOGIN_CUSTOMER_ID` |

**Passos para obter as credenciais:**

1. Crie ou selecione um projeto no [Google Cloud Console](https://console.cloud.google.com)
2. Habilite a **Google Ads API** no projeto
3. Crie credenciais OAuth2 do tipo **"Aplicativo da Web"**
4. Adicione `http://localhost:3001/api/auth/callback` como URI de redirecionamento autorizado
5. Acesse `GET /api/auth/url` no backend para iniciar o fluxo OAuth2
6. Copie o `refresh_token` retornado para o `.env`
7. Solicite aprovação do **Developer Token** em produção (em desenvolvimento, o token de teste funciona)

---

### 2. Setup do Backend

```bash
cd backend
cp .env.example .env
# Preencha todas as variáveis no .env
npm install
npm run dev         # Desenvolvimento (porta 3001)
npm run build       # Build de produção
npm start           # Inicia produção
```

**Stack:**
- Node.js 20+ com TypeScript
- Express 4 — framework HTTP
- `google-ads-api` — cliente oficial da comunidade para a Google Ads API
- `google-auth-library` — OAuth2
- `zod` — validação e sanitização de entrada (OWASP A3)
- `helmet` — cabeçalhos de segurança HTTP (OWASP A5/A6)
- `winston` — logging estruturado

---

### 3. Setup do Frontend

```bash
cd frontend
npm install
npm run dev         # Inicia em http://localhost:5173
npm run build       # Build de produção (pasta dist/)
```

**Stack:**
- React 18 + TypeScript
- Vite — bundler de alta performance
- Tailwind CSS — estilização utilitária
- TanStack Query (React Query) — fetching, cache e sincronização de dados
- React Hook Form + Zod — formulários tipados e validados
- Recharts — gráficos de linha e barras
- React Router v6 — navegação SPA
- Lucide React — ícones

---

## Funcionalidades Implementadas

### Backend (API REST)

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `GET /api/auth/url` | GET | Gera URL de autorização OAuth2 |
| `GET /api/auth/callback` | GET | Recebe `code` e retorna `refresh_token` |
| `GET /api/campaigns` | GET | Lista todas as campanhas ativas |
| `GET /api/campaigns/:id` | GET | Detalhes de uma campanha |
| `POST /api/campaigns` | POST | Cria campanha + orçamento |
| `PATCH /api/campaigns/:id/status` | PATCH | Pausa/ativa campanha |
| `GET /api/ad-groups?campaignId=` | GET | Lista grupos de anúncios |
| `POST /api/ad-groups` | POST | Cria grupo de anúncios |
| `PATCH /api/ad-groups/:id/status` | PATCH | Pausa/ativa grupo |
| `GET /api/ads?adGroupId=` | GET | Lista anúncios do grupo |
| `POST /api/ads/responsive-search` | POST | Cria Responsive Search Ad (RSA) |
| `PATCH /api/ads/:agId/:adId/status` | PATCH | Pausa/ativa anúncio |
| `GET /api/metrics/campaigns` | GET | Métricas por campanha (período) |
| `GET /api/metrics/daily` | GET | Métricas diárias (série temporal) |
| `GET /api/metrics/ad-groups/:id` | GET | Métricas por grupo de anúncios |

### Frontend (Páginas)

| Rota | Página | Funcionalidade |
|------|--------|----------------|
| `/dashboard` | Dashboard | KPIs agregados, gráfico de linha temporal, resumo de campanhas |
| `/campaigns` | Campanhas | Tabela de campanhas, pausar/ativar, criar nova campanha |
| `/campaigns/:id/ad-groups` | Grupos | Listagem e controle de Ad Groups |
| `/campaigns/:id/ad-groups/:id/ads` | Anúncios | Visualização de RSA com headlines e descrições |
| `/reports` | Relatórios | Seletor de período, gráfico de barras, tabela detalhada |

---

## Melhorias Sugeridas para Versões Futuras

### Gestão Avançada
- [ ] **Editor de palavras-chave** — adicionar/negativar keywords por Ad Group
- [ ] **Gestão de assets** — upload de imagens, vídeos e sitelinks
- [ ] **Campanhas Performance Max** — painel dedicado com Asset Groups
- [ ] **A/B de anúncios** — comparação de desempenho entre variantes
- [ ] **Bulk actions** — pausar/ativar múltiplas campanhas de uma vez

### Analytics & BI
- [ ] **Segmentação por dispositivo** — mobile vs. desktop vs. tablet
- [ ] **Segmentação geográfica** — mapa de desempenho por região
- [ ] **Análise de search terms** — termos que dispararam anúncios
- [ ] **Funil de conversão** — cliques → conversões por campanha
- [ ] **Comparativo de períodos** — este mês vs. mês anterior
- [ ] **Export CSV/Excel** — download de relatórios paginados
- [ ] **Alertas automáticos** — notificação quando CTR ou custo ultrapassa limites

### Automação & IA
- [ ] **Regras automáticas** — pausar campanha se CPA > target definido
- [ ] **Sugestões de orçamento** — análise de sazonalidade para recomendações
- [ ] **Detecção de anomalias** — alertar queda brusca de cliques/conversões

### Infraestrutura
- [ ] **Autenticação de usuários** — login com Google (multi-tenant)
- [ ] **Cache Redis** — reduzir chamadas repetidas à API
- [ ] **Webhook de alertas** — integração com Slack ou e-mail
- [ ] **Rate limiting** — proteger a API de abusos (OWASP A4)
- [ ] **Testes automatizados** — Jest + Supertest para backend, Vitest para frontend
- [ ] **CI/CD** — GitHub Actions para deploy automático
- [ ] **Containerização** — Docker + docker-compose para ambiente reproduzível

---

## Limites e Cotas da Google Ads API

| Limite | Valor |
|--------|-------|
| Requisições por dia (padrão) | 15.000 operações/dia |
| Requisições por segundo | ~100 req/s (pode variar) |
| Relatórios com streaming | Recomendado para >10k linhas |
| Micros | 1 BRL = 1.000.000 micros |
| Headlines por RSA | 3 mínimo / 15 máximo |
| Descriptions por RSA | 2 mínimo / 4 máximo |

---

## Segurança (OWASP Top 10)

- **A01 — Broken Access Control**: Toda mutação valida o `customerId` antes de operar
- **A03 — Injection**: Parâmetros de GAQL são validados e nunca interpolados sem checagem com Zod
- **A04 — Insecure Design**: Orçamento em micros e não em float para evitar erros de arredondamento
- **A05 — Security Misconfiguration**: Helmet para headers HTTP, CORS restrito por lista de origens
- **A06 — Vulnerable Components**: Todas as dependências com versões fixas no `package.json`
- **A09 — Logging Failures**: Winston com níveis de log; stack trace omitido em produção

---

## Diagrama da Arquitetura

```
┌─────────────────────────────────────────────┐
│              Browser (React SPA)             │
│  Dashboard │ Campaigns │ Reports │ Ads       │
└─────────────────┬───────────────────────────┘
                  │ HTTP REST (Axios)
                  │ /api/*
┌─────────────────▼───────────────────────────┐
│           Backend (Express / Node.js)        │
│  Routes → Services → Google Ads API Client  │
└─────────────────┬───────────────────────────┘
                  │ HTTPS / gRPC (OAuth2)
                  │ Token: refresh_token
┌─────────────────▼───────────────────────────┐
│          Google Ads API v23                  │
│  Campaigns │ Ad Groups │ Ads │ Reporting     │
└─────────────────────────────────────────────┘
```
