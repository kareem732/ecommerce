import { provideAuthConfigForTests, TEST_API_URL, TEST_USER } from './../testing/auth-testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { AuthApiService } from './auth-api.service';

describe('AuthApiService', () => {
  let api: AuthApiService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideAuthConfigForTests()],
    });
    api = TestBed.inject(AuthApiService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  const authPayload = { user: TEST_USER, token: 'jwt' };

  it('login posts username/password and returns the payload', () => {
    let result: unknown;
    api.login({ username: 'u', password: 'p' }).subscribe((r) => (result = r));

    const req = http.expectOne(`${TEST_API_URL}/api/auth/login`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ username: 'u', password: 'p' });
    req.flush({ status: true, code: 200, payload: authPayload });

    expect(result).toEqual(authPayload);
  });

  it('register posts the body and returns the payload', () => {
    const body = {
      username: 'u', email: 'e@x.com', password: 'p', confirmPassword: 'p',
      firstName: 'A', lastName: 'B', gender: 'MALE' as const,
    };
    let result: unknown;
    api.register(body).subscribe((r) => (result = r));

    const req = http.expectOne(`${TEST_API_URL}/api/auth/register`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(body);
    req.flush({ status: true, code: 201, payload: authPayload });

    expect(result).toEqual(authPayload);
  });

  it.each([
    ['sendEmailVerification', '/api/auth/send-email-verification', { email: 'e@x.com' }],
    ['confirmEmailVerification', '/api/auth/confirm-email-verification', { email: 'e@x.com', code: '123456' }],
    ['forgotPassword', '/api/auth/forgot-password', { email: 'e@x.com', redirectUrl: 'https://app/reset' }],
    ['resetPassword', '/api/auth/reset-password', { token: 't', newPassword: 'n', confirmPassword: 'n' }],
  ] as const)('%s posts to %s and returns the message', (method, path, body) => {
    let result: string | undefined;
    (api[method] as (b: unknown) => ReturnType<typeof api.sendEmailVerification>)(body).subscribe(
      (r) => (result = r),
    );

    const req = http.expectOne(`${TEST_API_URL}${path}`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(body);
    req.flush({ status: true, code: 200, message: 'done' });

    expect(result).toBe('done');
  });

  it('errors with a standardized error when the payload is missing', () => {
    let error: unknown;
    api.login({ username: 'u', password: 'p' }).subscribe({ error: (e) => (error = e) });

    http.expectOne(`${TEST_API_URL}/api/auth/login`).flush({ status: true, code: 200 });

    expect(error).toMatchObject({ code: 'UNKNOWN', message: 'Malformed server response.' });
  });
});
