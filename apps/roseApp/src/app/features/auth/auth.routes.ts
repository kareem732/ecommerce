import { Routes } from '@angular/router';

export const AUTH_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./auth').then((m) => m.Auth),
    children: [
      {
        path: 'forget-password',
        loadComponent: () =>
          import('./pages/forget-password-form/forget-password-form').then(
            (m) => m.ForgetPasswordForm,
          ),
      },
    ],
  },
];
