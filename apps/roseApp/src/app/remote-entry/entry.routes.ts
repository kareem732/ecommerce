import { provideHttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { LanguageService, provideI18n } from '@org/shared-i18n';
import { i18nConfig } from '../i18n.config';
import { Route } from '@angular/router';
import { provideAuth } from '@org/auth-service';
import { environment } from '../../environments/environment';
export const localRoutes: Route[] = [
  {
    path: 'auth',
    loadChildren: () =>
      import('../features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },
  {
    path: 'shop',
    loadChildren: () =>
      import('../features/shop/routes/shop.routes').then((m) => m.SHOP_ROUTES),
  },
  {
    path: 'products',
    loadChildren: () =>
      import('../features/products/routes/products.routes').then(
        (m) => m.productsRoutes,
      ),
  },
  { path: '', pathMatch: 'full', redirectTo: 'auth' },
];
export const remoteRoutes: Route[] = [
  {
    path: '',
    providers: [
      provideHttpClient(),
      provideI18n(i18nConfig),
      provideAuth({ apiUrl: environment.apiUrl, homeRoute: '/shop' }),
    ],
    resolve: { language: () => inject(LanguageService).initialize() },
    children: localRoutes,
  },
];
