import Link from 'next/link';
import React from 'react';
import { ClipboardList, Dumbbell } from 'lucide-react';

export default function WorkoutSidebar({ view }: { view: string }) {
  return (
    <aside className="w-[68px] lg:w-[260px] border-r border-slate-200 bg-white flex flex-col flex-shrink-0 pt-6 transition-all">
      <h2 className="hidden lg:block text-[14px] font-semibold uppercase tracking-wider text-slate-400 px-6 mb-4">
        Workout
      </h2>
      <nav className="flex flex-col text-[14px] px-2 lg:px-3 space-y-1 items-center lg:items-stretch">
        <Link
          href="/workout?view=plans"
          title="Workout Plans"
          className={`w-11 lg:w-auto h-11 lg:h-auto text-left px-0 lg:px-3 py-2 rounded-xl font-medium flex items-center justify-center lg:justify-start gap-2.5 transition-colors ${view === 'plans' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'
            }`}
        >
          <ClipboardList size={18} className="flex-shrink-0" />
          <span className="hidden lg:inline truncate">Workout Plans</span>
        </Link>
        <Link
          href="/workout?view=exercises"
          title="Exercises"
          className={`w-11 lg:w-auto h-11 lg:h-auto text-left px-0 lg:px-3 py-2 rounded-xl font-medium flex items-center justify-center lg:justify-start gap-2.5 transition-colors ${view === 'exercises' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'
            }`}
        >
          <Dumbbell size={18} className="flex-shrink-0" />
          <span className="hidden lg:inline truncate">Exercises</span>
        </Link>
      </nav>
    </aside>
  );
}
