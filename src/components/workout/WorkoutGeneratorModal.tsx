'use client';

import React, { useState } from 'react';
import { Sparkles, X } from 'lucide-react';
import { WorkoutGenerationOptions, WorkoutType } from '@/types/fitness';
import { useFitnessStore } from '@/lib/store/fitness-store';
import {
  TARGET_MUSCLE_OPTIONS,
  WORKOUT_ADJUSTMENT_OPTIONS,
  defaultWorkoutOptions,
} from '@/lib/fitness/workout-options';
import { ActivityPicker, WorkoutTypePicker } from './WorkoutPreferencePickers';

interface WorkoutGeneratorModalProps {
  onClose: () => void;
  /** Pre-fill from an earlier plan's settings (defaults to the profile's preferences). */
  initialOptions?: WorkoutGenerationOptions;
}

const DURATION_OPTIONS = [15, 20, 30, 45, 60, 75, 90];

export function WorkoutGeneratorModal({ onClose, initialOptions }: WorkoutGeneratorModalProps) {
  const { profile, saveProfile, generateNewWorkoutPlan, workoutGeneration } = useFitnessStore();
  const isGenerating = workoutGeneration.status === 'loading';
  const defaults = initialOptions ?? defaultWorkoutOptions(profile);

  const [workoutType, setWorkoutType] = useState<WorkoutType>(defaults.workoutType);
  const [activities, setActivities] = useState<string[]>(defaults.preferredActivities);
  const [targetMuscles, setTargetMuscles] = useState<string[]>(defaults.targetMuscles);
  const [daysPerWeek, setDaysPerWeek] = useState(defaults.daysPerWeek);
  const [duration, setDuration] = useState(defaults.sessionDurationMins);
  const [adjustment, setAdjustment] = useState<string | undefined>(defaults.adjustment);
  const [notes, setNotes] = useState(defaults.notes ?? '');
  const [rememberPrefs, setRememberPrefs] = useState(true);

  const needsActivities = workoutType === 'sports' && activities.length === 0;
  const showMuscles = workoutType === 'strength' || workoutType === 'hiit' || workoutType === 'mixed';

  const toggleMuscle = (m: string) =>
    setTargetMuscles(prev => (prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m]));

  const handleGenerate = async () => {
    const options: WorkoutGenerationOptions = {
      workoutType,
      preferredActivities: activities,
      targetMuscles: showMuscles ? targetMuscles : [],
      daysPerWeek,
      sessionDurationMins: duration,
      adjustment,
      notes: notes.trim() || undefined,
    };

    let sourceProfile = profile;
    if (rememberPrefs) {
      sourceProfile = { ...profile, preferredWorkoutType: workoutType, preferredActivities: activities, updatedAt: new Date().toISOString() };
      await saveProfile(sourceProfile);
    }
    onClose();
    await generateNewWorkoutPlan(options, sourceProfile);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-5">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-emerald-400" />
            <h3 className="text-base font-bold text-white">Generate Workout Plan with AI</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="text-xs text-slate-400 mb-5">
          Your profile ({profile.experienceLevel}, {profile.primaryGoal.replace(/_/g, ' ')}, {profile.trainingLocation} •{' '}
          {profile.availableEquipment.join(', ') || 'Bodyweight'}
          {profile.injuries.length > 0 && ` • injuries: ${profile.injuries.join(', ')}`}) is always included.
        </p>

        <div className="space-y-6">
          <section>
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Workout Type</h4>
            <WorkoutTypePicker value={workoutType} onChange={setWorkoutType} />
          </section>

          <section>
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">Sports & Cardio Activities</h4>
            <p className="text-[11px] text-slate-500 mb-2">
              {workoutType === 'strength' || workoutType === 'mobility'
                ? 'Optional — selected activities are added as conditioning or active-recovery sessions.'
                : 'The AI will schedule each selected activity into your week.'}
            </p>
            <ActivityPicker value={activities} onChange={setActivities} />
            {needsActivities && (
              <p className="text-[11px] text-amber-400 mt-2">Pick at least one sport for a Sports plan.</p>
            )}
          </section>

          {showMuscles && (
            <section>
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Target Muscles (optional)</h4>
              <div className="flex flex-wrap gap-2">
                {TARGET_MUSCLE_OPTIONS.map(m => (
                  <button
                    key={m}
                    type="button"
                    aria-pressed={targetMuscles.includes(m)}
                    onClick={() => toggleMuscle(m)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold border transition ${
                      targetMuscles.includes(m)
                        ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                        : 'bg-slate-950 border-white/10 text-slate-400 hover:text-white'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </section>
          )}

          <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-2">
                Training days / week: <span className="text-emerald-400">{daysPerWeek}</span>
              </label>
              <input
                type="range"
                min={1}
                max={7}
                value={daysPerWeek}
                onChange={e => setDaysPerWeek(Number(e.target.value))}
                className="w-full accent-emerald-500"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-2" htmlFor="session-duration">Session duration</label>
              <select
                id="session-duration"
                value={duration}
                onChange={e => setDuration(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-white/10 text-xs text-white"
              >
                {Array.from(new Set([...DURATION_OPTIONS, duration])).sort((a, b) => a - b).map(d => (
                  <option key={d} value={d}>{d} minutes</option>
                ))}
              </select>
            </div>
          </section>

          <section>
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Adapt for (optional)</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {WORKOUT_ADJUSTMENT_OPTIONS.map(opt => (
                <button
                  key={opt.key}
                  type="button"
                  aria-pressed={adjustment === opt.key}
                  onClick={() => setAdjustment(prev => (prev === opt.key ? undefined : opt.key))}
                  className={`p-2.5 rounded-xl text-left text-[11px] font-bold border transition ${
                    adjustment === opt.key
                      ? 'bg-emerald-500/15 border-emerald-400 text-emerald-300'
                      : 'bg-slate-950 border-white/5 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </section>

          <section>
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2" htmlFor="workout-notes">
              Anything else? (optional)
            </label>
            <textarea
              id="workout-notes"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              maxLength={600}
              rows={2}
              placeholder="e.g. Cricket match every Saturday morning, prefer running on Tuesdays"
              className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </section>

          <label className="flex items-center gap-2 text-xs text-slate-300">
            <input
              type="checkbox"
              checked={rememberPrefs}
              onChange={e => setRememberPrefs(e.target.checked)}
              className="accent-emerald-500"
            />
            Save workout type & activities to my profile
          </label>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 mt-5 border-t border-white/10">
          <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white">
            Cancel
          </button>
          <button
            type="button"
            onClick={handleGenerate}
            disabled={isGenerating || needsActivities}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold text-xs shadow-lg transition"
          >
            <Sparkles className="h-4 w-4" />
            {isGenerating ? 'Generating…' : 'Generate Plan'}
          </button>
        </div>
      </div>
    </div>
  );
}
