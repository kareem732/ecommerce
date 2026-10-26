import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { AUTH_CONFIG, AuthConfigInput, DEFAULT_AUTH_CONFIG } from './config/auth.config';
import { authInterceptor } from './interceptors/auth.interceptor';
import { errorInterceptor } from './interceptors/error.interceptor';
import { TokenService } from './services/token.service';
import { SessionService } from './services/session.service';
import { AuthApiService } from './services/auth-api.service';
import { RegisterService } from './services/register.service';
import { LoginService } from './services/login.service';
import { OtpService } from './services/otp.service';
import { PasswordResetService } from './services/password-reset.service';

export function provideAuth(config: AuthConfigInput): EnvironmentProviders {
  const { includeHttpClient = true, ...authConfig } = config;

  const providers: unknown[] = [
    { provide: AUTH_CONFIG, useValue: { ...DEFAULT_AUTH_CONFIG, ...authConfig } },
    CookieService,
    TokenService,
    SessionService,
    AuthApiService,
    RegisterService,
    LoginService,
    OtpService,
    PasswordResetService,
  ];

  if (includeHttpClient) {
    providers.push(provideHttpClient(withInterceptors([authInterceptor, errorInterceptor])));
  }

  return makeEnvironmentProviders(providers as Parameters<typeof makeEnvironmentProviders>[0]);
}
