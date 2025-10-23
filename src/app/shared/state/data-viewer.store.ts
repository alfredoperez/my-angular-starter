import { computed } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';
import { Pagination, RequestOptions } from '@my/data';

interface DataViewerState {
  /**
   * The search query to filter the results
   */
  searchQuery: string;

  /**
   * The pagination options
   */
  pagination: Partial<Pagination>;

  /**
   * How long the data will be considered fresh (in milliseconds)
   * @default 300000 (5 minutes)
   */
  staleTime: number;
}

const initialState: DataViewerState = {
  pagination: { limit: 20, page: 1 },
  searchQuery: '',
  staleTime: 1000 * 60 * 5, // 5 minutes default
};

export const DataViewerStore = signalStore(
  withState(initialState),
  withComputed(({ pagination, staleTime, searchQuery }) => ({
    page: computed(() => pagination().page),
    requestOptions: computed(() => {
      return {
        searchQuery: searchQuery() ?? '',
        pagination: pagination(),
        orderBy: 'age',
        orderDirection: 'ASC',
        staleTime: staleTime() ?? 1000 * 60 * 5,
      } as Partial<RequestOptions>;
    }),
  })),
  withMethods((store) => ({
    setSearchQuery: (searchQuery: string) => {
      patchState(store, (state) => ({ ...state, searchQuery }));
    },
    setPage: (page: number) => {
      patchState(store, (state) => ({
        ...state,
        pagination: {
          ...state.pagination,
          page,
        },
      }));
    },
    setStaleTime: (staleTime: number) => {
      patchState(store, (state) => ({ ...state, staleTime }));
    },
  })),
);
