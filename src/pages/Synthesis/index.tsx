import { useMemo } from 'react';
import { Cog, Thermometer, Gauge, Flame } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import Card from '@/components/ui/Card';
import ParamCard from '@/components/ui/ParamCard';
import LineChart from '@/components/charts/LineChart';
import GaugeChart from '@/components/charts/GaugeChart';
import BarChart from '@/components/charts/BarChart';
import { useAppStore } from '@/store/appStore';
import { generateTimeSeries } from '@/data/mockData';

export default function Synthesis() {
  const { synthesisTempParams, synthesisPressureParams } = useAppStore();

  const hotSpotTrend = useMemo(() => generateTimeSeries(60, 495, 12), []);
  const pressureTrend = useMemo(() => generateTimeSeries(60, 28.5, 0.8), []);
  const valveTrend = useMemo(() => generateTimeSeries(60, 65, 5), []);

  const tempNames = synthesisTempParams.map((p) => p.name.replace('温度', ''));
  const tempValues = synthesisTempParams.map((p) => p.value);
  const tempMin = synthesisTempParams.map((p) => p.min);
  const tempMax = synthesisTempParams.map((p) => p.max);

  const hotSpot = synthesisTempParams.find((p) => p.id === 'sy-t5');
  const mainPressure = synthesisPressureParams.find((p) => p.id === 'sy-p1');

  return (
    <Layout title="氨合成 · 温度与压力控制">
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card title="热点温度监控" icon={<Thermometer size={16} />}>
            <GaugeChart
              value={hotSpot?.value || 0}
              min={450}
              max={520}
              unit=" ℃"
              color={hotSpot?.status === 'warning' ? '#ffa726' : '#00d4aa'}
              height={220}
            />
          </Card>
          <Card title="合成塔压力" icon={<Gauge size={16} />}>
            <GaugeChart
              value={mainPressure?.value || 0}
              min={24}
              max={32}
              unit=" MPa"
              color="#3d8bfd"
              height={220}
            />
          </Card>
          <Card title="补气阀开度" icon={<Cog size={16} />}>
            <GaugeChart
              value={synthesisPressureParams.find((p) => p.id === 'sy-p5')?.value || 0}
              min={0}
              max={100}
              unit=" %"
              color="#a855f7"
              height={220}
            />
          </Card>
        </div>

        <div>
          <h2 className="section-title">
            <Thermometer size={18} />
            合成塔温度分布
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
            {synthesisTempParams.map((param) => (
              <ParamCard key={param.id} param={param} />
            ))}
          </div>
        </div>

        <div>
          <h2 className="section-title">
            <Gauge size={18} />
            合成压力控制
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
            {synthesisPressureParams.map((param) => (
              <ParamCard key={param.id} param={param} />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card title="床层温度分布图" icon={<Flame size={16} />}>
            <BarChart
              categories={tempNames}
              values={tempValues}
              target={tempMax}
              color="#ffa726"
              targetColor="#ff4757"
              unit=" ℃"
              height={260}
            />
          </Card>
          <Card title="热点温度趋势" icon={<Thermometer size={16} />} extra="近60分钟">
            <LineChart data={hotSpotTrend} title="热点温度" unit=" ℃" color="#ff4757" height={260} />
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card title="合成塔压力趋势" icon={<Gauge size={16} />} extra="近60分钟">
            <LineChart data={pressureTrend} title="压力" unit=" MPa" color="#3d8bfd" height={220} />
          </Card>
          <Card title="补气阀开度趋势" icon={<Cog size={16} />} extra="近60分钟">
            <LineChart data={valveTrend} title="开度" unit=" %" color="#a855f7" height={220} />
          </Card>
        </div>

        <Card title="氨合成塔工艺流程" icon={<Cog size={16} />}>
          <div className="bg-dark-800 rounded-lg p-6 border border-dark-600">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="text-center flex-1 min-w-[100px]">
                <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-industrial-600 to-industrial-800 flex items-center justify-center mx-auto mb-2">
                  <div className="font-display font-bold text-white text-xs">新鲜气</div>
                </div>
                <div className="text-[11px] text-dark-300">H₂:N₂=3:1</div>
              </div>

              <div className="flex-1 mx-1 h-0.5 bg-gradient-to-r from-industrial-500 to-primary-500 rounded-full animate-flow bg-[length:200%_100%]" />

              <div className="text-center flex-1 min-w-[100px]">
                <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-cyan-600 to-blue-700 flex items-center justify-center mx-auto mb-2">
                  <div className="font-display font-bold text-white text-xs">循环机</div>
                </div>
                <div className="text-[11px] text-dark-300">45万m³/h</div>
              </div>

              <div className="flex-1 mx-1 h-0.5 bg-gradient-to-r from-cyan-500 to-orange-500 rounded-full animate-flow bg-[length:200%_100%]" />

              <div className="text-center flex-1 min-w-[120px]">
                <div className="w-28 h-40 rounded-xl bg-gradient-to-b from-red-600 via-orange-500 to-yellow-500 flex flex-col items-center justify-center mx-auto mb-2 shadow-lg relative overflow-hidden">
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 text-[10px] text-white font-bold">415℃</div>
                  <div className="absolute top-10 left-1/2 -translate-x-1/2 text-[10px] text-yellow-100 font-bold">485℃</div>
                  <div className="absolute top-20 left-1/2 -translate-x-1/2 text-[10px] text-yellow-100 font-bold">495℃</div>
                  <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-[10px] text-yellow-200 font-bold">452℃</div>
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] text-orange-100 font-bold">365℃</div>
                  <div className="font-display font-bold text-white text-sm mt-auto mb-2">合成塔</div>
                </div>
                <div className="text-[11px] text-dark-300">28.5MPa</div>
              </div>

              <div className="flex-1 mx-1 h-0.5 bg-gradient-to-r from-orange-500 to-cyan-500 rounded-full animate-flow bg-[length:200%_100%]" />

              <div className="text-center flex-1 min-w-[100px]">
                <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-cyan-600 to-teal-700 flex items-center justify-center mx-auto mb-2">
                  <div className="font-display font-bold text-white text-xs">水冷器</div>
                </div>
                <div className="text-[11px] text-dark-300">冷却气体</div>
              </div>

              <div className="flex-1 mx-1 h-0.5 bg-gradient-to-r from-cyan-500 to-primary-500 rounded-full animate-flow bg-[length:200%_100%]" />

              <div className="text-center flex-1 min-w-[100px]">
                <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center mx-auto mb-2">
                  <div className="font-display font-bold text-white text-xs">分离器</div>
                </div>
                <div className="text-[11px] text-dark-300">液氨分离</div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </Layout>
  );
}
