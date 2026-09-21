import React from 'react';
import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <>
      <aside className="w-[260px] border-r border-slate-200 bg-white flex flex-col flex-shrink-0 pt-6 animate-pulse">
        <div className="h-4 w-24 bg-slate-200 rounded ml-6 mb-6"></div>
        <nav className="flex flex-col px-3 space-y-2">
          <div className="h-9 w-full bg-slate-100 rounded-lg"></div>
          <div className="h-9 w-full bg-slate-50 rounded-lg"></div>
          <div className="h-9 w-full bg-slate-50 rounded-lg"></div>
        </nav>
      </aside>
      <main className="flex-1 overflow-y-auto bg-[#F8FAFC] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <Loader2 size={32} className="animate-spin text-indigo-500" />
          <p className="text-sm font-medium">Loading data...</p>
        </div>
      </main>
    </>
  );
}
