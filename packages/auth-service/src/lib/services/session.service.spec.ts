import { TestBed } from '@angular/core/testing';
import { CookieService } from 'ngx-cookie-service';
import { SessionService } from './session.service';
import { TokenService } from './token.service';
import { provideAuthConfigForTests, makeJwt, TEST_USER } from '../testing/auth-testing';

describe('SessionService', () => {
  let tokens: TokenService;
  let cookies: CookieService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideAuthConfigForTests(), CookieService] });
    cookies = TestBed.inject(CookieService);
    cookies.delete('user', '/');
    cookies.delete('firstName', '/');
    cookies.delete('lastName', '/');
    tokens = TestBed.inject(TokenService);
    tokens.clear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
    tokens.clear();
    cookies.delete('user', '/');
    cookies.delete('firstName', '/');
    cookies.delete('lastName', '/');
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
    expect(cookies.get('user')).toBe(JSON.stringify(TEST_USER));
    expect(cookies.get('firstName')).toBe(TEST_USER.firstName);
    expect(cookies.get('lastName')).toBe(TEST_USER.lastName);
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
    expect(cookies.get('user')).toBe('');
    expect(cookies.get('firstName')).toBe('');
    expect(cookies.get('lastName')).toBe('');
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
    expect(cookies.get('firstName')).toBe(TEST_USER.firstName);
    expect(cookies.get('lastName')).toBe(TEST_USER.lastName);
  });

  it('restores the user from cookies when a valid token exists', () => {
    tokens.setToken(makeJwt());
    cookies.set('user', JSON.stringify(TEST_USER), { path: '/' });
    cookies.set('firstName', TEST_USER.firstName, { path: '/' });
    cookies.set('lastName', TEST_USER.lastName, { path: '/' });

    const session = TestBed.inject(SessionService);
    expect(session.isLoggedIn()).toBe(true);
    expect(session.user()).toEqual(TEST_USER);
  });
});
