import { z } from 'zod';
import {
  AIFoodLookupResponse,
  AIFoodLookupResponseSchema,
  AIMealPlanResponse,
  AIMealPlanResponseSchema,
  AIWeeklyReviewResponse,
  AIWeeklyReviewResponseSchema,
  AIWorkoutPlanResponse,
  AIWorkoutPlanResponseSchema,
  GenerationProfile,
  ResolvedDietOptions,
  ResolvedWorkoutOptions,
  formatZodIssues,
} from '@/types/ai';
import { FitnessProfile, WorkoutSession } from '@/types/fitness';
import {
  buildCoachChatPrompt,
  buildDietGenerationPrompt,
  buildFoodLookupPrompt,
  buildWorkoutGenerationPrompt,
} from './prompts';
import { ReviewIssue, reviewMealPlan, reviewWorkoutPlan } from './plan-review';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const DEFAULT_MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
const REQUEST_TIMEOUT_MS = 90_000;

// ==============================================================================
// ERRORS & CONFIG
// ==============================================================================

export class AIGenerationError extends Error {
  constructor(
    message: string,
    /** HTTP status the API route should respond with. */
    public readonly status = 502,
    /** Whether retrying the same request later can reasonably succeed. */
    public readonly retryable = true,
    public readonly details: string[] = []
  ) {
    super(message);
    this.name = 'AIGenerationError';
  }
}

/** Output problems that a corrective retry can fix. */
class MalformedOutputError extends Error {}

export function getGroqConfig() {
  const apiKey = process.env.GROQ_API_KEY;
  return {
    model: DEFAULT_MODEL,
    isConfigured: Boolean(apiKey && !apiKey.includes('your_groq')),
  };
}

export interface GenerationResult<T> {
  data: T;
  model: string;
  attempts: number;
  warnings: string[];
}

// ==============================================================================
// LOW-LEVEL GROQ CALL
// ==============================================================================

/**
 * Attempts to extract clean JSON from string, stripping Markdown codeblocks or conversational text.
 */
