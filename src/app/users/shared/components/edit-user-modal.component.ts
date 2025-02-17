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
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { User, usersQuery } from '@my/users/data';

@Component({
  selector: 'ui-edit-user-modal',
  standalone: true,
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
      <h1 class="text-2xl font-semibold">Edit User</h1>
      <div class="mt-4 flex flex-col gap-4">
        <mat-form-field class="w-full">
          <mat-label>Name</mat-label>
          <input matInput formControlName="name" placeholder="Full Name" />
        </mat-form-field>

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
      <div class="mt-4 flex justify-between">
        <button type="danger" (click)="handleDelete()" mat-stroked-button>
          Delete
        </button>
        <div class="flex justify-end gap-2">
          <button type="secondary" (click)="handleClose()" mat-stroked-button>
            Cancel
          </button>
          <button
            [disabled]="!usersFormGroup.valid"
            (click)="handleSaveUser()"
            mat-stroked-button
          >
            Save
          </button>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditUserModalComponent implements OnInit {
  #dialogRef = inject(MatDialogRef);
  usersFormGroup = new FormGroup({
    name: new FormControl('', [Validators.required]),
    age: new FormControl(0, [Validators.required]),
  });
  #user = signal({} as User);
  updateMutation = usersQuery.update(this.#user);
  deleteMutation = usersQuery.delete(this.#user);

  public ngOnInit(): void {
    const user = this.#dialogRef.componentInstance?.data?.['item'] as User;

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
    this.#dialogRef.close();
  }

  handleDelete() {
    this.deleteMutation.mutate();
    this.handleClose();
  }
}
