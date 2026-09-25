import { NextRequest, NextResponse } from 'next/server';
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
  } catch (error: any) {
    console.error('Error in AI weekly review route:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to generate weekly review' },
      { status: 500 }
    );
  }
}
