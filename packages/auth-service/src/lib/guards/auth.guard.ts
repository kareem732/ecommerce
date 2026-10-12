import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AUTH_CONFIG } from '../config/auth.config';
import { SessionService } from '../services/session.service';

export const authGuard: CanActivateFn = (_route, state) => {
  const router = inject(Router);
  const { loginRoute } = inject(AUTH_CONFIG);

  return inject(SessionService).isLoggedIn()
    ? true
    : router.createUrlTree([loginRoute], { queryParams: { returnUrl: state.url } });
};
