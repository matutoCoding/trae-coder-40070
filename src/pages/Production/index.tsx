import { BarChart3, Target, TrendingUp, Calendar } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import Card from '@/components/ui/Card';
import MetricCard from '@/components/ui/MetricCard';
import BarChart from '@/components/charts/BarChart';
import LineChart from '@/components/charts/LineChart';
import { useAppStore } from '@/store/appStore';
import { formatNumber } from '@/utils/helpers';
import { generateTimeSeries } from '@/data/mockData';

export default function Production() {
  const { productionData } = useAppStore();

  const categories = productionData.map((p) => `${p.date.slice(-2)} ${p.shift}`);
  const outputs = productionData.map((p) => p.output);
  const targets = productionData.map((p) => p.target);

  const totalOutput = productionData.reduce((sum, p) => sum + p.output, 0);
  const totalTarget = productionData.reduce((sum, p) => sum + p.target, 0);
  const achievement = (totalOutput / totalTarget) * 100;

  const dailyOutputs = productionData.slice(0, 3).reduce((sum, p) => sum + p.output, 0);
  const avgOutput = totalOutput / productionData.length;

  const hourlyTrend = generateTimeSeries(48, 16.8, 1.8);
  const dailyTrend = generateTimeSeries(14, 52, 6);

  return (
    <Layout title="产量统计 · 合成氨产量分析">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            label="今日累计产量"
            value={dailyOutputs}
            unit="吨"
            decimals={1}
            icon={<BarChart3 size={20} />}
            trend={4.2}
            trendLabel="较昨日"
            color="text-primary-400"
          />
          <MetricCard
            label="本月累计产量"
            value={totalOutput}
            unit="吨"
            decimals={0}
            icon={<TrendingUp size={20} />}
            trend={2.8}
            trendLabel="较上月"
            color="text-industrial-100"
          />
          <MetricCard
            label="目标达成率"
            value={achievement}
            unit="%"
            decimals={1}
            icon={<Target size={20} />}
            color={achievement >= 95 ? 'text-alarm-success' : 'text-alarm-warning'}
          />
          <MetricCard
            label="班均产量"
            value={avgOutput}
            unit="吨"
            decimals={1}
            icon={<Calendar size={20} />}
            color="text-alarm-warning"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card title="各班产量与目标对比" icon={<BarChart3 size={16} />}>
            <BarChart
              categories={categories}
              values={outputs}
              target={targets}
              unit=" 吨"
              color="#00d4aa"
              targetColor="#ffa726"
              height={300}
            />
          </Card>

          <Card title="产量达成进度" icon={<Target size={16} />}>
            <div className="space-y-6 py-2">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-white">月度目标</span>
                  <span className="font-display font-bold text-primary-400">
                    {formatNumber(totalOutput, 0)} / {formatNumber(totalTarget, 0)} 吨
                  </span>
                </div>
                <div className="h-4 rounded-full bg-dark-600 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary-700 to-primary-400 transition-all duration-1000"
                    style={{ width: `${Math.min(100, achievement)}%` }}
                  />
                </div>
                <div className="flex justify-between mt-1 text-xs text-dark-400">
                  <span>0</span>
                  <span>{formatNumber(totalTarget, 0)} 吨</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="p-4 rounded bg-dark-800 text-center">
                  <div className="text-xs text-dark-400">早班均产</div>
                  <div className="font-display font-bold text-lg text-primary-400 mt-1">
                    {formatNumber(productionData.filter((p) => p.shift === '早班').reduce((s, p) => s + p.output, 0) / 5, 1)} t
                  </div>
                </div>
                <div className="p-4 rounded bg-dark-800 text-center">
                  <div className="text-xs text-dark-400">中班均产</div>
                  <div className="font-display font-bold text-lg text-industrial-100 mt-1">
                    {formatNumber(productionData.filter((p) => p.shift === '中班').reduce((s, p) => s + p.output, 0) / 5, 1)} t
                  </div>
                </div>
                <div className="p-4 rounded bg-dark-800 text-center">
                  <div className="text-xs text-dark-400">晚班均产</div>
                  <div className="font-display font-bold text-lg text-alarm-warning mt-1">
                    {formatNumber(productionData.filter((p) => p.shift === '晚班').reduce((s, p) => s + p.output, 0) / 4, 1)} t
                  </div>
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
                      {productionData.slice(0, 10).map((p, i) => {
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
                      })}
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
