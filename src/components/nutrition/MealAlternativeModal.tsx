'use client';

import React from 'react';
import { X, ArrowRightLeft, Sparkles, Check } from 'lucide-react';
import { MealItem } from '@/types/fitness';
import { useFitnessStore } from '@/lib/store/fitness-store';

interface MealAlternativeModalProps {
  meal: MealItem;
  onClose: () => void;
}

export function MealAlternativeModal({ meal, onClose }: MealAlternativeModalProps) {
  const { replaceMealWithAlternative } = useFitnessStore();

  const handleSelectAlternative = (index: number) => {
    replaceMealWithAlternative(meal.id, index);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-2xl">
        {/* HEADER */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ArrowRightLeft className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Smart Meal Substitution</h3>
              <p className="text-xs text-slate-400">Preserves identical calorie & protein targets</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* CURRENT SELECTION */}
        <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-white/5 mb-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Currently Prescribed</span>
          <p className="text-sm font-bold text-white mt-0.5">{meal.title}</p>
          <div className="flex gap-3 text-xs text-slate-400 mt-1">
            <span>{meal.calories} kcal</span>
            <span>•</span>
            <span className="text-rose-400 font-semibold">{meal.proteinG}g protein</span>
            <span>•</span>
            <span>{meal.carbsG}g carbs</span>
          </div>
        </div>

        {/* ALTERNATIVES LIST */}
        <div className="space-y-3 mb-6">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
            Culturally Matched Alternatives
          </span>

          {meal.alternatives.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center">
              No direct alternatives saved for this meal item.
            </p>
          ) : (
            meal.alternatives.map((alt, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-slate-950 border border-white/5 hover:border-emerald-500/30 transition flex items-center justify-between gap-3 group"
              >
                <div>
                  <h4 className="text-sm font-bold text-white group-hover:text-emerald-400 transition">
                    {alt.title}
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">{alt.portion}</p>
                  <div className="flex gap-2.5 text-[11px] text-slate-400 mt-1.5">
                    <span className="font-semibold text-slate-300">{alt.calories} kcal</span>
                    <span>•</span>
                    <span className="text-rose-400 font-semibold">{alt.proteinG}g protein</span>
                    <span>•</span>
                    <span>{alt.carbsG}g carbs</span>
                  </div>
                  {alt.notes && (
                    <p className="text-[10px] text-emerald-400/80 mt-1 italic">
                      💡 {alt.notes}
                    </p>
                  )}
                </div>

                <button
                  onClick={() => handleSelectAlternative(idx)}
                  className="shrink-0 px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md transition flex items-center gap-1"
                >
                  <Check className="h-3.5 w-3.5" />
                  <span>Choose</span>
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
