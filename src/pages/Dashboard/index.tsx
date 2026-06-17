import { useMemo, useState } from 'react';
import {
  Flame,
  Wind,
  Droplets,
  Cog,
  ThermometerSun,
  BarChart3,
  Gauge,
  Factory,
  Zap,
  Activity,
  Thermometer,
  AlertTriangle,
  CheckCircle,
  FileText,
  X,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Calendar,
  List,
  Download,
  Layers,
} from 'lucide-react';
import Layout from '@/components/layout/Layout';
import MetricCard from '@/components/ui/MetricCard';
import Card from '@/components/ui/Card';
import ModuleCard from '@/components/ui/ModuleCard';
import LineChart from '@/components/charts/LineChart';
import PieChart from '@/components/charts/PieChart';
import TankLevelComp from '@/components/ui/TankLevel';
import { useAppStore } from '@/store/appStore';
import { generateTimeSeries } from '@/data/mockData';
import {
  formatNumber,
  getTodayLocalStr,
  getDateDaysAgo,
  getEnergyForDate,
  getDateShiftEnergy,
  getEfficiencyTag,
  getEfficiencyLabel,
  getEfficiencyColor,
  getEfficiencyBg,
  generateDailyEvaluation,
  getEnergyLevelColor,
  getEnergyLevelLabel,
  analyzeImpactFactors,
  getFactorSeverityColor,
  getFactorSeverityBg,
  exportDailyReport,
} from '@/utils/helpers';
import type { MonitorParam, TankLevel as TankLevelType, AlarmRecord } from '@/types';

// 确定性伪随机生成历史温度/液位/告警
const hashStr = (s: string): number => {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
};
const dRand = (seed: string, off: number = 0): number => (hashStr(seed + '_' + off) % 1000) / 1000;

const getHistoricalTemps = (date: string, base: MonitorParam[]): MonitorParam[] => {
  return base.map((p, idx) => {
    const jitter = (dRand(date + '_temp', idx) - 0.5) * 20;
    const newVal = Number((p.value + jitter).toFixed(1));
    let status: MonitorParam['status'] = 'normal';
    if (newVal > p.max * 0.98 || newVal < p.min * 1.02) status = 'warning';
    if (newVal > p.max || newVal < p.min) status = 'alarm';
    return { ...p, value: newVal, status };
  });
};

const getHistoricalTanks = (date: string, base: TankLevelType[]): TankLevelType[] => {
  return base.map((t, idx) => {
    const jitter = (dRand(date + '_tank', idx) - 0.5) * 15;
    const newLevel = Number(Math.max(10, Math.min(95, t.level + jitter)).toFixed(1));
    let status: TankLevelType['status'] = 'normal';
    if (newLevel > 85 || newLevel < 20) status = 'warning';
    if (newLevel > 92 || newLevel < 12) status = 'alarm';
    const tempJitter = (dRand(date + '_ttemp', idx) - 0.5) * 4;
    const pressJitter = (dRand(date + '_tpress', idx) - 0.5) * 0.3;
    return {
      ...t,
      level: newLevel,
      status,
      temperature: Number((t.temperature + tempJitter).toFixed(1)),
      pressure: Number(Math.max(1.2, t.pressure + pressJitter).toFixed(2)),
    };
  });
};

const getHistoricalAlarms = (date: string, base: AlarmRecord[], hotSpotVal: number): AlarmRecord[] => {
  const count = Math.floor(dRand(date + '_alarm', 0) * 5);
  if (count === 0) return [];
  const result: AlarmRecord[] = [];
  const templates = base.length > 0 ? base : [
    { id: '1', equipment: '合成塔', message: '热点温度偏高', level: 'warning' as const, time: '08:30', acknowledged: false },
    { id: '2', equipment: '1#液氨储罐', message: '液位接近高限', level: 'warning' as const, time: '10:15', acknowledged: false },
    { id: '3', equipment: '循环压缩机', message: '振动值偏高', level: 'alarm' as const, time: '14:22', acknowledged: false },
    { id: '4', equipment: '冰机出口', message: '氨冷凝温度高', level: 'warning' as const, time: '16:40', acknowledged: false },
  ];
  for (let i = 0; i < count; i++) {
    const tpl = templates[i % templates.length];
    const hr = 6 + Math.floor(dRand(date + '_alarmh', i) * 18);
    const mn = Math.floor(dRand(date + '_alarms', i) * 60);
    result.push({
      ...tpl,
      id: `${date}_${i}`,
      time: `${String(hr).padStart(2, '0')}:${String(mn).padStart(2, '0')}`,
      acknowledged: dRand(date + '_alarmack', i) > 0.5,
    });
  }
  if (hotSpotVal > 510) {
    result.push({
      id: `${date}_hs`,
      equipment: '合成塔',
      message: `热点温度 ${hotSpotVal.toFixed(0)}℃ 偏高`,
      level: 'warning',
      time: '12:00',
      acknowledged: false,
    });
  }
  return result;
};

