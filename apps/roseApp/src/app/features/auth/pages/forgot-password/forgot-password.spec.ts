import { vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { PasswordResetService } from '@org/auth-service';
import { of, throwError } from 'rxjs';
import { AuthRoute } from '../../enums/auth-route.enum';
import { ForgotPassword } from './forgot-password';

describe('ForgotPassword', () => {
  const service = { forgotPassword: vi.fn() };
  let fixture: ComponentFixture<ForgotPassword>;
  let component: ForgotPassword;

  const form = () => component['form'];
  const submit = () => component['submit']();

  beforeEach(async () => {
    service.forgotPassword.mockReset();

    await TestBed.configureTestingModule({
      imports: [ForgotPassword],
      providers: [
        provideRouter([]),
        provideTranslateService(),
        { provide: PasswordResetService, useValue: service },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ForgotPassword);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('does not call the api when the email is empty', () => {
    submit();

    expect(service.forgotPassword).not.toHaveBeenCalled();
    expect(form().touched).toBe(true);
  });

  it('does not call the api when the email is invalid', () => {
    form().setValue({ email: 'not-an-email' });

    submit();

    expect(service.forgotPassword).not.toHaveBeenCalled();
    expect(form().touched).toBe(true);
  });

  it('trims the email before sending', () => {
    service.forgotPassword.mockReturnValue(of('sent'));
    form().setValue({ email: '  e@x.com  ' });

    submit();

    expect(service.forgotPassword.mock.calls[0][0]).toBe('e@x.com');
  });

  it('sends the email with a redirectUrl that points to the reset page', () => {
    service.forgotPassword.mockReturnValue(of('sent'));
    form().setValue({ email: 'e@x.com' });

    submit();

    const [email, redirectUrl] = service.forgotPassword.mock.calls[0] as [string, string];
    expect(email).toBe('e@x.com');
    expect(redirectUrl.startsWith(window.location.origin)).toBe(true);
    expect(redirectUrl.endsWith(AuthRoute.ResetPassword)).toBe(true);
  });

  it('shows the success state', () => {
    service.forgotPassword.mockReturnValue(of('sent'));
    form().setValue({ email: 'e@x.com' });

    submit();
    fixture.detectChanges();

    expect(component['sent']()).toBe(true);
    expect(component['loading']()).toBe(false);
    expect(fixture.nativeElement.querySelector('[role="status"]')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('form')).toBeNull();
  });

  it('shows the server error and stops loading on failure', () => {
    service.forgotPassword.mockReturnValue(
      throwError(() => ({ code: 'NOT_FOUND', status: 404, message: 'User not found' })),
    );
    form().setValue({ email: 'e@x.com' });

    submit();
    fixture.detectChanges();

    expect(component['sent']()).toBe(false);
    expect(component['loading']()).toBe(false);
    expect(fixture.nativeElement.querySelector('[role="alert"]').textContent).toContain(
      'User not found',
    );
  });
});