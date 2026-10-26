import { TestBed } from '@angular/core/testing';
import { SessionService } from './session.service';
import { TokenService } from './token.service';
import { provideAuthConfigForTests, makeJwt, TEST_USER } from '../testing/auth-testing';

describe('SessionService', () => {
  let tokens: TokenService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [provideAuthConfigForTests()] });
    tokens = TestBed.inject(TokenService);
    tokens.clear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
    tokens.clear();
    localStorage.clear();
  });

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

  it('start() forwards remember = true to the token service', () => {
    const session = TestBed.inject(SessionService);
    const setToken = jest.spyOn(tokens, 'setToken');
    const token = makeJwt();

    session.start({ user: TEST_USER, token }, true);

    expect(setToken).toHaveBeenCalledWith(token, true);
  });

  it('start() defaults remember to false', () => {
    const session = TestBed.inject(SessionService);
    const setToken = jest.spyOn(tokens, 'setToken');
    const token = makeJwt();

    session.start({ user: TEST_USER, token });

    expect(setToken).toHaveBeenCalledWith(token, false);
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

  it('is logged out when the stored token is expired', () => {
    tokens.setToken(makeJwt({}, -10));
    const session = TestBed.inject(SessionService);
    expect(session.isLoggedIn()).toBe(false);
  });

  it('setUser() hydrates the user', () => {
    const session = TestBed.inject(SessionService);
    session.setUser(TEST_USER);
    expect(session.user()).toEqual(TEST_USER);
    expect(localStorage.getItem('firstName')).toBe(TEST_USER.firstName);
  });

  it('restores the user from localStorage when a valid token exists', () => {
    tokens.setToken(makeJwt());
    localStorage.setItem('user', JSON.stringify(TEST_USER));
    localStorage.setItem('firstName', TEST_USER.firstName);
    localStorage.setItem('lastName', TEST_USER.lastName);

    const session = TestBed.inject(SessionService);
    expect(session.isLoggedIn()).toBe(true);
    expect(session.user()).toEqual(TEST_USER);
  });
});
