import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ModalService } from '@my/ui';
import { User, usersQuery } from '@my/users/data';

@Component({
  selector: 'a-add-user-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="flex flex-col bg-white p-8" [formGroup]="usersFormGroup">
      <h1 class="text-2xl font-semibold">Add User</h1>
      <!--      <div class="mt-4 flex flex-col gap-4">-->
      <!--        <mat-form-field appearance="outline">-->
      <!--          <input-->
      <!--            type="text"-->
      <!--            class="w-full max-w-xs"-->
      <!--            matInput-->
      <!--            placeholder="Name"-->
      <!--            formControlName="name"-->
      <!--          />-->
      <!--        </mat-form-field>-->
      <!--        <mat-form-field appearance="outline">-->
      <!--          <input-->
      <!--            type="number"-->
      <!--            class="input-primary w-full max-w-xs"-->
      <!--            matInput-->
      <!--            placeholder="Age"-->
      <!--            formControlName="age"-->
      <!--          />-->
      <!--        </mat-form-field>-->
      <!--      </div>-->
      <!--      <div class=" mt-4 flex justify-end gap-2">-->
      <!--        <ui-button type="secondary" (click)="handleClose()">Cancel</ui-button>-->
      <!--        <ui-button [disabled]="!usersFormGroup.valid" (click)="handleSaveUser()"-->
      <!--          >Save</ui-button-->
      <!--        >-->
      <!--      </div>-->
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddUserModalComponent {
  addMutation = usersQuery.add();
  usersFormGroup = new FormGroup({
    name: new FormControl('', [Validators.required]),
    age: new FormControl('', [Validators.required]),
  });
  #modalService = inject(ModalService);

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
