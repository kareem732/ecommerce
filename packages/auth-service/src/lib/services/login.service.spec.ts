import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';
import { AuthApiService } from './auth-api.service';
import { LoginService } from './login.service';
import { SessionService } from './session.service';
import { TokenService } from './token.service';
import { provideAuthConfigForTests, TEST_USER, makeJwt } from '../testing/auth-testing';

describe('LoginService', () => {
  const api = { login: jest.fn() };
  let service: LoginService;
  let session: SessionService;
  let cookies: CookieService;

  beforeEach(() => {
    api.login.mockReset();
    TestBed.configureTestingModule({
      providers: [provideAuthConfigForTests(), CookieService, { provide: AuthApiService, useValue: api }],
    });
    cookies = TestBed.inject(CookieService);
    cookies.delete('user', '/');
    cookies.delete('firstName', '/');
    cookies.delete('lastName', '/');
    TestBed.inject(TokenService).clear();
    service = TestBed.inject(LoginService);
    session = TestBed.inject(SessionService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    TestBed.inject(TokenService).clear();
    cookies.delete('user', '/');
    cookies.delete('firstName', '/');
    cookies.delete('lastName', '/');
  });

  it('starts the session on success', (done) => {
    const payload = { user: TEST_USER, token: makeJwt() };
    api.login.mockReturnValue(of(payload));

    service.login({ username: 'u', password: 'p' }).subscribe((result) => {
      expect(result).toEqual(payload);
      expect(session.isLoggedIn()).toBe(true);
      expect(session.user()).toEqual(TEST_USER);
      done();
    });
  });

  it('sends the credentials to the api', (done) => {
    api.login.mockReturnValue(of({ user: TEST_USER, token: makeJwt() }));

    service.login({ username: 'u', password: 'p' }).subscribe(() => {
      expect(api.login).toHaveBeenCalledWith({ username: 'u', password: 'p' });
      done();
    });
  });

  it('passes remember = true to the session', (done) => {
    const payload = { user: TEST_USER, token: makeJwt() };
    api.login.mockReturnValue(of(payload));
    const start = jest.spyOn(session, 'start');

    service.login({ username: 'u', password: 'p' }, true).subscribe(() => {
      expect(start).toHaveBeenCalledWith(payload, true);
      done();
    });
  });

  it('defaults remember to false', (done) => {
    const payload = { user: TEST_USER, token: makeJwt() };
    api.login.mockReturnValue(of(payload));
    const start = jest.spyOn(session, 'start');

    service.login({ username: 'u', password: 'p' }).subscribe(() => {
      expect(start).toHaveBeenCalledWith(payload, false);
      done();
    });
  });

  it('does not start a session on failure', (done) => {
    api.login.mockReturnValue(throwError(() => ({ code: 'INVALID_CREDENTIALS' })));

    service.login({ username: 'u', password: 'bad' }).subscribe({
      error: (e) => {
        expect(e.code).toBe('INVALID_CREDENTIALS');
        expect(session.isLoggedIn()).toBe(false);
        done();
      },
    });
  });

  it('logout clears the session', () => {
    session.start({ user: TEST_USER, token: makeJwt() });
    service.logout();
    expect(session.isLoggedIn()).toBe(false);
  });

  it('saves user data, firstName, and lastName to cookies on login', (done) => {
    const payload = { user: TEST_USER, token: makeJwt() };
    api.login.mockReturnValue(of(payload));

    service.login({ username: 'u', password: 'p' }).subscribe(() => {
      expect(cookies.get('user')).toBe(JSON.stringify(TEST_USER));
      expect(cookies.get('firstName')).toBe(TEST_USER.firstName);
      expect(cookies.get('lastName')).toBe(TEST_USER.lastName);
      done();
    });
  });

  it('clears cookies on logout', () => {
    cookies.set('user', JSON.stringify(TEST_USER), { path: '/' });
    cookies.set('firstName', TEST_USER.firstName, { path: '/' });
    cookies.set('lastName', TEST_USER.lastName, { path: '/' });

    service.logout();

    expect(cookies.get('user')).toBe('');
    expect(cookies.get('firstName')).toBe('');
    expect(cookies.get('lastName')).toBe('');
  });
});
