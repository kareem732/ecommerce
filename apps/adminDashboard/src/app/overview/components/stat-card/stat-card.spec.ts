import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Package } from 'lucide-angular';
import { StatCard, StatTone } from './stat-card';

describe('StatCard', () => {
  let fixture: ComponentFixture<StatCard>;

  const el = (): HTMLElement => fixture.nativeElement;
  const text = (testId: string) =>
    el().querySelector(`[data-testid="${testId}"]`)?.textContent?.trim();

  const render = (inputs: { value?: number; suffix?: string; tone?: StatTone } = {}) => {
    fixture.componentRef.setInput('label', 'Total products');
    fixture.componentRef.setInput('value', inputs.value ?? 1234);
    fixture.componentRef.setInput('icon', Package);
    if (inputs.suffix !== undefined) fixture.componentRef.setInput('suffix', inputs.suffix);
    if (inputs.tone !== undefined) fixture.componentRef.setInput('tone', inputs.tone);
    fixture.detectChanges();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [StatCard] }).compileComponents();
    fixture = TestBed.createComponent(StatCard);
  });

  it('renders the label', () => {
    render();

    expect(text('label')).toBe('Total products');
  });

  it('formats the value with thousands separators', () => {
    render({ value: 1234 });

    expect(text('value')).toContain('1,234');
  });

  it('renders the suffix when provided', () => {
    render({ suffix: 'EGP' });

    expect(text('suffix')).toBe('EGP');
  });

  it('omits the suffix when empty', () => {
    render();

    expect(el().querySelector('[data-testid="suffix"]')).toBeNull();
  });

  it('renders the icon', () => {
    render();

    expect(el().querySelector('lucide-icon')).not.toBeNull();
  });

  it('uses the neutral tone by default', () => {
    render();

    expect(el().querySelector('article')?.className).toContain('bg-violet-100/60');
  });

  it.each([
    ['rose', 'bg-[#FBEAEA]', 'text-rose-800'],
    ['blue', 'bg-[#0063D00D]', 'text-blue-700'],
    ['green', 'bg-emerald-100/70', 'text-emerald-800'],
  ] as const)('applies the %s tone classes', (tone, card, accent) => {
    render({ tone });

    expect(el().querySelector('article')?.className).toContain(card);
    expect(el().querySelector('[data-testid="value"]')?.className).toContain(accent);
  });
});
