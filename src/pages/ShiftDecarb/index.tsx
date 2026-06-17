import { useMemo } from 'react';
import { Wind, Flame, Thermometer, Droplets } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import Card from '@/components/ui/Card';
import ParamCard from '@/components/ui/ParamCard';
import LineChart from '@/components/charts/LineChart';
import PieChart from '@/components/charts/PieChart';
import GasCompositionView from '@/components/ui/GasCompositionView';
import { useAppStore } from '@/store/appStore';
import { generateTimeSeries } from '@/data/mockData';

export default function ShiftDecarb() {
  const { shiftParams, decarbParams, shiftGas } = useAppStore();

  const tempTrend = useMemo(() => generateTimeSeries(40, 445, 20), []);
  const coTrend = useMemo(() => generateTimeSeries(40, 2.5, 0.5), []);
  const pressureTrend = useMemo(() => generateTimeSeries(40, 2.55, 0.1), []);

  const gasPieData = [
    { name: 'H₂', value: shiftGas.h2 },
    { name: 'N₂', value: shiftGas.n2 },
    { name: 'CO', value: shiftGas.co },
    { name: 'CO₂', value: shiftGas.co2 },
    { name: '其他', value: (shiftGas.ch4 || 0) + (shiftGas.ar || 0) },
  ];

  return (
    <Layout title="变换脱碳 · CO变换 + 脱碳工艺">
      <div className="space-y-6">
        <div>
          <h2 className="section-title">
            <Flame size={18} />
            一氧化碳变换
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {shiftParams.map((param) => (
              <ParamCard key={param.id} param={param} />
            ))}
          </div>
        </div>

        <div>
          <h2 className="section-title">
            <Droplets size={18} />
            变换气脱碳
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {decarbParams.map((param) => (
              <ParamCard key={param.id} param={param} />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card title="一段变换炉出口温度" icon={<Thermometer size={16} />} extra="近40分钟">
            <LineChart data={tempTrend} title="温度" unit=" ℃" color="#ff4757" height={200} />
          </Card>
          <Card title="变换气CO含量" icon={<Wind size={16} />} extra="近40分钟">
            <LineChart data={coTrend} title="CO含量" unit=" %" color="#ffa726" height={200} />
          </Card>
          <Card title="脱碳塔压力" icon={<Wind size={16} />} extra="近40分钟">
            <LineChart data={pressureTrend} title="压力" unit=" MPa" color="#00d4aa" height={200} />
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card title="变换气成分分析" icon={<Wind size={16} />}>
            <GasCompositionView composition={shiftGas} />
          </Card>
          <Card title="气体成分占比" icon={<Wind size={16} />}>
            <PieChart data={gasPieData} height={260} />
          </Card>
        </div>

        <Card title="变换脱碳工艺流程" icon={<Wind size={16} />}>
          <div className="bg-dark-800 rounded-lg p-6 border border-dark-600">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="text-center flex-1 min-w-[120px]">
                <div className="w-24 h-24 rounded-lg bg-gradient-to-br from-industrial-600 to-industrial-800 flex items-center justify-center mx-auto mb-2">
                  <div className="text-center">
                    <div className="font-display font-bold text-white text-xs">饱和塔</div>
                    <div className="text-[10px] text-industrial-200">Saturator</div>
                  </div>
                </div>
                <div className="text-[11px] text-dark-300">半水煤气→</div>
              </div>

              <div className="flex-1 mx-2 h-0.5 bg-gradient-to-r from-industrial-500 to-orange-500 rounded-full animate-flow bg-[length:200%_100%]" />

              <div className="text-center flex-1 min-w-[120px]">
                <div className="w-24 h-24 rounded-lg bg-gradient-to-br from-orange-600 to-red-700 flex items-center justify-center mx-auto mb-2">
                  <div className="text-center">
                    <div className="font-display font-bold text-white text-xs">一段变换</div>
                    <div className="text-[10px] text-orange-100">HT Shift</div>
                  </div>
                </div>
                <div className="text-[11px] text-dark-300">445℃出口→</div>
              </div>

              <div className="flex-1 mx-2 h-0.5 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full animate-flow bg-[length:200%_100%]" />

              <div className="text-center flex-1 min-w-[120px]">
                <div className="w-24 h-24 rounded-lg bg-gradient-to-br from-yellow-600 to-amber-700 flex items-center justify-center mx-auto mb-2">
                  <div className="text-center">
                    <div className="font-display font-bold text-white text-xs">二段变换</div>
                    <div className="text-[10px] text-yellow-100">LT Shift</div>
                  </div>
                </div>
                <div className="text-[11px] text-dark-300">235℃出口→</div>
              </div>

              <div className="flex-1 mx-2 h-0.5 bg-gradient-to-r from-yellow-500 to-cyan-500 rounded-full animate-flow bg-[length:200%_100%]" />

              <div className="text-center flex-1 min-w-[120px]">
                <div className="w-24 h-24 rounded-lg bg-gradient-to-br from-cyan-600 to-blue-700 flex items-center justify-center mx-auto mb-2">
                  <div className="text-center">
                    <div className="font-display font-bold text-white text-xs">脱碳塔</div>
                    <div className="text-[10px] text-cyan-100">Decarbonator</div>
                  </div>
                </div>
                <div className="text-[11px] text-dark-300">脱CO₂→</div>
              </div>

              <div className="flex-1 mx-2 h-0.5 bg-gradient-to-r from-cyan-500 to-primary-500 rounded-full animate-flow bg-[length:200%_100%]" />

              <div className="text-center flex-1 min-w-[120px]">
                <div className="w-24 h-24 rounded-lg bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center mx-auto mb-2">
                  <div className="text-center">
                    <div className="font-display font-bold text-white text-xs">净化气</div>
                    <div className="text-[10px] text-primary-100">Purified Gas</div>
                  </div>
                </div>
                <div className="text-[11px] text-dark-300">送精制工段</div>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div className="p-3 rounded bg-dark-700">
                <div className="text-dark-400">CO转化率</div>
                <div className="font-display font-bold text-alarm-success text-xl mt-1">92.0%</div>
              </div>
              <div className="p-3 rounded bg-dark-700">
                <div className="text-dark-400">CO₂吸收率</div>
                <div className="font-display font-bold text-primary-400 text-xl mt-1">98.5%</div>
              </div>
              <div className="p-3 rounded bg-dark-700">
                <div className="text-dark-400">蒸汽/气比</div>
                <div className="font-display font-bold text-industrial-100 text-xl mt-1">1.35</div>
              </div>
              <div className="p-3 rounded bg-dark-700">
                <div className="text-dark-400">净化气CO₂</div>
                <div className="font-display font-bold text-alarm-success text-xl mt-1">0.35%</div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </Layout>
  );
}