export default function Dashboard() {
  const [showDailyReport, setShowDailyReport] = useState(false);
  const [reportDate, setReportDate] = useState(getTodayLocalStr());
  const [reportView, setReportView] = useState<'detail' | 'list'>('detail');

  const {
    synthesisPressureParams,
    synthesisTempParams,
    separationParams,
    energyData,
    productionData,
    alarms: liveAlarms,
    halfWaterGas,
    tankLevels: liveTankLevels,
    acknowledgeAlarm,
  } = useAppStore();

  const hotSpotTempBase = synthesisTempParams.find((p) => p.id === 'sy-t5');
  const synthPressure = synthesisPressureParams.find((p) => p.id === 'sy-p1');
  const nh3Flow = separationParams.find((p) => p.id === 'sp-3');

  // 实时数据（用于仪表盘本身）
  const todayShiftData = useMemo(() => getDateShiftEnergy(productionData, energyData, getTodayLocalStr()), [productionData, energyData]);
  const yesterdayShiftData = useMemo(() => getDateShiftEnergy(productionData, energyData, getDateDaysAgo(1)), [productionData, energyData]);
  const todayTotalOutput = todayShiftData.totalOutput;
  const todayVsYesterdayOutput = yesterdayShiftData.totalOutput > 0
    ? (((todayTotalOutput - yesterdayShiftData.totalOutput) / yesterdayShiftData.totalOutput) * 100)
    : 0;
  const todayEnergy = getEnergyForDate(energyData, getTodayLocalStr());

  // 报表日期对应的数据
  const reportShiftData = useMemo(
    () => getDateShiftEnergy(productionData, energyData, reportDate),
    [productionData, energyData, reportDate]
  );
  const reportEnergy = getEnergyForDate(energyData, reportDate);
  const reportTemps = useMemo(() => getHistoricalTemps(reportDate, synthesisTempParams), [reportDate, synthesisTempParams]);
  const reportTanks = useMemo(() => getHistoricalTanks(reportDate, liveTankLevels), [reportDate, liveTankLevels]);
  const reportHotSpot = reportTemps.find((p) => p.id === 'sy-t5');
  const reportAlarms = useMemo(
    () => reportDate === getTodayLocalStr() ? liveAlarms.filter((a) => !a.acknowledged) : getHistoricalAlarms(reportDate, liveAlarms, reportHotSpot?.value || 495),
    [reportDate, liveAlarms, reportHotSpot]
  );
  // 使用 getDateDaysAgo 获取真实前一天，不再依赖 energyData 数组位置
  const prevDate = (() => {
    const d = new Date(reportDate); d.setDate(d.getDate() - 1);
    const y = d.getFullYear(); const m = String(d.getMonth() + 1).padStart(2, '0'); const dd = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${dd}`;
  })();
  const reportPrevShiftData = useMemo(
    () => getDateShiftEnergy(productionData, energyData, prevDate),
    [productionData, energyData, prevDate]
  );
  const reportPrevEnergy = getEnergyForDate(energyData, prevDate);
  const reportOutputTrend = reportPrevShiftData.totalOutput > 0
    ? (((reportShiftData.totalOutput - reportPrevShiftData.totalOutput) / reportPrevShiftData.totalOutput) * 100)
    : 0;

  const avgOutputAll = energyData.reduce((s, d) => s + d.output, 0) / Math.max(1, energyData.length);
  const avgEnergyAll = energyData.reduce((s, d) => s + d.total, 0) / Math.max(1, energyData.length);
  const reportTag = reportEnergy ? getEfficiencyTag(reportEnergy, avgOutputAll, avgEnergyAll) : 'normal';
  const reportProdRaw = productionData.filter((p) => p.fullDate === reportDate);
  const reportEvaluation = generateDailyEvaluation(
    reportEnergy,
    reportShiftData.totalOutput,
    avgOutputAll,
    avgEnergyAll,
    reportHotSpot?.value || 495,
    reportAlarms.filter((a) => !a.acknowledged).length,
    reportProdRaw,
  );
  // 异常追溯分析
  const reportImpactFactors = useMemo(() => {
    if (!reportEnergy) return [];
    return analyzeImpactFactors({
      hotSpotTemp: reportHotSpot?.value || 495,
      alarmCount: reportAlarms.filter((a) => !a.acknowledged).length,
      energy: reportEnergy,
      avgOutput: avgOutputAll,
      avgEnergy: avgEnergyAll,
      shiftEnergy: reportShiftData.shifts,
    });
  }, [reportEnergy, reportHotSpot, reportAlarms, avgOutputAll, avgEnergyAll, reportShiftData]);

  const reportMaxTank = Math.max(...reportTanks.map((t) => t.level));
  const reportAvgTank = reportTanks.reduce((s, t) => s + t.level, 0) / reportTanks.length;

  // 真实处理导出
  const handleExportReport = () => {
    if (!reportEnergy) return;
    exportDailyReport({
      date: reportDate,
      output: reportShiftData.totalOutput,
      outputTrend: reportOutputTrend,
      hotSpotTemp: reportHotSpot?.value || 495,
      avgTankLevel: reportAvgTank,
      maxTankLevel: reportMaxTank,
      energyTotal: reportEnergy.total,
      energyCoal: reportEnergy.coal,
      energyPower: reportEnergy.power,
      energySteam: reportEnergy.steam,
      energyWater: reportEnergy.water,
      temps: reportTemps.map((t) => ({ name: t.name, value: t.value, unit: t.unit, status: t.status })),
      tanks: reportTanks.map((t) => ({ name: t.name, level: t.level, temperature: t.temperature, pressure: t.pressure, status: t.status })),
      shifts: reportShiftData.shifts.map((s) => ({
        shift: s.shift, output: s.output, target: s.target,
        achievement: s.achievement, contribution: s.contribution,
        energyTotal: s.energyTotal, energyLevel: getEnergyLevelLabel(s.energyLevel),
      })),
      shiftTotalOutput: reportShiftData.totalOutput,
      alarms: reportAlarms.map((a) => ({ equipment: a.equipment, message: a.message, level: a.level, time: a.time, acknowledged: a.acknowledged })),
      evaluation: reportEvaluation,
      efficiencyTag: getEfficiencyLabel(reportTag),
    });
  };

  const minReportDate = getDateDaysAgo(13);
  const navigateReportDate = (delta: number) => {
    const d = new Date(reportDate);
    d.setDate(d.getDate() + delta);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const newStr = `${y}-${m}-${dd}`;
    if (newStr >= minReportDate && newStr <= getTodayLocalStr()) {
      setReportDate(newStr);
    }
  };

  // 14天历史日报列表数据
  const reportList = useMemo(() => {
    return energyData.map((e) => {
      const shifts = getDateShiftEnergy(productionData, energyData, e.fullDate);
      const temps = getHistoricalTemps(e.fullDate, synthesisTempParams);
      const hs = temps.find((p) => p.id === 'sy-t5');
      const tag = getEfficiencyTag(e, avgOutputAll, avgEnergyAll);
      const alarmsCount = e.fullDate === getTodayLocalStr()
        ? liveAlarms.filter((a) => !a.acknowledged).length
        : Math.floor(dRand(e.fullDate + '_alarm', 0) * 4);
      return { fullDate: e.fullDate, shortDate: e.date, energy: e, shifts, hotSpot: hs?.value || 495, tag, alarmsCount };
    }).reverse();
  }, [energyData, productionData, synthesisTempParams, avgOutputAll, avgEnergyAll, liveAlarms]);

  const todayStr = getTodayLocalStr().slice(5).replace('-', '/');
  const outputTrend = useMemo(() => generateTimeSeries(30, 16.5, 2), []);
  const tempTrend = useMemo(() => generateTimeSeries(30, 490, 15), []);
  const pressureTrend = useMemo(() => generateTimeSeries(30, 28.5, 0.8), []);
  const gasPieData = [
    { name: 'H₂', value: halfWaterGas.h2 },
    { name: 'N₂', value: halfWaterGas.n2 },
    { name: 'CO', value: halfWaterGas.co },
    { name: 'CO₂', value: halfWaterGas.co2 },
    { name: '其他', value: (halfWaterGas.ch4 || 0) + (halfWaterGas.ar || 0) },
  ];

  return (
    <Layout title="总控仪表盘">
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          <MetricCard
            label="今日合成氨产量"
            value={todayTotalOutput}
            unit="吨"
            decimals={1}
            icon={<Factory size={20} />}
            trend={todayVsYesterdayOutput}
            trendLabel="较昨日"
            color="text-primary-400"
          />
          <MetricCard
            label="合成塔热点温度"
            value={hotSpotTempBase?.value || 0}
            unit="℃"
            decimals={0}
            icon={<Thermometer size={20} />}
            color="text-alarm-warning"
          />
          <MetricCard
            label="合成系统压力"
            value={synthPressure?.value || 0}
            unit="MPa"
            decimals={2}
            icon={<Gauge size={20} />}
            color="text-industrial-100"
          />
          <MetricCard
            label="吨氨综合能耗"
            value={todayEnergy?.total || 0}
            unit="GJ/t"
            decimals={2}
            icon={<Zap size={20} />}
            trend={-1.8}
            trendLabel="较上周"
            color="text-alarm-success"
          />
          <div
            className="col-span-2 md:col-span-1 card-base rounded-lg p-4 cursor-pointer hover:border-primary-500/50 transition-all group"
            onClick={() => { setReportDate(getTodayLocalStr()); setReportView('list'); setShowDailyReport(true); }}
          >
            <div className="flex items-center justify-between h-full">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center text-white shadow-lg shadow-primary-500/20">
                  <FileText size={20} />
                </div>
                <div>
                  <div className="text-xs text-dark-400">班组运行档案</div>
                  <div className="font-display font-bold text-white">{todayStr}</div>
                </div>
              </div>
              <div className="text-dark-400 group-hover:text-primary-400 transition-colors">
                <X size={18} className="rotate-45" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card title="产量趋势" icon={<Activity size={16} />} extra="近30分钟" className="lg:col-span-1">
            <LineChart data={outputTrend} title="液氨流量" unit=" t/h" color="#00d4aa" height={180} />
          </Card>
          <Card title="合成塔温度" icon={<Thermometer size={16} />} extra="热点温度趋势" className="lg:col-span-1">
            <LineChart data={tempTrend} title="温度" unit=" ℃" color="#ffa726" height={180} />
          </Card>
          <Card title="半水煤气成分" icon={<Wind size={16} />} className="lg:col-span-1">
            <PieChart data={gasPieData} height={180} />
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card title="模块导航" icon={<Factory size={16} />} extra="点击进入各工段" className="lg:col-span-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <ModuleCard path="/raw-gas" name="原料气制备" icon={<Flame size={22} />} description="半水煤气制备、气化炉监控" metric={{ label: '煤气产量', value: '52,800 m³/h' }} />
              <ModuleCard path="/shift-decarb" name="变换脱碳" icon={<Wind size={22} />} description="CO变换、变换气脱碳工艺" metric={{ label: 'CO转化率', value: '92.0%' }} />
              <ModuleCard path="/refining" name="气体精制" icon={<Droplets size={22} />} description="铜洗精制、微量气体检测" metric={{ label: '微量CO+CO₂', value: '18 ppm', color: 'text-alarm-success' }} />
              <ModuleCard path="/synthesis" name="氨合成" icon={<Cog size={22} />} description="合成塔温度压力控制" metric={{ label: '热点温度', value: `${hotSpotTempBase?.value || 0} ℃`, color: 'text-alarm-warning' }} />
              <ModuleCard path="/separation" name="氨冷分离" icon={<ThermometerSun size={22} />} description="氨冷分离、储罐液位管理" metric={{ label: '液氨流量', value: `${formatNumber(nh3Flow?.value || 0, 1)} t/h` }} />
              <ModuleCard path="/production" name="产量统计" icon={<BarChart3 size={22} />} description="班产/日产/月产统计分析" metric={{ label: '今日产量', value: `${formatNumber(todayTotalOutput, 0)} 吨` }} />
              <ModuleCard path="/energy" name="能耗分析" icon={<Gauge size={22} />} description="吨氨能耗分项分析" metric={{ label: '综合能耗', value: `${todayEnergy?.total || 0} GJ/t`, color: 'text-alarm-success' }} />
            </div>
          </Card>

          <Card title="实时告警" icon={<AlertTriangle size={16} />} extra={`${liveAlarms.filter((a) => !a.acknowledged).length} 条未处理`}>
            <div className="space-y-2 max-h-[340px] overflow-y-auto">
              {liveAlarms.length === 0 ? (
                <div className="flex flex-col items-center py-8 text-dark-400"><CheckCircle size={32} className="mb-2 text-alarm-success" /><span className="text-sm">暂无告警信息</span></div>
              ) : (
                liveAlarms.map((alarm) => (
                  <div key={alarm.id} className={`p-3 rounded border transition-colors cursor-pointer ${
                    alarm.acknowledged ? 'bg-dark-800 border-dark-600 opacity-60' :
                    alarm.level === 'alarm' ? 'bg-alarm-danger/10 border-alarm-danger/30 hover:bg-alarm-danger/15' :
                    'bg-alarm-warning/10 border-alarm-warning/30 hover:bg-alarm-warning/15'
                  }`} onClick={() => !alarm.acknowledged && acknowledgeAlarm(alarm.id)}>
                    <div className="flex items-start gap-2">
                      <span className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${alarm.level === 'alarm' ? 'bg-alarm-danger animate-pulse' : 'bg-alarm-warning'}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-sm font-medium text-white">{alarm.equipment}</span>
                          {alarm.acknowledged && <span className="text-[10px] px-1.5 py-0.5 rounded bg-dark-600 text-dark-300">已确认</span>}
                        </div>
                        <div className="text-xs text-dark-300">{alarm.message}</div>
                        <div className="text-[11px] text-dark-400 mt-1 font-mono">{alarm.time}</div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>

      {showDailyReport && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="card-base rounded-xl w-full max-w-5xl max-h-[90vh] overflow-auto">
            <div className="sticky top-0 bg-dark-800/95 backdrop-blur px-6 py-4 border-b border-dark-600 z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center text-white shadow-lg shadow-primary-500/20">
                    <FileText size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-display font-bold text-white">合成氨车间 · 班组运行档案</h3>
                    <div className="text-xs text-dark-400">近14天日报，含产量、能耗、温度、告警和运行评价</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 bg-dark-700/50 rounded-lg p-1">
                    <button onClick={() => setReportView('list')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      reportView === 'list' ? 'bg-primary-600 text-white' : 'text-dark-300 hover:text-white hover:bg-dark-600'
                    }`}><List size={14} /> 档案列表</button>
                    <button onClick={() => setReportView('detail')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      reportView === 'detail' ? 'bg-primary-600 text-white' : 'text-dark-300 hover:text-white hover:bg-dark-600'
                    }`}><Calendar size={14} /> 单日详情</button>
                  </div>
                  <button onClick={() => setShowDailyReport(false)} className="w-8 h-8 rounded-lg bg-dark-700 hover:bg-dark-600 flex items-center justify-center text-dark-300 hover:text-white transition-colors">
                    <X size={18} />
                  </button>
                </div>
              </div>
            </div>

            {reportView === 'list' ? (
              <div className="p-6">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-dark-400 text-xs border-b border-dark-600">
                        <th className="text-left py-3 px-3 font-medium">日期</th>
                        <th className="text-center py-3 px-3 font-medium">运行状态</th>
                        <th className="text-right py-3 px-3 font-medium">日产量(吨)</th>
                        <th className="text-right py-3 px-3 font-medium">班均产量</th>
                        <th className="text-right py-3 px-3 font-medium">热点温度</th>
                        <th className="text-right py-3 px-3 font-medium">综合能耗</th>
                        <th className="text-right py-3 px-3 font-medium">未处理告警</th>
                        <th className="text-center py-3 px-3 font-medium">操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportList.map((row) => (
                        <tr key={row.fullDate} className={`border-b border-dark-600/50 hover:bg-dark-600/30 cursor-pointer ${
                          reportDate === row.fullDate ? 'bg-primary-500/10' : ''
                        }`} onClick={() => { setReportDate(row.fullDate); setReportView('detail'); }}>
                          <td className="py-3 px-3 text-dark-200 font-mono">
                            <div>{row.shortDate}</div>
                            <div className="text-[10px] text-dark-500">{row.fullDate}</div>
                          </td>
                          <td className="py-3 px-3 text-center">
                            <span className={`text-xs px-2 py-0.5 rounded border ${getEfficiencyBg(row.tag)} ${getEfficiencyColor(row.tag)}`}>
                              {getEfficiencyLabel(row.tag)}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right data-value text-primary-400">{row.shifts.totalOutput.toFixed(1)}</td>
                          <td className="py-3 px-3 text-right text-white font-mono">
                            {row.shifts.shifts.length > 0 ? (row.shifts.totalOutput / row.shifts.shifts.length).toFixed(1) : '--'}
                          </td>
                          <td className={`py-3 px-3 text-right font-mono ${row.hotSpot > 510 ? 'text-alarm-danger' : row.hotSpot > 495 ? 'text-alarm-warning' : 'text-white'}`}>
                            {row.hotSpot.toFixed(0)}℃
                          </td>
                          <td className="py-3 px-3 text-right data-value text-alarm-success">{row.energy.total.toFixed(2)}</td>
                          <td className="py-3 px-3 text-right">
                            <span className={`text-xs ${row.alarmsCount > 0 ? 'text-alarm-danger' : 'text-alarm-success'}`}>
                              {row.alarmsCount}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-center">
                            <span className="text-xs px-2 py-0.5 rounded bg-primary-600/20 text-primary-400">查看</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="p-6 space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-dark-600">
                  <div className="flex items-center gap-2">
                    <button onClick={() => navigateReportDate(-1)} disabled={reportDate <= minReportDate}
                      className="w-8 h-8 rounded bg-dark-700 hover:bg-dark-600 flex items-center justify-center text-dark-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                      <ChevronLeft size={16} />
                    </button>
                    <input type="date" value={reportDate} min={minReportDate} max={getTodayLocalStr()}
                      onChange={(e) => setReportDate(e.target.value)}
                      className="bg-dark-700 border border-dark-600 rounded px-3 py-1.5 text-sm text-white focus:outline-none focus:border-primary-500" />
                    <button onClick={() => navigateReportDate(1)} disabled={reportDate >= getTodayLocalStr()}
                      className="w-8 h-8 rounded bg-dark-700 hover:bg-dark-600 flex items-center justify-center text-dark-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                      <ChevronRight size={16} />
                    </button>
                    <span className={`ml-2 text-xs px-2 py-0.5 rounded border ${getEfficiencyBg(reportTag)} ${getEfficiencyColor(reportTag)}`}>
                      {getEfficiencyLabel(reportTag)}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setReportView('list')} className="px-3 py-1.5 rounded-lg bg-dark-700 hover:bg-dark-600 text-dark-200 text-xs transition-colors">
                      返回列表
                    </button>
                    <button onClick={handleExportReport} className="px-3 py-1.5 rounded-lg btn-primary text-xs font-medium flex items-center gap-1">
                      <Download size={12} /> 导出日报（含评价）
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 rounded-lg bg-dark-700/50 border border-dark-600">
                    <div className="text-xs text-dark-400 mb-1">当日合成氨产量</div>
                    <div className="text-2xl font-display font-bold text-primary-400">{formatNumber(reportShiftData.totalOutput, 1)} <span className="text-sm font-normal text-dark-400">吨</span></div>
                    <div className={`text-xs mt-1 ${reportOutputTrend >= 0 ? 'text-alarm-danger' : 'text-alarm-success'}`}>
                      {reportOutputTrend >= 0 ? '↑' : '↓'} {Math.abs(reportOutputTrend).toFixed(1)}% 较前日
                    </div>
                  </div>
                  <div className="p-4 rounded-lg bg-dark-700/50 border border-dark-600">
                    <div className="text-xs text-dark-400 mb-1">合成塔热点温度</div>
                    <div className="text-2xl font-display font-bold text-alarm-warning">{(reportHotSpot?.value || 0).toFixed(0)} <span className="text-sm font-normal text-dark-400">℃</span></div>
                    <div className="text-xs mt-1 text-dark-400">正常范围: 470 ~ 520 ℃</div>
                  </div>
                  <div className="p-4 rounded-lg bg-dark-700/50 border border-dark-600">
                    <div className="text-xs text-dark-400 mb-1">液氨储罐平均液位</div>
                    <div className="text-2xl font-display font-bold text-industrial-100">{reportAvgTank.toFixed(1)} <span className="text-sm font-normal text-dark-400">%</span></div>
                    <div className="text-xs mt-1 text-dark-400">最高: {reportMaxTank.toFixed(1)}%</div>
                  </div>
                  <div className="p-4 rounded-lg bg-dark-700/50 border border-dark-600">
                    <div className="text-xs text-dark-400 mb-1">吨氨综合能耗</div>
                    <div className="text-2xl font-display font-bold text-alarm-success">{reportEnergy?.total.toFixed(2) || '--'} <span className="text-sm font-normal text-dark-400">GJ/t</span></div>
                    <div className="text-xs mt-1 text-dark-400">
                      {reportEnergy && reportPrevEnergy ? `${(((reportEnergy.total - reportPrevEnergy.total) / reportPrevEnergy.total) * 100).toFixed(1)}% 较前日` : ''}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-dark-700/30 border border-dark-600">
                    <h4 className="text-sm font-medium text-white mb-3 flex items-center gap-2"><Thermometer size={14} className="text-alarm-warning" /> 合成塔温度监控</h4>
                    <div className="space-y-2">
                      {reportTemps.map((p) => (
                        <div key={p.id} className="flex items-center justify-between">
                          <span className="text-sm text-dark-300">{p.name}</span>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-white">{p.value}{p.unit}</span>
                            <span className={`text-xs px-1.5 py-0.5 rounded ${
                              p.status === 'normal' ? 'bg-alarm-success/20 text-alarm-success' :
                              p.status === 'warning' ? 'bg-alarm-warning/20 text-alarm-warning' :
                              'bg-alarm-danger/20 text-alarm-danger'
                            }`}>{p.status === 'normal' ? '正常' : p.status === 'warning' ? '预警' : '告警'}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="p-4 rounded-lg bg-dark-700/30 border border-dark-600">
                    <h4 className="text-sm font-medium text-white mb-3 flex items-center gap-2"><Droplets size={14} className="text-industrial-100" /> 液氨储罐液位</h4>
                    <div className="grid grid-cols-3 gap-3">
                      {reportTanks.map((t) => (
                        <div key={t.id} className="flex flex-col items-center">
                          <TankLevelComp tank={t} showDetails={false} />
                          <div className="text-xs text-dark-400 mt-2">{t.name.replace('液氨', '')}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-dark-700/30 border border-dark-600">
                  <h4 className="text-sm font-medium text-white mb-3 flex items-center gap-2"><BarChart3 size={14} className="text-primary-400" /> 班次产量与能耗表现</h4>
                  {reportShiftData.shifts.length === 0 ? (
                    <div className="text-center py-4 text-dark-400 text-sm">暂无班次数据</div>
                  ) : (
                    <div className="grid grid-cols-3 gap-3">
                      {reportShiftData.shifts.map((s, i) => (
                        <div key={i} className={`p-3 rounded-lg border ${
                          s.shift === '早班' ? 'bg-primary-600/5 border-primary-500/20' :
                          s.shift === '中班' ? 'bg-industrial-100/5 border-industrial-500/20' :
                          'bg-alarm-warning/5 border-alarm-warning/20'
                        }`}>
                          <div className="flex items-center justify-between mb-2">
                            <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                              s.shift === '早班' ? 'bg-primary-600/20 text-primary-400' :
                              s.shift === '中班' ? 'bg-industrial-100/20 text-industrial-100' :
                              'bg-alarm-warning/20 text-alarm-warning'
                            }`}>{s.shift}</span>
                            <span className={`text-xs font-bold ${s.achievement >= 95 ? 'text-alarm-success' : s.achievement >= 85 ? 'text-alarm-warning' : 'text-alarm-danger'}`}>
                              {s.achievement.toFixed(0)}%
                            </span>
                          </div>
                          <div className="text-lg font-display font-bold text-white">{s.output.toFixed(1)} <span className="text-xs font-normal text-dark-400">/ {s.target.toFixed(0)}t</span></div>
                          <div className="mt-2 space-y-1 text-[11px]">
                            <div className="flex justify-between"><span className="text-dark-400">贡献占比</span><span className="text-white font-mono">{s.contribution.toFixed(1)}%</span></div>
                            <div className="flex justify-between">
                              <span className="text-dark-400">吨氨能耗</span>
                              <span className={`font-mono ${getEnergyLevelColor(s.energyLevel)}`}>{s.energyTotal.toFixed(2)} GJ/t · {getEnergyLevelLabel(s.energyLevel)}</span>
                            </div>
                            <div className="flex justify-between"><span className="text-dark-400">煤/电/汽/水</span><span className="text-white font-mono text-[10px]">{s.energyCoal.toFixed(2)}/{s.energyPower}/{s.energySteam.toFixed(1)}/{s.energyWater.toFixed(0)}</span></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="mt-3 pt-3 border-t border-dark-600/50 flex justify-between text-xs text-dark-400">
                    <span>合计产量：<span className="text-primary-400 font-mono font-bold">{reportShiftData.totalOutput.toFixed(1)} 吨</span></span>
                    <span>与当日总产量：<span className="text-alarm-success font-mono">完全对齐 ✓</span></span>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-dark-700/30 border border-dark-600">
                    <h4 className="text-sm font-medium text-white mb-3 flex items-center gap-2"><Zap size={14} className="text-primary-400" /> 能耗分项</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between"><span className="text-sm text-dark-300">原料煤</span><span className="font-mono text-alarm-warning">{reportEnergy?.coal.toFixed(3) || '--'} t/t</span></div>
                      <div className="flex items-center justify-between"><span className="text-sm text-dark-300">电力</span><span className="font-mono text-primary-400">{reportEnergy?.power.toFixed(0) || '--'} kWh/t</span></div>
                      <div className="flex items-center justify-between"><span className="text-sm text-dark-300">蒸汽</span><span className="font-mono text-alarm-danger">{reportEnergy?.steam.toFixed(2) || '--'} t/t</span></div>
                      <div className="flex items-center justify-between"><span className="text-sm text-dark-300">循环水</span><span className="font-mono text-industrial-100">{reportEnergy?.water.toFixed(1) || '--'} m³/t</span></div>
                    </div>
                  </div>
                  <div className="p-4 rounded-lg bg-dark-700/30 border border-dark-600">
                    <h4 className="text-sm font-medium text-white mb-3 flex items-center gap-2"><AlertTriangle size={14} className="text-alarm-warning" /> 当日告警记录</h4>
                    <div className="space-y-2 max-h-[180px] overflow-y-auto">
                      {reportAlarms.length === 0 ? (
                        <div className="text-center py-4 text-dark-400 text-sm"><CheckCircle size={20} className="mx-auto mb-1 text-alarm-success" /> 无未处理告警</div>
                      ) : (
                        reportAlarms.map((a) => (
                          <div key={a.id} className="flex items-start gap-2 p-2 rounded bg-dark-800/50">
                            <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${a.level === 'alarm' ? 'bg-alarm-danger animate-pulse' : 'bg-alarm-warning'}`} />
                            <div className="min-w-0 flex-1">
                              <div className="text-sm font-medium text-white">{a.equipment}</div>
                              <div className="text-xs text-dark-300 truncate">{a.message}</div>
                              <div className="text-[10px] text-dark-500 font-mono">{a.time}</div>
                            </div>
                            {a.acknowledged && <span className="text-[10px] px-1.5 py-0.5 rounded bg-dark-600 text-dark-300 h-fit">已确认</span>}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-industrial-100/5 border border-industrial-500/20">
                  <h4 className="text-sm font-medium text-white mb-3 flex items-center gap-2"><Layers size={14} className="text-industrial-100" /> 异常追溯 · 影响程度排序</h4>
                  {reportImpactFactors.length === 0 ? (
                    <div className="text-sm text-dark-300 py-4 text-center">当日运行平稳，未检测到明显异常因素 ✅</div>
                  ) : (
                    <div className="space-y-2">
                      {reportImpactFactors.map((f, i) => (
                        <div key={f.key} className={`p-3 rounded-lg border ${getFactorSeverityBg(f.severity)}`}>
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-mono px-1.5 py-0.5 rounded bg-dark-800/60 text-dark-300">#{i + 1}</span>
                                <span className={`text-xs px-2 py-0.5 rounded border border-current/30 ${getFactorSeverityColor(f.severity)}`}>{f.category}</span>
                                <span className={`text-sm font-semibold ${getFactorSeverityColor(f.severity)}`}>{f.name}</span>
                              </div>
                              <div className="text-xs text-dark-300">{f.description}</div>
                              <div className="text-[11px] mt-1 text-primary-400">💡 {f.suggestion}</div>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <div className="text-[10px] text-dark-500">影响度</div>
                              <div className={`text-lg font-display font-bold ${getFactorSeverityColor(f.severity)}`}>
                                {f.impact.toFixed(0)}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="p-4 rounded-lg bg-primary-500/5 border border-primary-500/20">
                  <h4 className="text-sm font-medium text-white mb-3 flex items-center gap-2"><ClipboardCheck size={14} className="text-primary-400" /> 自动运行评价</h4>
                  <p className="text-sm text-dark-300 leading-relaxed mb-3">{reportEvaluation.summary}</p>
                  {reportEvaluation.anomalies.length > 0 && (
                    <div className="mb-3">
                      <div className="text-xs font-medium text-alarm-danger mb-1.5">主要异常：</div>
                      <ul className="text-xs text-dark-300 space-y-0.5 pl-4 list-disc">
                        {reportEvaluation.anomalies.map((a, i) => <li key={i}>{a}</li>)}
                      </ul>
                    </div>
                  )}
                  <div className="mb-3">
                    <div className="text-xs font-medium text-primary-400 mb-1.5">优化建议：</div>
                    <ul className="text-xs text-dark-300 space-y-0.5 pl-4 list-disc">
                      {reportEvaluation.suggestions.map((s, i) => <li key={i}>{s}</li>)}
                    </ul>
                  </div>
                  <div className="pt-3 border-t border-primary-500/10">
                    <div className="text-xs font-medium text-alarm-warning mb-1">下一班注意事项：</div>
                    <p className="text-xs text-dark-300">{reportEvaluation.nextShiftNote}</p>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button onClick={() => setShowDailyReport(false)} className="px-4 py-2 rounded-lg bg-dark-700 hover:bg-dark-600 text-dark-200 text-sm transition-colors">关闭</button>
                  <button onClick={handleExportReport} className="px-4 py-2 rounded-lg btn-primary text-sm font-medium flex items-center gap-1.5">
                    <Download size={14} /> 导出日报（含评价）
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </Layout>
  );
}
