import { createInjectionToken } from 'ngxtension/create-injection-token';
import { RequestOptions, functionalApiService } from '../../shared';
import { User } from './users.models';

interface QueryStateOptions {
  entityName: string;
  requestOptions?: Partial<RequestOptions>;
}
function queryState<T>(entityName: string | QueryStateOptions) {
  const name =
    typeof entityName === 'string' ? entityName : entityName.entityName;
  return createInjectionToken(() => functionalApiService<T>(name));
}

// export const [injectUserQuery] = createInjectionToken(() =>
//   apiService<User>('users'),
// );

export const [injectUserQuery] = queryState<User>('users');
