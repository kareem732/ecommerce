import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import ShopEndPoint from '../enums/EndPoints';
import { CreateOrderRequest, CreateOrderResponse } from '../interfaces/order.model/order.model';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private readonly _httpClient = inject(HttpClient);

  createOrder(body: CreateOrderRequest): Observable<CreateOrderResponse> {
    return this._httpClient.post<CreateOrderResponse>(ShopEndPoint.ORDERS, body);
  }
}
