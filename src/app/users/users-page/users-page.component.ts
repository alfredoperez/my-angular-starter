import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject } from '@angular/core';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { Router } from '@angular/router';
import { AgGridModule } from 'ag-grid-angular';
import { RowClickedEvent, SortChangedEvent } from 'ag-grid-community';
import { ButtonComponent, DefaultOptions, ModalService } from '@my/shared/ui';
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
    MatPaginator,
    MatLabel,
    MatInput,
    MatFormField,
  ],
  providers: [DataViewerStore],
  template: `
    <div class="flex h-full flex-col gap-6">
      <div class="flex items-center justify-between gap-6">
        <h1 class="text-xl font-semibold">Users</h1>
        <ui-button type="primary" (click)="onAddUser()">Add User</ui-button>
      </div>
      <mat-form-field appearance="fill" style="width: 1000px">
        <mat-label>Search</mat-label>
        <input
          type="search"
          (change)="onSearch($event)"
          placeholder="Search for users"
          matInput
        />
        <!--        <mat-icon matSuffix>search</mat-icon>-->
      </mat-form-field>
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
              class="ag-theme-alpine border-round"
              [rowData]="users()"
              [columnDefs]="columnDefs"
              (rowClicked)="onRowClicked($event)"
              (sortChanged)="onSort($event)"
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
              (page)="onChangePage($event)"
            >
            </mat-paginator>
          </div>
        }
      </div>
    </div>
  `,
})
export class UsersPageComponent {
  store = inject(DataViewerStore);
  usersQuery = usersQuery.page(this.store.requestOptions);
  users = computed(() => this.usersQuery.data()?.items || []);
  totalItems = computed(() => this.usersQuery.data()?.total || 0);
  isPlaceholderData = this.usersQuery.isPlaceholderData;
  prefetchNextPage = usersQuery.prefetchNextPage(this.store.requestOptions);
  protected readonly columnDefs = columnDefs;
  #modalService = inject(ModalService);
  #router = inject(Router);

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
    this.#modalService.open(AddUserModalComponent, DefaultOptions);
  }

  public onRowClicked(event: RowClickedEvent<User>) {
    if (!event.data) {
      return;
    }
    this.#router.navigate(['/users', event.data.id]);
  }
  // handleCurrentPageChange(page: number) {
  //   this.store.setPage(page);
  // }

  onChangePage(pageEvent: PageEvent) {
    this.store.setPage(pageEvent.pageIndex);
  }

  onSort($event: SortChangedEvent) {}

  onSearch(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.store.setSearchQuery(value);
  }
}
