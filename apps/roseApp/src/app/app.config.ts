import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';
import { definePreset } from '@primeuix/themes';
import { appRoutes } from './app.routes';

const RosePreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: '{maroon.50}',
      100: '{maroon.100}',
      200: '{maroon.200}',
      300: '{maroon.300}',
      400: '{maroon.400}',
      500: '{maroon.500}',
      600: '{maroon.600}',
      700: '{maroon.700}',
      800: '{maroon.800}',
      900: '{maroon.900}',
      950: '{maroon.950}',
    },
  },
  primitive: {
    maroon: {
      50: '#fbeaea',
      100: '#f3c5c7',
      200: '#ea9fa2',
      300: '#e07a7d',
      400: '#d75458',
      500: '#cd2e33',
      600: '#a6252a',
      700: '#741c21',
      800: '#501419',
      900: '#2c0c10',
      950: '#20090c',
    },
  },
});

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(appRoutes),
    providePrimeNG({
      theme: {
        preset: RosePreset,
        options: {
          darkModeSelector: 'system',
        },
      },
    }),
  ],
};
