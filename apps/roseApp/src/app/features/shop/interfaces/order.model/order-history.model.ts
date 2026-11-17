import { ApiResponse, PaginatedPayload } from '../home.model/home-model-response';
import { PaymentMethod } from './order.model';

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REFUNDED';

export type PaymentStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'SUCCEEDED'
  | 'FAILED'
  | 'REFUNDED'
  | 'CANCELLED';

export type OrderHistoryResponse = ApiResponse<PaginatedPayload<OrderSummary>>;
export type OrderDetailsResponse = ApiResponse<{ order: OrderSummary }>;

export interface OrderSummary {
  id: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  subtotal: string;
  discount: string;
  shipping: string;
  total: string;
  trackingNumber: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  address: {
    id: string;
    title: string;
    city: string;
    street: string;
    phone: string;
  };
  orderItems: OrderItem[];
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  price: string;
  product: {
    id: string;
    title: string;
    cover: string;
  };
}
