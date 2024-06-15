import { Routes } from '@angular/router';
import { UserDetailPageComponent } from '@my/users/user-detail-page/user-detail-page.component';
import { UsersPageComponent } from './users-page/users-page.component';

export const usersRoutes: Routes = [
  {
    path: '',
    component: UsersPageComponent,
  },
  {
    path: ':id',
    component: UserDetailPageComponent,
  },
];
