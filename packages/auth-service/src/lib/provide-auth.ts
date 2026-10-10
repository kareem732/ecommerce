import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { AUTH_CONFIG, AuthConfigInput, DEFAULT_AUTH_CONFIG } from './config/auth.config';
import { authInterceptor } from './interceptors/auth.interceptor';
import { errorInterceptor } from './interceptors/error.interceptor';
import { AuthApiService } from './services/auth-api.service';
import { LoginService } from './services/login.service';
import { RegisterService } from './services/register.service';
import { OtpService } from './services/otp.service';
import { PasswordResetService } from './services/password-reset.service';
import { TokenService } from './services/token.service';
import { SessionService } from './services/session.service';

export function provideAuth(config: AuthConfigInput): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: AUTH_CONFIG, useValue: { ...DEFAULT_AUTH_CONFIG, ...config } },
    provideHttpClient(withInterceptors([authInterceptor, errorInterceptor])),
    TokenService,
    SessionService,
    AuthApiService,
    LoginService,
    RegisterService,
    OtpService,
    PasswordResetService,
  ]);
}
