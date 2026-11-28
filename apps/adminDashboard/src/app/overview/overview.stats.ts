import {
  CircleDollarSign,
  ClipboardList,
  LucideIconData,
  Package,
  ReceiptText,
} from 'lucide-angular';
import { StatTone } from './components/stat-card/stat-card';
import { OverviewPayload } from './interfaces/overview.res';

export interface StatItem {
  key: string;
  label: string;
  value: number;
  icon: LucideIconData;
  tone: StatTone;
  suffix: string;
}

export function buildStats(summary: OverviewPayload['summary']): StatItem[] {
  return [
    {
      key: 'products',
      label: 'ADMIN.OVERVIEW.TOTAL_PRODUCTS',
      value: summary.totalProducts,
      icon: Package,
      tone: 'rose',
      suffix: '',
    },
    {
      key: 'orders',
      label: 'ADMIN.OVERVIEW.TOTAL_ORDERS',
      value: summary.totalOrders,
      icon: ReceiptText,
      tone: 'blue',
      suffix: '',
    },
    {
      key: 'categories',
      label: 'ADMIN.OVERVIEW.TOTAL_CATEGORIES',
      value: summary.totalCategories,
      icon: ClipboardList,
      tone: 'neutral',
      suffix: '',
    },
    {
      key: 'revenue',
      label: 'ADMIN.OVERVIEW.TOTAL_REVENUE',
      value: summary.totalRevenue,
      icon: CircleDollarSign,
      tone: 'green',
      suffix: summary.currency,
    },
  ];
}
