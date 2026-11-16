import { ApiResponse } from '../home.model/home-model-response';

export type PaymentMethod = 'CASH_ON_DELIVERY' | 'CREDIT_CARD';

export interface CreateOrderRequest {
  addressId: string;
  paymentMethod: PaymentMethod;
  couponCode?: string;
  notes?: string;
  successUrl?: string;
  cancelUrl?: string;
}

export interface CheckoutSession {
  checkoutUrl: string;
  sessionId: string;
  expiresAt: string;
  reused: boolean;
}

export interface Order {
  id: string;
}

export interface CreateOrderPayload {
  order: Order;
  checkout: CheckoutSession | null;
}

export type CreateOrderResponse = ApiResponse<CreateOrderPayload>;
