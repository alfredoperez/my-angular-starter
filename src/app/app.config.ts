import { provideHttpClient } from '@angular/common/http';
import { ApplicationConfig } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import Aura from '@primeng/themes/aura';
import {
  QueryClient,
  provideTanStackQuery,
  withDevtools,
} from '@tanstack/angular-query-experimental';
import { providePrimeNG } from 'primeng/config';
import { appRoutes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(appRoutes, withComponentInputBinding()),
    provideHttpClient(),
    provideAnimationsAsync(),
    providePrimeNG({
      theme: {
        preset: Aura,
      },
    }),
    provideTanStackQuery(new QueryClient(), withDevtools()),
  ],
};
