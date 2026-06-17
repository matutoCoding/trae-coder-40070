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

export interface ImpactFactor {
  key: string;
  name: string;
  category: '温度' | '告警' | '能耗' | '产量' | '班组';
  impact: number;
  severity: 'high' | 'medium' | 'low' | 'good';
  description: string;
  suggestion: string;
}

export const analyzeImpactFactors = (params: {
  hotSpotTemp: number;
  alarmCount: number;
  energy: EnergyRecord;
  avgOutput: number;
  avgEnergy: number;
  shiftEnergy: ShiftEnergyDetail[];
}): ImpactFactor[] => {
  const factors: ImpactFactor[] = [];
  const { hotSpotTemp, alarmCount, energy, avgOutput, avgEnergy, shiftEnergy } = params;

  // 1. 产量因素
  const outputGap = ((energy.output - avgOutput) / avgOutput) * 100;
  if (outputGap <= -5) {
    factors.push({
      key: 'low_output', name: '日产量偏低', category: '产量',
      impact: Math.abs(outputGap) * 1.2,
      severity: outputGap <= -10 ? 'high' : 'medium',
      description: `当日产量 ${energy.output.toFixed(1)} 吨，低于均值 ${avgOutput.toFixed(0)} 吨 ${Math.abs(outputGap).toFixed(1)}%`,
      suggestion: outputGap <= -10 ? '建议排查原料气成分与氢氮比，提高造气工段负荷' : '适当提高合成系统压力，优化循环气量',
    });
  } else if (outputGap >= 5) {
    factors.push({
      key: 'high_output', name: '产量表现优秀', category: '产量',
      impact: outputGap * 0.8,
      severity: 'good',
      description: `当日产量 ${energy.output.toFixed(1)} 吨，高于均值 ${avgOutput.toFixed(0)} 吨 ${outputGap.toFixed(1)}%`,
      suggestion: '保持当前操作参数，加强设备巡检防止故障',
    });
  }

  // 2. 综合能耗因素
  const energyGap = ((energy.total - avgEnergy) / avgEnergy) * 100;
  if (energyGap >= 5) {
    factors.push({
      key: 'high_energy', name: '综合能耗偏高', category: '能耗',
      impact: energyGap * 1.5,
      severity: energyGap >= 10 ? 'high' : 'medium',
      description: `吨氨综合能耗 ${energy.total.toFixed(2)} GJ/t，高于均值 ${avgEnergy.toFixed(2)} GJ/t ${energyGap.toFixed(1)}%`,
      suggestion: energyGap >= 10 ? '立即组织能耗专项分析，重点查气化与合成工段' : '优化工艺参数，减少跑冒滴漏',
    });
  } else if (energyGap <= -5) {
    factors.push({
      key: 'low_energy', name: '能耗控制优秀', category: '能耗',
      impact: Math.abs(energyGap) * 1,
      severity: 'good',
      description: `吨氨综合能耗 ${energy.total.toFixed(2)} GJ/t，低于均值 ${avgEnergy.toFixed(2)} GJ/t ${Math.abs(energyGap).toFixed(1)}%`,
      suggestion: '总结操作经验在班组间推广',
    });
  }

  // 3. 热点温度因素
  if (hotSpotTemp > 510) {
    const delta = hotSpotTemp - 500;
    factors.push({
      key: 'high_temp', name: '合成塔热点温度偏高', category: '温度',
      impact: delta * 0.8,
      severity: hotSpotTemp > 520 ? 'high' : 'medium',
      description: `热点温度 ${hotSpotTemp.toFixed(0)}℃，超优值上限 ${(hotSpotTemp - 510).toFixed(0)}℃，可能加速催化剂老化`,
      suggestion: hotSpotTemp > 520 ? '立即降低入塔温度，必要时减少新鲜气补充量' : '密切监控床层轴向温差，防止局部过热',
    });
  } else if (hotSpotTemp < 475) {
    factors.push({
      key: 'low_temp', name: '合成塔热点温度偏低', category: '温度',
      impact: (475 - hotSpotTemp) * 0.5,
      severity: hotSpotTemp < 465 ? 'high' : 'medium',
      description: `热点温度 ${hotSpotTemp.toFixed(0)}℃，低于下限 ${(475 - hotSpotTemp).toFixed(0)}℃，合成反应效率下降`,
      suggestion: '适当提高入塔温度或调整冷激气量，使热点温度回到 480-500℃ 优值区间',
    });
  }

  // 4. 告警因素
  if (alarmCount > 0) {
    factors.push({
      key: 'alarms', name: '未处理告警', category: '告警',
      impact: alarmCount * 5,
      severity: alarmCount >= 3 ? 'high' : 'medium',
      description: `当日共 ${alarmCount} 条未处理告警，可能影响生产平稳与设备安全`,
      suggestion: alarmCount >= 3 ? '优先处理高等级告警，逐一排查根因' : '按优先级顺序确认处理，防止遗漏',
    });
  }

  // 5. 煤耗
  if (energy.coal > 1.22) {
    factors.push({
      key: 'coal_high', name: '吨煤耗偏高', category: '能耗',
      impact: ((energy.coal - 1.2) / 1.2) * 100 * 0.8,
      severity: energy.coal > 1.26 ? 'high' : 'medium',
      description: `吨氨耗煤 ${energy.coal.toFixed(3)} t/t，超基准 ${(((energy.coal - 1.2) / 1.2) * 100).toFixed(1)}%`,
      suggestion: '优化气化炉氧煤比、饱和温度，减少飞灰含碳',
    });
  }

  // 6. 电耗
  if (energy.power > 1380) {
    factors.push({
      key: 'power_high', name: '吨电耗偏高', category: '能耗',
      impact: ((energy.power - 1350) / 1350) * 100 * 0.6,
      severity: energy.power > 1450 ? 'high' : 'medium',
      description: `吨氨电耗 ${energy.power.toFixed(0)} kWh/t，超基准 ${(((energy.power - 1350) / 1350) * 100).toFixed(1)}%`,
      suggestion: '检查压缩机、冰机、循环机运行效率，避免空载运行',
    });
  }

  // 7. 班组达成率
  const underShifts = shiftEnergy.filter((s) => s.achievement < 85);
  if (underShifts.length > 0) {
    const worst = underShifts.sort((a, b) => a.achievement - b.achievement)[0];
    factors.push({
      key: 'shift_under', name: `${worst.shift}产量达成率低`, category: '班组',
      impact: (85 - worst.achievement) * 0.6,
      severity: worst.achievement < 75 ? 'high' : 'medium',
      description: `${worst.shift}仅达成 ${worst.achievement.toFixed(0)}%，产量 ${worst.output.toFixed(1)} 吨/目标 ${worst.target.toFixed(0)} 吨`,
      suggestion: `组织${worst.shift}专项复盘，检查交班接气、参数调整与设备状况`,
    });
  }

  const highShifts = shiftEnergy.filter((s) => s.energyLevel === 'high');
  if (highShifts.length > 0) {
    const worstEnergy = highShifts.sort((a, b) => b.energyTotal - a.energyTotal)[0];
    factors.push({
      key: 'shift_energy', name: `${worstEnergy.shift}能耗偏高`, category: '班组',
      impact: ((worstEnergy.energyTotal - energy.total) / energy.total) * 100 * 2,
      severity: 'medium',
      description: `${worstEnergy.shift}能耗 ${worstEnergy.energyTotal.toFixed(2)} GJ/t，比日均值高 ${(((worstEnergy.energyTotal - energy.total) / energy.total) * 100).toFixed(1)}%`,
      suggestion: `对比${highShifts.map((s) => s.shift).join('/')}与低能耗班组的操作曲线，找出关键参数差异`,
    });
  }

  // 排序：优先坏消息（高严重度在前），再按影响程度
  const severityWeight = { high: 1000, medium: 500, low: 100, good: 0 };
  return factors.sort((a, b) => {
    const aw = severityWeight[a.severity] + a.impact;
    const bw = severityWeight[b.severity] + b.impact;
    return bw - aw;
  });
};

