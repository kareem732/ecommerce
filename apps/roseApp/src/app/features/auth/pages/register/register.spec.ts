import { type MockInstance, vi } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { OtpService, RegisterService } from '@org/auth-service';
import { of, throwError } from 'rxjs';
import { RegisterStep } from '../../enums/register-step.enum';
import { Register } from './register';

describe('Register', () => {
  const otp = { sendCode: vi.fn(), confirmCode: vi.fn() };
  const registerService = { register: vi.fn() };
  const STRONG = 'Str0ng!Pass#2024';

  let fixture: ComponentFixture<Register>;
  let component: Register;
  let navigate: MockInstance;

  const store = () => component['store'];

  const fillProfile = () =>
    component['profileForm'].setValue({
      firstName: 'Ahmed',
      lastName: 'Ali',
      username: 'ahmed',
      phone: '',
      gender: 'MALE',
    });

  const seedStore = (phone = '1012345678') =>
    store().patch({
      email: 'a@b.com',
      firstName: 'Ahmed',
      lastName: 'Ali',
      username: 'ahmed',
      phone,
      gender: 'MALE',
    });

  beforeEach(async () => {
    otp.sendCode.mockReset();
    otp.confirmCode.mockReset();
    registerService.register.mockReset();

    await TestBed.configureTestingModule({
      imports: [Register],
      providers: [
        provideRouter([]),
        provideTranslateService(),
        { provide: OtpService, useValue: otp },
        { provide: RegisterService, useValue: registerService },
      ],
    }).compileComponents();

    navigate = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    fixture = TestBed.createComponent(Register);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('starts on the email step', () => {
    expect(store().step()).toBe(RegisterStep.Email);
  });

  describe('email step', () => {
    it('does not send a code when the email is invalid', () => {
      component['emailForm'].setValue({ email: 'nope' });

      component['submitEmail']();

      expect(otp.sendCode).not.toHaveBeenCalled();
      expect(component['emailForm'].touched).toBe(true);
      expect(store().step()).toBe(RegisterStep.Email);
    });

    it('sends the code, stores the email and moves to the otp step', () => {
      otp.sendCode.mockReturnValue(of('sent'));
      component['emailForm'].setValue({ email: 'a@b.com' });

      component['submitEmail']();

      expect(otp.sendCode).toHaveBeenCalledWith('a@b.com');
      expect(store().data().email).toBe('a@b.com');
      expect(store().step()).toBe(RegisterStep.Otp);
      expect(component['loading']()).toBe(false);
    });

    it('shows the server error and stays on the step on failure', () => {
      otp.sendCode.mockReturnValue(
        throwError(() => ({ code: 'UNKNOWN', status: 500, message: 'Boom' })),
      );
      component['emailForm'].setValue({ email: 'a@b.com' });

      component['submitEmail']();
      fixture.detectChanges();

      expect(component['loading']()).toBe(false);
      expect(store().step()).toBe(RegisterStep.Email);
      expect(fixture.nativeElement.querySelector('[role="alert"]').textContent).toContain('Boom');
    });
  });

  describe('otp step', () => {
    beforeEach(() => {
      store().patch({ email: 'a@b.com' });
      store().next();
    });

    it('confirms the code with the stored email and moves to the profile step', () => {
      otp.confirmCode.mockReturnValue(of('ok'));

      component['submitOtp']('123456');

      expect(otp.confirmCode).toHaveBeenCalledWith('a@b.com', '123456');
      expect(store().step()).toBe(RegisterStep.Profile);
    });

    it('stays on the otp step when the code is wrong', () => {
      otp.confirmCode.mockReturnValue(
        throwError(() => ({ code: 'VALIDATION_ERROR', status: 400, message: 'Invalid code' })),
      );

      component['submitOtp']('000000');

      expect(store().step()).toBe(RegisterStep.Otp);
    });

    it('resends the code to the stored email without changing the step', () => {
      otp.sendCode.mockReturnValue(of('sent'));

      component['resendCode']();

      expect(otp.sendCode).toHaveBeenCalledWith('a@b.com');
      expect(store().step()).toBe(RegisterStep.Otp);
    });
  });

  describe('profile step', () => {
    beforeEach(() => {
      store().next();
      store().next();
    });

    it('does not advance when the form is invalid', () => {
      component['submitProfile']();

      expect(component['profileForm'].touched).toBe(true);
      expect(store().step()).toBe(RegisterStep.Profile);
    });

    it('saves the profile in the store and moves to the password step', () => {
      fillProfile();

      component['submitProfile']();

      expect(store().data()).toEqual(
        expect.objectContaining({
          firstName: 'Ahmed',
          lastName: 'Ali',
          username: 'ahmed',
          gender: 'MALE',
        }),
      );
      expect(store().step()).toBe(RegisterStep.Password);
    });
  });

  describe('password step', () => {
    beforeEach(() => {
      seedStore();
      store().next();
      store().next();
      store().next();
    });

    it('does not register when the form is invalid', () => {
      component['submitPassword']();

      expect(registerService.register).not.toHaveBeenCalled();
      expect(component['passwordForm'].touched).toBe(true);
    });

    it('does not register when the passwords do not match', () => {
      component['passwordForm'].setValue({ password: STRONG, confirmPassword: 'different' });

      component['submitPassword']();

      expect(registerService.register).not.toHaveBeenCalled();
    });

    it('does not register without a gender', () => {
      store().patch({ gender: '' });
      component['passwordForm'].setValue({ password: STRONG, confirmPassword: STRONG });

      component['submitPassword']();

      expect(registerService.register).not.toHaveBeenCalled();
    });

    it('registers with the collected data, resets the store and navigates home', () => {
      registerService.register.mockReturnValue(of({}));
      component['passwordForm'].setValue({ password: STRONG, confirmPassword: STRONG });

      component['submitPassword']();

      expect(registerService.register).toHaveBeenCalledWith({
        email: 'a@b.com',
        firstName: 'Ahmed',
        lastName: 'Ali',
        username: 'ahmed',
        gender: 'MALE',
        phone: '1012345678',
        password: STRONG,
        confirmPassword: STRONG,
      });
      expect(store().step()).toBe(RegisterStep.Email);
      expect(store().data().email).toBe('');
      expect(navigate).toHaveBeenCalledWith('/');
    });

    it('sends phone as undefined when it was left empty', () => {
      store().patch({ phone: '' });
      registerService.register.mockReturnValue(of({}));
      component['passwordForm'].setValue({ password: STRONG, confirmPassword: STRONG });

      component['submitPassword']();

      expect(registerService.register.mock.calls[0][0].phone).toBeUndefined();
    });

    it('shows the server error and keeps the data on failure', () => {
      registerService.register.mockReturnValue(
        throwError(() => ({ code: 'CONFLICT', status: 409, message: 'Username taken' })),
      );
      component['passwordForm'].setValue({ password: STRONG, confirmPassword: STRONG });

      component['submitPassword']();

      expect(component['loading']()).toBe(false);
      expect(store().data().email).toBe('a@b.com');
      expect(navigate).not.toHaveBeenCalled();
    });
  });

  describe('back', () => {
    it('goes to the previous step and clears the server error', () => {
      otp.sendCode.mockReturnValue(
        throwError(() => ({ code: 'UNKNOWN', status: 500, message: 'old error' })),
      );
      component['emailForm'].setValue({ email: 'a@b.com' });
      component['submitEmail']();

      store().next();
      component['back']();

      expect(store().step()).toBe(RegisterStep.Email);
    });
  });
});
