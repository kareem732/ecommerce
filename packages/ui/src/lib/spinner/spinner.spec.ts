import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Spinner } from './spinner';

describe('Spinner', () => {
  let fixture: ComponentFixture<Spinner>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Spinner],
    }).compileComponents();
    fixture = TestBed.createComponent(Spinner);
  });

  it('has role status and default aria-label', () => {
    fixture.detectChanges();
    const el = fixture.nativeElement.querySelector('.spinner');
    expect(el.getAttribute('role')).toBe('status');
    expect(el.getAttribute('aria-label')).toBe('Loading');
  });

  it('accepts a custom label', () => {
    fixture.componentRef.setInput('label', 'Saving');
    fixture.detectChanges();
    expect(
      fixture.nativeElement
        .querySelector('.spinner')
        .getAttribute('aria-label'),
    ).toBe('Saving');
  });
});
