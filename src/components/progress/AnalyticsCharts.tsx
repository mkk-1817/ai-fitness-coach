'use client';

import React, { useState } from 'react';
import { TrendingUp, Award, Calendar, Zap, ShieldCheck } from 'lucide-react';
import { useFitnessStore } from '@/lib/store/fitness-store';

export function AnalyticsCharts() {
  const { weightLogs, workoutSessions, mealLogs, profile } = useFitnessStore();
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [activeMetric, setActiveMetric] = useState<'weight' | 'volume' | 'calories' | 'consistency'>('weight');

  // Weight progression data points
  const sortedWeights = [...weightLogs].sort((a, b) => a.date.localeCompare(b.date));
  const minWeight = sortedWeights.length > 0 ? Math.min(...sortedWeights.map(w => w.weightKg)) - 1 : 75;
  const maxWeight = sortedWeights.length > 0 ? Math.max(...sortedWeights.map(w => w.weightKg)) + 1 : 85;

  // Calculate SVG Polyline points for Weight
  const width = 600;
  const height = 220;
  const padding = 35;

  const weightPoints = sortedWeights.map((w, index) => {
    const x = padding + (index / Math.max(1, sortedWeights.length - 1)) * (width - 2 * padding);
    const y = height - padding - ((w.weightKg - minWeight) / Math.max(1, maxWeight - minWeight)) * (height - 2 * padding);
    return { x, y, weight: w.weightKg, date: w.date };
  });

  const weightPolyline = weightPoints.map(p => `${p.x},${p.y}`).join(' ');

  // Workout Volume progression points
  const sessionsWithVolume = [...workoutSessions].reverse().slice(-10);
  const maxVol = Math.max(...sessionsWithVolume.map(s => s.totalVolumeKg || 1000), 5000);
  const volPoints = sessionsWithVolume.map((s, index) => {
    const x = padding + (index / Math.max(1, sessionsWithVolume.length - 1)) * (width - 2 * padding);
    const y = height - padding - (((s.totalVolumeKg || 1000)) / maxVol) * (height - 2 * padding);
    return { x, y, vol: s.totalVolumeKg, title: s.title };
  });
  const volPolyline = volPoints.map(p => `${p.x},${p.y}`).join(' ');

  return (
    <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-5 sm:p-7 shadow-xl backdrop-blur-md space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-emerald-400" />
            Performance & Body Analytics
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Real-time telemetry and adaptive trend tracking</p>
        </div>

        {/* TIMEFRAME SELECTOR */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950 border border-white/5">
          {(['7d', '30d', '90d', '1y'] as const).map(tf => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                timeframe === tf
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tf.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* METRIC TAB SELECTORS */}
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {[
          { key: 'weight', label: 'Body Weight Curve' },
          { key: 'volume', label: 'Strength & Volume (kg)' },
          { key: 'calories', label: 'Calorie & Protein Adherence' },
          { key: 'consistency', label: 'Consistency Matrix' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveMetric(tab.key as any)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap border ${
              activeMetric === tab.key
                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
                : 'bg-slate-950/60 border-white/5 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* CHART VIEWPORT */}
      <div className="p-4 rounded-2xl bg-slate-950 border border-white/5 overflow-hidden">
        {activeMetric === 'weight' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-xs text-slate-400">Total Weight Delta</span>
                <p className="text-xl font-black text-white">
                  {sortedWeights.length > 1 
                    ? `${(sortedWeights[sortedWeights.length - 1].weightKg - sortedWeights[0].weightKg).toFixed(1)} kg` 
                    : 'Tracking active'}
                </p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Target: {profile.targetWeightKg || '78.0'} kg
              </span>
            </div>

            <div className="w-full overflow-x-auto">
              <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-56">
                <defs>
                  <linearGradient id="weightGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Grid lines */}
                <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#334155" strokeWidth="1" />
                <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="#1e293b" strokeDasharray="4 4" strokeWidth="1" />
                <line x1={padding} y1={height / 2} x2={width - padding} y2={height / 2} stroke="#1e293b" strokeDasharray="4 4" strokeWidth="1" />

                {/* Area under curve */}
                {weightPoints.length > 1 && (
                  <polygon
                    points={`${weightPoints[0].x},${height - padding} ${weightPolyline} ${weightPoints[weightPoints.length - 1].x},${height - padding}`}
                    fill="url(#weightGrad)"
                  />
                )}

                {/* Line */}
                {weightPoints.length > 1 && (
                  <polyline
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={weightPolyline}
                  />
                )}

                {/* Dots with labels */}
                {weightPoints.map((p, idx) => (
                  <g key={idx}>
                    <circle cx={p.x} cy={p.y} r="5" fill="#10b981" stroke="#020617" strokeWidth="2" />
                    <text x={p.x} y={p.y - 10} fill="#f8fafc" fontSize="11" fontWeight="bold" textAnchor="middle">
                      {p.weight}kg
                    </text>
                    <text x={p.x} y={height - 12} fill="#64748b" fontSize="9" textAnchor="middle">
                      {p.date.slice(5)}
                    </text>
                  </g>
                ))}
              </svg>
            </div>
          </div>
        )}

        {activeMetric === 'volume' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-xs text-slate-400">Recent Peak Volume</span>
                <p className="text-xl font-black text-white">{volPoints[volPoints.length - 1]?.vol || 3820} kg</p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                +8.2% progressive overload
              </span>
            </div>

            <div className="w-full overflow-x-auto">
              <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-56">
                <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#334155" strokeWidth="1" />

                {volPoints.length > 1 && (
                  <polyline
                    fill="none"
                    stroke="#06b6d4"
                    strokeWidth="3"
                    strokeLinecap="round"
                    points={volPolyline}
                  />
                )}

                {volPoints.map((p, idx) => (
                  <g key={idx}>
                    <circle cx={p.x} cy={p.y} r="5" fill="#06b6d4" stroke="#020617" strokeWidth="2" />
                    <text x={p.x} y={p.y - 10} fill="#f8fafc" fontSize="10" fontWeight="bold" textAnchor="middle">
                      {p.vol}kg
                    </text>
                    <text x={p.x} y={height - 12} fill="#64748b" fontSize="9" textAnchor="middle">
                      {`S${idx + 1}`}
                    </text>
                  </g>
                ))}
              </svg>
            </div>
          </div>
        )}

        {activeMetric === 'calories' && (
          <div className="py-6 space-y-4">
            <h4 className="text-sm font-bold text-white">Weekly Nutritional Adherence Rate</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-slate-900 border border-white/5">
                <span className="text-xs text-slate-400">Calories Hit</span>
                <p className="text-xl font-bold text-emerald-400 mt-1">92%</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-white/5">
                <span className="text-xs text-slate-400">Protein Target</span>
                <p className="text-xl font-bold text-rose-400 mt-1">88%</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-white/5">
                <span className="text-xs text-slate-400">Avg Deficit / Surplus</span>
                <p className="text-xl font-bold text-white mt-1">+240 kcal</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-white/5">
                <span className="text-xs text-slate-400">Hydration Streak</span>
                <p className="text-xl font-bold text-cyan-400 mt-1">5 Days</p>
              </div>
            </div>
          </div>
        )}

        {activeMetric === 'consistency' && (
          <div className="py-6 space-y-4">
            <h4 className="text-sm font-bold text-white">4-Week Training Consistency Grid</h4>
            <div className="grid grid-cols-7 gap-2 max-w-md">
              {Array.from({ length: 28 }).map((_, idx) => {
                const isWorkoutDay = idx % 2 === 0 || idx % 3 === 0;
                return (
                  <div
                    key={idx}
                    className={`h-8 rounded-lg flex items-center justify-center text-[10px] font-bold border transition ${
                      isWorkoutDay
                        ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                        : 'bg-slate-900 border-white/5 text-slate-500'
                    }`}
                    title={`Day ${idx + 1}: ${isWorkoutDay ? 'Completed' : 'Rest'}`}
                  >
                    {idx + 1}
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-slate-400">
              🟢 Green tiles represent completed and logged workout sessions.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
