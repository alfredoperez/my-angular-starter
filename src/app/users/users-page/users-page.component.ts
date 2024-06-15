import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AgGridModule } from 'ag-grid-angular';
import { ColDef, RowClickedEvent } from 'ag-grid-community';
import { RequestOptions } from '@my/shared/data';
import {
  ButtonComponent,
  DefaultOptions,
  ModalService,
  PaginationComponent,
} from '@my/shared/ui';
import { User, usersQuery } from '@my/users/data';
import { AddUserModalComponent } from '@my/users/shared/components/add-user-modal.component';

function dateFormatter(params: { value: string }) {
  return new Date(params.value).toLocaleDateString();
}
@Component({
  standalone: true,
  imports: [CommonModule, AgGridModule, ButtonComponent, PaginationComponent],
  template: `
    <div class="flex h-full flex-col gap-6">
      <div class="flex  items-center justify-between gap-6">
        <h1 class="text-2xl font-semibold">Users</h1>
        <ui-button type="primary" (click)="addUser()">Add User</ui-button>
      </div>
      <div class="">
        @if (usersPageQuery.isPending()) {
          <p>Loading...</p>
        } @else if (usersPageQuery.isError()) {
          <span> Error</span>
        } @else {
          <div>
            <ag-grid-angular
              class="ag-theme-alpine border-round "
              [rowData]="usersPageQuery.data()?.items"
              [columnDefs]="columnDefs"
              (rowClicked)="handleRowClicked($event)"
              style="width: 1000px; height: 400px;"
            />
            <ui-pagination
              [totalItems]="usersPageQuery.data()?.total || 0"
              (currentPageChange)="handleCurrentPageChange($event)"
            />
          </div>
        }
      </div>
    </div>
  `,
})
export class UsersPageComponent {
  #modalService = inject(ModalService);
  #router = inject(Router);
  columnDefs: Array<ColDef> = [
    { field: 'name' },
    { field: 'age' },
    { field: 'createdAt', valueFormatter: dateFormatter },
    { field: 'email' },
    { field: 'company' },
    { field: 'title' },
    { field: 'updatedAt', valueFormatter: dateFormatter },
  ];

  currentPage = signal(1);

  usersRequestOptions = computed(() => {
    return {
      pagination: {
        limit: 20,
        page: this.currentPage(),
      },
      orderBy: 'age',
      orderDirection: 'ASC',
    } as RequestOptions;
  });

  usersPageQuery = usersQuery.page(this.usersRequestOptions);

  public addUser() {
    this.#modalService.open(AddUserModalComponent, DefaultOptions);
  }

  public handleRowClicked(event: RowClickedEvent<User>) {
    if (!event.data) {
      return;
    }

    this.#router.navigate(['/users', event.data.id]);

    // this.#modalService.open(EditUserModalComponent, {
    //   ...DefaultOptions,
    //   data: { item: event.data },
    // });
  }

  handleCurrentPageChange(page: number) {
    this.currentPage.set(page);
  }
}
