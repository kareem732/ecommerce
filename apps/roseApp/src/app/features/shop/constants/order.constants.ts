import {
  Banknote,
  CircleCheck,
  Clock,
  CreditCard,
  Package,
  LucideIconData,
  Truck,
  TriangleAlert,
  PackageCheck,
} from 'lucide-angular';
import { OrderStatus } from '../interfaces/order.model/order-history.model';
import { PaymentMethod } from '../interfaces/order.model/order.model';

/** Overall order progress shown in the status pill. */
export type OrderProgress = 'IN_PROGRESS' | 'CANCELED' | 'DONE';

export interface StatusStyle {
  icon: LucideIconData;
  /** Tailwind text color class (token based, dark-mode aware). */
  textClass: string;
}

/** Number of items visible before the "Show all" toggle appears. */
export const ORDER_ITEMS_PREVIEW_COUNT = 2;

export const ORDER_PROGRESS: Record<OrderStatus, OrderProgress> = {
  PENDING: 'IN_PROGRESS',
  CONFIRMED: 'IN_PROGRESS',
  PROCESSING: 'IN_PROGRESS',
  SHIPPED: 'IN_PROGRESS',
  DELIVERED: 'DONE',
  CANCELLED: 'CANCELED',
  REFUNDED: 'CANCELED',
};

export const ORDER_PROGRESS_BADGE: Record<OrderProgress, string> = {
  IN_PROGRESS: 'bg-(--color-info)',
  CANCELED: 'bg-(--color-danger)',
  DONE: 'bg-(--color-success)',
};

export const DELIVERY_STATUS_STYLE: Record<OrderProgress, StatusStyle> = {
  IN_PROGRESS: { icon: Truck, textClass: 'text-(--color-warning)' },
  CANCELED: { icon: TriangleAlert, textClass: 'text-(--color-danger)' },
  DONE: { icon: PackageCheck, textClass: 'text-(--color-success)' },
};

export const PAYMENT_METHOD_ICON: Record<PaymentMethod, LucideIconData> = {
  CASH_ON_DELIVERY: Banknote,
  CREDIT_CARD: CreditCard,
};

export interface TimelineStep {
  status: OrderStatus;
  icon: LucideIconData;
}

/** Happy-path order lifecycle shown on the details page. */
export const ORDER_TIMELINE: readonly TimelineStep[] = [
  { status: 'PENDING', icon: Clock },
  { status: 'CONFIRMED', icon: CircleCheck },
  { status: 'PROCESSING', icon: Package },
  { status: 'SHIPPED', icon: Truck },
  { status: 'DELIVERED', icon: PackageCheck },
];
