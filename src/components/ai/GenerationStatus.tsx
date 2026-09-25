'use client';

import React from 'react';
import { AlertTriangle, Info, Loader2, RotateCcw, SlidersHorizontal, X } from 'lucide-react';
import { GenerationState } from '@/lib/store/fitness-store';

interface GenerationStatusProps {
  state: GenerationState;
  /** e.g. "workout plan", "7-day meal plan" */
  label: string;
  onRetry: () => void;
  onDismiss: () => void;
  onAdjust?: () => void;
}

/** Loading, error (with retry) and validation-warning states for AI plan generation. */
export function GenerationStatus({ state, label, onRetry, onDismiss, onAdjust }: GenerationStatusProps) {
  if (state.status === 'loading') {
    return (
      <div className="rounded-3xl border border-emerald-500/30 bg-emerald-500/5 p-5 flex items-center gap-4" role="status" aria-live="polite">
        <Loader2 className="h-6 w-6 text-emerald-400 animate-spin shrink-0" />
        <div>
          <p className="text-sm font-bold text-white">Generating your {label} with Groq AI…</p>
          <p className="text-xs text-slate-400 mt-0.5">
            The response is validated against a strict schema before it is shown or saved. This usually takes 15–60 seconds.
          </p>
        </div>
      </div>
    );
  }

  if (state.status === 'error') {
    return (
      <div className="rounded-3xl border border-rose-500/30 bg-rose-500/10 p-5" role="alert">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-rose-200">Couldn&apos;t generate your {label}</p>
            <p className="text-xs text-rose-200/80 mt-1">{state.error}</p>
            {state.details && state.details.length > 0 && (
              <details className="mt-2 text-[11px] text-rose-200/70">
                <summary className="cursor-pointer font-semibold">Validation details</summary>
                <ul className="mt-1 space-y-0.5 list-disc list-inside">
                  {state.details.map((d, i) => (
                    <li key={i} className="break-words">{d}</li>
                  ))}
                </ul>
              </details>
            )}
            <div className="flex flex-wrap items-center gap-2 mt-3">
              {state.retryable !== false && (
                <button
                  onClick={onRetry}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-400 text-white text-xs font-bold transition"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Retry
                </button>
              )}
              {onAdjust && (
                <button
                  onClick={onAdjust}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-bold border border-white/10 transition"
                >
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                  Adjust options
                </button>
              )}
            </div>
          </div>
          <button onClick={onDismiss} className="text-rose-300/70 hover:text-rose-200" aria-label="Dismiss">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  const notes = [...(state.warnings || []), ...(state.storageNote ? [state.storageNote] : [])];
  if (state.status === 'success' && notes.length > 0) {
    return (
      <div className="rounded-3xl border border-amber-500/30 bg-amber-500/10 p-4 flex items-start gap-3">
        <Info className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
        <div className="flex-1 text-xs text-amber-100/90">
          <p className="font-bold text-amber-200">Your new {label} is ready — a few notes from validation:</p>
          <ul className="mt-1 space-y-0.5 list-disc list-inside">
            {notes.slice(0, 6).map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        </div>
        <button onClick={onDismiss} className="text-amber-300/70 hover:text-amber-200" aria-label="Dismiss">
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return null;
}
