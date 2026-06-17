import { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

interface SeriesData {
  name: string;
  data: number[];
  color: string;
}

interface AreaChartProps {
  categories: string[];
  series: SeriesData[];
  title?: string;
  unit?: string;
  height?: number;
  stacked?: boolean;
}

export default function AreaChart({
  categories,
  series,
  title,
  unit,
  height = 260,
  stacked = false,
}: AreaChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const instanceRef = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;
    if (!instanceRef.current) {
      instanceRef.current = echarts.init(chartRef.current);
    }

    const option: echarts.EChartsOption = {
      grid: { left: 45, right: 15, top: title ? 40 : 10, bottom: 30 },
      title: title
        ? {
            text: title,
            left: 0,
            top: 0,
            textStyle: {
              color: '#e8eaed',
              fontSize: 12,
              fontWeight: 600,
              fontFamily: 'Orbitron, sans-serif',
            },
          }
        : undefined,
      legend: {
        right: 0,
        top: 0,
        textStyle: { color: '#a4abb5', fontSize: 11 },
        itemWidth: 14,
        itemHeight: 6,
      },
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#1a2733',
        borderColor: '#334e68',
        textStyle: { color: '#e8eaed' },
        valueFormatter: (v: any) => `${v}${unit || ''}`,
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: categories,
        axisLine: { lineStyle: { color: '#334e68' } },
        axisLabel: { color: '#7a8391', fontSize: 10 },
        axisTick: { show: false },
      },
      yAxis: {
        type: 'value',
        axisLine: { show: false },
        axisLabel: { color: '#7a8391', fontSize: 10 },
        splitLine: { lineStyle: { color: '#243144', type: 'dashed' } },
      },
      series: series.map((s) => ({
        name: s.name,
        type: 'line',
        stack: stacked ? 'total' : undefined,
        smooth: true,
        symbol: 'none',
        lineStyle: { color: s.color, width: 1.5 },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: s.color + '70' },
            { offset: 1, color: s.color + '05' },
          ]),
        },
        data: s.data,
      })),
    };

    instanceRef.current.setOption(option);

    const handleResize = () => instanceRef.current?.resize();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [categories, series, title, unit, stacked]);

  return <div ref={chartRef} style={{ height }} className="w-full" />;
}