export const getFactorSeverityColor = (s: ImpactFactor['severity']): string => {
  switch (s) {
    case 'high': return 'text-alarm-danger';
    case 'medium': return 'text-alarm-warning';
    case 'low': return 'text-dark-300';
    case 'good': return 'text-alarm-success';
  }
};

export const getFactorSeverityBg = (s: ImpactFactor['severity']): string => {
  switch (s) {
    case 'high': return 'bg-alarm-danger/10 border-alarm-danger/30';
    case 'medium': return 'bg-alarm-warning/10 border-alarm-warning/30';
    case 'low': return 'bg-dark-700 border-dark-600';
    case 'good': return 'bg-alarm-success/10 border-alarm-success/30';
  }
};

export interface OpportunityDay {
  type: 'benchmark' | 'improve';
  date: string;
  fullDate: string;
  output: number;
  total: number;
  coal: number;
  power: number;
  steam: number;
  water: number;
  gapOutput: number;
  gapTotal: number;
}

export const findOpportunityDays = (
  energyList: EnergyRecord[],
  avgOutput: number,
  avgEnergy: number,
): { benchmarks: OpportunityDay[]; improvements: OpportunityDay[] } => {
  const benchmarks: OpportunityDay[] = [];
  const improvements: OpportunityDay[] = [];

  energyList.forEach((e) => {
    const gapOutput = ((e.output - avgOutput) / avgOutput) * 100;
    const gapTotal = ((e.total - avgEnergy) / avgEnergy) * 100;
    if (gapOutput >= 3 && gapTotal <= -2) {
      benchmarks.push({
        type: 'benchmark',
        date: e.date,
        fullDate: e.fullDate,
        output: e.output,
        total: e.total,
        coal: e.coal,
        power: e.power,
        steam: e.steam,
        water: e.water,
        gapOutput,
        gapTotal,
      });
    }
    if (gapOutput <= -3 && gapTotal >= 3) {
      improvements.push({
        type: 'improve',
        date: e.date,
        fullDate: e.fullDate,
        output: e.output,
        total: e.total,
        coal: e.coal,
        power: e.power,
        steam: e.steam,
        water: e.water,
        gapOutput,
        gapTotal,
      });
    }
  });

  benchmarks.sort((a, b) => (b.gapOutput - a.gapOutput) + (a.gapTotal - b.gapTotal));
  improvements.sort((a, b) => (a.gapOutput - b.gapOutput) + (b.gapTotal - a.gapTotal));
  return { benchmarks, improvements };
};

