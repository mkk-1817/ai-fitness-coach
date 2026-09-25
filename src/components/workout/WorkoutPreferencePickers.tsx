'use client';

import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { WorkoutType } from '@/types/fitness';
import { SPORTS_CARDIO_ACTIVITIES, WORKOUT_TYPE_OPTIONS } from '@/lib/fitness/workout-options';

export function WorkoutTypePicker({ value, onChange }: { value: WorkoutType; onChange: (v: WorkoutType) => void }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2" role="radiogroup" aria-label="Workout type">
      {WORKOUT_TYPE_OPTIONS.map(opt => (
        <button
          key={opt.value}
          type="button"
          role="radio"
          aria-checked={value === opt.value}
          onClick={() => onChange(opt.value)}
          className={`p-3 rounded-xl text-left border transition ${
            value === opt.value
              ? 'bg-emerald-500/15 border-emerald-400 text-emerald-300'
              : 'bg-slate-950 border-white/10 text-slate-300 hover:border-white/20'
          }`}
        >
          <span className="block text-xs font-bold">{opt.label}</span>
          <span className="block text-[10px] text-slate-400 mt-0.5 leading-snug">{opt.description}</span>
        </button>
      ))}
    </div>
  );
}

/** Multi-select of sports & cardio activities plus free-text custom activities. */
export function ActivityPicker({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const [custom, setCustom] = useState('');
  const presets = SPORTS_CARDIO_ACTIVITIES.map(a => a.value);
  const customSelected = value.filter(v => !presets.includes(v));

  const toggle = (activity: string) =>
    onChange(value.includes(activity) ? value.filter(a => a !== activity) : [...value, activity]);

  const addCustom = () => {
    const name = custom.trim();
    if (name && !value.some(v => v.toLowerCase() === name.toLowerCase())) onChange([...value, name]);
    setCustom('');
  };

  return (
    <div className="space-y-2.5">
      {(['cardio', 'sports'] as const).map(kind => (
        <div key={kind}>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{kind === 'cardio' ? 'Cardio' : 'Sports'}</span>
          <div className="flex flex-wrap gap-2 mt-1">
            {SPORTS_CARDIO_ACTIVITIES.filter(a => a.kind === kind).map(a => (
              <button
                key={a.value}
                type="button"
                aria-pressed={value.includes(a.value)}
                onClick={() => toggle(a.value)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold border transition ${
                  value.includes(a.value)
                    ? kind === 'cardio'
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                      : 'bg-amber-500/20 border-amber-400 text-amber-300'
                    : 'bg-slate-950 border-white/10 text-slate-400 hover:text-white'
                }`}
              >
                {a.value}
              </button>
            ))}
          </div>
        </div>
      ))}

      {customSelected.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {customSelected.map(a => (
            <span key={a} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold bg-purple-500/20 border border-purple-400 text-purple-300">
              {a}
              <button type="button" onClick={() => toggle(a)} aria-label={`Remove ${a}`}>
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <input
          type="text"
          value={custom}
          onChange={e => setCustom(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addCustom();
            }
          }}
          maxLength={40}
          placeholder="Add another (e.g. Kabaddi, Hiking, Rowing)"
          className="flex-1 px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
        />
        <button
          type="button"
          onClick={addCustom}
          className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-white/10"
          aria-label="Add activity"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
