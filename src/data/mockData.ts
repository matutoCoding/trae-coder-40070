import type {
  MonitorParam,
  GasComposition,
  ProductionRecord,
  EnergyRecord,
  AlarmRecord,
  TankLevel,
  ValveStatus,
  TimeSeriesPoint,
} from '@/types';

const getStatus = (value: number, min: number, max: number): 'normal' | 'warning' | 'alarm' => {
  const range = max - min;
  const warnLow = min + range * 0.1;
  const warnHigh = max - range * 0.1;
  if (value < min || value > max) return 'alarm';
  if (value < warnLow || value > warnHigh) return 'warning';
  return 'normal';
};

const getTrend = (): 'up' | 'down' | 'stable' => {
  const r = Math.random();
  if (r < 0.33) return 'up';
  if (r < 0.66) return 'down';
  return 'stable';
};

export const generateTimeSeries = (count: number, base: number, variance: number, startTime?: Date): TimeSeriesPoint[] => {
  const points: TimeSeriesPoint[] = [];
  const now = startTime || new Date();
  for (let i = count - 1; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 60000);
    const timeStr = time.toTimeString().slice(0, 5);
    const value = Number((base + (Math.random() - 0.5) * variance).toFixed(2));
    points.push({ time: timeStr, value });
  }
  return points;
};

export const rawGasParams: MonitorParam[] = [
  { id: 'rg-1', name: '气化炉温度', value: 1280, unit: '℃', min: 1200, max: 1350, status: 'normal', trend: 'stable' },
  { id: 'rg-2', name: '气化炉压力', value: 2.85, unit: 'MPa', min: 2.5, max: 3.2, status: 'normal', trend: 'up' },
  { id: 'rg-3', name: '给煤量', value: 18.5, unit: 't/h', min: 15, max: 22, status: 'normal', trend: 'stable' },
  { id: 'rg-4', name: '蒸汽量', value: 12.3, unit: 't/h', min: 10, max: 15, status: 'normal', trend: 'down' },
  { id: 'rg-5', name: '氧气量', value: 8.6, unit: 'm³/h', min: 7, max: 10, status: 'normal', trend: 'stable' },
  { id: 'rg-6', name: '煤气产量', value: 52800, unit: 'm³/h', min: 45000, max: 60000, status: 'normal', trend: 'up' },
];

export const halfWaterGasComposition: GasComposition = {
  h2: 38.5,
  n2: 21.2,
  co: 30.8,
  co2: 8.5,
  ch4: 0.6,
  ar: 0.4,
};

export const shiftParams: MonitorParam[] = [
  { id: 'st-1', name: '一段炉入口温度', value: 320, unit: '℃', min: 300, max: 350, status: 'normal', trend: 'stable' },
  { id: 'st-2', name: '一段炉出口温度', value: 445, unit: '℃', min: 420, max: 470, status: 'normal', trend: 'up' },
  { id: 'st-3', name: '二段炉入口温度', value: 210, unit: '℃', min: 190, max: 230, status: 'normal', trend: 'stable' },
  { id: 'st-4', name: '二段炉出口温度', value: 235, unit: '℃', min: 215, max: 255, status: 'warning', trend: 'up' },
  { id: 'st-5', name: '变换压力', value: 2.65, unit: 'MPa', min: 2.3, max: 3.0, status: 'normal', trend: 'stable' },
  { id: 'st-6', name: '蒸汽/气比', value: 1.35, unit: '', min: 1.1, max: 1.6, status: 'normal', trend: 'down' },
];

export const shiftGasComposition: GasComposition = {
  h2: 52.3,
  n2: 19.8,
  co: 2.5,
  co2: 24.6,
  ch4: 0.5,
  ar: 0.3,
};

export const decarbParams: MonitorParam[] = [
  { id: 'dc-1', name: '脱碳塔压力', value: 2.55, unit: 'MPa', min: 2.2, max: 2.8, status: 'normal', trend: 'stable' },
  { id: 'dc-2', name: '脱碳塔液位', value: 55, unit: '%', min: 30, max: 80, status: 'normal', trend: 'up' },
  { id: 'dc-3', name: 'CO₂吸收率', value: 98.5, unit: '%', min: 95, max: 100, status: 'normal', trend: 'stable' },
  { id: 'dc-4', name: '溶液循环量', value: 320, unit: 'm³/h', min: 280, max: 360, status: 'normal', trend: 'stable' },
  { id: 'dc-5', name: '再生塔温度', value: 105, unit: '℃', min: 98, max: 112, status: 'normal', trend: 'down' },
  { id: 'dc-6', name: '净化气CO₂', value: 0.35, unit: '%', min: 0, max: 0.5, status: 'normal', trend: 'stable' },
];

