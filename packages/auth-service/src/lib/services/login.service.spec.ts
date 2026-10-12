import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { AuthApiService } from './auth-api.service';
import { LoginService } from './login.service';
import { SessionService } from './session.service';
import { TokenService } from './token.service';
import { provideAuthConfigForTests, TEST_USER, makeJwt } from '../testing/auth-testing';

describe('LoginService', () => {
  const api = { login: jest.fn() };
  let service: LoginService;
  let session: SessionService;

  beforeEach(() => {
    api.login.mockReset();
    TestBed.configureTestingModule({
      providers: [provideAuthConfigForTests(), { provide: AuthApiService, useValue: api }],
    });
    TestBed.inject(TokenService).clear();
    service = TestBed.inject(LoginService);
    session = TestBed.inject(SessionService);
  });

  afterEach(() => TestBed.inject(TokenService).clear());

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

  it('does not start a session on failure', (done) => {
    api.login.mockReturnValue(throwError(() => ({ code: 'INVALID_CREDENTIALS' })));

    service.login({ username: 'u', password: 'bad' }).subscribe({
      error: () => {
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
});
