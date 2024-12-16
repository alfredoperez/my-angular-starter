import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { fromEvent } from 'rxjs';
import { filter } from 'rxjs/operators';
import { DevToolbarIconComponent } from './components/icons/icon.component';
import { DevToolbarToolButtonComponent } from './components/tool-button/tool-button.component';
import { DevToolbarStateService } from './dev-toolbar-state.service';
import { DevToolbarFeatureFlagsToolComponent } from './tools/feature-flags-tool/feature-flags-tool.component';
import { DevToolbarSettingsToolComponent } from './tools/settings-tool/settings-tool.component';

@Component({
  standalone: true,
  selector: 'ngx-dev-toolbar',
  styleUrls: ['./dev-toolbar.component.scss'],
  imports: [
    DevToolbarToolButtonComponent,
    DevToolbarFeatureFlagsToolComponent,
    DevToolbarSettingsToolComponent,
    DevToolbarIconComponent,
  ],

  template: `
    <div
      aria-label="Developer tools"
      role="toolbar"
      class="dev-toolbar"
      [@toolbarState]="isVisible() ? 'visible' : 'hidden'"
      [attr.data-theme]="theme()"
      [class.dev-toolbar--active]="isVisible()"
      (mouseenter)="onMouseEnter()"
      (mouseleave)="onMouseLeave()"
      (keydown.escape)="onEscape()"
    >
      <ndt-tool-button title="Home" toolId="ndt-home">
        <ndt-icon name="angular" />
      </ndt-tool-button>
      <ndt-tool-button title="Performance" toolId="ndt-performance">
        <ndt-icon name="gauge" />
      </ndt-tool-button>
      <ndt-feature-flags-tool />
      <ndt-settings-tool />
    </div>
  `,
  animations: [
    trigger('toolbarState', [
      state(
        'hidden',
        style({
          transform: 'translate(-50%, calc(100% + -1.2rem))',
        }),
      ),
      state(
        'visible',
        style({
          transform: 'translate(-50%, -1rem)',
        }),
      ),
      transition('hidden <=> visible', [
        animate('300ms cubic-bezier(0.4, 0, 0.2, 1)'),
      ]),
    ]),
  ],
})
export class DevToolbarComponent {
  state = inject(DevToolbarStateService);
  destroyRef = inject(DestroyRef);
  isVisible = this.state.isVisible;

  theme = this.state.theme;
  private hideDelay = 115000;

  constructor() {
    fromEvent<KeyboardEvent>(window, 'keydown')
      .pipe(
        filter((event) => event.ctrlKey && event.shiftKey && event.key === 'D'),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => this.toggleDevTools());
  }

  onMouseEnter(): void {
    this.state.setVisibility(true);
  }

  onMouseLeave(): void {
    setTimeout(() => this.state.setVisibility(false), this.hideDelay);
  }

  onEscape(): void {
    this.state.setVisibility(false);
  }

  private toggleDevTools(): void {
    this.state.setVisibility(!this.isVisible());
  }
}
