import { Injectable, inject } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { AuthPayload, RegisterRequest } from '../models/register.model';
import { AuthApiService } from './auth-api.service';
import { SessionService } from './session.service';

@Injectable()
export class RegisterService {
  private readonly api = inject(AuthApiService);
  private readonly session = inject(SessionService);

  register(request: RegisterRequest): Observable<AuthPayload> {
    return this.api.register(request).pipe(tap((payload) => this.session.start(payload)));
  }
}
