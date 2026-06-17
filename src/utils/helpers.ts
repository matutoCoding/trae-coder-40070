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
  shiftData?: ProductionRecord[],
): { summary: string; anomalies: string[]; suggestions: string[]; nextShiftNote: string } => {
  const anomalies: string[] = [];
  const suggestions: string[] = [];
  const parts: string[] = [];

  if (!energy) {
    return {
      summary: '暂无数据，无法生成当日运行评价。',
      anomalies: [],
      suggestions: [],
      nextShiftNote: '请保持正常生产节奏，密切关注工艺参数变化。',
    };
  }

  const tag = getEfficiencyTag(energy, avgOutput, avgEnergy);

  // 总体结论
  if (tag === 'excellent') {
    parts.push(`当日生产运行优秀，产量${energy.output.toFixed(1)}吨高于日均${avgOutput.toFixed(0)}吨，综合能耗${energy.total.toFixed(2)} GJ/t低于平均${avgEnergy.toFixed(2)} GJ/t，规模效益发挥充分，实现高产低耗。`);
  } else if (tag === 'poor') {
    parts.push(`当日生产运行欠佳，产量${energy.output.toFixed(1)}吨低于日均${avgOutput.toFixed(0)}吨，综合能耗${energy.total.toFixed(2)} GJ/t高于平均${avgEnergy.toFixed(2)} GJ/t，处于低产高耗状态，需全面排查原因。`);
    anomalies.push(`日产量 ${energy.output.toFixed(1)} 吨，低于日均 ${avgOutput.toFixed(0)} 吨 ${((1 - energy.output / avgOutput) * 100).toFixed(1)}%`);
    anomalies.push(`综合能耗 ${energy.total.toFixed(2)} GJ/t，高于日均 ${avgEnergy.toFixed(2)} GJ/t ${(((energy.total / avgEnergy) - 1) * 100).toFixed(1)}%`);
    suggestions.push('排查设备运行状况，重点检查合成塔催化剂活性、压缩机效率');
    suggestions.push('评估原料气质量与氢氮比是否在最佳区间');
  } else if (tag === 'good') {
    parts.push(`当日生产运行良好，产量与能耗均优于平均水平，操作参数合理，继续保持当前工况。`);
  } else {
    parts.push(`当日生产运行正常，产量${energy.output.toFixed(1)}吨，综合能耗${energy.total.toFixed(2)} GJ/t，各项指标基本稳定。`);
  }

  // 班次达成情况
  if (shiftData && shiftData.length > 0) {
    const shiftsReport = shiftData.map((s) => {
      const rate = ((s.output / s.target) * 100).toFixed(0);
      return `${s.shift}${rate}%`;
    }).join('、');
    parts.push(`班组目标达成情况：${shiftsReport}。`);
    const underAchieved = shiftData.filter((s) => s.output / s.target < 0.9);
    if (underAchieved.length > 0) {
      anomalies.push(`${underAchieved.map((s) => s.shift).join('、')} 产量未达目标的90%`);
    }
  }

  // 温度异常
  if (hotSpotTemp > 510) {
    anomalies.push(`合成塔热点温度 ${hotSpotTemp.toFixed(0)}℃ 偏高，接近上限`);
    suggestions.push('降低入塔温度或适当减少补气量，防止催化剂过热失活');
  } else if (hotSpotTemp < 475) {
    anomalies.push(`合成塔热点温度 ${hotSpotTemp.toFixed(0)}℃ 偏低`);
    suggestions.push('适当提高入塔温度或调整循环气量，保证合成反应效率');
  }

  // 告警
  if (alarmCount > 0) {
    anomalies.push(`当日共 ${alarmCount} 条未处理告警`);
    suggestions.push('优先处理高等级告警，消除设备安全隐患');
  }

  // 能耗分项异常
  if (energy.coal > 1.2) {
    anomalies.push(`吨氨耗煤 ${energy.coal.toFixed(3)} t/t 偏高`);
    suggestions.push('优化气化炉氧煤比与蒸汽用量，提高碳转化率');
  }
  if (energy.power > 1350) {
    anomalies.push(`吨氨电耗 ${energy.power.toFixed(0)} kWh/t 偏高`);
    suggestions.push('检查压缩机运行工况，评估变频调节空间，降低空转损耗');
  }
  if (energy.steam > 3.1) {
    anomalies.push(`吨氨蒸汽 ${energy.steam.toFixed(2)} t/t 偏高`);
    suggestions.push('检查变换工段蒸汽消耗，优化废热回收利用');
  }
  if (energy.water > 21) {
    anomalies.push(`吨氨循环水 ${energy.water.toFixed(1)} m³/t 偏高`);
    suggestions.push('检查水冷器换热效率，清理结垢，降低循环水用量');
  }

  // 下一班建议
  let nextShiftNote = '下一班请保持当前稳定工况，重点关注合成塔温度与氨冷液位，确保生产连续平稳。';
  if (anomalies.length >= 2) {
    nextShiftNote = `下一班需重点处理：${anomalies.slice(0, 2).join('；')}，及时消除隐患，争取高产低耗。`;
  } else if (tag === 'excellent') {
    nextShiftNote = '当日运行状态优秀，下一班请延续当前操作参数，保持高负荷稳定运行。';
  } else if (tag === 'poor') {
    nextShiftNote = '当日运行欠佳，下一班请重点排查产量偏低原因，优化工艺参数，尽快恢复高产低耗状态。';
  }

  if (suggestions.length === 0) {
    suggestions.push('保持当前优化的工艺参数，持续监控关键指标');
  }

  return {
    summary: parts.join(''),
    anomalies,
    suggestions,
    nextShiftNote,
  };
};

