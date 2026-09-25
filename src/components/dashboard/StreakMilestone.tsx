'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Flame, Trophy, Scale, Award, ArrowDownRight, ArrowUpRight, Plus } from 'lucide-react';
import { useFitnessStore } from '@/lib/store/fitness-store';

export function StreakMilestone() {
  const { profile, badges, weightLogs, workoutSessions, logWeight } = useFitnessStore();
  const [showWeightInput, setShowWeightInput] = useState(false);
  const [newWeight, setNewWeight] = useState(profile.weightKg.toString());

  const unlockedCount = badges.filter(b => b.isUnlocked).length;
  const initialWeight = weightLogs.length > 0 ? weightLogs[0].weightKg : profile.weightKg;
  const currentWeight = profile.weightKg;
  const weightDelta = Number((currentWeight - initialWeight).toFixed(1));

  const totalSessionsCount = workoutSessions.length;

  const handleSaveWeight = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(newWeight);
    if (!isNaN(val) && val > 30 && val < 300) {
      logWeight(val, 'User check-in');
      setShowWeightInput(false);
    }
  };

  return (
    <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-5 sm:p-6 shadow-xl backdrop-blur-md">
      <div className="flex items-center justify-between pb-4 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Trophy className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Milestones & Streak</h3>
            <p className="text-xs text-slate-400">Consistency & Performance</p>
          </div>
        </div>
        <span className="text-xs font-bold text-purple-400 px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/20">
          {unlockedCount} / {badges.length} Badges
        </span>
      </div>

      {/* STATS TILES */}
      <div className="grid grid-cols-2 gap-3 my-4">
        {/* STREAK */}
        <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-white/5 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
            <Flame className="h-6 w-6 fill-amber-400" />
          </div>
          <div>
            <div className="text-xl font-black text-white">4 Days</div>
            <div className="text-[11px] text-slate-400">Current Streak</div>
          </div>
        </div>

        {/* COMPLETED WORKOUTS */}
        <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-white/5 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
            <Award className="h-6 w-6" />
          </div>
          <div>
            <div className="text-xl font-black text-white">{totalSessionsCount}</div>
            <div className="text-[11px] text-slate-400">Total Workouts</div>
          </div>
        </div>
      </div>

      {/* BODY WEIGHT PROGRESS TILE */}
      <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/5 flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Scale className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400">Current Weight</div>
            <div className="text-lg font-bold text-white flex items-center gap-1.5">
              <span>{currentWeight} kg</span>
              {weightDelta !== 0 && (
                <span className={`text-xs font-semibold flex items-center ${weightDelta < 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {weightDelta < 0 ? <ArrowDownRight className="h-3.5 w-3.5" /> : <ArrowUpRight className="h-3.5 w-3.5" />}
                  {Math.abs(weightDelta)} kg
                </span>
              )}
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowWeightInput(!showWeightInput)}
          className="text-xs font-bold text-emerald-400 hover:text-emerald-300 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 transition flex items-center gap-1"
        >
          <Plus className="h-3 w-3" />
          Log Weight
        </button>
      </div>

      {showWeightInput && (
        <form onSubmit={handleSaveWeight} className="p-3 mb-4 rounded-xl bg-slate-900 border border-emerald-500/30 flex items-center gap-2">
          <input
            type="number"
            step="0.1"
            value={newWeight}
            onChange={(e) => setNewWeight(e.target.value)}
            className="w-full bg-slate-950 px-3 py-1.5 text-sm rounded-lg text-white border border-white/10 focus:outline-none focus:border-emerald-500"
            placeholder="Weight in kg (e.g. 82.2)"
            autoFocus
          />
          <button
            type="submit"
            className="px-3 py-1.5 bg-emerald-500 text-slate-950 font-bold text-xs rounded-lg hover:bg-emerald-400 transition"
          >
            Save
          </button>
        </form>
      )}

      {/* RECENT BADGES ROW */}
      <div className="space-y-2">
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Recent Achievements</span>
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {badges.filter(b => b.isUnlocked).slice(0, 3).map(badge => (
            <div 
              key={badge.key}
              className="flex items-center gap-2 p-2 px-3 rounded-xl bg-slate-950/80 border border-purple-500/20 shrink-0"
              title={badge.description}
            >
              <span className="text-lg">{badge.icon}</span>
              <div className="text-left">
                <p className="text-xs font-bold text-white truncate max-w-[120px]">{badge.name}</p>
                <p className="text-[10px] text-slate-400">Unlocked</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
