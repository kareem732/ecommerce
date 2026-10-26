import { Injectable, computed, inject, signal } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { AuthPayload } from '../models/register.model';
import { AuthUser } from '../models/user.model';
import { TokenService } from './token.service';

@Injectable({ providedIn: 'root' })
export class SessionService {
  private readonly tokens = inject(TokenService);
  private readonly cookieService = inject(CookieService);
  private readonly _user = signal<AuthUser | null>(this.getInitialUser());
  private readonly _token = signal<string | null>(this.tokens.getToken());

  readonly user = this._user.asReadonly();
  readonly isLoggedIn = computed(() => !this.tokens.isExpired(this._token()));

  start(payload: AuthPayload, remember = false): void {
    this.tokens.setToken(payload.token, remember);
    this._token.set(payload.token);
    this._user.set(payload.user);
    this.saveUserToStorage(payload.user, remember);
  }

  setUser(user: AuthUser, remember = false): void {
    this._user.set(user);
    this.saveUserToStorage(user, remember);
  }

  clear(): void {
    this.tokens.clear();
    this._token.set(null);
    this._user.set(null);
    this.clearUserFromStorage();
  }

  private getInitialUser(): AuthUser | null {
    if (!this.tokens.hasValidToken()) {
      return null;
    }
    try {
      const stored = this.cookieService.get('user');
      if (stored) {
        return JSON.parse(stored) as AuthUser;
      }
      const firstName = this.cookieService.get('firstName');
      const lastName = this.cookieService.get('lastName');
      if (firstName || lastName) {
        return {
          id: '',
          username: firstName || '',
          email: '',
          phone: null,
          firstName: firstName || '',
          lastName: lastName || '',
          gender: 'MALE',
          emailVerified: false,
          phoneVerified: false,
          role: 'USER',
        };
      }
    } catch {
      return null;
    }
    return null;
  }

  private saveUserToStorage(user: AuthUser, remember = false): void {
    try {
      const isHttps = typeof location !== 'undefined' && location?.protocol === 'https:';
      const options = {
        path: '/',
        sameSite: 'Strict' as const,
        secure: isHttps,
        expires: remember ? 30 : undefined,
      };
      this.cookieService.set('user', JSON.stringify(user), options);
      if (user.firstName) {
        this.cookieService.set('firstName', user.firstName, options);
      }
      if (user.lastName) {
        this.cookieService.set('lastName', user.lastName, options);
      }
    } catch {
      // Ignore
    }
  }

  private clearUserFromStorage(): void {
    try {
      this.cookieService.delete('user', '/', undefined, undefined, 'Strict');
      this.cookieService.delete('firstName', '/', undefined, undefined, 'Strict');
      this.cookieService.delete('lastName', '/', undefined, undefined, 'Strict');
    } catch {
      // Ignore
    }
  }
}
