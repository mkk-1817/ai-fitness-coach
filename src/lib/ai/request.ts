/** Error thrown by client-side AI API calls, carrying the server's structured error payload. */
export class AIRequestError extends Error {
  constructor(message: string, public readonly retryable = true, public readonly details: string[] = []) {
    super(message);
    this.name = 'AIRequestError';
  }
}

/** POSTs JSON to one of the /api/ai routes and returns the success payload or throws AIRequestError. */
export async function postAI<T>(url: string, body: unknown): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch {
    throw new AIRequestError('Network error — check your connection and try again.');
  }

  const data = await res.json().catch(() => null);
  if (!res.ok || !data?.success) {
    throw new AIRequestError(
      data?.error || `AI request failed (${res.status}).`,
      data?.retryable ?? res.status >= 500,
      Array.isArray(data?.details) ? data.details : []
    );
  }
  return data as T;
}

export function describeError(err: unknown): { message: string; retryable: boolean; details: string[] } {
  if (err instanceof AIRequestError) return { message: err.message, retryable: err.retryable, details: err.details };
  return { message: err instanceof Error ? err.message : 'Something went wrong.', retryable: true, details: [] };
}
