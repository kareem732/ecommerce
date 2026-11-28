import { Component, input } from '@angular/core';
import {
  ComponentFixture,
  DeferBlockBehavior,
  DeferBlockState,
  TestBed,
} from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideTranslateService } from '@ngx-translate/core';
import { Observable, of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { OrdersStatusChart } from './components/orders-status-chart/orders-status-chart';
import { RevenueChart } from './components/revenue-chart/revenue-chart';
import {
  OrderStatus,
  OverviewResponse,
  OverviewRevenue,
} from './interfaces/overview.res';
import { Overview } from './overview';
import { OverviewService } from './services/overview.service';
import { OVERVIEW_PAYLOAD, OVERVIEW_RESPONSE } from './testing/overview.fixture';

@Component({ selector: 'app-orders-status-chart', template: '' })
class OrdersStatusChartStub {
  readonly status = input<OrderStatus>();
}

@Component({ selector: 'app-revenue-chart', template: '' })
class RevenueChartStub {
  readonly revenue = input<OverviewRevenue>();
  readonly currency = input<string>();
}

describe('Overview', () => {
  let fixture: ComponentFixture<Overview>;
  let service: { getStatistics: ReturnType<typeof vi.fn> };

  const el = (): HTMLElement => fixture.nativeElement;
  const query = (selector: string) => el().querySelector(selector);
  const queryAll = (selector: string) => fixture.debugElement.queryAll(By.css(selector));

  const setup = (request: Observable<OverviewResponse> = of(OVERVIEW_RESPONSE)) => {
    service.getStatistics.mockReturnValue(request);
    fixture = TestBed.createComponent(Overview);
    fixture.detectChanges();
  };

  const renderDeferBlocks = async () => {
    const blocks = await fixture.getDeferBlocks();
    for (const block of blocks) {
      await block.render(DeferBlockState.Complete);
    }
    fixture.detectChanges();
  };

  beforeEach(async () => {
    service = { getStatistics: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [Overview],
      providers: [provideTranslateService(), { provide: OverviewService, useValue: service }],
      deferBlockBehavior: DeferBlockBehavior.Manual,
    })
      .overrideComponent(Overview, {
        remove: { imports: [OrdersStatusChart, RevenueChart] },
        add: { imports: [OrdersStatusChartStub, RevenueChartStub] },
      })
      .compileComponents();
  });

  it('requests the statistics once on init with the monthly period', () => {
    setup();

    expect(service.getStatistics).toHaveBeenCalledTimes(1);
    expect(service.getStatistics).toHaveBeenCalledWith({ revenuePeriod: 'monthly' });
  });

  it('renders the four stat cards with the summary values', () => {
    setup();

    const cards = queryAll('app-stat-card');
    expect(cards.length).toBe(4);
    expect(cards[0].nativeElement.textContent).toContain('98');
    expect(cards[1].nativeElement.textContent).toContain('620');
    expect(cards[2].nativeElement.textContent).toContain('27');
    expect(cards[3].nativeElement.textContent).toContain('4,500');
    expect(cards[3].nativeElement.textContent).toContain('EGP');
  });

  it('renders the three lists', () => {
    setup();

    expect(query('app-categories-list')).not.toBeNull();
    expect(query('app-top-selling-list')).not.toBeNull();
    expect(query('app-low-stock-list')).not.toBeNull();
  });

  it('renders a card for each section', () => {
    setup();

    expect(queryAll('app-dashboard-card').length).toBe(5);
  });

  it('keeps the charts out of the page until their blocks are loaded', () => {
    setup();

    expect(query('app-orders-status-chart')).toBeNull();
    expect(query('app-revenue-chart')).toBeNull();
  });

  it('passes the loaded data to the charts', async () => {
    setup();
    await renderDeferBlocks();

    const orders = fixture.debugElement.query(By.directive(OrdersStatusChartStub));
    const revenue = fixture.debugElement.query(By.directive(RevenueChartStub));

    expect(orders.componentInstance.status()).toEqual(OVERVIEW_PAYLOAD.orderStatus);
    expect(revenue.componentInstance.revenue()).toEqual(OVERVIEW_PAYLOAD.revenue);
    expect(revenue.componentInstance.currency()).toBe('EGP');
  });

  it('marks the monthly period as pressed by default', () => {
    setup();

    expect(query('[data-testid="period-monthly"]')?.getAttribute('aria-pressed')).toBe('true');
    expect(query('[data-testid="period-week"]')?.getAttribute('aria-pressed')).toBe('false');
  });

  it('requests the statistics again when a period button is clicked', () => {
    setup();

    (query('[data-testid="period-week"]') as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(service.getStatistics).toHaveBeenCalledTimes(2);
    expect(service.getStatistics).toHaveBeenLastCalledWith({ revenuePeriod: 'week' });
    expect(query('[data-testid="period-week"]')?.getAttribute('aria-pressed')).toBe('true');
  });

  it('shows the empty message for sections without data', () => {
    setup(
      of({
        ...OVERVIEW_RESPONSE,
        payload: { ...OVERVIEW_PAYLOAD, categories: [], lowStockProducts: [] },
      }),
    );

    expect(queryAll('[data-testid="empty"]').length).toBe(2);
    expect(query('app-categories-list')).toBeNull();
    expect(query('app-low-stock-list')).toBeNull();
  });

  describe('when the first request fails', () => {
    beforeEach(() => setup(throwError(() => new Error('boom'))));

    it('shows only the error card', () => {
      expect(query('[data-testid="error"]')).not.toBeNull();
      expect(queryAll('app-dashboard-card').length).toBe(1);
      expect(query('app-stat-card')).toBeNull();
    });

    it('requests again when retry is clicked', () => {
      (query('[data-testid="retry"] button') as HTMLButtonElement).click();

      expect(service.getStatistics).toHaveBeenCalledTimes(2);
    });
  });
});
