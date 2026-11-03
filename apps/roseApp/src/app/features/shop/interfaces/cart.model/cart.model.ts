import { ApiResponse } from '../home.model/home-model-response';

export interface AddToCartRequest {
  productId: string;
  quantity: number;
}

export interface CartItem {
  id?: string;
  productId?: string;
  quantity?: number;
}

export interface CartSummary {
  items?: CartItem[];
  data?: CartItem[];
  count?: number;
  totalItems?: number;
  totalQuantity?: number;
}

export type CartPayload = CartSummary | CartItem[];

export type CartResponse = ApiResponse<CartPayload>;

export type AddToCartResponse = ApiResponse<unknown>;
