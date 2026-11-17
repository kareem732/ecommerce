import { Routes } from '@angular/router';
import { authGuard } from '@org/auth-service';
import { AccountRoute } from './enums/account-route.enum';

export const ACCOUNT_ROUTES: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./account').then((m) => m.Account),
    children: [
      { path: '', pathMatch: 'full', redirectTo: AccountRoute.Profile },
      {
        path: AccountRoute.Profile,
        loadComponent: () => import('./pages/profile/profile').then((m) => m.Profile),
      },
      {
        path: AccountRoute.ChangePassword,
        loadComponent: () =>
          import('./pages/change-password/change-password').then((m) => m.ChangePassword),
      },
    ],
  },
];
