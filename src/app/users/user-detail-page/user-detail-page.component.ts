import { JsonPipe } from '@angular/common';
import { Component, input } from '@angular/core';
import { usersQuery } from '@my/users/data';

@Component({
  selector: 'app-user-detail-page',
  standalone: true,
  imports: [JsonPipe],
  template: `
    <h1>User Details</h1>
    <p>{{ userDetailsQuery?.data | json }}</p>
  `,
  styles: ``,
})
export class UserDetailPageComponent {
  id = input<string>('');

  userDetailsQuery = usersQuery.details(this.id);
}
