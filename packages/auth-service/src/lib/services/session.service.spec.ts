import { TestBed } from '@angular/core/testing';
import { SessionService } from './session.service';
import { TokenService } from './token.service';
import { provideAuthConfigForTests, provideAuthServicesForTests, makeJwt, TEST_USER } from '../testing/auth-testing';

describe('SessionService', () => {
  let tokens: TokenService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideAuthConfigForTests(), provideAuthServicesForTests()] });
    tokens = TestBed.inject(TokenService);
    tokens.clear();
  });

  afterEach(() => tokens.clear());

  it('starts logged out', () => {
    const session = TestBed.inject(SessionService);
    expect(session.isLoggedIn()).toBe(false);
    expect(session.user()).toBeNull();
  });

  it('start() stores the token and the user', () => {
    const session = TestBed.inject(SessionService);
    const token = makeJwt();

    session.start({ user: TEST_USER, token });

    expect(session.isLoggedIn()).toBe(true);
    expect(session.user()).toEqual(TEST_USER);
    expect(tokens.getToken()).toBe(token);
  });

  it('clear() removes everything', () => {
    const session = TestBed.inject(SessionService);
    session.start({ user: TEST_USER, token: makeJwt() });

    session.clear();

    expect(session.isLoggedIn()).toBe(false);
    expect(session.user()).toBeNull();
    expect(tokens.getToken()).toBeNull();
  });

  it('restores the logged-in state from an existing cookie', () => {
    tokens.setToken(makeJwt());
    const session = TestBed.inject(SessionService);
    expect(session.isLoggedIn()).toBe(true);
  });

  it('setUser() hydrates the user', () => {
    const session = TestBed.inject(SessionService);
    session.setUser(TEST_USER);
    expect(session.user()).toEqual(TEST_USER);
  });
});
