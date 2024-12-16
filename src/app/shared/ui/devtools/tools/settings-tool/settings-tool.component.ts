import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DevToolbarToolComponent } from '../../components';
import { DevToolbarButtonComponent } from '../../components/button/button.component';
import { WindowConfig } from '../../components/dev-toolbar-window/dev-toolbar-window.models';
import { DevToolbarStateService } from '../../dev-toolbar-state.service';

type ThemeType = 'light' | 'dark';

@Component({
  selector: 'ndt-settings-tool',
  standalone: true,
  imports: [DevToolbarToolComponent, FormsModule, DevToolbarButtonComponent],
  template: `
    <ngx-dev-toolbar-tool
      [windowConfig]="windowConfig"
      title="Settings"
      icon="gear"
    >
      <section class="settings">
        <div class="instruction">
          <div class="instruction__label">
            <span class="instruction__label-text">Theme</span>
            <span class="instruction__label-description">
              Switch between light and dark mode
            </span>
          </div>
          <div class="instruction__control">
            <div class="theme">
              <ndt-button
                [isActive]="!state.isDarkTheme()"
                (click)="onThemeSelect('light')"
                variant="icon"
                ariaLabel="Switch to light theme"
                icon="sun"
              />
              <ndt-button
                [isActive]="state.isDarkTheme()"
                (click)="onThemeSelect('dark')"
                variant="icon"
                ariaLabel="Switch to dark theme"
                icon="moon"
              />
            </div>
          </div>
        </div>
      </section>
    </ngx-dev-toolbar-tool>
  `,
  styleUrls: ['./settings-tool.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DevToolbarSettingsToolComponent {
  state = inject(DevToolbarStateService);

  readonly badge = input<string | number>();
  readonly windowConfig: WindowConfig = {
    title: 'Settings',
    isClosable: true,
    id: 'ndt-settings',
  };

  onThemeSelect(theme: ThemeType): void {
    this.state.setTheme(theme);
  }
}
