import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { AuthApiService } from './auth-api.service';
import { RegisterService } from './register.service';
import { SessionService } from './session.service';
import { TokenService } from './token.service';
import { provideAuthConfigForTests, TEST_USER, makeJwt } from '../testing/auth-testing';

const request = {
  username: 'u', email: 'e@x.com', password: 'p', confirmPassword: 'p',
  firstName: 'A', lastName: 'B', gender: 'MALE' as const,
};

describe('RegisterService', () => {
  const api = { register: jest.fn() };
  let service: RegisterService;
  let session: SessionService;

  beforeEach(() => {
    api.register.mockReset();
    TestBed.configureTestingModule({
      providers: [provideAuthConfigForTests(), { provide: AuthApiService, useValue: api }],
    });
    TestBed.inject(TokenService).clear();
    service = TestBed.inject(RegisterService);
    session = TestBed.inject(SessionService);
  });

  afterEach(() => TestBed.inject(TokenService).clear());

  it('registers and starts the session', (done) => {
    api.register.mockReturnValue(of({ user: TEST_USER, token: makeJwt() }));

    service.register(request).subscribe(() => {
      expect(api.register).toHaveBeenCalledWith(request);
      expect(session.isLoggedIn()).toBe(true);
      done();
    });
  });

  it('propagates errors without starting a session', (done) => {
    api.register.mockReturnValue(throwError(() => ({ code: 'CONFLICT' })));

    service.register(request).subscribe({
      error: (e) => {
        expect(e.code).toBe('CONFLICT');
        expect(session.isLoggedIn()).toBe(false);
        done();
      },
    });
  });
});
