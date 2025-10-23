import { Injectable } from '@angular/core';
import { CrudRepository } from '../../shared/data/crud-repository';
import { User } from './users.models';

@Injectable({ providedIn: 'root' })
export class UsersRepository extends CrudRepository<User> {
  protected entityName = 'users';
}
