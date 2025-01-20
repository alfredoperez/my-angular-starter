import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AgGridModule } from 'ag-grid-angular';
import { RowClickedEvent, themeAlpine } from 'ag-grid-community';
import { InputTextModule } from 'primeng/inputtext';
import { PaginatorModule } from 'primeng/paginator';
import { ButtonComponent, ModalService } from '@my/ui';
import { User, usersQuery } from '@my/users/data';
import { AddUserModalComponent } from '@my/users/shared/components/add-user-modal.component';
import { columnDefs } from '@my/users/users-page/user-page.models';
import { FeatureFlagsService } from '../../shared/data/feature-flags/feature-flags.service';
import { DataViewerStore } from '../../shared/state';

@Component({
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
            @if (showNewTable()) {
              <ag-grid-angular
                class="border-round"
                [rowData]="users()"
                [columnDefs]="columnDefs"
                [theme]="theme"
                (rowClicked)="onEditUser($event)"
                style="width: 100%; height: 500px"
              />
            } @else {
              <div class="flex flex-col gap-4">
                @for (user of users(); track user.id) {
                  <div
                    class="cursor-pointer rounded-md border p-4 hover:bg-gray-50"
                  >
                    <div class="font-medium">{{ user.name }}</div>
                    <div class="text-sm text-gray-600">{{ user.email }}</div>
                  </div>
                }
              </div>
            }

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
  #store = inject(DataViewerStore);
  #modalService = inject(ModalService);
  #router = inject(Router);
  featureFlags = inject(FeatureFlagsService);

  usersQuery = usersQuery.page(this.#store.requestOptions);
  users = computed(() => this.usersQuery.data()?.items || []);
  totalItems = computed(() => this.usersQuery.data()?.total || 0);
  isPlaceholderData = this.usersQuery.isPlaceholderData;
  prefetchNextPage = usersQuery.prefetchNextPage(this.#store.requestOptions);

  protected readonly columnDefs = columnDefs;
  theme = themeAlpine;
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

  onPageChange(event: any) {
    this.#store.setPage(event.page);
  }

  onSearch(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.#store.setSearchQuery(value);
  }
}
