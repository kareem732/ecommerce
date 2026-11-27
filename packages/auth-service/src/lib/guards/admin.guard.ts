import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AUTH_CONFIG } from '../config/auth.config';
import { SessionService } from '../services/session.service';

/**
 * Allows only logged-in admins.
 * Guests go to login (with a returnUrl); logged-in non-admins see the "not authorized" page.
 */
export const adminGuard: CanActivateFn = (_route, state) => {
  const router = inject(Router);
  const session = inject(SessionService);
  const { loginRoute, unauthorizedRoute } = inject(AUTH_CONFIG);

  if (!session.isLoggedIn()) {
    return router.createUrlTree([loginRoute], { queryParams: { returnUrl: state.url } });
  }
  return session.isAdmin() ? true : router.createUrlTree([unauthorizedRoute]);
};
