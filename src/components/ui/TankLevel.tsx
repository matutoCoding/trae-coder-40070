import type { TankLevel as TankLevelType } from '@/types';
import { formatNumber, getStatusColor } from '@/utils/helpers';

interface TankLevelProps {
  tank: TankLevelType;
  showDetails?: boolean;
}

export default function TankLevel({ tank, showDetails = true }: TankLevelProps) {
  const levelPercent = (tank.level / 100) * 100;
  const lowLine = (tank.minLevel / 100) * 100;
  const highLine = (tank.maxLevel / 100) * 100;

  if (!showDetails) {
    return (
      <div className="relative w-12 h-24 rounded-md border-2 border-dark-500 bg-dark-900 overflow-hidden">
        <div
          className={`absolute bottom-0 left-0 right-0 transition-all duration-700 ${
            tank.status === 'normal'
              ? 'bg-gradient-to-t from-primary-700 to-primary-500'
              : tank.status === 'warning'
              ? 'bg-gradient-to-t from-alarm-warning/80 to-alarm-warning'
              : 'bg-gradient-to-t from-alarm-danger/80 to-alarm-danger'
          }`}
          style={{ height: `${levelPercent}%` }}
        >
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-white/30" />
        </div>
        <div
          className="absolute left-0 right-0 border-t border-dashed border-alarm-danger/60"
          style={{ bottom: `${highLine}%` }}
        />
        <div
          className="absolute left-0 right-0 border-t border-dashed border-alarm-warning/60"
          style={{ bottom: `${lowLine}%` }}
        />
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[10px] font-mono text-white font-bold">
          {formatNumber(tank.level, 0)}%
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-3 rounded bg-dark-800 border border-dark-600">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-white">{tank.name}</span>
        <span
          className={`text-xs px-1.5 py-0.5 rounded border ${
            tank.status === 'normal'
              ? 'bg-alarm-success/10 text-alarm-success border-alarm-success/30'
              : tank.status === 'warning'
              ? 'bg-alarm-warning/10 text-alarm-warning border-alarm-warning/30'
              : 'bg-alarm-danger/10 text-alarm-danger border-alarm-danger/30'
          }`}
        >
          {tank.status === 'normal' ? '正常' : tank.status === 'warning' ? '预警' : '报警'}
        </span>
      </div>

      <div className="flex items-end gap-4">
        <div className="relative w-16 h-32 rounded-md border-2 border-dark-500 bg-dark-900 overflow-hidden">
          <div
            className={`absolute bottom-0 left-0 right-0 transition-all duration-700 ${
              tank.status === 'normal'
                ? 'bg-gradient-to-t from-primary-700 to-primary-500'
                : tank.status === 'warning'
                ? 'bg-gradient-to-t from-alarm-warning/80 to-alarm-warning'
                : 'bg-gradient-to-t from-alarm-danger/80 to-alarm-danger'
            }`}
            style={{ height: `${levelPercent}%` }}
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-white/30" />
          </div>

          <div
            className="absolute left-0 right-0 border-t border-dashed border-alarm-danger/60"
            style={{ bottom: `${highLine}%` }}
          />
          <div
            className="absolute left-0 right-0 border-t border-dashed border-alarm-warning/60"
            style={{ bottom: `${lowLine}%` }}
          />
        </div>

        <div className="flex-1 space-y-2">
          <div>
            <div className="text-xs text-dark-400">液位</div>
            <div className={`font-display font-bold text-xl ${getStatusColor(tank.status)}`}>
              {formatNumber(tank.level, 1)}%
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <div className="text-[11px] text-dark-400">温度</div>
              <div className="data-value text-sm text-white">{formatNumber(tank.temperature, 1)}℃</div>
            </div>
            <div>
              <div className="text-[11px] text-dark-400">压力</div>
              <div className="data-value text-sm text-white">{formatNumber(tank.pressure, 2)}MPa</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
