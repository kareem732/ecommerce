import { Injectable, computed, inject, signal } from '@angular/core';
import { AuthPayload } from '../models/register.model';
import { AuthUser } from '../models/user.model';
import { TokenService } from './token.service';

@Injectable({ providedIn: 'root' })
export class SessionService {
  private readonly tokens = inject(TokenService);
  private readonly _user = signal<AuthUser | null>(this.getInitialUser());
  private readonly _token = signal<string | null>(this.tokens.getToken());

  readonly user = this._user.asReadonly();
  readonly isLoggedIn = computed(() => !this.tokens.isExpired(this._token()));

  start(payload: AuthPayload, remember = false): void {
    this.tokens.setToken(payload.token, remember);
    this._token.set(payload.token);
    this._user.set(payload.user);
    this.saveUserToStorage(payload.user);
  }

  setUser(user: AuthUser): void {
    this._user.set(user);
    this.saveUserToStorage(user);
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
      if (typeof localStorage !== 'undefined') {
        const stored = localStorage.getItem('user');
        if (stored) {
          return JSON.parse(stored) as AuthUser;
        }
        const firstName = localStorage.getItem('firstName');
        const lastName = localStorage.getItem('lastName');
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
      }
    } catch {
      return null;
    }
    return null;
  }

  private saveUserToStorage(user: AuthUser): void {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(user));
        if (user.firstName) {
          localStorage.setItem('firstName', user.firstName);
        }
        if (user.lastName) {
          localStorage.setItem('lastName', user.lastName);
        }
      }
    } catch {
      // Ignore
    }
  }

  private clearUserFromStorage(): void {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('user');
        localStorage.removeItem('firstName');
        localStorage.removeItem('lastName');
      }
    } catch {
      // Ignore
    }
  }
}
