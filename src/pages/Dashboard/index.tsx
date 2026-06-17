import { useMemo } from 'react';
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
} from 'lucide-react';
import Layout from '@/components/layout/Layout';
import MetricCard from '@/components/ui/MetricCard';
import Card from '@/components/ui/Card';
import ModuleCard from '@/components/ui/ModuleCard';
import LineChart from '@/components/charts/LineChart';
import PieChart from '@/components/charts/PieChart';
import { useAppStore } from '@/store/appStore';
import { generateTimeSeries } from '@/data/mockData';
import { formatNumber } from '@/utils/helpers';

export default function Dashboard() {
  const {
    synthesisPressureParams,
    synthesisTempParams,
    separationParams,
    energyData,
    productionData,
    alarms,
    halfWaterGas,
    acknowledgeAlarm,
  } = useAppStore();

  const hotSpotTemp = synthesisTempParams.find((p) => p.id === 'sy-t5');
  const synthPressure = synthesisPressureParams.find((p) => p.id === 'sy-p1');
  const nh3Flow = separationParams.find((p) => p.id === 'sp-3');
  const todayOutput = productionData.slice(0, 3).reduce((sum, p) => sum + p.output, 0);
  const avgEnergy = energyData.length > 0 ? energyData[energyData.length - 1].total : 0;

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

  const unackedAlarms = alarms.filter((a) => !a.acknowledged);

  return (
    <Layout title="总控仪表盘">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            label="今日合成氨产量"
            value={todayOutput}
            unit="吨"
            decimals={1}
            icon={<Factory size={20} />}
            trend={3.2}
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
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card
            title="产量趋势"
            icon={<Activity size={16} />}
            extra="近30分钟"
            className="lg:col-span-1"
          >
            <LineChart data={outputTrend} title="液氨流量" unit=" t/h" color="#00d4aa" height={180} />
          </Card>
          <Card
            title="合成塔温度"
            icon={<Thermometer size={16} />}
            extra="热点温度趋势"
            className="lg:col-span-1"
          >
            <LineChart data={tempTrend} title="温度" unit=" ℃" color="#ffa726" height={180} />
          </Card>
          <Card
            title="半水煤气成分"
            icon={<Wind size={16} />}
            className="lg:col-span-1"
          >
            <PieChart data={gasPieData} height={180} />
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card
            title="模块导航"
            icon={<Factory size={16} />}
            extra="点击进入各工段"
            className="lg:col-span-2"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <ModuleCard
                path="/raw-gas"
                name="原料气制备"
                icon={<Flame size={22} />}
                description="半水煤气制备、气化炉监控"
                metric={{ label: '煤气产量', value: '52,800 m³/h' }}
              />
              <ModuleCard
                path="/shift-decarb"
                name="变换脱碳"
                icon={<Wind size={22} />}
                description="CO变换、变换气脱碳工艺"
                metric={{ label: 'CO转化率', value: '92.0%' }}
              />
              <ModuleCard
                path="/refining"
                name="气体精制"
                icon={<Droplets size={22} />}
                description="铜洗精制、微量气体检测"
                metric={{ label: '微量CO+CO₂', value: '18 ppm', color: 'text-alarm-success' }}
              />
              <ModuleCard
                path="/synthesis"
                name="氨合成"
                icon={<Cog size={22} />}
                description="合成塔温度压力控制"
                metric={{ label: '热点温度', value: `${hotSpotTemp?.value || 0} ℃`, color: 'text-alarm-warning' }}
              />
              <ModuleCard
                path="/separation"
                name="氨冷分离"
                icon={<ThermometerSun size={22} />}
                description="氨冷分离、储罐液位管理"
                metric={{ label: '液氨流量', value: `${formatNumber(nh3Flow?.value || 0, 1)} t/h` }}
              />
              <ModuleCard
                path="/production"
                name="产量统计"
                icon={<BarChart3 size={22} />}
                description="班产/日产/月产统计分析"
                metric={{ label: '今日产量', value: `${formatNumber(todayOutput, 0)} 吨` }}
              />
              <ModuleCard
                path="/energy"
                name="能耗分析"
                icon={<Gauge size={22} />}
                description="吨氨能耗分项分析"
                metric={{ label: '综合能耗', value: `${avgEnergy} GJ/t`, color: 'text-alarm-success' }}
              />
            </div>
          </Card>

          <Card
            title="实时告警"
            icon={<AlertTriangle size={16} />}
            extra={`${unackedAlarms.length} 条未处理`}
          >
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
                      alarm.acknowledged
                        ? 'bg-dark-800 border-dark-600 opacity-60'
                        : alarm.level === 'alarm'
                        ? 'bg-alarm-danger/10 border-alarm-danger/30 hover:bg-alarm-danger/15'
                        : 'bg-alarm-warning/10 border-alarm-warning/30 hover:bg-alarm-warning/15'
                    }`}
                    onClick={() => !alarm.acknowledged && acknowledgeAlarm(alarm.id)}
                  >
                    <div className="flex items-start gap-2">
                      <span
                        className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${
                          alarm.level === 'alarm' ? 'bg-alarm-danger animate-pulse' : 'bg-alarm-warning'
                        }`}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-sm font-medium text-white">{alarm.equipment}</span>
                          {alarm.acknowledged && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-dark-600 text-dark-300">
                              已确认
                            </span>
                          )}
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
    </Layout>
  );
}
