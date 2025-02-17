import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { User, usersQuery } from '@my/users/data';

@Component({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  template: `
    <div class="bg-base-100 flex flex-col p-8" [formGroup]="usersFormGroup">
      <h1 class="mb-2 text-2xl font-semibold">Add a new user</h1>
      <p class="mb-6 text-sm text-gray-500">
        Here you can add a new user to the system
      </p>

      <div class="grid grid-cols-2 gap-6">
        <div class="col-span-2">
          <mat-form-field class="w-full">
            <mat-label>Name</mat-label>
            <input matInput formControlName="name" placeholder="Full Name" />
          </mat-form-field>
        </div>

        <div>
          <mat-form-field class="w-full">
            <mat-label>Age</mat-label>
            <input
              type="number"
              matInput
              formControlName="age"
              placeholder="Age"
            />
          </mat-form-field>
        </div>

        <div>
          <mat-form-field class="w-full">
            <mat-label>Email</mat-label>
            <input
              type="email"
              matInput
              formControlName="email"
              placeholder="Email Address"
            />
          </mat-form-field>
        </div>

        <div class="col-span-2">
          <mat-form-field class="w-full">
            <mat-label>Company</mat-label>
            <input
              matInput
              formControlName="company"
              placeholder="Company Name"
            />
          </mat-form-field>
        </div>

        <div>
          <mat-form-field class="w-full">
            <mat-label>Title</mat-label>
            <input matInput formControlName="title" placeholder="Job Title" />
          </mat-form-field>
        </div>

        <div>
          <mat-form-field class="w-full">
            <mat-label>Department</mat-label>
            <input
              matInput
              formControlName="department"
              placeholder="Department"
            />
          </mat-form-field>
        </div>
      </div>

      <div class="mt-8 flex justify-end gap-2">
        <button type="secondary" (click)="onCancel()" mat-stroked-button>
          Cancel
        </button>
        <button
          [disabled]="!usersFormGroup.valid"
          (click)="onSaveUser()"
          mat-stroked-button
          color="primary"
        >
          Save
        </button>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddUserModalComponent {
  #dialogRef = inject(MatDialogRef);
  #fb = inject(FormBuilder);

  addMutation = usersQuery.add();

  usersFormGroup = this.#fb.group({
    name: ['', [Validators.required]],
    age: ['', [Validators.required, Validators.min(18), Validators.max(120)]],
    email: ['', [Validators.required, Validators.email]],
    company: ['', [Validators.required]],
    title: ['', [Validators.required]],
    department: ['', [Validators.required]],
  });

  public onSaveUser() {
    if (this.usersFormGroup === undefined || this.usersFormGroup.invalid) {
      return;
    }

    const { name, age, email, company, title, department } =
      this.usersFormGroup.value;
    if (!name || !age || !email || !company || !title || !department) return;

    const user = {
      name,
      age,
      email,
      company,
      title,
      department,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as unknown as User;

    this.addMutation.mutate(user);
    this.#dialogRef.close();
  }

  onCancel() {
    this.#dialogRef.close();
  }
}
