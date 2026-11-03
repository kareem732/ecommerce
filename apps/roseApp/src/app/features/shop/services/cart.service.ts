import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import ShopEndPoint from '../enums/EndPoints';
import {
  AddToCartRequest,
  AddToCartResponse,
  CartResponse,
} from '../interfaces/cart.model/cart.model';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private readonly _httpClient = inject(HttpClient);

  getCart(): Observable<CartResponse> {
    return this._httpClient.get<CartResponse>(ShopEndPoint.CART);
  }

  addToCart(body: AddToCartRequest): Observable<AddToCartResponse> {
    return this._httpClient.post<AddToCartResponse>(ShopEndPoint.CART, body);
  }
}
