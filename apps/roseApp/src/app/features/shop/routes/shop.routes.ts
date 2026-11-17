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
        path: 'gift-finder',
        loadComponent: () => import('../../gift-finder/gift-finder').then((m) => m.GiftFinder),
      },
      {
        path: 'categories',
        loadComponent: () => import('../pages/categories/categories').then((m) => m.Categories),
      },
      {
        path: 'occasions',
        loadComponent: () => import('../pages/occasions/occasions').then((m) => m.Occasions),
      },
      {
        path: 'contact',
        loadComponent: () => import('../pages/contact/contact').then((m) => m.Contact),
      },
      {
        path: 'wishlist',
        loadComponent: () => import('../pages/wishlist/wishlist').then((m) => m.Wishlist),
      },
      {
        path: 'order',
        loadComponent: () =>
          import('../pages/order/order').then((m) => m.Order),
      },
      {
        path: 'order/:id',
        loadComponent: () =>
          import('../pages/order-details/order-details').then((m) => m.OrderDetails),
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
