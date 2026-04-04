import { subDays, format } from 'date-fns';
import { MousePointerClick, Eye, TrendingUp, DollarSign } from 'lucide-react';
import MetricsCard from '@/components/dashboard/MetricsCard';
import PerformanceChart from '@/components/dashboard/PerformanceChart';
import CampaignsSummary from '@/components/dashboard/CampaignsSummary';
import { useCampaignMetrics, useDailyMetrics } from '@/hooks/useMetrics';
import { useCampaigns } from '@/hooks/useCampaigns';

const today = format(new Date(), 'yyyy-MM-dd');
const thirtyDaysAgo = format(subDays(new Date(), 30), 'yyyy-MM-dd');
const dateRange = { startDate: thirtyDaysAgo, endDate: today };

function sumMetric(data: Array<{ [k: string]: number }>, key: string) {
  return data.reduce((acc, row) => acc + (row[key] ?? 0), 0);
}

export default function Dashboard() {
  const { data: campaigns = [], isLoading: loadingCampaigns } = useCampaigns();
  const { data: metrics = [], isLoading: loadingMetrics } = useCampaignMetrics(dateRange);
  const { data: daily = [], isLoading: loadingDaily } = useDailyMetrics(dateRange);

  const totalClicks = sumMetric(metrics as never, 'clicks');
  const totalImpressions = sumMetric(metrics as never, 'impressions');
  const totalCostBRL = sumMetric(metrics as never, 'costMicros') / 1_000_000;
  const totalConversions = sumMetric(metrics as never, 'conversions');
  const avgCtr = metrics.length ? sumMetric(metrics as never, 'ctr') / metrics.length : 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-semibold text-gray-900">
          Visão geral — últimos 30 dias
        </h2>
        <p className="text-sm text-gray-500">
          {thirtyDaysAgo} até {today}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MetricsCard
          title="Cliques"
          value={totalClicks.toLocaleString('pt-BR')}
          subtitle="Total no período"
          icon={<MousePointerClick size={18} />}
        />
        <MetricsCard
          title="Impressões"
          value={totalImpressions.toLocaleString('pt-BR')}
          subtitle="Total no período"
          icon={<Eye size={18} />}
        />
        <MetricsCard
          title="Custo total"
          value={`R$ ${totalCostBRL.toFixed(2)}`}
          subtitle={`CTR médio: ${(avgCtr * 100).toFixed(2)}%`}
          icon={<DollarSign size={18} />}
        />
        <MetricsCard
          title="Conversões"
          value={totalConversions.toLocaleString('pt-BR')}
          subtitle="Total no período"
          icon={<TrendingUp size={18} />}
        />
      </div>

      {/* Gráfico de linha */}
      <PerformanceChart data={daily as never} loading={loadingDaily || loadingMetrics} />

      {/* Resumo de campanhas */}
      <CampaignsSummary campaigns={campaigns} loading={loadingCampaigns} />
    </div>
  );
}
