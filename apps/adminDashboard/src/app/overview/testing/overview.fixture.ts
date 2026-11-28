import { OverviewPayload, OverviewResponse } from '../interfaces/overview.res';

export const OVERVIEW_PAYLOAD: OverviewPayload = {
  summary: {
    totalProducts: 98,
    totalOrders: 620,
    totalCategories: 27,
    totalRevenue: 4500,
    currency: 'EGP',
  },
  categories: [{ id: 'c1', title: 'Roses', productCount: 11 }],
  orderStatus: {
    completed: { count: 100, percent: 16.1 },
    inProgress: { count: 420, percent: 67.7 },
    canceled: { count: 100, percent: 16.1 },
    totalOrders: 620,
  },
  revenue: {
    period: 'monthly',
    points: [
      { period: '2026-10', label: 'Oct', revenue: 1500 },
      { period: '2026-11', label: 'Nov', revenue: 4500 },
    ],
  },
  topSellingProducts: [
    { productId: 'p1', title: 'Romantic Red Roses', unitPrice: 24.3, totalSales: 96 },
    { productId: 'p2', title: 'White Lilies', unitPrice: 18, totalSales: 40 },
  ],
  lowStockProducts: [{ id: 'l1', title: 'mega bouquet', stock: 2 }],
};

export const OVERVIEW_RESPONSE: OverviewResponse = {
  status: true,
  code: 200,
  payload: OVERVIEW_PAYLOAD,
};
