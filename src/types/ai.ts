import { z } from 'zod';

// ==============================================================================
// ZOD VALIDATION SCHEMAS FOR STRUCTURED GROQ AI RESPONSES
// ==============================================================================

export const AIWorkoutExerciseSchema = z.object({
  exerciseName: z.string().min(2),
  targetMuscle: z.string().min(2),
  equipment: z.string(),
  sets: z.number().int().min(1).max(10),
  reps: z.string().min(1),
  restSeconds: z.number().int().min(15).max(300),
  tempo: z.string().optional(),
  formNotes: z.string().optional(),
  alternatives: z.array(z.string()).default([]),
  videoUrl: z.string().optional(),
});

export const AIWorkoutDaySchema = z.object({
  dayName: z.string().min(2),
  dayOrder: z.number().int(),
  focus: z.string().min(2),
  isRestDay: z.boolean(),
  estimatedDurationMins: z.number().int().min(10).max(120),
  warmup: z.array(z.string()).default([]),
  exercises: z.array(AIWorkoutExerciseSchema).default([]),
  cooldown: z.array(z.string()).default([]),
});

export const AIWorkoutPlanResponseSchema = z.object({
  title: z.string().min(3),
  description: z.string(),
  splitType: z.string(),
  goalSummary: z.string(),
  days: z.array(AIWorkoutDaySchema).min(1),
  coachAdvice: z.string(),
});

export type AIWorkoutPlanResponse = z.infer<typeof AIWorkoutPlanResponseSchema>;

// Meal Plan Schemas
export const AIMealAlternativeSchema = z.object({
  title: z.string(),
  portion: z.string(),
  calories: z.number(),
  proteinG: z.number(),
  carbsG: z.number(),
  fatG: z.number(),
  notes: z.string().optional(),
});

export const AIMealItemSchema = z.object({
  mealType: z.enum(['breakfast', 'mid_morning', 'lunch', 'evening_snack', 'dinner', 'post_workout']),
  title: z.string(),
  portionDescription: z.string(),
  calories: z.number(),
  proteinG: z.number(),
  carbsG: z.number(),
  fatG: z.number(),
  fiberG: z.number().default(0),
  alternatives: z.array(AIMealAlternativeSchema).default([]),
});

export const AIMealPlanResponseSchema = z.object({
  title: z.string(),
  targetCalories: z.number(),
  targetProteinG: z.number(),
  targetCarbsG: z.number(),
  targetFatG: z.number(),
  targetFiberG: z.number(),
  dietType: z.string(),
  cuisineNotes: z.string(),
  meals: z.array(AIMealItemSchema).min(3),
  hydrationAdvice: z.string(),
});

export type AIMealPlanResponse = z.infer<typeof AIMealPlanResponseSchema>;

// Weekly Review Schema
export const AIWeeklyReviewResponseSchema = z.object({
  weekSummary: z.string(),
  highlights: z.array(z.string()),
  areasForImprovement: z.array(z.string()),
  progressionRecommendations: z.array(z.string()),
  recoveryScoreAssessment: z.string(),
  nextWeekFocus: z.string(),
});

export type AIWeeklyReviewResponse = z.infer<typeof AIWeeklyReviewResponseSchema>;
