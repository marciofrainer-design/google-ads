import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { CampaignMetrics } from '@/types';

interface PerformanceChartProps {
  data: (CampaignMetrics & { date: string })[];
  loading?: boolean;
}

export default function PerformanceChart({ data, loading }: PerformanceChartProps) {
  if (loading) {
    return (
      <div className="card flex h-72 items-center justify-center">
        <span className="text-sm text-gray-400">Carregando dados...</span>
      </div>
    );
  }

  // Agrupa por data somando todas as campanhas
  const aggregated = Object.values(
    data.reduce<Record<string, { date: string; clicks: number; impressions: number; costBRL: number; conversions: number }>>(
      (acc, row) => {
        if (!acc[row.date]) {
          acc[row.date] = {
            date: row.date,
            clicks: 0,
            impressions: 0,
            costBRL: 0,
            conversions: 0,
          };
        }
        acc[row.date].clicks += row.clicks;
        acc[row.date].impressions += row.impressions;
        acc[row.date].costBRL += row.costMicros / 1_000_000;
        acc[row.date].conversions += row.conversions;
        return acc;
      },
      {}
    )
  ).sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="card">
      <h3 className="mb-4 text-sm font-semibold text-gray-700">Desempenho por dia</h3>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={aggregated} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="date" tick={{ fontSize: 11 }} />
          <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
          <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} />
          <Tooltip
            formatter={(value: number, name: string) => {
              if (name === 'Custo (R$)') return [`R$ ${value.toFixed(2)}`, name];
              return [value.toLocaleString('pt-BR'), name];
            }}
          />
          <Legend />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="clicks"
            name="Cliques"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={false}
          />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="conversions"
            name="Conversões"
            stroke="#10b981"
            strokeWidth={2}
            dot={false}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="costBRL"
            name="Custo (R$)"
            stroke="#f59e0b"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
