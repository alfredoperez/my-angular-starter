import { NgClass } from '@angular/common';
import { Component, computed, input, output } from '@angular/core';
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

  buttonClass = computed(() => {
    var className = 'btn';
    const size = this.size();
    const type = this.type();

    if (size !== 'md') {
      className += ` btn-${size} `;
    }
    className += ` btn-${type} `;

    return className;
  });

  click = output();

  handleClick() {
    this.click.emit;
  }
}
