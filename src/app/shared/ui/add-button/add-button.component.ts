import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'ui-add-button',
  standalone: true,
  imports: [ButtonModule],
  template: `
    <p-button
      [label]="label()"
      [icon]="'pi ' + icon()"
      severity="primary"
      (onClick)="onAddClick()"
    />
  `,
  styles: [`
    :host {
      display: inline-block;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddButtonComponent {
  label = input<string>('Add');
  icon = input<string>('pi-plus');

  addClick = output<void>();

  onAddClick() {
    this.addClick.emit();
  }
}