export const refiningParams: MonitorParam[] = [
  { id: 'rf-1', name: '铜洗塔压力', value: 12.5, unit: 'MPa', min: 11, max: 14, status: 'normal', trend: 'stable' },
  { id: 'rf-2', name: '铜洗塔温度', value: 12, unit: '℃', min: 8, max: 18, status: 'normal', trend: 'down' },
  { id: 'rf-3', name: '铜液循环量', value: 28, unit: 'm³/h', min: 22, max: 35, status: 'normal', trend: 'stable' },
  { id: 'rf-4', name: '总铜含量', value: 2.25, unit: 'mol/L', min: 1.8, max: 2.6, status: 'normal', trend: 'stable' },
  { id: 'rf-5', name: '铜比', value: 5.8, unit: '', min: 5, max: 7, status: 'normal', trend: 'up' },
  { id: 'rf-6', name: '微量CO+CO₂', value: 18, unit: 'ppm', min: 0, max: 30, status: 'normal', trend: 'down' },
];

export const refinedGasComposition: GasComposition = {
  h2: 74.8,
  n2: 24.7,
  co: 0.0018,
  co2: 0.0002,
  ch4: 0.3,
  ar: 0.2,
};

export const synthesisTempParams: MonitorParam[] = [
  { id: 'sy-t1', name: '塔入口温度', value: 415, unit: '℃', min: 390, max: 440, status: 'normal', trend: 'stable' },
  { id: 'sy-t2', name: '一段床层温度', value: 485, unit: '℃', min: 450, max: 520, status: 'normal', trend: 'up' },
  { id: 'sy-t3', name: '二段床层温度', value: 468, unit: '℃', min: 440, max: 500, status: 'normal', trend: 'stable' },
  { id: 'sy-t4', name: '三段床层温度', value: 452, unit: '℃', min: 420, max: 480, status: 'normal', trend: 'down' },
  { id: 'sy-t5', name: '热点温度', value: 495, unit: '℃', min: 470, max: 520, status: 'warning', trend: 'up' },
  { id: 'sy-t6', name: '塔出口温度', value: 365, unit: '℃', min: 340, max: 390, status: 'normal', trend: 'stable' },
];

export const synthesisPressureParams: MonitorParam[] = [
  { id: 'sy-p1', name: '合成塔压力', value: 28.5, unit: 'MPa', min: 25, max: 31, status: 'normal', trend: 'stable' },
  { id: 'sy-p2', name: '新鲜气压力', value: 29.2, unit: 'MPa', min: 26, max: 32, status: 'normal', trend: 'up' },
  { id: 'sy-p3', name: '循环机出口压力', value: 29.8, unit: 'MPa', min: 27, max: 32, status: 'normal', trend: 'stable' },
  { id: 'sy-p4', name: '系统压差', value: 1.3, unit: 'MPa', min: 0.8, max: 2.0, status: 'normal', trend: 'down' },
  { id: 'sy-p5', name: '补气阀开度', value: 65, unit: '%', min: 0, max: 100, status: 'normal', trend: 'stable' },
  { id: 'sy-p6', name: '循环气量', value: 450000, unit: 'm³/h', min: 380000, max: 520000, status: 'normal', trend: 'up' },
];

export const separationParams: MonitorParam[] = [
  { id: 'sp-1', name: '氨冷器出口温度', value: -12, unit: '℃', min: -20, max: -5, status: 'normal', trend: 'down' },
  { id: 'sp-2', name: '气氨压力', value: 1.55, unit: 'MPa', min: 1.2, max: 1.8, status: 'normal', trend: 'stable' },
  { id: 'sp-3', name: '液氨流量', value: 18.6, unit: 't/h', min: 14, max: 22, status: 'normal', trend: 'up' },
  { id: 'sp-4', name: '分离效率', value: 96.8, unit: '%', min: 92, max: 100, status: 'normal', trend: 'stable' },
  { id: 'sp-5', name: '冰机负荷', value: 78, unit: '%', min: 50, max: 95, status: 'normal', trend: 'stable' },
  { id: 'sp-6', name: '液氨纯度', value: 99.95, unit: '%', min: 99.5, max: 100, status: 'normal', trend: 'stable' },
];

