import { TestBed } from '@angular/core/testing';
import { Observable, of, Subject, throwError } from 'rxjs';
import { vi } from 'vitest';
import { OverviewResponse } from '../interfaces/overview.res';
import { OverviewService } from '../services/overview.service';
import { OVERVIEW_PAYLOAD, OVERVIEW_RESPONSE } from '../testing/overview.fixture';
import { OverviewStore } from './overview.store';

describe('OverviewStore', () => {
  let service: { getStatistics: ReturnType<typeof vi.fn> };
  let store: OverviewStore;

  const respondWith = (request: Observable<OverviewResponse>) =>
    service.getStatistics.mockReturnValue(request);

  beforeEach(() => {
    service = { getStatistics: vi.fn() };
    TestBed.configureTestingModule({
      providers: [OverviewStore, { provide: OverviewService, useValue: service }],
    });
    store = TestBed.inject(OverviewStore);
  });

  it('starts with no data, not loading and no error', () => {
    expect(store.data()).toBeNull();
    expect(store.loading()).toBe(false);
    expect(store.error()).toBe(false);
    expect(store.period()).toBe('monthly');
  });

  it('reports every section as empty before data arrives', () => {
    expect(store.categoriesEmpty()).toBe(true);
    expect(store.ordersEmpty()).toBe(true);
    expect(store.revenueEmpty()).toBe(true);
    expect(store.topSellingEmpty()).toBe(true);
    expect(store.lowStockEmpty()).toBe(true);
    expect(store.currency()).toBe('');
  });

  it('requests the statistics with the current period', () => {
    respondWith(of(OVERVIEW_RESPONSE));

    store.load();

    expect(service.getStatistics).toHaveBeenCalledWith({ revenuePeriod: 'monthly' });
  });

  it('is loading while the first request is pending, then stores the payload', () => {
    const request = new Subject<OverviewResponse>();
    respondWith(request);

    store.load();
    expect(store.loading()).toBe(true);

    request.next(OVERVIEW_RESPONSE);

    expect(store.loading()).toBe(false);
    expect(store.data()).toEqual(OVERVIEW_PAYLOAD);
  });

  it('exposes the derived sections from the payload', () => {
    respondWith(of(OVERVIEW_RESPONSE));

    store.load();

    expect(store.summary()).toEqual(OVERVIEW_PAYLOAD.summary);
    expect(store.currency()).toBe('EGP');
    expect(store.categories()).toEqual(OVERVIEW_PAYLOAD.categories);
    expect(store.orderStatus()).toEqual(OVERVIEW_PAYLOAD.orderStatus);
    expect(store.revenue()).toEqual(OVERVIEW_PAYLOAD.revenue);
    expect(store.topSelling()).toEqual(OVERVIEW_PAYLOAD.topSellingProducts);
    expect(store.lowStock()).toEqual(OVERVIEW_PAYLOAD.lowStockProducts);
    expect(store.categoriesEmpty()).toBe(false);
    expect(store.ordersEmpty()).toBe(false);
    expect(store.revenueEmpty()).toBe(false);
  });

  it('flags a blocking error when the first request fails', () => {
    respondWith(throwError(() => new Error('boom')));

    store.load();

    expect(store.error()).toBe(true);
    expect(store.blockingError()).toBe(true);
    expect(store.loading()).toBe(false);
  });

  it('clears the error when the request is retried', () => {
    respondWith(throwError(() => new Error('boom')));
    store.load();

    respondWith(of(OVERVIEW_RESPONSE));
    store.load();

    expect(store.error()).toBe(false);
    expect(store.blockingError()).toBe(false);
    expect(store.data()).toEqual(OVERVIEW_PAYLOAD);
  });

  it('cancels the previous request when a new one starts', () => {
    const first = new Subject<OverviewResponse>();
    respondWith(first);
    store.load();
    expect(first.observed).toBe(true);

    respondWith(of(OVERVIEW_RESPONSE));
    store.load();

    expect(first.observed).toBe(false);
  });

  describe('setPeriod', () => {
    beforeEach(() => {
      respondWith(of(OVERVIEW_RESPONSE));
      store.load();
      service.getStatistics.mockClear();
    });

    it('requests the new period and updates the state', () => {
      store.setPeriod('week');

      expect(store.period()).toBe('week');
      expect(service.getStatistics).toHaveBeenCalledWith({ revenuePeriod: 'week' });
    });

    it('does nothing when the period is unchanged', () => {
      store.setPeriod('monthly');

      expect(service.getStatistics).not.toHaveBeenCalled();
    });

    it('keeps the data on screen and does not raise loading', () => {
      const request = new Subject<OverviewResponse>();
      respondWith(request);

      store.setPeriod('week');

      expect(store.loading()).toBe(false);
      expect(store.data()).toEqual(OVERVIEW_PAYLOAD);
    });

    it('goes back to the loaded period when the request fails', () => {
      respondWith(throwError(() => new Error('boom')));

      store.setPeriod('week');

      expect(store.period()).toBe('monthly');
      expect(store.error()).toBe(true);
      expect(store.blockingError()).toBe(false);
      expect(store.data()).toEqual(OVERVIEW_PAYLOAD);
    });
  });
});
