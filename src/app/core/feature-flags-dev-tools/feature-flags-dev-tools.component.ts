import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FeatureFlag, FeatureFlagsService } from '@my/shared/feature-flags';
import { DevToolsStorageService } from '@my/shared/ui/dev-tools/services/dev-tools-storage.service';
import { FlagValuePipe } from './flag-value.pipe';

@Component({
  selector: 'app-feature-flags-dev-tools',
  standalone: true,
  imports: [FormsModule, FlagValuePipe],
  template: `
    <section>
      <h2 class="title">Feature Flags</h2>
      <p>Toggle feature flags to see how they affect the application.</p>
    </section>
    <ul class="feature-flag-list">
      @for (flag of originalFlags; track flag.name) {
        <li class="feature-flag">
          <div class="feature-flag__left-side">
            <input
              type="checkbox"
              [(ngModel)]="flag.value"
              (ngModelChange)="toggleFlag(flag.name, flag.value)"
            />
            <span class="feature-flag__name">{{ flag.name }}</span>
          </div>
          <div class="feature-flag__right-side">
            <strong>Original</strong>:
            {{ flag.name | flagValue: originalFlags }}
          </div>
        </li>
      }
    </ul>
  `,
  styles: [
    `
      .title {
        margin-bottom: 10px;
        font-size: 1.5rem;
        font-weight: bold;
      }
      .feature-flag-list {
        list-style-type: none;
        padding: 0;
        margin: 0;
      }

      .feature-flag {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px;
        margin-top: 20px;
        padding: 10px;
        border-bottom: 1px solid #ccc;
      }

      .feature-flag__left-side {
        display: flex;
        align-items: center;
      }

      .feature-flag__name {
        font-weight: bold;
        margin-left: 8px;
      }

      .feature-flag__right-side {
        margin-left: auto;
        font-size: 0.8rem;
      }
    `,
  ],
})
export class FeatureFlagsDevToolsComponent implements OnInit {
  // injects
  featureFlagsService = inject(FeatureFlagsService);
  devTools = inject(DevToolsStorageService);

  // props
  devToolsFlags!: Array<FeatureFlag>;
  originalFlags!: Array<FeatureFlag>;

  ngOnInit(): void {
    this.originalFlags = this.featureFlagsService.getAll();
    this.devToolsFlags =
      (this.devTools.get('feature-flags') as Array<FeatureFlag>) ||
      this.originalFlags;
  }

  toggleFlag(name: string, value: boolean): void {
    this.devToolsFlags = this.devToolsFlags.map((flag) =>
      flag.name === name ? { ...flag, value } : flag,
    );
    this.devTools.set('feature-flags', this.devToolsFlags);
  }
}
