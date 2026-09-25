// ==============================================================================
// FITNESS DOMAIN TYPES
// ==============================================================================

export type Gender = 'male' | 'female' | 'non-binary' | 'prefer-not-to-say';

export type ActivityLevel = 
  | 'sedentary' 
  | 'lightly_active' 
  | 'moderately_active' 
  | 'very_active' 
  | 'extremely_active';

export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced';

export type FitnessGoalType = 
  | 'fat_loss' 
  | 'muscle_gain' 
  | 'strength' 
  | 'general_fitness' 
  | 'endurance' 
  | 'body_recomp' 
  | 'flexibility' 
  | 'sports_performance';

export type DietType = 
  | 'vegetarian' 
  | 'vegan' 
  | 'non_vegetarian' 
  | 'eggetarian' 
  | 'pescatarian' 
  | 'custom';

export type WorkoutDuration = 15 | 30 | 45 | 60 | 75 | 90;

export type PreferredTime = 'morning' | 'afternoon' | 'evening' | 'flexible';

export type TrainingLocation = 'gym' | 'home' | 'outdoor' | 'mixed';

/** High-level style of a generated weekly plan. */
export type WorkoutType = 'strength' | 'cardio' | 'sports' | 'hiit' | 'mobility' | 'mixed';

/** Category of a single prescribed exercise / activity inside a workout day. */
export type ExerciseCategory = 'strength' | 'cardio' | 'sports' | 'hiit' | 'mobility';

/** Session type of a single day in a generated plan. */
export type WorkoutSessionType = WorkoutType | 'rest';

export interface WorkoutGenerationOptions {
  workoutType: WorkoutType;
  /** Sports / cardio activities the user wants woven into the week (e.g. "Running", "Badminton"). */
  preferredActivities: string[];
  /** Optional muscle-group emphasis for strength / HIIT / mixed sessions. */
  targetMuscles: string[];
  daysPerWeek: number;
  sessionDurationMins: number;
  /** Optional adaptation reason from the regenerate dialog. */
  adjustment?: string;
  notes?: string;
}

export interface DietGenerationOptions {
  cuisines: string[];
  notes?: string;
}

export interface UserMetrics {
  age: number;
  gender: Gender;
  heightCm: number;
  weightKg: number;
  targetWeightKg?: number;
  activityLevel: ActivityLevel;
  bmi: number;
  bmr: number;
  tdee: number;
  targetCalories: number;
  targetProteinG: number;
  targetCarbsG: number;
  targetFatG: number;
}

export interface FitnessProfile {
  id: string;
  userId: string;
  name: string;
  email: string;
  age: number;
  gender: Gender;
  heightCm: number;
  weightKg: number;
  targetWeightKg?: number;
  country?: string;
  activityLevel: ActivityLevel;
  primaryGoal: FitnessGoalType;
  secondaryGoal?: FitnessGoalType;
  experienceLevel: ExperienceLevel;
  trainingYears: number;
  workoutDaysPerWeek: number;
  workoutDurationMins: WorkoutDuration;
  preferredWorkoutTime: PreferredTime;
  trainingLocation: TrainingLocation;
  availableEquipment: string[];
  /** Preferred style of training used as the default when generating plans. */
  preferredWorkoutType?: WorkoutType;
  /** Preferred sports & cardio activities (walking, running, cricket, badminton...). */
  preferredActivities?: string[];
  healthConditions: string[];
  injuries: string[];
  avoidExercises: string[];
  dietType: DietType;
  cuisinePreferences: string[];
  foodsLiked: string[];
  foodsAvoided: string[];
  allergies: string[];
  mealsPerDay: number;
  waterTargetMl: number;
  bmi: number;
  bmr: number;
  tdee: number;
  targetCalories: number;
  targetProteinG: number;
  targetCarbsG: number;
  targetFatG: number;
  createdAt: string;
  updatedAt: string;
}

export interface ExerciseItem {
  id: string;
  name: string;
  slug: string;
  category: 'Chest' | 'Back' | 'Shoulders' | 'Arms' | 'Legs' | 'Glutes' | 'Core' | 'Cardio' | 'Mobility' | 'Stretching' | 'Strength' | 'Sports' | 'HIIT';
  targetMuscle: string;
  secondaryMuscles: string[];
  equipmentRequired: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  instructions: string[];
  formTips: string[];
  commonMistakes: string[];
  beginnerAlternative?: string;
  advancedAlternative?: string;
  videoUrl?: string;
  thumbnailUrl?: string;
}

export interface WorkoutExercise {
  id: string;
  exerciseId?: string;
  exerciseName: string;
  category?: ExerciseCategory;
  targetMuscle: string;
  equipment: string;
  sets: number;
  reps: string;
  /** Present for time-based work (runs, sports sessions, intervals, mobility flows). */
  durationMins?: number;
  intensity?: string;
  restSeconds: number;
  tempo?: string;
  formNotes?: string;
  instructions?: string[];
  alternatives?: string[];
  videoUrl?: string;
}

