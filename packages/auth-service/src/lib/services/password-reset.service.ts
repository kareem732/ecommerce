import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ResetPasswordRequest } from '../models/password.model';
import { AuthApiService } from './auth-api.service';

@Injectable()
export class PasswordResetService {
  private readonly api = inject(AuthApiService);

  forgotPassword(email: string, redirectUrl: string): Observable<string> {
    return this.api.forgotPassword({ email, redirectUrl });
  }

  resetPassword(request: ResetPasswordRequest): Observable<string> {
    return this.api.resetPassword(request);
  }
}