// 确定性伪随机（基于字符串哈希，保证同一输入得到同一结果）
const hashStr = (s: string): number => {
  let hash = 0;
  for (let i = 0; i < s.length; i++) {
    const chr = s.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0;
  }
  return Math.abs(hash);
};

const deterministicRandom = (seed: string, offset: number = 0): number => {
  const h = hashStr(seed + '_' + offset);
  return (h % 1000) / 1000; // 0 ~ 0.999
};

export interface ShiftEnergyDetail {
  shift: Shift;
  output: number;
  target: number;
  achievement: number;
  contribution: number;
  energyTotal: number;
  energyCoal: number;
  energyPower: number;
  energySteam: number;
  energyWater: number;
  energyLevel: 'low' | 'normal' | 'high';
}

export const calcShiftEnergy = (
  date: string,
  shift: Shift,
  shiftOutput: number,
  shiftTarget: number,
  dayTotalOutput: number,
  dayEnergy: EnergyRecord,
): ShiftEnergyDetail => {
  const seed = `${date}_${shift}`;
  const contribution = dayTotalOutput > 0 ? (shiftOutput / dayTotalOutput) * 100 : 0;
  const achievement = shiftTarget > 0 ? (shiftOutput / shiftTarget) * 100 : 0;

  // 基于班次产量达成率 + 确定性随机，计算该班能耗系数
  const baseFactor = 1 + (1 - Math.min(1.1, achievement / 100)) * 0.06; // 产量越低能耗越高
  const jitter1 = (deterministicRandom(seed, 1) - 0.5) * 0.04;
  const factor = Math.max(0.92, Math.min(1.08, baseFactor + jitter1));

  // 分项能耗
  const jitter2 = (deterministicRandom(seed, 2) - 0.5) * 0.03;
  const jitter3 = (deterministicRandom(seed, 3) - 0.5) * 0.03;
  const jitter4 = (deterministicRandom(seed, 4) - 0.5) * 0.03;
  const jitter5 = (deterministicRandom(seed, 5) - 0.5) * 0.03;

  const energyTotal = Number((dayEnergy.total * factor).toFixed(2));
  const energyCoal = Number((dayEnergy.coal * factor * (1 + jitter2)).toFixed(3));
  const energyPower = Number((dayEnergy.power * factor * (1 + jitter3)).toFixed(0));
  const energySteam = Number((dayEnergy.steam * factor * (1 + jitter4)).toFixed(2));
  const energyWater = Number((dayEnergy.water * factor * (1 + jitter5)).toFixed(1));

  // 判断能耗水平：相对日均值
  let energyLevel: 'low' | 'normal' | 'high' = 'normal';
  if (energyTotal <= dayEnergy.total * 0.98) energyLevel = 'low';
  else if (energyTotal >= dayEnergy.total * 1.02) energyLevel = 'high';

  return {
    shift,
    output: shiftOutput,
    target: shiftTarget,
    achievement,
    contribution,
    energyTotal,
    energyCoal,
    energyPower,
    energySteam,
    energyWater,
    energyLevel,
  };
};

