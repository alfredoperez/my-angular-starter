import { Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'ui-button',
  standalone: true,
  template: `
    <button
      mat-stroked-button
      [color]="color()"
      [disabled]="disabled()"
      (click)="onClick()"
    >
      <ng-content></ng-content>
    </button>
  `,
  imports: [MatButtonModule]
})
export class ButtonComponent {

  color = input<	'primary'| 'secondary'| 'tertiary'| 'error'>('primary');
  disabled = input<boolean>(false);
  click = output();

  onClick() {
    this.click.emit();
  }
}
