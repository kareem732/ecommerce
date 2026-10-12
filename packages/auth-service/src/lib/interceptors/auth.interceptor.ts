import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { isAuthEndpoint } from '../config/auth-endpoints';
import { AUTH_CONFIG } from '../config/auth.config';
import { TokenService } from '../services/token.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const { apiUrl } = inject(AUTH_CONFIG);
  const token = inject(TokenService).getToken();

  if (!token || !req.url.startsWith(apiUrl) || isAuthEndpoint(req.url)) {
    return next(req);
  }

  return next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
};
