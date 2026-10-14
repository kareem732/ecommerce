import { Routes } from '@angular/router';
// import { guestGuard } from '@org/auth-service';

export const AUTH_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./auth').then((m) => m.Auth),
    // canActivate: [guestGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'login' },
      {
        path: 'login',
        loadComponent: () => import('./pages/login/login').then((m) => m.Login),
      },
      {
        path: 'register',
        loadComponent: () => import('./pages/register/register').then((m) => m.Register),
      },
      {
        path: 'forgot-password',
        loadComponent: () =>
          import('./pages/forgot-password/forgot-password').then((m) => m.ForgotPassword),
      },
      {
        path: 'reset-password',
        loadComponent: () =>
          import('./pages/reset-password/reset-password').then((m) => m.ResetPassword),
      },
    ],
  },
];