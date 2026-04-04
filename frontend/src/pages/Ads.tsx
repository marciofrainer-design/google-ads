import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ChevronRight, ExternalLink } from 'lucide-react';
import api from '@/services/api';
import { Ad } from '@/types';
import StatusBadge from '@/components/common/StatusBadge';

async function fetchAds(adGroupId: string): Promise<Ad[]> {
  const { data } = await api.get<{ data: Ad[] }>('/ads', { params: { adGroupId } });
  return data.data;
}

export default function Ads() {
  const { campaignId, adGroupId } = useParams<{ campaignId: string; adGroupId: string }>();

  const { data: ads = [], isLoading } = useQuery({
    queryKey: ['ads', adGroupId],
    queryFn: () => fetchAds(adGroupId!),
    enabled: !!adGroupId,
  });

  if (isLoading) return <p className="text-sm text-gray-400">Carregando anúncios...</p>;

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link to="/campaigns" className="hover:text-brand-600">Campanhas</Link>
        <ChevronRight size={14} />
        <Link to={`/campaigns/${campaignId}/ad-groups`} className="hover:text-brand-600">
          Grupos de Anúncios
        </Link>
        <ChevronRight size={14} />
        <span className="text-gray-900 font-medium">Anúncios</span>
      </div>

      <h2 className="text-base font-semibold text-gray-900">Anúncios</h2>

      <div className="space-y-4">
        {ads.map((ad) => (
          <div key={ad.id} className="card space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-gray-500">ID: {ad.id} · Tipo: {ad.type}</p>
                {ad.finalUrls[0] && (
                  <a
                    href={ad.finalUrls[0]}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-xs text-brand-600 hover:underline mt-1"
                  >
                    {ad.finalUrls[0]}
                    <ExternalLink size={11} />
                  </a>
                )}
              </div>
              <StatusBadge status={ad.status} />
            </div>

            {ad.responsiveSearchAd && (
              <div className="rounded-lg border border-gray-100 bg-gray-50 p-3 space-y-2">
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">Headlines</p>
                  <div className="flex flex-wrap gap-1">
                    {ad.responsiveSearchAd.headlines.map((h, i) => (
                      <span key={i} className="rounded bg-white border border-gray-200 px-2 py-0.5 text-xs text-gray-700">
                        {h.text}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">Descrições</p>
                  <div className="flex flex-col gap-1">
                    {ad.responsiveSearchAd.descriptions.map((d, i) => (
                      <span key={i} className="text-xs text-gray-700">{d.text}</span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
        {ads.length === 0 && (
          <div className="card py-8 text-center text-gray-400">
            Nenhum anúncio encontrado neste grupo.
          </div>
        )}
      </div>
    </div>
  );
}
