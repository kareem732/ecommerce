import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import type { ChartData } from 'chart.js';
import { UIChart } from 'primeng/chart';
import { OrderStatus } from '../../interfaces/overview.res';
import { COLORS, OPTIONS } from './orders-status-chart.config';
import { percentBadges } from './orders-status-chart.plugin';

@Component({
  selector: 'app-orders-status-chart',
  imports: [UIChart, DecimalPipe, TranslatePipe],
  templateUrl: './orders-status-chart.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'flex flex-1 items-center justify-center' },
})
export class OrdersStatusChart {
  readonly status = input.required<OrderStatus>();

  protected readonly options = OPTIONS;
  protected readonly plugins = [percentBadges];

  protected readonly legend = computed(() => {
    const { completed, inProgress, canceled } = this.status();
    return [
      { key: 'ADMIN.OVERVIEW.STATUS.COMPLETED', color: COLORS.completed, ...completed },
      { key: 'ADMIN.OVERVIEW.STATUS.IN_PROGRESS', color: COLORS.inProgress, ...inProgress },
      { key: 'ADMIN.OVERVIEW.STATUS.CANCELED', color: COLORS.canceled, ...canceled },
    ];
  });

  protected readonly data = computed<ChartData<'doughnut'>>(() => {
    const [completed, inProgress, canceled] = this.legend();
    const segments = [completed, canceled, inProgress];
    return {
      labels: segments.map((row) => row.key),
      datasets: [
        {
          data: segments.map((row) => row.percent),
          backgroundColor: segments.map((row) => row.color),
          borderWidth: 0,
        },
      ],
    };
  });
}
