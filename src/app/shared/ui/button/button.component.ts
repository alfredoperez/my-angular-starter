import { NgClass } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { ButtonSize, ButtonType } from './button.models';

@Component({
  selector: 'ui-button',
  standalone: true,
  template: `
    <button
      class="btn"
      [ngClass]="{
        'btn-xs': size() === 'xs',
        'btn-sm': size() === 'sm',
        'btn-md': size() === 'md',
        'btn-lg': size() === 'lg',
        'btn-primary': type() === 'primary',
        'btn-secondary': type() === 'secondary',
        'btn-accent': type() === 'accent',
        'btn-ghost': type() === 'ghost',
        'btn-error': type() === 'error',
        'btn-success': type() === 'success',
        'btn-warning': type() === 'warning',
        'btn-info': type() === 'info'
      }"
      [disabled]="disabled()"
      (click)="handleClick()"
    >
      <ng-content />
    </button>
  `,
  imports: [NgClass],
})
export class ButtonComponent {
  size = input<ButtonSize>('md');
  type = input<ButtonType>('primary');
  disabled = input<boolean>(false);

  click = output();

  handleClick() {
    this.click.emit();
  }
}
