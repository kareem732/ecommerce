import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { ApiResponse, skipSuccessNotification } from '@org/auth-service';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import AccountEndPoint from '../enums/account-endpoints';
import {
  ChangePasswordRequest,
  ProfilePayload,
  UpdateProfileRequest,
  UploadPayload,
  UserProfile,
} from '../interfaces/account.models';

@Injectable({ providedIn: 'root' })
export class AccountService {
  private readonly http = inject(HttpClient);

  getProfile(): Observable<UserProfile> {
    return this.http
      .get<ApiResponse<ProfilePayload>>(AccountEndPoint.PROFILE)
      .pipe(map(this.toUser));
  }

  updateProfile(body: UpdateProfileRequest): Observable<UserProfile> {
    return this.http
      .patch<ApiResponse<ProfilePayload>>(AccountEndPoint.PROFILE, body)
      .pipe(map(this.toUser));
  }

  uploadPhoto(file: File): Observable<string> {
    const body = new FormData();
    body.append('image', file);
    return this.http
      .post<ApiResponse<UploadPayload>>(AccountEndPoint.UPLOAD, body)
      .pipe(map((res) => this.requirePayload(res).url));
  }

  changePassword(body: ChangePasswordRequest): Observable<ApiResponse<unknown>> {
    return this.http.post<ApiResponse<unknown>>(AccountEndPoint.CHANGE_PASSWORD, body);
  }

  requestEmailChange(newEmail: string): Observable<ApiResponse<unknown>> {
    return this.http.post<ApiResponse<unknown>>(AccountEndPoint.EMAIL_REQUEST, { newEmail });
  }

  confirmEmailChange(code: string): Observable<ApiResponse<unknown>> {
    return this.http.post<ApiResponse<unknown>>(
      AccountEndPoint.EMAIL_CONFIRM,
      { code },
      { context: skipSuccessNotification() },
    );
  }

  deleteAccount(): Observable<ApiResponse<unknown>> {
    return this.http.delete<ApiResponse<unknown>>(AccountEndPoint.DELETE_ACCOUNT);
  }

  private toUser = (res: ApiResponse<ProfilePayload>): UserProfile => {
    const { user } = this.requirePayload(res);
    return { ...user, photo: this.toAbsoluteUrl(user.photo) };
  };

  private requirePayload<T>(res: ApiResponse<T>): T {
    if (!res.payload) throw new Error('Malformed server response.');
    return res.payload;
  }

  private toAbsoluteUrl(path: string | null): string | null {
    return path?.startsWith('/') ? `${environment.apiUrl}${path}` : path;
  }
}
