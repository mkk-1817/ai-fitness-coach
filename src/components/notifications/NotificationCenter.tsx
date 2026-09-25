'use client';

import React from 'react';
import { useFitnessStore } from '@/lib/store/fitness-store';
import { Bell, Check, Trash2, X, Dumbbell, Droplets, Utensils, Award } from 'lucide-react';

export function NotificationCenter({ onClose }: { onClose: () => void }) {
  const { notifications, markNotificationRead, clearAllNotifications } = useFitnessStore();

  const getIcon = (type: string) => {
    switch (type) {
      case 'workout': return <Dumbbell className="h-4 w-4 text-emerald-400" />;
      case 'water': return <Droplets className="h-4 w-4 text-cyan-400" />;
      case 'meal': return <Utensils className="h-4 w-4 text-amber-400" />;
      case 'milestone': return <Award className="h-4 w-4 text-purple-400" />;
      default: return <Bell className="h-4 w-4 text-slate-400" />;
    }
  };

  return (
    <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-white/10 bg-slate-900/95 p-4 shadow-2xl backdrop-blur-xl z-50 animate-in fade-in slide-in-from-top-2 duration-200">
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-emerald-400" />
          <h3 className="text-sm font-semibold text-white">Notifications</h3>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
            {notifications.length}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {notifications.length > 0 && (
            <button
              onClick={clearAllNotifications}
              className="text-xs text-slate-400 hover:text-rose-400 flex items-center gap-1 transition"
              title="Clear all"
            >
              <Trash2 className="h-3 w-3" />
              Clear
            </button>
          )}
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="max-h-80 overflow-y-auto divide-y divide-white/5 py-1">
        {notifications.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            No notifications right now. Keep crushing your goals!
          </div>
        ) : (
          notifications.map(n => (
            <div
              key={n.id}
              onClick={() => markNotificationRead(n.id)}
              className={`p-3 transition rounded-xl flex items-start gap-3 cursor-pointer my-1 ${
                n.read ? 'opacity-60 hover:bg-slate-800/40' : 'bg-slate-800/60 hover:bg-slate-800'
              }`}
            >
              <div className="p-2 rounded-lg bg-slate-950/60 border border-white/5 mt-0.5">
                {getIcon(n.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <h4 className="text-xs font-semibold text-white truncate">{n.title}</h4>
                  <span className="text-[10px] text-slate-500 whitespace-nowrap">
                    {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5 line-clamp-2">{n.message}</p>
              </div>
              {!n.read && (
                <span className="h-2 w-2 rounded-full bg-emerald-400 shrink-0 mt-1.5" />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
