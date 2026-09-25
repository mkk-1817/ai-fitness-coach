import { NextRequest, NextResponse } from 'next/server';
import { aiErrorResponse } from '@/lib/groq/route-helpers';
import { generateAIWeeklyReview } from '@/lib/groq/client';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { profile, completedSessions } = body;

    if (!profile) {
      return NextResponse.json({ error: 'Profile is required' }, { status: 400 });
    }

    const review = await generateAIWeeklyReview(profile, completedSessions || []);
    return NextResponse.json({ success: true, review });
  } catch (error) {
    return aiErrorResponse(error, 'weekly-review');
  }
}
