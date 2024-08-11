import { Injectable } from '@angular/core';
import { FEATURE_FLAGS } from './feature-flags.models';

@Injectable({ providedIn: 'root' })
export class FeatureFlagsService {
  /**
   * Gets all feature flags.
   * NOTE: In this case is returning mocked values since it is just for demonstration purposes.
   */
  getAll() {
    return FEATURE_FLAGS;
  }

  isEnabled(key: string): boolean {
    return FEATURE_FLAGS.filter((flag) => flag.name === key)[0].value;
  }
}
