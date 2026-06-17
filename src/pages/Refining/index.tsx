import { useMemo } from 'react';
import { Droplets, Thermometer, Activity, Gauge } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import Card from '@/components/ui/Card';
import ParamCard from '@/components/ui/ParamCard';
import LineChart from '@/components/charts/LineChart';
import GaugeChart from '@/components/charts/GaugeChart';
import GasCompositionView from '@/components/ui/GasCompositionView';
import { useAppStore } from '@/store/appStore';
import { generateTimeSeries } from '@/data/mockData';

export default function Refining() {
  const { refiningParams, refinedGas } = useAppStore();

  const tempTrend = useMemo(() => generateTimeSeries(40, 12, 2), []);
  const pressureTrend = useMemo(() => generateTimeSeries(40, 12.5, 0.5), []);
  const copperTrend = useMemo(() => generateTimeSeries(40, 5.8, 0.4), []);

  const microCo = (refinedGas.co + refinedGas.co2) * 10000;

  return (
    <Layout title="气体精制 · 铜洗精制">
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {refiningParams.map((param) => (
            <ParamCard key={param.id} param={param} />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card title="微量CO+CO₂检测" icon={<Gauge size={16} />} extra="ppm">
            <GaugeChart value={microCo} min={0} max={30} unit=" ppm" color="#2ed573" title="总含量" height={220} />
          </Card>
          <Card title="铜洗塔温度趋势" icon={<Thermometer size={16} />} extra="近40分钟">
            <LineChart data={tempTrend} title="温度" unit=" ℃" color="#06b6d4" height={220} />
          </Card>
          <Card title="铜洗塔压力趋势" icon={<Activity size={16} />} extra="近40分钟">
            <LineChart data={pressureTrend} title="压力" unit=" MPa" color="#3d8bfd" height={220} />
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card title="铜液参数" icon={<Droplets size={16} />}>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded bg-dark-800 border border-dark-600">
                  <div className="text-xs text-dark-400 mb-2">总铜含量</div>
                  <div className="font-display font-bold text-2xl text-primary-400">2.25 <span className="text-sm text-dark-400">mol/L</span></div>
                  <div className="mt-2 h-1.5 rounded-full bg-dark-600 overflow-hidden">
                    <div className="h-full bg-primary-500 rounded-full" style={{ width: '75%' }} />
                  </div>
                  <div className="flex justify-between mt-1 text-[10px] text-dark-400">
                    <span>1.8</span>
                    <span>2.6</span>
                  </div>
                </div>
                <div className="p-4 rounded bg-dark-800 border border-dark-600">
                  <div className="text-xs text-dark-400 mb-2">铜比 (Cu⁺/Cu²⁺)</div>
                  <div className="font-display font-bold text-2xl text-alarm-warning">5.8</div>
                  <div className="mt-2 h-1.5 rounded-full bg-dark-600 overflow-hidden">
                    <div className="h-full bg-alarm-warning rounded-full" style={{ width: '80%' }} />
                  </div>
                  <div className="flex justify-between mt-1 text-[10px] text-dark-400">
                    <span>5.0</span>
                    <span>7.0</span>
                  </div>
                </div>
              </div>
              <Card title="铜比变化趋势" className="!border-0 !bg-transparent !p-0 !shadow-none">
                <LineChart data={copperTrend} title="铜比" color="#ffa726" height={160} area={false} />
              </Card>
            </div>
          </Card>

          <Card title="精制气成分分析" icon={<Droplets size={16} />}>
            <GasCompositionView composition={refinedGas} />
          </Card>
        </div>

        <Card title="铜洗精制工艺流程" icon={<Droplets size={16} />}>
          <div className="bg-dark-800 rounded-lg p-6 border border-dark-600">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="text-center flex-1 min-w-[120px]">
                <div className="w-24 h-24 rounded-lg bg-gradient-to-br from-industrial-600 to-industrial-800 flex items-center justify-center mx-auto mb-2">
                  <div className="text-center">
                    <div className="font-display font-bold text-white text-xs">压缩</div>
                    <div className="text-[10px] text-industrial-200">Compressor</div>
                  </div>
                </div>
                <div className="text-[11px] text-dark-300">净化气</div>
              </div>

              <div className="flex-1 mx-2 h-0.5 bg-gradient-to-r from-industrial-500 to-cyan-500 rounded-full animate-flow bg-[length:200%_100%]" />

              <div className="text-center flex-1 min-w-[120px]">
                <div className="w-24 h-24 rounded-lg bg-gradient-to-br from-cyan-600 to-teal-700 flex items-center justify-center mx-auto mb-2">
                  <div className="text-center">
                    <div className="font-display font-bold text-white text-xs">铜洗塔</div>
                    <div className="text-[10px] text-cyan-100">Cu Washer</div>
                  </div>
                </div>
                <div className="text-[11px] text-dark-300">12℃ / 12.5MPa</div>
              </div>

              <div className="flex-1 mx-2 h-0.5 bg-gradient-to-r from-cyan-500 to-primary-500 rounded-full animate-flow bg-[length:200%_100%]" />

              <div className="text-center flex-1 min-w-[120px]">
                <div className="w-24 h-24 rounded-lg bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center mx-auto mb-2">
                  <div className="text-center">
                    <div className="font-display font-bold text-white text-xs">碱洗塔</div>
                    <div className="text-[10px] text-primary-100">Alkali Wash</div>
                  </div>
                </div>
                <div className="text-[11px] text-dark-300">脱除CO₂</div>
              </div>

              <div className="flex-1 mx-2 h-0.5 bg-gradient-to-r from-primary-500 to-green-500 rounded-full animate-flow bg-[length:200%_100%]" />

              <div className="text-center flex-1 min-w-[120px]">
                <div className="w-24 h-24 rounded-lg bg-gradient-to-br from-green-600 to-emerald-700 flex items-center justify-center mx-auto mb-2">
                  <div className="text-center">
                    <div className="font-display font-bold text-white text-xs">精制气</div>
                    <div className="text-[10px] text-green-100">Refined Gas</div>
                  </div>
                </div>
                <div className="text-[11px] text-dark-300">送合成工段</div>
              </div>
            </div>

            <div className="mt-6 flex justify-center gap-6">
              <div className="w-40 p-4 rounded bg-dark-700 text-center">
                <div className="text-xs text-dark-400">铜液循环量</div>
                <div className="font-display font-bold text-cyan-400 text-lg mt-1">28 m³/h</div>
              </div>
              <div className="w-40 p-4 rounded bg-dark-700 text-center">
                <div className="text-xs text-dark-400">再生塔温度</div>
                <div className="font-display font-bold text-orange-400 text-lg mt-1">78 ℃</div>
              </div>
              <div className="w-40 p-4 rounded bg-dark-700 text-center">
                <div className="text-xs text-dark-400">微量CO+CO₂</div>
                <div className="font-display font-bold text-alarm-success text-lg mt-1">{microCo.toFixed(1)} ppm</div>
              </div>
              <div className="w-40 p-4 rounded bg-dark-700 text-center">
                <div className="text-xs text-dark-400">H₂+N₂纯度</div>
                <div className="font-display font-bold text-primary-400 text-lg mt-1">99.5%</div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </Layout>
  );
}
