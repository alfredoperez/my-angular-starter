import { Injectable, inject } from '@angular/core';
import { DevToolbarFeatureFlagService, DevToolbarFlag } from 'ngx-dev-toolbar';
import { Observable, map } from 'rxjs';
import { APP_FLAGS } from './feature-flags.mocks';

@Injectable({ providedIn: 'root' })
export class FeatureFlagsService {
  private devToolbarFlags = inject(DevToolbarFeatureFlagService);

  initializeFlags(): void {
    const flags: Array<DevToolbarFlag> = APP_FLAGS.map((flag) => ({
      ...flag,
      isForced: false,
      isEnabled: false,
    }));

    this.devToolbarFlags.setAvailableOptions(flags);
  }

  /**
   * Gets the current value of a feature flag
   * First checks dev toolbar overrides, then falls back to default (false)
   */
  public get(flagId: string): Observable<boolean> {
    return this.devToolbarFlags
      .getForcedValues()
      .pipe(
        map((flags) => flags.find((f) => f.id === flagId)?.isEnabled ?? false),
      );
  }
}
