import {
  ChangeDetectionStrategy,
  Component,
  input,
  model,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

export interface SelectOption {
  value: string;
  label: string;
}

@Component({
  selector: 'ndt-select',
  standalone: true,
  imports: [FormsModule],
  template: `
    <select
      class="select"
      [attr.aria-label]="ariaLabel()"
      [class.small]="size() === 'small'"
      [ngModel]="value()"
      (ngModelChange)="value.set($event)"
    >
      @for (option of options(); track option.value) {
        <option role="option" [value]="option.value">{{ option.label }}</option>
      }
    </select>
  `,
  styles: [
    `
      .select {
        width: 100%;
        cursor: pointer;
        min-width: 100px;
        display: flex;
        align-items: center;
        padding: var(--devtools-spacing-sm) var(--devtools-spacing-md);
        border: 1px solid var(--devtools-border-primary);
        border-radius: var(--devtools-border-radius-medium);
        background-color: var(--devtools-bg-primary);
        font-size: var(--devtools-font-size-md);
        gap: var(--devtools-spacing-xs);

        &.small {
          padding: var(--devtools-spacing-xs) var(--devtools-spacing-sm);
          font-size: var(--devtools-font-size-sm);
          height: 30px;
        }

        &:hover {
          background: var(--devtools-background-hover);
        }

        &:focus {
          outline: none;
          background: var(--devtools-background-hover);
        }

        option {
          background: var(--devtools-background-secondary);
          color: var(--devtools-text-primary);
          padding: var(--devtools-spacing-xs);
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DevToolbarSelectComponent {
  value = model<string>();
  options = input.required<SelectOption[]>();
  ariaLabel = input<string>('');
  label = input<string>('');
  size = input<'small' | 'medium'>('medium');
}
