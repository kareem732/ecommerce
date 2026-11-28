export type RevenuePeriod = 'monthly' | 'week';

export interface OverviewQuery {
  revenuePeriod?: RevenuePeriod;
  lowStockThreshold?: number;
  topProductsLimit?: number;
  lowStockLimit?: number;
}
