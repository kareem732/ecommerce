import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import ShopEndPoint from '../enums/EndPoints';
import {
  CheckoutSessionRequest,
  CheckoutSessionResponse,
} from '../interfaces/payment.model/payment.model';

@Injectable({
  providedIn: 'root',
})
export class PaymentService {
  private readonly _httpClient = inject(HttpClient);

  createCheckoutSession(body: CheckoutSessionRequest): Observable<CheckoutSessionResponse> {
    return this._httpClient.post<CheckoutSessionResponse>(
      ShopEndPoint.PAYMENTS_CHECKOUT_SESSION,
      body,
    );
  }
}
