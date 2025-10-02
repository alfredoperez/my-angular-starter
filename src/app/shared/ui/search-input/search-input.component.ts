import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'ui-search-input',
  standalone: true,
  imports: [FormsModule, IconFieldModule, InputIconModule, InputTextModule],
  template: `
    <div class="flex items-center">
      <p-iconfield>
        <p-inputicon
          class="pi pi-search text-surface-700 dark:text-surface-100"
        ></p-inputicon>
        <input
          type="text"
          [placeholder]="placeholder()"
          [value]="value()"
          (input)="onSearchChange($event)"
          pInputText
        />
      </p-iconfield>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchInputComponent {
  placeholder = input<string>('Search');
  value = input<string>('');

  searchChange = output<string>();

  onSearchChange(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.searchChange.emit(value);
  }
}
