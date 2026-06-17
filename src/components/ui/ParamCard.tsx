import type { MonitorParam } from '@/types';
import { formatNumber, getStatusColor, getTrendIcon, getTrendColor, getParamPercent } from '@/utils/helpers';

interface ParamCardProps {
  param: MonitorParam;
  compact?: boolean;
}

export default function ParamCard({ param, compact = false }: ParamCardProps) {
  const percent = getParamPercent(param.value, param.min, param.max);
  const decimals = param.value >= 1000 ? 0 : param.value < 1 ? 4 : 2;

  if (compact) {
    return (
      <div className="px-3 py-2.5 rounded bg-dark-800 border border-dark-600">
        <div className="text-xs text-dark-300 mb-1">{param.name}</div>
        <div className="flex items-baseline gap-1.5">
          <span className={`data-value text-base ${getStatusColor(param.status)}`}>
            {formatNumber(param.value, decimals)}
          </span>
          <span className="text-xs text-dark-400">{param.unit}</span>
          <span className={`text-xs ${getTrendColor(param.trend)}`}>
            {getTrendIcon(param.trend)}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-3 rounded bg-dark-800 border border-dark-600 hover:border-dark-500 transition-colors">
      <div className="flex items-start justify-between mb-2">
        <span className="text-sm text-dark-200">{param.name}</span>
        <span
          className={`text-xs px-1.5 py-0.5 rounded border ${
            param.status === 'normal'
              ? 'bg-alarm-success/10 text-alarm-success border-alarm-success/30'
              : param.status === 'warning'
              ? 'bg-alarm-warning/10 text-alarm-warning border-alarm-warning/30'
              : 'bg-alarm-danger/10 text-alarm-danger border-alarm-danger/30'
          }`}
        >
          {param.status === 'normal' ? '正常' : param.status === 'warning' ? '预警' : '报警'}
        </span>
      </div>
      <div className="flex items-baseline gap-2 mb-3">
        <span className={`data-value text-2xl ${getStatusColor(param.status)}`}>
          {formatNumber(param.value, decimals)}
        </span>
        <span className="text-sm text-dark-400">{param.unit}</span>
        <span className={`text-sm ${getTrendColor(param.trend)} font-medium`}>
          {getTrendIcon(param.trend)}
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-dark-600 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            param.status === 'normal'
              ? 'bg-alarm-success'
              : param.status === 'warning'
              ? 'bg-alarm-warning'
              : 'bg-alarm-danger'
          }`}
          style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
        />
      </div>
      <div className="flex justify-between mt-1.5 text-[11px] text-dark-400">
        <span>{formatNumber(param.min, decimals)}</span>
        <span>{formatNumber(param.max, decimals)}</span>
      </div>
    </div>
  );
}
