'use client';

import React, { useState } from 'react';
import { 
  Utensils, 
  Sparkles, 
  ArrowRightLeft, 
  Plus, 
  CheckCircle2, 
  Info, 
  Clock, 
  Flame, 
  Droplet
} from 'lucide-react';
import { useFitnessStore } from '@/lib/store/fitness-store';
import { MealAlternativeModal } from './MealAlternativeModal';
import { MealItem } from '@/types/fitness';

export function MealPlanView() {
  const { mealPlan, profile, generateNewDietPlan, isLoadingAI, logMeal } = useFitnessStore();
  const [selectedMealForSwap, setSelectedMealForSwap] = useState<MealItem | null>(null);
  const [justLoggedMealId, setJustLoggedMealId] = useState<string | null>(null);

  const handleQuickLog = (m: MealItem) => {
    const today = new Date().toISOString().split('T')[0];
    logMeal({
      date: today,
      mealType: m.mealType,
      foodName: m.title,
      portion: m.portionDescription,
      calories: m.calories,
      proteinG: m.proteinG,
      carbsG: m.carbsG,
      fatG: m.fatG,
      fiberG: m.fiberG,
    });
    setJustLoggedMealId(m.id);
    setTimeout(() => setJustLoggedMealId(null), 2500);
  };

  if (!mealPlan) {
    return (
      <div className="text-center py-16">
        <Utensils className="h-12 w-12 text-amber-400 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-white">No Meal Plan Generated</h2>
        <button
          onClick={() => generateNewDietPlan()}
          disabled={isLoadingAI}
          className="mt-4 px-6 py-3 bg-emerald-500 text-slate-950 font-bold rounded-2xl"
        >
          {isLoadingAI ? 'Crafting Diet...' : 'Generate AI Diet Plan'}
        </button>
      </div>
    );
  }

  const mealTypeLabels: Record<string, string> = {
    breakfast: 'Morning Fuel • Breakfast',
    mid_morning: 'Mid-Morning Snack',
    lunch: 'Main Nourishment • Lunch',
    evening_snack: 'Pre-Workout / Evening Snack',
    dinner: 'Recovery & Digest • Dinner',
    post_workout: 'Post-Workout Anabolic Window',
  };

  return (
    <div className="space-y-6">
      {/* HEADER BANNER */}
      <div className="rounded-3xl border border-white/10 bg-slate-900/90 p-6 sm:p-8 shadow-xl backdrop-blur-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-500/15 text-amber-400 border border-amber-500/30">
                {mealPlan.cuisine || 'Culturally Tailored'}
              </span>
              <span className="text-xs text-slate-400">
                {mealPlan.dietType.replace('_', ' ')} • {profile.primaryGoal.replace('_', ' ')}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {mealPlan.title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-2xl leading-relaxed">
              Targeting {mealPlan.targetCalories} kcal with {mealPlan.targetProteinG}g protein. Designed to optimize workout recovery and body composition.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => generateNewDietPlan()}
              disabled={isLoadingAI}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-white/10 transition"
            >
              <Sparkles className="h-4 w-4 text-emerald-400" />
              <span>{isLoadingAI ? 'Generating...' : 'Regenerate Diet Plan'}</span>
            </button>
          </div>
        </div>

        {/* NUTRITION TOTALS TILES */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/10">
          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-white/5 text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Target Calories</span>
            <p className="text-xl font-black text-white mt-1">{mealPlan.targetCalories} <span className="text-xs text-slate-500 font-normal">kcal</span></p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-white/5 text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400">Target Protein</span>
            <p className="text-xl font-black text-rose-400 mt-1">{mealPlan.targetProteinG} <span className="text-xs text-slate-500 font-normal">grams</span></p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-white/5 text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">Target Carbs</span>
            <p className="text-xl font-black text-cyan-400 mt-1">{mealPlan.targetCarbsG} <span className="text-xs text-slate-500 font-normal">grams</span></p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-white/5 text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Target Fats</span>
            <p className="text-xl font-black text-amber-400 mt-1">{mealPlan.targetFatG} <span className="text-xs text-slate-500 font-normal">grams</span></p>
          </div>
        </div>
      </div>

      {/* MEALS LIST */}
      <div className="space-y-4">
        {mealPlan.meals.map((meal, idx) => (
          <div
            key={meal.id || idx}
            className="rounded-3xl border border-white/10 bg-slate-900/80 p-5 sm:p-6 shadow-xl backdrop-blur-md"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                  {mealTypeLabels[meal.mealType] || meal.mealType}
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-white mt-0.5">{meal.title}</h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedMealForSwap(meal)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-xs font-bold text-slate-300 border border-white/5 transition"
                  title="Replace with alternative meal"
                >
                  <ArrowRightLeft className="h-3.5 w-3.5 text-cyan-400" />
                  <span>Replace Meal</span>
                </button>

                <button
                  onClick={() => handleQuickLog(meal)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                    justLoggedMealId === meal.id
                      ? 'bg-emerald-500 text-slate-950'
                      : 'bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 border border-emerald-500/30'
                  }`}
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>{justLoggedMealId === meal.id ? 'Logged!' : 'Log Meal'}</span>
                </button>
              </div>
            </div>

            {/* PORTION & MACROS */}
            <div className="my-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="max-w-xl">
                <span className="text-xs font-semibold text-slate-400 block mb-0.5">Recommended Serving:</span>
                <p className="text-sm text-slate-200">{meal.portionDescription}</p>
              </div>

              <div className="flex items-center gap-4 bg-slate-950/70 p-3 rounded-2xl border border-white/5 shrink-0">
                <div className="text-center">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Calories</span>
                  <p className="text-sm font-black text-white">{meal.calories} kcal</p>
                </div>
                <div className="h-6 w-px bg-white/10" />
                <div className="text-center">
                  <span className="text-[10px] text-rose-400 uppercase font-bold">Protein</span>
                  <p className="text-sm font-black text-rose-400">{meal.proteinG}g</p>
                </div>
                <div className="h-6 w-px bg-white/10" />
                <div className="text-center">
                  <span className="text-[10px] text-cyan-400 uppercase font-bold">Carbs</span>
                  <p className="text-sm font-black text-cyan-400">{meal.carbsG}g</p>
                </div>
                <div className="h-6 w-px bg-white/10" />
                <div className="text-center">
                  <span className="text-[10px] text-amber-400 uppercase font-bold">Fats</span>
                  <p className="text-sm font-black text-amber-400">{meal.fatG}g</p>
                </div>
              </div>
            </div>

            {/* QUICK PREVIEW OF ALTERNATIVES */}
            {meal.alternatives.length > 0 && (
              <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
                <span>
                  Alternatives available: <strong className="text-slate-300">{meal.alternatives[0].title}</strong> (+{meal.alternatives.length} more)
                </span>
                <button
                  onClick={() => setSelectedMealForSwap(meal)}
                  className="text-emerald-400 hover:text-emerald-300 font-semibold"
                >
                  View Options →
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* SWAP MODAL */}
      {selectedMealForSwap && (
        <MealAlternativeModal
          meal={selectedMealForSwap}
          onClose={() => setSelectedMealForSwap(null)}
        />
      )}
    </div>
  );
}
