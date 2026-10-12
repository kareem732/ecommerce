import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { AuthApiService } from '@org/auth-service';
import { MessageService } from 'primeng/api';
import { of } from 'rxjs';
import { ForgetPasswordForm } from './forget-password-form';

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
});
