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
      {
        path: 'reset-link-received',
        loadComponent: () =>
          import('./pages/reset-link-received/reset-link-received').then(
            (m) => m.ResetLinkReceived,
          ),
      },
      {
        path: 'reset-password',
        loadComponent: () =>
          import('./pages/reset-password-form/reset-password-form').then(
            (m) => m.ResetPasswordForm,
          ),
      },
    ],
  },
];
