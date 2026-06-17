import type { ParamStatus, Trend } from '@/types';

export const formatNumber = (value: number, decimals: number = 2): string => {
  return value.toLocaleString('zh-CN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

export const getStatusColor = (status: ParamStatus): string => {
  switch (status) {
    case 'normal':
      return 'text-alarm-success';
    case 'warning':
      return 'text-alarm-warning';
    case 'alarm':
      return 'text-alarm-danger';
  }
};

export const getStatusBgColor = (status: ParamStatus): string => {
  switch (status) {
    case 'normal':
      return 'bg-alarm-success/20 border-alarm-success/30';
    case 'warning':
      return 'bg-alarm-warning/20 border-alarm-warning/30';
    case 'alarm':
      return 'bg-alarm-danger/20 border-alarm-danger/30';
  }
};

export const getTrendIcon = (trend: Trend): string => {
  switch (trend) {
    case 'up':
      return '↑';
    case 'down':
      return '↓';
    case 'stable':
      return '→';
  }
};

export const getTrendColor = (trend: Trend): string => {
  switch (trend) {
    case 'up':
      return 'text-alarm-danger';
    case 'down':
      return 'text-alarm-success';
    case 'stable':
      return 'text-dark-300';
  }
};

export const getParamPercent = (value: number, min: number, max: number): number => {
  const range = max - min;
  if (range <= 0) return 50;
  const clamped = Math.max(min, Math.min(max, value));
  return ((clamped - min) / range) * 100;
};

export const cn = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(' ');
};
