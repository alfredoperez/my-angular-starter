import { HttpClient, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { delay, lastValueFrom } from 'rxjs';
import { ListResponse, Pagination, RequestOptions } from './api.models';

export abstract class ApiService<T> {
  #httpClient = inject(HttpClient);

  protected constructor(private entityName: string) {}

  public async fetchPage(
    requestOptions?: Partial<RequestOptions>,
  ): Promise<ListResponse<T>> {
    const result = await this.request<Array<T>>('GET', {
      ...requestOptions,
      observe: 'response',
    });

    const mappedResponse = this.mapListResponse(
      result as unknown as HttpResponse<T>,
      requestOptions?.pagination,
    );

    return mappedResponse;
  }

  public fetchById(
    id: string,
    requestOptions?: Partial<RequestOptions>,
  ): Promise<T> {
    return this.request('GET', requestOptions, undefined, id);
  }

  public create(
    body: Partial<T>,
    requestOptions?: Partial<RequestOptions>,
  ): Promise<T | null> {
    return this.request('POST', requestOptions, body);
  }

  public update(
    id: string,
    body: Partial<T>,
    requestOptions?: Partial<RequestOptions>,
  ): Promise<T> {
    return this.request('PUT', requestOptions, body, id);
  }

  public delete(
    id: string,
    requestOptions?: Partial<RequestOptions>,
  ): Promise<T> {
    return this.request('DELETE', requestOptions, null, id);
  }

  protected request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
    requestOptions?: Partial<RequestOptions>,
    body?: unknown,
    id?: string,
  ): Promise<T> {
    const url = this.getUrl(id);
    const options = this.getOptions(requestOptions, body);

    return lastValueFrom(
      this.#httpClient.request(method, url, options).pipe(delay(0)),
    );
  }

  private getUrl(id?: string) {
    const idPath = !id ? '' : `/${id}`;
    return `http://localhost:3000/${this.entityName}${idPath}`;
  }

  private getOptions(options?: Partial<RequestOptions>, body?: unknown) {
    let params = {};
    if (options && options.pagination) {
      const { orderBy, orderDirection } = options;
      const { limit, page } = options.pagination;
      const paginationParams = {
        _limit: limit?.toString(),
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

  private mapListResponse(
    response: HttpResponse<unknown>,
    pagination?: Partial<Pagination>,
  ): ListResponse<T> {
    if (!response.headers) {
      return {} as ListResponse<T>;
    }
    const total = Number(response.headers.get('X-Total-Count'));
    let hasMore = false;

    if (pagination) {
      const { limit, page } = pagination;
      if (limit && page) {
        hasMore = total > limit * (page + 1);
      }
    }

    return {
      items: response.body,
      total,
      hasMore,
      pagination,
    } as ListResponse<T>;
  }
}
