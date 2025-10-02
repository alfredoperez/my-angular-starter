import { Route } from '@angular/router';

export const appRoutes: Array<Route> = [
  { path: '', pathMatch: 'full', redirectTo: 'home' },
  {
    path: 'home',
    loadChildren: () => import('./home/routes').then((m) => m.homeRoutes),
  },
  {
    path: 'users',
    loadChildren: () => import('@my/users/routes').then((m) => m.usersRoutes),
  },
];
