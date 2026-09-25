'use client';

import React from 'react';
import { X, Play, CheckCircle2, AlertTriangle, Lightbulb, ArrowRightLeft, ExternalLink } from 'lucide-react';
import { ExerciseItem } from '@/types/fitness';

interface ExerciseDemoModalProps {
  exercise: ExerciseItem;
  onClose: () => void;
}

export function ExerciseDemoModal({ exercise, onClose }: ExerciseDemoModalProps) {
  // Extract YouTube ID if present
  let embedUrl = '';
  if (exercise.videoUrl) {
    if (exercise.videoUrl.includes('youtube.com/watch?v=')) {
      const id = exercise.videoUrl.split('watch?v=')[1]?.split('&')[0];
      embedUrl = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&mute=1&loop=1&playlist=${id}`;
    } else if (exercise.videoUrl.includes('youtu.be/')) {
      const id = exercise.videoUrl.split('youtu.be/')[1]?.split('?')[0];
      embedUrl = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&mute=1&loop=1&playlist=${id}`;
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-white/10 bg-slate-900 shadow-2xl p-5 sm:p-7"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="flex items-start justify-between pb-4 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                {exercise.category}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-800 text-slate-300">
                {exercise.difficulty}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">{exercise.name}</h2>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* VIDEO PLAYER CONTAINER */}
        <div className="my-5 overflow-hidden rounded-2xl border border-white/10 bg-slate-950 aspect-video relative flex items-center justify-center">
          {embedUrl ? (
            <iframe
              src={embedUrl}
              title={`${exercise.name} Demonstration`}
              className="h-full w-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : exercise.videoUrl ? (
            <a
              href={exercise.videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-center p-6 group"
            >
              <Play className="h-10 w-10 text-emerald-400 mx-auto mb-2 opacity-80 group-hover:scale-110 transition" />
              <p className="text-sm font-semibold text-white flex items-center justify-center gap-1.5">
                Find demonstration videos <ExternalLink className="h-3.5 w-3.5" />
              </p>
              <p className="text-xs text-slate-400 mt-1">Opens a YouTube search for &ldquo;{exercise.name}&rdquo;</p>
            </a>
          ) : (
            <div className="text-center p-6">
              <Play className="h-10 w-10 text-slate-500 mx-auto mb-2 opacity-80" />
              <p className="text-sm font-semibold text-white">No demonstration video available</p>
            </div>
          )}
        </div>

        {/* MUSCLE & EQUIPMENT SUMMARY */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="p-3 rounded-2xl bg-slate-950/60 border border-white/5">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Target Muscle</span>
            <p className="text-sm font-bold text-emerald-400 mt-0.5">{exercise.targetMuscle}</p>
            {exercise.secondaryMuscles.length > 0 && (
              <p className="text-[11px] text-slate-500 truncate mt-0.5">
                + {exercise.secondaryMuscles.join(', ')}
              </p>
            )}
          </div>

          <div className="p-3 rounded-2xl bg-slate-950/60 border border-white/5">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Required Equipment</span>
            <p className="text-sm font-bold text-white mt-0.5">{exercise.equipmentRequired}</p>
          </div>
        </div>

        {/* STEP BY STEP INSTRUCTIONS */}
        <div className="space-y-4 text-xs sm:text-sm">
          <div>
            <h4 className="font-bold text-white flex items-center gap-2 mb-2 text-sm">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              How to Perform
            </h4>
            <ol className="space-y-2 list-decimal list-inside text-slate-300">
              {exercise.instructions.map((step, idx) => (
                <li key={idx} className="leading-relaxed pl-1">{step}</li>
              ))}
            </ol>
          </div>

          {/* FORM TIPS */}
          {exercise.formTips.length > 0 && (
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
              <h4 className="font-bold text-emerald-300 flex items-center gap-2 mb-1.5 text-xs uppercase tracking-wider">
                <Lightbulb className="h-4 w-4 text-emerald-400" />
                Coach Form Tips
              </h4>
              <ul className="space-y-1 text-slate-300 text-xs">
                {exercise.formTips.map((tip, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-emerald-400">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* COMMON MISTAKES */}
          {exercise.commonMistakes.length > 0 && (
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20">
              <h4 className="font-bold text-rose-300 flex items-center gap-2 mb-1.5 text-xs uppercase tracking-wider">
                <AlertTriangle className="h-4 w-4 text-rose-400" />
                Common Mistakes to Avoid
              </h4>
              <ul className="space-y-1 text-slate-300 text-xs">
                {exercise.commonMistakes.map((mistake, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-rose-400">•</span>
                    <span>{mistake}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* SAFE ALTERNATIVES */}
          {(exercise.beginnerAlternative || exercise.advancedAlternative) && (
            <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-white/5 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <ArrowRightLeft className="h-3.5 w-3.5 text-cyan-400" />
                  Recommended Alternatives
                </span>
                <div className="flex gap-4 mt-1 text-xs">
                  {exercise.beginnerAlternative && (
                    <span className="text-slate-300">
                      Beginner: <strong className="text-emerald-400">{exercise.beginnerAlternative}</strong>
                    </span>
                  )}
                  {exercise.advancedAlternative && (
                    <span className="text-slate-300">
                      Advanced: <strong className="text-purple-400">{exercise.advancedAlternative}</strong>
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
