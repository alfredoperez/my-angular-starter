import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  DevToolbarInputComponent,
  DevToolbarSelectComponent,
  DevToolbarToolComponent,
} from '../../components';
import { WindowSize } from '../../components/dev-toolbar-window/dev-toolbar-window.models';
import { FeatureFlag, FeatureFlagFilter } from './feature-flags.models';
import { DevToolbarFeatureFlagsService } from './feature-flags.service';

@Component({
  selector: 'ndt-feature-flags-tool',
  standalone: true,
  imports: [
    FormsModule,
    DevToolbarToolComponent,
    DevToolbarInputComponent,
    DevToolbarSelectComponent,
  ],
  template: `
    <ngx-dev-toolbar-tool
      [windowConfig]="windowConfig"
      title="Feature Flags"
      icon="toggle-left"
    >
      <div class="container">
        <div class="header">
          <ndt-input
            [value]="searchQuery()"
            (valueChange)="onSearchChange($event)"
            placeholder="Search..."
          />
          <ndt-select
            [value]="activeFilter()"
            [options]="filterOptions"
            (valueChange)="onFilterChange($event)"
          />
        </div>

        @if (hasNoFlags()) {
          <div class="empty">
            <p>No flags found</p>
          </div>
        } @else {
          <div class="flag-list">
            @for (flag of filteredFlags(); track flag.id) {
              <div class="flag">
                <div class="info">
                  <h3>{{ flag.name }}</h3>
                  <p>{{ flag?.description }}</p>
                </div>

                <ndt-select
                  class="flag-state-select"
                  [value]="getFlagValue(flag)"
                  [options]="flagValueOptions"
                  [ariaLabel]="'Set value for ' + flag.name"
                  (valueChange)="onFlagChange(flag.id, $event ?? '')"
                  size="small"
                />
              </div>
            }
          </div>
        }
      </div>
    </ngx-dev-toolbar-tool>
  `,
  styles: [
    `
      .container {
        display: flex;
        flex-direction: column;
        height: 100%;
      }

      .header {
        flex-shrink: 0;
        display: flex;
        gap: var(--devtools-spacing-sm);
        margin-bottom: var(--devtools-spacing-md);

        ndt-input {
          flex: 0.65;
        }

        ndt-select {
          flex: 0.35;
        }
      }

      .empty {
        display: flex;
        flex-direction: column;
        gap: var(--devtools-spacing-md);
        flex: 1;
        min-height: 0;
        justify-content: center;
        align-items: center;
        border: 1px solid var(--devtools-warning-border);
        border-radius: var(--devtools-border-radius-medium);
        padding: var(--devtools-spacing-md);
        background: var(--devtools-warning-background);
        color: var(--devtools-text-muted);
      }

      .flag-list {
        display: flex;
        flex-direction: column;
        gap: var(--devtools-spacing-md);
        flex: 1;
        min-height: 0;
        overflow-y: auto;
        padding-right: var(--devtools-spacing-sm);

        &::-webkit-scrollbar {
          width: 8px;
        }

        &::-webkit-scrollbar-track {
          background: var(--devtools-background-secondary);
          border-radius: 4px;
        }

        &::-webkit-scrollbar-thumb {
          background: var(--devtools-border-primary);
          border-radius: 4px;

          &:hover {
            background: var(--devtools-hover-bg);
          }
        }

        scrollbar-width: thin;
        scrollbar-color: var(--devtools-border-primary)
          var(--devtools-background-secondary);
      }

      .flag {
        display: flex;
        flex-direction: column;
        gap: var(--devtools-spacing-sm);
        background: var(--devtools-background-secondary);
        .info {
          h3 {
            margin: 0;
            font-size: var(--devtools-font-size-md);
            color: var(--devtools-text-primary);
          }

          p {
            font-size: var(--devtools-font-size-xs);
            color: var(--devtools-text-muted);
          }
        }

        .flag-state-select {
          flex: 1;
          width: 100%;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DevToolbarFeatureFlagsToolComponent {
  // Injects
  private readonly featureFlags = inject(DevToolbarFeatureFlagsService);

  // Signals
  protected readonly activeFilter = signal<FeatureFlagFilter>('all');
  protected readonly searchQuery = signal<string>('');
  protected readonly flags = this.featureFlags.flags;
  protected readonly hasNoFlags = computed(() => this.flags().length === 0);
  protected readonly filteredFlags = computed(() => {
    return this.flags().filter((flag) => {
      const searchTerm = this.searchQuery().toLowerCase();
      const flagName = flag.name.toLowerCase();
      const flagDescription = flag.description?.toLowerCase() ?? '';

      const matchesSearch =
        !this.searchQuery() ||
        flagName.includes(searchTerm) ||
        flagDescription.includes(searchTerm);

      const matchesFilter =
        this.activeFilter() === 'all' ||
        (this.activeFilter() === 'forced' && flag.isForced) ||
        (this.activeFilter() === 'enabled' &&
          flag.isEnabled &&
          !flag.isForced) ||
        (this.activeFilter() === 'disabled' &&
          !flag.isEnabled &&
          !flag.isForced);

      return matchesSearch && matchesFilter;
    });
  });

  // Other properties
  protected readonly windowConfig = {
    title: 'Feature Flags',
    isClosable: true,
    size: 'tall' as WindowSize,
    id: 'ndt-feature-flags',
  };

  protected readonly filterOptions = [
    { value: 'all', label: 'All Flags' },
    { value: 'forced', label: 'Forced' },
    { value: 'enabled', label: 'Enabled' },
    { value: 'disabled', label: 'Disabled' },
  ];

  protected readonly flagValueOptions = [
    { value: 'not-forced', label: 'Nothing' },
    { value: 'off', label: 'Forced Off (false)' },
    { value: 'on', label: 'Forced On (true)' },
  ];

  // Public methods
  onFilterChange(value: string | undefined): void {
    const filter = this.filterOptions.find((f) => f.value === value);
    if (filter) {
      this.activeFilter.set(filter.value as FeatureFlagFilter);
    }
  }

  onFlagChange(flagId: string, value: string): void {
    switch (value) {
      case 'not-forced':
        this.featureFlags.removeFlag(flagId);
        break;
      case 'on':
        this.featureFlags.setFlag(flagId, true);
        break;
      case 'off':
        this.featureFlags.setFlag(flagId, false);
        break;
    }
  }

  onSearchChange(query: string): void {
    this.searchQuery.set(query);
  }

  // Protected methods
  protected getFlagValue(flag: FeatureFlag): string {
    if (!flag.isForced) return '';
    return flag.isEnabled ? 'on' : 'off';
  }
}
