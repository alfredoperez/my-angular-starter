import { Component } from '@angular/core';
import { DevToolbarComponent, PageContainerComponent } from './shared/ui';

@Component({
  standalone: true,
  imports: [PageContainerComponent, DevToolbarComponent],
  selector: 'app-root',
  template: `
    <div>
      <ui-dev-toolbar />
      <ui-page-container />
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        width: 100%;
        height: 100%;
      }
    `,
  ],
})
export class AppComponent {}
