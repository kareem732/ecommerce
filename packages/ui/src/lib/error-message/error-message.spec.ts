import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ErrorMessage } from './error-message';

describe('ErrorMessage', () => {
  let fixture: ComponentFixture<ErrorMessage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ErrorMessage],
    }).compileComponents();
    fixture = TestBed.createComponent(ErrorMessage);
  });

  it('renders nothing when there is no message', () => {
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.error-message')).toBeNull();
  });

  it('renders the message with role alert', () => {
    fixture.componentRef.setInput('message', 'Required field');
    fixture.detectChanges();
    const el = fixture.nativeElement.querySelector('.error-message');
    expect(el.textContent).toContain('Required field');
    expect(el.getAttribute('role')).toBe('alert');
  });
});
