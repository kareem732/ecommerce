import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { AUTH_ENDPOINTS } from '../config/auth-endpoints';
import { AUTH_CONFIG } from '../config/auth.config';
import { ApiResponse } from '../models/api-response.model';
import { AuthError } from '../models/auth-error.model';
import { LoginRequest } from '../models/login.model';
import { ConfirmEmailVerificationRequest, SendEmailVerificationRequest } from '../models/otp.model';
import { ForgotPasswordRequest, ResetPasswordRequest } from '../models/password.model';
import { AuthPayload, RegisterRequest } from '../models/register.model';

@Injectable({ providedIn: 'root' })

export class AuthApiService {

  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(AUTH_CONFIG).apiUrl;

  sendEmailVerification(body: SendEmailVerificationRequest): Observable<string> {
    return this.post<string>(AUTH_ENDPOINTS.sendEmailVerification, body).pipe(map(this.toMessage));
  }

  confirmEmailVerification(body: ConfirmEmailVerificationRequest): Observable<string> {
    return this.post<string>(AUTH_ENDPOINTS.confirmEmailVerification, body).pipe(map(this.toMessage));
  }

  register(body: RegisterRequest): Observable<AuthPayload> {
    return this.post<AuthPayload>(AUTH_ENDPOINTS.register, body).pipe(map(this.toPayload));
  }

  login(body: LoginRequest): Observable<AuthPayload> {
    return this.post<AuthPayload>(AUTH_ENDPOINTS.login, body).pipe(map(this.toPayload));
  }

  forgotPassword(body: ForgotPasswordRequest): Observable<string> {
    return this.post<string>(AUTH_ENDPOINTS.forgotPassword, body).pipe(map(this.toMessage));
  }

  resetPassword(body: ResetPasswordRequest): Observable<string> {
    return this.post<string>(AUTH_ENDPOINTS.resetPassword, body).pipe(map(this.toMessage));
  }

  private post<T>(path: string, body: unknown): Observable<ApiResponse<T>> {
    return this.http.post<ApiResponse<T>>(`${this.baseUrl}${path}`, body);
  }

  private toMessage = (res: ApiResponse<unknown>): string => res.message ?? '';

  private toPayload = <T>(res: ApiResponse<T>): T => {
    if (res.payload === undefined || res.payload === null) {
      const malformed: AuthError = { code: 'UNKNOWN', status: res.code, message: 'Malformed server response.' };
      throw malformed;
    }
    return res.payload;
  };
  
}
