import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { User, UsersRepository } from '@my/users/data';

@Component({
  selector: 'ui-edit-user-modal',
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
    <div class="flex flex-col p-6" [formGroup]="usersFormGroup">
      <h2 class="mb-2 text-2xl font-semibold">Edit User</h2>
      <div class="mt-4 flex flex-col gap-4">
        <div>
          <label for="edit-name" class="block text-sm font-medium mb-2">Name</label>
          <input
            id="edit-name"
            type="text"
            pInputText
            formControlName="name"
            placeholder="Full Name"
            class="w-full"
          />
        </div>

        <div>
          <label for="edit-age" class="block text-sm font-medium mb-2">Age</label>
          <p-inputNumber
            id="edit-age"
            formControlName="age"
            placeholder="Age"
            [min]="18"
            [max]="120"
            class="w-full"
            styleClass="w-full"
          />
        </div>
      </div>
      <div class="mt-6 flex justify-between">
        <p-button
          label="Delete"
          severity="danger"
          [outlined]="true"
          (onClick)="handleDelete()"
        />
        <div class="flex justify-end gap-2">
          <p-button
            label="Cancel"
            severity="secondary"
            [outlined]="true"
            (onClick)="handleClose()"
          />
          <p-button
            label="Save"
            [disabled]="!usersFormGroup.valid"
            (onClick)="handleSaveUser()"
          />
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditUserModalComponent implements OnInit {
  #usersRepo = inject(UsersRepository);
  #dialogRef = inject(DynamicDialogRef);
  #config = inject(DynamicDialogConfig);

  usersFormGroup = new FormGroup({
    name: new FormControl('', [Validators.required]),
    age: new FormControl(0, [Validators.required]),
  });

  #user!: User;
  updateMutation = this.#usersRepo.update();
  deleteMutation = this.#usersRepo.delete();

  public ngOnInit(): void {
    this.#user = this.#config.data as User;
    const { name, age } = this.#user;
    this.usersFormGroup.setValue({ name, age });
  }

  public handleSaveUser() {
    if (this.usersFormGroup === undefined || this.usersFormGroup.invalid) {
      return;
    }

    const { name, age } = this.usersFormGroup.value;
    if (!name || !age) return;

    this.updateMutation.mutate({
      id: this.#user.id,
      data: { name, age }
    });

    this.handleClose();
  }

  handleClose() {
    this.#dialogRef.close();
  }

  handleDelete() {
    this.deleteMutation.mutate(this.#user.id);
    this.handleClose();
  }
}
