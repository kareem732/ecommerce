import type { ChartOptions } from 'chart.js';

export const COLORS = {
  completed: '#16a34a',
  inProgress: '#2563eb',
  canceled: '#dc2626',
};

export const FONT = 'Inter, ui-sans-serif, system-ui, sans-serif';
export const BADGE_SIZE = 31.4951171875;
export const BADGE_RADIUS = BADGE_SIZE / 2;

export const OPTIONS: ChartOptions<'doughnut'> = {
  maintainAspectRatio: false,
  cutout: '50%',
  rotation: -95,
  plugins: {
    legend: { display: false },
    tooltip: { enabled: false },
  },
};
