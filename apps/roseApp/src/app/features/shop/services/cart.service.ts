import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import ShopEndPoint from '../enums/EndPoints';
import {
  AddToCartRequest,
  AddToCartResponse,
  CartResponse,
  removeItem,
  UpdateCartRequest,
  updateCartResponse,
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

  UpdateItemQuantity(itemId:string , itemQuantity:UpdateCartRequest):Observable<updateCartResponse>{
    return this._httpClient.patch<updateCartResponse>(`${ShopEndPoint.CART}/${itemId}`, itemQuantity)
  }

  removeItemFromCart(itemId:string): Observable<removeItem>{
    return this._httpClient.delete<removeItem>(`${ShopEndPoint.CART}/${itemId}`)
  }

  clearCart(): Observable<removeItem>{
    return this._httpClient.delete<removeItem>(ShopEndPoint.CART)
  }

}
