'use client';

import React, { useState } from 'react';
import {
  Utensils,
  Sparkles,
  ArrowRightLeft,
  CheckCircle2,
  Droplet,
  Lightbulb,
} from 'lucide-react';
import { useFitnessStore } from '@/lib/store/fitness-store';
import { MealAlternativeModal } from './MealAlternativeModal';
import { DietGeneratorModal } from './DietGeneratorModal';
import { GenerationStatus } from '@/components/ai/GenerationStatus';
import { PlanHistoryPanel } from '@/components/ai/PlanHistoryPanel';
import { computeMealDayTotals } from '@/lib/groq/plan-review';
import { DietGenerationOptions, MealItem, MealPlan, MealPlanDay } from '@/types/fitness';

const mealTypeLabels: Record<string, string> = {
  breakfast: 'Morning Fuel • Breakfast',
  mid_morning: 'Mid-Morning Snack',
  lunch: 'Main Nourishment • Lunch',
  evening_snack: 'Pre-Workout / Evening Snack',
  dinner: 'Recovery & Digest • Dinner',
  post_workout: 'Post-Workout Recovery',
};

/** 7-day plans use `days`; plans saved before the refactor only had one day of `meals`. */
function getPlanDays(plan: MealPlan): MealPlanDay[] {
  if (plan.days && plan.days.length > 0) return plan.days;
  const meals = plan.meals || [];
  return [{ id: 'legacy_day', dayName: 'Daily Plan', dayOrder: 1, meals, totals: computeMealDayTotals(meals) }];
}

