import { Component, input, output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import {
  ButtonIconPosition,
  ButtonSize,
  ButtonType,
  TooltipPosition,
} from './button.models';

@Component({
  standalone: true,
  selector: 'a-button',
  template: `
    <p-button
      [severity]="type()"
      [size]="size()"
      [disabled]="disabled()"
      [label]="label()"
      [icon]="icon()"
      [iconPos]="iconPos()"
      [ariaLabel]="ariaLabel()"
      [pTooltip]="tooltip()"
      [tooltipPosition]="tooltipPosition()"
      (onClick)="onClick($event)"
      (onFocus)="onFocus($event)"
      (onBlur)="onBlur($event)"
      pRipple
    >
    </p-button>
  `,
  imports: [ButtonModule, TooltipModule],
})
export class ButtonComponent {
  /** Button severity type that defines its visual style */
  type = input<ButtonType>('primary');

  /** Size of the button */
  size = input<ButtonSize>(undefined);

  /** Whether the button is disabled */
  disabled = input<boolean>(false);

  /** Text to display inside the button */
  label = input<string>();

  /** Icon to display in the button */
  icon = input<string>();

  /** Position of the icon relative to the label */
  iconPos = input<ButtonIconPosition>('left');

  /** Accessibility label for screen readers */
  ariaLabel = input<string>();

  /** Tooltip text to display on hover */
  tooltip = input<string>();

  /** Position where the tooltip should appear */
  tooltipPosition = input<TooltipPosition>('bottom');

  /** Emits when the button is clicked */
  click = output<Event>();

  /** Emits when the button receives focus */
  focus = output<Event>();

  /** Emits when the button loses focus */
  blur = output<Event>();

  onClick(event: Event) {
    this.click.emit(event);
  }

  onFocus(event: Event) {
    this.focus.emit(event);
  }

  onBlur(event: Event) {
    this.blur.emit(event);
  }
}
