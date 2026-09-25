import { NextRequest, NextResponse } from 'next/server';
import { aiErrorResponse } from '@/lib/groq/route-helpers';
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
  } catch (error) {
    return aiErrorResponse(error, 'chat');
  }
}
