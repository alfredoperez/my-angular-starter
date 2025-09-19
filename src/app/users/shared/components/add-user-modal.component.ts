import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { User, usersQuery } from '@my/users/data';

@Component({
  selector: 'app-add-user-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    InputNumberModule,
  ],
  template: `
    <div class="flex flex-col" [formGroup]="usersFormGroup">
      <p class="mb-4 text-sm text-gray-600">
        Fill in the details below to add a new user to the system.
      </p>

      <div class="grid grid-cols-2 gap-4">
        <div class="col-span-2">
          <label for="name" class="block text-sm font-medium mb-2">Name</label>
          <input
            id="name"
            type="text"
            pInputText
            formControlName="name"
            placeholder="Full Name"
            class="w-full"
          />
        </div>

        <div>
          <label for="age" class="block text-sm font-medium mb-2">Age</label>
          <p-inputNumber
            id="age"
            formControlName="age"
            placeholder="Age"
            [min]="18"
            [max]="120"
            class="w-full"
            styleClass="w-full"
          />
        </div>

        <div>
          <label for="email" class="block text-sm font-medium mb-2">Email</label>
          <input
            id="email"
            type="email"
            pInputText
            formControlName="email"
            placeholder="Email Address"
            class="w-full"
          />
        </div>

        <div class="col-span-2">
          <label for="company" class="block text-sm font-medium mb-2">Company</label>
          <input
            id="company"
            type="text"
            pInputText
            formControlName="company"
            placeholder="Company Name"
            class="w-full"
          />
        </div>

        <div>
          <label for="title" class="block text-sm font-medium mb-2">Title</label>
          <input
            id="title"
            type="text"
            pInputText
            formControlName="title"
            placeholder="Job Title"
            class="w-full"
          />
        </div>

        <div>
          <label for="department" class="block text-sm font-medium mb-2">Department</label>
          <input
            id="department"
            type="text"
            pInputText
            formControlName="department"
            placeholder="Department"
            class="w-full"
          />
        </div>
      </div>

      <div class="mt-6 flex justify-between">
        <p-button
          label="Cancel"
          severity="secondary"
          [outlined]="true"
          size="small"
          (onClick)="onCancel()"
        />
        <p-button
          label="Save"
          [disabled]="!usersFormGroup.valid"
          size="small"
          (onClick)="onSaveUser()"
        />
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddUserModalComponent {
  #fb = new FormBuilder();


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
    this.dialogRef.close();
  }

  constructor(private dialogRef: DynamicDialogRef) {}

  onCancel() {
    this.dialogRef.close();
  }
}
