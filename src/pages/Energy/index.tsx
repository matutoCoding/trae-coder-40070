import { useMemo, useState } from 'react';
import {
  Gauge,
  Zap,
  Flame,
  Droplets,
  Activity,
  TrendingDown,
  PieChart as PieChartIcon,
  Factory,
  TrendingUp,
  Info,
  Filter,
  RotateCcw,
  Check,
} from 'lucide-react';
import Layout from '@/components/layout/Layout';
import Card from '@/components/ui/Card';
import MetricCard from '@/components/ui/MetricCard';
import AreaChart from '@/components/charts/AreaChart';
import PieChart from '@/components/charts/PieChart';
import LineChart from '@/components/charts/LineChart';
import { useAppStore } from '@/store/appStore';
import {
  formatNumber,
  getEnergyWithOutputAnalysis,
  getTodayLocalStr,
  getDateDaysAgo,
  getTodayEnergy,
  filterEnergyByRange,
  getEfficiencyTag,
  getEfficiencyLabel,
  getEfficiencyColor,
  getEfficiencyBg,
} from '@/utils/helpers';

const QUICK_RANGES = [
  { label: '近7天', days: 6 },
  { label: '近14天', days: 13 },
];

export default function Energy() {
  const { energyData, productionData } = useAppStore();
  const [selectedDate, setSelectedDate] = useState<string | null>(getTodayLocalStr());
  const [startDate, setStartDate] = useState(getDateDaysAgo(6));
  const [endDate, setEndDate] = useState(getTodayLocalStr());
  const [activeRange, setActiveRange] = useState(0);

  const todayEnergy = getTodayEnergy(energyData);
  const todayIndex = energyData.findIndex((e) => e.fullDate === getTodayLocalStr());
  const prevEnergy = todayIndex > 0 ? energyData[todayIndex - 1] : energyData[1] || todayEnergy;

  const filteredEnergy = useMemo(() => {
    return filterEnergyByRange(energyData, startDate, endDate);
  }, [energyData, startDate, endDate]);

  const avgOutput = filteredEnergy.reduce((s, d) => s + d.output, 0) / Math.max(1, filteredEnergy.length);
  const avgEnergyVal = filteredEnergy.reduce((s, d) => s + d.total, 0) / Math.max(1, filteredEnergy.length);

  const coalSaving = prevEnergy && todayEnergy ? (((prevEnergy.coal - todayEnergy.coal) / prevEnergy.coal) * 100).toFixed(2) : '0';
  const powerSaving = prevEnergy && todayEnergy ? (((prevEnergy.power - todayEnergy.power) / prevEnergy.power) * 100).toFixed(2) : '0';
  const outputTrend = prevEnergy && todayEnergy ? (((todayEnergy.output - prevEnergy.output) / prevEnergy.output) * 100).toFixed(1) : '0';

  const totalSeries = [
    { name: '吨煤 (t/tNH₃)', data: filteredEnergy.map((d) => d.coal), color: '#ffa726' },
    { name: '电力 (×100 kWh/t)', data: filteredEnergy.map((d) => d.power / 100), color: '#3d8bfd' },
    { name: '蒸汽 (t/tNH₃)', data: filteredEnergy.map((d) => d.steam), color: '#ff4757' },
    { name: '水 (×10 m³/t)', data: filteredEnergy.map((d) => d.water / 10), color: '#06b6d4' },
  ];

  const totalEnergyData = filteredEnergy.map((d) => ({ time: d.date, value: d.total }));

  const selectedRecord = useMemo(() => {
    if (!selectedDate) return null;
    return energyData.find((e) => e.fullDate === selectedDate);
  }, [energyData, selectedDate]);

  const selectedIndex = energyData.findIndex((e) => e.fullDate === selectedDate);
  const selectedPrev = selectedIndex > 0 ? energyData[selectedIndex - 1] : undefined;

  const analysis = useMemo(() => {
    if (!selectedRecord) return null;
    return getEnergyWithOutputAnalysis(selectedRecord, selectedPrev);
  }, [selectedRecord, selectedPrev]);

  const selectedShiftData = useMemo(() => {
    if (!selectedDate) return [];
    return productionData.filter((p) => p.fullDate === selectedDate);
  }, [productionData, selectedDate]);

  const handleQuickRange = (days: number, idx: number) => {
    setActiveRange(idx);
    setStartDate(getDateDaysAgo(days));
    setEndDate(getTodayLocalStr());
  };

  const resetFilters = () => {
    setActiveRange(0);
    setStartDate(getDateDaysAgo(6));
    setEndDate(getTodayLocalStr());
  };

  return (
    <Layout title="能耗分析 · 吨氨能耗分析">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <MetricCard
            label="吨氨综合能耗"
            value={todayEnergy?.total || 0}
            unit="GJ/t"
            decimals={2}
            icon={<Gauge size={20} />}
            trend={prevEnergy && todayEnergy ? Number((((todayEnergy.total - prevEnergy.total) / prevEnergy.total) * 100).toFixed(1)) : 0}
            trendLabel="较昨日"
            color="text-alarm-success"
          />
          <MetricCard
            label="今日合成氨产量"
            value={todayEnergy?.output || 0}
            unit="吨"
            decimals={1}
            icon={<Factory size={20} />}
            trend={Number(outputTrend)}
            trendLabel="较昨日"
            color="text-primary-400"
          />
          <MetricCard
            label="吨氨耗原料煤"
            value={todayEnergy?.coal || 0}
            unit="t/t"
            decimals={3}
            icon={<Flame size={20} />}
            trend={-Number(coalSaving)}
            trendLabel="较昨日"
            color="text-alarm-warning"
          />
          <MetricCard
            label="吨氨耗电"
            value={todayEnergy?.power || 0}
            unit="kWh/t"
            decimals={0}
            icon={<Zap size={20} />}
            trend={-Number(powerSaving)}
            trendLabel="较昨日"
            color="text-primary-400"
          />
          <MetricCard
            label="吨氨耗蒸汽"
            value={todayEnergy?.steam || 0}
            unit="t/t"
            decimals={2}
            icon={<Activity size={20} />}
            color="text-alarm-danger"
          />
        </div>

        <Card title="筛选区间" icon={<Filter size={16} />}>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1 bg-dark-700/50 rounded-lg p-1">
              {QUICK_RANGES.map((r, i) => (
                <button
                  key={r.label}
                  onClick={() => handleQuickRange(r.days, i)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    activeRange === i ? 'bg-primary-600 text-white' : 'text-dark-300 hover:text-white hover:bg-dark-600'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={startDate}
                onChange={(e) => { setStartDate(e.target.value); setActiveRange(-1); }}
                className="bg-dark-700 border border-dark-600 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-primary-500"
              />
              <span className="text-dark-400">至</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => { setEndDate(e.target.value); setActiveRange(-1); }}
                className="bg-dark-700 border border-dark-600 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-primary-500"
              />
            </div>
            <button onClick={resetFilters} className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-dark-700 hover:bg-dark-600 text-dark-300 hover:text-white text-sm transition-colors">
              <RotateCcw size={14} /> 重置
            </button>
          </div>
        </Card>

        <Card title="日期对比视图" icon={<Activity size={16} />} extra="点击日期查看详情">
          <div className="grid grid-cols-7 gap-2">
            {filteredEnergy.map((d) => {
              const tag = getEfficiencyTag(d, avgOutput, avgEnergyVal);
              const isSelected = selectedDate === d.fullDate;
              const isToday = d.fullDate === getTodayLocalStr();
              return (
                <button
                  key={d.fullDate}
                  onClick={() => setSelectedDate(d.fullDate)}
                  className={`p-2 rounded-lg border text-left transition-all ${
                    isSelected ? 'border-primary-500 ring-1 ring-primary-500/50' : getEfficiencyBg(tag)
                  } ${isToday ? 'ring-1 ring-primary-400/30' : ''}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs font-mono ${isSelected ? 'text-white' : 'text-dark-200'}`}>{d.date}</span>
                    <span className={`text-[9px] px-1 py-0.5 rounded font-medium ${getEfficiencyColor(tag)}`}>
                      {getEfficiencyLabel(tag)}
                    </span>
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-dark-400">产量</span>
                      <span className="font-mono text-primary-400">{d.output.toFixed(0)}t</span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-dark-400">能耗</span>
                      <span className={`font-mono ${tag === 'excellent' ? 'text-alarm-success' : tag === 'poor' ? 'text-alarm-danger' : 'text-white'}`}>
                        {d.total.toFixed(1)}
                      </span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-dark-400">煤</span>
                      <span className="font-mono text-alarm-warning">{d.coal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-dark-400">电</span>
                      <span className="font-mono text-primary-400">{d.power.toFixed(0)}</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
          <div className="flex items-center gap-4 mt-3 text-xs text-dark-400">
            <span>效率标签：</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-alarm-success"></span> 高产低耗</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-primary-400"></span> 运行良好</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-dark-500"></span> 运行正常</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-alarm-danger"></span> 低产高耗</span>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card title="综合能耗趋势" icon={<Activity size={16} />} className="lg:col-span-2" extra="点击数据点查看详情">
            <LineChart
              data={totalEnergyData}
              title="综合能耗"
              unit=" GJ/t"
              color="#00d4aa"
              height={240}
              onDataClick={(idx) => {
                if (filteredEnergy[idx]) setSelectedDate(filteredEnergy[idx].fullDate);
              }}
              highlightIndex={selectedDate ? filteredEnergy.findIndex((e) => e.fullDate === selectedDate) : -1}
            />
          </Card>

          <Card
            title={selectedDate ? `${selectedDate.slice(5).replace('-', '/')} 能耗详情` : '能源结构占比'}
            icon={<PieChartIcon size={16} />}
          >
            {analysis ? (
              <div className="space-y-3">
                <PieChart data={analysis.breakdown} colors={['#ffa726', '#3d8bfd', '#ff4757', '#06b6d4', '#a855f7']} height={200} />
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
                data={[{ name: '原料煤', value: 42 }, { name: '电力', value: 28 }, { name: '蒸汽', value: 18 }, { name: '循环水', value: 8 }, { name: '其他', value: 4 }]}
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
            extra={<button onClick={() => setSelectedDate(null)} className="text-xs text-dark-400 hover:text-white transition-colors">关闭详情</button>}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-lg bg-dark-700/30 border border-dark-600">
                <div className="text-xs text-dark-400 mb-1">当日产量</div>
                <div className="text-2xl font-display font-bold text-primary-400">
                  {formatNumber(selectedRecord.output, 1)}<span className="text-sm font-normal text-dark-400 ml-1">吨</span>
                </div>
                <div className={`text-xs mt-1 ${analysis.outputChange >= 0 ? 'text-alarm-danger' : 'text-alarm-success'}`}>
                  {analysis.outputChange >= 0 ? '↑' : '↓'} {Math.abs(analysis.outputChange).toFixed(1)}% 较昨日
                </div>
              </div>
              <div className="p-4 rounded-lg bg-dark-700/30 border border-dark-600">
                <div className="text-xs text-dark-400 mb-1">综合能耗</div>
                <div className="text-2xl font-display font-bold text-alarm-success">
                  {formatNumber(selectedRecord.total, 2)}<span className="text-sm font-normal text-dark-400 ml-1">GJ/t</span>
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
                <div className="text-[11px] text-alarm-success mt-1">产量每提高10%，能耗降低约2.5%</div>
              </div>
              <div className="p-4 rounded-lg bg-dark-700/30 border border-dark-600">
                <div className="text-xs text-dark-400 mb-1">分项能耗</div>
                <div className="space-y-1 mt-2">
                  <div className="flex justify-between text-xs"><span className="text-alarm-warning">煤</span><span className="text-white font-mono">{selectedRecord.coal.toFixed(3)} t/t</span></div>
                  <div className="flex justify-between text-xs"><span className="text-primary-400">电</span><span className="text-white font-mono">{selectedRecord.power.toFixed(0)} kWh/t</span></div>
                  <div className="flex justify-between text-xs"><span className="text-alarm-danger">蒸汽</span><span className="text-white font-mono">{selectedRecord.steam.toFixed(2)} t/t</span></div>
                  <div className="flex justify-between text-xs"><span className="text-industrial-100">水</span><span className="text-white font-mono">{selectedRecord.water.toFixed(1)} m³/t</span></div>
                </div>
              </div>
            </div>

            <div className="mt-4 p-4 rounded-lg bg-dark-700/30 border border-dark-600">
              <h5 className="text-sm font-medium text-white mb-3">班次产量与能耗表现</h5>
              <div className="grid grid-cols-3 gap-3">
                {selectedShiftData.length === 0 ? (
                  <div className="col-span-3 text-center py-4 text-dark-400 text-sm">该日暂无班次数据</div>
                ) : (
                  selectedShiftData.map((s, i) => {
                    const rate = ((s.output / s.target) * 100).toFixed(1);
                    const shiftEnergyBase = selectedRecord.total;
                    const shiftContribution = (s.output / selectedRecord.output) * 100;
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
                          <span className={`text-xs font-bold ${
                            Number(rate) >= 95 ? 'text-alarm-success' : Number(rate) >= 85 ? 'text-alarm-warning' : 'text-alarm-danger'
                          }`}>{rate}%</span>
                        </div>
                        <div className="space-y-1 text-xs">
                          <div className="flex justify-between">
                            <span className="text-dark-400">产量</span>
                            <span className="text-white font-mono">{s.output.toFixed(1)} t</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-dark-400">贡献占比</span>
                            <span className="text-white font-mono">{shiftContribution.toFixed(1)}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-dark-400">估算能耗</span>
                            <span className={`font-mono ${
                              shiftEnergyBase > avgEnergyVal ? 'text-alarm-danger' : 'text-alarm-success'
                            }`}>{(shiftEnergyBase * (1 + (Math.random() - 0.5) * 0.04)).toFixed(2)} GJ/t</span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="mt-4 p-3 rounded-lg bg-primary-500/5 border border-primary-500/20">
              <div className="flex items-start gap-2">
                <Info size={16} className="text-primary-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <span className="text-primary-400 font-medium">分析结论：</span>
                  <span className="text-dark-300">
                    {analysis.isHighOutput
                      ? `当日产量 ${selectedRecord.output.toFixed(0)} 吨高于日均 ${avgOutput.toFixed(0)} 吨，由于规模效应，吨氨综合能耗 ${selectedRecord.total.toFixed(2)} GJ/t ${analysis.totalChange < 0 ? '下降' : '上升'} ${Math.abs(analysis.totalChange).toFixed(1)}%，表现${analysis.totalChange < 0 ? '优秀' : '有待提升'}。`
                      : `当日产量 ${selectedRecord.output.toFixed(0)} 吨低于日均 ${avgOutput.toFixed(0)} 吨，吨氨综合能耗 ${selectedRecord.total.toFixed(2)} GJ/t ${analysis.totalChange < 0 ? '下降' : '上升'} ${Math.abs(analysis.totalChange).toFixed(1)}%。建议优化生产负荷，提高产量可进一步降低单位能耗。`}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card title="分项能耗堆叠趋势" icon={<Activity size={16} />}>
            <AreaChart categories={filteredEnergy.map((d) => d.date)} series={totalSeries} unit="" stacked={true} height={240} />
          </Card>
          <Card title="产量与能耗对比" icon={<TrendingUp size={16} />}>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-xs text-dark-400 w-12">产量</span>
                <div className="flex-1 flex gap-1">
                  {filteredEnergy.map((d) => {
                    const tag = getEfficiencyTag(d, avgOutput, avgEnergyVal);
                    return (
                      <div key={d.fullDate} className="flex-1 flex flex-col items-center">
                        <div className="w-full rounded-t relative" style={{ height: `${(d.output / 170) * 80}px`, background: tag === 'poor' ? 'rgba(255,71,87,0.1)' : 'rgba(0,212,170,0.1)' }}>
                          <div
                            className={`absolute bottom-0 w-full rounded-t transition-all ${selectedDate === d.fullDate ? 'bg-primary-400' : tag === 'poor' ? 'bg-alarm-danger/70' : 'bg-primary-600/60'}`}
                            style={{ height: `${(d.output / 170) * 100}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-dark-500 mt-1 font-mono">{d.date}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-dark-400 w-12">能耗</span>
                <div className="flex-1 flex gap-1">
                  {filteredEnergy.map((d) => {
                    const tag = getEfficiencyTag(d, avgOutput, avgEnergyVal);
                    return (
                      <div key={d.fullDate} className="flex-1 flex flex-col items-center">
                        <div className="w-full rounded-t relative" style={{ height: `${((42 - d.total) / 8) * 80}px`, background: tag === 'poor' ? 'rgba(255,71,87,0.1)' : 'rgba(0,212,170,0.1)' }}>
                          <div
                            className={`absolute bottom-0 w-full rounded-t transition-all ${selectedDate === d.fullDate ? 'bg-alarm-success' : tag === 'poor' ? 'bg-alarm-danger/50' : 'bg-alarm-success/60'}`}
                            style={{ height: `${((42 - d.total) / 8) * 100}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-dark-500 mt-1 font-mono">{d.total.toFixed(1)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="flex justify-between text-[11px] text-dark-500 px-14">
                <div className="flex items-center gap-1.5"><span className="w-3 h-1.5 rounded bg-primary-400"></span><span>产量 - 越高越好</span></div>
                <div className="flex items-center gap-1.5"><span className="w-3 h-1.5 rounded bg-alarm-success"></span><span>能耗 - 越低越好</span></div>
                <div className="flex items-center gap-1.5"><span className="w-3 h-1.5 rounded bg-alarm-danger"></span><span>低产高耗</span></div>
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
                  <th className="text-right py-3 px-3 font-medium">吨煤</th>
                  <th className="text-right py-3 px-3 font-medium">电力</th>
                  <th className="text-right py-3 px-3 font-medium">蒸汽</th>
                  <th className="text-right py-3 px-3 font-medium">水</th>
                  <th className="text-right py-3 px-3 font-medium">综合能耗</th>
                  <th className="text-center py-3 px-3 font-medium">效率</th>
                  <th className="text-center py-3 px-3 font-medium">操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredEnergy.map((d, i, arr) => {
                  const prevD = arr[i + 1];
                  const compare = prevD ? (((d.total - prevD.total) / prevD.total) * 100).toFixed(2) : '0.00';
                  const isDown = Number(compare) < 0;
                  const isSelected = selectedDate === d.fullDate;
                  const tag = getEfficiencyTag(d, avgOutput, avgEnergyVal);
                  return (
                    <tr key={d.fullDate} className={`border-b border-dark-600/50 cursor-pointer transition-colors ${isSelected ? 'bg-primary-500/10' : 'hover:bg-dark-600/30'}`} onClick={() => setSelectedDate(d.fullDate)}>
                      <td className="py-3 px-3 text-dark-200 font-mono">{d.date}</td>
                      <td className="py-3 px-3 text-right data-value text-primary-400">{formatNumber(d.output, 1)}</td>
                      <td className="py-3 px-3 text-right data-value text-alarm-warning">{formatNumber(d.coal, 3)}</td>
                      <td className="py-3 px-3 text-right data-value text-primary-400">{formatNumber(d.power, 0)}</td>
                      <td className="py-3 px-3 text-right data-value text-alarm-danger">{formatNumber(d.steam, 2)}</td>
                      <td className="py-3 px-3 text-right data-value text-industrial-100">{formatNumber(d.water, 1)}</td>
                      <td className="py-3 px-3 text-right data-value text-white font-bold">{formatNumber(d.total, 2)}</td>
                      <td className="py-3 px-3 text-center"><span className={`text-xs px-2 py-0.5 rounded border ${getEfficiencyBg(tag)} ${getEfficiencyColor(tag)}`}>{getEfficiencyLabel(tag)}</span></td>
                      <td className="py-3 px-3 text-center"><span className={`text-xs px-2 py-0.5 rounded ${isSelected ? 'bg-primary-600 text-white' : 'bg-dark-700 text-dark-400'}`}>{isSelected ? '查看中' : '详情'}</span></td>
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
