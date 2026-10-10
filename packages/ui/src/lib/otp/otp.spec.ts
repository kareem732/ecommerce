import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Otp } from './otp';

describe('Otp', () => {
  let fixture: ComponentFixture<Otp>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Otp],
    }).compileComponents();
    fixture = TestBed.createComponent(Otp);
    fixture.detectChanges();
  });

  it('stores the typed code', () => {
    fixture.componentInstance.onChange('123');
    expect(fixture.componentInstance.code).toBe('123');
  });

  it('does not emit before the code is complete', () => {
    const spy = jest.fn();
    fixture.componentInstance.completed.subscribe(spy);
    fixture.componentInstance.onChange('12345');
    expect(spy).not.toHaveBeenCalled();
  });

  it('emits completed when the length is reached', () => {
    const spy = jest.fn();
    fixture.componentInstance.completed.subscribe(spy);
    fixture.componentInstance.onChange('123456');
    expect(spy).toHaveBeenCalledWith('123456');
  });

  it('respects a custom length', () => {
    const spy = jest.fn();
    fixture.componentInstance.completed.subscribe(spy);
    fixture.componentRef.setInput('length', 4);
    fixture.componentInstance.onChange('1234');
    expect(spy).toHaveBeenCalledWith('1234');
  });

  it('shows the error with role alert', () => {
    fixture.componentRef.setInput('error', 'Wrong code');
    fixture.detectChanges();
    const err = (fixture.nativeElement as HTMLElement).querySelector(
      '.otp__error',
    );
    expect(err?.textContent).toContain('Wrong code');
    expect(err?.getAttribute('role')).toBe('alert');
  });
});
