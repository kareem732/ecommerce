import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { catchError, throwError } from 'rxjs';
import { isAuthEndpoint } from '../config/auth-endpoints';
import { AUTH_CONFIG } from '../config/auth.config';
import { SessionService } from '../services/session.service';
import { mapToAuthError } from '../utils/auth-error.mapper';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const session = inject(SessionService);
  const router = inject(Router);
  const { loginRoute } = inject(AUTH_CONFIG);
  const messageService = inject(MessageService, { optional: true });
  const translate = inject(TranslateService, { optional: true });

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

      if (messageService) {
        const key = `AUTH.ERRORS.${authError.code}`;
        const translated = translate?.instant(key);
        messageService.add({
          severity: 'error',
          summary: translate?.instant('AUTH.ERRORS.TITLE') ?? 'Error',
          detail: translated && translated !== key ? translated : authError.message,
          life: 4000,
        });
      }

      return throwError(() => authError);
    }),
  );
};