export const tankLevels: TankLevel[] = [
  { id: 'tk-1', name: '1#液氨储罐', level: 62, maxLevel: 85, minLevel: 15, temperature: -33, pressure: 1.45, status: 'normal' },
  { id: 'tk-2', name: '2#液氨储罐', level: 48, maxLevel: 85, minLevel: 15, temperature: -34, pressure: 1.42, status: 'normal' },
  { id: 'tk-3', name: '3#液氨储罐', level: 71, maxLevel: 85, minLevel: 15, temperature: -32, pressure: 1.48, status: 'warning' },
];

export const gasManagementParams: MonitorParam[] = [
  { id: 'gm-1', name: '循环气放空量', value: 2800, unit: 'm³/h', min: 2000, max: 4000, status: 'normal', trend: 'stable' },
  { id: 'gm-2', name: '新鲜气补充量', value: 36000, unit: 'm³/h', min: 30000, max: 42000, status: 'normal', trend: 'up' },
  { id: 'gm-3', name: '氢氮比 H₂/N₂', value: 3.02, unit: '', min: 2.8, max: 3.2, status: 'normal', trend: 'stable' },
  { id: 'gm-4', name: '惰性气体含量', value: 12.5, unit: '%', min: 8, max: 16, status: 'normal', trend: 'down' },
  { id: 'gm-5', name: '氨净值', value: 11.8, unit: '%', min: 9, max: 14, status: 'normal', trend: 'up' },
];

export const valves: ValveStatus[] = [
  { id: 'v-1', name: '放空阀', openPercent: 35, status: 'auto' },
  { id: 'v-2', name: '补气阀', openPercent: 68, status: 'auto' },
  { id: 'v-3', name: '储罐进口阀', openPercent: 100, status: 'auto' },
  { id: 'v-4', name: '储罐出口阀', openPercent: 52, status: 'manual' },
];

export const generateProductionData = (): ProductionRecord[] => {
  const records: ProductionRecord[] = [];
  const shifts: ('早班' | '中班' | '晚班')[] = ['早班', '中班', '晚班'];
  for (let i = 13; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(i / 3));
    const shift = shifts[i % 3];
    const output = Number((45 + Math.random() * 15).toFixed(1));
    records.push({
      date: date.toISOString().slice(5, 10).replace('-', '/'),
      shift,
      output,
      target: 55,
    });
  }
  return records;
};

export const generateEnergyData = (): EnergyRecord[] => {
  const records: EnergyRecord[] = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const coal = Number((1.15 + Math.random() * 0.1).toFixed(3));
    const power = Number((1250 + Math.random() * 150).toFixed(0));
    const steam = Number((2.8 + Math.random() * 0.4).toFixed(2));
    const water = Number((18 + Math.random() * 4).toFixed(1));
    const total = Number((38 + Math.random() * 4).toFixed(2));
    records.push({
      date: date.toISOString().slice(5, 10).replace('-', '/'),
      coal,
      power,
      steam,
      water,
      total,
    });
  }
  return records;
};

export const initialAlarms: AlarmRecord[] = [
  {
    id: 'a1',
    time: '08:42:15',
    level: 'warning',
    equipment: '合成塔',
    message: '热点温度接近上限 (495℃)',
    acknowledged: false,
  },
  {
    id: 'a2',
    time: '08:28:33',
    level: 'warning',
    equipment: '3#液氨储罐',
    message: '液位偏高 (71%)',
    acknowledged: false,
  },
  {
    id: 'a3',
    time: '07:55:08',
    level: 'warning',
    equipment: '二段变换炉',
    message: '出口温度偏高 (235℃)',
    acknowledged: true,
  },
];

export const jitterValue = (base: number, variance: number): number => {
  return Number((base + (Math.random() - 0.5) * variance).toFixed(2));
};

export const updateParams = (params: MonitorParam[]): MonitorParam[] => {
  return params.map((p) => {
    const variance = (p.max - p.min) * 0.02;
    const newValue = jitterValue(p.value, variance);
    return {
      ...p,
      value: Number(newValue.toFixed(p.unit === '' ? 2 : p.value >= 1000 ? 0 : 2)),
      status: getStatus(newValue, p.min, p.max),
      trend: getTrend(),
    };
  });
};

export { getStatus, getTrend };
