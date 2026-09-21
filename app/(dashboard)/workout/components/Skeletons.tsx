import React from 'react';
import { Loader2 } from 'lucide-react';

export function ExercisesSkeleton() {
  return (
    <div className="flex-1 flex gap-6 overflow-hidden w-full h-full min-h-0 bg-transparent">
      {/* LEFT: Exercises Table Skeleton */}
      <div className="w-[460px] flex flex-col min-h-0 bg-white border border-slate-200 shadow-sm overflow-hidden flex-shrink-0">
        <div className="flex items-center bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-widest flex-shrink-0 h-9">
          <div className="flex-1 px-4 border-r border-slate-200 h-7 flex items-center">Exercise Name</div>
          <div className="w-28 px-4 h-7 flex items-center justify-end">Category</div>
        </div>
        <div className="flex-grow flex flex-col items-center justify-center bg-white text-slate-400 gap-2">
          <Loader2 size={24} className="animate-spin text-indigo-500" />
          <span className="text-xs font-medium">Loading exercises...</span>
        </div>
      </div>
      {/* RIGHT: Variations Skeleton */}
      <div className="flex-1 flex flex-col min-h-0 bg-white border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-slate-50/50 border-b border-slate-200 flex items-center justify-between flex-shrink-0">
          <h2 className="text-[16px] font-bold text-slate-800">Variations</h2>
        </div>
        <div className="flex-grow flex flex-col items-center justify-center bg-white text-slate-400 gap-2">
          <Loader2 size={24} className="animate-spin text-indigo-500" />
          <span className="text-xs font-medium">Loading variations...</span>
        </div>
      </div>
    </div>
  );
}

export function PlansOrWorkoutsSkeleton({ title, view }: { title: string; view: string }) {
  return (
    <div className="flex-grow flex flex-col min-h-0 w-full bg-transparent">
      {/* Header placeholder matching InteractiveWorkoutTable header layout */}
      <div className="flex items-center justify-between mb-6 flex-shrink-0 px-6">
        <h1 className="text-[20px] font-semibold text-slate-800">{title}</h1>
        {view === 'plans' && (
          <div className="h-8 w-28 bg-slate-100 border border-slate-200 animate-pulse rounded-md" />
        )}
      </div>
      {/* Table skeleton */}
      <div className="bg-white border border-slate-200 shadow-sm flex-1 flex items-center justify-center min-h-0 overflow-hidden">
        <div className="flex flex-col items-center gap-3 text-slate-400 animate-pulse">
          <Loader2 size={32} className="animate-spin text-indigo-500" />
          <p className="text-sm font-medium">Loading data...</p>
        </div>
      </div>
    </div>
  );
}
