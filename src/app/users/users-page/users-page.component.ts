import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AgGridModule } from 'ag-grid-angular';
import { RowClickedEvent } from 'ag-grid-community';
import { DataViewerStore } from '@my/shared/state';
import {
  ButtonComponent,
  DefaultOptions,
  ModalService,
  PaginationComponent,
} from '@my/shared/ui';
import { User, usersQuery } from '@my/users/data';
import { AddUserModalComponent } from '@my/users/shared/components/add-user-modal.component';
import { columnDefs } from '@my/users/users-page/user-page.models';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    AgGridModule,
    ButtonComponent,
    InputTextModule,
    PaginatorModule,
    FormsModule,
  ],
  providers: [DataViewerStore],
  template: `
    <div class="flex h-full flex-col gap-6">
      <div class="flex items-center justify-between gap-6">
        <h1 class="text-xl font-semibold">Users</h1>
        <a-button type="success" (click)="onAddUser()" label="Add User" />
      </div>

      <div class="p-input-icon-left w-full">
        <i class="pi pi-search"></i>
        <input
          type="text"
          class="w-full"
          (input)="onSearch($event)"
          pInputText
          placeholder="Search users..."
        />
      </div>

      <div class="">
        @if (usersQuery.isPending()) {
          <div>Loading...</div>
        }
        @if (usersQuery.isError()) {
          <span>Error</span>
        }
        @if (usersQuery.isSuccess()) {
          <div [style.opacity]="isPlaceholderData() ? 0.5 : 1">
            <ag-grid-angular
              class="ag-theme-alpine border-round "
              [rowData]="users()"
              [columnDefs]="columnDefs"
              (rowClicked)="handleRowClicked($event)"
              style="width: 100%; height: 500px; max-width: 1000px"
            />

            <p-paginator
              class="mt-4 rounded-md border border-gray-200"
              [rows]="10"
              [totalRecords]="totalItems()"
              [rowsPerPageOptions]="[10, 20, 30]"
              (onPageChange)="onPageChange($event)"
            ></p-paginator>
          </div>
        }
      </div>
    </div>
  `,
})
export class UsersPageComponent {
  // injects
  store = inject(DataViewerStore);
  // signals
  usersQuery = usersQuery.page(this.store.requestOptions);
  users = computed(() => this.usersQuery.data()?.items || []);
  totalItems = computed(() => this.usersQuery.data()?.total || 0);
  isPlaceholderData = this.usersQuery.isPlaceholderData;
  prefetchNextPage = usersQuery.prefetchNextPage(this.store.requestOptions);
  // props
  protected readonly columnDefs = columnDefs;
  #modalService = inject(ModalService);
  #router = inject(Router);

  searchQuery = '';

  showNewTable = computed(() => this.featureFlags.get('new_users_table')());

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

  public onAddUser() {
    this.#modalService.open(AddUserModalComponent);
  }

  public onEditUser(event: RowClickedEvent<User>) {
    if (!event.data) {
      return;
    }
    this.#router.navigate(['/users', event.data.id]);
  }
  // handleCurrentPageChange(page: number) {
  //   this.store.setPage(page);
  // }

  onPageChange(event: any) {
    this.#store.setPage(event.page);
  }

  handleSortChanged() {
    // TODO: need to implement this
  }

  handleSearchQueryChange(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.#store.setSearchQuery(value);
  }
}
