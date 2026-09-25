import { NextRequest, NextResponse } from 'next/server';
import { lookupFoodNutrition } from '@/lib/groq/client';
import { aiErrorResponse, readJsonBody } from '@/lib/groq/route-helpers';

export async function POST(req: NextRequest) {
  try {
    const body = await readJsonBody(req);
    const query = typeof body.query === 'string' ? body.query.trim() : '';
    if (query.length < 2 || query.length > 200) {
      return NextResponse.json({ error: 'Describe the food in 2-200 characters.', retryable: false }, { status: 400 });
    }

    const cuisines = Array.isArray(body.cuisines) ? body.cuisines.filter((c): c is string => typeof c === 'string').slice(0, 10) : [];
    const dietType = typeof body.dietType === 'string' ? body.dietType : undefined;

    const result = await lookupFoodNutrition(query, { cuisines, dietType });
    return NextResponse.json({ success: true, items: result.data.items, meta: { model: result.model } });
  } catch (error) {
    return aiErrorResponse(error, 'food-lookup');
  }
}
