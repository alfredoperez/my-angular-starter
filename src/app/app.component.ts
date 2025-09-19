import { Component, inject } from '@angular/core';
import { DevToolbarComponent } from 'ngx-dev-toolbar';
import { FeatureFlagsService } from './shared/data/feature-flags/feature-flags.service';
import { PageContainerComponent } from './shared/ui';
import { TopBarComponent } from './shared/ui/layout/top-bar.component';

@Component({
  imports: [PageContainerComponent, DevToolbarComponent, TopBarComponent],
  selector: 'app-root',
  template: `
    <div class="min-h-screen bg-gray-50">
      <ndt-toolbar />
      <ui-top-bar />
      <ui-page-container />
    </div>
  `,
})
export class AppComponent {
  flags = inject(FeatureFlagsService);

  ngOnInit(): void {
    this.flags.initializeFlags();
  }
}
