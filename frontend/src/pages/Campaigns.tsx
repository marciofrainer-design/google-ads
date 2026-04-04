import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pause, Play, ChevronRight } from 'lucide-react';
import { useCampaigns, useUpdateCampaignStatus, useCreateCampaign } from '@/hooks/useCampaigns';
import StatusBadge from '@/components/common/StatusBadge';
import CampaignForm from '@/components/campaigns/CampaignForm';
import { CreateCampaignPayload } from '@/types';

export default function Campaigns() {
  const [showForm, setShowForm] = useState(false);
  const { data: campaigns = [], isLoading, error } = useCampaigns();
  const updateStatus = useUpdateCampaignStatus();
  const createCampaign = useCreateCampaign();

  function handleToggleStatus(id: string, currentStatus: string) {
    updateStatus.mutate({
      id,
      status: currentStatus === 'ENABLED' ? 'PAUSED' : 'ENABLED',
    });
  }

  async function handleCreate(payload: CreateCampaignPayload) {
    await createCampaign.mutateAsync(payload);
    setShowForm(false);
  }

  if (isLoading)
    return <p className="text-sm text-gray-400">Carregando campanhas...</p>;
  if (error)
    return <p className="text-sm text-red-500">Erro: {(error as Error).message}</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-gray-900">Campanhas</h2>
          <p className="text-sm text-gray-500">{campaigns.length} campanha(s) encontrada(s)</p>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(true)}>
          <Plus size={16} />
          Nova Campanha
        </button>
      </div>

      {showForm && (
        <div className="card">
          <CampaignForm
            onSubmit={handleCreate}
            onCancel={() => setShowForm(false)}
            isLoading={createCampaign.isPending}
          />
        </div>
      )}

      <div className="card overflow-hidden p-0">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Nome</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Tipo</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Orçamento/dia</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Status</th>
              <th className="px-4 py-3 text-right font-medium text-gray-500">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {campaigns.map((c) => (
              <tr key={c.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{c.name}</td>
                <td className="px-4 py-3 text-gray-600">{c.advertisingChannelType}</td>
                <td className="px-4 py-3 text-gray-600">
                  {c.budget
                    ? `R$ ${(c.budget.amountMicros / 1_000_000).toFixed(2)}`
                    : '—'}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={c.status} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleToggleStatus(c.id, c.status)}
                      className="btn-secondary py-1 px-2 text-xs"
                      disabled={c.status === 'REMOVED'}
                      title={c.status === 'ENABLED' ? 'Pausar' : 'Ativar'}
                    >
                      {c.status === 'ENABLED' ? (
                        <Pause size={13} />
                      ) : (
                        <Play size={13} />
                      )}
                    </button>
                    <Link
                      to={`/campaigns/${c.id}/ad-groups`}
                      className="btn-secondary py-1 px-2 text-xs"
                      title="Ver grupos de anúncios"
                    >
                      <ChevronRight size={13} />
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
            {campaigns.length === 0 && (
              <tr>
                <td colSpan={5} className="py-8 text-center text-gray-400">
                  Nenhuma campanha encontrada.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
