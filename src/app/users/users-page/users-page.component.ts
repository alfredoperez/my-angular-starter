import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { Router } from '@angular/router';
import { AgGridModule } from 'ag-grid-angular';
import { RowClickedEvent, themeMaterial } from 'ag-grid-community';
import { User, usersQuery } from '@my/users/data';
import { AddUserModalComponent } from '@my/users/shared/components/add-user-modal.component';
import { EditUserModalComponent } from '@my/users/shared/components/edit-user-modal.component';
import { columnDefs } from '@my/users/users-page/user-page.models';
import { FeatureFlagsService } from '../../shared/data/feature-flags/feature-flags.service';
import { DataViewerStore } from '../../shared/state';

@Component({
  imports: [
    CommonModule,
    AgGridModule,
    ButtonModule,
    CardModule,
    InputTextModule,
    PaginatorModule,
    ProgressSpinnerModule,
    FormsModule,
  ],
  providers: [DataViewerStore, DialogService],
  template: `
    <div class="flex h-full flex-col gap-6">
      <div class="flex items-center justify-between gap-6">
        <h1 class="text-xl font-semibold">Users</h1>
        <p-button
          label="Add User"
          icon="pi pi-plus"
          [outlined]="true"
          (onClick)="onAddUser()"
        />
      </div>

      <div class="p-input-icon-left w-full">
        <i class="pi pi-search"></i>
        <input
          type="text"
          pInputText
          class="w-full"
          placeholder="Search users..."
          (input)="onSearch($event)"
        />
      </div>

      <div>
        @if (usersQuery.isPending()) {
          <div class="flex justify-center p-4">
            <p-progressSpinner
              styleClass="w-12 h-12"
              strokeWidth="4"
              animationDuration=".5s"
            />
          </div>
        }
        @if (usersQuery.isError()) {
          <div class="flex items-center gap-2 text-red-500">
            <i class="pi pi-exclamation-circle"></i>
            <span>An error occurred while loading users</span>
          </div>
        }
        @if (usersQuery.isSuccess()) {
          <div [style.opacity]="isPlaceholderData() ? 0.5 : 1">
            @if (showNewTable()) {
              <ag-grid-angular
                class="border-round"
                [rowData]="users()"
                [theme]="theme"
                [columnDefs]="columnDefs"
                (rowClicked)="onUserRowClicked($event)"
                style="width: 100%; height: 500px"
              />
            } @else {
              <div class="flex flex-col gap-4">
                @for (user of users(); track user.id) {
                  <p-card
                    class="cursor-pointer hover:bg-gray-50"
                    (click)="onEditUser(user)"
                  >
                    <div class="font-medium">{{ user.name }}</div>
                    <div class="text-sm text-gray-600">{{ user.email }}</div>
                  </p-card>
                }
              </div>
            }

            <p-paginator
              [rows]="10"
              [totalRecords]="totalItems()"
              [rowsPerPageOptions]="[10, 20, 30]"
              (onPageChange)="onPageChange($event)"
            />
          </div>
        }
      </div>
    </div>
  `,
})
export class UsersPageComponent {
  #store = inject(DataViewerStore);
  #dialogService = inject(DialogService);
  #router = inject(Router);
  dialogRef: DynamicDialogRef | undefined;
  featureFlags = inject(FeatureFlagsService);

  usersQuery = usersQuery.page(this.#store.requestOptions);
  users = computed(() => this.usersQuery.data()?.items || []);
  totalItems = computed(() => this.usersQuery.data()?.total || 0);
  isPlaceholderData = this.usersQuery.isPlaceholderData;
  prefetchNextPage = usersQuery.prefetchNextPage(this.#store.requestOptions);

  protected readonly columnDefs = columnDefs;
  theme = themeMaterial;
  searchQuery = '';

  showNewTable = toSignal(this.featureFlags.get('new_users_table'));

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
    this.dialogRef = this.#dialogService.open(AddUserModalComponent, {
      header: 'Add New User',
      width: '50vw',
      modal: true,
      dismissableMask: false,
      closeOnEscape: false,
      styleClass: 'p-dialog-custom',
      contentStyle: { overflow: 'visible' },
      baseZIndex: 10000,
    });
  }

  public onEditUser(user: User) {
    this.dialogRef = this.#dialogService.open(EditUserModalComponent, {
      header: 'Edit User',
      width: '600px',
      modal: true,
      dismissableMask: false,
      closeOnEscape: false,
      data: user,
    });
  }

  public onUserRowClicked(event: RowClickedEvent<User, any>) {
    if (event.data === undefined) return;
    this.onEditUser(event.data);
  }

  onPageChange(event: PaginatorState) {
    this.#store.setPage((event.page ?? 0) + 1);
  }

  onSearch(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.#store.setSearchQuery(value);
  }
}
