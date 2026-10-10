import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthApiService } from './auth-api.service';

@Injectable({ providedIn: 'root' })
export class OtpService {
  private readonly api = inject(AuthApiService);

  sendCode(email: string): Observable<string> {
    return this.api.sendEmailVerification({ email });
  }

  confirmCode(email: string, code: string): Observable<string> {
    return this.api.confirmEmailVerification({ email, code });
  }
}
