import { Route } from '@angular/router';

export const appRoutes: Array<Route> = [
  { path: '', pathMatch: 'full', redirectTo: 'users' },
  {
    path: 'users',
    loadChildren: () =>
      import('@my/users/containers').then((m) => m.usersRoutes),
  },
];
