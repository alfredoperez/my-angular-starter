import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DevToolbarToolComponent } from '../../components';
import { DevToolbarIconComponent } from '../../components/icons';
import { DevToolbarStateService } from '../../dev-toolbar-state.service';

@Component({
  selector: 'ngx-toolbar-settings-app',
  standalone: true,
  imports: [DevToolbarToolComponent, DevToolbarIconComponent, FormsModule],
  template: `
    <ngx-dev-toolbar-tool
      [windowConfig]="windowConfig"
      title="Settings"
      icon="gear"
    >
      <hr />
      <div class="instruction">
        <div class="instruction--label">
          <span class="instruction--label-text">Theme</span>
          <span class="instruction--label-description"
            >Switch between light and dark mode</span
          >
        </div>
        <div class="instruction--control theme-buttons">
          <button
            class="theme-button"
            [class.active]="!state.isDarkTheme()"
            (click)="onThemeSelect('light')"
          >
            <ngx-dev-toolbar-icon name="sun" />
          </button>
          <button
            class="theme-button"
            [class.active]="state.isDarkTheme()"
            (click)="onThemeSelect('dark')"
          >
            <ngx-dev-toolbar-icon name="moon" />
          </button>
        </div>
      </div>
      <p>test</p>
    </ngx-dev-toolbar-tool>
  `,
  styleUrls: ['./settings-toolbar-app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsToolbarAppComponent {
  state = inject(DevToolbarStateService);
  badge = input<string | number>();
  windowConfig = {
    title: 'Settings',
    isClosable: true,
  };

  onThemeSelect(theme: 'light' | 'dark'): void {
    this.state.setTheme(theme);
  }
}
