import { environment } from './../../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { inject } from '@angular/core/primitives/di';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
private readonly httpClient = inject(HttpClient)

emailVerification(data:any):Observable<any>{
 return this.httpClient.post(`${environment.apiUrl}/api/auth/send-email-verification`, data)
}

otpCode(data:any):Observable<any>{
 return this.httpClient.post(`${environment.apiUrl}/api/auth/confirm-email-verification`, data)
}
}
