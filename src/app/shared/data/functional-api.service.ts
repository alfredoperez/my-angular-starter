import { HttpClient, HttpResponse } from '@angular/common/http';
import { Signal, inject } from '@angular/core';
import {
  injectQuery,
  injectQueryClient,
} from '@tanstack/angular-query-experimental';
import { lastValueFrom } from 'rxjs';
import { ListResponse, Pagination, RequestOptions } from './api.models';

export function functionalApiService<T>(entityName: string) {
  const httpClient = inject(HttpClient);
  const queryClient = injectQueryClient();

  async function fetchPage(
    requestOptions?: Partial<RequestOptions>,
  ): Promise<ListResponse<T>> {
    const result = await request<Array<T>>('GET', {
      ...requestOptions,
      observe: 'response',
    });
    return mapListResponse(
      result as unknown as HttpResponse<T>,
      requestOptions?.pagination,
    );
  }

  function fetchById(
    id: number,
    requestOptions?: Partial<RequestOptions>,
  ): Promise<any> {
    return request('GET', requestOptions, undefined, id);
  }

  function create(
    body: Partial<any>,
    requestOptions?: Partial<RequestOptions>,
  ): Promise<any | null> {
    return request('POST', requestOptions, body);
  }

  function update(
    id: number,
    body: Partial<any>,
    requestOptions?: Partial<RequestOptions>,
  ): Promise<any> {
    return request('PATCH', requestOptions, body, id);
  }

  function queryPage(requestOptions: Signal<RequestOptions>) {
    return injectQuery(() => ({
      queryKey: [entityName, requestOptions()],
      staleTime: 1000 * 5,
      gcTime: 1000 * 120,
      queryFn: () => fetchPage(requestOptions()),
    }));
  }
  function prefetchPage(
    nextPage: number,
    options: Partial<RequestOptions> = {},
  ) {
    const { searchQuery, pagination, orderDirection, orderBy } = options;

    if (!pagination) {
      return;
    }
    pagination.page = nextPage;

    return queryClient.prefetchQuery({
      queryKey: [
        entityName,
        { pagination, searchQuery, orderDirection, orderBy },
      ],
      queryFn: () => {
        return fetchPage(options);
      },
    });
  }

  function request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
    options?: Partial<RequestOptions>,
    body?: unknown,
    id?: number,
  ): Promise<T> {
    return lastValueFrom(
      httpClient.request(method, getUrl(id), getOptions(options, body)),
    );
  }

  function getUrl(id?: number) {
    const idPath = !id ? '' : `/${id}`;
    return `http://localhost:3000/${entityName}${idPath}`;
  }

  function getOptions(options?: Partial<RequestOptions>, body?: unknown) {
    let params = {};
    if (options && options.pagination) {
      const { orderBy, orderDirection } = options;
      const { limit, page } = options.pagination;
      const paginationParams = {
        _per_page: limit?.toString(),
        _page: (page ? page : 0).toString(),
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

  function mapListResponse(
    httpResponse: HttpResponse<unknown>,
    pagination?: Partial<Pagination>,
  ): ListResponse<any> {
    if (!httpResponse.headers) {
      return {} as ListResponse<any>;
    }
    const { items: total, next, data: items } = httpResponse.body as never;
    const hasMore = next > (pagination?.page || 0);

    return {
      items,
      total,
      hasMore,
      pagination,
    } as ListResponse<any>;
  }

  return {
    fetchPage,
    fetchById,
    create,
    update,
    queryPage,
    prefetchPage,
    request,
    getUrl,
    getOptions,
    mapListResponse,
  };
}