// ===== 导出日报功能：生成独立 HTML 并下载 =====
export interface ExportDailyReportData {
  date: string;
  output: number;
  outputTrend: number;
  hotSpotTemp: number;
  avgTankLevel: number;
  maxTankLevel: number;
  energyTotal: number;
  energyCoal: number;
  energyPower: number;
  energySteam: number;
  energyWater: number;
  temps: { name: string; value: number; unit: string; status: string }[];
  tanks: { name: string; level: number; temperature: number; pressure: number; status: string }[];
  shifts: { shift: Shift; output: number; target: number; achievement: number; contribution: number; energyTotal: number; energyLevel: string }[];
  shiftTotalOutput: number;
  alarms: { equipment: string; message: string; level: string; time: string; acknowledged: boolean }[];
  evaluation: { summary: string; anomalies: string[]; suggestions: string[]; nextShiftNote: string };
  efficiencyTag: string;
}

const shiftShort = (s: string) => (s === '早班' ? '早' : s === '中班' ? '中' : '晚');

export const exportDailyReport = (data: ExportDailyReportData) => {
  const shiftRows = data.shifts.map((s) => `
    <tr>
      <td>${s.shift}</td>
      <td>${s.output.toFixed(1)} / ${s.target.toFixed(1)} t</td>
      <td style="color:${s.achievement >= 95 ? '#16a34a' : s.achievement >= 85 ? '#ea580c' : '#dc2626'};font-weight:600">${s.achievement.toFixed(1)}%</td>
      <td>${s.contribution.toFixed(1)}%</td>
      <td>${s.energyTotal.toFixed(2)} GJ/t <span style="font-size:11px;color:#888">[${s.energyLevel}]</span></td>
    </tr>`).join('');

  const tempRows = data.temps.map((t) => `
    <tr><td>${t.name}</td><td>${t.value}${t.unit}</td><td>${t.status === 'normal' ? '<span style="color:#16a34a">正常</span>' : t.status === 'warning' ? '<span style="color:#ea580c">预警</span>' : '<span style="color:#dc2626">告警</span>'}</td></tr>`).join('');

  const tankRows = data.tanks.map((t) => `
    <tr><td>${t.name}</td><td>${t.level.toFixed(1)}%</td><td>${t.temperature.toFixed(1)}℃</td><td>${t.pressure.toFixed(2)} MPa</td></tr>`).join('');

  const alarmRows = data.alarms.length === 0
    ? `<tr><td colspan="4" style="text-align:center;padding:12px;color:#666">无未处理告警</td></tr>`
    : data.alarms.map((a) => `
      <tr>
        <td><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${a.level === 'alarm' ? '#dc2626' : '#ea580c'}"></span> ${a.equipment}</td>
        <td>${a.message}</td>
        <td>${a.time}</td>
        <td>${a.acknowledged ? '<span style="color:#888">已确认</span>' : '<span style="color:#dc2626;font-weight:600">未处理</span>'}</td>
      </tr>`).join('');

  const anomalyList = data.evaluation.anomalies.length === 0
    ? '<li style="color:#16a34a">无明显异常</li>'
    : data.evaluation.anomalies.map((a) => `<li>${a}</li>`).join('');

  const suggestionList = data.evaluation.suggestions.map((s) => `<li>${s}</li>`).join('');

  const dateObj = new Date(data.date);
  const weekday = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'][dateObj.getDay()];
  const now = new Date().toLocaleString('zh-CN');

  const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8"><title>合成氨车间生产日报 - ${data.date}</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:"Microsoft YaHei",Arial,sans-serif;color:#1a2733;background:#f8fafc;padding:24px;max-width:960px;margin:0 auto}
  h1{font-size:22px;color:#0c4a6e;border-bottom:3px solid #0ea5e9;padding-bottom:10px;margin-bottom:6px}
  .sub{color:#64748b;font-size:13px;margin-bottom:20px}
  .grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:20px}
  .kpi{background:linear-gradient(135deg,#f0f9ff,#e0f2fe);border:1px solid #bae6fd;border-radius:10px;padding:14px}
  .kpi .lab{font-size:12px;color:#64748b}.kpi .val{font-size:22px;font-weight:700;color:#0369a1;margin-top:4px}
  .kpi .tr{font-size:11px;color:#dc2626;margin-top:2px}.kpi .tr.ok{color:#16a34a}
  .tag{display:inline-block;padding:3px 10px;border-radius:12px;font-size:12px;background:#fee2e2;color:#dc2626;border:1px solid #fecaca}
  .tag.g{background:#dcfce7;color:#16a34a;border-color:#bbf7d0}
  .sec{background:#fff;border:1px solid #e2e8f0;border-radius:10px;padding:16px;margin-bottom:16px}
  .sec h2{font-size:15px;color:#0c4a6e;margin-bottom:10px;padding-left:10px;border-left:4px solid #0ea5e9}
  table{width:100%;border-collapse:collapse;font-size:13px}
  th,td{text-align:left;padding:8px 10px;border-bottom:1px solid #f1f5f9}
  th{background:#f8fafc;color:#475569;font-weight:600}
  .evl{background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:14px;margin-bottom:10px}
  .evl.h{background:#fef2f2;border-color:#fecaca}
  .evl h3{font-size:14px;color:#16a34a;margin-bottom:6px}.evl.h h3{color:#dc2626}
  .evl ul{padding-left:20px;margin-top:4px;color:#374151;line-height:1.7;font-size:13px}
  .next{background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:12px;margin-top:10px}
  .footer{margin-top:24px;font-size:11px;color:#94a3b8;text-align:right;border-top:1px dashed #cbd5e1;padding-top:8px}
</style>
</head>
<body>
<h1>合成氨车间生产日报</h1>
<div class="sub">
  报告日期：<strong>${data.date}</strong> ${weekday} &nbsp;|&nbsp;
  运行状态：<span class="tag ${data.efficiencyTag === '高产低耗' || data.efficiencyTag === '运行良好' ? 'g' : ''}">${data.efficiencyTag}</span> &nbsp;|&nbsp;
  生成时间：${now}
</div>

<div class="grid">
  <div class="kpi"><div class="lab">当日合成氨产量</div><div class="val">${data.output.toFixed(1)} 吨</div><div class="tr ${data.outputTrend < 0 ? 'ok' : ''}">${data.outputTrend >= 0 ? '↑' : '↓'} ${Math.abs(data.outputTrend).toFixed(1)}% 较前日</div></div>
  <div class="kpi"><div class="lab">合成塔热点温度</div><div class="val">${data.hotSpotTemp.toFixed(0)} ℃</div><div class="tr" style="color:#64748b">优值区间 480~500℃</div></div>
  <div class="kpi"><div class="lab">液氨储罐平均液位</div><div class="val">${data.avgTankLevel.toFixed(1)} %</div><div class="tr" style="color:#64748b">最高 ${data.maxTankLevel.toFixed(1)}%</div></div>
  <div class="kpi"><div class="lab">吨氨综合能耗</div><div class="val">${data.energyTotal.toFixed(2)} GJ/t</div><div class="tr" style="color:#64748b">煤/电/汽/水：${data.energyCoal.toFixed(2)}/${data.energyPower}/${data.energySteam.toFixed(1)}/${data.energyWater.toFixed(0)}</div></div>
</div>

<div class="sec"><h2>班组产量与能耗表现（合计 ${data.shiftTotalOutput.toFixed(1)} 吨）</h2>
<table><thead><tr><th>班组</th><th>产量/目标</th><th>目标达成</th><th>贡献占比</th><th>吨氨能耗</th></tr></thead><tbody>${shiftRows}</tbody></table></div>

<div class="sec"><h2>合成塔温度监控</h2>
<table><thead><tr><th>测点</th><th>当前值</th><th>状态</th></tr></thead><tbody>${tempRows}</tbody></table></div>

<div class="sec"><h2>液氨储罐液位</h2>
<table><thead><tr><th>储罐</th><th>液位</th><th>温度</th><th>压力</th></tr></thead><tbody>${tankRows}</tbody></table></div>

<div class="sec"><h2>能耗分项</h2>
<table><thead><tr><th>项目</th><th>原料煤</th><th>电力</th><th>蒸汽</th><th>循环水</th><th>综合能耗</th></tr></thead><tbody>
  <tr><td>数值</td><td>${data.energyCoal.toFixed(3)} t/t</td><td>${data.energyPower.toFixed(0)} kWh/t</td><td>${data.energySteam.toFixed(2)} t/t</td><td>${data.energyWater.toFixed(1)} m³/t</td><td><strong>${data.energyTotal.toFixed(2)} GJ/t</strong></td></tr>
</tbody></table></div>

<div class="sec"><h2>告警记录（${data.alarms.length} 条）</h2>
<table><thead><tr><th>设备</th><th>告警内容</th><th>发生时间</th><th>状态</th></tr></thead><tbody>${alarmRows}</tbody></table></div>

<div class="sec"><h2>自动运行评价</h2>
<div class="evl ${data.evaluation.anomalies.length > 0 ? 'h' : ''}">
  <h3>总体结论</h3><div style="line-height:1.7;color:#374151;font-size:13px">${data.evaluation.summary}</div>
</div>
<div class="evl"><h3>主要异常</h3><ul>${anomalyList}</ul></div>
<div class="evl"><h3>优化建议</h3><ul>${suggestionList}</ul></div>
<div class="next">
  <strong style="color:#b45309">⚠ 下一班注意事项：</strong>
  <span style="color:#78350f;margin-left:6px">${data.evaluation.nextShiftNote}</span>
</div>
</div>

<div class="footer">
  本报告由合成氨车间班组运行档案系统自动生成，数据更新时间：${now}
</div>
</body></html>`;

  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `合成氨车间生产日报_${data.date}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};
