'use client';

import React, { useState } from 'react';
import { Search, Video, Filter, Dumbbell, Play, Layers } from 'lucide-react';
import { EXERCISE_LIBRARY_DATA } from '@/lib/data/exercise-data';
import { ExerciseDemoModal } from '../workout/ExerciseDemoModal';
import { ExerciseItem } from '@/types/fitness';

export function ExerciseLibraryView() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');
  const [activeDemo, setActiveDemo] = useState<ExerciseItem | null>(null);

  const categories = ['All', 'Chest', 'Back', 'Shoulders', 'Arms', 'Legs', 'Core'];
  const difficulties = ['All', 'Beginner', 'Intermediate', 'Advanced'];

  const filtered = EXERCISE_LIBRARY_DATA.filter(ex => {
    const matchesSearch = ex.name.toLowerCase().includes(search.toLowerCase()) ||
      ex.targetMuscle.toLowerCase().includes(search.toLowerCase()) ||
      ex.equipmentRequired.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCategory === 'All' || ex.category === selectedCategory;
    const matchesDiff = selectedDifficulty === 'All' || ex.difficulty === selectedDifficulty;
    return matchesSearch && matchesCat && matchesDiff;
  });

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="rounded-3xl border border-white/10 bg-slate-900/90 p-6 sm:p-8 shadow-xl backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                Exercise Database
              </span>
              <span className="text-xs text-slate-400">{EXERCISE_LIBRARY_DATA.length} Video-Verified Movements</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">Exercise Library & Video Guides</h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
              Step-by-step movement instructions, form cues, common mistakes, and video demonstrations for core movements.
              Your AI plans aren&apos;t limited to this list — every prescribed exercise and sport has its own how-to in the plan.
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search exercise, muscle, gear..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-white/10 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* CATEGORY FILTER CHIPS */}
        <div className="flex gap-2 overflow-x-auto pt-6 border-t border-white/10 mt-6 no-scrollbar">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap border ${
                selectedCategory === cat
                  ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                  : 'bg-slate-950 text-slate-400 border-white/5 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* EXERCISE GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(ex => (
          <div
            key={ex.id}
            className="rounded-3xl border border-white/10 bg-slate-900/80 p-5 shadow-xl hover:border-emerald-500/30 transition flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-950 text-emerald-400 border border-emerald-500/20">
                  {ex.category}
                </span>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-950 text-slate-400">
                  {ex.difficulty}
                </span>
              </div>

              <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition mb-1">
                {ex.name}
              </h3>
              <p className="text-xs text-slate-400 mb-3">
                Target: <strong className="text-slate-200">{ex.targetMuscle}</strong> • {ex.equipmentRequired}
              </p>

              <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed mb-4">
                {ex.instructions[0]}
              </p>
            </div>

            <div className="pt-3 border-t border-white/5 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">
                {ex.formTips.length} form tips
              </span>

              <button
                onClick={() => setActiveDemo(ex)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-950 hover:bg-emerald-500 text-slate-300 hover:text-slate-950 text-xs font-bold border border-white/10 hover:border-emerald-400 transition cursor-pointer"
              >
                <Play className="h-3.5 w-3.5 fill-current" />
                <span>Watch Demonstration</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {activeDemo && (
        <ExerciseDemoModal
          exercise={activeDemo}
          onClose={() => setActiveDemo(null)}
        />
      )}
    </div>
  );
}
