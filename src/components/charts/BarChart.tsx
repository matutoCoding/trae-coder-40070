import { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

interface BarChartProps {
  categories: string[];
  values: number[];
  target?: number[];
  title?: string;
  color?: string;
  targetColor?: string;
  unit?: string;
  height?: number;
}

export default function BarChart({
  categories,
  values,
  target,
  title,
  color = '#00d4aa',
  targetColor = '#ffa726',
  unit,
  height = 260,
}: BarChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const instanceRef = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;
    if (!instanceRef.current) {
      instanceRef.current = echarts.init(chartRef.current);
    }

    const series: echarts.SeriesOption[] = [
      {
        type: 'bar',
        name: '实际',
        data: values,
        barWidth: '45%',
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: color },
            { offset: 1, color: color + '50' },
          ]),
          borderRadius: [3, 3, 0, 0],
        },
      },
    ];

    if (target) {
      series.push({
        type: 'bar',
        name: '目标',
        data: target,
        barWidth: '45%',
        itemStyle: {
          color: targetColor + '40',
          borderColor: targetColor,
          borderWidth: 1,
          borderRadius: [3, 3, 0, 0],
        },
      });
    }

    const option: echarts.EChartsOption = {
      grid: { left: 45, right: 15, top: title ? 35 : 10, bottom: 30 },
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
      legend: target
        ? {
            right: 0,
            top: 0,
            textStyle: { color: '#a4abb5', fontSize: 11 },
            itemWidth: 10,
            itemHeight: 10,
          }
        : undefined,
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#1a2733',
        borderColor: '#334e68',
        textStyle: { color: '#e8eaed' },
        valueFormatter: (v: any) => `${v}${unit || ''}`,
      },
      xAxis: {
        type: 'category',
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
      series,
    };

    instanceRef.current.setOption(option);

    const handleResize = () => instanceRef.current?.resize();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [categories, values, target, title, color, targetColor, unit]);

  return <div ref={chartRef} style={{ height }} className="w-full" />;
}
