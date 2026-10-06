import { NxWelcome } from './nx-welcome';
import { Route } from '@angular/router';
import { loadRemote } from '@module-federation/enhanced/runtime';

export const appRoutes: Route[] = [
  {
    path: 'roseApp',
    loadChildren: () =>
      loadRemote<typeof import('roseApp/Routes')>('roseApp/Routes').then(
        (m) => m!.remoteRoutes,
      ),
  },
  {
    path: 'adminDashboard',
    loadChildren: () =>
      loadRemote<typeof import('adminDashboard/Routes')>(
        'adminDashboard/Routes',
      ).then((m) => m!.remoteRoutes),
  },
  {
    path: '',
    component: NxWelcome,
  },
];
