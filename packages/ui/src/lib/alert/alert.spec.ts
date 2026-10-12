import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Alert } from './alert';

describe('Alert', () => {
  let fixture: ComponentFixture<Alert>;
  const el = () => fixture.nativeElement as HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Alert],
    }).compileComponents();
    fixture = TestBed.createComponent(Alert);
    fixture.componentRef.setInput('message', 'Hello');
    fixture.detectChanges();
  });

  it('renders the message', () => {
    expect(el().querySelector('.alert__text')?.textContent).toContain('Hello');
  });

  it('uses info severity by default', () => {
    expect(el().querySelector('.alert')?.classList).toContain('alert--info');
  });

  it.each(['info', 'success', 'error'] as const)(
    'applies the %s class',
    (severity) => {
      fixture.componentRef.setInput('severity', severity);
      fixture.detectChanges();
      expect(el().querySelector('.alert')?.classList).toContain(
        `alert--${severity}`,
      );
    },
  );

  it('hides the close button when closable is false', () => {
    fixture.componentRef.setInput('closable', false);
    fixture.detectChanges();
    expect(el().querySelector('.alert__close')).toBeNull();
  });

  it('hides itself and emits dismissed on close', () => {
    const spy = jest.fn();
    fixture.componentInstance.dismissed.subscribe(spy);
    (el().querySelector('.alert__close') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(spy).toHaveBeenCalledTimes(1);
    expect(el().querySelector('.alert')).toBeNull();
  });
});
