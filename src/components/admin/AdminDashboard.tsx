'use client';

import React, { useCallback, useEffect, useState } from 'react';
import {
  Database,
  Cpu,
  Dumbbell,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Activity,
  Video,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { EXERCISE_LIBRARY_DATA } from '@/lib/data/exercise-data';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { useFitnessStore } from '@/lib/store/fitness-store';
import { MEAL_JSON_CONTRACT, WORKOUT_JSON_CONTRACT } from '@/lib/groq/prompts';
import { SPORTS_CARDIO_ACTIVITIES, WORKOUT_TYPE_OPTIONS, workoutTypeLabel } from '@/lib/fitness/workout-options';

type AdminTab = 'generation' | 'activities' | 'ai' | 'media' | 'supabase';

interface AIConfig {
  provider: string;
  model: string;
  isConfigured: boolean;
  features: string[];
}

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<AdminTab>('generation');
  const { workoutPlan, mealPlan, workoutPlanHistory, mealPlanHistory, workoutGeneration, dietGeneration } = useFitnessStore();

  const [aiConfig, setAiConfig] = useState<AIConfig | null>(null);
  const [configError, setConfigError] = useState<string | null>(null);

  const fetchConfig = useCallback(
    () =>
      fetch('/api/ai/config')
        .then(res => (res.ok ? res.json() : Promise.reject(new Error(`HTTP ${res.status}`))))
        .then((config: AIConfig) => {
          setAiConfig(config);
          setConfigError(null);
        })
        .catch(err => setConfigError(err instanceof Error ? err.message : 'Failed to load AI config')),
    []
  );

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  const tabs: { id: AdminTab; label: string; icon: typeof Dumbbell }[] = [
    { id: 'generation', label: 'AI Plan Generation', icon: Sparkles },
    { id: 'activities', label: 'Workout Types & Sports', icon: Activity },
    { id: 'ai', label: 'Groq AI Config', icon: Cpu },
    { id: 'media', label: 'Exercise Media Reference', icon: Video },
    { id: 'supabase', label: 'Database Schema & RLS', icon: Database },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-white/10 bg-slate-900/90 p-6 sm:p-8 shadow-xl backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-purple-500/15 text-purple-400 border border-purple-500/30">
                System Administration
              </span>
              <span className="text-xs text-slate-400">AI Generation & Database Configuration</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">Management Console</h1>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border ${
              aiConfig?.isConfigured
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
            }`}>
              {aiConfig?.isConfigured ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
              <span>{aiConfig ? (aiConfig.isConfigured ? 'Groq AI Connected' : 'Groq API Key Missing') : 'Checking AI…'}</span>
            </span>
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
        <div className="flex gap-2 overflow-x-auto pt-6 no-scrollbar">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
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

      {/* TAB CONTENT: AI PLAN GENERATION */}
      {activeTab === 'generation' && (
        <div className="space-y-4">
          <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-xl space-y-5">
            <div>
              <h3 className="text-base font-bold text-white">AI-First Plan Generation</h3>
              <p className="text-xs text-slate-400 mt-1">
                Workout plans, 7-day meal plans and food nutrition estimates are generated by the configured Groq model from each
                user&apos;s profile. There is no seeded food catalogue or fixed exercise list behind recommendations, and no template fallback.
              </p>
            </div>

            <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
              {[
                { title: '1. Profile context', body: 'Goal, experience, equipment, injuries, schedule, workout type, sports & cardio activities, diet type, cuisines, allergies, calorie & protein targets.' },
                { title: '2. Groq JSON mode', body: 'Prompt embeds a strict JSON contract; the model must answer with a single JSON object.' },
                { title: '3. Zod schema validation', body: 'Types, enums, ranges and exact 7-day structure are enforced before anything is shown or saved.' },
                { title: '4. Semantic review', body: 'Diet-type & allergen violations, daily calorie/protein targets, training-day count, preferred activities and avoided exercises are checked.' },
                { title: '5. Corrective retries', body: 'Up to 3 attempts, each re-prompted with the exact validation errors. Failures surface a retryable error in the UI.' },
                { title: '6. Persistence', body: 'Validated plans are saved to Supabase (plan_data JSONB, per-user RLS) with full history and one-click regeneration.' },
              ].map(step => (
                <li key={step.title} className="p-4 rounded-2xl bg-slate-950 border border-white/5">
                  <p className="font-bold text-white">{step.title}</p>
                  <p className="text-slate-400 mt-1 leading-relaxed">{step.body}</p>
                </li>
              ))}
            </ol>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { label: 'Workout plans', plan: workoutPlan, history: workoutPlanHistory.length, state: workoutGeneration.status, extra: workoutPlan ? workoutTypeLabel(workoutPlan.workoutType) : null },
              { label: '7-day meal plans', plan: mealPlan, history: mealPlanHistory.length, state: dietGeneration.status, extra: mealPlan?.cuisine || null },
            ].map(card => (
              <div key={card.label} className="rounded-3xl border border-white/10 bg-slate-900/80 p-5 shadow-xl text-xs space-y-1.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{card.label} (current user)</p>
                <p className="text-sm font-bold text-white">{card.plan?.title || 'No active plan'}</p>
                <p className="text-slate-400">
                  {card.history} saved in history • last request: {card.state}
                  {card.extra && ` • ${card.extra}`}
                  {card.plan?.aiModel && ` • ${card.plan.aiModel}`}
                </p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {[
              { title: 'Workout plan JSON contract', body: WORKOUT_JSON_CONTRACT },
              { title: '7-day meal plan JSON contract', body: MEAL_JSON_CONTRACT },
            ].map(c => (
              <details key={c.title} className="rounded-3xl border border-white/10 bg-slate-900/80 p-5 shadow-xl">
                <summary className="text-sm font-bold text-white cursor-pointer">{c.title}</summary>
                <pre className="mt-3 text-[10px] leading-relaxed text-emerald-300/90 bg-slate-950 rounded-2xl p-4 overflow-x-auto">{c.body}</pre>
              </details>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: WORKOUT TYPES & SPORTS */}
      {activeTab === 'activities' && (
        <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-xl space-y-6">
          <div>
            <h3 className="text-base font-bold text-white">Workout Types</h3>
            <p className="text-xs text-slate-400 mt-1">Options users pick when generating a plan. The AI adapts the weekly structure to each type.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-3">
              {WORKOUT_TYPE_OPTIONS.map(t => (
                <div key={t.value} className="p-3 rounded-2xl bg-slate-950 border border-white/5 text-xs">
                  <p className="font-bold text-white">{t.label}</p>
                  <p className="text-slate-400 mt-0.5">{t.description}</p>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Sports & Cardio Activities</h3>
            <p className="text-xs text-slate-400 mt-1">
              Quick-pick options (users can also add their own, e.g. kabaddi or hiking). Selected activities must appear in the generated week.
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              {SPORTS_CARDIO_ACTIVITIES.map(a => (
                <span
                  key={a.value}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold border ${
                    a.kind === 'cardio' ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30' : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                  }`}
                >
                  {a.value} <span className="opacity-60 font-normal">• {a.kind}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: AI CONFIG */}
      {activeTab === 'ai' && (
        <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-xl space-y-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-white">Groq AI Engine Configuration</h3>
              <p className="text-xs text-slate-400 mt-1">
                Read from the server environment (<code className="text-emerald-400">GROQ_API_KEY</code>, <code className="text-emerald-400">GROQ_MODEL</code>). The key never reaches the browser.
              </p>
            </div>
            <button
              onClick={fetchConfig}
              className="p-2 rounded-xl bg-slate-950 border border-white/10 text-slate-400 hover:text-white"
              aria-label="Refresh AI configuration"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>

          {configError && <p className="text-xs text-rose-400">Could not load configuration: {configError}</p>}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-950 border border-white/5 space-y-2">
              <label className="text-xs font-bold text-slate-300 block">Active Model</label>
              <p className="text-sm font-mono text-white">{aiConfig?.model ?? '—'}</p>
              <p className="text-[11px] text-slate-500">
                Change with GROQ_MODEL in .env.local (default llama-3.3-70b-versatile). Larger models give more reliable 7-day plans.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-white/5 space-y-2">
              <label className="text-xs font-bold text-slate-300 block">API Key</label>
              <div className={`text-xs font-bold flex items-center gap-1.5 ${aiConfig?.isConfigured ? 'text-emerald-400' : 'text-amber-400'}`}>
                {aiConfig?.isConfigured ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                <span>{aiConfig?.isConfigured ? 'Configured' : 'Not configured — generation requests will fail with a clear error'}</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-white/5 space-y-2 sm:col-span-2">
              <label className="text-xs font-bold text-slate-300 block">Response Validation</label>
              <div className="text-xs text-emerald-400 font-bold flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4" />
                <span>Strict Zod schema + semantic review, up to 3 corrective retries</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Enabled AI features: {aiConfig?.features.join(', ') ?? '—'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: EXERCISE MEDIA REFERENCE */}
      {activeTab === 'media' && (
        <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-xl space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Exercise Media Reference</h3>
            <p className="text-xs text-slate-400 mt-1">
              Not a source of recommendations. The AI may prescribe any exercise or activity; when a prescribed name matches one of these
              entries, its verified demo video and coaching notes are attached. Other exercises link to a YouTube search.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-white/10 text-slate-400 uppercase text-[10px]">
                <tr>
                  <th className="pb-3">Name</th>
                  <th className="pb-3">Target Muscle</th>
                  <th className="pb-3">Equipment</th>
                  <th className="pb-3">Demo Video</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300">
                {EXERCISE_LIBRARY_DATA.map(ex => (
                  <tr key={ex.id} className="hover:bg-slate-950/50">
                    <td className="py-2.5 font-bold text-white">{ex.name}</td>
                    <td className="py-2.5 text-emerald-400 font-semibold">{ex.targetMuscle}</td>
                    <td className="py-2.5">{ex.equipmentRequired}</td>
                    <td className="py-2.5 text-cyan-400 truncate max-w-[150px]">{ex.videoUrl}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT: SUPABASE SCHEMA */}
      {activeTab === 'supabase' && (
        <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-xl space-y-4">
          <div>
            <h3 className="text-base font-bold text-white">Supabase PostgreSQL Schema & Security</h3>
            <p className="text-xs text-slate-400 mt-1">
              Schema SQL in <code className="text-emerald-400 font-mono">supabase/schema.sql</code>. Existing projects apply{' '}
              <code className="text-emerald-400 font-mono">supabase/migrations/20260925000000_ai_generated_plans.sql</code> to add AI plan storage.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-white/5 space-y-2 text-xs text-slate-300">
            <p className="font-bold text-white">AI plan persistence</p>
            <ul className="space-y-1 text-slate-400">
              <li>• <span className="text-slate-200">workout_plans</span>: workout_type, preferred_activities, generation_options, plan_data (JSONB)</li>
              <li>• <span className="text-slate-200">meal_plans</span>: duration_days, ai_model, generation_options, plan_data (JSONB)</li>
              <li>• Existing per-user RLS (<code>auth.uid() = user_id</code>) protects every saved plan.</li>
            </ul>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-white/5 space-y-2 text-xs text-slate-300">
            <p className="font-bold text-white">Configured Tables with Row Level Security (RLS):</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-slate-400">
              <span>• profiles</span>
              <span>• fitness_profiles</span>
              <span>• fitness_goals</span>
              <span>• user_equipment</span>
              <span>• dietary_preferences</span>
              <span>• exercise_library (Public media)</span>
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
