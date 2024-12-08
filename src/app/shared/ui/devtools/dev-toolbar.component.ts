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
import { DevToolbarButtonComponent } from './components';
import { DevToolbarIconComponent } from './components/icons';
import { DevToolbarStateService } from './dev-toolbar-state.service';
import { SettingsToolbarAppComponent } from './tools/settings-toolbar-app/settings-toolbar-app.component';

@Component({
  standalone: true,
  selector: 'ngx-dev-toolbar',
  styleUrls: ['./dev-toolbar.component.scss'],
  imports: [
    DevToolbarButtonComponent,
    SettingsToolbarAppComponent,
    DevToolbarButtonComponent,
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
      <ngx-toolbar-settings-app title="Settings" />

      <ngx-dev-toolbar-button title="Home">
        <ngx-dev-toolbar-icon name="angular" />
      </ngx-dev-toolbar-button>
      <ngx-dev-toolbar-button
        aria-label="Performance metrics"
        title="Performance"
      >
        <ngx-dev-toolbar-icon name="gauge" />
      </ngx-dev-toolbar-button>

      <ngx-toolbar-settings-app title="Settings" />
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

  private hideDelay = 115000;
  theme = this.state.theme;
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
