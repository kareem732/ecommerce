import { Injectable, inject } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { LoginRequest } from '../models/login.model';
import { AuthPayload } from '../models/register.model';
import { AuthApiService } from './auth-api.service';
import { SessionService } from './session.service';

@Injectable()
export class LoginService {
  private readonly api = inject(AuthApiService);
  private readonly session = inject(SessionService);

  login(request: LoginRequest): Observable<AuthPayload> {
    return this.api.login(request).pipe(tap((payload) => this.session.start(payload)));
  }

  logout(): void {
    this.session.clear();
  }
}
