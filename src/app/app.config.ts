import { provideHttpClient } from '@angular/common/http';
import { ApplicationConfig } from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import {
  QueryClient,
  provideAngularQuery,
} from '@tanstack/angular-query-experimental';
import { appRoutes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(appRoutes, withComponentInputBinding()),
    provideHttpClient(),
    provideAnimations(),
    provideAngularQuery(new QueryClient()), provideAnimationsAsync(),
  ],
};
