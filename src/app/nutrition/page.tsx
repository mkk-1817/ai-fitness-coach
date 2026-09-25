'use client';

import React, { useState } from 'react';
import { MealPlanView } from '@/components/nutrition/MealPlanView';
import { NutritionLogger } from '@/components/nutrition/NutritionLogger';
import { Utensils, PlusCircle } from 'lucide-react';

export default function NutritionPage() {
  const [tab, setTab] = useState<'plan' | 'logger'>('plan');

  return (
    <div className="space-y-6">
      {/* SUB-HEADER TABS */}
      <div className="flex gap-2">
        <button
          onClick={() => setTab('plan')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition border ${
            tab === 'plan'
              ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md'
              : 'bg-slate-900 text-slate-400 border-white/10 hover:text-white'
          }`}
        >
          <Utensils className="h-4 w-4" />
          <span>AI Generated Meal Plan</span>
        </button>

        <button
          onClick={() => setTab('logger')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition border ${
            tab === 'logger'
              ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md'
              : 'bg-slate-900 text-slate-400 border-white/10 hover:text-white'
          }`}
        >
          <PlusCircle className="h-4 w-4" />
          <span>Log Foods & Intake</span>
        </button>
      </div>

      {tab === 'plan' ? <MealPlanView /> : <NutritionLogger />}
    </div>
  );
}
