import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CreateCampaignPayload } from '@/types';

const schema = z.object({
  name: z.string().min(1, 'Nome obrigatório').max(255),
  advertisingChannelType: z.enum(['SEARCH', 'DISPLAY', 'PERFORMANCE_MAX', 'DEMAND_GEN', 'SHOPPING']),
  status: z.enum(['ENABLED', 'PAUSED']).default('PAUSED'),
  dailyBudgetBRL: z.number({ coerce: true }).positive('Orçamento deve ser positivo'),
  biddingStrategy: z.enum([
    'MAXIMIZE_CLICKS',
    'MAXIMIZE_CONVERSIONS',
    'MAXIMIZE_CONVERSION_VALUE',
    'TARGET_CPA',
    'TARGET_ROAS',
  ]),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface CampaignFormProps {
  onSubmit: (payload: CreateCampaignPayload) => void | Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function CampaignForm({ onSubmit, onCancel, isLoading }: CampaignFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  function handleFormSubmit(values: FormValues) {
    onSubmit({
      name: values.name,
      advertisingChannelType: values.advertisingChannelType,
      status: values.status,
      dailyBudgetMicros: Math.round(values.dailyBudgetBRL * 1_000_000),
      biddingStrategy: values.biddingStrategy,
      startDate: values.startDate || undefined,
      endDate: values.endDate || undefined,
    });
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <h3 className="text-sm font-semibold text-gray-900">Nova Campanha</h3>

      <div className="grid grid-cols-2 gap-4">
        {/* Nome */}
        <div className="col-span-2">
          <label className="block text-xs font-medium text-gray-700">Nome da Campanha</label>
          <input
            {...register('name')}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          {errors.name && (
            <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>
          )}
        </div>

        {/* Tipo */}
        <div>
          <label className="block text-xs font-medium text-gray-700">Tipo</label>
          <select
            {...register('advertisingChannelType')}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="SEARCH">Search</option>
            <option value="DISPLAY">Display</option>
            <option value="PERFORMANCE_MAX">Performance Max</option>
            <option value="DEMAND_GEN">Demand Gen</option>
            <option value="SHOPPING">Shopping</option>
          </select>
        </div>

        {/* Estratégia de lance */}
        <div>
          <label className="block text-xs font-medium text-gray-700">Estratégia de Lance</label>
          <select
            {...register('biddingStrategy')}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="MAXIMIZE_CLICKS">Maximizar cliques</option>
            <option value="MAXIMIZE_CONVERSIONS">Maximizar conversões</option>
            <option value="MAXIMIZE_CONVERSION_VALUE">Maximizar valor de conversão</option>
            <option value="TARGET_CPA">CPA desejado</option>
            <option value="TARGET_ROAS">ROAS desejado</option>
          </select>
        </div>

        {/* Orçamento diário */}
        <div>
          <label className="block text-xs font-medium text-gray-700">Orçamento diário (R$)</label>
          <input
            {...register('dailyBudgetBRL')}
            type="number"
            step="0.01"
            min="0.01"
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          {errors.dailyBudgetBRL && (
            <p className="mt-1 text-xs text-red-500">{errors.dailyBudgetBRL.message}</p>
          )}
        </div>

        {/* Status inicial */}
        <div>
          <label className="block text-xs font-medium text-gray-700">Status inicial</label>
          <select
            {...register('status')}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="PAUSED">Pausado</option>
            <option value="ENABLED">Ativo</option>
          </select>
        </div>

        {/* Datas */}
        <div>
          <label className="block text-xs font-medium text-gray-700">Data de início</label>
          <input
            {...register('startDate')}
            type="date"
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700">Data de encerramento</label>
          <input
            {...register('endDate')}
            type="date"
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel} className="btn-secondary">
          Cancelar
        </button>
        <button type="submit" className="btn-primary" disabled={isLoading}>
          {isLoading ? 'Criando...' : 'Criar Campanha'}
        </button>
      </div>
    </form>
  );
}
