import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, Signal, untracked } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { Router } from '@angular/router';
import { QueryObserverResult } from '@ngneat/query';
import { Observable } from 'rxjs';
import { User, UsersRepository } from '@my/users/data';
import { AddUserModalComponent } from '@my/users/shared/components/add-user-modal.component';
import { EditUserModalComponent } from '@my/users/shared/components/edit-user-modal.component';
import { columnDefs } from '@my/users/users-page/user-page.models';
import { FeatureFlagsService } from '../../shared/data/feature-flags/feature-flags.service';
import { ListResponse } from '../../shared/data/api.models';
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
        @if (usersQuery.result().isPending) {
          <div class="flex justify-center p-4">
            <p-progressSpinner
              styleClass="w-12 h-12"
              strokeWidth="4"
              animationDuration=".5s"
            />
          </div>
        }
        @if (usersQuery.result().isError) {
          <div class="flex items-center gap-2 text-red-500">
            <i class="pi pi-exclamation-circle"></i>
            <span>An error occurred while loading users</span>
          </div>
        }
        @if (usersQuery.result().isSuccess) {
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
  #usersRepo = inject(UsersRepository);
  dialogRef: DynamicDialogRef | undefined;
  featureFlags = inject(FeatureFlagsService);

  // Initialize query with signal - field initialization
  usersQuery = this.#usersRepo.fetchPage(this.#store.requestOptions);

  users = computed(() => this.usersQuery.result().data?.items || []);
  totalItems = computed(() => this.usersQuery.result().data?.total || 0);
  isPlaceholderData = computed(() => this.usersQuery.result().isPlaceholderData ?? false);

  protected readonly columnDefs = columnDefs;

  searchQuery = '';

  showNewTable = toSignal(this.featureFlags.get('new_users_table'));

  constructor() {
    // Setup reactivity in constructor - has injection context
    this.usersQuery.setupReactivity();

    // Prefetch next page when data is ready
    effect(() => {
      const result = this.usersQuery.result();
      if (!result.isPlaceholderData && result.data?.hasMore) {
        this.#usersRepo.prefetchNextPage(this.#store.requestOptions);
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
