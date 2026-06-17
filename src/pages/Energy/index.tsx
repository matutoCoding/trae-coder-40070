import { useMemo, useState } from 'react';
import {
  Gauge,
  Zap,
  Flame,
  Droplets,
  Activity,
  TrendingDown,
  PieChart as PieChartIcon,
  X,
  Factory,
  TrendingUp,
  Info,
} from 'lucide-react';
import Layout from '@/components/layout/Layout';
import Card from '@/components/ui/Card';
import MetricCard from '@/components/ui/MetricCard';
import AreaChart from '@/components/charts/AreaChart';
import PieChart from '@/components/charts/PieChart';
import LineChart from '@/components/charts/LineChart';
import { useAppStore } from '@/store/appStore';
import { formatNumber, getEnergyWithOutputAnalysis, getTodayLocalStr } from '@/utils/helpers';
import type { EnergyRecord } from '@/types';

export default function Energy() {
  const { energyData } = useAppStore();
  const [selectedDate, setSelectedDate] = useState<string | null>(getTodayLocalStr());

  const dates = energyData.map((d) => d.date);
  const fullDates = energyData.map((d) => d.fullDate);

  const latest = energyData[0];
  const prev = energyData[1] || latest;

  const totalSeries = [
    { name: '吨煤 (t/tNH₃)', data: energyData.map((d) => d.coal), color: '#ffa726' },
    { name: '电力 (×100 kWh/t)', data: energyData.map((d) => d.power / 100), color: '#3d8bfd' },
    { name: '蒸汽 (t/tNH₃)', data: energyData.map((d) => d.steam), color: '#ff4757' },
    { name: '水 (×10 m³/t)', data: energyData.map((d) => d.water / 10), color: '#06b6d4' },
  ];

  const outputData = energyData.map((d) => ({ time: d.date, value: d.output }));
  const totalEnergyData = energyData.map((d) => ({ time: d.date, value: d.total }));

  const coalSaving = (((prev.coal - latest.coal) / prev.coal) * 100).toFixed(2);
  const powerSaving = (((prev.power - latest.power) / prev.power) * 100).toFixed(2);

  const selectedRecord = useMemo(() => {
    if (!selectedDate) return null;
    return energyData.find((e) => e.fullDate === selectedDate);
  }, [energyData, selectedDate]);

  const selectedIndex = fullDates.indexOf(selectedDate || '');
  const selectedPrev = selectedIndex > 0 ? energyData[selectedIndex - 1] : undefined;

  const analysis = useMemo(() => {
    if (!selectedRecord) return null;
    return getEnergyWithOutputAnalysis(selectedRecord, selectedPrev);
  }, [selectedRecord, selectedPrev]);

  const handleBarClick = (index: number) => {
    setSelectedDate(fullDates[index]);
  };

  const outputVsEnergyData = useMemo(() => {
    const data = energyData.map((d) => {
      const analysis = getEnergyWithOutputAnalysis(d);
      return {
        date: d.date,
        output: d.output,
        total: d.total,
        impact: analysis.efficiencyImpact,
      };
    });
    return data;
  }, [energyData]);

  const avgOutput = energyData.reduce((s, d) => s + d.output, 0) / energyData.length;
  const avgEnergy = energyData.reduce((s, d) => s + d.total, 0) / energyData.length;

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
            label="今日合成氨产量"
            value={latest.output}
            unit="吨"
            decimals={1}
            icon={<Factory size={20} />}
            trend={Number((((latest.output - prev.output) / prev.output) * 100).toFixed(1))}
            trendLabel="较昨日"
            color="text-primary-400"
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
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card
            title="产量与综合能耗趋势"
            icon={<Activity size={16} />}
            className="lg:col-span-2"
            extra="点击数据点查看详情"
          >
            <div className="relative">
              <LineChart
                data={totalEnergyData}
                title="综合能耗"
                unit=" GJ/t"
                color="#00d4aa"
                height={240}
                onDataClick={handleBarClick}
                highlightIndex={selectedDate ? fullDates.indexOf(selectedDate) : -1}
              />
              <div className="absolute top-0 right-0 flex items-center gap-4 text-xs text-dark-400 pr-4 pt-2">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-1 rounded-full bg-primary-400"></span>
                  <span>产量 (吨)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-1 rounded-full bg-alarm-success"></span>
                  <span>综合能耗 (GJ/t)</span>
                </div>
              </div>
            </div>
            <div className="mt-2 grid grid-cols-7 gap-1">
              {energyData.map((d, i) => (
                <button
                  key={d.fullDate}
                  onClick={() => handleBarClick(i)}
                  className={`p-1.5 rounded text-xs transition-colors text-center ${
                    selectedDate === d.fullDate
                      ? 'bg-primary-600 text-white'
                      : 'bg-dark-700/50 text-dark-300 hover:bg-dark-600 hover:text-white'
                  }`}
                >
                  <div className="font-mono">{d.date}</div>
                  <div className="text-[10px] opacity-70">{d.output.toFixed(0)}t</div>
                </button>
              ))}
            </div>
          </Card>

          <Card
            title={selectedDate ? `${selectedDate} 能耗详情` : '能源结构占比'}
            icon={<PieChartIcon size={16} />}
          >
            {analysis ? (
              <div className="space-y-3">
                <PieChart
                  data={analysis.breakdown}
                  colors={['#ffa726', '#3d8bfd', '#ff4757', '#06b6d4', '#a855f7']}
                  height={200}
                />
                <div className="grid grid-cols-2 gap-2">
                  {analysis.breakdown.map((item) => (
                    <div key={item.name} className="flex items-center justify-between text-xs">
                      <span className="text-dark-300">{item.name}</span>
                      <span className="text-white font-mono">{item.value.toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <PieChart
                data={[
                  { name: '原料煤', value: 42 },
                  { name: '电力', value: 28 },
                  { name: '蒸汽', value: 18 },
                  { name: '循环水', value: 8 },
                  { name: '其他', value: 4 },
                ]}
                colors={['#ffa726', '#3d8bfd', '#ff4757', '#06b6d4', '#a855f7']}
                height={280}
              />
            )}
          </Card>
        </div>

        {selectedRecord && analysis && (
          <Card
            title={`${selectedRecord.date} 产量与能耗关联分析`}
            icon={<Info size={16} />}
            extra={
              <button
                onClick={() => setSelectedDate(null)}
                className="text-xs text-dark-400 hover:text-white transition-colors"
              >
                关闭详情
              </button>
            }
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-lg bg-dark-700/30 border border-dark-600">
                <div className="text-xs text-dark-400 mb-1">当日产量</div>
                <div className="text-2xl font-display font-bold text-primary-400">
                  {formatNumber(selectedRecord.output, 1)}
                  <span className="text-sm font-normal text-dark-400 ml-1">吨</span>
                </div>
                <div className={`text-xs mt-1 ${analysis.outputChange >= 0 ? 'text-alarm-danger' : 'text-alarm-success'}`}>
                  {analysis.outputChange >= 0 ? '↑' : '↓'} {Math.abs(analysis.outputChange).toFixed(1)}% 较昨日
                </div>
                <div className="text-[11px] text-dark-500 mt-1">
                  {analysis.isHighOutput ? '✓ 产量高于平均水平' : '产量低于平均水平'}
                </div>
              </div>

              <div className="p-4 rounded-lg bg-dark-700/30 border border-dark-600">
                <div className="text-xs text-dark-400 mb-1">综合能耗</div>
                <div className="text-2xl font-display font-bold text-alarm-success">
                  {formatNumber(selectedRecord.total, 2)}
                  <span className="text-sm font-normal text-dark-400 ml-1">GJ/t</span>
                </div>
                <div className={`text-xs mt-1 ${analysis.totalChange >= 0 ? 'text-alarm-danger' : 'text-alarm-success'}`}>
                  {analysis.totalChange >= 0 ? '↑' : '↓'} {Math.abs(analysis.totalChange).toFixed(1)}% 较昨日
                </div>
              </div>

              <div className="p-4 rounded-lg bg-dark-700/30 border border-dark-600">
                <div className="text-xs text-dark-400 mb-1">产量对能耗影响</div>
                <div className="text-2xl font-display font-bold text-industrial-100">
                  {analysis.efficiencyImpact >= 0 ? '+' : ''}{analysis.efficiencyImpact.toFixed(1)}
                  <span className="text-sm font-normal text-dark-400 ml-1">%</span>
                </div>
                <div className="text-xs mt-1 text-dark-400">
                  规模效益影响
                </div>
                <div className="text-[11px] text-alarm-success mt-1">
                  产量每提高10%，能耗降低约2.5%
                </div>
              </div>

              <div className="p-4 rounded-lg bg-dark-700/30 border border-dark-600">
                <div className="text-xs text-dark-400 mb-1">分项能耗</div>
                <div className="space-y-1 mt-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-alarm-warning">煤</span>
                    <span className="text-white font-mono">{selectedRecord.coal.toFixed(3)} t/t</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-primary-400">电</span>
                    <span className="text-white font-mono">{selectedRecord.power.toFixed(0)} kWh/t</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-alarm-danger">蒸汽</span>
                    <span className="text-white font-mono">{selectedRecord.steam.toFixed(2)} t/t</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-industrial-100">水</span>
                    <span className="text-white font-mono">{selectedRecord.water.toFixed(1)} m³/t</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 p-3 rounded-lg bg-primary-500/5 border border-primary-500/20">
              <div className="flex items-start gap-2">
                <Info size={16} className="text-primary-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <span className="text-primary-400 font-medium">分析结论：</span>
                  <span className="text-dark-300">
                    {analysis.isHighOutput
                      ? `当日产量 ${selectedRecord.output.toFixed(0)} 吨高于日均 ${avgOutput.toFixed(0)} 吨，由于规模效应，吨氨综合能耗 ${selectedRecord.total.toFixed(2)} GJ/t ${
                          analysis.totalChange < 0 ? '下降' : '上升'
                        } ${Math.abs(analysis.totalChange).toFixed(1)}%，表现${analysis.totalChange < 0 ? '优秀' : '有待提升'}。`
                      : `当日产量 ${selectedRecord.output.toFixed(0)} 吨低于日均 ${avgOutput.toFixed(0)} 吨，吨氨综合能耗 ${selectedRecord.total.toFixed(2)} GJ/t ${
                          analysis.totalChange < 0 ? '下降' : '上升'
                        } ${Math.abs(analysis.totalChange).toFixed(1)}%。建议优化生产负荷，提高产量可进一步降低单位能耗。`}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card title="分项能耗堆叠趋势" icon={<Activity size={16} />}>
            <AreaChart
              categories={dates}
              series={totalSeries}
              unit=""
              stacked={true}
              height={240}
            />
          </Card>

          <Card title="产量与能耗对比" icon={<TrendingUp size={16} />}>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-xs text-dark-400 w-12">产量</span>
                <div className="flex-1">
                  {outputVsEnergyData.map((d, i) => (
                    <div
                      key={i}
                      className="inline-flex flex-col items-center mr-2 last:mr-0"
                      style={{ width: `calc(${100 / outputVsEnergyData.length}% - 8px)` }}
                    >
                      <div
                        className="w-full bg-primary-400/20 rounded-t relative"
                        style={{ height: `${(d.output / 170) * 80}px` }}
                      >
                        <div
                          className={`absolute bottom-0 w-full rounded-t ${
                            selectedDate === energyData[i]?.fullDate
                              ? 'bg-primary-400'
                              : 'bg-primary-600/60'
                          }`}
                          style={{ height: `${(d.output / 170) * 100}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-dark-500 mt-1 font-mono">{d.date}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-dark-400 w-12">能耗</span>
                <div className="flex-1">
                  {outputVsEnergyData.map((d, i) => (
                    <div
                      key={i}
                      className="inline-flex flex-col items-center mr-2 last:mr-0"
                      style={{ width: `calc(${100 / outputVsEnergyData.length}% - 8px)` }}
                    >
                      <div
                        className="w-full bg-alarm-success/20 rounded-t relative"
                        style={{ height: `${((42 - d.total) / 8) * 80}px` }}
                      >
                        <div
                          className={`absolute bottom-0 w-full rounded-t ${
                            selectedDate === energyData[i]?.fullDate
                              ? 'bg-alarm-success'
                              : 'bg-alarm-success/60'
                          }`}
                          style={{ height: `${((42 - d.total) / 8) * 100}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-dark-500 mt-1 font-mono">{d.total.toFixed(1)}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-between text-[11px] text-dark-500 px-14">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-1.5 rounded bg-primary-400"></span>
                  <span>产量 (吨) - 越高越好</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-1.5 rounded bg-alarm-success"></span>
                  <span>能耗 (GJ/t) - 越低越好</span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <Card title="能耗数据明细" icon={<TrendingDown size={16} />}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-dark-400 text-xs border-b border-dark-600">
                  <th className="text-left py-3 px-3 font-medium">日期</th>
                  <th className="text-right py-3 px-3 font-medium">日产量(吨)</th>
                  <th className="text-right py-3 px-3 font-medium">吨煤 (t/tNH₃)</th>
                  <th className="text-right py-3 px-3 font-medium">电力 (kWh/tNH₃)</th>
                  <th className="text-right py-3 px-3 font-medium">蒸汽 (t/tNH₃)</th>
                  <th className="text-right py-3 px-3 font-medium">水 (m³/tNH₃)</th>
                  <th className="text-right py-3 px-3 font-medium">综合能耗 (GJ/t)</th>
                  <th className="text-right py-3 px-3 font-medium">同比</th>
                  <th className="text-center py-3 px-3 font-medium">操作</th>
                </tr>
              </thead>
              <tbody>
                {energyData.map((d, i, arr) => {
                  const prevD = arr[i + 1];
                  const compare = prevD ? (((d.total - prevD.total) / prevD.total) * 100).toFixed(2) : '0.00';
                  const isDown = Number(compare) < 0;
                  const isSelected = selectedDate === d.fullDate;
                  return (
                    <tr
                      key={i}
                      className={`border-b border-dark-600/50 cursor-pointer transition-colors ${
                        isSelected ? 'bg-primary-500/10' : 'hover:bg-dark-600/30'
                      }`}
                      onClick={() => setSelectedDate(d.fullDate)}
                    >
                      <td className="py-3 px-3 text-dark-200 font-mono">{d.date}</td>
                      <td className="py-3 px-3 text-right data-value text-primary-400">{formatNumber(d.output, 1)}</td>
                      <td className="py-3 px-3 text-right data-value text-alarm-warning">{formatNumber(d.coal, 3)}</td>
                      <td className="py-3 px-3 text-right data-value text-primary-400">{formatNumber(d.power, 0)}</td>
                      <td className="py-3 px-3 text-right data-value text-alarm-danger">{formatNumber(d.steam, 2)}</td>
                      <td className="py-3 px-3 text-right data-value text-industrial-100">{formatNumber(d.water, 1)}</td>
                      <td className="py-3 px-3 text-right data-value text-white font-bold">{formatNumber(d.total, 2)}</td>
                      <td className={`py-3 px-3 text-right font-medium ${isDown ? 'text-alarm-success' : 'text-alarm-danger'}`}>
                        {isDown ? '↓' : '↑'} {Math.abs(Number(compare))}%
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          isSelected ? 'bg-primary-600 text-white' : 'bg-dark-700 text-dark-400'
                        }`}>
                          {isSelected ? '查看中' : '详情'}
                        </span>
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
