import { Component, input } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideTranslateService } from '@ngx-translate/core';
import { UIChart } from 'primeng/chart';
import { OVERVIEW_PAYLOAD } from '../../testing/overview.fixture';
import { OrdersStatusChart } from './orders-status-chart';
import { COLORS, OPTIONS } from './orders-status-chart.config';
import { percentBadges } from './orders-status-chart.plugin';
// eslint-disable-next-line @angular-eslint/component-selector
@Component({ selector: 'p-chart', template: '' })
class UIChartStub {
  readonly type = input<string>();
  readonly width = input<string>();
  readonly height = input<string>();
  readonly data = input<unknown>();
  readonly options = input<unknown>();
  readonly plugins = input<unknown>();
}

describe('OrdersStatusChart', () => {
  let fixture: ComponentFixture<OrdersStatusChart>;

  const chart = () => fixture.debugElement.query(By.directive(UIChartStub)).componentInstance;
  const legendRows = () =>
    Array.from(
      fixture.nativeElement.querySelectorAll('[data-testid="legend-row"]'),
    ) as HTMLElement[];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrdersStatusChart],
      providers: [provideTranslateService()],
    })
      .overrideComponent(OrdersStatusChart, {
        remove: { imports: [UIChart] },
        add: { imports: [UIChartStub] },
      })
      .compileComponents();

    fixture = TestBed.createComponent(OrdersStatusChart);
    fixture.componentRef.setInput('status', OVERVIEW_PAYLOAD.orderStatus);
    fixture.detectChanges();
  });

  it('renders a doughnut chart', () => {
    expect(chart().type()).toBe('doughnut');
  });

  it('passes the shared options and the badges plugin', () => {
    expect(chart().options()).toBe(OPTIONS);
    expect(chart().plugins()).toEqual([percentBadges]);
  });

  it('orders the segments completed, canceled, in progress', () => {
    const data = chart().data();

    expect(data.labels).toEqual([
      'ADMIN.OVERVIEW.STATUS.COMPLETED',
      'ADMIN.OVERVIEW.STATUS.CANCELED',
      'ADMIN.OVERVIEW.STATUS.IN_PROGRESS',
    ]);
    expect(data.datasets[0].data).toEqual([16.1, 16.1, 67.7]);
    expect(data.datasets[0].backgroundColor).toEqual([
      COLORS.completed,
      COLORS.canceled,
      COLORS.inProgress,
    ]);
  });

  it('renders a legend row per status in the legend order', () => {
    const rows = legendRows();

    expect(rows.length).toBe(3);
    expect(rows[0].textContent).toContain('ADMIN.OVERVIEW.STATUS.COMPLETED');
    expect(rows[1].textContent).toContain('ADMIN.OVERVIEW.STATUS.IN_PROGRESS');
    expect(rows[2].textContent).toContain('ADMIN.OVERVIEW.STATUS.CANCELED');
  });

  it('renders the count and the percent of each status', () => {
    const [completed, inProgress] = legendRows();

    expect(completed.textContent).toContain('100');
    expect(completed.textContent).toContain('(16.1%)');
    expect(inProgress.textContent).toContain('420');
    expect(inProgress.textContent).toContain('(67.7%)');
  });

  it('updates when the status changes', () => {
    fixture.componentRef.setInput('status', {
      ...OVERVIEW_PAYLOAD.orderStatus,
      completed: { count: 620, percent: 100 },
      inProgress: { count: 0, percent: 0 },
      canceled: { count: 0, percent: 0 },
    });
    fixture.detectChanges();

    expect(chart().data().datasets[0].data).toEqual([100, 0, 0]);
  });
});
