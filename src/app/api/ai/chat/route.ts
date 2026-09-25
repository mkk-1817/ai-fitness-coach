import { NextRequest, NextResponse } from 'next/server';
import { chatWithAICoach } from '@/lib/groq/client';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { profile, recentSessions, chatHistory, userMessage } = body;

    if (!userMessage || !profile) {
      return NextResponse.json({ error: 'Profile and userMessage are required' }, { status: 400 });
    }

    const reply = await chatWithAICoach(profile, recentSessions || [], chatHistory || [], userMessage);
    return NextResponse.json({ success: true, reply });
  } catch (error: any) {
    console.error('Error in AI Coach chat route:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to process AI Coach chat' },
      { status: 500 }
    );
  }
}
