import { type MockInstance, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { LoginService } from '@org/auth-service';
import { Subject, of, throwError } from 'rxjs';
import { LoginParams, LoginStore } from './login.store';

describe('LoginStore', () => {
  const loginService = { login: vi.fn() };
  let navigate: MockInstance;

  const params: LoginParams = {
    username: 'ahmed',
    password: 'secret123',
    remember: true,
    returnUrl: '/cart',
  };

  const create = () => {
    TestBed.configureTestingModule({
      providers: [
        LoginStore,
        provideRouter([]),
        { provide: LoginService, useValue: loginService },
      ],
    });
    navigate = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    return TestBed.inject(LoginStore);
  };

  beforeEach(() => loginService.login.mockReset());

  it('starts idle', () => {
    const store = create();

    expect(store.status()).toBe('idle');
    expect(store.loading()).toBe(false);
    expect(store.error()).toBeNull();
  });

  it('sends the credentials and the remember flag', () => {
    loginService.login.mockReturnValue(of({}));
    const store = create();

    store.login(params);

    expect(loginService.login).toHaveBeenCalledWith(
      { username: 'ahmed', password: 'secret123' },
      true,
    );
  });

  it('navigates to the returnUrl on success', () => {
    loginService.login.mockReturnValue(of({}));
    const store = create();

    store.login(params);

    expect(navigate).toHaveBeenCalledWith('/cart');
    expect(store.succeeded()).toBe(true);
    expect(store.loading()).toBe(false);
  });

  it('is loading while the request is in flight', () => {
    const response$ = new Subject<unknown>();
    loginService.login.mockReturnValue(response$);
    const store = create();

    store.login(params);

    expect(store.loading()).toBe(true);
    expect(navigate).not.toHaveBeenCalled();

    response$.next({});

    expect(store.loading()).toBe(false);
    expect(navigate).toHaveBeenCalledWith('/cart');
  });

  it('exposes the error and does not navigate on failure', () => {
    loginService.login.mockReturnValue(
      throwError(() => ({ code: 'INVALID_CREDENTIALS', status: 401, message: 'Invalid credentials' })),
    );
    const store = create();

    store.login(params);

    expect(store.error()).toBe('Invalid credentials');
    expect(store.status()).toBe('error');
    expect(store.loading()).toBe(false);
    expect(navigate).not.toHaveBeenCalled();
  });

  it('clears the previous error when trying again', () => {
    loginService.login.mockReturnValueOnce(throwError(() => ({ message: 'Invalid credentials' })));
    const store = create();
    store.login(params);
    expect(store.error()).toBe('Invalid credentials');

    loginService.login.mockReturnValueOnce(new Subject<unknown>());
    store.login(params);

    expect(store.error()).toBeNull();
    expect(store.loading()).toBe(true);
  });

  it('ignores a second login while one is still pending', () => {
    loginService.login.mockReturnValue(new Subject<unknown>());
    const store = create();

    store.login(params);
    store.login(params);

    expect(loginService.login).toHaveBeenCalledTimes(1);
  });
});