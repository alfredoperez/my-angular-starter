import { Signal, inject } from '@angular/core';
import {
  injectMutation,
  injectQuery,
  injectQueryClient,
  keepPreviousData,
} from '@tanstack/angular-query-experimental';
import { RequestOptions } from '@my/shared/data';
import { UsersApiService } from './users-api.service';
import { User } from './users.models';

const entityName = 'users';

export const queryKeys = {
  all: () => [entityName],
  list: (requestOptions?: RequestOptions) => [
    entityName,
    'list',
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
    queryKey: queryKeys.list(requestOptions()),
    queryFn: () => usersApi.fetchPage(requestOptions()),
    placeholderData: keepPreviousData,
    ...queryOptions,
  }));
}

function prefetchNextPageQuery(requestOptions: Signal<RequestOptions>) {
  const usersApi = inject(UsersApiService);
  const queryClient = injectQueryClient();

  return {
    prefetch: () => {
      const currentPage = requestOptions().pagination?.page || 1;

      const options = {
        ...requestOptions(),
        pagination: {
          ...requestOptions().pagination,
          page: currentPage + 1,
        },
      };
      return queryClient.prefetchQuery({
        queryKey: queryKeys.list(options),
        queryFn: () => usersApi.fetchPage(options),
      });
    },
  };
}

function detailsQuery(id: Signal<User['id']>) {
  const targetId = id();
  if (!targetId || targetId === '') {
    return;
  }
  const usersApi = inject(UsersApiService);
  return injectQuery(() => ({
    queryKey: queryKeys.details(id()),
    queryFn: () => usersApi.fetchById(id()),
    ...queryOptions,
  }));
}

function addMutation() {
  const usersApi = inject(UsersApiService);
  const queryClient = injectQueryClient();

  return injectMutation(() => {
    return {
      mutationKey: ['addUser'],
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.all() });
      },
      mutationFn: (user: User) => usersApi.create(user),
    };
  });
}

function updateMutation(user: Signal<User>) {
  const usersApi = inject(UsersApiService);
  const queryClient = injectQueryClient();

  return injectMutation(() => {
    return {
      mutationKey: ['updateUser'],
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.all() });
      },
      mutationFn: () => {
        return usersApi.update(user().id, user());
      },
    };
  });
}

function deleteMutation(user: Signal<User>) {
  const usersApi = inject(UsersApiService);
  const queryClient = injectQueryClient();

  return injectMutation(() => ({
    mutationKey: ['deleteUser'],
    mutationFn: () => usersApi.delete(user().id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.all() });
      queryClient.removeQueries({ queryKey: queryKeys.details(user().id) });
    },
  }));
}

export const usersQuery = {
  page: pageQuery,
  details: detailsQuery,
  prefetchNextPage: prefetchNextPageQuery,
  delete: deleteMutation,
  add: addMutation,
  update: updateMutation,
};
