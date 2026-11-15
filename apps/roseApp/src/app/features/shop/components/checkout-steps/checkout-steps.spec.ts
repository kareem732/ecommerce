import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { beforeEach, describe, expect, it } from 'vitest';
import { CheckoutStep, CheckoutSteps } from './checkout-steps';

describe('CheckoutSteps', () => {
  let fixture: ComponentFixture<CheckoutSteps>;

  const render = (step: CheckoutStep) => {
    fixture.componentRef.setInput('currentStep', step);
    fixture.detectChanges();
  };

  const root = () => fixture.nativeElement.querySelector('[role="progressbar"]') as HTMLElement;
  const dots = () =>
    Array.from(fixture.nativeElement.querySelectorAll('.checkout-steps__dot')) as HTMLElement[];
  const fill = () => fixture.nativeElement.querySelector('.checkout-steps__fill') as HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CheckoutSteps],
      providers: [provideTranslateService()],
    }).compileComponents();
    fixture = TestBed.createComponent(CheckoutSteps);
  });

  it('renders two steps', () => {
    render(1);

    expect(dots()).toHaveLength(2);
  });

  it('exposes progressbar semantics for the current step', () => {
    render(1);

    expect(root().getAttribute('aria-valuemin')).toBe('1');
    expect(root().getAttribute('aria-valuemax')).toBe('2');
    expect(root().getAttribute('aria-valuenow')).toBe('1');
  });

  it('highlights only the first dot on step 1', () => {
    render(1);

    expect(dots().map((d) => d.dataset['active'])).toEqual(['true', 'false']);
    expect(fill().style.width).toBe('30%');
  });

  it('highlights both dots and fills the line on step 2', () => {
    render(2);

    expect(dots().map((d) => d.dataset['active'])).toEqual(['true', 'true']);
    expect(fill().style.width).toBe('100%');
  });

  it('updates when the step changes', () => {
    render(1);
    render(2);

    expect(root().getAttribute('aria-valuenow')).toBe('2');
  });
});
