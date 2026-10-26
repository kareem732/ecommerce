import { Injectable, inject } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';
import { LoginRequest } from '../models/login.model';
import { AuthPayload } from '../models/register.model';
import { AuthUser } from '../models/user.model';
import { AuthApiService } from './auth-api.service';
import { SessionService } from './session.service';

@Injectable({ providedIn: 'root' })
export class LoginService {
  private readonly api = inject(AuthApiService);
  private readonly session = inject(SessionService);
  private readonly cookieService = inject(CookieService);

  login(request: LoginRequest, remember = false): Observable<AuthPayload> {
    return this.api.login(request).pipe(
      tap((payload) => {
        this.saveUserData(payload.user, remember);
        this.session.start(payload, remember);
      }),
    );
  }

  logout(): void {
    this.clearUserData();
    this.session.clear();
  }

  private saveUserData(user: AuthUser, remember = false): void {
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
      // Safely ignore storage errors (e.g. quota, private browsing, SSR)
    }
  }

  private clearUserData(): void {
    try {
      this.cookieService.delete('user', '/', undefined, undefined, 'Strict');
      this.cookieService.delete('firstName', '/', undefined, undefined, 'Strict');
      this.cookieService.delete('lastName', '/', undefined, undefined, 'Strict');
    } catch {
      // Safely ignore storage errors
    }
  }
}
