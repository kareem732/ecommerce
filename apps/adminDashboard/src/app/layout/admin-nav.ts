import {
  CalendarHeart,
  ClipboardList,
  LayoutGrid,
  LucideIconData,
  Package,
} from 'lucide-angular';

export enum AdminRoute {
  Overview = 'overview',
  Categories = 'categories',
  Occasions = 'occasions',
  Products = 'products',
}

export interface AdminNavItem {
  path: AdminRoute;
  labelKey: string;
  icon: LucideIconData;
}

export const ADMIN_NAV_ITEMS: readonly AdminNavItem[] = [
  { path: AdminRoute.Overview, labelKey: 'ADMIN.NAV.OVERVIEW', icon: LayoutGrid },
  { path: AdminRoute.Categories, labelKey: 'ADMIN.NAV.CATEGORIES', icon: ClipboardList },
  { path: AdminRoute.Occasions, labelKey: 'ADMIN.NAV.OCCASIONS', icon: CalendarHeart },
  { path: AdminRoute.Products, labelKey: 'ADMIN.NAV.PRODUCTS', icon: Package },
];

/** Storefront routes (served by roseApp inside the shell). */
export const STOREFRONT_HOME = '/shop/home';
export const STOREFRONT_PROFILE = '/shop/account/profile';
export const LOGIN_ROUTE = '/auth/login';

export const ROSE_LOGO = '/bb70dbdbb3472a27ffcc4d3baeb8eaceb3873b18.png';
