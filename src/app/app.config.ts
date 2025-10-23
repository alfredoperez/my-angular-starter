import { provideHttpClient } from '@angular/common/http';
import { ApplicationConfig } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { providePrimeNG } from 'primeng/config';
import { definePreset } from '@primeng/themes';
import Aura from '@primeng/themes/aura';
import { provideQueryClient, QueryClient } from '@ngneat/query';
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
import { appRoutes } from './app.routes';

// Create Indigo preset
const IndigoPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: '{indigo.50}',
      100: '{indigo.100}',
      200: '{indigo.200}',
      300: '{indigo.300}',
      400: '{indigo.400}',
      500: '{indigo.500}',
      600: '{indigo.600}',
      700: '{indigo.700}',
      800: '{indigo.800}',
      900: '{indigo.900}',
      950: '{indigo.950}',
    },
    colorScheme: {
      light: {
        primary: {
          color: '{indigo.600}',
          contrastColor: '#ffffff',
          hoverColor: '{indigo.700}',
          activeColor: '{indigo.800}',
        },
        highlight: {
          background: '{indigo.600}',
          focusBackground: '{indigo.700}',
          color: '#ffffff',
          focusColor: '#ffffff',
        },
      },
      dark: {
        primary: {
          color: '{indigo.400}',
          contrastColor: '#ffffff',
          hoverColor: '{indigo.300}',
          activeColor: '{indigo.200}',
        },
        highlight: {
          background: '{indigo.400}',
          focusBackground: '{indigo.300}',
          color: '#ffffff',
          focusColor: '#ffffff',
        },
      },
    },
  },
});

ModuleRegistry.registerModules([AllCommunityModule]);
export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(appRoutes, withComponentInputBinding()),
    provideHttpClient(),
    provideAnimationsAsync(),
    provideQueryClient(new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 1000 * 60 * 5, // 5 minutes
          gcTime: 1000 * 60 * 10, // 10 minutes
          retry: 1,
          refetchOnWindowFocus: false,
        },
      },
    })),
    providePrimeNG({
      theme: {
        preset: IndigoPreset,
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
