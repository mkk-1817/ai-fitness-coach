'use client';

import React from 'react';
import Link from 'next/link';
import { Utensils, Plus, ChevronRight } from 'lucide-react';
import { useFitnessStore } from '@/lib/store/fitness-store';

export function MacroRings() {
  const { profile, mealLogs } = useFitnessStore();

  const today = new Date().toISOString().split('T')[0];
  const todayMeals = mealLogs.filter(m => m.date === today);

  const consumedCalories = todayMeals.reduce((acc, m) => acc + (m.calories || 0), 0);
  const consumedProtein = todayMeals.reduce((acc, m) => acc + (m.proteinG || 0), 0);
  const consumedCarbs = todayMeals.reduce((acc, m) => acc + (m.carbsG || 0), 0);
  const consumedFat = todayMeals.reduce((acc, m) => acc + (m.fatG || 0), 0);

  const calTarget = profile.targetCalories || 2400;
  const protTarget = profile.targetProteinG || 160;
  const carbsTarget = profile.targetCarbsG || 250;
  const fatTarget = profile.targetFatG || 65;

  const calPct = Math.min(100, Math.round((consumedCalories / calTarget) * 100));
  const protPct = Math.min(100, Math.round((consumedProtein / protTarget) * 100));
  const carbsPct = Math.min(100, Math.round((consumedCarbs / carbsTarget) * 100));
  const fatPct = Math.min(100, Math.round((consumedFat / fatTarget) * 100));

  return (
    <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-5 sm:p-6 shadow-xl backdrop-blur-md">
      <div className="flex items-center justify-between pb-4 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Utensils className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Daily Nutrition Targets</h3>
            <p className="text-xs text-slate-400">Personalized for {profile.primaryGoal.replace('_', ' ')}</p>
          </div>
        </div>
        <Link 
          href="/nutrition"
          className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
        >
          <span>Log Meal</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* CALORIES HERO ROW */}
      <div className="my-5 p-4 rounded-2xl bg-slate-950/70 border border-white/5 flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Calories Consumed</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-black tracking-tight text-white">{consumedCalories}</span>
            <span className="text-sm font-medium text-slate-400">/ {calTarget} kcal</span>
          </div>
        </div>
        <div className="text-right">
          <span className="text-xs font-bold text-emerald-400 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            {calTarget - consumedCalories > 0 ? `${calTarget - consumedCalories} kcal left` : 'Goal met!'}
          </span>
          <div className="w-24 bg-slate-800 rounded-full h-2 mt-3 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-emerald-500 to-teal-400 h-2 rounded-full transition-all duration-500" 
              style={{ width: `${calPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* MACRO PROGRESS BARS */}
      <div className="space-y-3.5">
        {/* PROTEIN */}
        <div>
          <div className="flex justify-between text-xs mb-1.5 font-medium">
            <span className="text-rose-400 font-bold flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-rose-400" />
              Protein (Goal Focus)
            </span>
            <span className="text-slate-300">
              <strong className="text-white font-bold">{Math.round(consumedProtein)}g</strong> / {protTarget}g ({protPct}%)
            </span>
          </div>
          <div className="h-2 w-full bg-slate-800/80 rounded-full overflow-hidden">
            <div 
              className="h-full bg-rose-500 rounded-full transition-all duration-500"
              style={{ width: `${protPct}%` }}
            />
          </div>
        </div>

        {/* CARBS */}
        <div>
          <div className="flex justify-between text-xs mb-1.5 font-medium">
            <span className="text-cyan-400 font-bold flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-cyan-400" />
              Carbohydrates
            </span>
            <span className="text-slate-300">
              <strong className="text-white font-bold">{Math.round(consumedCarbs)}g</strong> / {carbsTarget}g ({carbsPct}%)
            </span>
          </div>
          <div className="h-2 w-full bg-slate-800/80 rounded-full overflow-hidden">
            <div 
              className="h-full bg-cyan-500 rounded-full transition-all duration-500"
              style={{ width: `${carbsPct}%` }}
            />
          </div>
        </div>

        {/* FATS */}
        <div>
          <div className="flex justify-between text-xs mb-1.5 font-medium">
            <span className="text-amber-400 font-bold flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-amber-400" />
              Healthy Fats
            </span>
            <span className="text-slate-300">
              <strong className="text-white font-bold">{Math.round(consumedFat)}g</strong> / {fatTarget}g ({fatPct}%)
            </span>
          </div>
          <div className="h-2 w-full bg-slate-800/80 rounded-full overflow-hidden">
            <div 
              className="h-full bg-amber-500 rounded-full transition-all duration-500"
              style={{ width: `${fatPct}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
