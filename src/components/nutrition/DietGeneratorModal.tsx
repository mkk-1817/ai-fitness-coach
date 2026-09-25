'use client';

import React, { useState } from 'react';
import { Plus, Sparkles, X } from 'lucide-react';
import { DietGenerationOptions } from '@/types/fitness';
import { useFitnessStore } from '@/lib/store/fitness-store';
import { defaultDietOptions } from '@/lib/fitness/workout-options';

const CUISINE_SUGGESTIONS = ['Tamil', 'Chettinad', 'South Indian', 'Kerala', 'Andhra', 'North Indian', 'Mediterranean', 'Western', 'East Asian'];

interface DietGeneratorModalProps {
  onClose: () => void;
  initialOptions?: DietGenerationOptions;
}

export function DietGeneratorModal({ onClose, initialOptions }: DietGeneratorModalProps) {
  const { profile, generateNewDietPlan, dietGeneration } = useFitnessStore();
  const defaults = initialOptions ?? defaultDietOptions(profile);
  const isGenerating = dietGeneration.status === 'loading';

  const [cuisines, setCuisines] = useState<string[]>(defaults.cuisines);
  const [customCuisine, setCustomCuisine] = useState('');
  const [notes, setNotes] = useState(defaults.notes ?? '');

  const suggestions = Array.from(new Set([...profile.cuisinePreferences, ...CUISINE_SUGGESTIONS]));
  const toggle = (c: string) => setCuisines(prev => (prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]));
  const addCustom = () => {
    const c = customCuisine.trim();
    if (c && !cuisines.includes(c)) setCuisines(prev => [...prev, c]);
    setCustomCuisine('');
  };

  const handleGenerate = async () => {
    onClose();
    await generateNewDietPlan({ cuisines, notes: notes.trim() || undefined });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-emerald-400" />
            <h3 className="text-base font-bold text-white">Generate 7-Day Meal Plan with AI</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-3 rounded-2xl bg-slate-950/60 border border-white/5 text-xs text-slate-300 mb-5 space-y-0.5">
          <p>
            <strong className="text-white">{profile.targetCalories} kcal</strong> •{' '}
            <span className="text-rose-400 font-semibold">{profile.targetProteinG}g protein</span> • {profile.targetCarbsG}g carbs •{' '}
            {profile.targetFatG}g fat • {profile.mealsPerDay} meals/day
          </p>
          <p className="text-slate-400">
            {profile.dietType.replace(/_/g, ' ')}
            {profile.allergies.length > 0 && ` • allergies: ${profile.allergies.join(', ')}`}
            {profile.foodsAvoided.length > 0 && ` • avoids: ${profile.foodsAvoided.join(', ')}`}
          </p>
        </div>

        <div className="space-y-5">
          <section>
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Cuisines</h4>
            <div className="flex flex-wrap gap-2">
              {Array.from(new Set([...suggestions, ...cuisines])).map(c => (
                <button
                  key={c}
                  type="button"
                  aria-pressed={cuisines.includes(c)}
                  onClick={() => toggle(c)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold border transition ${
                    cuisines.includes(c)
                      ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                      : 'bg-slate-950 border-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
            <div className="flex gap-2 mt-2">
              <input
                type="text"
                value={customCuisine}
                onChange={e => setCustomCuisine(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addCustom();
                  }
                }}
                maxLength={40}
                placeholder="Add a cuisine or region (e.g. Kongu Nadu)"
                className="flex-1 px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
              <button
                type="button"
                onClick={addCustom}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-white/10"
                aria-label="Add cuisine"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </section>

          <section>
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2" htmlFor="diet-notes">
              Anything else? (optional)
            </label>
            <textarea
              id="diet-notes"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              maxLength={600}
              rows={3}
              placeholder="e.g. Budget-friendly, quick 20-minute dinners, more millet dishes, post-workout snack on training days"
              className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </section>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 mt-5 border-t border-white/10">
          <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white">
            Cancel
          </button>
          <button
            type="button"
            onClick={handleGenerate}
            disabled={isGenerating}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold text-xs shadow-lg transition"
          >
            <Sparkles className="h-4 w-4" />
            {isGenerating ? 'Generating…' : 'Generate 7-Day Plan'}
          </button>
        </div>
      </div>
    </div>
  );
}
