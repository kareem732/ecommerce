import { Route } from '@angular/router';
import { provideAuth } from '@org/auth-service';
import { RemoteEntry } from './entry';
import { environment } from '../../environments/environment';

export const remoteRoutes: Route[] = [
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
