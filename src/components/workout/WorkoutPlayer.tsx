'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Check, 
  ChevronLeft, 
  ChevronRight, 
  Video, 
  ArrowRightLeft, 
  X, 
  Clock, 
  Flame, 
  Dumbbell, 
  Plus, 
  Minus,
  AlertTriangle
} from 'lucide-react';
import { useFitnessStore } from '@/lib/store/fitness-store';
import { ExerciseDemoModal } from './ExerciseDemoModal';
import { RPEFeedbackModal } from './RPEFeedbackModal';
import { EXERCISE_LIBRARY_DATA } from '@/lib/data/exercise-data';
import { soundEffects } from '@/lib/utils/audio';
import { ExerciseItem } from '@/types/fitness';

export function WorkoutPlayer() {
  const router = useRouter();
  const { activeSession, updateActiveSession, finishActiveWorkout, cancelActiveWorkout } = useFitnessStore();

  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSetIndex, setCurrentSetIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [workoutElapsedSeconds, setWorkoutElapsedSeconds] = useState(0);

  // Rest Timer State
  const [isResting, setIsResting] = useState(false);
  const [restSecondsLeft, setRestSecondsLeft] = useState(60);
  const [totalRestDuration, setTotalRestDuration] = useState(60);

  // Modals
  const [demoModalExercise, setDemoModalExercise] = useState<ExerciseItem | null>(null);
  const [showRpeModal, setShowRpeModal] = useState(false);
  const [showSwapModal, setShowSwapModal] = useState(false);

  // Redirect if no active workout
  useEffect(() => {
    if (!activeSession) {
      router.push('/workout');
    }
  }, [activeSession, router]);

  // Overall workout timer
  useEffect(() => {
    if (!activeSession || isPaused) return;
    const interval = setInterval(() => {
      setWorkoutElapsedSeconds(prev => {
        const next = prev + 1;
        updateActiveSession(s => ({ ...s, durationSeconds: next }));
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [activeSession, isPaused, updateActiveSession]);

  // Rest countdown timer with audio cues
  useEffect(() => {
    if (!isResting) return;
    const timer = setInterval(() => {
      setRestSecondsLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsResting(false);
          soundEffects.playRestCompleteChime();
          return 0;
        }
        if (prev === 4 || prev === 3 || prev === 2) {
          soundEffects.playBeep(440, 0.08);
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isResting]);

  if (!activeSession) return null;

  const currentExercise = activeSession.exercises[currentExerciseIndex];
  if (!currentExercise) return null;

  const currentSet = currentExercise.sets[currentSetIndex] || currentExercise.sets[0];
  const totalExercises = activeSession.exercises.length;
  const isLastExercise = currentExerciseIndex === totalExercises - 1;
  const isLastSet = currentSetIndex === currentExercise.sets.length - 1;

  // Matching Exercise Library entry for video/details
  const libraryEntry = EXERCISE_LIBRARY_DATA.find(
    e => e.name.toLowerCase() === currentExercise.exerciseName.toLowerCase()
  ) || EXERCISE_LIBRARY_DATA[0];

  const handleCompleteSet = () => {
    soundEffects.playBeep(880, 0.15);

    // Mark current set complete in active session
    updateActiveSession(session => {
      const updatedExercises = [...session.exercises];
      const targetEx = { ...updatedExercises[currentExerciseIndex] };
      const updatedSets = [...targetEx.sets];
      updatedSets[currentSetIndex] = {
        ...updatedSets[currentSetIndex],
        completed: true,
      };
      targetEx.sets = updatedSets;
      updatedExercises[currentExerciseIndex] = targetEx;
      return { ...session, exercises: updatedExercises };
    });

    // Start rest timer
    const restSec = 60;
    setTotalRestDuration(restSec);
    setRestSecondsLeft(restSec);
    setIsResting(true);

    // Advance set or exercise
    if (!isLastSet) {
      setCurrentSetIndex(prev => prev + 1);
    } else if (!isLastExercise) {
      setCurrentExerciseIndex(prev => prev + 1);
      setCurrentSetIndex(0);
    }
  };

  const handleAdjustWeight = (delta: number) => {
    updateActiveSession(session => {
      const updatedExercises = [...session.exercises];
      const targetEx = { ...updatedExercises[currentExerciseIndex] };
      const updatedSets = [...targetEx.sets];
      const currentW = updatedSets[currentSetIndex].weightKg || 0;
      updatedSets[currentSetIndex] = {
        ...updatedSets[currentSetIndex],
        weightKg: Math.max(0, Number((currentW + delta).toFixed(1))),
      };
      targetEx.sets = updatedSets;
      updatedExercises[currentExerciseIndex] = targetEx;
      return { ...session, exercises: updatedExercises };
    });
  };

  const handleAdjustReps = (delta: number) => {
    updateActiveSession(session => {
      const updatedExercises = [...session.exercises];
      const targetEx = { ...updatedExercises[currentExerciseIndex] };
      const updatedSets = [...targetEx.sets];
      const currentR = updatedSets[currentSetIndex].completedReps || 10;
      updatedSets[currentSetIndex] = {
        ...updatedSets[currentSetIndex],
        completedReps: Math.max(1, currentR + delta),
      };
      targetEx.sets = updatedSets;
      updatedExercises[currentExerciseIndex] = targetEx;
      return { ...session, exercises: updatedExercises };
    });
  };

  const handleSwapExercise = (altName: string) => {
    updateActiveSession(session => {
      const updatedExercises = [...session.exercises];
      updatedExercises[currentExerciseIndex] = {
        ...updatedExercises[currentExerciseIndex],
        exerciseName: altName,
      };
      return { ...session, exercises: updatedExercises };
    });
    setShowSwapModal(false);
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  // Calculate live volume
  let currentVolume = 0;
  activeSession.exercises.forEach(ex => {
    ex.sets.forEach(st => {
      if (st.completed) {
        currentVolume += (st.weightKg || 0) * st.completedReps;
      }
    });
  });

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between">
      {/* TOP WORKOUT STATUS BAR */}
      <header className="border-b border-white/10 bg-slate-900/90 px-4 py-3 backdrop-blur-md sticky top-0 z-40">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (confirm('Exit workout player? Session will remain active in background.')) {
                  router.push('/workout');
                }
              }}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
              title="Minimize"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-sm font-bold text-white leading-tight truncate max-w-[200px] sm:max-w-md">
                {activeSession.title}
              </h1>
              <span className="text-[11px] text-slate-400">
                Exercise {currentExerciseIndex + 1} of {totalExercises}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl">
              <Clock className="h-4 w-4" />
              <span>{formatTime(workoutElapsedSeconds)}</span>
            </div>

            <button
              onClick={() => setIsPaused(!isPaused)}
              className="p-2 text-slate-300 hover:text-white rounded-xl hover:bg-slate-800 transition"
              title={isPaused ? 'Resume Workout' : 'Pause Workout'}
            >
              {isPaused ? <Play className="h-5 w-5 fill-current text-amber-400" /> : <Pause className="h-5 w-5" />}
            </button>

            <button
              onClick={() => setShowRpeModal(true)}
              className="px-3.5 py-1.5 bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white text-xs font-extrabold rounded-xl border border-rose-500/30 transition"
            >
              Finish
            </button>
          </div>
        </div>
      </header>

      {/* REST TIMER BANNER (Active during rest interval) */}
      {isResting && (
        <div className="bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-600 px-4 py-3 text-slate-950 shadow-lg">
          <div className="mx-auto flex max-w-4xl items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-slate-950 text-emerald-400 font-mono font-black text-lg flex items-center justify-center shadow-inner">
                {restSecondsLeft}s
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-wider">Rest & Recovery</p>
                <p className="text-[11px] font-medium opacity-90">Catch your breath and prepare for next set</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setRestSecondsLeft(prev => prev + 30)}
                className="px-2.5 py-1 bg-slate-950/20 hover:bg-slate-950/30 text-slate-950 font-bold text-xs rounded-lg transition"
              >
                +30s
              </button>
              <button
                onClick={() => setIsResting(false)}
                className="px-3 py-1 bg-slate-950 text-white font-bold text-xs rounded-lg shadow-md hover:bg-slate-900 transition"
              >
                Skip Rest
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MAIN EXERCISE STAGE (Mobile-first large interface) */}
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-6 flex flex-col justify-between">
        <div className="space-y-6">
          {/* EXERCISE TITLE & ACTIONS */}
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  {libraryEntry.targetMuscle}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-800 text-slate-300">
                  {libraryEntry.equipmentRequired}
                </span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                {currentExercise.exerciseName}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setDemoModalExercise(libraryEntry)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 border border-white/10 hover:border-emerald-500/40 text-xs font-bold text-emerald-400 hover:text-white transition"
              >
                <Video className="h-4 w-4" />
                <span className="hidden sm:inline">Watch Demo</span>
              </button>

              <button
                onClick={() => setShowSwapModal(true)}
                className="p-2 rounded-xl bg-slate-900 border border-white/10 hover:border-white/20 text-slate-400 hover:text-white transition"
                title="Replace Exercise"
              >
                <ArrowRightLeft className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* ACTIVE SET CARD */}
          <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 sm:p-8 shadow-2xl backdrop-blur-md">
            <div className="text-center mb-6">
              <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-400">
                Active Set
              </span>
              <div className="text-5xl sm:text-6xl font-black text-white tracking-tight mt-1">
                Set {currentSetIndex + 1} <span className="text-2xl text-slate-500 font-medium">/ {currentExercise.sets.length}</span>
              </div>
            </div>

            {/* WEIGHT & REPS ADJUSTERS */}
            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto my-6">
              {/* WEIGHT CONTROL */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-white/5 text-center">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Weight (kg)
                </span>
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => handleAdjustWeight(-2.5)}
                    className="h-10 w-10 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold flex items-center justify-center border border-white/5 active:scale-95 transition"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="text-3xl font-black text-white">{currentSet.weightKg || 0}</span>
                  <button
                    onClick={() => handleAdjustWeight(2.5)}
                    className="h-10 w-10 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold flex items-center justify-center border border-white/5 active:scale-95 transition"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* REPS CONTROL */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-white/5 text-center">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Completed Reps
                </span>
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => handleAdjustReps(-1)}
                    className="h-10 w-10 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold flex items-center justify-center border border-white/5 active:scale-95 transition"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="text-3xl font-black text-white">{currentSet.completedReps || 10}</span>
                  <button
                    onClick={() => handleAdjustReps(1)}
                    className="h-10 w-10 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold flex items-center justify-center border border-white/5 active:scale-95 transition"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* SETS PROGRESS CHECKLIST */}
            <div className="flex justify-center gap-2 my-4">
              {currentExercise.sets.map((st, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSetIndex(idx)}
                  className={`h-9 px-3.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                    idx === currentSetIndex
                      ? 'bg-emerald-500 text-slate-950 ring-2 ring-emerald-400'
                      : st.completed
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-slate-950 text-slate-400 border border-white/5'
                  }`}
                >
                  {st.completed && <Check className="h-3 w-3" />}
                  <span>Set {idx + 1}</span>
                </button>
              ))}
            </div>

            {/* FORM NOTE & TIP */}
            {libraryEntry.formTips.length > 0 && (
              <p className="text-xs text-center text-slate-400 max-w-lg mx-auto italic mt-4">
                💡 Tip: {libraryEntry.formTips[0]}
              </p>
            )}
          </div>
        </div>

        {/* BOTTOM EXECUTION & NAVIGATION CONTROLS */}
        <div className="pt-6 space-y-4">
          {/* PRIMARY COMPLETE BUTTON */}
          <button
            onClick={handleCompleteSet}
            className="w-full py-5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 text-slate-950 text-lg font-black tracking-wide shadow-2xl shadow-emerald-500/30 hover:scale-[1.01] active:scale-[0.98] transition flex items-center justify-center gap-3 cursor-pointer"
          >
            <Check className="h-6 w-6 stroke-[3]" />
            <span>COMPLETE SET {currentSetIndex + 1}</span>
          </button>

          {/* PREVIOUS / NEXT EXERCISE */}
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={() => {
                if (currentExerciseIndex > 0) {
                  setCurrentExerciseIndex(prev => prev - 1);
                  setCurrentSetIndex(0);
                }
              }}
              disabled={currentExerciseIndex === 0}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 text-xs font-bold text-slate-300 disabled:opacity-40 hover:bg-slate-800 transition"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Previous Exercise</span>
            </button>

            <span className="text-xs text-slate-500">
              Volume: {currentVolume} kg
            </span>

            <button
              onClick={() => {
                if (currentExerciseIndex < totalExercises - 1) {
                  setCurrentExerciseIndex(prev => prev + 1);
                  setCurrentSetIndex(0);
                } else {
                  setShowRpeModal(true);
                }
              }}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 text-xs font-bold text-slate-300 hover:bg-slate-800 transition"
            >
              <span>{isLastExercise ? 'Finish Workout' : 'Next Exercise'}</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </main>

      {/* EXERCISE DEMONSTRATION MODAL */}
      {demoModalExercise && (
        <ExerciseDemoModal
          exercise={demoModalExercise}
          onClose={() => setDemoModalExercise(null)}
        />
      )}

      {/* SWAP EXERCISE MODAL */}
      {showSwapModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <h3 className="text-base font-bold text-white">Substitute Exercise</h3>
              <button onClick={() => setShowSwapModal(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Replace <strong className="text-white">{currentExercise.exerciseName}</strong> with an alternative targeting the same muscle group:
            </p>
            <div className="space-y-2">
              {EXERCISE_LIBRARY_DATA.filter(e => e.name !== currentExercise.exerciseName).slice(0, 5).map(alt => (
                <button
                  key={alt.id}
                  onClick={() => handleSwapExercise(alt.name)}
                  className="w-full p-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-white/5 flex items-center justify-between text-left transition"
                >
                  <div>
                    <p className="text-sm font-bold text-white">{alt.name}</p>
                    <p className="text-xs text-slate-400">{alt.targetMuscle} • {alt.equipmentRequired}</p>
                  </div>
                  <Check className="h-4 w-4 text-emerald-400" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* RPE & WORKOUT SUMMARY MODAL */}
      {showRpeModal && (
        <RPEFeedbackModal
          sessionSummary={{
            title: activeSession.title,
            durationSeconds: workoutElapsedSeconds,
            volumeKg: currentVolume,
          }}
          onCancel={() => setShowRpeModal(false)}
          onComplete={async (feedback) => {
            await finishActiveWorkout(feedback);
            setShowRpeModal(false);
            router.push('/history');
          }}
        />
      )}
    </div>
  );
}
