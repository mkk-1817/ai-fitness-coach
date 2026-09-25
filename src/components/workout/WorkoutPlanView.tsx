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
  Calendar, 
  ChevronRight, 
  Info,
  CheckCircle2,
  SlidersHorizontal,
  X
} from 'lucide-react';
import { useFitnessStore } from '@/lib/store/fitness-store';
import { ExerciseDemoModal } from './ExerciseDemoModal';
import { EXERCISE_LIBRARY_DATA } from '@/lib/data/exercise-data';
import { ExerciseItem } from '@/types/fitness';

export function WorkoutPlanView() {
  const router = useRouter();
  const { workoutPlan, profile, startWorkout, generateNewWorkoutPlan, isLoadingAI } = useFitnessStore();

  const [selectedDayId, setSelectedDayId] = useState<string>(
    workoutPlan?.days[0]?.id || 'day-1'
  );
  const [demoExercise, setDemoExercise] = useState<ExerciseItem | null>(null);
  const [showRegenerateModal, setShowRegenerateModal] = useState(false);
  const [adjustmentReason, setAdjustmentReason] = useState('more_progressive_overload');

  const selectedDay = workoutPlan?.days.find(d => d.id === selectedDayId) || workoutPlan?.days[0];

  const handleStartWorkout = (dayId: string) => {
    startWorkout(dayId);
    router.push('/workout/player');
  };

  const handleOpenDemo = (name: string) => {
    const found = EXERCISE_LIBRARY_DATA.find(e => e.name.toLowerCase() === name.toLowerCase()) || EXERCISE_LIBRARY_DATA[0];
    setDemoExercise(found);
  };

  if (!workoutPlan) {
    return (
      <div className="text-center py-16">
        <Dumbbell className="h-12 w-12 text-emerald-400 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-white">No Workout Plan Loaded</h2>
        <button
          onClick={() => generateNewWorkoutPlan()}
          disabled={isLoadingAI}
          className="mt-4 px-6 py-3 bg-emerald-500 text-slate-950 font-bold rounded-2xl"
        >
          {isLoadingAI ? 'Generating Plan...' : 'Generate Plan with AI'}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* HEADER BANNER */}
      <div className="rounded-3xl border border-white/10 bg-slate-900/90 p-6 sm:p-8 shadow-xl backdrop-blur-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                {workoutPlan.splitType}
              </span>
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
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowRegenerateModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-white/10 transition"
            >
              <SlidersHorizontal className="h-4 w-4 text-emerald-400" />
              <span>Regenerate / Adapt Plan</span>
            </button>
          </div>
        </div>

        {/* DAYS TAB SELECTOR */}
        <div className="mt-8 flex gap-2 overflow-x-auto pb-2 border-b border-white/10 no-scrollbar">
          {workoutPlan.days.map((day) => {
            const isSelected = day.id === selectedDayId;
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
                  {day.isRestDay ? 'Rest & Recovery' : `${day.exercises.length} exercises`}
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
            <div className="py-12 text-center max-w-md mx-auto">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-400 mb-3 border border-teal-500/20">
                <RotateCcw className="h-7 w-7" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Rest & Active Recovery</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Muscles grow and rebuild while resting! Spend today taking a 20-30 minute brisk walk, hydrating well, and completing mobility stretches.
              </p>
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
                  Exercise Breakdown
                </h4>

                <div className="space-y-3">
                  {selectedDay.exercises.map((ex, idx) => (
                    <div
                      key={ex.id || idx}
                      className="p-4 sm:p-5 rounded-2xl bg-slate-950/70 border border-white/5 hover:border-white/10 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 border border-white/10 text-emerald-400 font-black text-sm">
                          {idx + 1}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-base font-bold text-white">{ex.exerciseName}</h3>
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-900 text-slate-400 border border-white/5">
                              {ex.targetMuscle}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 mt-1">
                            Equipment: <strong className="text-slate-200">{ex.equipment}</strong>
                            {ex.formNotes && ` • ${ex.formNotes}`}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-5 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5">
                        <div className="text-right">
                          <div className="text-sm font-black text-white">
                            {ex.sets} Sets × {ex.reps}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {ex.restSeconds}s rest
                          </div>
                        </div>

                        <button
                          onClick={() => handleOpenDemo(ex.exerciseName)}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-bold text-emerald-400 border border-white/10 transition"
                        >
                          <Video className="h-4 w-4" />
                          <span>Demo</span>
                        </button>
                      </div>
                    </div>
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

      {/* REGENERATE / ADAPT PLAN MODAL */}
      {showRegenerateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">Regenerate / Adapt Plan with AI</h3>
              </div>
              <button onClick={() => setShowRegenerateModal(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300 mb-4">
              Specify what changed so our Groq AI service can recalculate and adapt your weekly structure:
            </p>

            <div className="space-y-2 mb-6">
              {[
                { key: 'more_progressive_overload', label: 'Workouts feel too easy (Increase Progression)' },
                { key: 'less_time', label: 'Short on time (Condense to 30-minute high intensity)' },
                { key: 'travel_home', label: 'Traveling / Hotel (Dumbbells and Bodyweight only)' },
                { key: 'injury_limitation', label: 'Deload joint / Accommodate muscle soreness' },
                { key: 'new_goal', label: 'Change primary focus to Fat Loss & Conditioning' },
              ].map(opt => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => setAdjustmentReason(opt.key)}
                  className={`w-full p-3 rounded-xl text-left text-xs font-bold border transition ${
                    adjustmentReason === opt.key
                      ? 'bg-emerald-500/15 border-emerald-400 text-emerald-300'
                      : 'bg-slate-950 border-white/5 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setShowRegenerateModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  setShowRegenerateModal(false);
                  await generateNewWorkoutPlan();
                }}
                disabled={isLoadingAI}
                className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg transition"
              >
                {isLoadingAI ? 'Generating...' : 'Regenerate Plan Now'}
              </button>
            </div>
          </div>
        </div>
      )}

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
