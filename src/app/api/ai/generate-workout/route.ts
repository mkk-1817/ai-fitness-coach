import { NextRequest, NextResponse } from 'next/server';
import { generateAIWorkoutPlan } from '@/lib/groq/client';
import { aiErrorResponse, readJsonBody } from '@/lib/groq/route-helpers';
import { resolveExerciseMedia } from '@/lib/fitness/exercise-media';
import { GenerationProfileSchema, WorkoutGenerationOptionsSchema } from '@/types/ai';

export const maxDuration = 120;

export async function POST(req: NextRequest) {
  try {
    const body = await readJsonBody(req);
    if (!body.profile) {
      return NextResponse.json({ error: 'Profile is required', retryable: false }, { status: 400 });
    }

    const profile = GenerationProfileSchema.parse(body.profile);
    const parsedOptions = WorkoutGenerationOptionsSchema.parse(body.options ?? {});
    const options = {
      ...parsedOptions,
      workoutType: body.options ? parsedOptions.workoutType : profile.preferredWorkoutType ?? parsedOptions.workoutType,
      preferredActivities: body.options ? parsedOptions.preferredActivities : profile.preferredActivities,
      daysPerWeek: parsedOptions.daysPerWeek ?? profile.workoutDaysPerWeek,
      sessionDurationMins: parsedOptions.sessionDurationMins ?? profile.workoutDurationMins,
    };

    const result = await generateAIWorkoutPlan(profile, options);

    // Attach verified demo media where the curated library has a match; otherwise a search link.
    const plan = {
      ...result.data,
      days: result.data.days.map(day => ({
        ...day,
        exercises: day.exercises.map(ex => ({ ...ex, ...resolveExerciseMedia(ex.exerciseName) })),
      })),
    };

    return NextResponse.json({
      success: true,
      plan,
      options,
      meta: { model: result.model, attempts: result.attempts, warnings: result.warnings },
    });
  } catch (error) {
    return aiErrorResponse(error, 'generate-workout');
  }
}
