import { ApiResponse } from '../home.model/home-model-response';

export interface CheckoutSessionRequest {
  orderId: string;
  successUrl?: string;
  cancelUrl?: string;
}

export interface CheckoutSessionPayload {
  checkoutUrl: string;
  sessionId: string;
  expiresAt: string;
  reused: boolean;
}

export type CheckoutSessionResponse = ApiResponse<CheckoutSessionPayload>;
