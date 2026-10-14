import { vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { PasswordResetService } from '@org/auth-service';
import { Subject, of, throwError } from 'rxjs';
import { ResetPasswordStore } from './reset-password.store';

describe('ResetPasswordStore', () => {
  const service = { resetPassword: vi.fn() };
  const STRONG = 'Str0ng!Pass#2024';
  const params = { token: 'abc-token', newPassword: STRONG, confirmPassword: STRONG };

  const create = () => {
    TestBed.configureTestingModule({
      providers: [ResetPasswordStore, { provide: PasswordResetService, useValue: service }],
    });
    return TestBed.inject(ResetPasswordStore);
  };

  beforeEach(() => service.resetPassword.mockReset());

  it('starts idle', () => {
    const store = create();

    expect(store.status()).toBe('idle');
    expect(store.succeeded()).toBe(false);
    expect(store.error()).toBeNull();
  });

  it('sends the token with both passwords', () => {
    service.resetPassword.mockReturnValue(of('done'));
    const store = create();

    store.resetPassword(params);

    expect(service.resetPassword).toHaveBeenCalledWith({
      token: 'abc-token',
      newPassword: STRONG,
      confirmPassword: STRONG,
    });
  });

  it('marks the request as succeeded', () => {
    service.resetPassword.mockReturnValue(of('done'));
    const store = create();

    store.resetPassword(params);

    expect(store.succeeded()).toBe(true);
    expect(store.loading()).toBe(false);
    expect(store.error()).toBeNull();
  });

  it('is loading while the request is in flight', () => {
    const response$ = new Subject<string>();
    service.resetPassword.mockReturnValue(response$);
    const store = create();

    store.resetPassword(params);
    expect(store.loading()).toBe(true);

    response$.next('done');
    expect(store.loading()).toBe(false);
    expect(store.succeeded()).toBe(true);
  });

  it('exposes the server error on failure', () => {
    service.resetPassword.mockReturnValue(
      throwError(() => ({ code: 'VALIDATION_ERROR', status: 400, message: 'Token expired' })),
    );
    const store = create();

    store.resetPassword(params);

    expect(store.error()).toBe('Token expired');
    expect(store.succeeded()).toBe(false);
    expect(store.loading()).toBe(false);
  });

  it('allows retrying after a failure', () => {
    service.resetPassword.mockReturnValueOnce(throwError(() => ({ message: 'Token expired' })));
    const store = create();
    store.resetPassword(params);

    service.resetPassword.mockReturnValueOnce(of('done'));
    store.resetPassword(params);

    expect(store.succeeded()).toBe(true);
    expect(store.error()).toBeNull();
  });

  it('ignores a second submit while one is still pending', () => {
    service.resetPassword.mockReturnValue(new Subject<string>());
    const store = create();

    store.resetPassword(params);
    store.resetPassword(params);

    expect(service.resetPassword).toHaveBeenCalledTimes(1);
  });
});