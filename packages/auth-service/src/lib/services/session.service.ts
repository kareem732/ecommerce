import { Injectable, computed, inject, signal } from '@angular/core';
import { AuthPayload } from '../models/register.model';
import { AuthUser } from '../models/user.model';
import { TokenService } from './token.service';

@Injectable({ providedIn: 'root' })
export class SessionService {
  private readonly tokens = inject(TokenService);
  private readonly _user = signal<AuthUser | null>(null);
  private readonly _token = signal<string | null>(this.tokens.getToken());

  readonly user = this._user.asReadonly();
  readonly isLoggedIn = computed(() => !this.tokens.isExpired(this._token()));

  start(payload: AuthPayload): void {
    this.tokens.setToken(payload.token);
    this._token.set(payload.token);
    this._user.set(payload.user);
  }

  setUser(user: AuthUser): void {
    this._user.set(user);
  }

  clear(): void {
    this.tokens.clear();
    this._token.set(null);
    this._user.set(null);
  }
}
