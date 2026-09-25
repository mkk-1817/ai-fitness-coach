import { NextResponse } from 'next/server';
import { z } from 'zod';
import { formatZodIssues } from '@/types/ai';
import { AIGenerationError } from './client';

/** Consistent JSON error payload for the AI routes: { error, details, retryable }. */
export function aiErrorResponse(error: unknown, context: string) {
  if (error instanceof AIGenerationError) {
    console.error(`[${context}]`, error.message, error.details);
    return NextResponse.json(
      { error: error.message, details: error.details, retryable: error.retryable },
      { status: error.status }
    );
  }
  if (error instanceof z.ZodError) {
    return NextResponse.json(
      { error: 'Invalid request payload.', details: formatZodIssues(error), retryable: false },
      { status: 400 }
    );
  }
  console.error(`[${context}]`, error);
  return NextResponse.json(
    { error: error instanceof Error ? error.message : 'Unexpected server error.', retryable: true },
    { status: 500 }
  );
}

export async function readJsonBody(req: Request): Promise<Record<string, unknown>> {
  try {
    const body = await req.json();
    return body && typeof body === 'object' ? (body as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}
