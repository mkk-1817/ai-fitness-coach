'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dumbbell,
  Clock,
  Sparkles,
  Play,
  Video,
  RotateCcw,
  CheckCircle2,
  SlidersHorizontal,
  Activity,
  Lightbulb,
} from 'lucide-react';
import { useFitnessStore } from '@/lib/store/fitness-store';
import { ExerciseDemoModal } from './ExerciseDemoModal';
import { WorkoutGeneratorModal } from './WorkoutGeneratorModal';
import { GenerationStatus } from '@/components/ai/GenerationStatus';
import { PlanHistoryPanel } from '@/components/ai/PlanHistoryPanel';
import { buildExerciseDetails } from '@/lib/fitness/exercise-media';
import { CATEGORY_BADGE_STYLES, isTimedCategory, workoutTypeLabel } from '@/lib/fitness/workout-options';
import { ExerciseItem, WorkoutExercise, WorkoutGenerationOptions } from '@/types/fitness';

export function WorkoutPlanView() {
  const router = useRouter();
  const {
    workoutPlan,
    workoutPlanHistory,
    workoutGeneration,
    isHistoryLoading,
    historyError,
    startWorkout,
    generateNewWorkoutPlan,
    retryWorkoutGeneration,
    dismissGenerationState,
    activateHistoricalPlan,
    deleteHistoricalPlan,
  } = useFitnessStore();

  const [selectedDayId, setSelectedDayId] = useState<string | null>(null);
  const [demoExercise, setDemoExercise] = useState<ExerciseItem | null>(null);
  const [generatorOptions, setGeneratorOptions] = useState<WorkoutGenerationOptions | undefined>(undefined);
  const [showGenerator, setShowGenerator] = useState(false);

  const isGenerating = workoutGeneration.status === 'loading';
  const selectedDay = workoutPlan?.days.find(d => d.id === selectedDayId) || workoutPlan?.days[0];

  const openGenerator = (options?: WorkoutGenerationOptions) => {
    setGeneratorOptions(options);
    setShowGenerator(true);
  };

  const handleStartWorkout = (dayId: string) => {
    startWorkout(dayId);
    router.push('/workout/player');
  };

  const handleRegenerateFromHistory = (planId: string) => {
    const plan = workoutPlanHistory.find(p => p.id === planId);
    generateNewWorkoutPlan(plan?.generationOptions);
  };

  const status = (
    <GenerationStatus
      state={workoutGeneration}
      label="workout plan"
      onRetry={retryWorkoutGeneration}
      onDismiss={() => dismissGenerationState('workout')}
      onAdjust={() => openGenerator(workoutPlan?.generationOptions)}
    />
  );

  const history = (
    <PlanHistoryPanel
      title="Workout Plan History"
      items={workoutPlanHistory.map(p => ({
        id: p.id,
        title: p.title,
        createdAt: p.createdAt,
        isActive: p.id === workoutPlan?.id,
        tags: [workoutTypeLabel(p.workoutType), ...(p.preferredActivities || []).slice(0, 3)],
      }))}
      isLoading={isHistoryLoading}
      error={historyError}
      isGenerating={isGenerating}
      onActivate={id => activateHistoricalPlan('workout', id)}
      onRegenerate={handleRegenerateFromHistory}
      onDelete={id => deleteHistoricalPlan('workout', id)}
    />
  );

  const generatorModal = showGenerator && (
    <WorkoutGeneratorModal initialOptions={generatorOptions} onClose={() => setShowGenerator(false)} />
  );

  if (!workoutPlan) {
    return (
      <div className="space-y-6">
        {status}
        <div className="text-center py-16 rounded-3xl border border-white/10 bg-slate-900/80">
          <Dumbbell className="h-12 w-12 text-emerald-400 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-white">No Workout Plan Yet</h2>
          <p className="text-xs text-slate-400 mt-2 max-w-md mx-auto">
            Choose strength, cardio, sports, HIIT, mobility or a mix — the AI builds a full week around your profile, equipment and favourite activities.
          </p>
          <button
            onClick={() => openGenerator()}
            disabled={isGenerating}
            className="mt-5 inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 text-slate-950 font-bold rounded-2xl"
          >
            <Sparkles className="h-4 w-4" />
            {isGenerating ? 'Generating Plan…' : 'Generate Plan with AI'}
          </button>
        </div>
        {workoutPlanHistory.length > 0 && history}
        {generatorModal}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {status}

      {/* HEADER BANNER */}
      <div className="rounded-3xl border border-white/10 bg-slate-900/90 p-6 sm:p-8 shadow-xl backdrop-blur-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                {workoutPlan.splitType}
              </span>
              {workoutPlan.workoutType && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-purple-500/15 text-purple-300 border border-purple-500/30">
                  {workoutTypeLabel(workoutPlan.workoutType)}
                </span>
              )}
              <span className="text-xs text-slate-400">
                {workoutPlan.daysPerWeek} Training Days/Week • {workoutPlan.durationWeeks} Weeks
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {workoutPlan.title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-2xl leading-relaxed">
              {workoutPlan.description}
            </p>
            {workoutPlan.preferredActivities && workoutPlan.preferredActivities.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 mt-3">
                <Activity className="h-3.5 w-3.5 text-cyan-400" />
                {workoutPlan.preferredActivities.map(a => (
                  <span key={a} className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                    {a}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => openGenerator(workoutPlan.generationOptions)}
              disabled={isGenerating}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 disabled:opacity-60 text-xs font-bold text-slate-200 border border-white/10 transition"
            >
              <SlidersHorizontal className="h-4 w-4 text-emerald-400" />
              <span>{isGenerating ? 'Generating…' : 'Regenerate / Adapt Plan'}</span>
            </button>
          </div>
        </div>

        {workoutPlan.coachAdvice && (
          <div className="mt-5 p-3.5 rounded-2xl bg-slate-950/60 border border-white/5 text-xs text-slate-300 flex items-start gap-2">
            <Lightbulb className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
            <span>{workoutPlan.coachAdvice}</span>
          </div>
        )}

        {/* DAYS TAB SELECTOR */}
        <div className="mt-6 flex gap-2 overflow-x-auto pb-2 border-b border-white/10 no-scrollbar">
          {workoutPlan.days.map((day) => {
            const isSelected = day.id === selectedDay?.id;
            return (
              <button
                key={day.id}
                onClick={() => setSelectedDayId(day.id)}
                className={`flex flex-col items-start px-4 py-3 rounded-2xl text-left transition shrink-0 border ${
                  isSelected
                    ? 'bg-emerald-500/15 border-emerald-500/40 text-white shadow-md'
                    : 'bg-slate-950/60 border-white/5 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <span className={`text-[10px] font-bold uppercase tracking-wider ${isSelected ? 'text-emerald-400' : 'text-slate-500'}`}>
                  {day.dayName.split(' ')[0]}
                </span>
                <span className="text-xs font-bold mt-0.5 whitespace-nowrap">
                  {day.focus.length > 22 ? `${day.focus.substring(0, 22)}...` : day.focus}
                </span>
                <span className="text-[10px] text-slate-500 mt-1">
                  {day.isRestDay ? 'Rest & Recovery' : `${workoutTypeLabel(day.sessionType)} • ${day.exercises.length} blocks`}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* SELECTED DAY CONTENT */}
      {selectedDay && (
        <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 sm:p-7 shadow-xl backdrop-blur-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wide">
                  {selectedDay.dayName}
                </span>
                <span className="text-slate-500">•</span>
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-slate-400" />
                  {selectedDay.estimatedDurationMins} Mins
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white">{selectedDay.focus}</h2>
            </div>

            {!selectedDay.isRestDay && (
              <button
                onClick={() => handleStartWorkout(selectedDay.id)}
                className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500 hover:bg-emerald-400 px-6 py-3 text-xs font-black text-slate-950 shadow-lg shadow-emerald-500/25 transition cursor-pointer"
              >
                <Play className="h-4 w-4 fill-slate-950" />
                <span>START THIS WORKOUT</span>
              </button>
            )}
          </div>

          {/* REST DAY VIEW */}
          {selectedDay.isRestDay ? (
            <div className="py-10 text-center max-w-md mx-auto">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-400 mb-3 border border-teal-500/20">
                <RotateCcw className="h-7 w-7" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Rest & Active Recovery</h3>
              {[...selectedDay.warmup, ...selectedDay.cooldown].length > 0 ? (
                <ul className="text-xs text-slate-300 space-y-1.5 text-left inline-block">
                  {[...selectedDay.warmup, ...selectedDay.cooldown].map((item, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-teal-400" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-slate-400">Recover, hydrate and sleep well today.</p>
              )}
            </div>
          ) : (
            <div className="mt-6 space-y-6">
              {/* WARM-UP SECTION */}
              {selectedDay.warmup && selectedDay.warmup.length > 0 && (
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/5">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    Dynamic Warm-up
                  </h4>
                  <ul className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-slate-400">
                    {selectedDay.warmup.map((w, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                        <span>{w}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* EXERCISES LIST */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Session Breakdown
                </h4>

                <div className="space-y-3">
                  {selectedDay.exercises.map((ex, idx) => (
                    <ExerciseRow
                      key={ex.id || idx}
                      index={idx}
                      exercise={ex}
                      onDemo={() => setDemoExercise(buildExerciseDetails(ex))}
                    />
                  ))}
                </div>
              </div>

              {/* COOL-DOWN SECTION */}
              {selectedDay.cooldown && selectedDay.cooldown.length > 0 && (
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/5">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    Cool-down & Flexibility
                  </h4>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-400">
                    {selectedDay.cooldown.map((c, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {history}
      {generatorModal}

      {/* DEMO VIDEO MODAL */}
      {demoExercise && (
        <ExerciseDemoModal
          exercise={demoExercise}
          onClose={() => setDemoExercise(null)}
        />
      )}
    </div>
  );
}

function ExerciseRow({ index, exercise: ex, onDemo }: { index: number; exercise: WorkoutExercise; onDemo: () => void }) {
  const timed = isTimedCategory(ex.category, ex.durationMins);
  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/70 border border-white/5 hover:border-white/10 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 border border-white/10 text-emerald-400 font-black text-sm">
          {index + 1}
        </div>
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-bold text-white">{ex.exerciseName}</h3>
            {ex.category && (
              <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase border ${CATEGORY_BADGE_STYLES[ex.category]}`}>
                {ex.category}
              </span>
            )}
            <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-900 text-slate-400 border border-white/5">
              {ex.targetMuscle}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Equipment: <strong className="text-slate-200">{ex.equipment}</strong>
            {ex.intensity && ` • ${ex.intensity}`}
            {ex.formNotes && ` • ${ex.formNotes}`}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between sm:justify-end gap-5 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5">
        <div className="text-right">
          <div className="text-sm font-black text-white">
            {timed ? (ex.sets > 1 ? `${ex.sets} × ${ex.reps}` : ex.reps) : `${ex.sets} Sets × ${ex.reps}`}
          </div>
          <div className="text-[11px] text-slate-400">
            {timed && ex.durationMins ? `${ex.durationMins} min total` : `${ex.restSeconds}s rest`}
          </div>
        </div>

        <button
          onClick={onDemo}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-bold text-emerald-400 border border-white/10 transition"
        >
          <Video className="h-4 w-4" />
          <span>How-to</span>
        </button>
      </div>
    </div>
  );
}
