import { useState } from 'react';
import { format, subDays } from 'date-fns';
import { useCampaignMetrics, useDailyMetrics } from '@/hooks/useMetrics';
import PerformanceChart from '@/components/dashboard/PerformanceChart';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { CampaignMetrics } from '@/types';

const PRESETS = [
  { label: 'Últimos 7 dias', days: 7 },
  { label: 'Últimos 30 dias', days: 30 },
  { label: 'Últimos 90 dias', days: 90 },
];

export default function Reports() {
  const [days, setDays] = useState(30);
  const endDate = format(new Date(), 'yyyy-MM-dd');
  const startDate = format(subDays(new Date(), days), 'yyyy-MM-dd');
  const dateRange = { startDate, endDate };

  const { data: metrics = [], isLoading } = useCampaignMetrics(dateRange);
  const { data: daily = [], isLoading: loadingDaily } = useDailyMetrics(dateRange);

  // Top campanhas por custo
  const topCampaigns = [...(metrics as CampaignMetrics[])]
    .sort((a, b) => b.costMicros - a.costMicros)
    .slice(0, 8)
    .map((m) => ({
      name: m.campaignName.length > 20 ? m.campaignName.slice(0, 18) + '…' : m.campaignName,
      custo: +(m.costMicros / 1_000_000).toFixed(2),
      cliques: m.clicks,
      conversoes: m.conversions,
    }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-gray-900">Relatórios</h2>
          <p className="text-sm text-gray-500">{startDate} → {endDate}</p>
        </div>
        <div className="flex gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.days}
              onClick={() => setDays(p.days)}
              className={days === p.days ? 'btn-primary py-1.5 px-3 text-xs' : 'btn-secondary py-1.5 px-3 text-xs'}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Gráfico de linha temporal */}
      <PerformanceChart data={daily as never} loading={loadingDaily} />

      {/* Gráfico de barras — top campanhas */}
      <div className="card">
        <h3 className="mb-4 text-sm font-semibold text-gray-700">Top campanhas por investimento</h3>
        {isLoading ? (
          <p className="text-sm text-gray-400">Carregando...</p>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={topCampaigns} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip
                formatter={(value: number, name: string) => {
                  if (name === 'Custo (R$)') return [`R$ ${value.toFixed(2)}`, name];
                  return [value.toLocaleString('pt-BR'), name];
                }}
              />
              <Bar dataKey="custo" name="Custo (R$)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="cliques" name="Cliques" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Tabela detalhada */}
      <div className="card overflow-hidden p-0">
        <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
          <h3 className="text-sm font-semibold text-gray-700">Detalhamento por campanha</h3>
        </div>
        <table className="w-full text-sm">
          <thead className="border-b border-gray-100">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Campanha</th>
              <th className="px-4 py-3 text-right font-medium text-gray-500">Cliques</th>
              <th className="px-4 py-3 text-right font-medium text-gray-500">Impressões</th>
              <th className="px-4 py-3 text-right font-medium text-gray-500">CTR</th>
              <th className="px-4 py-3 text-right font-medium text-gray-500">CPC Médio</th>
              <th className="px-4 py-3 text-right font-medium text-gray-500">Custo</th>
              <th className="px-4 py-3 text-right font-medium text-gray-500">Conversões</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {(metrics as CampaignMetrics[]).map((m) => (
              <tr key={m.campaignId} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{m.campaignName}</td>
                <td className="px-4 py-3 text-right text-gray-700">{m.clicks.toLocaleString('pt-BR')}</td>
                <td className="px-4 py-3 text-right text-gray-700">{m.impressions.toLocaleString('pt-BR')}</td>
                <td className="px-4 py-3 text-right text-gray-700">{(m.ctr * 100).toFixed(2)}%</td>
                <td className="px-4 py-3 text-right text-gray-700">
                  R$ {(m.averageCpc / 1_000_000).toFixed(2)}
                </td>
                <td className="px-4 py-3 text-right font-medium text-gray-900">
                  R$ {(m.costMicros / 1_000_000).toFixed(2)}
                </td>
                <td className="px-4 py-3 text-right text-gray-700">{m.conversions.toFixed(0)}</td>
              </tr>
            ))}
            {metrics.length === 0 && !isLoading && (
              <tr>
                <td colSpan={7} className="py-8 text-center text-gray-400">
                  Sem dados para o período selecionado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