function cleanAndParseJSON(text: string): unknown {
  let cleaned = text.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/, '').replace(/```\s*$/, '');
  }

  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  }

  return JSON.parse(cleaned);
}

/**
 * Calls Groq chat completions API with server-side API key
 */
async function callGroqChat(
  messages: { role: string; content: string }[],
  { temperature = 0.5, jsonMode = false, maxTokens }: { temperature?: number; jsonMode?: boolean; maxTokens?: number } = {}
): Promise<string> {
  const { isConfigured, model } = getGroqConfig();
  if (!isConfigured) {
    throw new AIGenerationError('GROQ_API_KEY is not configured on the server.', 503, false);
  }

  let response: Response;
  try {
    response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
        max_tokens: maxTokens,
        response_format: jsonMode ? { type: 'json_object' } : undefined,
      }),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch (err) {
    const timedOut = err instanceof Error && (err.name === 'TimeoutError' || err.name === 'AbortError');
    throw new AIGenerationError(
      timedOut ? 'The AI service took too long to respond.' : 'Could not reach the AI service.',
      504
    );
  }

  if (!response.ok) {
    const errorText = (await response.text()).slice(0, 500);
    if (response.status === 401 || response.status === 403) {
      throw new AIGenerationError('The Groq API key was rejected. Check GROQ_API_KEY.', 503, false);
    }
    if (response.status === 429) {
      const retryAfter = response.headers.get('retry-after');
      throw new AIGenerationError(
        `The AI service is rate limited${retryAfter ? ` — try again in about ${Math.ceil(Number(retryAfter))}s` : ' — please try again shortly'}.`,
        429
      );
    }
    // Groq returns 400 json_validate_failed when the model emits malformed JSON in JSON mode.
    if (response.status === 400 && errorText.includes('json_validate_failed')) {
      throw new MalformedOutputError('The model produced malformed JSON.');
    }
    throw new AIGenerationError(`Groq API error (${response.status}): ${errorText}`, response.status >= 500 ? 502 : 500);
  }

  const data = await response.json();
  const content: string = data.choices?.[0]?.message?.content || '';
  if (!content.trim()) throw new MalformedOutputError('The model returned an empty response.');
  if (data.choices?.[0]?.finish_reason === 'length') {
    throw new MalformedOutputError('The response was cut off before the JSON was complete. Be more concise.');
  }
  return content;
}

// ==============================================================================
// VALIDATED STRUCTURED GENERATION
// ==============================================================================

/**
 * Requests JSON from the model, validates it against a zod schema and an
 * optional semantic review, and re-prompts with the exact validation errors
 * until the output is acceptable or attempts run out.
 */
async function generateStructured<S extends z.ZodTypeAny>({
  label,
  schema,
  systemPrompt,
  userPrompt,
  review,
  maxAttempts = 3,
  temperature = 0.4,
  maxTokens = 8000,
}: {
  label: string;
  schema: S;
  systemPrompt: string;
  userPrompt: string;
  review?: (data: z.infer<S>) => ReviewIssue[];
  maxAttempts?: number;
  temperature?: number;
  maxTokens?: number;
}): Promise<GenerationResult<z.infer<S>>> {
  let feedback: string[] = [];
  let lastProblems: string[] = [];

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const correction = feedback.length
      ? `\n\nYour previous response was rejected. Fix ALL of these problems and return the complete corrected JSON object:\n- ${feedback.join('\n- ')}`
      : '';

    let raw: string;
    try {
      raw = await callGroqChat(
        [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt + correction },
        ],
        { temperature: attempt === 1 ? temperature : Math.max(0.2, temperature - 0.1), jsonMode: true, maxTokens }
      );
    } catch (err) {
      if (err instanceof MalformedOutputError) {
        feedback = [err.message, 'Return a single valid JSON object with no text outside it.'];
        lastProblems = [err.message];
        continue;
      }
      if (err instanceof AIGenerationError && err.status >= 500 && err.retryable && attempt < maxAttempts) {
        await new Promise(r => setTimeout(r, 1500 * attempt));
        continue;
      }
      throw err;
    }

    let parsedJson: unknown;
    try {
      parsedJson = cleanAndParseJSON(raw);
    } catch {
      feedback = ['The response was not valid JSON.', 'Return a single valid JSON object with no text outside it.'];
      lastProblems = ['Response was not valid JSON'];
      continue;
    }

    const result = schema.safeParse(parsedJson);
    if (!result.success) {
      lastProblems = formatZodIssues(result.error);
      feedback = lastProblems.map(p => `Schema violation at ${p}`);
      console.warn(`[AI:${label}] attempt ${attempt} failed schema validation`, lastProblems);
      continue;
    }

    const issues = review ? review(result.data) : [];
    const hard = issues.filter(i => i.severity === 'hard').map(i => i.message);
    const soft = issues.filter(i => i.severity === 'soft').map(i => i.message);

    if (hard.length === 0 && (soft.length === 0 || attempt === maxAttempts)) {
      return { data: result.data, model: DEFAULT_MODEL, attempts: attempt, warnings: soft };
    }

    console.warn(`[AI:${label}] attempt ${attempt} failed review`, issues);
    lastProblems = [...hard, ...soft];
    feedback = lastProblems.slice(0, 15);
  }

  throw new AIGenerationError(
    `The AI could not produce a valid ${label} after ${maxAttempts} attempts. Please try again.`,
    502,
    true,
    lastProblems.slice(0, 10)
  );
}

// ==============================================================================
// PUBLIC GENERATORS
// ==============================================================================

export async function generateAIWorkoutPlan(
  profile: GenerationProfile,
  options: ResolvedWorkoutOptions
): Promise<GenerationResult<AIWorkoutPlanResponse>> {
  const { systemPrompt, userPrompt } = buildWorkoutGenerationPrompt(profile, options);
  const result = await generateStructured({
    label: 'workout plan',
    schema: AIWorkoutPlanResponseSchema,
    systemPrompt,
    userPrompt,
    review: plan => reviewWorkoutPlan(plan, profile, options),
    temperature: 0.5,
    maxTokens: 7000,
  });
  return { ...result, data: { ...result.data, days: [...result.data.days].sort((a, b) => a.dayOrder - b.dayOrder) } };
}

export async function generateAIDietPlan(
  profile: GenerationProfile,
  options: ResolvedDietOptions
): Promise<GenerationResult<AIMealPlanResponse>> {
  const { systemPrompt, userPrompt } = buildDietGenerationPrompt(profile, options);
  const result = await generateStructured({
    label: '7-day meal plan',
    schema: AIMealPlanResponseSchema,
    systemPrompt,
    userPrompt,
    review: plan => reviewMealPlan(plan, profile),
    temperature: 0.6,
    maxTokens: 12000,
  });
  return { ...result, data: { ...result.data, days: [...result.data.days].sort((a, b) => a.dayOrder - b.dayOrder) } };
}

export async function lookupFoodNutrition(
  query: string,
  context: { cuisines?: string[]; dietType?: string }
): Promise<GenerationResult<AIFoodLookupResponse>> {
  const { systemPrompt, userPrompt } = buildFoodLookupPrompt(query, context);
  return generateStructured({
    label: 'nutrition estimate',
    schema: AIFoodLookupResponseSchema,
    systemPrompt,
    userPrompt,
    maxAttempts: 2,
    temperature: 0.2,
    maxTokens: 1200,
  });
}

/**
 * Sends a message to the AI Fitness Coach
 */
export async function chatWithAICoach(
  profile: FitnessProfile,
  recentSessions: WorkoutSession[],
  chatHistory: { role: 'user' | 'assistant' | 'system'; content: string }[],
  userMessage: string
): Promise<string> {
  const historyWithNew = [...chatHistory, { role: 'user' as const, content: userMessage }];
  const { messages } = buildCoachChatPrompt(profile, recentSessions, historyWithNew);
  const reply = await callGroqChat(messages, { temperature: 0.7 });
  if (!reply.trim()) throw new AIGenerationError('The AI coach returned an empty reply.');
  return reply;
}

/**
 * Generates weekly review insights
 */
export async function generateAIWeeklyReview(
  profile: FitnessProfile,
  completedSessions: WorkoutSession[]
): Promise<AIWeeklyReviewResponse> {
  const systemPrompt = `You are AuraFit AI. Analyze the user's weekly training sessions (${completedSessions.length} completed) and provide an empowering, data-driven weekly performance review in JSON.`;
  const userPrompt = `User: ${profile.name}, Goal: ${profile.primaryGoal}, Target: ${profile.workoutDaysPerWeek} sessions.
Completed sessions: ${JSON.stringify(completedSessions.map(s => ({ title: s.title, duration: s.durationSeconds, rpe: s.rpeScore, pain: s.painReported })))}
Output strict JSON matching: { "weekSummary": "...", "highlights": ["..."], "areasForImprovement": ["..."], "progressionRecommendations": ["..."], "recoveryScoreAssessment": "...", "nextWeekFocus": "..." }`;

  const result = await generateStructured({
    label: 'weekly review',
    schema: AIWeeklyReviewResponseSchema,
    systemPrompt,
    userPrompt,
    maxAttempts: 2,
    temperature: 0.5,
    maxTokens: 1500,
  });
  return result.data;
}
