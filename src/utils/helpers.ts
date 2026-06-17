import type { ParamStatus, Trend, ProductionRecord, EnergyRecord, Shift } from '@/types';

export const formatNumber = (value: number, decimals: number = 2): string => {
  return value.toLocaleString('zh-CN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

export const getStatusColor = (status: ParamStatus): string => {
  switch (status) {
    case 'normal':
      return 'text-alarm-success';
    case 'warning':
      return 'text-alarm-warning';
    case 'alarm':
      return 'text-alarm-danger';
  }
};

export const getStatusBgColor = (status: ParamStatus): string => {
  switch (status) {
    case 'normal':
      return 'bg-alarm-success/20 border-alarm-success/30';
    case 'warning':
      return 'bg-alarm-warning/20 border-alarm-warning/30';
    case 'alarm':
      return 'bg-alarm-danger/20 border-alarm-danger/30';
  }
};

export const getTrendIcon = (trend: Trend): string => {
  switch (trend) {
    case 'up':
      return '↑';
    case 'down':
      return '↓';
    case 'stable':
      return '→';
  }
};

export const getTrendColor = (trend: Trend): string => {
  switch (trend) {
    case 'up':
      return 'text-alarm-danger';
    case 'down':
      return 'text-alarm-success';
    case 'stable':
      return 'text-dark-300';
  }
};

export const getParamPercent = (value: number, min: number, max: number): number => {
  const range = max - min;
  if (range <= 0) return 50;
  const clamped = Math.max(min, Math.min(max, value));
  return ((clamped - min) / range) * 100;
};

export const cn = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(' ');
};

export const getTodayLocalStr = (): string => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export const getDateDaysAgo = (days: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export const getTodayProduction = (data: ProductionRecord[]): ProductionRecord[] => {
  const today = getTodayLocalStr();
  return data.filter((p) => p.fullDate === today);
};

export const getTodayTotalOutput = (data: ProductionRecord[]): number => {
  return getTodayProduction(data).reduce((sum, p) => sum + p.output, 0);
};

export const getYesterdayTotalOutput = (data: ProductionRecord[]): number => {
  const yesterday = getDateDaysAgo(1);
  return data.filter((p) => p.fullDate === yesterday).reduce((sum, p) => sum + p.output, 0);
};

export const filterProduction = (
  data: ProductionRecord[],
  startDate: string,
  endDate: string,
  shifts: Shift[] | 'all'
): ProductionRecord[] => {
  return data.filter((p) => {
    const dateMatch = p.fullDate >= startDate && p.fullDate <= endDate;
    const shiftMatch = shifts === 'all' || shifts.includes(p.shift);
    return dateMatch && shiftMatch;
  });
};

export const aggregateProductionStats = (data: ProductionRecord[]) => {
  const totalOutput = data.reduce((sum, p) => sum + p.output, 0);
  const totalTarget = data.reduce((sum, p) => sum + p.target, 0);
  const achievement = totalTarget > 0 ? (totalOutput / totalTarget) * 100 : 0;
  const shiftCount = data.length;
  const avgOutput = shiftCount > 0 ? totalOutput / shiftCount : 0;
  return { totalOutput, totalTarget, achievement, shiftCount, avgOutput };
};

export const getEnergyWithOutputAnalysis = (energy: EnergyRecord, prevEnergy?: EnergyRecord) => {
  const outputChange = prevEnergy ? (((energy.output - prevEnergy.output) / prevEnergy.output) * 100) : 0;
  const totalChange = prevEnergy ? (((energy.total - prevEnergy.total) / prevEnergy.total) * 100) : 0;
  const isHighOutput = energy.output > 155;
  const efficiencyImpact = isHighOutput ? -2.5 : 1.8;
  const coalPct = (energy.coal / 1.2) * 42;
  const powerPct = (energy.power / 1350) * 28;
  const steamPct = (energy.steam / 3.2) * 18;
  const waterPct = (energy.water / 22) * 8;
  const otherPct = 100 - coalPct - powerPct - steamPct - waterPct;
  return {
    outputChange,
    totalChange,
    isHighOutput,
    efficiencyImpact,
    breakdown: [
      { name: '原料煤', value: Number(coalPct.toFixed(1)) },
      { name: '电力', value: Number(powerPct.toFixed(1)) },
      { name: '蒸汽', value: Number(steamPct.toFixed(1)) },
      { name: '循环水', value: Number(waterPct.toFixed(1)) },
      { name: '其他', value: Number(Math.max(0, otherPct).toFixed(1)) },
    ],
  };
};
