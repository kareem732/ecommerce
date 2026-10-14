import { vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { PasswordResetService } from '@org/auth-service';
import { Subject, of, throwError } from 'rxjs';
import { ForgotPasswordStore } from './forgot-password.store';

describe('ForgotPasswordStore', () => {
  const service = { forgotPassword: vi.fn() };
  const payload = { email: 'e@x.com', redirectUrl: 'http://localhost/auth/reset-password' };

  const create = () => {
    TestBed.configureTestingModule({
      providers: [ForgotPasswordStore, { provide: PasswordResetService, useValue: service }],
    });
    return TestBed.inject(ForgotPasswordStore);
  };

  beforeEach(() => service.forgotPassword.mockReset());

  it('starts idle', () => {
    const store = create();

    expect(store.status()).toBe('idle');
    expect(store.succeeded()).toBe(false);
    expect(store.error()).toBeNull();
  });

  it('sends the email together with the redirect url', () => {
    service.forgotPassword.mockReturnValue(of('sent'));
    const store = create();

    store.send(payload);

    expect(service.forgotPassword).toHaveBeenCalledWith(payload.email, payload.redirectUrl);
  });

  it('marks the request as succeeded', () => {
    service.forgotPassword.mockReturnValue(of('sent'));
    const store = create();

    store.send(payload);

    expect(store.succeeded()).toBe(true);
    expect(store.loading()).toBe(false);
    expect(store.error()).toBeNull();
  });

  it('is loading while the request is in flight', () => {
    const response$ = new Subject<string>();
    service.forgotPassword.mockReturnValue(response$);
    const store = create();

    store.send(payload);
    expect(store.loading()).toBe(true);

    response$.next('sent');
    expect(store.loading()).toBe(false);
    expect(store.succeeded()).toBe(true);
  });

  it('exposes the server error on failure', () => {
    service.forgotPassword.mockReturnValue(
      throwError(() => ({ code: 'NOT_FOUND', status: 404, message: 'User not found' })),
    );
    const store = create();

    store.send(payload);

    expect(store.error()).toBe('User not found');
    expect(store.succeeded()).toBe(false);
    expect(store.loading()).toBe(false);
  });

  it('allows retrying after a failure', () => {
    service.forgotPassword.mockReturnValueOnce(throwError(() => ({ message: 'User not found' })));
    const store = create();
    store.send(payload);

    service.forgotPassword.mockReturnValueOnce(of('sent'));
    store.send(payload);

    expect(store.succeeded()).toBe(true);
    expect(store.error()).toBeNull();
  });

  it('ignores a second send while one is still pending', () => {
    service.forgotPassword.mockReturnValue(new Subject<string>());
    const store = create();

    store.send(payload);
    store.send(payload);

    expect(service.forgotPassword).toHaveBeenCalledTimes(1);
  });
});