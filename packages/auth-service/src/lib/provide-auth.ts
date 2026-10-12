import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { AUTH_CONFIG, AuthConfigInput, DEFAULT_AUTH_CONFIG } from './config/auth.config';
import { authInterceptor } from './interceptors/auth.interceptor';
import { errorInterceptor } from './interceptors/error.interceptor';

export function provideAuth(config: AuthConfigInput): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: AUTH_CONFIG, useValue: { ...DEFAULT_AUTH_CONFIG, ...config } },
    provideHttpClient(withInterceptors([authInterceptor, errorInterceptor])),
  ]);
}
