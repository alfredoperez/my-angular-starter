import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ButtonComponent, ModalService } from '@my/shared/ui';
import { User, usersQuery } from '@my/users/data';

@Component({
  selector: 'ui-edit-user-modal',
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
      <div class="mt-4 flex justify-between">
        <ui-button type="error" (click)="handleDelete()">Delete</ui-button>
        <div class="flex justify-end gap-2">
          <ui-button type="secondary" (click)="handleClose()">Cancel</ui-button>
          <ui-button
            [disabled]="!usersFormGroup.valid"
            (click)="handleSaveUser()"
            >Save</ui-button
          >
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditUserModalComponent implements OnInit {
  modalService = inject(ModalService);

  #user = signal({} as User);

  updateMutation = usersQuery.update(this.#user);
  deleteMutation = usersQuery.delete(this.#user);

  usersFormGroup = new FormGroup({
    name: new FormControl('', [Validators.required]),
    age: new FormControl(0, [Validators.required]),
  });

  public ngOnInit(): void {
    const user = this.modalService.options?.data?.['item'] as User;

    this.#user.set(user);
    const { name, age } = user;
    this.usersFormGroup.setValue({ name, age });
  }

  public handleSaveUser() {
    if (this.usersFormGroup === undefined || this.usersFormGroup.invalid) {
      return;
    }

    const { name, age } = this.usersFormGroup.value;
    if (!name || !age) return;

    const user = {
      ...this.#user(),
      name,
      age,
      updatedAt: new Date(),
    } as unknown as User;

    this.#user.set(user);
    this.updateMutation.mutate();

    this.handleClose();
  }

  handleClose() {
    this.modalService.close();
  }

  handleDelete() {
    this.deleteMutation.mutate();
    this.handleClose();
  }
}
