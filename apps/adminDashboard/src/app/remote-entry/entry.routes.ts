import { provideHttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { LanguageService, provideI18n } from '@org/shared-i18n';
import { i18nConfig } from '../i18n.config';
import { Route } from '@angular/router';
import { RemoteEntry } from './entry';

export const localRoutes: Route[] = [{ path: '', component: RemoteEntry }];

export const remoteRoutes: Route[] = [
  {
    path: '',
    providers: [provideHttpClient(), provideI18n(i18nConfig)],
    resolve: { language: () => inject(LanguageService).initialize() },
    children: localRoutes,
  },
];
