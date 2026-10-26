import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { SubscriptionRequest, SubscriptionResponse } from './footer.model';

@Injectable({
  providedIn: 'root',
})
export class FooterService {
  private readonly http = inject(HttpClient);
  readonly endpoint = `${environment.apiUrl}/api/subscriptions`;

  subscriptionEmail(
    data: SubscriptionRequest = { email: 'customer@example.com' },
  ): Observable<SubscriptionResponse> {
    return this.http.post<SubscriptionResponse>(this.endpoint, data);
  }
}
