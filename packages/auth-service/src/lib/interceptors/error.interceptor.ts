import {  HttpEventType, HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, tap, throwError } from 'rxjs';
import { isAuthEndpoint } from '../config/auth-endpoints';
import { AUTH_CONFIG } from '../config/auth.config';
import { NotificationService } from '../services/notification.service';
import { SessionService } from '../services/session.service';
import { mapToAuthError } from '../utils/auth-error.mapper';

const MUTATING_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE'];

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const session = inject(SessionService);
  const router = inject(Router);
  const notifications = inject(NotificationService);
  const { loginRoute } = inject(AUTH_CONFIG);

  return next(req).pipe(
    tap((event) => {
      if (event.type !== HttpEventType.Response) return;
      if (!MUTATING_METHODS.includes(req.method)) return;

      const message = (event as HttpResponse<{ message?: string }>).body?.message;
      if (message) notifications.success(message);
    }),

    catchError((error: unknown) => {
      let authError = mapToAuthError(error);

      if (authError.status === 401) {
        if (isAuthEndpoint(req.url)) {
          authError = { ...authError, code: 'INVALID_CREDENTIALS' };
        } else {
          session.clear();
          redirectToLogin(router, loginRoute);
        }
      }

      notifications.error(authError.message);

      return throwError(() => authError);
    }),
  );
};

function redirectToLogin(router: Router, loginRoute: string): void {
  const currentPath = router.url.split('?')[0];
  if (currentPath === loginRoute) return;

  void router.navigate([loginRoute], { queryParams: { returnUrl: router.url } });
}
