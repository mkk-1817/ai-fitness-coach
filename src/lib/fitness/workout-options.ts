import {
  DietGenerationOptions,
  ExerciseCategory,
  FitnessProfile,
  WorkoutGenerationOptions,
  WorkoutSessionType,
  WorkoutType,
} from '@/types/fitness';

/** Generation defaults derived from the saved profile. */
export function defaultWorkoutOptions(profile: FitnessProfile): WorkoutGenerationOptions {
  return {
    workoutType: profile.preferredWorkoutType || 'mixed',
    preferredActivities: profile.preferredActivities || [],
    targetMuscles: [],
    daysPerWeek: profile.workoutDaysPerWeek,
    sessionDurationMins: profile.workoutDurationMins,
  };
}

export function defaultDietOptions(profile: FitnessProfile): DietGenerationOptions {
  return { cuisines: profile.cuisinePreferences || [] };
}

// ==============================================================================
// UI OPTION LISTS FOR AI PLAN GENERATION
// These describe what the user can ask for — the plan content itself is always
// produced by the AI model.
// ==============================================================================

export const WORKOUT_TYPE_OPTIONS: { value: WorkoutType; label: string; description: string }[] = [
  { value: 'strength', label: 'Strength', description: 'Resistance training with progressive overload' },
  { value: 'cardio', label: 'Cardio', description: 'Walking, running, cycling, swimming, skipping' },
  { value: 'sports', label: 'Sports', description: 'Cricket, football, badminton, tennis & sport-specific drills' },
  { value: 'hiit', label: 'HIIT', description: 'High-intensity intervals and conditioning circuits' },
  { value: 'mobility', label: 'Mobility / Recovery', description: 'Flexibility, yoga-style flows and active recovery' },
  { value: 'mixed', label: 'Mixed', description: 'A balanced blend of strength, cardio and sport' },
];

export const SPORTS_CARDIO_ACTIVITIES: { value: string; kind: 'cardio' | 'sports' }[] = [
  { value: 'Walking', kind: 'cardio' },
  { value: 'Running', kind: 'cardio' },
  { value: 'Cycling', kind: 'cardio' },
  { value: 'Swimming', kind: 'cardio' },
  { value: 'Skipping', kind: 'cardio' },
  { value: 'Cricket', kind: 'sports' },
  { value: 'Football', kind: 'sports' },
  { value: 'Basketball', kind: 'sports' },
  { value: 'Badminton', kind: 'sports' },
  { value: 'Tennis', kind: 'sports' },
];

export const TARGET_MUSCLE_OPTIONS = ['Chest', 'Back', 'Shoulders', 'Arms', 'Legs', 'Glutes', 'Core', 'Full Body'];

export const WORKOUT_ADJUSTMENT_OPTIONS: { key: string; label: string }[] = [
  { key: 'more_progressive_overload', label: 'Workouts feel too easy (increase progression)' },
  { key: 'less_time', label: 'Short on time (condense sessions, higher intensity)' },
  { key: 'travel_home', label: 'Traveling / hotel (minimal equipment)' },
  { key: 'injury_limitation', label: 'Deload joints / accommodate soreness' },
  { key: 'more_variety', label: 'Want more variety in exercises and activities' },
];

export function workoutTypeLabel(type?: WorkoutSessionType): string {
  if (!type) return 'Mixed';
  if (type === 'rest') return 'Rest';
  return WORKOUT_TYPE_OPTIONS.find(o => o.value === type)?.label ?? type;
}

/** Categories whose volume is tracked in minutes instead of reps × weight. */
export function isTimedCategory(category?: ExerciseCategory, durationMins?: number): boolean {
  if (durationMins && durationMins > 0) return true;
  return category === 'cardio' || category === 'sports';
}

export const CATEGORY_BADGE_STYLES: Record<ExerciseCategory, string> = {
  strength: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  cardio: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
  sports: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  hiit: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
  mobility: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
};
