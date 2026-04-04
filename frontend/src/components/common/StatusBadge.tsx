import { CampaignStatus } from '@/types';

interface StatusBadgeProps {
  status: CampaignStatus;
}

const map: Record<CampaignStatus, { label: string; className: string }> = {
  ENABLED: { label: 'Ativo', className: 'badge-enabled' },
  PAUSED: { label: 'Pausado', className: 'badge-paused' },
  REMOVED: { label: 'Removido', className: 'badge-removed' },
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const { label, className } = map[status] ?? map.PAUSED;
  return <span className={className}>{label}</span>;
}
