import { Injectable, computed, inject, signal } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';

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
  private readonly cookies = inject(CookieService);
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
      this.cookies.delete(AUTH_STORAGE_KEY, '/', undefined, undefined, 'Strict');
    } catch {
      /* storage unavailable */
    }
  }

  private persist(session: AuthSession): void {
    try {
      this.cookies.set(AUTH_STORAGE_KEY, JSON.stringify(session), {
        path: '/',
        sameSite: 'Strict',
      });
    } catch {
      /* storage unavailable */
    }
  }

  private hydrate(): void {
    try {
      const raw = this.cookies.get(AUTH_STORAGE_KEY);
      if (!raw) return;

      const session = JSON.parse(raw) as Partial<AuthSession>;
      if (session?.token && session.user) {
        this._token.set(session.token);
        this._user.set(session.user);
      } else {
        this.cookies.delete(AUTH_STORAGE_KEY, '/', undefined, undefined, 'Strict');
      }
    } catch {
      this.cookies.delete(AUTH_STORAGE_KEY, '/', undefined, undefined, 'Strict');
    }
  }
}
