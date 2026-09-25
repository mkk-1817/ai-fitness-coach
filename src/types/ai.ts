import { z } from 'zod';

// ==============================================================================
// ZOD VALIDATION SCHEMAS FOR STRUCTURED GROQ AI RESPONSES
// Every AI response is parsed against these schemas before it is displayed or
// saved. Unknown keys are stripped; missing / mistyped required keys fail the
// response and trigger a corrective retry.
// ==============================================================================

export const WORKOUT_TYPES = ['strength', 'cardio', 'sports', 'hiit', 'mobility', 'mixed'] as const;
export const EXERCISE_CATEGORIES = ['strength', 'cardio', 'sports', 'hiit', 'mobility'] as const;
export const SESSION_TYPES = [...WORKOUT_TYPES, 'rest'] as const;
export const MEAL_TYPES = ['breakfast', 'mid_morning', 'lunch', 'evening_snack', 'dinner', 'post_workout'] as const;

/** Accepts numbers and numeric strings ("450") — LLMs occasionally quote numbers. */
const toNumber = (v: unknown) =>
  typeof v === 'string' && v.trim() !== '' && !Number.isNaN(Number(v)) ? Number(v) : v;

const num = (min: number, max: number) => z.preprocess(toNumber, z.number().min(min).max(max));
const int = (min: number, max: number) =>
  z.preprocess(v => {
    const n = toNumber(v);
    return typeof n === 'number' && Number.isFinite(n) ? Math.round(n) : n;
  }, z.number().int().min(min).max(max));

const text = (min = 1, max = 400) => z.string().trim().min(min).max(max);
const optionalText = (max = 400) => z.string().trim().max(max).nullish();
const textList = (max: number) => z.array(z.string().trim().min(1).max(300)).max(max).default([]);

/** "8-10", 12, "45s hold", "30 min" → string */
const repsField = z.union([z.string().trim().min(1).max(60), z.number()]).transform(String);

// ------------------------------------------------------------------------------
// WORKOUT PLAN
// ------------------------------------------------------------------------------

export const AIWorkoutExerciseSchema = z.object({
  exerciseName: text(2, 120),
  category: z.enum(EXERCISE_CATEGORIES),
  targetMuscle: text(2, 80),
  equipment: text(1, 80),
  sets: int(1, 10),
  reps: repsField,
  durationMins: num(1, 240).nullish(),
  intensity: optionalText(120),
  restSeconds: int(0, 600),
  tempo: optionalText(40),
  formNotes: optionalText(400),
  instructions: textList(8),
  alternatives: textList(5),
});

export const AIWorkoutDaySchema = z
  .object({
    dayName: text(2, 40),
    dayOrder: int(1, 7),
    focus: text(2, 120),
    sessionType: z.enum(SESSION_TYPES),
    isRestDay: z.boolean(),
    estimatedDurationMins: int(0, 240),
    warmup: textList(10),
    exercises: z.array(AIWorkoutExerciseSchema).max(14).default([]),
    cooldown: textList(10),
  })
  .refine(d => d.isRestDay || d.exercises.length > 0, {
    message: 'Training days must contain at least one exercise or activity',
    path: ['exercises'],
  });

export const AIWorkoutPlanResponseSchema = z.object({
  title: text(3, 120),
  description: text(1, 800),
  splitType: text(2, 80),
  goalSummary: text(1, 600),
  coachAdvice: text(1, 800),
  days: z.array(AIWorkoutDaySchema).length(7),
});

export type AIWorkoutPlanResponse = z.infer<typeof AIWorkoutPlanResponseSchema>;
export type AIWorkoutExercise = z.infer<typeof AIWorkoutExerciseSchema>;

// ------------------------------------------------------------------------------
// 7-DAY MEAL PLAN
// ------------------------------------------------------------------------------

export const AIMealAlternativeSchema = z.object({
  title: text(2, 160),
  portion: text(1, 240),
  calories: num(0, 3000),
  proteinG: num(0, 300),
  carbsG: num(0, 500),
  fatG: num(0, 300),
  notes: optionalText(240),
});

export const AIMealItemSchema = z.object({
  mealType: z.enum(MEAL_TYPES),
  title: text(2, 160),
  portionDescription: text(1, 300),
  ingredients: textList(15),
  calories: num(0, 3000),
  proteinG: num(0, 300),
  carbsG: num(0, 500),
  fatG: num(0, 300),
  fiberG: num(0, 150).default(0),
  prepNotes: optionalText(300),
  alternatives: z.array(AIMealAlternativeSchema).max(3).default([]),
});

export const AIMealDaySchema = z.object({
  dayName: text(2, 40),
  dayOrder: int(1, 7),
  theme: optionalText(120),
  meals: z.array(AIMealItemSchema).min(2).max(7),
});

