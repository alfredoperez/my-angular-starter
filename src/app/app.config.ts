import { provideHttpClient } from '@angular/common/http';
import { ApplicationConfig } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura';
import {
  QueryClient,
  provideTanStackQuery,
  withDevtools,
} from '@tanstack/angular-query-experimental';
import { ModuleRegistry, ClientSideRowModelModule } from 'ag-grid-community';
import { appRoutes } from './app.routes';

ModuleRegistry.registerModules([ClientSideRowModelModule]);
export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(appRoutes, withComponentInputBinding()),
    provideHttpClient(),
    provideAnimationsAsync(),
    provideTanStackQuery(new QueryClient(), withDevtools()),
    providePrimeNG({
      theme: {
        preset: Aura,
        options: {
          prefix: 'a',
          darkModeSelector: '.dark',
          cssLayer: false  // Disable CSS layers for Tailwind v4 compatibility
        }
      },
      ripple: true,
      inputStyle: 'outlined'
    })
  ],
};
