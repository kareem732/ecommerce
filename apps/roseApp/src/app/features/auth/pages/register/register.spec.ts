import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';
import { type MockInstance, vi } from 'vitest';
import { AuthRoute } from '../../enums/auth-route.enum';
import { RegisterStep } from '../../enums/register-step.enum';
import { RegisterStore } from '../../stores/register.store';
import { FormErrorService } from '../../utils/form-error.service';
import { Register } from './register';

const STRONG = 'Str0ng!Pass#2024';

const createStore = () => ({
  step: signal<RegisterStep>(RegisterStep.Email),
  data: signal({ email: '' }),
  loading: signal(false),
  error: signal<string | null>(null),
  sendCode: vi.fn(),
  resendCode: vi.fn(),
  confirmCode: vi.fn(),
  patch: vi.fn(),
  next: vi.fn(),
  back: vi.fn(),
  register: vi.fn(),
});

describe('Register', () => {
  let store: ReturnType<typeof createStore>;
  let navigate: MockInstance;

  const setup = () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        {
          provide: TranslateService,
          useValue: {
            stream: () =>
              of({ 'AUTH.REGISTER.MALE': 'Male', 'AUTH.REGISTER.FEMALE': 'Female' }),
          },
        },
      ],
    });

    TestBed.overrideComponent(Register, {
      set: {
        imports: [],
        template: '',
        providers: [
          { provide: RegisterStore, useValue: store },
          {
            provide: FormErrorService,
            useValue: { scope: () => ({ of: () => '', confirm: () => '' }) },
          },
        ],
      },
    });

    navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);

    const fixture = TestBed.createComponent(Register);
    fixture.detectChanges();
    return fixture;
  };

  const goTo = (fixture: ReturnType<typeof setup>, step: RegisterStep) => {
    store.step.set(step);
    fixture.detectChanges();
  };

  beforeEach(() => {
    vi.useFakeTimers();
    store = createStore();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('gender options', () => {
    it('builds the options from the translations', () => {
      const component = setup().componentInstance;

      expect(component['genderOptions']()).toEqual([
        { value: 'MALE', label: 'Male' },
        { value: 'FEMALE', label: 'Female' },
      ]);
    });
  });

  describe('resend countdown', () => {
    it('does not run before the otp step', () => {
      const component = setup().componentInstance;

      expect(component['resendSeconds']()).toBe(0);
      expect(vi.getTimerCount()).toBe(0);
    });

    it('starts at 60 seconds when the otp step opens', () => {
      const fixture = setup();

      goTo(fixture, RegisterStep.Otp);

      expect(fixture.componentInstance['resendSeconds']()).toBe(60);
    });

    it('counts down every second and stops at zero', () => {
      const fixture = setup();
      goTo(fixture, RegisterStep.Otp);

      vi.advanceTimersByTime(1000);
      expect(fixture.componentInstance['resendSeconds']()).toBe(59);

      vi.advanceTimersByTime(59_000);
      expect(fixture.componentInstance['resendSeconds']()).toBe(0);

      vi.advanceTimersByTime(5000);
      expect(fixture.componentInstance['resendSeconds']()).toBe(0);
      expect(vi.getTimerCount()).toBe(0);
    });

    it('stops when the user leaves the otp step', () => {
      const fixture = setup();
      goTo(fixture, RegisterStep.Otp);
      vi.advanceTimersByTime(3000);

      goTo(fixture, RegisterStep.Profile);
      vi.advanceTimersByTime(5000);

      expect(fixture.componentInstance['resendSeconds']()).toBe(57);
      expect(vi.getTimerCount()).toBe(0);
    });

    it('resendCode clears the code, calls the store and restarts the countdown', () => {
      const fixture = setup();
      const component = fixture.componentInstance;
      goTo(fixture, RegisterStep.Otp);
      component['otpCode'].set('123456');
      vi.advanceTimersByTime(30_000);

      component['resendCode']();

      expect(store.resendCode).toHaveBeenCalledTimes(1);
      expect(component['otpCode']()).toBe('');
      expect(component['resendSeconds']()).toBe(60);
    });

    it('clears the timer when the component is destroyed', () => {
      const fixture = setup();
      goTo(fixture, RegisterStep.Otp);

      fixture.destroy();

      expect(vi.getTimerCount()).toBe(0);
    });
  });

  describe('step 1: email', () => {
    it('does not send a code when the email is invalid', () => {
      const component = setup().componentInstance;
      component['emailForm'].controls.email.setValue('not-an-email');

      component['submitEmail']();

      expect(store.sendCode).not.toHaveBeenCalled();
      expect(component['emailForm'].touched).toBe(true);
    });

    it('sends the code for a valid email', () => {
      const component = setup().componentInstance;
      component['emailForm'].controls.email.setValue('a@b.com');

      component['submitEmail']();

      expect(store.sendCode).toHaveBeenCalledWith('a@b.com');
    });
  });

  describe('step 2: otp', () => {
    it('ignores an empty code', () => {
      const component = setup().componentInstance;

      component['submitOtp']('');

      expect(store.confirmCode).not.toHaveBeenCalled();
    });

    it('confirms a code', () => {
      const component = setup().componentInstance;

      component['submitOtp']('123456');

      expect(store.confirmCode).toHaveBeenCalledWith('123456');
    });
  });

  describe('step 3: profile', () => {
    it('does not continue while the form is invalid', () => {
      const component = setup().componentInstance;

      component['submitProfile']();

      expect(store.patch).not.toHaveBeenCalled();
      expect(store.next).not.toHaveBeenCalled();
      expect(component['profileForm'].touched).toBe(true);
    });

    it('saves the profile and moves on when valid', () => {
      const component = setup().componentInstance;
      component['profileForm'].setValue({
        firstName: 'Ahmed',
        lastName: 'Ali',
        username: 'ahmed',
        phone: '',
        gender: 'MALE',
      });

      component['submitProfile']();

      expect(store.patch).toHaveBeenCalledWith({
        firstName: 'Ahmed',
        lastName: 'Ali',
        username: 'ahmed',
        phone: '',
        gender: 'MALE',
      });
      expect(store.next).toHaveBeenCalledTimes(1);
    });
  });

  describe('step 4: password', () => {
    it('does not register while the form is invalid', () => {
      const component = setup().componentInstance;

      component['submitPassword']();

      expect(store.register).not.toHaveBeenCalled();
    });

    it('does not register when the passwords do not match', () => {
      const component = setup().componentInstance;
      component['passwordForm'].setValue({
        password: STRONG,
        confirmPassword: `${STRONG}x`,
      });

      component['submitPassword']();

      expect(store.register).not.toHaveBeenCalled();
    });

    it('registers and goes to login on success', () => {
      store.register.mockImplementation((_credentials: unknown, onSuccess?: () => void) =>
        onSuccess?.(),
      );
      const component = setup().componentInstance;
      component['passwordForm'].setValue({ password: STRONG, confirmPassword: STRONG });

      component['submitPassword']();

      expect(store.register).toHaveBeenCalledWith(
        { password: STRONG, confirmPassword: STRONG },
        expect.any(Function),
      );
      expect(navigate).toHaveBeenCalledWith([AuthRoute.Login], { relativeTo: undefined });
    });
  });

  describe('back', () => {
    it('clears the code and goes back in the store', () => {
      const component = setup().componentInstance;
      component['otpCode'].set('123456');

      component['back']();

      expect(component['otpCode']()).toBe('');
      expect(store.back).toHaveBeenCalledTimes(1);
    });
  });
});
