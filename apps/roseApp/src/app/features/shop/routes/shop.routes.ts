import { Routes } from '@angular/router';

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
        path: 'products/:id',
        loadComponent: () =>
          import('../pages/product-details/product-details').then((m) => m.ProductDetails),
      },
    ],
  },
];
