import { RevenuePeriod } from './overview.req';

export interface OverviewSummary {
  totalProducts: number;
  totalOrders: number;
  totalCategories: number;
  totalRevenue: number;
  currency: string;
}

export interface OverviewCategory {
  id: string;
  title: string;
  productCount: number;
}

export interface OrderStatusItem {
  count: number;
  percent: number;
}

export interface OrderStatus {
  completed: OrderStatusItem;
  inProgress: OrderStatusItem;
  canceled: OrderStatusItem;
  totalOrders: number;
}

export interface RevenuePoint {
  period: string;
  label: string;
  revenue: number;
}

export interface OverviewRevenue {
  period: RevenuePeriod;
  points: RevenuePoint[];
}

export interface TopSellingProduct {
  productId: string;
  title: string;
  unitPrice: number;
  totalSales: number;
}

export interface LowStockProduct {
  id: string;
  title: string;
  stock: number;
}

export interface OverviewPayload {
  summary: OverviewSummary;
  categories: OverviewCategory[];
  orderStatus: OrderStatus;
  revenue: OverviewRevenue;
  topSellingProducts: TopSellingProduct[];
  lowStockProducts: LowStockProduct[];
}

export interface OverviewResponse {
  status: boolean;
  code: number;
  payload: OverviewPayload;
}
