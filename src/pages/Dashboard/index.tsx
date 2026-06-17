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
  getTodayTotalOutput,
  getTodayEnergy,
  getEnergyForDate,
  generateDailyEvaluation,
  getEfficiencyTag,
  getEfficiencyLabel,
  getEfficiencyColor,
  getEfficiencyBg,
} from '@/utils/helpers';

export default function Dashboard() {
  const [showDailyReport, setShowDailyReport] = useState(false);
  const [reportDate, setReportDate] = useState(getTodayLocalStr());

  const {
    synthesisPressureParams,
    synthesisTempParams,
    separationParams,
    energyData,
    productionData,
    alarms,
    halfWaterGas,
    tankLevels,
    acknowledgeAlarm,
  } = useAppStore();

  const hotSpotTemp = synthesisTempParams.find((p) => p.id === 'sy-t5');
  const synthPressure = synthesisPressureParams.find((p) => p.id === 'sy-p1');
  const nh3Flow = separationParams.find((p) => p.id === 'sp-3');
  const todayOutput = getTodayTotalOutput(productionData);
  const todayEnergy = getTodayEnergy(energyData);
  const avgEnergy = todayEnergy?.total || 0;

  const unackedAlarms = alarms.filter((a) => !a.acknowledged);
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

  const maxTankLevel = Math.max(...tankLevels.map((t) => t.level));
  const avgTankLevel = tankLevels.reduce((s, t) => s + t.level, 0) / tankLevels.length;

  const reportEnergy = getEnergyForDate(energyData, reportDate);
  const reportShiftData = productionData.filter((p) => p.fullDate === reportDate);
  const reportTotalOutput = reportShiftData.reduce((s, p) => s + p.output, 0);
  const reportPrevEnergy = energyData[energyData.findIndex((e) => e.fullDate === reportDate) + 1];
  const reportPrevOutput = reportPrevEnergy ? reportPrevEnergy.output : 0;
  const reportOutputTrend = reportPrevOutput > 0 ? (((reportTotalOutput - reportPrevOutput) / reportPrevOutput) * 100) : 0;

  const avgOutputAll = energyData.reduce((s, d) => s + d.output, 0) / Math.max(1, energyData.length);
  const avgEnergyAll = energyData.reduce((s, d) => s + d.total, 0) / Math.max(1, energyData.length);
  const reportTag = reportEnergy ? getEfficiencyTag(reportEnergy, avgOutputAll, avgEnergyAll) : 'normal';
  const reportEvaluation = generateDailyEvaluation(reportEnergy, reportTotalOutput, avgOutputAll, avgEnergyAll, hotSpotTemp?.value || 495, unackedAlarms.length);

  const minReportDate = getDateDaysAgo(13);
  const navigateReportDate = (delta: number) => {
    const d = new Date(reportDate);
    d.setDate(d.getDate() + delta);
    const newStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    if (newStr >= minReportDate && newStr <= getTodayLocalStr()) {
      setReportDate(newStr);
    }
  };

  return (
    <Layout title="总控仪表盘">
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          <MetricCard
            label="今日合成氨产量"
            value={todayOutput}
            unit="吨"
            decimals={1}
            icon={<Factory size={20} />}
            trend={0}
            trendLabel="较昨日"
            color="text-primary-400"
          />
          <MetricCard
            label="合成塔热点温度"
            value={hotSpotTemp?.value || 0}
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
            value={avgEnergy}
            unit="GJ/t"
            decimals={2}
            icon={<Zap size={20} />}
            trend={-1.8}
            trendLabel="较上周"
            color="text-alarm-success"
          />
          <div
            className="col-span-2 md:col-span-1 card-base rounded-lg p-4 cursor-pointer hover:border-primary-500/50 transition-all group"
            onClick={() => { setReportDate(getTodayLocalStr()); setShowDailyReport(true); }}
          >
            <div className="flex items-center justify-between h-full">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center text-white shadow-lg shadow-primary-500/20">
                  <FileText size={20} />
                </div>
                <div>
                  <div className="text-xs text-dark-400">车间日报</div>
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
              <ModuleCard path="/synthesis" name="氨合成" icon={<Cog size={22} />} description="合成塔温度压力控制" metric={{ label: '热点温度', value: `${hotSpotTemp?.value || 0} ℃`, color: 'text-alarm-warning' }} />
              <ModuleCard path="/separation" name="氨冷分离" icon={<ThermometerSun size={22} />} description="氨冷分离、储罐液位管理" metric={{ label: '液氨流量', value: `${formatNumber(nh3Flow?.value || 0, 1)} t/h` }} />
              <ModuleCard path="/production" name="产量统计" icon={<BarChart3 size={22} />} description="班产/日产/月产统计分析" metric={{ label: '今日产量', value: `${formatNumber(todayOutput, 0)} 吨` }} />
              <ModuleCard path="/energy" name="能耗分析" icon={<Gauge size={22} />} description="吨氨能耗分项分析" metric={{ label: '综合能耗', value: `${avgEnergy} GJ/t`, color: 'text-alarm-success' }} />
            </div>
          </Card>

          <Card title="实时告警" icon={<AlertTriangle size={16} />} extra={`${unackedAlarms.length} 条未处理`}>
            <div className="space-y-2 max-h-[340px] overflow-y-auto">
              {alarms.length === 0 ? (
                <div className="flex flex-col items-center py-8 text-dark-400">
                  <CheckCircle size={32} className="mb-2 text-alarm-success" />
                  <span className="text-sm">暂无告警信息</span>
                </div>
              ) : (
                alarms.map((alarm) => (
                  <div
                    key={alarm.id}
                    className={`p-3 rounded border transition-colors cursor-pointer ${
                      alarm.acknowledged ? 'bg-dark-800 border-dark-600 opacity-60' :
                      alarm.level === 'alarm' ? 'bg-alarm-danger/10 border-alarm-danger/30 hover:bg-alarm-danger/15' :
                      'bg-alarm-warning/10 border-alarm-warning/30 hover:bg-alarm-warning/15'
                    }`}
                    onClick={() => !alarm.acknowledged && acknowledgeAlarm(alarm.id)}
                  >
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
          <div className="card-base rounded-xl w-full max-w-4xl max-h-[90vh] overflow-auto">
            <div className="sticky top-0 bg-dark-800/95 backdrop-blur px-6 py-4 border-b border-dark-600 z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center text-white shadow-lg shadow-primary-500/20">
                    <FileText size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-display font-bold text-white">合成氨车间生产日报</h3>
                    <div className="flex items-center gap-3">
                      <input
                        type="date"
                        value={reportDate}
                        min={minReportDate}
                        max={getTodayLocalStr()}
                        onChange={(e) => setReportDate(e.target.value)}
                        className="bg-dark-700 border border-dark-600 rounded px-2 py-0.5 text-xs text-white focus:outline-none focus:border-primary-500"
                      />
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => navigateReportDate(-1)}
                          disabled={reportDate <= minReportDate}
                          className="w-7 h-7 rounded bg-dark-700 hover:bg-dark-600 flex items-center justify-center text-dark-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                          <ChevronLeft size={14} />
                        </button>
                        <button
                          onClick={() => navigateReportDate(1)}
                          disabled={reportDate >= getTodayLocalStr()}
                          className="w-7 h-7 rounded bg-dark-700 hover:bg-dark-600 flex items-center justify-center text-dark-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                          <ChevronRight size={14} />
                        </button>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded border ${getEfficiencyBg(reportTag)} ${getEfficiencyColor(reportTag)}`}>
                        {getEfficiencyLabel(reportTag)}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setShowDailyReport(false)}
                  className="w-8 h-8 rounded-lg bg-dark-700 hover:bg-dark-600 flex items-center justify-center text-dark-300 hover:text-white transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-lg bg-dark-700/50 border border-dark-600">
                  <div className="text-xs text-dark-400 mb-1">{reportDate === getTodayLocalStr() ? '今日' : reportDate.slice(5).replace('-', '/')}合成氨产量</div>
                  <div className="text-2xl font-display font-bold text-primary-400">
                    {formatNumber(reportTotalOutput, 1)} <span className="text-sm font-normal text-dark-400">吨</span>
                  </div>
                  <div className={`text-xs mt-1 ${reportOutputTrend >= 0 ? 'text-alarm-danger' : 'text-alarm-success'}`}>
                    {reportOutputTrend >= 0 ? '↑' : '↓'} {Math.abs(reportOutputTrend).toFixed(1)}% 较前日
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-dark-700/50 border border-dark-600">
                  <div className="text-xs text-dark-400 mb-1">合成塔热点温度</div>
                  <div className="text-2xl font-display font-bold text-alarm-warning">
                    {hotSpotTemp?.value?.toFixed(0)} <span className="text-sm font-normal text-dark-400">℃</span>
                  </div>
                  <div className="text-xs mt-1 text-dark-400">正常范围: 470 ~ 520 ℃</div>
                </div>
                <div className="p-4 rounded-lg bg-dark-700/50 border border-dark-600">
                  <div className="text-xs text-dark-400 mb-1">液氨储罐平均液位</div>
                  <div className="text-2xl font-display font-bold text-industrial-100">
                    {avgTankLevel.toFixed(1)} <span className="text-sm font-normal text-dark-400">%</span>
                  </div>
                  <div className="text-xs mt-1 text-dark-400">最高: {maxTankLevel.toFixed(1)}%</div>
                </div>
                <div className="p-4 rounded-lg bg-dark-700/50 border border-dark-600">
                  <div className="text-xs text-dark-400 mb-1">吨氨综合能耗</div>
                  <div className="text-2xl font-display font-bold text-alarm-success">
                    {reportEnergy?.total.toFixed(2) || '--'} <span className="text-sm font-normal text-dark-400">GJ/t</span>
                  </div>
                  <div className="text-xs mt-1 text-dark-400">
                    {reportEnergy && reportPrevEnergy ? `${(((reportEnergy.total - reportPrevEnergy.total) / reportPrevEnergy.total) * 100).toFixed(1)}% 较前日` : ''}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-dark-700/30 border border-dark-600">
                  <h4 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                    <Thermometer size={14} className="text-alarm-warning" />
                    合成塔温度监控
                  </h4>
                  <div className="space-y-2">
                    {synthesisTempParams.map((p) => (
                      <div key={p.id} className="flex items-center justify-between">
                        <span className="text-sm text-dark-300">{p.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-white">{p.value}{p.unit}</span>
                          <span className={`text-xs px-1.5 py-0.5 rounded ${
                            p.status === 'normal' ? 'bg-alarm-success/20 text-alarm-success' :
                            p.status === 'warning' ? 'bg-alarm-warning/20 text-alarm-warning' :
                            'bg-alarm-danger/20 text-alarm-danger'
                          }`}>
                            {p.status === 'normal' ? '正常' : p.status === 'warning' ? '预警' : '告警'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-dark-700/30 border border-dark-600">
                  <h4 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                    <Droplets size={14} className="text-industrial-100" />
                    液氨储罐液位
                  </h4>
                  <div className="grid grid-cols-3 gap-3">
                    {tankLevels.map((t) => (
                      <div key={t.id} className="flex flex-col items-center">
                        <TankLevelComp tank={t} showDetails={false} />
                        <div className="text-xs text-dark-400 mt-2">{t.name.replace('液氨', '')}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-dark-700/30 border border-dark-600">
                  <h4 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                    <Zap size={14} className="text-primary-400" />
                    {reportDate === getTodayLocalStr() ? '今日' : reportDate.slice(5).replace('-', '/')}能耗分项
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-dark-300">原料煤</span>
                      <span className="font-mono text-alarm-warning">{reportEnergy?.coal.toFixed(3) || '--'} t/t</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-dark-300">电力</span>
                      <span className="font-mono text-primary-400">{reportEnergy?.power.toFixed(0) || '--'} kWh/t</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-dark-300">蒸汽</span>
                      <span className="font-mono text-alarm-danger">{reportEnergy?.steam.toFixed(2) || '--'} t/t</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-dark-300">循环水</span>
                      <span className="font-mono text-industrial-100">{reportEnergy?.water.toFixed(1) || '--'} m³/t</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-dark-700/30 border border-dark-600">
                  <h4 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                    <AlertTriangle size={14} className="text-alarm-warning" />
                    主要告警
                  </h4>
                  <div className="space-y-2 max-h-[160px] overflow-y-auto">
                    {unackedAlarms.length === 0 ? (
                      <div className="text-center py-4 text-dark-400 text-sm">
                        <CheckCircle size={20} className="mx-auto mb-1 text-alarm-success" />
                        无未处理告警
                      </div>
                    ) : (
                      unackedAlarms.map((a) => (
                        <div key={a.id} className="flex items-start gap-2 p-2 rounded bg-dark-800/50">
                          <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${a.level === 'alarm' ? 'bg-alarm-danger animate-pulse' : 'bg-alarm-warning'}`} />
                          <div className="min-w-0">
                            <div className="text-sm font-medium text-white">{a.equipment}</div>
                            <div className="text-xs text-dark-300 truncate">{a.message}</div>
                            <div className="text-[10px] text-dark-500 font-mono">{a.time}</div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {reportShiftData.length > 0 && (
                <div className="p-4 rounded-lg bg-dark-700/30 border border-dark-600">
                  <h4 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                    <BarChart3 size={14} className="text-primary-400" />
                    班次产量明细
                  </h4>
                  <div className="grid grid-cols-3 gap-3">
                    {reportShiftData.map((s, i) => {
                      const rate = ((s.output / s.target) * 100).toFixed(1);
                      return (
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
                            <span className={`text-xs font-bold ${Number(rate) >= 95 ? 'text-alarm-success' : Number(rate) >= 85 ? 'text-alarm-warning' : 'text-alarm-danger'}`}>
                              {rate}%
                            </span>
                          </div>
                          <div className="text-lg font-display font-bold text-white">{s.output.toFixed(1)} <span className="text-xs font-normal text-dark-400">t / {s.target}t</span></div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="p-4 rounded-lg bg-primary-500/5 border border-primary-500/20">
                <h4 className="text-sm font-medium text-white mb-2 flex items-center gap-2">
                  <ClipboardCheck size={14} className="text-primary-400" />
                  运行评价
                </h4>
                <p className="text-sm text-dark-300 leading-relaxed">{reportEvaluation}</p>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button onClick={() => setShowDailyReport(false)} className="px-4 py-2 rounded-lg bg-dark-700 hover:bg-dark-600 text-dark-200 text-sm transition-colors">
                  关闭
                </button>
                <button className="px-4 py-2 rounded-lg btn-primary text-sm font-medium">
                  导出 PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
