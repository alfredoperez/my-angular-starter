import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ButtonComponent, ModalService } from '@my/shared/ui';
import { User, usersQuery } from '@my/users/data';

@Component({
  selector: 'ui-add-user-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonComponent],
  template: `
    <div class="flex flex-col bg-base-100  p-8 " [formGroup]="usersFormGroup">
      <h1 class="text-2xl font-semibold">Add User</h1>
      <div class="mt-4 flex flex-col gap-4">
        <input
          type="text"
          class="input input-bordered input-primary w-full max-w-xs"
          placeholder="Name"
          formControlName="name"
        />
        <input
          type="number"
          class="input input-bordered input-primary w-full max-w-xs"
          placeholder="Age"
          formControlName="age"
        />
      </div>
      <div class=" mt-4 flex justify-end gap-2">
        <ui-button type="secondary" (click)="handleClose()">Cancel</ui-button>
        <ui-button [disabled]="!usersFormGroup.valid" (click)="handleSaveUser()"
          >Save</ui-button
        >
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddUserModalComponent {
  #modalService = inject(ModalService);

  addMutation = usersQuery.add();
  usersFormGroup = new FormGroup({
    name: new FormControl('', [Validators.required]),
    age: new FormControl('', [Validators.required]),
  });

  public handleSaveUser() {
    if (this.usersFormGroup === undefined || this.usersFormGroup.invalid) {
      return;
    }

    const { name, age } = this.usersFormGroup.value;
    if (!name || !age) return;

    const user = {
      name,
      age,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as unknown as User;

    this.addMutation.mutate(user);

    this.handleClose();
  }

  handleClose() {
    this.#modalService.close();
  }
}
