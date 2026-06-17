import { ReactNode } from 'react';
import { cn, formatNumber } from '@/utils/helpers';

interface MetricCardProps {
  label: string;
  value: number;
  unit?: string;
  icon?: ReactNode;
  decimals?: number;
  trend?: number;
  trendLabel?: string;
  color?: string;
  className?: string;
}

export default function MetricCard({
  label,
  value,
  unit,
  icon,
  decimals = 2,
  trend,
  trendLabel,
  color = 'text-primary-400',
  className,
}: MetricCardProps) {
  return (
    <div className={cn('card-base card-hover p-4', className)}>
      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm text-dark-300 mb-1">{label}</div>
          <div className="flex items-baseline gap-1.5">
            <span className={cn('font-display font-bold text-2xl', color)}>
              {formatNumber(value, decimals)}
            </span>
            {unit && <span className="text-sm text-dark-400">{unit}</span>}
          </div>
          {(trend !== undefined || trendLabel) && (
            <div className="mt-2 flex items-center gap-1.5 text-xs">
              {trend !== undefined && (
                <span
                  className={cn(
                    'font-medium',
                    trend >= 0 ? 'text-alarm-danger' : 'text-alarm-success'
                  )}
                >
                  {trend >= 0 ? '↑' : '↓'} {Math.abs(trend).toFixed(1)}%
                </span>
              )}
              {trendLabel && <span className="text-dark-400">{trendLabel}</span>}
            </div>
          )}
        </div>
        {icon && (
          <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', 'bg-dark-600', color)}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
