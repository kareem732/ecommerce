import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';
import { provideToastr } from 'ngx-toastr';
import {
  authInterceptor,
  errorInterceptor,
  provideAuth,
} from '@org/auth-service';
import { LanguageService, provideI18n } from '@org/shared-i18n';
import { loadingInterceptor } from '@org/shared-loading';
import { appRoutes } from './app.routes';
import { environment } from '../environments/environment';
import { i18nConfig } from './i18n.config';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      appRoutes,
      withInMemoryScrolling({ scrollPositionRestoration: 'top' }),
    ),
    provideHttpClient(
      withInterceptors([loadingInterceptor, authInterceptor, errorInterceptor]),
    ),
    provideI18n(i18nConfig),
    provideAppInitializer(() => inject(LanguageService).initialize()),
    provideAuth({
      apiUrl: environment.apiUrl,
      homeRoute: '/shop',
      includeHttpClient: false,
    }),
    provideToastr(),
    providePrimeNG({
      theme: {
        preset: Aura,
        options: {
          darkModeSelector: '.dark',
          cssLayer: {
            name: 'primeng',
            order: 'theme, base, primeng, components, utilities',
          },
        },
      },
    }),
  ],
};