export function MealPlanView() {
  const {
    mealPlan,
    mealPlanHistory,
    dietGeneration,
    isHistoryLoading,
    historyError,
    profile,
    logMeal,
    generateNewDietPlan,
    retryDietGeneration,
    dismissGenerationState,
    activateHistoricalPlan,
    deleteHistoricalPlan,
  } = useFitnessStore();

  const [selectedMealForSwap, setSelectedMealForSwap] = useState<MealItem | null>(null);
  const [justLoggedMealId, setJustLoggedMealId] = useState<string | null>(null);
  const [selectedDayId, setSelectedDayId] = useState<string | null>(null);
  const [showGenerator, setShowGenerator] = useState(false);
  const [generatorOptions, setGeneratorOptions] = useState<DietGenerationOptions | undefined>(undefined);

  const isGenerating = dietGeneration.status === 'loading';

  const openGenerator = (options?: DietGenerationOptions) => {
    setGeneratorOptions(options);
    setShowGenerator(true);
  };

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

  const status = (
    <GenerationStatus
      state={dietGeneration}
      label="7-day meal plan"
      onRetry={retryDietGeneration}
      onDismiss={() => dismissGenerationState('meal')}
      onAdjust={() => openGenerator(mealPlan?.generationOptions)}
    />
  );

  const history = (
    <PlanHistoryPanel
      title="Meal Plan History"
      items={mealPlanHistory.map(p => ({
        id: p.id,
        title: p.title,
        createdAt: p.createdAt,
        isActive: p.id === mealPlan?.id,
        tags: [`${p.targetCalories} kcal`, p.cuisine].filter(Boolean),
      }))}
      isLoading={isHistoryLoading}
      error={historyError}
      isGenerating={isGenerating}
      onActivate={id => activateHistoricalPlan('meal', id)}
      onRegenerate={id => generateNewDietPlan(mealPlanHistory.find(p => p.id === id)?.generationOptions)}
      onDelete={id => deleteHistoricalPlan('meal', id)}
    />
  );

  const generatorModal = showGenerator && (
    <DietGeneratorModal initialOptions={generatorOptions} onClose={() => setShowGenerator(false)} />
  );

  if (!mealPlan) {
    return (
      <div className="space-y-6">
        {status}
        <div className="text-center py-16 rounded-3xl border border-white/10 bg-slate-900/80">
          <Utensils className="h-12 w-12 text-amber-400 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-white">No Meal Plan Generated</h2>
          <p className="text-xs text-slate-400 mt-2 max-w-md mx-auto">
            The AI creates a 7-day plan from your calorie & protein targets, diet type, allergies and favourite cuisines — including regional Tamil and South Indian dishes.
          </p>
          <button
            onClick={() => openGenerator()}
            disabled={isGenerating}
            className="mt-5 inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 text-slate-950 font-bold rounded-2xl"
          >
            <Sparkles className="h-4 w-4" />
            {isGenerating ? 'Crafting Diet…' : 'Generate AI Diet Plan'}
          </button>
        </div>
        {mealPlanHistory.length > 0 && history}
        {generatorModal}
      </div>
    );
  }

  const days = getPlanDays(mealPlan);
  const todayOrder = ((new Date().getDay() + 6) % 7) + 1;
  const selectedDay =
    days.find(d => d.id === selectedDayId) || days.find(d => d.dayOrder === todayOrder) || days[0];
  // Always derive totals from the meals shown (swaps change them).
  const totals = computeMealDayTotals(selectedDay.meals);

  return (
    <div className="space-y-6">
      {status}

      {/* HEADER BANNER */}
      <div className="rounded-3xl border border-white/10 bg-slate-900/90 p-6 sm:p-8 shadow-xl backdrop-blur-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-500/15 text-amber-400 border border-amber-500/30">
                {mealPlan.cuisine || 'Culturally Tailored'}
              </span>
              <span className="text-xs text-slate-400">
                {mealPlan.dietType.replace(/_/g, ' ')} • {profile.primaryGoal.replace(/_/g, ' ')} • {days.length}-day plan
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {mealPlan.title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-2xl leading-relaxed">
              {mealPlan.cuisineNotes || `Targeting ${mealPlan.targetCalories} kcal with ${mealPlan.targetProteinG}g protein.`}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => openGenerator(mealPlan.generationOptions)}
              disabled={isGenerating}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 disabled:opacity-60 text-xs font-bold text-slate-200 border border-white/10 transition"
            >
              <Sparkles className="h-4 w-4 text-emerald-400" />
              <span>{isGenerating ? 'Generating…' : 'Regenerate Diet Plan'}</span>
            </button>
          </div>
        </div>

        {mealPlan.hydrationAdvice && (
          <div className="mt-5 p-3 rounded-2xl bg-cyan-500/5 border border-cyan-500/20 text-xs text-cyan-100/90 flex items-start gap-2">
            <Droplet className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
            <span>{mealPlan.hydrationAdvice}</span>
          </div>
        )}

        {/* DAY SELECTOR */}
        {days.length > 1 && (
          <div className="mt-6 flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            {days.map(day => {
              const isSelected = day.id === selectedDay.id;
              return (
                <button
                  key={day.id}
                  onClick={() => setSelectedDayId(day.id)}
                  className={`flex flex-col items-start px-4 py-2.5 rounded-2xl text-left transition shrink-0 border ${
                    isSelected
                      ? 'bg-amber-500/15 border-amber-500/40 text-white'
                      : 'bg-slate-950/60 border-white/5 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${isSelected ? 'text-amber-400' : 'text-slate-500'}`}>
                    {day.dayName}{day.dayOrder === todayOrder ? ' • Today' : ''}
                  </span>
                  <span className="text-[11px] mt-0.5 whitespace-nowrap">{computeMealDayTotals(day.meals).calories} kcal</span>
                </button>
              );
            })}
          </div>
        )}

        {/* DAILY TOTALS VS TARGETS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-white/10">
          {[
            { label: 'Calories', value: totals.calories, target: mealPlan.targetCalories, unit: 'kcal', color: 'text-white' },
            { label: 'Protein', value: totals.proteinG, target: mealPlan.targetProteinG, unit: 'g', color: 'text-rose-400' },
            { label: 'Carbs', value: totals.carbsG, target: mealPlan.targetCarbsG, unit: 'g', color: 'text-cyan-400' },
            { label: 'Fats', value: totals.fatG, target: mealPlan.targetFatG, unit: 'g', color: 'text-amber-400' },
          ].map(t => (
            <div key={t.label} className="p-3.5 rounded-2xl bg-slate-950/60 border border-white/5 text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{t.label}</span>
              <p className={`text-xl font-black mt-1 ${t.color}`}>
                {t.value} <span className="text-xs text-slate-500 font-normal">{t.unit}</span>
              </p>
              <p className="text-[10px] text-slate-500">target {t.target} {t.unit}</p>
            </div>
          ))}
        </div>
        {selectedDay.theme && (
          <p className="text-xs text-slate-400 mt-3 flex items-center gap-1.5">
            <Lightbulb className="h-3.5 w-3.5 text-amber-400" />
            {selectedDay.theme}
          </p>
        )}
      </div>

      {/* MEALS LIST */}
      <div className="space-y-4">
        {selectedDay.meals.map((meal, idx) => (
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
              <div className="max-w-xl space-y-1.5">
                <span className="text-xs font-semibold text-slate-400 block">Recommended Serving:</span>
                <p className="text-sm text-slate-200">{meal.portionDescription}</p>
                {meal.ingredients && meal.ingredients.length > 0 && (
                  <p className="text-[11px] text-slate-400">
                    <span className="font-semibold text-slate-300">Ingredients:</span> {meal.ingredients.join(', ')}
                  </p>
                )}
                {meal.prepNotes && <p className="text-[11px] text-emerald-400/80 italic">💡 {meal.prepNotes}</p>}
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
                  Alternatives available: <strong className="text-slate-300">{meal.alternatives[0].title}</strong>
                  {meal.alternatives.length > 1 && ` (+${meal.alternatives.length - 1} more)`}
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

      {history}
      {generatorModal}

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
