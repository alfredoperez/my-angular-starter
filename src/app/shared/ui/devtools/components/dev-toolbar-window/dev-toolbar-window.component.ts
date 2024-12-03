import { CommonModule } from '@angular/common';
import { Component, computed, input, output } from '@angular/core';
import { WindowPlacement } from './dev-toolbar-window.models';

@Component({
  selector: 'ngx-dev-toolbar-window',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="window" [class]="placementClass()">
      <div class="window__header">
        <h1 class="window__title">{{ title() }}</h1>
        <div class="window__controls">
          <button
            *ngIf="isMinimizable()"
            aria-label="Minimize"
            class="window__control window__control--minimize"
            (click)="onMinimize()"
          >
            −
          </button>
          <button
            *ngIf="isMaximizable()"
            aria-label="Maximize"
            class="window__control window__control--maximize"
            (click)="onMaximize()"
          >
            □
          </button>
          <button
            *ngIf="isClosable()"
            aria-label="Close"
            class="window__control window__control--close"
            (click)="onClose()"
          >
            ×
          </button>
        </div>
      </div>
      <div class="window__content">
        <ng-content></ng-content>
      </div>
    </div>
  `,
  styleUrls: ['./dev-toolbar-window.component.scss'],
})
export class DevToolbarWindowComponent {
  readonly title = input.required<string>();
  readonly placement = input<WindowPlacement>('bottom-right');
  readonly isClosable = input<boolean>(true);
  readonly isMaximizable = input<boolean>(false);
  readonly isMinimizable = input<boolean>(false);

  readonly close = output<void>();
  readonly maximize = output<void>();
  readonly minimize = output<void>();

  protected readonly placementClass = computed(
    () => `window--${this.placement()}`,
  );

  protected onClose(): void {
    this.close.emit();
  }

  protected onMaximize(): void {
    this.maximize.emit();
  }

  protected onMinimize(): void {
    this.minimize.emit();
  }
}
