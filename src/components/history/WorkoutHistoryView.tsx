'use client';

import React, { useState } from 'react';
import { History, Calendar, Clock, Flame, Dumbbell, Award, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import { useFitnessStore } from '@/lib/store/fitness-store';
import { WorkoutSession } from '@/types/fitness';

export function WorkoutHistoryView() {
  const { workoutSessions } = useFitnessStore();
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedSessionId(prev => prev === id ? null : id);
  };

  const totalSessions = workoutSessions.length;
  const totalVolumeAll = workoutSessions.reduce((acc, s) => acc + (s.totalVolumeKg || 0), 0);
  const totalMinutesAll = Math.round(workoutSessions.reduce((acc, s) => acc + (s.durationSeconds || 0), 0) / 60);

  return (
    <div className="space-y-6">
      {/* HEADER WITH STATS */}
      <div className="rounded-3xl border border-white/10 bg-slate-900/90 p-6 sm:p-8 shadow-xl backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                Workout Log
              </span>
              <span className="text-xs text-slate-400">Complete Training Telemetry</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">Workout History & Logs</h1>
          </div>
        </div>

        {/* METRICS TILES */}
        <div className="grid grid-cols-3 gap-3 mt-6">
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/5 text-center">
            <span className="text-[10px] text-slate-400 uppercase font-bold">Total Workouts</span>
            <p className="text-2xl font-black text-white mt-1">{totalSessions}</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/5 text-center">
            <span className="text-[10px] text-slate-400 uppercase font-bold">Total Volume</span>
            <p className="text-2xl font-black text-cyan-400 mt-1">{totalVolumeAll.toLocaleString()} <span className="text-xs font-normal">kg</span></p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/5 text-center">
            <span className="text-[10px] text-slate-400 uppercase font-bold">Time Trained</span>
            <p className="text-2xl font-black text-emerald-400 mt-1">{totalMinutesAll} <span className="text-xs font-normal">mins</span></p>
          </div>
        </div>
      </div>

      {/* SESSIONS LIST */}
      <div className="space-y-3">
        {workoutSessions.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-slate-900 border border-white/10">
            <Dumbbell className="h-10 w-10 text-slate-500 mx-auto mb-2" />
            <p className="text-sm font-bold text-white">No workouts recorded yet.</p>
            <p className="text-xs text-slate-400 mt-1">Start a workout from your dashboard to begin logging history!</p>
          </div>
        ) : (
          workoutSessions.map(session => {
            const isExpanded = expandedSessionId === session.id;
            return (
              <div
                key={session.id}
                className="rounded-3xl border border-white/10 bg-slate-900/80 p-5 shadow-xl transition overflow-hidden"
              >
                <div 
                  onClick={() => toggleExpand(session.id)}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <Dumbbell className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-white">{session.title}</h3>
                        {session.rpeScore && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-950 text-emerald-400 border border-emerald-500/20">
                            RPE {session.rpeScore}/10
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{new Date(session.startedAt).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-5">
                    <div className="text-right">
                      <div className="text-xs font-bold text-white">
                        {Math.round((session.durationSeconds || 0) / 60)} Mins • {session.totalVolumeKg || 0} kg
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {session.exercises.length} exercises logged
                      </div>
                    </div>

                    <button className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-950">
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* EXPANDED SET DETAILS */}
                {isExpanded && (
                  <div className="mt-5 pt-5 border-t border-white/10 space-y-4 animate-in fade-in duration-200">
                    {session.notes && (
                      <p className="text-xs text-slate-300 italic p-3 rounded-xl bg-slate-950/60 border border-white/5">
                        💬 Notes: &quot;{session.notes}&quot;
                      </p>
                    )}

                    {session.painReported && (
                      <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        <span>Joint Discomfort Reported: {session.painNotes || 'General pain noted'}</span>
                      </div>
                    )}

                    <div className="space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Set by Set Breakdown
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {session.exercises.map((ex, idx) => (
                          <div key={idx} className="p-3.5 rounded-2xl bg-slate-950 border border-white/5">
                            <h5 className="text-xs font-bold text-white mb-2">{ex.exerciseName}</h5>
                            <div className="space-y-1">
                              {ex.sets.map((st, sIdx) => (
                                <div key={sIdx} className="flex justify-between text-[11px] text-slate-400">
                                  <span>Set {st.setNumber}</span>
                                  <span className="font-semibold text-slate-200">
                                    {st.weightKg > 0 ? `${st.weightKg} kg × ` : ''}{st.completedReps} reps {st.completed ? '✓' : ''}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
