import { Component, input } from '@angular/core';

@Component({
  selector: 'ngx-dev-toolbar-overlay',
  standalone: true,
  template: `
    <div class="dev-toolbar" [attr.data-theme]="theme()">
      <ng-content></ng-content>
    </div>
  `,
  styleUrls: ['../../styles.scss']
})
export class DevToolbarOverlayComponent {
  theme = input.required<'light' | 'dark'>();
}
