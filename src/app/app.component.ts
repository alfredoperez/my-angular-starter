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
      <page-container />
    </div>
  `,
})
export class AppComponent {}
