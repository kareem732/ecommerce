import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { TokenService } from './token.service';
import { provideAuthConfigForTests, makeJwt } from '../testing/auth-testing';

function createFakeDocument(protocol = 'http:') {
  const writes: string[] = [];
  let jar = '';

  return {
    writes,
    location: { protocol },
    get cookie(): string {
      return jar;
    },
    set cookie(value: string) {
      writes.push(value);
      const [pair] = value.split(';');
      const cookieValue = pair.split('=')[1];
      jar = cookieValue ? pair : '';
    },
  };
}

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

describe('TokenService - remember me', () => {
  function setup(protocol = 'http:') {
    TestBed.resetTestingModule();
    const fakeDoc = createFakeDocument(protocol);
    TestBed.configureTestingModule({
      providers: [provideAuthConfigForTests(), { provide: DOCUMENT, useValue: fakeDoc }],
    });
    return { fakeDoc, service: TestBed.inject(TokenService) };
  }

  afterEach(() => jest.useRealTimers());

  it('writes a session cookie (no expires) by default', () => {
    const { fakeDoc, service } = setup();

    service.setToken(makeJwt());

    const written = fakeDoc.writes[0];
    expect(written).not.toContain('expires=');
    expect(written).toContain('path=/');
    expect(written).toContain('SameSite=Strict');
  });

  it('writes a session cookie when remember is explicitly false', () => {
    const { fakeDoc, service } = setup();

    service.setToken(makeJwt(), false);

    expect(fakeDoc.writes[0]).not.toContain('expires=');
  });

  it('writes a 30-day expiry when remember is true', () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-01-01T00:00:00Z'));
    const { fakeDoc, service } = setup();

    service.setToken(makeJwt({}, 60 * 60 * 24 * 365), true);

    const expires = /expires=([^;]+)/.exec(fakeDoc.writes[0])?.[1];
    expect(expires).toBe(new Date('2026-01-31T00:00:00Z').toUTCString());
  });

  it('ignores the jwt exp when choosing the cookie lifetime', () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-01-01T00:00:00Z'));
    const { fakeDoc, service } = setup();

    // token valid for only 1 hour, but remember me still gives a 30-day cookie
    service.setToken(makeJwt({}, 3600), true);

    const expires = /expires=([^;]+)/.exec(fakeDoc.writes[0])?.[1];
    expect(expires).toBe(new Date('2026-01-31T00:00:00Z').toUTCString());
  });

  it('adds Secure only on https', () => {
    const http = setup('http:');
    http.service.setToken(makeJwt());
    expect(http.fakeDoc.writes[0]).not.toContain('Secure');

    const https = setup('https:');
    https.service.setToken(makeJwt());
    expect(https.fakeDoc.writes[0]).toContain('; Secure');
  });

  it('reads the token back in both modes', () => {
    const { service } = setup();
    const token = makeJwt();

    service.setToken(token, false);
    expect(service.getToken()).toBe(token);

    service.setToken(token, true);
    expect(service.getToken()).toBe(token);
  });

  it('clear() expires the cookie and removes the token', () => {
    const { fakeDoc, service } = setup();
    service.setToken(makeJwt(), true);

    service.clear();

    expect(fakeDoc.writes[fakeDoc.writes.length - 1]).toContain('expires=Thu, 01 Jan 1970 00:00:00 GMT');
    expect(service.getToken()).toBeNull();
  });
});
