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
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
import { providePrimeNG } from 'primeng/config';
import { appRoutes } from './app.routes';

// Register all Community features
ModuleRegistry.registerModules([AllCommunityModule]);
export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(appRoutes, withComponentInputBinding()),
    provideHttpClient(),
    provideAnimationsAsync(),
    // ? PrimeNG
    providePrimeNG({
      theme: {
        preset: Aura,
      },
    }),
    provideTanStackQuery(new QueryClient(), withDevtools()),
  ],
};