export const AIMealPlanResponseSchema = z.object({
  title: text(3, 160),
  cuisineNotes: text(1, 800),
  hydrationAdvice: text(1, 400),
  days: z.array(AIMealDaySchema).length(7),
});

export type AIMealPlanResponse = z.infer<typeof AIMealPlanResponseSchema>;
export type AIMealItem = z.infer<typeof AIMealItemSchema>;

// ------------------------------------------------------------------------------
// FOOD NUTRITION LOOKUP (for manual food logging)
// ------------------------------------------------------------------------------

export const AIFoodLookupResponseSchema = z.object({
  items: z
    .array(
      z.object({
        name: text(2, 160),
        portion: text(1, 200),
        calories: num(0, 5000),
        proteinG: num(0, 400),
        carbsG: num(0, 800),
        fatG: num(0, 400),
        fiberG: num(0, 200).default(0),
        cuisine: optionalText(80),
      })
    )
    .min(1)
    .max(5),
});

export type AIFoodLookupResponse = z.infer<typeof AIFoodLookupResponseSchema>;

// ------------------------------------------------------------------------------
// WEEKLY REVIEW
// ------------------------------------------------------------------------------

export const AIWeeklyReviewResponseSchema = z.object({
  weekSummary: z.string(),
  highlights: z.array(z.string()),
  areasForImprovement: z.array(z.string()),
  progressionRecommendations: z.array(z.string()),
  recoveryScoreAssessment: z.string(),
  nextWeekFocus: z.string(),
});

export type AIWeeklyReviewResponse = z.infer<typeof AIWeeklyReviewResponseSchema>;

// ------------------------------------------------------------------------------
// REQUEST PAYLOADS (validated in the API routes)
// ------------------------------------------------------------------------------

export const WorkoutGenerationOptionsSchema = z.object({
  workoutType: z.enum(WORKOUT_TYPES).default('mixed'),
  preferredActivities: z.array(z.string().trim().min(1).max(60)).max(12).default([]),
  targetMuscles: z.array(z.string().trim().min(1).max(40)).max(10).default([]),
  daysPerWeek: z.number().int().min(1).max(7).optional(),
  sessionDurationMins: z.number().int().min(10).max(180).optional(),
  adjustment: z.string().max(200).optional(),
  notes: z.string().max(600).optional(),
});

export const DietGenerationOptionsSchema = z.object({
  cuisines: z.array(z.string().trim().min(1).max(60)).max(10).default([]),
  notes: z.string().max(600).optional(),
});

/** The subset of FitnessProfile used for generation, with safe defaults for older stored profiles. */
export const GenerationProfileSchema = z.object({
  userId: z.string().optional(),
  name: z.string().optional().default(''),
  age: z.number().min(10).max(120),
  gender: z.string(),
  heightCm: z.number().positive(),
  weightKg: z.number().positive(),
  targetWeightKg: z.number().positive().nullish(),
  country: z.string().nullish(),
  activityLevel: z.string(),
  primaryGoal: z.string(),
  secondaryGoal: z.string().nullish(),
  experienceLevel: z.string(),
  trainingYears: z.number().min(0).default(0),
  workoutDaysPerWeek: z.number().int().min(1).max(7),
  workoutDurationMins: z.number().int().min(10).max(180),
  preferredWorkoutTime: z.string().default('flexible'),
  trainingLocation: z.string().default('home'),
  availableEquipment: z.array(z.string()).default(['Bodyweight']),
  preferredWorkoutType: z.enum(WORKOUT_TYPES).optional(),
  preferredActivities: z.array(z.string()).default([]),
  healthConditions: z.array(z.string()).default([]),
  injuries: z.array(z.string()).default([]),
  avoidExercises: z.array(z.string()).default([]),
  dietType: z.string(),
  cuisinePreferences: z.array(z.string()).default([]),
  foodsLiked: z.array(z.string()).default([]),
  foodsAvoided: z.array(z.string()).default([]),
  allergies: z.array(z.string()).default([]),
  mealsPerDay: z.number().int().min(2).max(6).default(4),
  waterTargetMl: z.number().default(3000),
  targetCalories: z.number().min(800).max(6000),
  targetProteinG: z.number().min(10).max(500),
  targetCarbsG: z.number().min(0).max(1000),
  targetFatG: z.number().min(0).max(400),
});

export type GenerationProfile = z.infer<typeof GenerationProfileSchema>;
export type ResolvedWorkoutOptions = z.infer<typeof WorkoutGenerationOptionsSchema> & {
  daysPerWeek: number;
  sessionDurationMins: number;
};
export type ResolvedDietOptions = z.infer<typeof DietGenerationOptionsSchema>;

/** Formats zod issues into short, model-readable correction hints. */
export function formatZodIssues(error: z.ZodError, limit = 12): string[] {
  return error.issues.slice(0, limit).map(issue => {
    const path = issue.path.length ? issue.path.map(String).join('.') : '(root)';
    return `${path}: ${issue.message}`;
  });
}
