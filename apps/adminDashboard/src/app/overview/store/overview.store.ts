import { computed, DestroyRef, inject, Injectable, signal } from '@angular/core';
import { Subscription } from 'rxjs';
import { RevenuePeriod } from '../interfaces/overview.req';
import { LowStockProduct, OverviewCategory, TopSellingProduct } from '../interfaces/overview.res';
import { OverviewService } from '../services/overview.service';
import { initialOverviewState, OverviewState } from './overview.state';

const NO_CATEGORIES: OverviewCategory[] = [];
const NO_TOP_SELLING: TopSellingProduct[] = [];
const NO_LOW_STOCK: LowStockProduct[] = [];

@Injectable()
export class OverviewStore {
  private readonly _service = inject(OverviewService);
  private readonly _state = signal<OverviewState>(initialOverviewState);

  private _request: Subscription | null = null;
  private _loadedPeriod = initialOverviewState.period;

  readonly data = computed(() => this._state().data);
  readonly period = computed(() => this._state().period);
  readonly loading = computed(() => this._state().loading);
  readonly error = computed(() => this._state().error);

  readonly blockingError = computed(() => this.error() && this.data() === null);

  readonly summary = computed(() => this.data()?.summary ?? null);
  readonly currency = computed(() => this.summary()?.currency ?? '');
  readonly categories = computed(() => this.data()?.categories ?? NO_CATEGORIES);
  readonly orderStatus = computed(() => this.data()?.orderStatus ?? null);
  readonly revenue = computed(() => this.data()?.revenue ?? null);
  readonly topSelling = computed(() => this.data()?.topSellingProducts ?? NO_TOP_SELLING);
  readonly lowStock = computed(() => this.data()?.lowStockProducts ?? NO_LOW_STOCK);

  readonly categoriesEmpty = computed(() => this.categories().length === 0);
  readonly ordersEmpty = computed(() => (this.orderStatus()?.totalOrders ?? 0) === 0);
  readonly revenueEmpty = computed(() => (this.revenue()?.points.length ?? 0) === 0);
  readonly topSellingEmpty = computed(() => this.topSelling().length === 0);
  readonly lowStockEmpty = computed(() => this.lowStock().length === 0);

  constructor() {
    inject(DestroyRef).onDestroy(() => this._request?.unsubscribe());
  }

  load(): void {
    this.fetch();
  }

  setPeriod(period: RevenuePeriod): void {
    if (period === this._state().period) return;

    this._state.update((state) => ({ ...state, period }));
    this.fetch();
  }

  private fetch(): void {
    this._request?.unsubscribe();

    const requestedPeriod = this._state().period;

    this._state.update((state) => ({
      ...state,
      loading: state.data === null,
      error: false,
    }));

    this._request = this._service.getStatistics({ revenuePeriod: requestedPeriod }).subscribe({
      next: (response) => {
        this._loadedPeriod = requestedPeriod;
        this._state.update((state) => ({
          ...state,
          data: response.payload,
          loading: false,
          error: false,
        }));
      },
      error: () => {
        this._state.update((state) => ({
          ...state,
          loading: false,
          error: true,
          period: state.data !== null ? this._loadedPeriod : state.period,
        }));
      },
    });
  }
}
