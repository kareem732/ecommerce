import { TestBed } from '@angular/core/testing';
import { TokenService } from './token.service';
import { provideAuthConfigForTests, makeJwt } from '../testing/auth-testing';

describe('TokenService', () => {
  let service: TokenService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideAuthConfigForTests()] });
    service = TestBed.inject(TokenService);
    service.clear();
  });

  afterEach(() => service.clear());

  it('returns null when there is no token', () => {
    expect(service.getToken()).toBeNull();
    expect(service.hasValidToken()).toBe(false);
  });

  it('stores and reads the token from the cookie', () => {
    const token = makeJwt();
    service.setToken(token);
    expect(service.getToken()).toBe(token);
    expect(service.hasValidToken()).toBe(true);
  });

  it('clears the token', () => {
    service.setToken(makeJwt());
    service.clear();
    expect(service.getToken()).toBeNull();
  });

  it('decodes the jwt payload', () => {
    const token = makeJwt({ userId: 'abc', role: 'ADMIN' });
    expect(service.getPayload(token)).toMatchObject({ userId: 'abc', role: 'ADMIN' });
  });

  it('returns a null payload for a malformed token', () => {
    expect(service.getPayload('not-a-jwt')).toBeNull();
    expect(service.getPayload('a.b.c')).toBeNull();
  });

  it('detects an expired token', () => {
    expect(service.isExpired(makeJwt({}, -10))).toBe(true);
  });

  it('treats a valid token as not expired', () => {
    expect(service.isExpired(makeJwt({}, 3600))).toBe(false);
  });

  it('treats null and malformed tokens as expired', () => {
    expect(service.isExpired(null)).toBe(true);
    expect(service.isExpired('garbage')).toBe(true);
  });
});
