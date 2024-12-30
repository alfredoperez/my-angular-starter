import { Injectable, Signal, computed, inject } from '@angular/core';
import { DevToolbarFeatureFlagsService, Flag } from 'ngx-dev-toolbar';
import { APP_FLAGS } from './feature-flags.mocks';

@Injectable({ providedIn: 'root' })
export class FeatureFlagsService {
  private devToolbarFlags = inject(DevToolbarFeatureFlagsService);

  initializeFlags(): void {
    const flags: Array<Flag> = APP_FLAGS.map((flag) => ({
      ...flag,
      isForced: false,
      isEnabled: false,
    }));

    this.devToolbarFlags.setAppFlags(flags);
  }

  /**
   * Gets the current value of a feature flag
   * First checks dev toolbar overrides, then falls back to default (false)
   */
  public get(flagId: string): Signal<boolean> {
    const flags = this.devToolbarFlags.flags();

    return computed(() => {
      const flag = flags.find((f) => f.id === flagId);
      return flag?.isEnabled ?? false;
    });
  }
}
