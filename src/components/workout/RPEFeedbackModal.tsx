'use client';

import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { soundEffects } from '@/lib/utils/audio';
import { Trophy, Check, AlertCircle, Sparkles, Smile, Frown, Zap } from 'lucide-react';

interface RPEFeedbackModalProps {
  onComplete: (feedback: {
    rpe: number;
    energy: number;
    soreness: number;
    painReported: boolean;
    painNotes?: string;
    notes?: string;
  }) => void;
  onCancel: () => void;
  sessionSummary: {
    title: string;
    durationSeconds: number;
    volumeKg: number;
  };
}

export function RPEFeedbackModal({ onComplete, onCancel, sessionSummary }: RPEFeedbackModalProps) {
  const [rpe, setRpe] = useState<number>(7);
  const [energy, setEnergy] = useState<number>(4);
  const [soreness, setSoreness] = useState<number>(2);
  const [painReported, setPainReported] = useState<boolean>(false);
  const [painNotes, setPainNotes] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  const rpeDescriptions: Record<number, string> = {
    1: 'Very Light (barely any effort)',
    2: 'Light (easy pace)',
    3: 'Moderate (could hold full conversation)',
    4: 'Somewhat Heavy',
    5: 'Challenging (breathing noticeably faster)',
    6: 'Hard (solid training intensity)',
    7: 'Very Hard (2-3 reps left in tank)',
    8: 'Heavy (1-2 reps left before failure)',
    9: 'Near Maximum (0-1 rep left)',
    10: 'Absolute Maximum (could not do another rep)',
  };

  const handleFinish = () => {
    // Play celebratory sound & trigger confetti!
    soundEffects.playVictoryFanfare();
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });

    onComplete({
      rpe,
      energy,
      soreness,
      painReported,
      painNotes: painReported ? painNotes : undefined,
      notes: notes.trim() || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl border border-emerald-500/30 bg-slate-900 shadow-2xl p-6 sm:p-7 max-h-[90vh] overflow-y-auto">
        {/* CELEBRATION HEADER */}
        <div className="text-center pb-5 border-b border-white/10">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 mb-3 shadow-lg shadow-emerald-500/30 animate-bounce">
            <Trophy className="h-7 w-7" />
          </div>
          <h2 className="text-2xl font-black text-white">Workout Complete!</h2>
          <p className="text-xs text-slate-400 mt-1">
            {sessionSummary.title} • {Math.round(sessionSummary.durationSeconds / 60)} mins • {sessionSummary.volumeKg} kg volume
          </p>
        </div>

        {/* FEEDBACK FORM */}
        <div className="my-5 space-y-5 text-left">
          {/* RPE SLIDER */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-bold text-white uppercase tracking-wider">
                Workout Difficulty (RPE)
              </label>
              <span className="text-sm font-black px-2.5 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                {rpe} / 10
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={rpe}
              onChange={(e) => setRpe(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
            />
            <p className="text-xs text-slate-400 mt-1 italic">
              {rpeDescriptions[rpe]}
            </p>
          </div>

          {/* ENERGY LEVEL */}
          <div>
            <label className="text-xs font-bold text-white uppercase tracking-wider block mb-2">
              Energy Level
            </label>
            <div className="grid grid-cols-5 gap-2">
              {[1, 2, 3, 4, 5].map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setEnergy(lvl)}
                  className={`py-2 text-xs font-bold rounded-xl border transition ${
                    energy === lvl
                      ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                      : 'bg-slate-950 text-slate-400 border-white/10 hover:border-white/20'
                  }`}
                >
                  {lvl === 1 ? 'Low' : lvl === 5 ? 'High' : `${lvl}`}
                </button>
              ))}
            </div>
          </div>

          {/* SORENESS */}
          <div>
            <label className="text-xs font-bold text-white uppercase tracking-wider block mb-2">
              Pre-workout Soreness
            </label>
            <div className="grid grid-cols-5 gap-2">
              {[1, 2, 3, 4, 5].map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setSoreness(lvl)}
                  className={`py-2 text-xs font-bold rounded-xl border transition ${
                    soreness === lvl
                      ? 'bg-cyan-500 text-slate-950 border-cyan-400'
                      : 'bg-slate-950 text-slate-400 border-white/10 hover:border-white/20'
                  }`}
                >
                  {lvl === 1 ? 'None' : lvl === 5 ? 'Severe' : `${lvl}`}
                </button>
              ))}
            </div>
          </div>

          {/* PAIN / DISCOMFORT CHECK */}
          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-white/5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200">
                Did you experience any pain or abnormal joint discomfort?
              </span>
              <button
                type="button"
                onClick={() => setPainReported(!painReported)}
                className={`px-3 py-1 text-xs font-bold rounded-lg border transition ${
                  painReported
                    ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                    : 'bg-slate-800 text-slate-400 border-white/10'
                }`}
              >
                {painReported ? 'Yes' : 'No'}
              </button>
            </div>

            {painReported && (
              <div>
                <input
                  type="text"
                  value={painNotes}
                  onChange={(e) => setPainNotes(e.target.value)}
                  placeholder="e.g. Left knee felt tender during squats"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-900 border border-rose-500/30 text-white placeholder-slate-500 focus:outline-none focus:border-rose-400"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Our AI Coach will automatically adapt future sessions to rest and deload this joint.
                </p>
              </div>
            )}
          </div>

          {/* GENERAL NOTES */}
          <div>
            <label className="text-xs font-bold text-white uppercase tracking-wider block mb-1">
              Personal Session Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Felt great on bench press, dumbbells felt light!"
              rows={2}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition"
          >
            Back to Workout
          </button>
          <button
            type="button"
            onClick={handleFinish}
            className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 px-6 py-3 text-xs font-extrabold text-slate-950 shadow-lg shadow-emerald-500/30 hover:scale-[1.02] active:scale-[0.98] transition cursor-pointer"
          >
            <Check className="h-4 w-4" />
            <span>Save & Log Session</span>
          </button>
        </div>
      </div>
    </div>
  );
}
