import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { DashboardCard } from './dashboard-card';

@Component({
  imports: [DashboardCard],
  template: `
    <app-dashboard-card
      title="Revenue"
      [loading]="loading()"
      [empty]="empty()"
      [error]="error()"
      (retry)="retries = retries + 1"
    >
      <button card-actions data-testid="action">Action</button>
      <p data-testid="content">Body</p>
    </app-dashboard-card>
  `,
})
class Host {
  readonly loading = signal(false);
  readonly empty = signal(false);
  readonly error = signal(false);
  retries = 0;
}

describe('DashboardCard', () => {
  let fixture: ComponentFixture<Host>;
  let host: Host;

  const el = (): HTMLElement => fixture.nativeElement;
  const query = (selector: string) => el().querySelector(selector);

  const update = (changes: Partial<{ loading: boolean; empty: boolean; error: boolean }>) => {
    if (changes.loading !== undefined) host.loading.set(changes.loading);
    if (changes.empty !== undefined) host.empty.set(changes.empty);
    if (changes.error !== undefined) host.error.set(changes.error);
    fixture.detectChanges();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Host],
      providers: [provideTranslateService()],
    }).compileComponents();

    fixture = TestBed.createComponent(Host);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('renders the title', () => {
    expect(query('h2')?.textContent?.trim()).toBe('Revenue');
  });

  it('renders the projected content by default', () => {
    expect(query('[data-testid="content"]')).not.toBeNull();
    expect(query('[data-testid="empty"]')).toBeNull();
    expect(query('[data-testid="error"]')).toBeNull();
  });

  it('always renders the projected actions', () => {
    expect(query('[data-testid="action"]')).not.toBeNull();

    update({ loading: true });
    expect(query('[data-testid="action"]')).not.toBeNull();
  });

  it('renders nothing but the header while loading', () => {
    update({ loading: true });

    expect(query('[data-testid="content"]')).toBeNull();
    expect(query('[data-testid="empty"]')).toBeNull();
    expect(query('[data-testid="error"]')).toBeNull();
    expect(query('section')?.getAttribute('aria-busy')).toBe('true');
  });

  it('shows the empty message instead of the content', () => {
    update({ empty: true });

    expect(query('[data-testid="empty"]')).not.toBeNull();
    expect(query('[data-testid="content"]')).toBeNull();
  });

  it('shows the retry button instead of the content on error', () => {
    update({ error: true });

    expect(query('[data-testid="error"]')).not.toBeNull();
    expect(query('[data-testid="retry"]')).not.toBeNull();
    expect(query('[data-testid="content"]')).toBeNull();
  });

  it('prefers the error over the empty state', () => {
    update({ error: true, empty: true });

    expect(query('[data-testid="error"]')).not.toBeNull();
    expect(query('[data-testid="empty"]')).toBeNull();
  });

  it('emits retry when the retry button is clicked', () => {
    update({ error: true });

    (query('[data-testid="retry"] button') as HTMLButtonElement).click();

    expect(host.retries).toBe(1);
  });
});
