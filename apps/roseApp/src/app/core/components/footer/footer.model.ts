export interface FooterLink {
  id: string;
  labelKey: string;
  route: string;
  fragment?: string;
}

export interface SubscriptionRequest {
  email: string;
}

export interface SubscriptionResponse {
  message?: string;
  [key: string]: unknown;
}
