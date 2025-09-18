import { DatePipe } from '@angular/common';
import { Component, computed, inject, input } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { Router } from '@angular/router';
import { usersQuery } from '@my/users/data';

@Component({
  standalone: true,
  imports: [
    DatePipe,
    ButtonModule,
    CardModule,
    DividerModule,
    ProgressSpinnerModule,
  ],
  template: `
    <div class="p-6">
      @if (isLoading()) {
        <div class="flex h-64 items-center justify-center">
          <p-progressSpinner
            styleClass="w-12 h-12"
            strokeWidth="4"
            animationDuration=".5s"
          />
        </div>
      }
      @if (isSuccess()) {
        @let user = data();
        <p-card>
          <ng-template pTemplate="header">
            <div class="flex items-center justify-between p-4">
              <div>
                <h2 class="text-xl font-semibold">User Details</h2>
                <p class="text-sm text-gray-500">{{ user?.email }}</p>
              </div>
              <p-button
                label="Go Back"
                icon="pi pi-arrow-left"
                [outlined]="true"
                (onClick)="onGoBack()"
              />
            </div>
          </ng-template>
          <div class="grid grid-cols-1 gap-4">
            <div class="grid grid-cols-3 gap-4 p-4">
              <span class="text-gray-500">ID</span>
              <span class="col-span-2">{{ user?.id }}</span>
            </div>
            <p-divider />

            <div class="grid grid-cols-3 gap-4 p-4">
              <span class="text-gray-500">Company</span>
              <span class="col-span-2">{{ user?.company }}</span>
            </div>
            <p-divider />

            <div class="grid grid-cols-3 gap-4 p-4">
              <span class="text-gray-500">Title</span>
              <span class="col-span-2">{{ user?.title }}</span>
            </div>
            <p-divider />

            <div class="grid grid-cols-3 gap-4 p-4">
              <span class="text-gray-500">Department</span>
              <span class="col-span-2">{{ user?.department }}</span>
            </div>
            <p-divider />

            <div class="grid grid-cols-3 gap-4 p-4">
              <span class="text-gray-500">Age</span>
              <span class="col-span-2">{{ user?.age }}</span>
            </div>
            <p-divider />

            <div class="grid grid-cols-3 gap-4 p-4">
              <span class="text-gray-500">Created At</span>
              <span class="col-span-2">{{
                user?.createdAt | date: 'medium'
              }}</span>
            </div>
            <p-divider />

            <div class="grid grid-cols-3 gap-4 p-4">
              <span class="text-gray-500">Updated At</span>
              <span class="col-span-2">{{
                user?.updatedAt | date: 'medium'
              }}</span>
            </div>
          </div>
        </p-card>
      }
    </div>
  `,
})
export class UserDetailPageComponent {
  id = input.required<string>();
  userQuery = usersQuery.details(this.id);
  status = computed(() => this.userQuery?.status());
  isLoading = computed(() => this.userQuery?.isLoading());
  isSuccess = computed(() => this.userQuery?.isSuccess());
  data = computed(() => this.userQuery?.data());

  #router = inject(Router);

  onGoBack(): void {
    this.#router.navigate(['/users']);
  }
}
