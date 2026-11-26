import { Component, input } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideTranslateService } from '@ngx-translate/core';
import { UIChart } from 'primeng/chart';
import { OVERVIEW_PAYLOAD } from '../../testing/overview.fixture';
import { BRAND } from './revenue-chart.constants';
import { RevenueChart } from './revenue-chart';
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

describe('RevenueChart', () => {
  let fixture: ComponentFixture<RevenueChart>;

  const chart = () => fixture.debugElement.query(By.directive(UIChartStub)).componentInstance;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RevenueChart],
      providers: [provideTranslateService()],
    })
      .overrideComponent(RevenueChart, {
        remove: { imports: [UIChart] },
        add: { imports: [UIChartStub] },
      })
      .compileComponents();

    fixture = TestBed.createComponent(RevenueChart);
    fixture.componentRef.setInput('revenue', OVERVIEW_PAYLOAD.revenue);
    fixture.componentRef.setInput('currency', 'EGP');
    fixture.detectChanges();
  });

  it('renders a line chart', () => {
    expect(chart().type()).toBe('line');
  });

  it('exposes an accessible label on the wrapper', () => {
    expect(fixture.nativeElement.querySelector('[role="img"]')?.getAttribute('aria-label')).toBe(
      'ADMIN.OVERVIEW.REVENUE',
    );
  });

  it('maps the revenue points to labels and values', () => {
    const data = chart().data();

    expect(data.labels).toEqual(['Oct', 'Nov']);
    expect(data.datasets[0].data).toEqual([1500, 4500]);
    expect(data.datasets[0].borderColor).toBe(BRAND);
  });

  it('registers the peak plugin', () => {
    const plugins = chart().plugins();

    expect(plugins.length).toBe(1);
    expect(plugins[0].id).toBe('peakHighlight');
  });

  it('hides the legend and the default tooltip', () => {
    const { plugins } = chart().options();

    expect(plugins.legend.display).toBe(false);
    expect(plugins.tooltip.enabled).toBe(false);
  });

  it('updates the data when the revenue changes', () => {
    fixture.componentRef.setInput('revenue', {
      period: 'week',
      points: [{ period: 'd1', label: 'Mon', revenue: 10 }],
    });
    fixture.detectChanges();

    expect(chart().data().labels).toEqual(['Mon']);
    expect(chart().data().datasets[0].data).toEqual([10]);
  });

  it('rebuilds the plugin when the currency changes', () => {
    const before = chart().plugins();

    fixture.componentRef.setInput('currency', 'USD');
    fixture.detectChanges();

    expect(chart().plugins()).not.toBe(before);
  });
});
