import { Signal, inject } from '@angular/core';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { RequestOptions } from '@my/shared/data';
import { UsersApiService } from './users-api.service';
import { User } from './users.models';

const entityName = 'users';
const queryKeys = {
  all: (requestOptions: RequestOptions) => [entityName, requestOptions],
  page: (requestOptions: RequestOptions) => [
    entityName,
    'page',
    requestOptions,
  ],
  details: (id: User['id']) => [entityName, 'details', id],
};

const queryOptions = {
  staleTime: 1000 * 5,
  gcTime: 1000 * 120,
};

function pageQuery(requestOptions: Signal<RequestOptions>) {
  const usersApi = inject(UsersApiService);
  return injectQuery(() => ({
    queryKey: queryKeys.page(requestOptions()),
    queryFn: () => usersApi.fetchPage(requestOptions()),
    select: ({ items, total, hasMore, pagination }) => {
      return {
        items,
        total,
        hasMore,
        pagination,
      };
    },
    ...queryOptions,
  }));
}

function detailsQuery(id: Signal<User['id']>) {
  if (!id) {
    return;
  }
  const usersApi = inject(UsersApiService);
  return injectQuery(() => ({
    queryKey: queryKeys.details(id()),
    queryFn: () => usersApi.fetchById(id()),
    ...queryOptions,
  }));
}

export const usersQuery = {
  page: pageQuery,
  details: detailsQuery,
};
