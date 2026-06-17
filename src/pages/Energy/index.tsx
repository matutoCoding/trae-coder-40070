import { Gauge, Zap, Flame, Droplets, Activity, TrendingDown, PieChart as PieChartIcon } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import Card from '@/components/ui/Card';
import MetricCard from '@/components/ui/MetricCard';
import AreaChart from '@/components/charts/AreaChart';
import PieChart from '@/components/charts/PieChart';
import LineChart from '@/components/charts/LineChart';
import { useAppStore } from '@/store/appStore';
import { formatNumber } from '@/utils/helpers';

export default function Energy() {
  const { energyData } = useAppStore();

  const dates = energyData.map((d) => d.date);

  const latest = energyData[energyData.length - 1];
  const prev = energyData[energyData.length - 2] || latest;

  const totalSeries = [
    { name: '吨煤 (t/tNH₃)', data: energyData.map((d) => d.coal), color: '#ffa726' },
    { name: '电力 (kWh/tNH₃)', data: energyData.map((d) => d.power / 100), color: '#3d8bfd' },
    { name: '蒸汽 (t/tNH₃)', data: energyData.map((d) => d.steam), color: '#ff4757' },
    { name: '水 (m³/tNH₃)', data: energyData.map((d) => d.water / 10), color: '#06b6d4' },
  ];

  const energyBreakdown = [
    { name: '原料煤', value: 42 },
    { name: '电力', value: 28 },
    { name: '蒸汽', value: 18 },
    { name: '循环水', value: 8 },
    { name: '其他', value: 4 },
  ];

  const coalSaving = (((prev.coal - latest.coal) / prev.coal) * 100).toFixed(2);
  const powerSaving = (((prev.power - latest.power) / prev.power) * 100).toFixed(2);

  return (
    <Layout title="能耗分析 · 吨氨能耗分析">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <MetricCard
            label="吨氨综合能耗"
            value={latest.total}
            unit="GJ/t"
            decimals={2}
            icon={<Gauge size={20} />}
            trend={-1.5}
            trendLabel="较昨日"
            color="text-alarm-success"
          />
          <MetricCard
            label="吨氨耗原料煤"
            value={latest.coal}
            unit="t/t"
            decimals={3}
            icon={<Flame size={20} />}
            trend={-Number(coalSaving)}
            trendLabel="较昨日"
            color="text-alarm-warning"
          />
          <MetricCard
            label="吨氨耗电"
            value={latest.power}
            unit="kWh/t"
            decimals={0}
            icon={<Zap size={20} />}
            trend={-Number(powerSaving)}
            trendLabel="较昨日"
            color="text-primary-400"
          />
          <MetricCard
            label="吨氨耗蒸汽"
            value={latest.steam}
            unit="t/t"
            decimals={2}
            icon={<Activity size={20} />}
            color="text-alarm-danger"
          />
          <MetricCard
            label="吨氨耗水"
            value={latest.water}
            unit="m³/t"
            decimals={1}
            icon={<Droplets size={20} />}
            color="text-industrial-100"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card title="分项能耗堆叠趋势" icon={<Activity size={16} />} className="lg:col-span-2">
            <AreaChart
              categories={dates}
              series={totalSeries}
              unit=""
              stacked={true}
              height={280}
            />
          </Card>

          <Card title="能源结构占比" icon={<PieChartIcon size={16} />}>
            <PieChart
              data={energyBreakdown}
              colors={['#ffa726', '#3d8bfd', '#ff4757', '#06b6d4', '#a855f7']}
              height={280}
            />
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card title="综合能耗趋势" icon={<Gauge size={16} />}>
            <LineChart
              data={energyData.map((d) => ({ time: d.date, value: d.total }))}
              title="综合能耗"
              unit=" GJ/t"
              color="#00d4aa"
              height={240}
            />
          </Card>

          <Card title="吨氨电耗趋势" icon={<Zap size={16} />}>
            <LineChart
              data={energyData.map((d) => ({ time: d.date, value: d.power }))}
              title="电耗"
              unit=" kWh/t"
              color="#3d8bfd"
              height={240}
            />
          </Card>
        </div>

        <Card title="能耗数据明细" icon={<TrendingDown size={16} />}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-dark-400 text-xs border-b border-dark-600">
                  <th className="text-left py-3 px-3 font-medium">日期</th>
                  <th className="text-right py-3 px-3 font-medium">吨煤 (t/tNH₃)</th>
                  <th className="text-right py-3 px-3 font-medium">电力 (kWh/tNH₃)</th>
                  <th className="text-right py-3 px-3 font-medium">蒸汽 (t/tNH₃)</th>
                  <th className="text-right py-3 px-3 font-medium">水 (m³/tNH₃)</th>
                  <th className="text-right py-3 px-3 font-medium">综合能耗 (GJ/t)</th>
                  <th className="text-right py-3 px-3 font-medium">同比</th>
                </tr>
              </thead>
              <tbody>
                {[...energyData].reverse().map((d, i, arr) => {
                  const prevD = arr[i + 1];
                  const compare = prevD ? (((d.total - prevD.total) / prevD.total) * 100).toFixed(2) : '0.00';
                  const isDown = Number(compare) < 0;
                  return (
                    <tr key={i} className="border-b border-dark-600/50 hover:bg-dark-600/30">
                      <td className="py-3 px-3 text-dark-200 font-mono">{d.date}</td>
                      <td className="py-3 px-3 text-right data-value text-alarm-warning">{formatNumber(d.coal, 3)}</td>
                      <td className="py-3 px-3 text-right data-value text-primary-400">{formatNumber(d.power, 0)}</td>
                      <td className="py-3 px-3 text-right data-value text-alarm-danger">{formatNumber(d.steam, 2)}</td>
                      <td className="py-3 px-3 text-right data-value text-industrial-100">{formatNumber(d.water, 1)}</td>
                      <td className="py-3 px-3 text-right data-value text-white font-bold">{formatNumber(d.total, 2)}</td>
                      <td className={`py-3 px-3 text-right font-medium ${isDown ? 'text-alarm-success' : 'text-alarm-danger'}`}>
                        {isDown ? '↓' : '↑'} {Math.abs(Number(compare))}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </Layout>
  );
}
