import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Badge } from './badge';

describe('Badge', () => {
  let fixture: ComponentFixture<Badge>;
  const badge = () =>
    (fixture.nativeElement as HTMLElement).querySelector(
      '.badge',
    ) as HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Badge],
    }).compileComponents();
    fixture = TestBed.createComponent(Badge);
    fixture.componentRef.setInput('value', 'New');
    fixture.detectChanges();
  });

  it('renders the value', () => {
    expect(badge().textContent).toContain('New');
  });

  it('uses primary variant by default', () => {
    expect(badge().classList).toContain('badge--primary');
  });

  it.each([
    'primary-dark',
    'soft',
    'soft-strong',
    'neutral',
    'neutral-strong',
  ] as const)('applies the %s variant', (variant) => {
    fixture.componentRef.setInput('variant', variant);
    fixture.detectChanges();
    expect(badge().classList).toContain(`badge--${variant}`);
  });
});
