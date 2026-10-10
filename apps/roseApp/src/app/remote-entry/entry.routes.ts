import { provideHttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { LanguageService, provideI18n } from '@org/shared-i18n';
import { i18nConfig } from '../i18n.config';
import { Route } from '@angular/router';
import { provideAuth } from '@org/auth-service';
import { RemoteEntry } from './entry';
import { environment } from '../../environments/environment';

export const localRoutes: Route[] = [
  {
    path: '',
    component: RemoteEntry,
    providers: [provideAuth({ apiUrl: environment.apiUrl })],
    children: [
      {
        path: 'auth',
        loadChildren: () =>
          import('../features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
      },
    ],
  },
];

export const remoteRoutes: Route[] = [
  {
    path: '',
    providers: [provideHttpClient(), provideI18n(i18nConfig)],
    resolve: { language: () => inject(LanguageService).initialize() },
    children: localRoutes,
  },
];
