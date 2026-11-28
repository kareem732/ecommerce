import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import type { ChartData, ChartOptions } from 'chart.js';
import { UIChart } from 'primeng/chart';
import { OverviewRevenue } from '../../interfaces/overview.res';
import {
  AXIS_TEXT,
  BRAND,
  FILL_BOTTOM,
  FILL_TOP,
  FONT,
} from './revenue-chart.constants';
import { peakPlugin } from './revenue-chart.plugin';

@Component({
  selector: 'app-revenue-chart',
  imports: [UIChart, TranslatePipe],
  templateUrl: './revenue-chart.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
})
export class RevenueChart {
  readonly revenue = input.required<OverviewRevenue>();
  readonly currency = input('');

  protected readonly plugins = computed(() => [peakPlugin(this.currency())]);

  protected readonly data = computed<ChartData<'line'>>(() => {
    const { points } = this.revenue();
    return {
      labels: points.map((point) => point.label),
      datasets: [
        {
          data: points.map((point) => point.revenue),
          fill: true,
          borderColor: BRAND,
          borderWidth: 1.5,
          backgroundColor: (context) => {
            const { chart } = context;
            const area = chart.chartArea;
            if (!area) return FILL_TOP;
            const gradient = chart.ctx.createLinearGradient(0, area.top, 0, area.bottom);
            gradient.addColorStop(0, FILL_TOP);
            gradient.addColorStop(1, FILL_BOTTOM);
            return gradient;
          },
        },
      ],
    };
  });

  protected readonly options = computed<ChartOptions<'line'>>(() => {
    const tickFont = { family: FONT, size: 12, weight: 600 } as const;

    return {
      maintainAspectRatio: false,
      layout: { padding: { top: 24, right: 8 } },
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { display: false },
        tooltip: { enabled: false },
      },
      scales: {
        x: {
          grid: { display: false },
          border: { display: false },
          ticks: { color: AXIS_TEXT, font: tickFont },
        },
        y: {
          beginAtZero: true,
          grace: '10%',
          grid: { display: false },
          border: { display: false },
          ticks: {
            maxTicksLimit: 6,
            color: AXIS_TEXT,
            font: tickFont,
            callback: (value) => String(value),
          },
        },
      },
      elements: {
        line: { tension: 0.4 },
        point: { radius: 0, hoverRadius: 0 },
      },
    };
  });
}
