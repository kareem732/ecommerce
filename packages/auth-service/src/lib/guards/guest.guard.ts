import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AUTH_CONFIG } from '../config/auth.config';
import { SessionService } from '../services/session.service';
export const guestGuard: CanActivateFn = () => {
  const router = inject(Router);
  const { homeRoute } = inject(AUTH_CONFIG);

  return inject(SessionService).isLoggedIn() ? router.createUrlTree([homeRoute]) : true;
};
