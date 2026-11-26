import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { inject } from '@angular/core';
import { LanguageService, provideI18n } from '@org/shared-i18n';
import { i18nConfig } from '../i18n.config';
import { Route } from '@angular/router';
import { authInterceptor, errorInterceptor, provideAuth } from '@org/auth-service';
import { environment } from '../../environments/environment';
import { loadingInterceptor } from '../core/interceptors/loading.interceptor';
import { Dialog } from '@angular/cdk/dialog';
import { ConfirmationDialogService } from '../shared/business/confirmation-dialog.service';
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
  {
    path: 'unauthorized',
    loadComponent: () =>
      import('../features/errors/unauthorized/unauthorized').then((m) => m.Unauthorized),
  },
  { path: '', pathMatch: 'full', redirectTo: 'shop' },
  // Unknown URLs used to leave an empty page (NG04002); send them to the storefront instead.
  { path: '**', redirectTo: 'shop' },
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
      // CDK Dialog is providedIn 'root' and builds dialogs from the injector it lives in.
      // Inside the shell that is the shell's root, which has no LanguageService/i18n, so
      // dialogs crash (NG0201). Scoping it here makes dialogs use this route's injector.
      Dialog,
      ConfirmationDialogService,
    ],
    resolve: { language: () => inject(LanguageService).initialize() },
    children: localRoutes,
  },
];
