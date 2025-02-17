import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';
import { AgGridModule } from 'ag-grid-angular';
import { RowClickedEvent, themeQuartz } from 'ag-grid-community';
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
    MatButtonModule,
    MatCardModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    FormsModule,
  ],
  providers: [DataViewerStore],
  template: `
    <div class="flex h-full flex-col gap-6">
      <div class="flex items-center justify-between gap-6">
        <h1 class="text-xl font-semibold">Users</h1>
        <button (click)="onAddUser()" mat-stroked-button icon="add">
          Add User
        </button>
      </div>

      <mat-form-field class="w-full">
        <mat-icon matPrefix>search</mat-icon>
        <input
          type="text"
          (input)="onSearch($event)"
          matInput
          placeholder="Search users..."
        />
      </mat-form-field>

      <div>
        @if (usersQuery.isPending()) {
          <div class="flex justify-center p-4">
            <mat-spinner diameter="40"></mat-spinner>
          </div>
        }
        @if (usersQuery.isError()) {
          <div class="text-red-500">
            <mat-icon>error</mat-icon>
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
                  <mat-card
                    class="cursor-pointer hover:bg-gray-50"
                    (click)="onEditUser(user)"
                  >
                    <mat-card-content>
                      <div class="font-medium">{{ user.name }}</div>
                      <div class="text-sm text-gray-600">{{ user.email }}</div>
                    </mat-card-content>
                  </mat-card>
                }
              </div>
            }

            <mat-paginator
              aria-label="Select page of users"
              [length]="totalItems()"
              [pageSize]="10"
              [pageSizeOptions]="[10, 20, 30]"
              (page)="onPageChange($event)"
            >
            </mat-paginator>
          </div>
        }
      </div>
    </div>
  `,
})
export class UsersPageComponent {
  #store = inject(DataViewerStore);
  #dialog = inject(MatDialog);
  #router = inject(Router);
  featureFlags = inject(FeatureFlagsService);

  usersQuery = usersQuery.page(this.#store.requestOptions);
  users = computed(() => this.usersQuery.data()?.items || []);
  totalItems = computed(() => this.usersQuery.data()?.total || 0);
  isPlaceholderData = this.usersQuery.isPlaceholderData;
  prefetchNextPage = usersQuery.prefetchNextPage(this.#store.requestOptions);

  protected readonly columnDefs = columnDefs;
  theme = themeQuartz;
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
    this.#dialog.open(AddUserModalComponent, {
      width: '600px',
      disableClose: true,
    });
  }

  public onEditUser(user: User) {
    this.#dialog.open(EditUserModalComponent, {
      width: '600px',
      disableClose: true,
      data: user,
    });
  }

  public onUserRowClicked(event: RowClickedEvent<User, any>) {
    if (event.data === undefined) return;
    this.onEditUser(event.data);
  }

  onPageChange(event: any) {
    this.#store.setPage(event.pageIndex + 1);
  }

  onSearch(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.#store.setSearchQuery(value);
  }
}
