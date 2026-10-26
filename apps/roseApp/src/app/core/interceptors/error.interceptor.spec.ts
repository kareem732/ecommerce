import {
  HttpContext,
  HttpClient,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import {
  AUTH_CONFIG,
  AuthError,
  NotificationService,
  SessionService,
  TokenService,
} from '@org/auth-service';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  errorInterceptor,
  skipErrorNotification,
} from './error.interceptor';

describe('Global HTTP Error Interceptor', () => {
  let http: HttpClient;
  let controller: HttpTestingController;
  let notifications: NotificationService;
  let router: Router;

  const testConfig = {
    apiUrl: 'https://api.test',
    tokenCookieName: 'rose_token',
    loginRoute: '/auth/login',
    homeRoute: '/',
  };

  beforeEach(() => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([errorInterceptor])),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: AUTH_CONFIG, useValue: testConfig },
        TokenService,
        SessionService,
        NotificationService,
      ],
    });

    http = TestBed.inject(HttpClient);
    controller = TestBed.inject(HttpTestingController);
    notifications = TestBed.inject(NotificationService);
    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true as never);
  });

  afterEach(() => {
    controller.verify();
    TestBed.resetTestingModule();
  });

  function failRequest(
    url: string,
    status: number,
    body: unknown = { message: 'Failed' },
    context?: HttpContext,
  ): AuthError {
    let capturedError!: AuthError;
    http.get(url, { context }).subscribe({
      next: () => expect.unreachable('Expected request to fail'),
      error: (err) => {
        capturedError = err;
      },
    });

    const req = controller.expectOne(url);
    if (body instanceof ProgressEvent) {
      req.error(body);
    } else {
      req.flush(body, { status, statusText: 'Error' });
    }
    return capturedError;
  }

  it('produces the expected toast on HTTP error', () => {
    const errorSpy = vi.spyOn(notifications, 'error');

    failRequest('/api/items', 400, { message: 'Item is not available' });

    expect(errorSpy).toHaveBeenCalledTimes(1);
    expect(errorSpy).toHaveBeenCalledWith('Item is not available');
  });

  it('safely extracts backend error messages from various supported response formats', () => {
    const errorSpy = vi.spyOn(notifications, 'error');

    // 1. String message in object
    failRequest('/api/test-1', 400, { message: 'Custom server error' });
    expect(errorSpy).toHaveBeenLastCalledWith('Custom server error');

    // 2. Array of message strings
    failRequest('/api/test-2', 422, { message: ['Field A invalid', 'Field B required'] });
    expect(errorSpy).toHaveBeenLastCalledWith('Field A invalid, Field B required');

    // 3. String error field in object
    failRequest('/api/test-3', 409, { error: 'Resource conflict occurred' });
    expect(errorSpy).toHaveBeenLastCalledWith('Resource conflict occurred');

    // 4. Plain text body
    failRequest('/api/test-4', 400, 'Direct plain text message');
    expect(errorSpy).toHaveBeenLastCalledWith('Direct plain text message');
  });

  it('falls back to a safe generic message when message is missing or malformed', () => {
    const errorSpy = vi.spyOn(notifications, 'error');

    // Empty body
    const err500 = failRequest('/api/empty-500', 500, null);
    expect(err500.code).toBe('SERVER_ERROR');
    expect(err500.message).toContain('try again later');
    expect(errorSpy).toHaveBeenLastCalledWith(err500.message);

    // Malformed body with HTML / gateway error
    const err502 = failRequest(
      '/api/html-502',
      502,
      '<html><body>502 Bad Gateway</body></html>',
    );
    expect(err502.message).not.toContain('<html');
    expect(err502.message).toContain('try again later');

    // Malformed body with stack trace
    const errStackTrace = failRequest(
      '/api/trace',
      500,
      'Error: boom\n    at internal/process/task_queues:95:5',
    );
    expect(errStackTrace.message).not.toContain('internal/process');
    expect(errStackTrace.message).toContain('try again later');
  });

  it('handles network errors and connection failures', () => {
    const errorSpy = vi.spyOn(notifications, 'error');

    const networkErr = failRequest('/api/network', 0, new ProgressEvent('error'));

    expect(networkErr.code).toBe('NETWORK_ERROR');
    expect(networkErr.message).toContain('connection');
    expect(errorSpy).toHaveBeenCalledWith(networkErr.message);
  });

  it('preserves error observable propagation so calling services can handle errors', () => {
    let errorCaughtByCaller: AuthError | undefined;

    http.get('/api/caller-check').subscribe({
      next: () => expect.unreachable('Should have errored'),
      error: (err) => {
        errorCaughtByCaller = err;
      },
    });

    const req = controller.expectOne('/api/caller-check');
    req.flush({ message: 'Caller should see this' }, { status: 404, statusText: 'Not Found' });

    expect(errorCaughtByCaller).toBeDefined();
    expect(errorCaughtByCaller?.status).toBe(404);
    expect(errorCaughtByCaller?.message).toBe('Caller should see this');
  });

  it('does not produce duplicate toasts when requests are explicitly excluded via skipErrorNotification', () => {
    const errorSpy = vi.spyOn(notifications, 'error');
    let callerReceivedError = false;

    http.get('/api/local-handled', { context: skipErrorNotification() }).subscribe({
      next: () => expect.unreachable('Should fail'),
      error: () => {
        callerReceivedError = true;
      },
    });

    const req = controller.expectOne('/api/local-handled');
    req.flush({ message: 'Handled locally' }, { status: 422, statusText: 'Unprocessable' });

    // Toast is suppressed
    expect(errorSpy).not.toHaveBeenCalled();
    // Caller still receives the error
    expect(callerReceivedError).toBe(true);
  });

  it('handles 429 Too Many Requests status properly', () => {
    const err429 = failRequest('/api/rate-limited', 429, {});
    expect(err429.code).toBe('TOO_MANY_REQUESTS');
    expect(err429.message).toContain('Too many requests');
  });
});
