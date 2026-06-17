import { useMemo } from 'react';
import { ThermometerSun, Activity, Wind, Droplet } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import Card from '@/components/ui/Card';
import ParamCard from '@/components/ui/ParamCard';
import TankLevel from '@/components/ui/TankLevel';
import LineChart from '@/components/charts/LineChart';
import { useAppStore } from '@/store/appStore';
import { generateTimeSeries, valves } from '@/data/mockData';
import { formatNumber } from '@/utils/helpers';

export default function Separation() {
  const { separationParams, tankLevels, gasManagementParams } = useAppStore();

  const tempTrend = useMemo(() => generateTimeSeries(40, -12, 2), []);
  const flowTrend = useMemo(() => generateTimeSeries(40, 18.6, 1.5), []);
  const levelTrend = useMemo(() => generateTimeSeries(40, 60, 8), []);

  const ventValve = valves[0];
  const feedValve = valves[1];

  return (
    <Layout title="氨冷分离 · 分离 + 储罐 + 气体管理">
      <div className="space-y-6">
        <div>
          <h2 className="section-title">
            <ThermometerSun size={18} />
            氨冷分离参数
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {separationParams.map((param) => (
              <ParamCard key={param.id} param={param} />
            ))}
          </div>
        </div>

        <div>
          <h2 className="section-title">
            <Droplet size={18} />
            液氨储罐液位
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {tankLevels.map((tank) => (
              <TankLevel key={tank.id} tank={tank} />
            ))}
          </div>
        </div>

        <div>
          <h2 className="section-title">
            <Wind size={18} />
            气体管理
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {gasManagementParams.map((param) => (
              <ParamCard key={param.id} param={param} />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card title="氨冷器出口温度" icon={<ThermometerSun size={16} />} extra="近40分钟">
            <LineChart data={tempTrend} title="温度" unit=" ℃" color="#06b6d4" height={200} />
          </Card>
          <Card title="液氨流量趋势" icon={<Activity size={16} />} extra="近40分钟">
            <LineChart data={flowTrend} title="流量" unit=" t/h" color="#00d4aa" height={200} />
          </Card>
          <Card title="储罐平均液位" icon={<Droplet size={16} />} extra="近40分钟">
            <LineChart data={levelTrend} title="液位" unit=" %" color="#a855f7" height={200} />
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card title="阀门状态" icon={<Activity size={16} />}>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded bg-dark-800 border border-dark-600">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-white">{ventValve.name}</span>
                  <span className={`text-[11px] px-2 py-0.5 rounded ${
                    ventValve.status === 'auto'
                      ? 'bg-alarm-success/20 text-alarm-success border border-alarm-success/30'
                      : 'bg-alarm-warning/20 text-alarm-warning border border-alarm-warning/30'
                  }`}>
                    {ventValve.status === 'auto' ? '自动' : '手动'}
                  </span>
                </div>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="font-display font-bold text-2xl text-alarm-warning">
                    {ventValve.openPercent}
                  </span>
                  <span className="text-sm text-dark-400">%</span>
                </div>
                <div className="h-2 rounded-full bg-dark-600 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-alarm-danger to-alarm-warning transition-all duration-500"
                    style={{ width: `${ventValve.openPercent}%` }}
                  />
                </div>
                <div className="text-xs text-dark-400 mt-2">循环气放空</div>
              </div>

              <div className="p-4 rounded bg-dark-800 border border-dark-600">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-white">{feedValve.name}</span>
                  <span className={`text-[11px] px-2 py-0.5 rounded ${
                    feedValve.status === 'auto'
                      ? 'bg-alarm-success/20 text-alarm-success border border-alarm-success/30'
                      : 'bg-alarm-warning/20 text-alarm-warning border border-alarm-warning/30'
                  }`}>
                    {feedValve.status === 'auto' ? '自动' : '手动'}
                  </span>
                </div>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="font-display font-bold text-2xl text-primary-400">
                    {feedValve.openPercent}
                  </span>
                  <span className="text-sm text-dark-400">%</span>
                </div>
                <div className="h-2 rounded-full bg-dark-600 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary-700 to-primary-400 transition-all duration-500"
                    style={{ width: `${feedValve.openPercent}%` }}
                  />
                </div>
                <div className="text-xs text-dark-400 mt-2">新鲜气补充</div>
              </div>

              <div className="p-4 rounded bg-dark-800 border border-dark-600 col-span-2">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-dark-400 mb-1">储罐进口阀</div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2 rounded-full bg-dark-600 overflow-hidden">
                        <div className="h-full bg-alarm-success rounded-full" style={{ width: '100%' }} />
                      </div>
                      <span className="data-value text-alarm-success">100%</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-alarm-success/20 text-alarm-success">自动</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-dark-400 mb-1">储罐出口阀</div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2 rounded-full bg-dark-600 overflow-hidden">
                        <div className="h-full bg-alarm-warning rounded-full" style={{ width: '52%' }} />
                      </div>
                      <span className="data-value text-alarm-warning">52%</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-alarm-warning/20 text-alarm-warning">手动</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card title="关键指标汇总" icon={<Wind size={16} />}>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded bg-dark-800 border border-dark-600">
                <div className="text-xs text-dark-400">液氨小时产量</div>
                <div className="font-display font-bold text-2xl text-primary-400 mt-1">
                  {formatNumber(separationParams.find(p => p.id === 'sp-3')?.value || 0, 1)}
                  <span className="text-sm text-dark-400 ml-1">t/h</span>
                </div>
              </div>
              <div className="p-4 rounded bg-dark-800 border border-dark-600">
                <div className="text-xs text-dark-400">氨净值</div>
                <div className="font-display font-bold text-2xl text-alarm-success mt-1">
                  {formatNumber(gasManagementParams.find(p => p.id === 'gm-5')?.value || 0, 1)}
                  <span className="text-sm text-dark-400 ml-1">%</span>
                </div>
              </div>
              <div className="p-4 rounded bg-dark-800 border border-dark-600">
                <div className="text-xs text-dark-400">氢氮比 H₂/N₂</div>
                <div className="font-display font-bold text-2xl text-industrial-100 mt-1">
                  {formatNumber(gasManagementParams.find(p => p.id === 'gm-3')?.value || 0, 2)}
                </div>
              </div>
              <div className="p-4 rounded bg-dark-800 border border-dark-600">
                <div className="text-xs text-dark-400">分离效率</div>
                <div className="font-display font-bold text-2xl text-alarm-success mt-1">
                  {formatNumber(separationParams.find(p => p.id === 'sp-4')?.value || 0, 1)}
                  <span className="text-sm text-dark-400 ml-1">%</span>
                </div>
              </div>
              <div className="p-4 rounded bg-dark-800 border border-dark-600">
                <div className="text-xs text-dark-400">惰性气体含量</div>
                <div className="font-display font-bold text-2xl text-alarm-warning mt-1">
                  {formatNumber(gasManagementParams.find(p => p.id === 'gm-4')?.value || 0, 1)}
                  <span className="text-sm text-dark-400 ml-1">%</span>
                </div>
              </div>
              <div className="p-4 rounded bg-dark-800 border border-dark-600">
                <div className="text-xs text-dark-400">液氨纯度</div>
                <div className="font-display font-bold text-2xl text-alarm-success mt-1">
                  {formatNumber(separationParams.find(p => p.id === 'sp-6')?.value || 0, 2)}
                  <span className="text-sm text-dark-400 ml-1">%</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
