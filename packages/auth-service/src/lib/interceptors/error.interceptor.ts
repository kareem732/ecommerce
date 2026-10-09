import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { isAuthEndpoint } from '../config/auth-endpoints';
import { AUTH_CONFIG } from '../config/auth.config';
import { SessionService } from '../services/session.service';
import { mapToAuthError } from '../utils/auth-error.mapper';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const session = inject(SessionService);
  const router = inject(Router);
  const { loginRoute } = inject(AUTH_CONFIG);

  return next(req).pipe(
    catchError((error: unknown) => {
      let authError = mapToAuthError(error);
      const onAuthEndpoint = isAuthEndpoint(req.url);

      if (authError.status === 401) {
        if (onAuthEndpoint) {
          authError = { ...authError, code: 'INVALID_CREDENTIALS' };
        } else {
          session.clear();
          void router.navigateByUrl(loginRoute);
        }
      }

      return throwError(() => authError);
    }),
  );
};
