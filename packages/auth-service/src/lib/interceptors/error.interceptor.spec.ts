import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { AuthError } from '../models/auth-error.model';
import { SessionService } from '../services/session.service';
import { TokenService } from '../services/token.service';
import { errorInterceptor } from './error.interceptor';
import { provideAuthConfigForTests, provideAuthServicesForTests, TEST_API_URL, TEST_USER, makeJwt } from '../testing/auth-testing';

describe('errorInterceptor', () => {
  let http: HttpClient;
  let controller: HttpTestingController;
  let session: SessionService;
  let navigate: jest.SpyInstance;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([errorInterceptor])),
        provideHttpClientTesting(),
        provideRouter([]),
        provideAuthConfigForTests(),
        provideAuthServicesForTests(),
      ],
    });
    TestBed.inject(TokenService).clear();
    http = TestBed.inject(HttpClient);
    controller = TestBed.inject(HttpTestingController);
    session = TestBed.inject(SessionService);
    navigate = jest.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
  });

  afterEach(() => {
    controller.verify();
    TestBed.inject(TokenService).clear();
  });

  function failGet(url: string, status: number, body: object = { message: 'boom' }): AuthError {
  let error!: AuthError;
  http.get(url).subscribe({ error: (e) => (error = e) });
  controller.expectOne(url).flush(body, { status, statusText: 'err' });
  return error;
}
  it('maps server errors to AuthError', () => {
    const error = failGet(`${TEST_API_URL}/api/products`, 500);
    expect(error).toEqual({ code: 'SERVER_ERROR', status: 500, message: 'boom' });
    expect(navigate).not.toHaveBeenCalled();
  });

  it('maps network errors', () => {
    let error!: AuthError;
    http.get(`${TEST_API_URL}/api/products`).subscribe({ error: (e) => (error = e) });
    controller.expectOne(`${TEST_API_URL}/api/products`).error(new ProgressEvent('error'));
    expect(error.code).toBe('NETWORK_ERROR');
  });

  it('clears the session and redirects on 401 from a protected endpoint', () => {
    session.start({ user: TEST_USER, token: makeJwt() });

    const error = failGet(`${TEST_API_URL}/api/cart`, 401);

    expect(error.code).toBe('UNAUTHORIZED');
    expect(session.isLoggedIn()).toBe(false);
    expect(navigate).toHaveBeenCalledWith('/auth/login');
  });

  it('reports invalid credentials on 401 from an auth endpoint without redirecting', () => {
    const error = failGet(`${TEST_API_URL}/api/auth/login`, 401, { message: 'Invalid credentials' });

    expect(error.code).toBe('INVALID_CREDENTIALS');
    expect(error.message).toBe('Invalid credentials');
    expect(navigate).not.toHaveBeenCalled();
  });
});
