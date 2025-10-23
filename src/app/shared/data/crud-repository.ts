import { HttpClient, HttpResponse } from '@angular/common/http';
import { inject, Signal, untracked, effect, isSignal } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import {
  injectQuery,
  injectMutation,
  injectQueryClient,
  keepPreviousData,
  QueryObserverResult,
  MutationObserverResult,
  MutationResult,
} from '@ngneat/query';
import { RequestOptions, ListResponse, Pagination } from './api.models';

export abstract class CrudRepository<T> {
  #httpClient = inject(HttpClient);
  #query = injectQuery();
  #mutation = injectMutation();
  #queryClient = injectQueryClient();

  protected abstract entityName: string;
  protected defaultStaleTime = 1000 * 60 * 5;
  protected defaultGcTime = 1000 * 60 * 10;

  public queryKeys = {
    all: () => [this.entityName] as const,
    list: (requestOptions?: Partial<RequestOptions>) =>
      [this.entityName, 'list', requestOptions] as const,
    details: (id: string) => [this.entityName, 'details', id] as const,
  };

  fetchPage(requestOptions: Signal<Partial<RequestOptions>> | Partial<RequestOptions>) {
    const initialOptions = isSignal(requestOptions) ? untracked(requestOptions) : requestOptions;

    const queryResult = this.#query({
      queryKey: this.queryKeys.list(initialOptions),
      queryFn: () => this.#fetchPageData(initialOptions),
      placeholderData: keepPreviousData,
      staleTime: initialOptions.staleTime ?? this.defaultStaleTime,
      gcTime: this.defaultGcTime,
      select: initialOptions.select as any,
    });

    return {
      ...queryResult,
      setupReactivity: () => {
        if (isSignal(requestOptions)) {
          effect(() => {
            const options = requestOptions();
            queryResult.updateOptions({
              queryKey: this.queryKeys.list(options),
              queryFn: () => this.#fetchPageData(options),
              placeholderData: keepPreviousData,
              staleTime: options.staleTime ?? this.defaultStaleTime,
              gcTime: this.defaultGcTime,
              select: options.select as any,
            });
          });
        }
      }
    };
  }

  async #fetchPageData(requestOptions: Partial<RequestOptions>) {
    const result = await this.#request<Array<T>>('GET', {
      ...requestOptions,
      observe: 'response',
    });
    return this.#mapListResponse(
      result as unknown as HttpResponse<T>,
      requestOptions.pagination
    );
  }

  fetchById(id: Signal<string> | string) {
    const initialId = isSignal(id) ? untracked(id) : id;

    const queryResult = this.#query({
      queryKey: this.queryKeys.details(initialId),
      queryFn: () => this.#request<T>('GET', undefined, undefined, initialId),
      staleTime: this.defaultStaleTime,
      gcTime: this.defaultGcTime,
      enabled: !!initialId,
    });

    return {
      ...queryResult,
      setupReactivity: () => {
        if (isSignal(id)) {
          effect(() => {
            const currentId = id();
            queryResult.updateOptions({
              queryKey: this.queryKeys.details(currentId),
              queryFn: () => this.#request<T>('GET', undefined, undefined, currentId),
              staleTime: this.defaultStaleTime,
              gcTime: this.defaultGcTime,
              enabled: !!currentId,
            });
          });
        }
      }
    };
  }

  create(): MutationResult<T | null, Error, Partial<T>, unknown> {
    return this.#mutation<T | null, Error, Partial<T>>({
      mutationKey: [this.entityName, 'create'],
      mutationFn: (data: Partial<T>) => {
        return this.#request<T | null>('POST', undefined, data);
      },
      onSuccess: () => {
        this.#queryClient.invalidateQueries({
          queryKey: this.queryKeys.all(),
        });
      },
    });
  }

  update(): MutationResult<T, Error, { id: string; data: Partial<T> }, unknown> {
    return this.#mutation<T, Error, { id: string; data: Partial<T> }>({
      mutationKey: [this.entityName, 'update'],
      mutationFn: ({ id, data }: { id: string; data: Partial<T> }) => {
        return this.#request<T>('PUT', undefined, data, id);
      },
      onSuccess: () => {
        this.#queryClient.invalidateQueries({
          queryKey: this.queryKeys.all(),
        });
      },
    });
  }

  delete(): MutationResult<T, Error, string, unknown> {
    return this.#mutation<T, Error, string>({
      mutationKey: [this.entityName, 'delete'],
      mutationFn: (id: string) => {
        return this.#request<T>('DELETE', undefined, null, id);
      },
      onSuccess: (_data: T, id: string) => {
        this.#queryClient.invalidateQueries({
          queryKey: this.queryKeys.all(),
        });
        this.#queryClient.removeQueries({
          queryKey: this.queryKeys.details(id),
        });
      },
    });
  }

  async prefetchNextPage(
    requestOptions: Signal<Partial<RequestOptions>> | Partial<RequestOptions>
  ): Promise<void> {
    const options = isSignal(requestOptions) ? requestOptions() : requestOptions;
    const currentPage = options.pagination?.page ?? 0;
    const nextOptions: Partial<RequestOptions> = {
      ...options,
      pagination: {
        ...(options.pagination ?? { limit: 10 }),
        page: currentPage + 1,
      },
    };

    return this.#queryClient.prefetchQuery({
      queryKey: this.queryKeys.list(nextOptions),
      queryFn: async () => {
        const result = await this.#request<Array<T>>('GET', {
          ...nextOptions,
          observe: 'response',
        });
        return this.#mapListResponse(
          result as unknown as HttpResponse<T>,
          nextOptions.pagination
        );
      },
    });
  }

  #request<TResult>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
    requestOptions?: Partial<RequestOptions>,
    body?: unknown,
    id?: string
  ): Promise<TResult> {
    const url = this.#getUrl(id);
    const options = this.#getOptions(requestOptions, body);

    return lastValueFrom(
      this.#httpClient.request<TResult>(method, url, options as any)
    ) as Promise<TResult>;
  }

  #getUrl(id?: string): string {
    const idPath = !id ? '' : `/${id}`;
    return `http://localhost:3000/${this.entityName}${idPath}`;
  }

  #getOptions(options?: Partial<RequestOptions>, body?: unknown) {
    let params = {};
    if (options?.pagination) {
      const { orderBy, orderDirection } = options;
      const { limit, page } = options.pagination;
      const paginationParams = {
        _limit: limit?.toString(),
        _page: (page ?? 0).toString(),
        _sort: `${orderDirection === 'ASC' ? '' : '-'}${orderBy}`,
      };
      params = { ...paginationParams };
    }

    return {
      params,
      body,
      observe: options?.observe || 'body',
    };
  }

  #mapListResponse(
    response: HttpResponse<unknown>,
    pagination?: Partial<Pagination>
  ): ListResponse<T> {
    if (!response.headers) {
      return {} as ListResponse<T>;
    }
    const total = Number(response.headers.get('X-Total-Count'));
    let hasMore = false;

    if (pagination) {
      const { limit, page } = pagination;
      if (limit && page !== undefined) {
        hasMore = total > limit * (page + 1);
      }
    }

    return {
      items: response.body,
      total,
      hasMore,
      pagination: pagination as Pagination,
    } as ListResponse<T>;
  }
}
