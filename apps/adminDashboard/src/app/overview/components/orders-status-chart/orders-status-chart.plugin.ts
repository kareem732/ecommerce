import type { ArcElement, Plugin } from 'chart.js';
import { BADGE_RADIUS, FONT } from './orders-status-chart.config';

export const percentBadges: Plugin<'doughnut'> = {
  id: 'percentBadges',
  afterDatasetsDraw(chart) {
    const { ctx, width, height } = chart;
    const values = chart.data.datasets[0]?.data as number[];
    const arcs = chart.getDatasetMeta(0).data as unknown as ArcElement[];

    arcs.forEach((arc, index) => {
      const value = values[index];
      if (!value) return;

      const mid = (arc.startAngle + arc.endAngle) / 2;
      const rawX = arc.x + Math.cos(mid) * arc.outerRadius;
      const rawY = arc.y + Math.sin(mid) * arc.outerRadius;
      const x = Math.min(Math.max(rawX, BADGE_RADIUS), width - BADGE_RADIUS);
      const y = Math.min(Math.max(rawY, BADGE_RADIUS), height - BADGE_RADIUS);

      ctx.save();
      ctx.fillStyle = '#FAFAFA';
      ctx.beginPath();
      ctx.arc(x, y, BADGE_RADIUS, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      ctx.save();
      ctx.fillStyle = '#000000';
      ctx.font = `700 10px ${FONT}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${+value.toFixed(1)}%`, x, y + 0.5);
      ctx.restore();
    });
  },
};
