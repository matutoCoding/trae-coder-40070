import { useMemo } from 'react';
import { Flame, Activity, Wind } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import Card from '@/components/ui/Card';
import ParamCard from '@/components/ui/ParamCard';
import LineChart from '@/components/charts/LineChart';
import PieChart from '@/components/charts/PieChart';
import GasCompositionView from '@/components/ui/GasCompositionView';
import { useAppStore } from '@/store/appStore';
import { generateTimeSeries } from '@/data/mockData';

export default function RawGas() {
  const { rawGasParams, halfWaterGas } = useAppStore();

  const tempTrend = useMemo(() => generateTimeSeries(40, 1280, 30), []);
  const pressureTrend = useMemo(() => generateTimeSeries(40, 2.85, 0.15), []);
  const coalTrend = useMemo(() => generateTimeSeries(40, 18.5, 1.2), []);

  const gasPieData = [
    { name: 'H₂', value: halfWaterGas.h2 },
    { name: 'N₂', value: halfWaterGas.n2 },
    { name: 'CO', value: halfWaterGas.co },
    { name: 'CO₂', value: halfWaterGas.co2 },
    { name: '其他', value: (halfWaterGas.ch4 || 0) + (halfWaterGas.ar || 0) },
  ];

  return (
    <Layout title="原料气制备 · 半水煤气制备">
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {rawGasParams.map((param) => (
            <ParamCard key={param.id} param={param} />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card
            title="气化炉温度趋势"
            icon={<Flame size={16} />}
            extra="近40分钟"
            className="lg:col-span-1"
          >
            <LineChart data={tempTrend} title="炉温" unit=" ℃" color="#ff4757" height={200} />
          </Card>
          <Card
            title="气化炉压力趋势"
            icon={<Activity size={16} />}
            extra="近40分钟"
            className="lg:col-span-1"
          >
            <LineChart data={pressureTrend} title="压力" unit=" MPa" color="#00d4aa" height={200} />
          </Card>
          <Card
            title="给煤量趋势"
            icon={<Wind size={16} />}
            extra="近40分钟"
            className="lg:col-span-1"
          >
            <LineChart data={coalTrend} title="给煤量" unit=" t/h" color="#ffa726" height={200} />
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card title="半水煤气成分分析" icon={<Wind size={16} />}>
            <GasCompositionView composition={halfWaterGas} />
          </Card>

          <Card title="气体成分占比" icon={<Wind size={16} />}>
            <PieChart data={gasPieData} height={260} />
          </Card>
        </div>

        <Card title="工艺流程示意图" icon={<Flame size={16} />}>
          <div className="bg-dark-800 rounded-lg p-6 border border-dark-600">
            <div className="relative">
              <div className="flex items-center justify-between">
                <div className="text-center">
                  <div className="w-24 h-24 rounded-lg bg-gradient-to-br from-orange-600 to-red-700 flex items-center justify-center mx-auto mb-2 shadow-lg">
                    <div>
                      <div className="font-display font-bold text-white text-lg">气化炉</div>
                      <div className="text-[10px] text-orange-100">Gasifier</div>
                    </div>
                  </div>
                  <div className="text-xs text-dark-300">煤 + 蒸汽 + 空气</div>
                </div>

                <div className="flex-1 mx-4 h-1 bg-gradient-to-r from-orange-500 via-yellow-400 to-green-500 rounded-full relative animate-flow bg-[length:200%_100%]">
                  <div className="absolute left-1/2 -translate-x-1/2 -top-6 text-[10px] text-dark-300 font-mono">52,800 m³/h</div>
                </div>

                <div className="text-center">
                  <div className="w-24 h-24 rounded-lg bg-gradient-to-br from-industrial-600 to-industrial-800 flex items-center justify-center mx-auto mb-2 shadow-lg">
                    <div>
                      <div className="font-display font-bold text-white text-sm">除尘降温</div>
                      <div className="text-[10px] text-industrial-200">Cleaning</div>
                    </div>
                  </div>
                  <div className="text-xs text-dark-300">旋风分离 + 洗涤</div>
                </div>

                <div className="flex-1 mx-4 h-1 bg-gradient-to-r from-green-500 via-cyan-400 to-blue-500 rounded-full relative animate-flow bg-[length:200%_100%]">
                  <div className="absolute left-1/2 -translate-x-1/2 -top-6 text-[10px] text-dark-300 font-mono">半水煤气</div>
                </div>

                <div className="text-center">
                  <div className="w-24 h-24 rounded-lg bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center mx-auto mb-2 shadow-lg">
                    <div>
                      <div className="font-display font-bold text-white text-sm">气柜</div>
                      <div className="text-[10px] text-primary-100">Gas Holder</div>
                    </div>
                  </div>
                  <div className="text-xs text-dark-300">稳压储存</div>
                </div>
              </div>

              <div className="mt-8 grid grid-cols-4 gap-4 text-xs">
                <div className="p-3 rounded bg-dark-700 text-center">
                  <div className="text-dark-400">H₂含量</div>
                  <div className="font-display font-bold text-primary-400 text-lg mt-1">{halfWaterGas.h2}%</div>
                </div>
                <div className="p-3 rounded bg-dark-700 text-center">
                  <div className="text-dark-400">CO含量</div>
                  <div className="font-display font-bold text-alarm-warning text-lg mt-1">{halfWaterGas.co}%</div>
                </div>
                <div className="p-3 rounded bg-dark-700 text-center">
                  <div className="text-dark-400">氧含量</div>
                  <div className="font-display font-bold text-alarm-success text-lg mt-1">0.4%</div>
                </div>
                <div className="p-3 rounded bg-dark-700 text-center">
                  <div className="text-dark-400">出口温度</div>
                  <div className="font-display font-bold text-industrial-100 text-lg mt-1">380℃</div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </Layout>
  );
}
