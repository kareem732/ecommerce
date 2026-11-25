import {
  ApplicationConfig,
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
import { appRoutes } from './app.routes';
import { environment } from '../environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      appRoutes,
      withInMemoryScrolling({ scrollPositionRestoration: 'top' }),
    ),
    // The remotes use `providedIn: 'root'` services (auth store, API services)
    // that resolve from the shell's root injector, so they must be provided here.
    provideHttpClient(withInterceptors([authInterceptor, errorInterceptor])),
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
