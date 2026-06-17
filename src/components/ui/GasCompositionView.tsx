import type { GasComposition } from '@/types';
import { formatNumber } from '@/utils/helpers';

interface Props {
  composition: GasComposition;
  title?: string;
}

const gasLabels: Record<string, { label: string; color: string }> = {
  h2: { label: 'H₂ 氢气', color: '#00d4aa' },
  n2: { label: 'N₂ 氮气', color: '#3d8bfd' },
  co: { label: 'CO 一氧化碳', color: '#ffa726' },
  co2: { label: 'CO₂ 二氧化碳', color: '#ff4757' },
  ch4: { label: 'CH₄ 甲烷', color: '#a855f7' },
  ar: { label: 'Ar 氩气', color: '#2ed573' },
  nh3: { label: 'NH₃ 氨气', color: '#06b6d4' },
};

export default function GasCompositionView({ composition, title }: Props) {
  const entries = Object.entries(composition).filter(
    ([, v]) => typeof v === 'number' && !isNaN(v)
  );
  const total = entries.reduce((sum, [, v]) => sum + (v as number), 0);

  return (
    <div>
      {title && <h3 className="text-sm font-display font-semibold text-white mb-3">{title}</h3>}
      <div className="space-y-2.5">
        {entries.map(([key, value]) => {
          const info = gasLabels[key] || { label: key.toUpperCase(), color: '#7a8391' };
          const percent = ((value as number) / total) * 100;
          const displayValue = value as number;
          return (
            <div key={key}>
              <div className="flex items-center justify-between text-xs mb-1">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-sm" style={{ backgroundColor: info.color }} />
                  <span className="text-dark-200">{info.label}</span>
                </div>
                <span className="data-value text-white">
                  {displayValue < 0.01
                    ? formatNumber(displayValue * 10000, 1) + ' ppm'
                    : formatNumber(displayValue, 2) + '%'}
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-dark-600 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${percent}%`, backgroundColor: info.color }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
