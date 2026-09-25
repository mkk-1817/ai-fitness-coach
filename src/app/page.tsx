'use client';

import React from 'react';
import Link from 'next/link';
import { TodayWorkoutCard } from '@/components/dashboard/TodayWorkoutCard';
import { MacroRings } from '@/components/dashboard/MacroRings';
import { WaterTracker } from '@/components/dashboard/WaterTracker';
import { StreakMilestone } from '@/components/dashboard/StreakMilestone';
import { AICoachInsight } from '@/components/dashboard/AICoachInsight';
import { Dumbbell, Utensils, MessageSquare, Plus, TrendingUp, Sparkles } from 'lucide-react';
import { useFitnessStore } from '@/lib/store/fitness-store';

export default function DashboardPage() {
  const { profile, workoutPlan } = useFitnessStore();

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* WELCOME BANNER & GREETING */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1.5 mb-1">
            <Sparkles className="h-3.5 w-3.5" />
            Adaptive Training Protocol
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Welcome back, {profile.name}!
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Targeting <strong className="text-white">{profile.primaryGoal.replace('_', ' ')}</strong> with {profile.workoutDaysPerWeek} training days/week.
          </p>
        </div>

        {/* QUICK ACTION BUTTONS */}
        <div className="flex items-center gap-2">
          <Link
            href="/coach"
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold border border-white/10 shadow-sm transition"
          >
            <MessageSquare className="h-4 w-4 text-emerald-400" />
            <span>Ask Coach</span>
          </Link>

          <Link
            href="/nutrition"
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold border border-white/10 shadow-sm transition"
          >
            <Utensils className="h-4 w-4 text-amber-400" />
            <span>Log Meal</span>
          </Link>
        </div>
      </div>

      {/* AI COACH DAILY INSIGHT */}
      <AICoachInsight />

      {/* HERO: TODAY'S WORKOUT CARD */}
      <TodayWorkoutCard />

      {/* NUTRITION & HYDRATION ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MacroRings />
        <WaterTracker />
      </div>

      {/* STREAK & MILESTONES ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <StreakMilestone />
        </div>

        {/* QUICK ROUTINE OVERVIEW */}
        <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-5 sm:p-6 shadow-xl backdrop-blur-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <h3 className="text-base font-bold text-white">Active Split Overview</h3>
              <Link href="/workout" className="text-xs font-semibold text-emerald-400 hover:text-emerald-300">
                View All
              </Link>
            </div>

            <p className="text-xs text-slate-400 mb-4">
              {workoutPlan?.splitType || 'Upper/Lower Split'} • {profile.availableEquipment.join(', ')}
            </p>

            <div className="space-y-2.5">
              {workoutPlan?.days.slice(0, 4).map((d) => (
                <div key={d.id} className="p-3 rounded-2xl bg-slate-950/70 border border-white/5 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-white">{d.dayName}</p>
                    <p className="text-slate-400 text-[11px] truncate max-w-[170px]">{d.focus}</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    d.isRestDay ? 'bg-teal-500/10 text-teal-400' : 'bg-emerald-500/10 text-emerald-400'
                  }`}>
                    {d.isRestDay ? 'Rest' : `${d.exercises.length} Ex`}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <Link
            href="/workout"
            className="mt-4 w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-center text-xs font-bold text-slate-200 transition"
          >
            Manage Workout Routine →
          </Link>
        </div>
      </div>
    </div>
  );
}
