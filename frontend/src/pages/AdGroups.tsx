import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ChevronRight, Plus } from 'lucide-react';
import api from '@/services/api';
import { AdGroup } from '@/types';
import StatusBadge from '@/components/common/StatusBadge';

async function fetchAdGroups(campaignId: string): Promise<AdGroup[]> {
  const { data } = await api.get<{ data: AdGroup[] }>('/ad-groups', {
    params: { campaignId },
  });
  return data.data;
}

export default function AdGroups() {
  const { campaignId } = useParams<{ campaignId: string }>();
  const qc = useQueryClient();

  const { data: adGroups = [], isLoading } = useQuery({
    queryKey: ['ad-groups', campaignId],
    queryFn: () => fetchAdGroups(campaignId!),
    enabled: !!campaignId,
  });

  const toggleStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'ENABLED' | 'PAUSED' }) =>
      api.patch(`/ad-groups/${id}/status`, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['ad-groups', campaignId] }),
  });

  if (isLoading) return <p className="text-sm text-gray-400">Carregando grupos...</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link to="/campaigns" className="hover:text-brand-600">Campanhas</Link>
        <ChevronRight size={14} />
        <span className="text-gray-900 font-medium">Grupos de Anúncios</span>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-gray-900">Grupos de Anúncios</h2>
        <button className="btn-primary">
          <Plus size={16} />
          Novo Grupo
        </button>
      </div>

      <div className="card overflow-hidden p-0">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Nome</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Tipo</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Lance CPC</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Status</th>
              <th className="px-4 py-3 text-right font-medium text-gray-500">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {adGroups.map((ag) => (
              <tr key={ag.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{ag.name}</td>
                <td className="px-4 py-3 text-gray-600">{ag.type}</td>
                <td className="px-4 py-3 text-gray-600">
                  {ag.cpcBidMicros
                    ? `R$ ${(ag.cpcBidMicros / 1_000_000).toFixed(2)}`
                    : '—'}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={ag.status} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      className="btn-secondary py-1 px-2 text-xs"
                      onClick={() =>
                        toggleStatus.mutate({
                          id: ag.id,
                          status: ag.status === 'ENABLED' ? 'PAUSED' : 'ENABLED',
                        })
                      }
                    >
                      {ag.status === 'ENABLED' ? 'Pausar' : 'Ativar'}
                    </button>
                    <Link
                      to={`/campaigns/${campaignId}/ad-groups/${ag.id}/ads`}
                      className="btn-secondary py-1 px-2 text-xs"
                    >
                      <ChevronRight size={13} />
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
            {adGroups.length === 0 && (
              <tr>
                <td colSpan={5} className="py-8 text-center text-gray-400">
                  Nenhum grupo de anúncios encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
