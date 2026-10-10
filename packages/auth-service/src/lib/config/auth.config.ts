import { InjectionToken } from '@angular/core';

export interface AuthConfig {
  /**  https://rose-app.elevate-bootcamp.cloud */
  apiUrl: string;
  tokenCookieName: string;
  loginRoute: string;
  homeRoute: string;
}

export type AuthConfigInput = Pick<AuthConfig, 'apiUrl'> & Partial<AuthConfig>;

export const DEFAULT_AUTH_CONFIG: Omit<AuthConfig, 'apiUrl'> = {
  tokenCookieName: 'rose_token',
  loginRoute: '/auth/login',
  homeRoute: '/',
};

export const AUTH_CONFIG = new InjectionToken<AuthConfig>('AUTH_CONFIG');
