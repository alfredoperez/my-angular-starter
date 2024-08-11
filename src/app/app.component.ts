import { Component } from '@angular/core';
import { AngularQueryDevtools } from '@tanstack/angular-query-devtools-experimental';
import { DevToolsComponent, PageContainerComponent } from '@my/shared/ui';
import { FeatureFlagsDevToolsComponent } from './core/feature-flags-dev-tools/feature-flags-dev-tools.component';

@Component({
  standalone: true,
  imports: [
    PageContainerComponent,
    AngularQueryDevtools,
    DevToolsComponent,
    FeatureFlagsDevToolsComponent,
  ],
  selector: 'app-root',
  template: `
    <div>
      <angular-query-devtools initialIsOpen />
      <app-dev-tools> <app-feature-flags-dev-tools /></app-dev-tools>
      <ui-page-container />
    </div>
  `,
})
export class AppComponent {}
