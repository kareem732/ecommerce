import { type MockInstance, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { OtpService, RegisterService } from '@org/auth-service';
import { Subject, of, throwError } from 'rxjs';
import { RegisterStep } from '../enums/register-step.enum';
import { RegisterStore } from './register.store';

describe('RegisterStore', () => {
  const otp = { sendCode: vi.fn(), confirmCode: vi.fn() };
  const api = { register: vi.fn() };
  const STRONG = 'Str0ng!Pass#2024';
  const KEY = 'register-state';

  let navigate: MockInstance;

  const create = () => {
    TestBed.configureTestingModule({
      providers: [
        RegisterStore,
        provideRouter([]),
        { provide: OtpService, useValue: otp },
        { provide: RegisterService, useValue: api },
      ],
    });
    navigate = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    return TestBed.inject(RegisterStore);
  };

  const fail = (message: string) =>
    throwError(() => ({ code: 'UNKNOWN', status: 500, message }));

  beforeEach(() => {
    sessionStorage.clear();
    otp.sendCode.mockReset();
    otp.confirmCode.mockReset();
    api.register.mockReset();
  });

  describe('steps and data', () => {
    it('starts on the email step with empty data', () => {
      const store = create();

      expect(store.step()).toBe(RegisterStep.Email);
      expect(store.data().email).toBe('');
      expect(store.data().gender).toBe('');
    });

    it('patch merges partial data without losing other fields', () => {
      const store = create();
      store.patch({ email: 'a@b.com' });
      store.patch({ firstName: 'Ahmed' });

      expect(store.data().email).toBe('a@b.com');
      expect(store.data().firstName).toBe('Ahmed');
    });

    it('walks through the steps in order', () => {
      const store = create();
      const seen = [store.step()];
      for (let i = 0; i < 3; i++) {
        store.next();
        seen.push(store.step());
      }

      expect(seen).toEqual([
        RegisterStep.Email,
        RegisterStep.Otp,
        RegisterStep.Profile,
        RegisterStep.Password,
      ]);
    });

    it('does not go past the last step', () => {
      const store = create();
      for (let i = 0; i < 10; i++) store.next();

      expect(store.step()).toBe(RegisterStep.Password);
    });

    it('does not go before the first step', () => {
      const store = create();
      store.back();

      expect(store.step()).toBe(RegisterStep.Email);
    });

    it('back returns to the previous step and clears the error', () => {
      otp.sendCode.mockReturnValue(fail('Boom'));
      const store = create();
      store.sendCode('a@b.com');
      store.next();
      expect(store.error()).toBe('Boom');

      store.back();

      expect(store.step()).toBe(RegisterStep.Email);
      expect(store.error()).toBeNull();
    });

    it('reset restores the initial state', () => {
      const store = create();
      store.patch({ email: 'a@b.com', gender: 'MALE' });
      store.next();
      store.reset();

      expect(store.step()).toBe(RegisterStep.Email);
      expect(store.data().email).toBe('');
      expect(store.data().gender).toBe('');
    });
  });

  describe('sendCode', () => {
    it('stores the email and moves to the otp step on success', () => {
      otp.sendCode.mockReturnValue(of('sent'));
      const store = create();

      store.sendCode('a@b.com');

      expect(otp.sendCode).toHaveBeenCalledWith('a@b.com');
      expect(store.data().email).toBe('a@b.com');
      expect(store.step()).toBe(RegisterStep.Otp);
      expect(store.loading()).toBe(false);
    });

    it('keeps the step and exposes the error on failure', () => {
      otp.sendCode.mockReturnValue(fail('Boom'));
      const store = create();

      store.sendCode('a@b.com');

      expect(store.step()).toBe(RegisterStep.Email);
      expect(store.error()).toBe('Boom');
      expect(store.data().email).toBe('');
    });

    it('ignores a second sendCode while one is still pending', () => {
      otp.sendCode.mockReturnValue(new Subject<string>());
      const store = create();

      store.sendCode('a@b.com');
      store.sendCode('a@b.com');

      expect(otp.sendCode).toHaveBeenCalledTimes(1);
      expect(store.loading()).toBe(true);
    });
  });

  describe('otp', () => {
    it('confirmCode uses the stored email and moves on', () => {
      otp.confirmCode.mockReturnValue(of('ok'));
      const store = create();
      store.patch({ email: 'a@b.com' });
      store.next();

      store.confirmCode('123456');

      expect(otp.confirmCode).toHaveBeenCalledWith('a@b.com', '123456');
      expect(store.step()).toBe(RegisterStep.Profile);
    });

    it('confirmCode stays on the step when the code is wrong', () => {
      otp.confirmCode.mockReturnValue(fail('Invalid code'));
      const store = create();
      store.next();

      store.confirmCode('000000');

      expect(store.step()).toBe(RegisterStep.Otp);
      expect(store.error()).toBe('Invalid code');
    });

    it('resendCode sends to the stored email without changing the step', () => {
      otp.sendCode.mockReturnValue(of('sent'));
      const store = create();
      store.patch({ email: 'a@b.com' });
      store.next();

      store.resendCode();

      expect(otp.sendCode).toHaveBeenCalledWith('a@b.com');
      expect(store.step()).toBe(RegisterStep.Otp);
    });
  });

  describe('register', () => {
    const seed = (store: InstanceType<typeof RegisterStore>, phone = '1012345678') =>
      store.patch({
        email: 'a@b.com',
        firstName: 'Ahmed',
        lastName: 'Ali',
        username: 'ahmed',
        phone,
        gender: 'MALE',
      });

    it('does nothing without a gender', () => {
      const store = create();

      store.register({ password: STRONG, confirmPassword: STRONG });

      expect(api.register).not.toHaveBeenCalled();
    });

    it('sends the collected data, resets and navigates home', () => {
      api.register.mockReturnValue(of({}));
      const store = create();
      seed(store);

      store.register({ password: STRONG, confirmPassword: STRONG });

      expect(api.register).toHaveBeenCalledWith({
        email: 'a@b.com',
        firstName: 'Ahmed',
        lastName: 'Ali',
        username: 'ahmed',
        gender: 'MALE',
        phone: '1012345678',
        password: STRONG,
        confirmPassword: STRONG,
      });
      expect(store.step()).toBe(RegisterStep.Email);
      expect(store.data().email).toBe('');
      expect(navigate).toHaveBeenCalledWith('/');
    });

    it('sends phone as undefined when it was left empty', () => {
      api.register.mockReturnValue(of({}));
      const store = create();
      seed(store, '');

      store.register({ password: STRONG, confirmPassword: STRONG });

      expect(api.register.mock.calls[0][0].phone).toBeUndefined();
    });

    it('keeps the data and exposes the error on failure', () => {
      api.register.mockReturnValue(fail('Username taken'));
      const store = create();
      seed(store);

      store.register({ password: STRONG, confirmPassword: STRONG });

      expect(store.error()).toBe('Username taken');
      expect(store.data().email).toBe('a@b.com');
      expect(navigate).not.toHaveBeenCalled();
    });
  });

  describe('persistence', () => {
    it('saves the step and data when they change', () => {
      const store = create();
      store.patch({ email: 'a@b.com' });
      store.next();
      TestBed.tick();

      expect(JSON.parse(sessionStorage.getItem(KEY) as string)).toMatchObject({
        step: RegisterStep.Otp,
        data: { email: 'a@b.com' },
      });
    });

    it('restores the saved step and data on creation', () => {
      sessionStorage.setItem(
        KEY,
        JSON.stringify({
          step: RegisterStep.Profile,
          data: { email: 'a@b.com', firstName: 'Ahmed' },
        }),
      );

      const store = create();

      expect(store.step()).toBe(RegisterStep.Profile);
      expect(store.data().email).toBe('a@b.com');
      expect(store.data().firstName).toBe('Ahmed');
      expect(store.data().lastName).toBe('');
    });

    it('ignores corrupted saved state', () => {
      sessionStorage.setItem(KEY, 'not json');

      expect(create().step()).toBe(RegisterStep.Email);
    });

    it('ignores a saved step that does not exist', () => {
      sessionStorage.setItem(KEY, JSON.stringify({ step: 99, data: {} }));

      expect(create().step()).toBe(RegisterStep.Email);
    });

    it('does not restore unknown fields', () => {
      sessionStorage.setItem(
        KEY,
        JSON.stringify({
          step: RegisterStep.Profile,
          data: { email: 'a@b.com', isAdmin: true },
        }),
      );

      const store = create();

      expect(Object.keys(store.data())).not.toContain('isAdmin');
    });

    it('never saves passwords', () => {
      api.register.mockReturnValue(new Subject());
      const store = create();
      store.patch({ email: 'a@b.com', gender: 'MALE' });
      store.next();
      store.register({ password: STRONG, confirmPassword: STRONG });
      TestBed.tick();

      expect(sessionStorage.getItem(KEY)).not.toContain(STRONG);
    });

    it('clears the saved state after a successful registration', () => {
      api.register.mockReturnValue(of({}));
      const store = create();
      store.patch({
        email: 'a@b.com',
        firstName: 'Ahmed',
        lastName: 'Ali',
        username: 'ahmed',
        gender: 'MALE',
      });
      store.next();
      TestBed.tick();
      expect(sessionStorage.getItem(KEY)).not.toBeNull();

      store.register({ password: STRONG, confirmPassword: STRONG });
      TestBed.tick();

      expect(sessionStorage.getItem(KEY)).toBeNull();
    });
  });
});
