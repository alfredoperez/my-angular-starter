import { DatePipe } from '@angular/common';
import { Component, computed, inject, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';
import { usersQuery } from '@my/users/data';

@Component({
  imports: [
    DatePipe,
    MatButtonModule,
    MatCardModule,
    MatDividerModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="p-6">
      @if (isLoading()) {
        <div class="flex h-64 items-center justify-center">
          <mat-spinner diameter="40"></mat-spinner>
        </div>
      }
      @if (isSuccess()) {
        @let user = data();
        <mat-card>
          <mat-card-header>
            <mat-card-title class="flex items-center justify-between">
              <span>User Details</span>
              <button (click)="onGoBack()" mat-button>Go Back</button>
            </mat-card-title>
            <mat-card-subtitle>
              {{ user?.email }}
            </mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <div class="grid grid-cols-1 gap-4">
              <div class="grid grid-cols-3 gap-4 p-4">
                <span class="text-gray-500">ID</span>
                <span class="col-span-2">{{ user?.id }}</span>
              </div>
              <mat-divider></mat-divider>

              <div class="grid grid-cols-3 gap-4 p-4">
                <span class="text-gray-500">Company</span>
                <span class="col-span-2">{{ user?.company }}</span>
              </div>
              <mat-divider></mat-divider>

              <div class="grid grid-cols-3 gap-4 p-4">
                <span class="text-gray-500">Title</span>
                <span class="col-span-2">{{ user?.title }}</span>
              </div>
              <mat-divider></mat-divider>

              <div class="grid grid-cols-3 gap-4 p-4">
                <span class="text-gray-500">Department</span>
                <span class="col-span-2">{{ user?.department }}</span>
              </div>
              <mat-divider></mat-divider>

              <div class="grid grid-cols-3 gap-4 p-4">
                <span class="text-gray-500">Age</span>
                <span class="col-span-2">{{ user?.age }}</span>
              </div>
              <mat-divider></mat-divider>

              <div class="grid grid-cols-3 gap-4 p-4">
                <span class="text-gray-500">Created At</span>
                <span class="col-span-2">{{
                  user?.createdAt | date: 'medium'
                }}</span>
              </div>
              <mat-divider></mat-divider>

              <div class="grid grid-cols-3 gap-4 p-4">
                <span class="text-gray-500">Updated At</span>
                <span class="col-span-2">{{
                  user?.updatedAt | date: 'medium'
                }}</span>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
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
