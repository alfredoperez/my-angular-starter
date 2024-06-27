import { computed } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';
import { Pagination, RequestOptions } from '@my/shared/data';

interface DataViewerState {
  /**
   * The search query to filter the results
   */
  searchQuery?: string;

  /**
   * The pagination options
   */
  pagination: Partial<Pagination>;
}

const initialState: DataViewerState = {
  pagination: { limit: 20, page: 1 },
  searchQuery: '',
};

export const DataViewerStore = signalStore(
  withState(initialState),
  withComputed(({ pagination }) => ({
    page: computed(() => pagination().page),
    requestOptions: computed(() => {
      return {
        // searchQuery: searchQuery(),
        pagination: pagination(),
        orderBy: 'age',
        orderDirection: 'ASC',
      } as RequestOptions;
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
  })),
);
