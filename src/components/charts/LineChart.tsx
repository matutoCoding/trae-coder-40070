import { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import { cn } from '@/utils/helpers';

interface LineChartProps {
  data: { time: string; value: number }[];
  title?: string;
  color?: string;
  unit?: string;
  height?: number;
  smooth?: boolean;
  area?: boolean;
  className?: string;
}

export default function LineChart({
  data,
  title,
  color = '#00d4aa',
  unit,
  height = 200,
  smooth = true,
  area = true,
  className,
}: LineChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const instanceRef = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;
    if (!instanceRef.current) {
      instanceRef.current = echarts.init(chartRef.current);
    }

    const option: echarts.EChartsOption = {
      grid: { left: 45, right: 15, top: title ? 30 : 10, bottom: 25 },
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
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#1a2733',
        borderColor: '#334e68',
        textStyle: { color: '#e8eaed' },
        formatter: (params: any) => {
          const p = Array.isArray(params) ? params[0] : params;
          return `${p.axisValue}<br/>${p.marker}${title || ''}: <b>${p.value}</b>${unit || ''}`;
        },
      },
      xAxis: {
        type: 'category',
        data: data.map((d) => d.time),
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
      series: [
        {
          type: 'line',
          data: data.map((d) => d.value),
          smooth,
          symbol: 'none',
          lineStyle: { color, width: 2 },
          itemStyle: { color },
          areaStyle: area
            ? {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  { offset: 0, color: color + '60' },
                  { offset: 1, color: color + '05' },
                ]),
              }
            : undefined,
        },
      ],
    };

    instanceRef.current.setOption(option);

    const handleResize = () => instanceRef.current?.resize();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [data, title, color, unit, smooth, area]);

  return <div ref={chartRef} style={{ height }} className={cn('w-full', className)} />;
}
