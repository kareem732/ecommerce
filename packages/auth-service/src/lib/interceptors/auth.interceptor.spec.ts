import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { TokenService } from '../services/token.service';
import { TEST_API_URL, makeJwt, provideAuthConfigForTests, provideAuthServicesForTests } from '../testing/auth-testing';
import { authInterceptor } from './auth.interceptor';

describe('authInterceptor', () => {
  let http: HttpClient;
  let controller: HttpTestingController;
  let tokens: TokenService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        provideAuthConfigForTests(),
        provideAuthServicesForTests(),
      ],
    });
    http = TestBed.inject(HttpClient);
    controller = TestBed.inject(HttpTestingController);
    tokens = TestBed.inject(TokenService);
    tokens.clear();
  });

  afterEach(() => {
    controller.verify();
    tokens.clear();
  });

  it('adds the bearer token to api requests', () => {
    const token = makeJwt();
    tokens.setToken(token);

    http.get(`${TEST_API_URL}/api/products`).subscribe();

    const req = controller.expectOne(`${TEST_API_URL}/api/products`);
    expect(req.request.headers.get('Authorization')).toBe(`Bearer ${token}`);
    req.flush({});
  });

  it('does not add a header when there is no token', () => {
    http.get(`${TEST_API_URL}/api/products`).subscribe();

    const req = controller.expectOne(`${TEST_API_URL}/api/products`);
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({});
  });

  it('does not add a header to auth endpoints', () => {
    tokens.setToken(makeJwt());

    http.post(`${TEST_API_URL}/api/auth/login`, {}).subscribe();

    const req = controller.expectOne(`${TEST_API_URL}/api/auth/login`);
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({});
  });

  it('does not leak the token to other hosts', () => {
    tokens.setToken(makeJwt());

    http.get('https://other.example.com/data').subscribe();

    const req = controller.expectOne('https://other.example.com/data');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({});
  });
});
