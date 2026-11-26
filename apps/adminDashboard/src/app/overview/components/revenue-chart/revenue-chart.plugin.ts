import type { Chart, Plugin } from 'chart.js';
import {
  BRAND,
  DOT_BORDER,
  DOT_RADIUS,
  FONT,
  LINE,
  SHOW_PEAK_BAND,
} from './revenue-chart.constants';

const drawSeparator = (chart: Chart<'line'>, x: number): void => {
  const { ctx, chartArea } = chart;
  ctx.save();
  ctx.globalAlpha = LINE.opacity;
  ctx.strokeStyle = LINE.color;
  ctx.lineWidth = LINE.width;
  ctx.beginPath();
  ctx.moveTo(x, Math.max(0, chartArea.bottom - LINE.length));
  ctx.lineTo(x, chartArea.bottom);
  ctx.stroke();
  ctx.restore();
};

export const peakPlugin = (currency: string): Plugin<'line'> => ({
  id: 'peakHighlight',
  afterDatasetsDraw(chart) {
    const values = (chart.data.datasets[0]?.data ?? []) as number[];
    const max = Math.max(0, ...values);
    const hovered = chart.getActiveElements()[0]?.index;
    if (hovered === undefined && max <= 0) return;

    const index = hovered ?? values.indexOf(max);
    const value = values[index] ?? 0;
    const points = chart.getDatasetMeta(0).data;
    const point = points[index];
    if (!point) return;

    const { ctx, width, chartArea } = chart;

    const between = (i: number): number => (points[i].x + points[i + 1].x) / 2;
    const last = points.length - 1;

    if (SHOW_PEAK_BAND) {
      const left = index > 0 ? between(index - 1) : chartArea.left;
      const right = index < last ? between(index) : chartArea.right;

      ctx.save();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.fillRect(left, chartArea.top, right - left, chartArea.bottom - chartArea.top);
      ctx.restore();
    }

    for (let i = 0; i < last; i++) {
      drawSeparator(chart, between(i));
    }

    const text = `${value.toLocaleString()} ${currency}`.trim();

    ctx.save();
    ctx.font = `600 12px ${FONT}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    const half = ctx.measureText(text).width / 2;
    const textX = Math.min(Math.max(point.x, half + 4), width - half - 4);

    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(point.x, point.y, DOT_RADIUS + DOT_BORDER, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = BRAND;
    ctx.beginPath();
    ctx.arc(point.x, point.y, DOT_RADIUS, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillText(text, textX, point.y - (DOT_RADIUS + DOT_BORDER) - 4);
    ctx.restore();
  },
});
