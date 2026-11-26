import { InjectionToken } from '@angular/core';

export interface AuthConfig {
  /**  https://rose-app.elevate-bootcamp.cloud */
  apiUrl: string;
  tokenCookieName: string;
  loginRoute: string;
  homeRoute: string;
  /** Where logged-in users are sent when their role is not allowed (e.g. non-admins on admin pages). */
  unauthorizedRoute: string;
}

export type AuthConfigInput = Pick<AuthConfig, 'apiUrl'> &
  Partial<AuthConfig> & {
    includeHttpClient?: boolean;
  };

export const DEFAULT_AUTH_CONFIG: Omit<AuthConfig, 'apiUrl'> = {
  tokenCookieName: 'rose_token',
  loginRoute: '/auth/login',
  homeRoute: '/',
  unauthorizedRoute: '/unauthorized',
};

export const AUTH_CONFIG = new InjectionToken<AuthConfig>('AUTH_CONFIG');
