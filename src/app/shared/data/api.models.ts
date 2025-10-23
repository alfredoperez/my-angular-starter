import { Signal } from '@angular/core';
import { Observable } from 'rxjs';

export interface Pagination {
  limit: number;

  page: number;
}

export interface RequestOptions {
  /**
   * The search query to filter the results
   */
  searchQuery?: string;

  /**
   * The pagination options
   */
  pagination?: Partial<Pagination>;

  /**
   * The URL to make the request and this  replaces the original one
   */
  url?: string;

  /**
   * The type of the response that we will get
   */
  observe?: 'body' | 'events' | 'response';

  /**
   * How long the data will be considered fresh
   */
  staleTime: number;

  orderDirection: 'ASC' | 'DESC';

  orderBy: string;

  select: (data: unknown) => unknown;
}

export interface ListResponse<T> {
  /**
   * The total number of elements
   */
  total: number;

  /**
   * The list of items
   */
  items: Array<T>;

  /**
   * If there are more elements to load
   */
  hasMore: boolean;

  /**
   * The pagination options used for this response
   */
  pagination: Pagination;
}
