import { Injectable, inject } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { LoginRequest } from '../models/login.model';
import { AuthPayload } from '../models/register.model';
import { AuthUser } from '../models/user.model';
import { AuthApiService } from './auth-api.service';
import { SessionService } from './session.service';

@Injectable({ providedIn: 'root' })
export class LoginService {
  private readonly api = inject(AuthApiService);
  private readonly session = inject(SessionService);

  login(request: LoginRequest, remember = false): Observable<AuthPayload> {
    return this.api.login(request).pipe(
      tap((payload) => {
        this.saveUserData(payload.user);
        this.session.start(payload, remember);
      }),
    );
  }

  logout(): void {
    this.clearUserData();
    this.session.clear();
  }

  private saveUserData(user: AuthUser): void {
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
      // Safely ignore storage errors (e.g. quota, private browsing, SSR)
    }
  }

  private clearUserData(): void {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('user');
        localStorage.removeItem('firstName');
        localStorage.removeItem('lastName');
      }
    } catch {
      // Safely ignore storage errors
    }
  }
}
