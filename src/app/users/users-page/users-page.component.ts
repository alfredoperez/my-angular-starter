import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { Router } from '@angular/router';
import { AgGridModule } from 'ag-grid-angular';
import { RowClickedEvent, SortChangedEvent } from 'ag-grid-community';
import {
  ButtonComponent,
  DefaultOptions,
  ModalService,
  PaginationComponent,
} from '@my/shared/ui';
import { User, usersQuery } from '@my/users/data';
import { AddUserModalComponent } from '@my/users/shared/components/add-user-modal.component';
import { columnDefs } from '@my/users/users-page/user-page.models';
import { DataViewerStore } from '../../shared/state';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    AgGridModule,
    ButtonComponent,
    PaginationComponent,
    MatPaginator,
  ],
  providers: [DataViewerStore],
  template: `
    <div class="flex h-full flex-col gap-6">
      <div class="flex  items-center justify-between gap-6">
        <h1 class="text-2xl font-semibold">Users</h1>
        <ui-button type="primary" (click)="addUser()">Add User</ui-button>
      </div>
      <div>
        <label
          class="input input-bordered flex items-center gap-2"
          style="width: 1000px; "
        >
          <input
            type="text"
            class="grow"
            (change)="handleSearchQueryChange($event)"
            placeholder="Search"
          />
          <svg
            class="h-4 w-4 opacity-70"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 16 16"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z"
              clip-rule="evenodd"
            />
          </svg>
        </label>
      </div>
      <div class="">
        @if (usersQuery.isPending()) {
          <div>Loading...</div>
        }

        @if (usersQuery.isError()) {
          <span> Error</span>
        }
        @if (usersQuery.isSuccess()) {
          <div [style.opacity]="isPlaceholderData() ? 0.5 : 1">
            <ag-grid-angular
              class="ag-theme-alpine border-round "
              [rowData]="users()"
              [columnDefs]="columnDefs"
              (rowClicked)="handleRowClicked($event)"
              (sortChanged)="handleSortChanged($event)"
              style="width: 100%; height: 500px; max-width: 1000px"
            />

            <mat-paginator
              #paginator
              aria-label="Select page"
              class="demo-paginator"
              [length]="totalItems()"
              [pageSize]="20"
              [disabled]="isPlaceholderData()"
              [showFirstLastButtons]="false"
              [hidePageSize]="true"
              [pageIndex]="0"
              (page)="handleCurrentPageChange($event)"
            >
            </mat-paginator>
          </div>
        }
      </div>
    </div>
  `,
})
export class UsersPageComponent {
  #modalService = inject(ModalService);
  #router = inject(Router);
  store = inject(DataViewerStore);

  usersQuery = usersQuery.page(this.store.requestOptions);

  users = computed(() => this.usersQuery.data()?.items || []);

  totalItems = computed(() => this.usersQuery.data()?.total || 0);

  isPlaceholderData = this.usersQuery.isPlaceholderData;

  prefetchNextPage = usersQuery.prefetchNextPage(this.store.requestOptions);

  constructor() {
    effect(() => {
      if (
        !this.usersQuery.isPlaceholderData() &&
        this.usersQuery.data()?.hasMore
      ) {
        this.prefetchNextPage.prefetch();
      }
    });
  }

  public addUser() {
    this.#modalService.open(AddUserModalComponent, DefaultOptions);
  }

  public handleRowClicked(event: RowClickedEvent<User>) {
    if (!event.data) {
      return;
    }
    this.#router.navigate(['/users', event.data.id]);
  }

  handleCurrentPageChange(pageEvent: PageEvent) {
    this.store.setPage(pageEvent.pageIndex);
  }
  // handleCurrentPageChange(page: number) {
  //   this.store.setPage(page);
  // }

  handleSortChanged($event: SortChangedEvent) {}

  handleSearchQueryChange(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.store.setSearchQuery(value);
  }

  protected readonly columnDefs = columnDefs;
}