export const getDateShiftEnergy = (
  productionData: ProductionRecord[],
  energyData: EnergyRecord[],
  fullDate: string,
): { shifts: ShiftEnergyDetail[]; totalOutput: number } => {
  const dayShifts = productionData.filter((p) => p.fullDate === fullDate);
  const dayEnergy = getEnergyForDate(energyData, fullDate);
  const totalOutput = dayShifts.reduce((s, p) => s + p.output, 0);

  if (!dayEnergy || dayShifts.length === 0) {
    return { shifts: [], totalOutput: 0 };
  }

  const shifts = dayShifts.map((p) =>
    calcShiftEnergy(fullDate, p.shift, p.output, p.target, totalOutput, dayEnergy)
  );
  return { shifts, totalOutput };
};

export interface ShiftCompareStats {
  shift: Shift;
  totalOutput: number;
  avgOutput: number;
  shiftCount: number;
  totalTarget: number;
  avgAchievement: number;
  avgEnergyTotal: number;
  avgEnergyCoal: number;
  avgEnergyPower: number;
  dailyRecords: { fullDate: string; shortDate: string; output: number; achievement: number; energyTotal: number; energyLevel: 'low' | 'normal' | 'high' }[];
}

export const compareShiftsByRange = (
  productionData: ProductionRecord[],
  energyData: EnergyRecord[],
  startDate: string,
  endDate: string,
): ShiftCompareStats[] => {
  const shifts: Shift[] = ['早班', '中班', '晚班'];
  const filteredProductions = filterProduction(productionData, startDate, endDate, 'all');

  return shifts.map((shiftName) => {
    const shiftRecords = filteredProductions.filter((p) => p.shift === shiftName);
    const dailyRecords: ShiftCompareStats['dailyRecords'] = [];

    shiftRecords.forEach((p) => {
      const dayEnergy = getEnergyForDate(energyData, p.fullDate);
      if (!dayEnergy) return;
      const shiftEnergy = calcShiftEnergy(p.fullDate, p.shift, p.output, p.target, p.output + 1, dayEnergy);
      dailyRecords.push({
        fullDate: p.fullDate,
        shortDate: p.date,
        output: p.output,
        achievement: (p.output / p.target) * 100,
        energyTotal: shiftEnergy.energyTotal,
        energyLevel: shiftEnergy.energyLevel,
      });
    });

    const totalOutput = shiftRecords.reduce((s, p) => s + p.output, 0);
    const totalTarget = shiftRecords.reduce((s, p) => s + p.target, 0);
    const avgEnergyTotal = dailyRecords.length > 0
      ? dailyRecords.reduce((s, d) => s + d.energyTotal, 0) / dailyRecords.length
      : 0;
    const avgEnergyCoal = dailyRecords.length > 0
      ? dailyRecords.reduce((s, d) => s + (getEnergyForDate(energyData, d.fullDate)?.coal || 0), 0) / dailyRecords.length
      : 0;
    const avgEnergyPower = dailyRecords.length > 0
      ? dailyRecords.reduce((s, d) => s + (getEnergyForDate(energyData, d.fullDate)?.power || 0), 0) / dailyRecords.length
      : 0;

    return {
      shift: shiftName,
      totalOutput,
      avgOutput: shiftRecords.length > 0 ? totalOutput / shiftRecords.length : 0,
      shiftCount: shiftRecords.length,
      totalTarget,
      avgAchievement: totalTarget > 0 ? (totalOutput / totalTarget) * 100 : 0,
      avgEnergyTotal: Number(avgEnergyTotal.toFixed(2)),
      avgEnergyCoal: Number(avgEnergyCoal.toFixed(3)),
      avgEnergyPower: Number(avgEnergyPower.toFixed(0)),
      dailyRecords,
    };
  });
};

export const getShiftRankings = (stats: ShiftCompareStats[]) => {
  const byOutput = [...stats].sort((a, b) => b.totalOutput - a.totalOutput).map((s) => s.shift);
  const byEnergy = [...stats].sort((a, b) => a.avgEnergyTotal - b.avgEnergyTotal).map((s) => s.shift);
  return { byOutput, byEnergy };
};

export const getEnergyLevelColor = (level: 'low' | 'normal' | 'high'): string => {
  if (level === 'low') return 'text-alarm-success';
  if (level === 'high') return 'text-alarm-danger';
  return 'text-dark-300';
};

export const getEnergyLevelLabel = (level: 'low' | 'normal' | 'high'): string => {
  if (level === 'low') return '偏低';
  if (level === 'high') return '偏高';
  return '正常';
};
