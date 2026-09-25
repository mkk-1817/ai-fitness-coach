'use client';

import React, { useState } from 'react';
import { Ruler, Plus, Calendar, Check, Trash2 } from 'lucide-react';
import { useFitnessStore } from '@/lib/store/fitness-store';

export function MeasurementTracker() {
  const { bodyMeasurements, logBodyMeasurement } = useFitnessStore();

  const [waist, setWaist] = useState('');
  const [chest, setChest] = useState('');
  const [arms, setArms] = useState('');
  const [thighs, setThighs] = useState('');
  const [hips, setHips] = useState('');
  const [bodyFat, setBodyFat] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    logBodyMeasurement({
      waistCm: waist ? parseFloat(waist) : undefined,
      chestCm: chest ? parseFloat(chest) : undefined,
      armsCm: arms ? parseFloat(arms) : undefined,
      thighsCm: thighs ? parseFloat(thighs) : undefined,
      hipsCm: hips ? parseFloat(hips) : undefined,
      bodyFatPct: bodyFat ? parseFloat(bodyFat) : undefined,
    });

    setWaist('');
    setChest('');
    setArms('');
    setThighs('');
    setHips('');
    setBodyFat('');
    setShowAddForm(false);
  };

  const latest = bodyMeasurements[bodyMeasurements.length - 1];

  return (
    <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-5 sm:p-7 shadow-xl backdrop-blur-md space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Ruler className="h-5 w-5 text-cyan-400" />
            Body Measurements & Composition
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Track waist, chest, arms, and body fat percentage over time</p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md transition"
        >
          {showAddForm ? 'Cancel' : '+ New Measurement'}
        </button>
      </div>

      {/* LATEST TILES */}
      {latest && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          <div className="p-3 rounded-2xl bg-slate-950/70 border border-white/5 text-center">
            <span className="text-[10px] text-slate-400 uppercase font-bold">Waist</span>
            <p className="text-lg font-black text-white mt-0.5">{latest.waistCm || '--'} cm</p>
          </div>
          <div className="p-3 rounded-2xl bg-slate-950/70 border border-white/5 text-center">
            <span className="text-[10px] text-slate-400 uppercase font-bold">Chest</span>
            <p className="text-lg font-black text-white mt-0.5">{latest.chestCm || '--'} cm</p>
          </div>
          <div className="p-3 rounded-2xl bg-slate-950/70 border border-white/5 text-center">
            <span className="text-[10px] text-slate-400 uppercase font-bold">Arms</span>
            <p className="text-lg font-black text-white mt-0.5">{latest.armsCm || '--'} cm</p>
          </div>
          <div className="p-3 rounded-2xl bg-slate-950/70 border border-white/5 text-center">
            <span className="text-[10px] text-slate-400 uppercase font-bold">Thighs</span>
            <p className="text-lg font-black text-white mt-0.5">{latest.thighsCm || '--'} cm</p>
          </div>
          <div className="p-3 rounded-2xl bg-slate-950/70 border border-white/5 text-center">
            <span className="text-[10px] text-slate-400 uppercase font-bold">Hips</span>
            <p className="text-lg font-black text-white mt-0.5">{latest.hipsCm || '--'} cm</p>
          </div>
          <div className="p-3 rounded-2xl bg-slate-950/70 border border-white/5 text-center">
            <span className="text-[10px] text-cyan-400 uppercase font-bold">Body Fat %</span>
            <p className="text-lg font-black text-cyan-400 mt-0.5">{latest.bodyFatPct || '--'}%</p>
          </div>
        </div>
      )}

      {/* ADD FORM */}
      {showAddForm && (
        <form onSubmit={handleSubmit} className="p-5 rounded-2xl bg-slate-950 border border-cyan-500/30 space-y-4">
          <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Record New Tape Measurements</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Waist (cm)</label>
              <input
                type="number"
                step="0.1"
                placeholder="e.g. 86.5"
                value={waist}
                onChange={(e) => setWaist(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-xs text-white"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Chest (cm)</label>
              <input
                type="number"
                step="0.1"
                placeholder="e.g. 103"
                value={chest}
                onChange={(e) => setChest(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-xs text-white"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Arms / Biceps (cm)</label>
              <input
                type="number"
                step="0.1"
                placeholder="e.g. 36.5"
                value={arms}
                onChange={(e) => setArms(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-xs text-white"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Thighs (cm)</label>
              <input
                type="number"
                step="0.1"
                placeholder="e.g. 58.5"
                value={thighs}
                onChange={(e) => setThighs(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-xs text-white"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Hips (cm)</label>
              <input
                type="number"
                step="0.1"
                placeholder="e.g. 98"
                value={hips}
                onChange={(e) => setHips(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-xs text-white"
              />
            </div>
            <div>
              <label className="text-[11px] text-cyan-400 block mb-1">Body Fat % (Optional)</label>
              <input
                type="number"
                step="0.1"
                placeholder="e.g. 18.2"
                value={bodyFat}
                onChange={(e) => setBodyFat(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-xs text-white"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-cyan-500 text-slate-950 font-bold text-xs rounded-xl hover:bg-cyan-400 transition"
          >
            Save Measurements
          </button>
        </form>
      )}

      {/* MEASUREMENT LOGS LIST */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Measurement History</h3>
        {bodyMeasurements.map(m => (
          <div
            key={m.id}
            className="p-3 rounded-2xl bg-slate-950/60 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
          >
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-slate-400" />
              <span className="font-bold text-white">{m.date}</span>
            </div>
            <div className="flex flex-wrap gap-4 text-slate-300">
              {m.waistCm && <span>Waist: <strong className="text-white">{m.waistCm}cm</strong></span>}
              {m.chestCm && <span>Chest: <strong className="text-white">{m.chestCm}cm</strong></span>}
              {m.armsCm && <span>Arms: <strong className="text-white">{m.armsCm}cm</strong></span>}
              {m.thighsCm && <span>Thighs: <strong className="text-white">{m.thighsCm}cm</strong></span>}
              {m.bodyFatPct && <span className="text-cyan-400">BF: <strong>{m.bodyFatPct}%</strong></span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
