import { Route } from '@angular/router';
import { loadRemote } from '@module-federation/enhanced/runtime';
import { adminGuard } from '@org/auth-service';

export const appRoutes: Route[] = [
  {
    path: 'adminDashboard',
    canActivate: [adminGuard],
    loadChildren: () =>
      loadRemote<typeof import('adminDashboard/Routes')>(
        'adminDashboard/Routes',
      ).then((m) => m!.remoteRoutes),
  },
  {
    // roseApp is the main site and uses absolute links (/shop/home, /auth/login),
    // so it is mounted at the root instead of under /roseApp.
    path: '',
    loadChildren: () =>
      loadRemote<typeof import('roseApp/Routes')>('roseApp/Routes').then(
        (m) => m!.remoteRoutes,
      ),
  },
];
