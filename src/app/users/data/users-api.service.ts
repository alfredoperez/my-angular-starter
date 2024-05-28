import { Injectable } from '@angular/core';
import { ApiService } from '../../shared/data/api.service';
import { User } from './users.models';

@Injectable({ providedIn: 'root' })
export class UsersApiService extends ApiService<User> {
  constructor() {
    super('users');
  }
}
