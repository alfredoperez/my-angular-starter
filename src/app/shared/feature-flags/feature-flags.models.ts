export interface FeatureFlag {
  name: string;
  value: boolean;
  id: string;
}
export const FEATURE_FLAGS: Array<FeatureFlag> = [
  { name: 'Dev Tools', id: 'dev-tools__phase1', value: true },
  { name: 'New Admin', id: 'new_admin__phase2', value: false },
];
