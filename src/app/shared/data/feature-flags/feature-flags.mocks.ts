import { FeatureFlag } from './feature-flags.models';

export const APP_FLAGS: Array<FeatureFlag> = [
  {
    id: 'new_users_table',
    name: 'New Users Table',
    description: 'New Users Table',
    isEnabled: true,
  },
  {
    id: 'workout_tracking',
    name: 'Workout Tracking System',
    description: 'Workout Tracking',
    isEnabled: true,
  },
  {
    id: 'nutrition_planner',
    name: 'Nutrition Planning Dashboard',
    description: 'Nutrition Planner',
    isEnabled: true,
  },
  {
    id: 'progress_photos',
    name: 'Progress Photo Timeline',
    description: 'Progress Photos',
    isEnabled: true,
  },
  {
    id: 'social_challenges',
    name: 'Community Fitness Challenges',
    description: 'Social Challenges',
    isEnabled: true,
  },
  {
    id: 'personal_coaching',
    name: 'Personal Training Sessions',
    description: 'Personal Coaching',
    isEnabled: true,
  },
  {
    id: 'workout_analytics',
    name: 'Advanced Workout Analytics',
    description: 'Workout Analytics',
    isEnabled: true,
  },
];
