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
import { User, usersQuery } from '@my/users/data';
import { AddUserModalComponent } from '@my/users/shared/components/add-user-modal.component';
import { EditUserModalComponent } from '@my/users/shared/components/edit-user-modal.component';
import { columnDefs } from '@my/users/users-page/user-page.models';
import { FeatureFlagsService } from '../../shared/data/feature-flags/feature-flags.service';
import { DataViewerStore } from '../../shared/state';
import {
  TableComponent,
  TableRowClickEvent,
  PageTitleComponent,
  SearchInputComponent,
  AddButtonComponent
} from '../../shared/ui';

@Component({
  imports: [
    CommonModule,
    TableComponent,
    PageTitleComponent,
    SearchInputComponent,
    AddButtonComponent,
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
      <div class="flex items-center justify-between">
        <ui-page-title
          title="Users"
        />

        <div class="flex items-center gap-3">
          <ui-search-input
            placeholder="Search users..."
            (searchChange)="onSearchChange($event)"
          />

          <ui-add-button
            label="Add User"
            icon="pi-user-plus"
            (addClick)="onAddUser()"
          />
        </div>
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
              <ui-table
                [rows]="users()"
                [columns]="columnDefs"
                (rowClick)="onUserRowClicked($event)"
                style="width: 100%; height: calc(100vh - 300px); min-height: 400px"
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

  public onUserRowClicked(event: TableRowClickEvent<User>) {
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

  onSearchChange(value: string) {
    this.#store.setSearchQuery(value);
  }
}
