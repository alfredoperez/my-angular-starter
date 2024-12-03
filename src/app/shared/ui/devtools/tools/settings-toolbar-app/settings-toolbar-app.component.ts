import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import {
  DevToolbarButtonComponent,
  DevToolbarOverlayComponent,
  DevToolbarToolComponent,
} from '../../components';
import { GearIconComponent } from '../../components/icons/gear-icon.component';
import { SettingsToolbarOverlayComponent } from './settings-toolbar-overlay.component';

@Component({
  selector: 'ngx-toolbar-settings-app',
  standalone: true,
  imports: [
    DevToolbarButtonComponent,
    DevToolbarOverlayComponent,
    DevToolbarToolComponent,
    DevToolbarButtonComponent,
    GearIconComponent,
  ],
  template: `
    <ngx-dev-toolbar-tool [component]="overlayComponent" title="Settings">
      <ngx-dev-toolbar-button title="Settings">
        <ngx-dev-toolbar-gear-icon />
      </ngx-dev-toolbar-button>
      <ngx-dev-toolbar-overlay>
        <p>Settings Content</p>
      </ngx-dev-toolbar-overlay>
    </ngx-dev-toolbar-tool>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsToolbarAppComponent {
  badge = input<string | number>();
  overlayComponent = SettingsToolbarOverlayComponent;
}