export interface WorkoutDay {
  id: string;
  dayName: string; // e.g. "Monday", "Day 1"
  dayOrder: number;
  focus: string; // e.g. "Chest & Triceps"
  sessionType?: WorkoutSessionType;
  isRestDay: boolean;
  estimatedDurationMins: number;
  warmup: string[];
  exercises: WorkoutExercise[];
  cooldown: string[];
}

export interface WorkoutPlan {
  id: string;
  userId: string;
  title: string;
  description: string;
  goal: string;
  splitType: string;
  workoutType?: WorkoutType;
  preferredActivities?: string[];
  goalSummary?: string;
  coachAdvice?: string;
  daysPerWeek: number;
  durationWeeks: number;
  aiGenerated: boolean;
  aiModel?: string;
  isActive: boolean;
  days: WorkoutDay[];
  generationOptions?: WorkoutGenerationOptions;
  /** Non-blocking quality notes reported while validating the AI response. */
  warnings?: string[];
  createdAt: string;
}

export interface ExerciseSetLog {
  setNumber: number;
  targetReps: number;
  completedReps: number;
  weightKg: number;
  completed: boolean;
  rpe?: number;
}

export interface ExerciseSessionLog {
  exerciseId?: string;
  exerciseName: string;
  category?: ExerciseCategory;
  targetMuscle?: string;
  equipment?: string;
  durationMins?: number;
  restSeconds?: number;
  formNotes?: string;
  instructions?: string[];
  alternatives?: string[];
  videoUrl?: string;
  sets: ExerciseSetLog[];
}

export interface WorkoutSession {
  id: string;
  userId: string;
  workoutPlanId?: string;
  workoutDayId?: string;
  title: string;
  startedAt: string;
  completedAt?: string;
  durationSeconds: number;
  totalVolumeKg: number;
  caloriesBurned: number;
  completionPercentage: number;
  rpeScore?: number; // 1-10
  energyLevel?: number; // 1-5
  muscleSoreness?: number; // 1-5
  painReported?: boolean;
  painNotes?: string;
  notes?: string;
  exercises: ExerciseSessionLog[];
}

export interface MealItemAlternative {
  title: string;
  portion: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  notes?: string;
}

export interface MealItem {
  id: string;
  mealType: 'breakfast' | 'mid_morning' | 'lunch' | 'evening_snack' | 'dinner' | 'post_workout';
  title: string;
  portionDescription: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG: number;
  ingredients?: string[];
  prepNotes?: string;
  alternatives: MealItemAlternative[];
}

export interface MealPlanDayTotals {
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG: number;
}

export interface MealPlanDay {
  id: string;
  dayName: string;
  dayOrder: number;
  theme?: string;
  meals: MealItem[];
  totals: MealPlanDayTotals;
}

export interface MealPlan {
  id: string;
  userId: string;
  title: string;
  targetCalories: number;
  targetProteinG: number;
  targetCarbsG: number;
  targetFatG: number;
  targetFiberG: number;
  dietType: DietType;
  cuisine: string;
  cuisineNotes?: string;
  hydrationAdvice?: string;
  aiGenerated: boolean;
  aiModel?: string;
  isActive: boolean;
  /** 7-day AI generated plan. */
  days?: MealPlanDay[];
  /** Legacy single-day plans stored before the 7-day refactor. */
  meals?: MealItem[];
  generationOptions?: DietGenerationOptions;
  warnings?: string[];
  createdAt: string;
}

export interface MealLog {
  id: string;
  userId: string;
  date: string;
  mealType: string;
  foodName: string;
  portion: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG: number;
  loggedAt: string;
}

export interface WeightLog {
  id: string;
  userId: string;
  date: string;
  weightKg: number;
  notes?: string;
}

export interface BodyMeasurementLog {
  id: string;
  userId: string;
  date: string;
  waistCm?: number;
  chestCm?: number;
  armsCm?: number;
  thighsCm?: number;
  hipsCm?: number;
  bodyFatPct?: number;
  notes?: string;
}

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}

export interface WeeklyReview {
  id: string;
  userId: string;
  weekRange: string;
  workoutsCompleted: number;
  workoutsTarget: number;
  completionRate: number;
  avgRpe: number;
  weightStart: number;
  weightEnd: number;
  proteinAdherencePct: number;
  insights: string[];
  nextWeekRecommendations: string;
  createdAt: string;
}

export interface GamificationBadge {
  key: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: string;
  isUnlocked: boolean;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'workout' | 'meal' | 'water' | 'review' | 'streak' | 'milestone';
  createdAt: string;
  read: boolean;
  actionUrl?: string;
}
