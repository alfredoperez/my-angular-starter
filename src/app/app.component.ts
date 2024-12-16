import { Component, inject } from '@angular/core';
import { DevToolbarComponent, PageContainerComponent } from './shared/ui';
import { FeatureFlag } from './shared/ui/devtools/tools';
import { DevToolbarFeatureFlagsService } from './shared/ui/devtools/tools/feature-flags-tool/feature-flags.service';

@Component({
  standalone: true,
  imports: [PageContainerComponent, DevToolbarComponent],
  selector: 'app-root',
  template: `
    <div>
      <ngx-dev-toolbar />
      <ui-page-container />
    </div>
  `,
})
export class AppComponent {
  flags = inject(DevToolbarFeatureFlagsService);

  appFlags: Array<{ fullName: string; shortName: string; id: string }> = [
    {
      id: 'marketing_timi_homepage',
      fullName: "Marketing's Toms Home Page",
      shortName: "On/Off Switch For Marketing's TIMI Home Page",
    },
    {
      id: 'marketing_timi',
      fullName: 'Marketing Rob',
      shortName: 'Marketing Rob',
    },
    {
      id: 'marketing_timi_2',
      fullName: 'Marketing TIMI',
      shortName: 'Marketing TIMI Feature',
    },
    {
      id: 'marketing_mwn_gate',
      fullName: "Notion's User Conference",
      shortName: 'Gating Notion User Conference',
    },
    {
      id: 'marketing-template-collection-redesign',
      fullName: 'Template Collection Redesign',
      shortName: 'Template Collection Redesign Gate',
    },
  ];

  ngOnInit(): void {
    this.flags.set(this.mapToFeatureFlags(this.appFlags));
  }

  private mapToFeatureFlags(
    flags: Array<{ fullName: string; shortName: string; id: string }>,
  ): FeatureFlag[] {
    return flags.map((flag) => ({
      id: flag.id,
      name: flag.fullName,
      description: flag.shortName,
      isEnabled: false,
      isForced: false,
    }));
  }
}
