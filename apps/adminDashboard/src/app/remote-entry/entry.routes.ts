import { provideHttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { LanguageService, provideI18n } from '@org/shared-i18n';
import { i18nConfig } from '../i18n.config';
import { Route } from '@angular/router';
import { AdminLayout } from '../layout/admin-layout';
import { AdminRoute } from '../layout/admin-nav';

export const localRoutes: Route[] = [
  {
    path: '',
    component: AdminLayout,
    children: [
      { path: '', pathMatch: 'full', redirectTo: AdminRoute.Overview },
      // Pages are not built yet; these empty routes only make the sidebar links navigable.
      {
        path: AdminRoute.Overview,
        loadComponent: () => import('../overview/overview').then((m) => m.Overview),
      },
      {
        path: "404",
        loadComponent: () => import('../error-pages/page404/page404').then((m) => m.Page404),
      },
      {
        path: "500",
        loadComponent: () => import('../error-pages/page500/page500').then((m) => m.Page500),
      },
      { path: AdminRoute.Categories, children: [] },
      { path: AdminRoute.Occasions, children: [] },
      { path: AdminRoute.Products, children: [] },
    ],
  },
  {
    path: '401',
    loadComponent: () => import('../error-pages/page401/page401').then((m) => m.Page401),
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
