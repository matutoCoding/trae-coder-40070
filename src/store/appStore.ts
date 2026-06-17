import { create } from 'zustand';
import type {
  MonitorParam,
  AlarmRecord,
  TankLevel,
  ProductionRecord,
  EnergyRecord,
  GasComposition,
} from '@/types';
import {
  rawGasParams as initRawGas,
  shiftParams as initShift,
  decarbParams as initDecarb,
  refiningParams as initRefining,
  synthesisTempParams as initSynthTemp,
  synthesisPressureParams as initSynthPressure,
  separationParams as initSeparation,
  gasManagementParams as initGasMgmt,
  tankLevels as initTanks,
  initialAlarms,
  generateProductionData,
  generateEnergyData,
  halfWaterGasComposition,
  shiftGasComposition,
  refinedGasComposition,
  updateParams,
  jitterValue,
} from '@/data/mockData';

interface AppState {
  rawGasParams: MonitorParam[];
  shiftParams: MonitorParam[];
  decarbParams: MonitorParam[];
  refiningParams: MonitorParam[];
  synthesisTempParams: MonitorParam[];
  synthesisPressureParams: MonitorParam[];
  separationParams: MonitorParam[];
  gasManagementParams: MonitorParam[];
  tankLevels: TankLevel[];
  alarms: AlarmRecord[];
  productionData: ProductionRecord[];
  energyData: EnergyRecord[];
  halfWaterGas: GasComposition;
  shiftGas: GasComposition;
  refinedGas: GasComposition;
  currentTime: string;
  acknowledgeAlarm: (id: string) => void;
  tick: () => void;
}

const pad = (n: number) => String(n).padStart(2, '0');

export const useAppStore = create<AppState>((set) => ({
  rawGasParams: initRawGas,
  shiftParams: initShift,
  decarbParams: initDecarb,
  refiningParams: initRefining,
  synthesisTempParams: initSynthTemp,
  synthesisPressureParams: initSynthPressure,
  separationParams: initSeparation,
  gasManagementParams: initGasMgmt,
  tankLevels: initTanks,
  alarms: initialAlarms,
  productionData: generateProductionData(),
  energyData: generateEnergyData(),
  halfWaterGas: halfWaterGasComposition,
  shiftGas: shiftGasComposition,
  refinedGas: refinedGasComposition,
  currentTime: new Date().toTimeString().slice(0, 8),

  acknowledgeAlarm: (id: string) =>
    set((state) => ({
      alarms: state.alarms.map((a) => (a.id === id ? { ...a, acknowledged: true } : a)),
    })),

  tick: () => {
    const now = new Date();
    set((state) => ({
      currentTime: `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`,
      rawGasParams: updateParams(state.rawGasParams),
      shiftParams: updateParams(state.shiftParams),
      decarbParams: updateParams(state.decarbParams),
      refiningParams: updateParams(state.refiningParams),
      synthesisTempParams: updateParams(state.synthesisTempParams),
      synthesisPressureParams: updateParams(state.synthesisPressureParams),
      separationParams: updateParams(state.separationParams),
      gasManagementParams: updateParams(state.gasManagementParams),
      tankLevels: state.tankLevels.map((t) => ({
        ...t,
        level: Number(jitterValue(t.level, 2).toFixed(1)),
        temperature: Number(jitterValue(t.temperature, 1).toFixed(1)),
        pressure: Number(jitterValue(t.pressure, 0.05).toFixed(2)),
      })),
    }));
  },
}));
