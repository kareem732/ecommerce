import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { CategoriesList } from './components/categories-list/categories-list';
import { DashboardCard } from './components/dashboard-card/dashboard-card';
import { LowStockList } from './components/low-stock-list/low-stock-list';
import { OrdersStatusChart } from './components/orders-status-chart/orders-status-chart';
import { RevenueChart } from './components/revenue-chart/revenue-chart';
import { StatCard } from './components/stat-card/stat-card';
import { TopSellingList } from './components/top-selling-list/top-selling-list';
import { PERIOD_OPTIONS } from './overview.constants';
import { buildStats } from './overview.stats';
import { OverviewStore } from './store/overview.store';

@Component({
  selector: 'app-overview',
  imports: [
    TranslatePipe,
    DashboardCard,
    StatCard,
    CategoriesList,
    OrdersStatusChart,
    RevenueChart,
    TopSellingList,
    LowStockList,
  ],
  templateUrl: './overview.html',
  styleUrl: './overview.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [OverviewStore],
})
export class Overview {
  protected readonly store = inject(OverviewStore);
  protected readonly periodOptions = PERIOD_OPTIONS;

  protected readonly stats = computed(() => {
    const summary = this.store.summary();
    return summary ? buildStats(summary) : [];
  });

  constructor() {
    this.store.load();
  }
}
