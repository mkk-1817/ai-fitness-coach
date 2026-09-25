'use client';

import React from 'react';
import { CheckCircle2, Cloud, History, RotateCcw, Trash2 } from 'lucide-react';
import { isSupabaseConfigured } from '@/lib/supabase/client';

export interface PlanHistoryItem {
  id: string;
  title: string;
  createdAt: string;
  isActive: boolean;
  /** Short descriptor chips, e.g. workout type or cuisines. */
  tags: string[];
}

interface PlanHistoryPanelProps {
  title: string;
  items: PlanHistoryItem[];
  isLoading: boolean;
  error?: string | null;
  isGenerating: boolean;
  onActivate: (id: string) => void;
  onRegenerate: (id: string) => void;
  onDelete: (id: string) => void;
}

export function PlanHistoryPanel({
  title,
  items,
  isLoading,
  error,
  isGenerating,
  onActivate,
  onRegenerate,
  onDelete,
}: PlanHistoryPanelProps) {
  return (
    <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-5 sm:p-6 shadow-xl backdrop-blur-md">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <History className="h-4 w-4 text-emerald-400" />
          {title}
        </h3>
        <span className="text-[10px] text-slate-500 flex items-center gap-1">
          <Cloud className="h-3 w-3" />
          {isSupabaseConfigured ? 'Synced to Supabase' : 'Saved on this device'}
        </span>
      </div>

      {error && <p className="text-[11px] text-amber-400 mb-2">{error}</p>}

      {isLoading ? (
        <p className="text-xs text-slate-400 py-3">Loading saved plans…</p>
      ) : items.length === 0 ? (
        <p className="text-xs text-slate-500 py-3">No generated plans yet. Your AI plans will appear here.</p>
      ) : (
        <ul className="space-y-2 max-h-80 overflow-y-auto pr-1">
          {items.map(item => (
            <li
              key={item.id}
              className={`p-3 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                item.isActive ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-slate-950/60 border-white/5'
              }`}
            >
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate flex items-center gap-1.5">
                  {item.isActive && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />}
                  {item.title}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {new Date(item.createdAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                  {item.tags.length > 0 && ` • ${item.tags.join(' • ')}`}
                </p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                {!item.isActive && (
                  <button
                    onClick={() => onActivate(item.id)}
                    className="px-2.5 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 text-[11px] font-bold border border-emerald-500/30 transition"
                  >
                    Use this plan
                  </button>
                )}
                <button
                  onClick={() => onRegenerate(item.id)}
                  disabled={isGenerating}
                  title="Generate a fresh plan with the same settings"
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-slate-300 text-[11px] font-bold border border-white/10 transition"
                >
                  <RotateCcw className="h-3 w-3" />
                  Regenerate
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Delete "${item.title}" from your history?`)) onDelete(item.id);
                  }}
                  title="Delete from history"
                  className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-900 transition"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
