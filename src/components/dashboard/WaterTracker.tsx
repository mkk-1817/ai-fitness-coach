'use client';

import React from 'react';
import { Droplets, Plus, RotateCcw } from 'lucide-react';
import { useFitnessStore } from '@/lib/store/fitness-store';

export function WaterTracker() {
  const { profile, waterLoggedMl, logWater } = useFitnessStore();

  const targetMl = profile.waterTargetMl || 3200;
  const pct = Math.min(100, Math.round((waterLoggedMl / targetMl) * 100));

  return (
    <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-5 sm:p-6 shadow-xl backdrop-blur-md flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Droplets className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Daily Hydration</h3>
              <p className="text-xs text-slate-400">Target: {(targetMl / 1000).toFixed(1)}L per day</p>
            </div>
          </div>
          <span className="text-xs font-bold text-cyan-400 px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20">
            {pct}%
          </span>
        </div>

        {/* WATER LEVEL VISUAL */}
        <div className="my-5 flex items-center gap-5">
          {/* Animated Water Vial */}
          <div className="relative h-28 w-14 rounded-2xl border-2 border-cyan-400/40 bg-slate-950 p-1 overflow-hidden shrink-0 shadow-inner">
            <div 
              className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-cyan-600 to-sky-400 rounded-b-xl transition-all duration-700 ease-out"
              style={{ height: `${pct}%` }}
            >
              <div className="absolute inset-0 bg-white/15 animate-pulse" />
            </div>
            {/* Tick marks */}
            <div className="absolute inset-0 flex flex-col justify-between p-1.5 pointer-events-none opacity-40">
              <span className="w-2 border-t border-white" />
              <span className="w-3 border-t border-white" />
              <span className="w-2 border-t border-white" />
              <span className="w-3 border-t border-white" />
            </div>
          </div>

          <div className="flex-1">
            <div className="text-3xl font-black text-white tracking-tight">
              {(waterLoggedMl / 1000).toFixed(2)} <span className="text-sm font-semibold text-slate-400">Liters</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {waterLoggedMl >= targetMl 
                ? '🎉 Daily hydration goal achieved! Excellent work.' 
                : `${Math.round(targetMl - waterLoggedMl)} ml remaining to hit target.`}
            </p>

            <div className="w-full bg-slate-800 rounded-full h-2 mt-3 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-cyan-500 to-sky-400 h-2 rounded-full transition-all duration-500" 
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* QUICK LOG BUTTONS */}
      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5">
        <button
          onClick={() => logWater(250)}
          className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-slate-800/80 hover:bg-cyan-500/20 hover:text-cyan-300 text-slate-200 text-xs font-bold border border-white/5 transition"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>+250 ml (Cup)</span>
        </button>
        <button
          onClick={() => logWater(500)}
          className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-slate-800/80 hover:bg-cyan-500/20 hover:text-cyan-300 text-slate-200 text-xs font-bold border border-white/5 transition"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>+500 ml (Bottle)</span>
        </button>
      </div>
    </div>
  );
}
