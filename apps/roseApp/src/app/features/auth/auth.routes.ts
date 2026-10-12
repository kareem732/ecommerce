import { Routes } from '@angular/router';

export const AUTH_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./auth').then((m) => m.Auth),
    children: [
      {
        path: 'login',
        loadComponent: () => 
          import('./pages/login/login').then(
            (m) => m.Login),
      },
      {
        path: 'register',
        loadComponent: () => 
          import('./pages/register/register').then(
            (m) => m.Register),
      },
      {
        path: 'otp',
        loadComponent: () => 
          import('./pages/otp/otp').then(
            (m) => m.Otp),
      }
    ],
  },
];