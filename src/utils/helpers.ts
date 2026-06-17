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

export const getEnergyForDate = (data: EnergyRecord[], fullDate: string): EnergyRecord | undefined => {
  return data.find((e) => e.fullDate === fullDate);
};

export const getTodayEnergy = (data: EnergyRecord[]): EnergyRecord | undefined => {
  return getEnergyForDate(data, getTodayLocalStr());
};

export const filterEnergyByRange = (data: EnergyRecord[], startDate: string, endDate: string): EnergyRecord[] => {
  return data.filter((e) => e.fullDate >= startDate && e.fullDate <= endDate);
};

export type EfficiencyTag = 'excellent' | 'good' | 'normal' | 'poor';

export const getEfficiencyTag = (energy: EnergyRecord, avgOutput: number, avgTotal: number): EfficiencyTag => {
  if (energy.output >= avgOutput * 1.03 && energy.total <= avgTotal * 0.98) return 'excellent';
  if (energy.output >= avgOutput && energy.total <= avgTotal) return 'good';
  if (energy.output < avgOutput * 0.97 && energy.total > avgTotal * 1.02) return 'poor';
  return 'normal';
};

export const getEfficiencyLabel = (tag: EfficiencyTag): string => {
  switch (tag) {
    case 'excellent': return '高产低耗';
    case 'good': return '运行良好';
    case 'poor': return '低产高耗';
    case 'normal': return '运行正常';
  }
};

export const getEfficiencyColor = (tag: EfficiencyTag): string => {
  switch (tag) {
    case 'excellent': return 'text-alarm-success';
    case 'good': return 'text-primary-400';
    case 'poor': return 'text-alarm-danger';
    case 'normal': return 'text-dark-300';
  }
};

export const getEfficiencyBg = (tag: EfficiencyTag): string => {
  switch (tag) {
    case 'excellent': return 'bg-alarm-success/15 border-alarm-success/30';
    case 'good': return 'bg-primary-500/15 border-primary-500/30';
    case 'poor': return 'bg-alarm-danger/15 border-alarm-danger/30';
    case 'normal': return 'bg-dark-700 border-dark-600';
  }
};

export const generateDailyEvaluation = (
  energy: EnergyRecord | undefined,
  output: number,
  avgOutput: number,
  avgEnergy: number,
  hotSpotTemp: number,
  alarmCount: number,
): string => {
  if (!energy) return '暂无数据';
  const tag = getEfficiencyTag(energy, avgOutput, avgEnergy);
  const parts: string[] = [];
  if (tag === 'excellent') {
    parts.push(`当日生产运行优秀，产量${energy.output.toFixed(0)}吨高于日均${avgOutput.toFixed(0)}吨，综合能耗${energy.total.toFixed(2)} GJ/t低于平均${avgEnergy.toFixed(2)} GJ/t，规模效益发挥充分。`);
  } else if (tag === 'poor') {
    parts.push(`当日生产运行欠佳，产量${energy.output.toFixed(0)}吨低于日均${avgOutput.toFixed(0)}吨，综合能耗${energy.total.toFixed(2)} GJ/t高于平均${avgEnergy.toFixed(2)} GJ/t，建议排查设备状况、优化工艺参数。`);
  } else if (tag === 'good') {
    parts.push(`当日生产运行良好，产量与能耗均优于平均水平，继续保持当前操作参数。`);
  } else {
    parts.push(`当日生产运行正常，产量${energy.output.toFixed(0)}吨，综合能耗${energy.total.toFixed(2)} GJ/t，各项指标基本稳定。`);
  }
  if (hotSpotTemp > 510) {
    parts.push(`合成塔热点温度${hotSpotTemp.toFixed(0)}℃偏高，需密切关注床层温度变化，防止超温。`);
  } else if (hotSpotTemp < 475) {
    parts.push(`合成塔热点温度${hotSpotTemp.toFixed(0)}℃偏低，可能影响合成效率，建议适当调整入塔温度。`);
  }
  if (alarmCount > 0) {
    parts.push(`当日共${alarmCount}条告警信息，请及时处理。`);
  }
  if (energy.coal > 1.2) {
    parts.push(`吨氨耗煤${energy.coal.toFixed(3)} t/t偏高，建议优化气化炉操作条件。`);
  }
  if (energy.power > 1350) {
    parts.push(`吨氨电耗${energy.power.toFixed(0)} kWh/t偏高，检查压缩机及冰机运行效率。`);
  }
  return parts.join('');
};
