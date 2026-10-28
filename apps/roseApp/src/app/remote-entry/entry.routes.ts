import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { inject } from '@angular/core';
import { LanguageService, provideI18n } from '@org/shared-i18n';
import { i18nConfig } from '../i18n.config';
import { Route } from '@angular/router';
import { authInterceptor, errorInterceptor, provideAuth } from '@org/auth-service';
import { environment } from '../../environments/environment';
import { loadingInterceptor } from '../core/interceptors/loading.interceptor';
import { RemoteEntry } from './entry';

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
  { path: '', pathMatch: 'full', redirectTo: 'auth' },
];

export const remoteRoutes: Route[] = [
  {
    path: '',
    component: RemoteEntry,
    providers: [
      provideHttpClient(
        withInterceptors([
          loadingInterceptor,
          authInterceptor,
          errorInterceptor,
        ]),
      ),
      provideI18n(i18nConfig),
      provideAuth({
        apiUrl: environment.apiUrl,
        homeRoute: '/shop',
        includeHttpClient: false,
      }),
    ],
    resolve: { language: () => inject(LanguageService).initialize() },
    children: localRoutes,
  },
];
