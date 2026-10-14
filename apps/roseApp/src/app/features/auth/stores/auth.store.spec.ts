import { TestBed } from '@angular/core/testing';
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
  beforeEach(() => {
    localStorage.clear();
    TestBed.resetTestingModule();
  });

  afterEach(() => localStorage.clear());

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

  it('setSession persists to localStorage', () => {
    const store = create();
    store.setSession(session);

    expect(JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY) as string)).toEqual(session);
  });

  it('hydrates from localStorage on creation', () => {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
    const store = create();

    expect(store.isLoggedIn()).toBe(true);
    expect(store.user()?.email).toBe('mazika@test.com');
  });

  it('ignores and removes corrupted storage', () => {
    localStorage.setItem(AUTH_STORAGE_KEY, '{not-json');
    const store = create();

    expect(store.isLoggedIn()).toBe(false);
    expect(localStorage.getItem(AUTH_STORAGE_KEY)).toBeNull();
  });

  it('ignores and removes storage with missing fields', () => {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ token: 'x' }));
    const store = create();

    expect(store.isLoggedIn()).toBe(false);
    expect(localStorage.getItem(AUTH_STORAGE_KEY)).toBeNull();
  });

  it('updateUser merges fields and persists', () => {
    const store = create();
    store.setSession(session);
    store.updateUser({ firstName: 'Nour' });

    expect(store.fullName()).toBe('Nour Ali');
    expect(store.token()).toBe('abc123');
    expect(JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY) as string).user.firstName).toBe('Nour');
  });

  it('updateUser does nothing when logged out', () => {
    const store = create();
    store.updateUser({ firstName: 'Nour' });

    expect(store.user()).toBeNull();
    expect(localStorage.getItem(AUTH_STORAGE_KEY)).toBeNull();
  });

  it('clear resets state and removes storage', () => {
    const store = create();
    store.setSession(session);
    store.clear();

    expect(store.token()).toBeNull();
    expect(store.user()).toBeNull();
    expect(store.isLoggedIn()).toBe(false);
    expect(localStorage.getItem(AUTH_STORAGE_KEY)).toBeNull();
  });
});