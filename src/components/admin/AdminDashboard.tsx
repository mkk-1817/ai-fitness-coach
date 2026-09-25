'use client';

import React, { useState } from 'react';
import { ShieldCheck, Database, Cpu, Utensils, Dumbbell, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { EXERCISE_LIBRARY_DATA } from '@/lib/data/exercise-data';
import { FOOD_DATABASE } from '@/lib/data/food-data';
import { isSupabaseConfigured } from '@/lib/supabase/client';

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'exercises' | 'foods' | 'ai' | 'supabase'>('exercises');
  const [groqModel, setGroqModel] = useState('llama-3.3-70b-versatile');

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-white/10 bg-slate-900/90 p-6 sm:p-8 shadow-xl backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-purple-500/15 text-purple-400 border border-purple-500/30">
                System Administration
              </span>
              <span className="text-xs text-slate-400">Database & AI Configuration</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">Management Console</h1>
          </div>

          <div className="flex items-center gap-2">
            <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border ${
              isSupabaseConfigured 
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
            }`}>
              {isSupabaseConfigured ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
              <span>{isSupabaseConfigured ? 'Supabase Connected' : 'Local State Engine Active'}</span>
            </span>
          </div>
        </div>

        {/* TABS */}
        <div className="flex gap-2 overflow-x-auto pt-6 border-t border-white/10 no-scrollbar">
          {[
            { id: 'exercises', label: `Exercises (${EXERCISE_LIBRARY_DATA.length})`, icon: Dumbbell },
            { id: 'foods', label: `Food DB (${FOOD_DATABASE.length})`, icon: Utensils },
            { id: 'ai', label: 'Groq AI Config', icon: Cpu },
            { id: 'supabase', label: 'Database Schema & RLS', icon: Database },
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap border ${
                  activeTab === tab.id
                    ? 'bg-purple-500 text-white border-purple-400 shadow-md'
                    : 'bg-slate-950 text-slate-400 border-white/5 hover:text-white'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB CONTENT: EXERCISES */}
      {activeTab === 'exercises' && (
        <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-xl space-y-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Exercise Library Seed Catalog</h3>
            <span className="text-xs text-slate-400">All entries include instructions & video URLs</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-white/10 text-slate-400 uppercase text-[10px]">
                <tr>
                  <th className="pb-3">Name</th>
                  <th className="pb-3">Category</th>
                  <th className="pb-3">Target Muscle</th>
                  <th className="pb-3">Equipment</th>
                  <th className="pb-3">Difficulty</th>
                  <th className="pb-3">Video Link</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300">
                {EXERCISE_LIBRARY_DATA.map(ex => (
                  <tr key={ex.id} className="hover:bg-slate-950/50">
                    <td className="py-2.5 font-bold text-white">{ex.name}</td>
                    <td className="py-2.5">{ex.category}</td>
                    <td className="py-2.5 text-emerald-400 font-semibold">{ex.targetMuscle}</td>
                    <td className="py-2.5">{ex.equipmentRequired}</td>
                    <td className="py-2.5">{ex.difficulty}</td>
                    <td className="py-2.5 text-cyan-400 truncate max-w-[150px]">{ex.videoUrl}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT: FOODS */}
      {activeTab === 'foods' && (
        <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-xl space-y-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Verified Nutritional Food Database</h3>
            <span className="text-xs text-slate-400">Includes South Indian, Tamil & Global templates</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-white/10 text-slate-400 uppercase text-[10px]">
                <tr>
                  <th className="pb-3">Food Item</th>
                  <th className="pb-3">Cuisine</th>
                  <th className="pb-3">Portion</th>
                  <th className="pb-3">Calories</th>
                  <th className="pb-3">Protein</th>
                  <th className="pb-3">Carbs</th>
                  <th className="pb-3">Fat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300">
                {FOOD_DATABASE.map(f => (
                  <tr key={f.id} className="hover:bg-slate-950/50">
                    <td className="py-2.5 font-bold text-white">{f.name}</td>
                    <td className="py-2.5 text-amber-400">{f.cuisine}</td>
                    <td className="py-2.5 text-slate-400">{f.portion}</td>
                    <td className="py-2.5 font-semibold text-white">{f.calories} kcal</td>
                    <td className="py-2.5 text-rose-400 font-bold">{f.proteinG}g</td>
                    <td className="py-2.5 text-cyan-400">{f.carbsG}g</td>
                    <td className="py-2.5 text-amber-400">{f.fatG}g</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT: AI CONFIG */}
      {activeTab === 'ai' && (
        <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-xl space-y-5">
          <div>
            <h3 className="text-base font-bold text-white">Groq AI Engine Configuration</h3>
            <p className="text-xs text-slate-400 mt-1">
              Configure models, system prompt guards, and response parsing behavior.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-950 border border-white/5 space-y-2">
              <label className="text-xs font-bold text-slate-300 block">Active Model</label>
              <select
                value={groqModel}
                onChange={(e) => setGroqModel(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-white"
              >
                <option value="llama-3.3-70b-versatile">llama-3.3-70b-versatile (Recommended)</option>
                <option value="llama-3.1-8b-instant">llama-3.1-8b-instant (Fastest)</option>
                <option value="mixtral-8x7b-32768">mixtral-8x7b-32768</option>
              </select>
              <p className="text-[11px] text-slate-500">Configurable server-side via GROQ_MODEL in .env.local</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-white/5 space-y-2">
              <label className="text-xs font-bold text-slate-300 block">JSON Validation Strategy</label>
              <div className="text-xs text-emerald-400 font-bold flex items-center gap-1.5 mt-1">
                <CheckCircle2 className="h-4 w-4" />
                <span>Strict Zod Schema Enforcement</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Automatic regex JSON markdown code block stripper & auto-repair fallback.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: SUPABASE SCHEMA */}
      {activeTab === 'supabase' && (
        <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-xl space-y-4">
          <div>
            <h3 className="text-base font-bold text-white">Supabase PostgreSQL Schema & Security</h3>
            <p className="text-xs text-slate-400 mt-1">
              Schema SQL file located at <code className="text-emerald-400 font-mono">supabase/schema.sql</code> and seed at <code className="text-emerald-400 font-mono">supabase/seed.sql</code>.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-white/5 space-y-2 text-xs text-slate-300">
            <p className="font-bold text-white">Configured Tables with Row Level Security (RLS):</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-slate-400">
              <span>• profiles</span>
              <span>• fitness_profiles</span>
              <span>• fitness_goals</span>
              <span>• user_equipment</span>
              <span>• dietary_preferences</span>
              <span>• exercise_library (Public)</span>
              <span>• workout_plans</span>
              <span>• workout_days</span>
              <span>• workout_exercises</span>
              <span>• workout_sessions</span>
              <span>• exercise_sets</span>
              <span>• meal_plans</span>
              <span>• meals</span>
              <span>• meal_logs</span>
              <span>• water_logs</span>
              <span>• weight_logs</span>
              <span>• body_measurement_logs</span>
              <span>• ai_conversations</span>
              <span>• weekly_reviews</span>
              <span>• gamification_badges</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
