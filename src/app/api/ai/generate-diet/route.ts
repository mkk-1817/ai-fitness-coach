import { NextRequest, NextResponse } from 'next/server';
import { generateAIDietPlan } from '@/lib/groq/client';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { profile } = body;

    if (!profile) {
      return NextResponse.json({ error: 'Profile is required' }, { status: 400 });
    }

    const plan = await generateAIDietPlan(profile);
    return NextResponse.json({ success: true, plan });
  } catch (error: any) {
    console.error('Error generating AI diet plan:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to generate AI diet plan' },
      { status: 500 }
    );
  }
}
