import { TestBed } from '@angular/core/testing';
import { CookieService } from 'ngx-cookie-service';
import { AUTH_STORAGE_KEY, AuthSession, AuthStore } from './auth.store';

const session: AuthSession = {
  token: 'abc123',
  user: {
    id: '1',
    email: 'mazika@test.com',
    firstName: 'Mazika',
    lastName: 'Ali',
    username: 'mazika',
  },
};

describe('AuthStore', () => {
  let cookies: CookieService;

  beforeEach(() => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ providers: [CookieService] });
    cookies = TestBed.inject(CookieService);
    cookies.delete(AUTH_STORAGE_KEY, '/');
  });

  afterEach(() => {
    cookies.delete(AUTH_STORAGE_KEY, '/');
  });

  const create = () => TestBed.inject(AuthStore);

  it('starts logged out when storage is empty', () => {
    const store = create();

    expect(store.token()).toBeNull();
    expect(store.user()).toBeNull();
    expect(store.isLoggedIn()).toBe(false);
    expect(store.fullName()).toBe('');
  });

  it('setSession updates state and computed values', () => {
    const store = create();
    store.setSession(session);

    expect(store.token()).toBe('abc123');
    expect(store.user()).toEqual(session.user);
    expect(store.isLoggedIn()).toBe(true);
    expect(store.fullName()).toBe('Mazika Ali');
  });

  it('setSession persists to cookies', () => {
    const store = create();
    store.setSession(session);

    expect(JSON.parse(cookies.get(AUTH_STORAGE_KEY))).toEqual(session);
  });

  it('hydrates from cookies on creation', () => {
    cookies.set(AUTH_STORAGE_KEY, JSON.stringify(session), { path: '/' });
    const store = create();

    expect(store.isLoggedIn()).toBe(true);
    expect(store.user()?.email).toBe('mazika@test.com');
  });

  it('ignores and removes corrupted storage', () => {
    cookies.set(AUTH_STORAGE_KEY, '{not-json', { path: '/' });
    const store = create();

    expect(store.isLoggedIn()).toBe(false);
    expect(cookies.get(AUTH_STORAGE_KEY)).toBe('');
  });

  it('ignores and removes storage with missing fields', () => {
    cookies.set(AUTH_STORAGE_KEY, JSON.stringify({ token: 'x' }), { path: '/' });
    const store = create();

    expect(store.isLoggedIn()).toBe(false);
    expect(cookies.get(AUTH_STORAGE_KEY)).toBe('');
  });

  it('updateUser merges fields and persists', () => {
    const store = create();
    store.setSession(session);
    store.updateUser({ firstName: 'Nour' });

    expect(store.fullName()).toBe('Nour Ali');
    expect(store.token()).toBe('abc123');
    expect(JSON.parse(cookies.get(AUTH_STORAGE_KEY)).user.firstName).toBe('Nour');
  });

  it('updateUser does nothing when logged out', () => {
    const store = create();
    store.updateUser({ firstName: 'Nour' });

    expect(store.user()).toBeNull();
    expect(cookies.get(AUTH_STORAGE_KEY)).toBe('');
  });

  it('clear resets state and removes storage', () => {
    const store = create();
    store.setSession(session);
    store.clear();

    expect(store.token()).toBeNull();
    expect(store.user()).toBeNull();
    expect(store.isLoggedIn()).toBe(false);
    expect(cookies.get(AUTH_STORAGE_KEY)).toBe('');
  });
});