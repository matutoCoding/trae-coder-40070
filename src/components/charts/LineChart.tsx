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
  onDataClick?: (index: number) => void;
  highlightIndex?: number;
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
  onDataClick,
  highlightIndex = -1,
}: LineChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const instanceRef = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;
    if (!instanceRef.current) {
      instanceRef.current = echarts.init(chartRef.current);
    }

    const seriesData = data.map((d, idx) => ({
      value: d.value,
      itemStyle:
        highlightIndex === idx
          ? { color: '#ffa726', borderColor: '#fff', borderWidth: 2 }
          : undefined,
    }));

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
        axisLabel: {
          color: (idx: number) => (highlightIndex === idx ? '#ffa726' : '#7a8391'),
          fontSize: 10,
          fontWeight: (highlightIndex >= 0 ? 'normal' : 'normal') as any,
        },
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
          data: seriesData,
          smooth,
          symbol: highlightIndex >= 0 ? 'circle' : 'none',
          symbolSize: highlightIndex >= 0 ? (idx: number) => (idx === highlightIndex ? 10 : 6) : 0,
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

    if (onDataClick) {
      instanceRef.current.off('click');
      instanceRef.current.on('click', (params: any) => {
        if (typeof params.dataIndex === 'number') {
          onDataClick(params.dataIndex);
        }
      });
    }

    const handleResize = () => instanceRef.current?.resize();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      if (onDataClick) {
        instanceRef.current?.off('click');
      }
    };
  }, [data, title, color, unit, smooth, area, onDataClick, highlightIndex]);

  return <div ref={chartRef} style={{ height }} className={cn('w-full', className)} />;
}
