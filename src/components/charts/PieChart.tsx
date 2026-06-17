import { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

interface PieChartProps {
  data: { name: string; value: number }[];
  title?: string;
  colors?: string[];
  height?: number;
  donut?: boolean;
}

export default function PieChart({
  data,
  title,
  colors = ['#00d4aa', '#3d8bfd', '#ffa726', '#ff4757', '#a855f7', '#2ed573'],
  height = 240,
  donut = true,
}: PieChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const instanceRef = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;
    if (!instanceRef.current) {
      instanceRef.current = echarts.init(chartRef.current);
    }

    const option: echarts.EChartsOption = {
      grid: { left: 0, right: 0, top: 0, bottom: 0 },
      title: title
        ? {
            text: title,
            left: 'center',
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
        trigger: 'item',
        backgroundColor: '#1a2733',
        borderColor: '#334e68',
        textStyle: { color: '#e8eaed' },
        formatter: '{b}: {c}% ({d}%)',
      },
      legend: {
        orient: 'vertical',
        right: 10,
        top: 'center',
        textStyle: { color: '#a4abb5', fontSize: 11 },
        itemWidth: 10,
        itemHeight: 10,
        itemGap: 8,
      },
      color: colors,
      series: [
        {
          type: 'pie',
          radius: donut ? ['45%', '70%'] : '70%',
          center: ['35%', '55%'],
          avoidLabelOverlap: true,
          itemStyle: {
            borderColor: '#1a2733',
            borderWidth: 2,
          },
          label: { show: false },
          labelLine: { show: false },
          data,
        },
      ],
    };

    instanceRef.current.setOption(option);

    const handleResize = () => instanceRef.current?.resize();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [data, title, colors, donut]);

  return <div ref={chartRef} style={{ height }} className="w-full" />;
}
