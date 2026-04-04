import { Campaign } from '@/types';
import StatusBadge from '@/components/common/StatusBadge';
import { Link } from 'react-router-dom';

interface CampaignsSummaryProps {
  campaigns: Campaign[];
  loading?: boolean;
}

function formatBudget(amountMicros: number) {
  return `R$ ${(amountMicros / 1_000_000).toFixed(2)}`;
}

export default function CampaignsSummary({ campaigns, loading }: CampaignsSummaryProps) {
  if (loading) {
    return (
      <div className="card flex h-40 items-center justify-center">
        <span className="text-sm text-gray-400">Carregando campanhas...</span>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700">Campanhas ativas</h3>
        <Link to="/campaigns" className="text-xs text-brand-600 hover:underline">
          Ver todas
        </Link>
      </div>
      <div className="divide-y divide-gray-100">
        {campaigns.slice(0, 5).map((c) => (
          <div key={c.id} className="flex items-center justify-between py-3">
            <div>
              <p className="text-sm font-medium text-gray-900">{c.name}</p>
              <p className="text-xs text-gray-500">{c.advertisingChannelType}</p>
            </div>
            <div className="flex items-center gap-3">
              {c.budget && (
                <span className="text-xs text-gray-600">
                  {formatBudget(c.budget.amountMicros)}/dia
                </span>
              )}
              <StatusBadge status={c.status} />
            </div>
          </div>
        ))}
        {campaigns.length === 0 && (
          <p className="py-4 text-center text-sm text-gray-400">
            Nenhuma campanha encontrada.
          </p>
        )}
      </div>
    </div>
  );
}
