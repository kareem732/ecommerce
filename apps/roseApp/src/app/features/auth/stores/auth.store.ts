import { Injectable, computed, signal } from '@angular/core';

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  username: string;
}

export interface AuthSession {
  token: string;
  user: AuthUser;
}

export const AUTH_STORAGE_KEY = 'auth_session';

@Injectable({ providedIn: 'root' })
export class AuthStore {
  private readonly _token = signal<string | null>(null);
  private readonly _user = signal<AuthUser | null>(null);

  readonly token = this._token.asReadonly();
  readonly user = this._user.asReadonly();
  readonly isLoggedIn = computed(() => !!this._token());
  readonly fullName = computed(() => {
    const u = this._user();
    return u ? `${u.firstName} ${u.lastName}`.trim() : '';
  });

  constructor() {
    this.hydrate();
  }

  setSession(session: AuthSession): void {
    this._token.set(session.token);
    this._user.set(session.user);
    this.persist(session);
  }

  updateUser(partial: Partial<AuthUser>): void {
    const token = this._token();
    const current = this._user();
    if (!token || !current) return;

    const user = { ...current, ...partial };
    this._user.set(user);
    this.persist({ token, user });
  }

  clear(): void {
    this._token.set(null);
    this._user.set(null);
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch {
      /* storage unavailable */
    }
  }

  private persist(session: AuthSession): void {
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
    } catch {
      /* storage unavailable */
    }
  }

  private hydrate(): void {
    try {
      const raw = localStorage.getItem(AUTH_STORAGE_KEY);
      if (!raw) return;

      const session = JSON.parse(raw) as Partial<AuthSession>;
      if (session?.token && session.user) {
        this._token.set(session.token);
        this._user.set(session.user);
      } else {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    } catch {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }
}
