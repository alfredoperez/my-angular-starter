import { Component, computed, inject, input, output } from '@angular/core';
import { DevToolbarStateService } from '../../dev-toolbar-state.service';
import { DevToolbarOverlayComponent } from '../dev-toolbar-overlay/dev-toolbar-overlay.component';
import { WindowConfig } from './dev-toolbar-window.models';

@Component({
  selector: 'ngx-dev-toolbar-window',
  standalone: true,
  imports: [DevToolbarOverlayComponent],
  template: `
    <ngx-dev-toolbar-overlay [theme]="theme()">
      <div class="window">
        <div class="window__header">
          <h1 class="window__title">{{ config().title }}</h1>
          <div class="window__controls">
            @if (config().isMinimizable) {
              <button
                aria-label="Minimize"
                class="window__minimize"
                (click)="onMinimize()"
              >
                −
              </button>
            }
            @if (config().isMaximizable) {
              <button
                aria-label="Maximize"
                aria-label="Maximize"
                class="window__maximize"
                (click)="onMaximize()"
              >
                □
              </button>
            }
            @if (config().isClosable) {
              <button
                aria-label="Close"
                aria-label="Close"
                class="window__close"
                (click)="onClose()"
              >
                ×
              </button>
            }
          </div>
        </div>
        <div class="window__content">
          <ng-content></ng-content>
        </div>
      </div>
    </ngx-dev-toolbar-overlay>
  `,
  styleUrls: ['./dev-toolbar-window.component.scss'],
})
export class DevToolbarWindowComponent {
  readonly devToolbarStateService = inject(DevToolbarStateService);

  readonly config = input.required<WindowConfig>();

  readonly close = output<void>();
  readonly maximize = output<void>();
  readonly minimize = output<void>();

  readonly theme = computed(() => this.devToolbarStateService.theme());

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
