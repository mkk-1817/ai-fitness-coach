import { NextRequest, NextResponse } from 'next/server';
import { generateAIDietPlan } from '@/lib/groq/client';
import { computeMealDayTotals } from '@/lib/groq/plan-review';
import { aiErrorResponse, readJsonBody } from '@/lib/groq/route-helpers';
import { DietGenerationOptionsSchema, GenerationProfileSchema } from '@/types/ai';

export const maxDuration = 120;

export async function POST(req: NextRequest) {
  try {
    const body = await readJsonBody(req);
    if (!body.profile) {
      return NextResponse.json({ error: 'Profile is required', retryable: false }, { status: 400 });
    }

    const profile = GenerationProfileSchema.parse(body.profile);
    const parsedOptions = DietGenerationOptionsSchema.parse(body.options ?? {});
    const options = {
      ...parsedOptions,
      cuisines: parsedOptions.cuisines.length > 0 ? parsedOptions.cuisines : profile.cuisinePreferences,
    };

    const result = await generateAIDietPlan(profile, options);

    // Targets come from the user's computed metrics; daily totals are recomputed
    // from the validated meals rather than trusted from the model.
    const plan = {
      ...result.data,
      targetCalories: profile.targetCalories,
      targetProteinG: profile.targetProteinG,
      targetCarbsG: profile.targetCarbsG,
      targetFatG: profile.targetFatG,
      days: result.data.days.map(day => ({ ...day, totals: computeMealDayTotals(day.meals) })),
    };

    return NextResponse.json({
      success: true,
      plan,
      options,
      meta: { model: result.model, attempts: result.attempts, warnings: result.warnings },
    });
  } catch (error) {
    return aiErrorResponse(error, 'generate-diet');
  }
}
