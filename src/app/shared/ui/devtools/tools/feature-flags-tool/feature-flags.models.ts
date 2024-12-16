export interface FeatureFlag {
  id: string;
  name: string;
  description?: string;
  isEnabled: boolean;
  isForced: boolean;
}

export type FeatureFlagFilter = 'all' | 'forced' | 'enabled' | 'disabled';
