import { useMemo, useState } from 'react';
import { BarChart3, Target, TrendingUp, Calendar, Filter, RotateCcw, Check } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import Card from '@/components/ui/Card';
import MetricCard from '@/components/ui/MetricCard';
import BarChart from '@/components/charts/BarChart';
import LineChart from '@/components/charts/LineChart';
import { useAppStore } from '@/store/appStore';
import { generateTimeSeries } from '@/data/mockData';
import {
  formatNumber,
  getTodayLocalStr,
  getDateDaysAgo,
  filterProduction,
  aggregateProductionStats,
  getDateShiftEnergy,
} from '@/utils/helpers';
import type { Shift } from '@/types';

const SHIFT_OPTIONS: { value: Shift | 'all'; label: string }[] = [
  { value: 'all', label: '全部班次' },
  { value: '早班', label: '早班' },
  { value: '中班', label: '中班' },
  { value: '晚班', label: '晚班' },
];

const QUICK_RANGES = [
  { label: '今日', days: 0 },
  { label: '近3天', days: 2 },
  { label: '近7天', days: 6 },
  { label: '近14天', days: 13 },
];

export default function Production() {
  const { productionData, energyData } = useAppStore();

  const [startDate, setStartDate] = useState(getDateDaysAgo(6));
  const [endDate, setEndDate] = useState(getTodayLocalStr());
  const [selectedShifts, setSelectedShifts] = useState<Shift[] | 'all'>('all');
  const [activeRange, setActiveRange] = useState(2);

  const todayShiftData = useMemo(
    () => getDateShiftEnergy(productionData, energyData, getTodayLocalStr()),
    [productionData, energyData]
  );
  const yesterdayShiftData = useMemo(
    () => getDateShiftEnergy(productionData, energyData, getDateDaysAgo(1)),
    [productionData, energyData]
  );
  const todayOutput = todayShiftData.totalOutput;
  const yesterdayOutput = yesterdayShiftData.totalOutput;
  const outputTrend = yesterdayOutput > 0
    ? (((todayOutput - yesterdayOutput) / yesterdayOutput) * 100)
    : 0;

  const todayProduction = useMemo(() => {
    const today = getTodayLocalStr();
    return productionData.filter((p) => p.fullDate === today);
  }, [productionData]);

  const filteredData = useMemo(() => {
    return filterProduction(productionData, startDate, endDate, selectedShifts);
  }, [productionData, startDate, endDate, selectedShifts]);

  const stats = useMemo(() => aggregateProductionStats(filteredData), [filteredData]);

  const chartCategories = filteredData.map((p) => `${p.date.slice(-2)} ${p.shift}`);
  const chartOutputs = filteredData.map((p) => p.output);
  const chartTargets = filteredData.map((p) => p.target);

  const hourlyTrend = generateTimeSeries(48, 16.8, 1.8);
  const dailyTrend = generateTimeSeries(14, 52, 6);

  const handleQuickRange = (days: number, idx: number) => {
    setActiveRange(idx);
    setStartDate(getDateDaysAgo(days));
    setEndDate(getTodayLocalStr());
  };

  const toggleShift = (shift: Shift) => {
    if (selectedShifts === 'all') {
      setSelectedShifts([shift]);
    } else {
      const hasShift = selectedShifts.includes(shift);
      if (hasShift) {
        const newShifts = selectedShifts.filter((s) => s !== shift);
        setSelectedShifts(newShifts.length === 0 ? 'all' : newShifts);
      } else {
        setSelectedShifts([...selectedShifts, shift]);
      }
    }
  };

  const resetFilters = () => {
    setActiveRange(2);
    setStartDate(getDateDaysAgo(6));
    setEndDate(getTodayLocalStr());
    setSelectedShifts('all');
  };

  const isShiftSelected = (shift: Shift) => {
    return selectedShifts === 'all' || selectedShifts.includes(shift);
  };

  return (
    <Layout title="产量统计 · 合成氨产量分析">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            label="今日累计产量"
            value={todayOutput}
            unit="吨"
            decimals={1}
            icon={<BarChart3 size={20} />}
            trend={Number(outputTrend.toFixed(1))}
            trendLabel="较昨日"
            color="text-primary-400"
          />
          <MetricCard
            label="筛选区间总产量"
            value={stats.totalOutput}
            unit="吨"
            decimals={0}
            icon={<TrendingUp size={20} />}
            color="text-industrial-100"
          />
          <MetricCard
            label="筛选区间目标达成率"
            value={stats.achievement}
            unit="%"
            decimals={1}
            icon={<Target size={20} />}
            color={stats.achievement >= 95 ? 'text-alarm-success' : 'text-alarm-warning'}
          />
          <MetricCard
            label="筛选区间班均产量"
            value={stats.avgOutput}
            unit="吨"
            decimals={1}
            icon={<Calendar size={20} />}
            color="text-alarm-warning"
          />
        </div>

        <Card title="筛选分析区" icon={<Filter size={16} />}>
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1 bg-dark-700/50 rounded-lg p-1">
                {QUICK_RANGES.map((r, i) => (
                  <button
                    key={r.label}
                    onClick={() => handleQuickRange(r.days, i)}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      activeRange === i
                        ? 'bg-primary-600 text-white'
                        : 'text-dark-300 hover:text-white hover:bg-dark-600'
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
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setActiveRange(-1);
                  }}
                  className="bg-dark-700 border border-dark-600 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-primary-500"
                />
                <span className="text-dark-400">至</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setActiveRange(-1);
                  }}
                  className="bg-dark-700 border border-dark-600 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-primary-500"
                />
              </div>

              <button
                onClick={resetFilters}
                className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-dark-700 hover:bg-dark-600 text-dark-300 hover:text-white text-sm transition-colors"
              >
                <RotateCcw size={14} />
                重置
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-dark-400 mr-1">班次筛选:</span>
              {SHIFT_OPTIONS.map((opt) => {
                if (opt.value === 'all') {
                  const isActive = selectedShifts === 'all';
                  return (
                    <button
                      key={opt.value}
                      onClick={() => setSelectedShifts('all')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-primary-600 text-white'
                          : 'bg-dark-700 text-dark-300 hover:text-white hover:bg-dark-600'
                      }`}
                    >
                      {isActive && <Check size={14} />}
                      {opt.label}
                    </button>
                  );
                }
                const isActive = isShiftSelected(opt.value as Shift);
                return (
                  <button
                    key={opt.value}
                    onClick={() => {
                      if (opt.value === 'all') {
                        setSelectedShifts('all');
                      } else {
                        toggleShift(opt.value);
                      }
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-primary-600 text-white'
                        : 'bg-dark-700 text-dark-300 hover:text-white hover:bg-dark-600'
                    }`}
                  >
                    {isActive && <Check size={14} />}
                    {opt.label}
                  </button>
                );
              })}
              <span className="ml-auto text-sm text-dark-400">
                已筛选 <span className="text-white font-mono">{filteredData.length}</span> 条记录
              </span>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card title="各班产量与目标对比" icon={<BarChart3 size={16} />}>
            {filteredData.length > 0 ? (
              <BarChart
                categories={chartCategories}
                values={chartOutputs}
                target={chartTargets}
                unit=" 吨"
                color="#00d4aa"
                targetColor="#ffa726"
                height={300}
              />
            ) : (
              <div className="flex items-center justify-center h-[300px] text-dark-400">
                暂无符合筛选条件的数据
              </div>
            )}
          </Card>

          <Card title="产量达成进度" icon={<Target size={16} />}>
            <div className="space-y-6 py-2">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-white">区间目标达成</span>
                  <span className="font-display font-bold text-primary-400">
                    {formatNumber(stats.totalOutput, 0)} / {formatNumber(stats.totalTarget, 0)} 吨
                  </span>
                </div>
                <div className="h-4 rounded-full bg-dark-600 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary-700 to-primary-400 transition-all duration-1000"
                    style={{ width: `${Math.min(100, stats.achievement)}%` }}
                  />
                </div>
                <div className="flex justify-between mt-1 text-xs text-dark-400">
                  <span>0</span>
                  <span>{formatNumber(stats.totalTarget, 0)} 吨</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="p-4 rounded bg-dark-800 text-center">
                  <div className="text-xs text-dark-400">早班均产</div>
                  <div className="font-display font-bold text-lg text-primary-400 mt-1">
                    {formatNumber(
                      filteredData.filter((p) => p.shift === '早班').reduce((s, p) => s + p.output, 0) /
                        Math.max(1, filteredData.filter((p) => p.shift === '早班').length),
                      1
                    )} t
                  </div>
                  <div className="text-[10px] text-dark-500 mt-1">
                    {filteredData.filter((p) => p.shift === '早班').length} 个班次
                  </div>
                </div>
                <div className="p-4 rounded bg-dark-800 text-center">
                  <div className="text-xs text-dark-400">中班均产</div>
                  <div className="font-display font-bold text-lg text-industrial-100 mt-1">
                    {formatNumber(
                      filteredData.filter((p) => p.shift === '中班').reduce((s, p) => s + p.output, 0) /
                        Math.max(1, filteredData.filter((p) => p.shift === '中班').length),
                      1
                    )} t
                  </div>
                  <div className="text-[10px] text-dark-500 mt-1">
                    {filteredData.filter((p) => p.shift === '中班').length} 个班次
                  </div>
                </div>
                <div className="p-4 rounded bg-dark-800 text-center">
                  <div className="text-xs text-dark-400">晚班均产</div>
                  <div className="font-display font-bold text-lg text-alarm-warning mt-1">
                    {formatNumber(
                      filteredData.filter((p) => p.shift === '晚班').reduce((s, p) => s + p.output, 0) /
                        Math.max(1, filteredData.filter((p) => p.shift === '晚班').length),
                      1
                    )} t
                  </div>
                  <div className="text-[10px] text-dark-500 mt-1">
                    {filteredData.filter((p) => p.shift === '晚班').length} 个班次
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-white mb-3">今日班次产量</h4>
                <div className="space-y-2">
                  {todayProduction.length === 0 ? (
                    <div className="text-center py-4 text-dark-400 text-sm">今日暂无班次数据</div>
                  ) : (
                    todayProduction.map((p, i) => {
                      const rate = ((p.output / p.target) * 100).toFixed(1);
                      return (
                        <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-dark-800/50">
                          <span className={`w-12 px-2 py-0.5 rounded text-xs font-medium text-center ${
                            p.shift === '早班' ? 'bg-primary-600/20 text-primary-400' :
                            p.shift === '中班' ? 'bg-industrial-100/20 text-industrial-100' :
                            'bg-alarm-warning/20 text-alarm-warning'
                          }`}>
                            {p.shift}
                          </span>
                          <div className="flex-1">
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-dark-400">{p.date}</span>
                              <span className="text-white font-mono">{formatNumber(p.output, 1)} / {formatNumber(p.target, 1)} t</span>
                            </div>
                            <div className="h-2 rounded-full bg-dark-700 overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${
                                  Number(rate) >= 95 ? 'bg-alarm-success' : Number(rate) >= 85 ? 'bg-alarm-warning' : 'bg-alarm-danger'
                                }`}
                                style={{ width: `${Math.min(100, Number(rate))}%` }}
                              />
                            </div>
                          </div>
                          <span className={`text-sm font-bold min-w-[50px] text-right ${
                            Number(rate) >= 95 ? 'text-alarm-success' : Number(rate) >= 85 ? 'text-alarm-warning' : 'text-alarm-danger'
                          }`}>
                            {rate}%
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-white mb-3">产量记录明细</h4>
                <div className="max-h-[180px] overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-dark-400 text-xs border-b border-dark-600">
                        <th className="text-left py-2 font-medium">日期</th>
                        <th className="text-left py-2 font-medium">班次</th>
                        <th className="text-right py-2 font-medium">产量(吨)</th>
                        <th className="text-right py-2 font-medium">目标(吨)</th>
                        <th className="text-right py-2 font-medium">达成</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredData.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="text-center py-6 text-dark-400">
                            暂无符合筛选条件的数据
                          </td>
                        </tr>
                      ) : (
                        filteredData.slice(0, 15).map((p, i) => {
                          const rate = ((p.output / p.target) * 100).toFixed(1);
                          return (
                            <tr key={i} className="border-b border-dark-600/50 hover:bg-dark-600/30">
                              <td className="py-2 text-dark-200 font-mono">{p.date}</td>
                              <td className="py-2 text-dark-200">{p.shift}</td>
                              <td className="py-2 text-right data-value text-white">{formatNumber(p.output, 1)}</td>
                              <td className="py-2 text-right text-dark-400">{formatNumber(p.target, 1)}</td>
                              <td className={`py-2 text-right font-medium ${
                                Number(rate) >= 95 ? 'text-alarm-success' : Number(rate) >= 85 ? 'text-alarm-warning' : 'text-alarm-danger'
                              }`}>{rate}%</td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card title="小时产量趋势" icon={<TrendingUp size={16} />} extra="近48小时">
            <LineChart data={hourlyTrend} title="产量" unit=" t/h" color="#00d4aa" height={240} />
          </Card>
          <Card title="日产量趋势" icon={<Calendar size={16} />} extra="近14天">
            <LineChart data={dailyTrend} title="日产量" unit=" 吨" color="#a855f7" height={240} />
          </Card>
        </div>
      </div>
    </Layout>
  );
}
