export type ParamStatus = 'normal' | 'warning' | 'alarm';
export type Trend = 'up' | 'down' | 'stable';
export type Shift = '早班' | '中班' | '晚班';

export interface MonitorParam {
  id: string;
  name: string;
  value: number;
  unit: string;
  min: number;
  max: number;
  status: ParamStatus;
  trend: Trend;
}

export interface GasComposition {
  h2: number;
  n2: number;
  co: number;
  co2: number;
  ch4?: number;
  ar?: number;
  nh3?: number;
}

export interface ProductionRecord {
  date: string;
  fullDate: string;
  shift: Shift;
  output: number;
  target: number;
}

export interface EnergyRecord {
  date: string;
  fullDate: string;
  output: number;
  coal: number;
  power: number;
  steam: number;
  water: number;
  total: number;
}

export interface AlarmRecord {
  id: string;
  time: string;
  level: 'warning' | 'alarm';
  equipment: string;
  message: string;
  acknowledged: boolean;
}

export interface TankLevel {
  id: string;
  name: string;
  level: number;
  maxLevel: number;
  minLevel: number;
  temperature: number;
  pressure: number;
  status: ParamStatus;
}

export interface ValveStatus {
  id: string;
  name: string;
  openPercent: number;
  status: 'auto' | 'manual';
}

export interface TimeSeriesPoint {
  time: string;
  value: number;
}

export interface ModuleNav {
  path: string;
  name: string;
  icon: string;
  description: string;
}
