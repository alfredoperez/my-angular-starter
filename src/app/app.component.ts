import { Component } from '@angular/core';
import { AngularQueryDevtools } from '@tanstack/angular-query-devtools-experimental';
import { PageContainerComponent } from './shared/ui';

@Component({
  standalone: true,
  imports: [PageContainerComponent, AngularQueryDevtools],
  selector: 'app-root',
  template: `
    <div>
      <angular-query-devtools initialIsOpen />
      <ui-page-container />
    </div>
  `,
  styles: [
    `
      :host {
        display: flex;
        flex: 1 1 auto;
        width: 100%;
        height: 100%;
      }
    `,
  ],
})
export class AppComponent {}
