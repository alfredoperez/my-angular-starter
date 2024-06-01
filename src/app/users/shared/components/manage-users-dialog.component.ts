import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  signal,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { injectQueryClient } from '@tanstack/angular-query-experimental';
import { User, usersQuery } from '@my/users/data';


@Component({
  selector: 'manage-users-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div [formGroup]="usersFormGroup">
      <div class="flex flex-row justify-between items-center">
        <div class="flex flex-column gap-2 w-full">
          <label class="" for="name">Name</label>
          <input formControlName="name" />
        </div>
        <div class="flex flex-column gap-2 w-full">
          <label class="" for="age">Age</label>
          <!--          <p-inputNumber formControlName="age" />-->
        </div>
      </div>
      <div class="mt-4 flex justify-content-end gap-2">
        <button
          type="button"
          class="p-button-outlined p-button-secondary"
          label="Cancel"
        ></button>
        <button
          type="button"
          class=""
          [disabled]="!usersFormGroup.valid"
          (click)="onSaveUser()"
          label="Save"
        ></button>
      </div>
    </div>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ManageUsersDialogComponent implements OnInit {
  #queryClient = injectQueryClient();

  usersFormGroup = new FormGroup({
    name: new FormControl('', [Validators.required]),
    age: new FormControl('', [Validators.required]),
  });
  enabled?: boolean;

  #id = signal('');

  queryById = usersQuery.details(this.#id);

  //   effect(() => {
  //
  // });

  // usersApiService = inject(UsersApiService);

  // userMutation = injectMutation(() => ({
  //   mutationKey: ['createUser'],
  //   onSuccess: () => {
  //     this.#queryClient.invalidateQueries({ queryKey: ['users'] });
  //   },
  //   mutationFn: (user: User) => this.usersApiService.create(user),
  // }));

  public ngOnInit(): void {
    const id = '';

    // const dialogId = this.#dialogService.getInstance(this.#dialogRef).id;
    this.#id.set(id);
  }

  public onSaveUser() {
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
    // this.userMutation.mutate(user);

    // this.#dialogService.dialogComponentRefMap.forEach((dialog) =>
    //   dialog.destroy(),
    // );
  }
}
