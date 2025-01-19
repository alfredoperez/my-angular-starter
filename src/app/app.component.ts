import { Component, inject } from '@angular/core';
import { DevToolbarComponent } from 'ngx-dev-toolbar';
import { FeatureFlagsService } from './shared/data/feature-flags/feature-flags.service';
import { PageContainerComponent } from './shared/ui';
@Component({
    imports: [PageContainerComponent, DevToolbarComponent],
    selector: 'app-root',
    template: `
    <div>
      <ndt-toolbar />
      <ui-page-container />
    </div>
  `
})
export class AppComponent {
  flags = inject(FeatureFlagsService);

  ngOnInit(): void {
    this.flags.initializeFlags();
  }
}
