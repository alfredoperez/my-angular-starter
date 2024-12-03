import { DatePipe, NgIf } from '@angular/common';
import { Component, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import { usersQuery } from '@my/users/data';

@Component({
  standalone: true,
  imports: [NgIf, DatePipe],

  template: `
    <div *ngIf="userQuery?.data() as user" class="p-6">
      <div class="flex items-center justify-between">
        <h1 class="mb-4 text-2xl font-bold">User Details</h1>
        <button
          class="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
          (click)="onGoBack()"
        >
          Go Back
        </button>
      </div>
      <div class="mt-6 overflow-hidden bg-white shadow sm:rounded-lg">
        <div class="flex items-center justify-between px-4 py-5 sm:px-6">
          <div>
            <h3 class="text-lg font-medium leading-6 text-gray-900">
              {{ user?.name }}
            </h3>
            <p class="mt-1 max-w-2xl text-sm text-gray-500">
              {{ user?.email }}
            </p>
          </div>
        </div>
        <div class="border-t border-gray-200">
          <dl>
            <div
              class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6"
            >
              <dt class="text-sm font-medium text-gray-500">ID</dt>
              <dd class="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                {{ user?.id }}
              </dd>
            </div>
            <div
              class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6"
            >
              <dt class="text-sm font-medium text-gray-500">Company</dt>
              <dd class="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                {{ user?.company }}
              </dd>
            </div>
            <div
              class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6"
            >
              <dt class="text-sm font-medium text-gray-500">Title</dt>
              <dd class="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                {{ user?.title }}
              </dd>
            </div>
            <div
              class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6"
            >
              <dt class="text-sm font-medium text-gray-500">Department</dt>
              <dd class="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                {{ user?.department }}
              </dd>
            </div>
            <div
              class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6"
            >
              <dt class="text-sm font-medium text-gray-500">Age</dt>
              <dd class="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                {{ user?.age }}
              </dd>
            </div>
            <div
              class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6"
            >
              <dt class="text-sm font-medium text-gray-500">Created At</dt>
              <dd class="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                {{ user?.createdAt | date: 'medium' }}
              </dd>
            </div>
            <div
              class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6"
            >
              <dt class="text-sm font-medium text-gray-500">Updated At</dt>
              <dd class="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                {{ user?.updatedAt | date: 'medium' }}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>

    @if (userQuery?.isLoading()) {
      <div class="flex h-64 items-center justify-center">
        <p>Loading user details...</p>
      </div>
    }
  `,
})
export class UserDetailPageComponent {
  id = input('');
  userQuery = usersQuery.details(this.id);
  #router = inject(Router);

  onGoBack(): void {
    this.#router.navigate(['/users']);
  }
}
