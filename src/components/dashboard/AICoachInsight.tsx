'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, MessageSquare, ArrowRight, ShieldCheck } from 'lucide-react';
import { useFitnessStore } from '@/lib/store/fitness-store';

export function AICoachInsight() {
  const { profile, workoutSessions } = useFitnessStore();

  const sessionCount = workoutSessions.length;
  const latestSession = workoutSessions[0];

  let insightText = `Based on your goal of ${profile.primaryGoal.replace('_', ' ')} with ${profile.workoutDaysPerWeek} training days/week, your baseline routine is progressing smoothly. Remember to prioritize sleep and maintain 500ml water intake around workouts.`;

  if (latestSession && latestSession.rpeScore && latestSession.rpeScore <= 7) {
    insightText = `Great effort on your last session (${latestSession.title})! Since your RPE was ${latestSession.rpeScore}/10, you are primed for progressive overload: increase dumbbell load by +1-2.5 kg on your primary compound lifts next round.`;
  } else if (latestSession && latestSession.painReported) {
    insightText = `Notice: You reported mild discomfort in your recent workout (${latestSession.painNotes || 'joint/muscle'}). I've prioritized safe joint angles and deloaded high-impact exercises. If pain persists, consult a physician.`;
  }

  return (
    <div className="relative overflow-hidden rounded-3xl border border-emerald-500/30 bg-gradient-to-r from-emerald-950/40 via-slate-900/90 to-teal-950/30 p-5 sm:p-6 shadow-xl backdrop-blur-md">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 shadow-lg shadow-emerald-500/20 mt-0.5">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-400">
                AuraFit AI Coach Insight
              </span>
              <span className="text-[10px] text-slate-400">• Dynamic Sports Science</span>
            </div>
            <p className="text-sm text-slate-200 leading-relaxed max-w-3xl">
              {insightText}
            </p>
          </div>
        </div>

        <Link
          href="/coach"
          className="shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold border border-white/10 shadow-sm transition hover:scale-105"
        >
          <MessageSquare className="h-4 w-4 text-emerald-400" />
          <span>Ask Coach</span>
          <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
        </Link>
      </div>
    </div>
  );
}
