import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { FormControl, FormGroup } from '@angular/forms';
import { provideTranslateService } from '@ngx-translate/core';
import { AuthApiService } from '@org/auth-service';
import { MessageService } from 'primeng/api';
import { of } from 'rxjs';
import { ForgetPasswordForm } from './forget-password-form';
import { passwordsMatch } from '../../../../shared/utils/forget-password.utils';

describe('ForgetPasswordForm', () => {
  const api = {
    forgotPassword: vi.fn(() => of('sent')),
    resetPassword: vi.fn(() => of('reset')),
  };

  async function setup(token = ''): Promise<ForgetPasswordForm> {
    api.forgotPassword.mockClear();
    api.resetPassword.mockClear();

    await TestBed.configureTestingModule({
      imports: [ForgetPasswordForm],
      providers: [
        provideRouter([]),
        provideTranslateService(),
        MessageService,
        { provide: AuthApiService, useValue: api },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              queryParamMap: convertToParamMap(token ? { token } : {}),
            },
          },
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(ForgetPasswordForm);
    fixture.detectChanges();
    return fixture.componentInstance;
  }

  it('should create', async () => {
    const component = await setup();
    expect(component).toBeTruthy();
  });

  it('starts on the email step when there is no token', async () => {
    const component = await setup();
    expect(component.step()).toBe('email');
  });

  it('starts on the reset step when a token is present', async () => {
    const component = await setup('reset-token');
    expect(component.step()).toBe('reset');
  });

  it('moves to the sent step after submitting a valid email', async () => {
    const component = await setup();
    component.emailForm.controls.email.setValue('user@example.com');
    component.submitEmail();
    expect(api.forgotPassword).toHaveBeenCalled();
    expect(component.step()).toBe('sent');
    expect(component.email()).toBe('user@example.com');
    expect(component.loading()).toBe(false);
  });

  it('does not submit an invalid email', async () => {
    const component = await setup();
    component.emailForm.controls.email.setValue('not-an-email');
    component.submitEmail();
    expect(api.forgotPassword).not.toHaveBeenCalled();
    expect(component.step()).toBe('email');
  });

  it('returns to the email step from the sent step', async () => {
    const component = await setup();
    component.step.set('sent');
    component.backToEmail();
    expect(component.step()).toBe('email');
  });

  it('does not submit reset when passwords do not match', async () => {
    const component = await setup('reset-token');
    component.passwordForm.setValue({
      password: 'password123',
      confirmPassword: 'different123',
    });
    component.submitReset();
    expect(component.passwordForm.hasError('passwordMismatch')).toBe(true);
    expect(api.resetPassword).not.toHaveBeenCalled();
  });

  it('sets passwordMismatch on the confirmPassword control', async () => {
    const component = await setup('reset-token');
    component.passwordForm.setValue({
      password: 'password123',
      confirmPassword: 'different123',
    });
    expect(
      component.passwordForm.controls.confirmPassword.hasError('passwordMismatch'),
    ).toBe(true);
  });

  it('submits reset with the token when passwords match', async () => {
    vi.useFakeTimers();
    const component = await setup('reset-token');
    component.passwordForm.setValue({
      password: 'password123',
      confirmPassword: 'password123',
    });
    component.submitReset();
    expect(api.resetPassword).toHaveBeenCalledWith({
      token: 'reset-token',
      newPassword: 'password123',
      confirmPassword: 'password123',
    });
    expect(component.loading()).toBe(false);
    vi.useRealTimers();
  });
});

describe('passwordsMatch', () => {
  const makeGroup = (password: string, confirmPassword: string) =>
    new FormGroup(
      {
        password: new FormControl(password),
        confirmPassword: new FormControl(confirmPassword),
      },
      { validators: passwordsMatch() },
    );

  it('returns null when the passwords match', () => {
    expect(makeGroup('abc12345', 'abc12345').errors).toBeNull();
  });

  it('returns passwordMismatch when they differ', () => {
    expect(makeGroup('abc12345', 'zzz').errors).toEqual({ passwordMismatch: true });
  });
});
