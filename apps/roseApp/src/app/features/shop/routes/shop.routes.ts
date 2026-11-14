import { Routes } from '@angular/router';
import { CHECKOUT_FLOW_ROUTE } from './checkout.routes';
export const SHOP_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('../shop').then((m) => m.Shop),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'home' },
      {
        path: 'home',
        loadComponent: () => import('../pages/home/home').then((m) => m.Home),
      },
      {
        path: 'products',
        loadComponent: () => import('../pages/products/products').then((m) => m.Products),
      },
      {
        path: 'products/:id',
        loadComponent: () =>
          import('../pages/product-details/product-details').then((m) => m.ProductDetails),
      },
      {
        path: 'wishlist',
        loadComponent: () => import('../pages/wishlist/wishlist').then((m) => m.Wishlist),
      },
      CHECKOUT_FLOW_ROUTE,
      {
        path: 'payment-success',
        loadComponent: () =>
          import('../pages/payment-success/payment-success').then((m) => m.PaymentSuccess),
      },
      {
        path: 'payment-cancel',
        loadComponent: () =>
          import('../pages/payment-cancel/payment-cancel').then((m) => m.PaymentCancel),
      },
    ],
  },
];
