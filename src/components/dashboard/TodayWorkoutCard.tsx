'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Dumbbell, Clock, Flame, Play, CheckCircle2, ChevronRight, Video, Sparkles } from 'lucide-react';
import { useFitnessStore } from '@/lib/store/fitness-store';
import { ExerciseDemoModal } from '../workout/ExerciseDemoModal';
import { buildExerciseDetails } from '@/lib/fitness/exercise-media';
import { isTimedCategory, workoutTypeLabel } from '@/lib/fitness/workout-options';
import { ExerciseItem, WorkoutExercise } from '@/types/fitness';

export function TodayWorkoutCard() {
  const router = useRouter();
  const { workoutPlan, startWorkout, activeSession, generateNewWorkoutPlan, retryWorkoutGeneration, workoutGeneration } = useFitnessStore();
  const isGenerating = workoutGeneration.status === 'loading';
  const [selectedDemoExercise, setSelectedDemoExercise] = useState<ExerciseItem | null>(null);

  // Plans run Monday (dayOrder 1) → Sunday (7); show today's session or the next training day.
  const todayOrder = ((new Date().getDay() + 6) % 7) + 1;
  const orderedDays = [...(workoutPlan?.days || [])].sort((a, b) => a.dayOrder - b.dayOrder);
  const activeDay =
    orderedDays.find(d => d.dayOrder >= todayOrder && !d.isRestDay) ||
    orderedDays.find(d => !d.isRestDay) ||
    orderedDays[0];

  const handleStartWorkout = () => {
    if (activeDay) {
      startWorkout(activeDay.id);
      router.push('/workout/player');
    }
  };

  const handleOpenDemo = (exercise: WorkoutExercise) => {
    setSelectedDemoExercise(buildExerciseDetails(exercise));
  };

  if (!workoutPlan) {
    return (
      <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 p-6 sm:p-8 text-center shadow-xl">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 mb-4 border border-emerald-500/20">
          <Dumbbell className="h-7 w-7" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">No Active Workout Plan</h3>
        <p className="text-sm text-slate-400 max-w-md mx-auto mb-6">
          Our Groq AI Coach is ready to tailor a customized workout routine — strength, cardio, sports, HIIT or mobility — based on your goals, equipment, and schedule.
        </p>
        {workoutGeneration.status === 'error' && (
          <p className="text-xs text-rose-300 max-w-md mx-auto mb-4" role="alert">
            {workoutGeneration.error}
          </p>
        )}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => (workoutGeneration.status === 'error' ? retryWorkoutGeneration() : generateNewWorkoutPlan())}
            disabled={isGenerating}
            className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500 px-6 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-emerald-500/25 hover:bg-emerald-400 disabled:opacity-60 transition"
          >
            <Sparkles className={`h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
            {isGenerating ? 'Generating with AI...' : workoutGeneration.status === 'error' ? 'Retry Generation' : 'Generate AI Workout Plan'}
          </button>
          <Link href="/workout" className="text-xs font-semibold text-emerald-400 hover:text-emerald-300">
            Choose workout type & sports →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900/90 via-slate-900/50 to-slate-950 p-6 sm:p-7 shadow-2xl backdrop-blur-md">
        {/* Subtle decorative glow */}
        <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 h-48 w-48 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                Today&apos;s Focus
              </span>
              <span className="text-xs text-slate-400">{activeDay?.dayName} • {workoutTypeLabel(activeDay?.sessionType)}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              {activeDay?.focus}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-300 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-white/5">
              <Clock className="h-4 w-4 text-emerald-400" />
              <span>{activeDay?.estimatedDurationMins} Mins</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-300 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-white/5">
              <Flame className="h-4 w-4 text-amber-400" />
              <span>~{Math.round((activeDay?.estimatedDurationMins || 45) * 8)} kcal</span>
            </div>
          </div>
        </div>

        {/* EXERCISES LIST PREVIEW */}
        <div className="my-5 space-y-2.5">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider px-1">
            <span>Prescribed Blocks ({activeDay?.exercises.length || 0})</span>
            <Link href="/workout" className="text-emerald-400 hover:text-emerald-300 flex items-center gap-0.5 normal-case">
              View details <ChevronRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {activeDay?.exercises.map((ex, idx) => (
              <div 
                key={ex.id || idx}
                className="group flex items-center justify-between p-3 rounded-2xl bg-slate-950/60 border border-white/5 hover:border-emerald-500/30 transition"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-900 border border-white/10 text-emerald-400 font-bold text-xs group-hover:scale-105 transition">
                    {idx + 1}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{ex.exerciseName}</p>
                    <p className="text-xs text-slate-400">
                      {isTimedCategory(ex.category, ex.durationMins)
                        ? `${ex.reps}${ex.intensity ? ` • ${ex.intensity}` : ''}`
                        : `${ex.sets} sets × ${ex.reps} • ${ex.equipment}`}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleOpenDemo(ex)}
                  className="shrink-0 p-2 rounded-xl text-slate-400 hover:text-emerald-400 hover:bg-slate-900 transition flex items-center gap-1 text-xs"
                  title="Watch Video Demonstration"
                >
                  <Video className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* BOTTOM CTA BAR */}
        <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>AI-generated for your goals, equipment & activities</span>
          </div>

          <button
            onClick={handleStartWorkout}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 px-7 py-3.5 text-sm font-extrabold text-slate-950 shadow-xl shadow-emerald-500/25 hover:from-emerald-400 hover:to-teal-300 hover:scale-[1.02] active:scale-[0.98] transition cursor-pointer"
          >
            <Play className="h-4 w-4 fill-slate-950" />
            <span>{activeSession ? 'CONTINUE ACTIVE WORKOUT' : 'START TODAY\'S WORKOUT'}</span>
          </button>
        </div>
      </div>

      {selectedDemoExercise && (
        <ExerciseDemoModal
          exercise={selectedDemoExercise}
          onClose={() => setSelectedDemoExercise(null)}
        />
      )}
    </>
  );
}
