interface MetricsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: { value: number; positive: boolean };
  icon?: React.ReactNode;
}

export default function MetricsCard({
  title,
  value,
  subtitle,
  trend,
  icon,
}: MetricsCardProps) {
  return (
    <div className="card flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-500">{title}</span>
        {icon && (
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
            {icon}
          </div>
        )}
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {subtitle && <p className="mt-0.5 text-xs text-gray-500">{subtitle}</p>}
      </div>
      {trend && (
        <div
          className={`flex items-center gap-1 text-xs font-medium ${
            trend.positive ? 'text-green-600' : 'text-red-600'
          }`}
        >
          <span>{trend.positive ? '↑' : '↓'}</span>
          <span>{Math.abs(trend.value).toFixed(1)}% vs. período anterior</span>
        </div>
      )}
    </div>
  );
}
