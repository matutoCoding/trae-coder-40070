import { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

interface GaugeChartProps {
  value: number;
  min?: number;
  max?: number;
  title?: string;
  unit?: string;
  color?: string;
  height?: number;
}

export default function GaugeChart({
  value,
  min = 0,
  max = 100,
  title,
  unit,
  color = '#00d4aa',
  height = 180,
}: GaugeChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const instanceRef = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;
    if (!instanceRef.current) {
      instanceRef.current = echarts.init(chartRef.current);
    }

    const option: echarts.EChartsOption = {
      series: [
        {
          type: 'gauge',
          startAngle: 210,
          endAngle: -30,
          min,
          max,
          radius: '90%',
          center: ['50%', '65%'],
          splitNumber: 5,
          axisLine: {
            lineStyle: {
              width: 8,
              color: [
                [0.3, '#ff4757'],
                [0.7, '#ffa726'],
                [1, color],
              ],
            },
          },
          pointer: {
            icon: 'triangle',
            length: '60%',
            width: 8,
            itemStyle: { color: color },
          },
          axisTick: { show: false },
          splitLine: {
            distance: -12,
            length: 6,
            lineStyle: { color: '#334e68', width: 1 },
          },
          axisLabel: {
            distance: -28,
            color: '#7a8391',
            fontSize: 9,
          },
          anchor: {
            show: true,
            showAbove: true,
            size: 10,
            itemStyle: { color: color, borderColor: '#1a2733', borderWidth: 2 },
          },
          title: {
            show: !!title,
            offsetCenter: [0, '15%'],
            fontSize: 11,
            color: '#7a8391',
          },
          detail: {
            fontSize: 20,
            fontWeight: 'bold',
            color: color,
            fontFamily: 'Orbitron, sans-serif',
            offsetCenter: [0, '-10%'],
            valueAnimation: true,
            formatter: `{value}${unit || ''}`,
          },
          data: [{ value, name: title }],
        },
      ],
    };

    instanceRef.current.setOption(option);

    const handleResize = () => instanceRef.current?.resize();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [value, min, max, title, unit, color]);

  return <div ref={chartRef} style={{ height }} className="w-full" />;
}
