import { NextResponse } from 'next/server';
import { getGroqConfig } from '@/lib/groq/client';

// Read env at request time, never prerender at build time.
export const dynamic = 'force-dynamic';

/** Non-secret view of the server-side AI configuration for the management console. */
export async function GET() {
  const { model, isConfigured } = getGroqConfig();
  return NextResponse.json({
    provider: 'Groq',
    model,
    isConfigured,
    features: ['workout-plan', 'meal-plan-7-day', 'food-lookup', 'coach-chat', 'weekly-review'],
  });
}
