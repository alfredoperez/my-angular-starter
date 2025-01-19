import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { User, usersQuery } from '@my/users/data';
import { ButtonComponent, ModalService } from '../../../shared/ui';

@Component({
    selector: 'ui-add-user-modal',
    imports: [CommonModule, ReactiveFormsModule, ButtonComponent],
    template: `
    <div class="flex flex-col p-8 bg-base-100" [formGroup]="usersFormGroup">
      <h1 class="mb-2 text-2xl font-semibold">Add a new user</h1>
      <p class="mb-6 text-sm text-gray-500">
        Here you can add a new user to the system
      </p>

      <div class="grid grid-cols-2 gap-6">
        <div class="col-span-2">
          <label class="block mb-1 text-sm font-medium text-gray-700" for="name"
            >Name</label
          >
          <input
            id="name"
            type="text"
            class="w-full input input-bordered input-primary"
            placeholder="Full Name"
            formControlName="name"
          />
        </div>

        <div>
          <label class="block mb-1 text-sm font-medium text-gray-700" for="age"
            >Age</label
          >
          <input
            id="age"
            type="number"
            class="w-full input input-bordered input-primary"
            placeholder="Age"
            formControlName="age"
          />
        </div>

        <div>
          <label
            class="block mb-1 text-sm font-medium text-gray-700"
            for="email"
            >Email</label
          >
          <input
            id="email"
            type="email"
            class="w-full input input-bordered input-primary"
            placeholder="Email Address"
            formControlName="email"
          />
        </div>
        <div class="col-span-2">
          <label
            class="block mb-1 text-sm font-medium text-gray-700"
            for="company"
            >Company</label
          >
          <input
            id="company"
            type="text"
            class="w-full input input-bordered input-primary"
            placeholder="Company Name"
            formControlName="company"
          />
        </div>

        <div>
          <label
            class="block mb-1 text-sm font-medium text-gray-700"
            for="title"
            >Title</label
          >
          <input
            id="title"
            type="text"
            class="w-full input input-bordered input-primary"
            placeholder="Job Title"
            formControlName="title"
          />
        </div>

        <div>
          <label
            class="block mb-1 text-sm font-medium text-gray-700"
            for="department"
            >Department</label
          >
          <input
            id="department"
            type="text"
            class="w-full input input-bordered input-primary"
            placeholder="Department"
            formControlName="department"
          />
        </div>
      </div>

      <div class="flex gap-2 justify-end mt-8">
        <a-button type="secondary" (click)="onCancel()">Cancel</a-button>
        <a-button [disabled]="!usersFormGroup.valid" (click)="onSaveUser()"
          >Save</a-button
        >
      </div>
    </div>
  `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddUserModalComponent {
  #modalService = inject(ModalService);
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
    this.#modalService.close();
    this.#modalService.close();
  }

  onCancel() {
    this.#modalService.close();
  }
}
