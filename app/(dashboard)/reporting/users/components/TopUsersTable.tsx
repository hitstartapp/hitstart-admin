import React from 'react';
import Link from 'next/link';
import { Trophy, Flame, Star } from 'lucide-react';
import type { TopUser } from '../actions';

const FITNESS_LEVEL_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  'Beginner': { bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-100' },
  'Intermediate': { bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-100' },
  'Advanced': { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-100' },
};

export function TopUsersTable({ users }: { users: TopUser[] }) {
  return (
    <div className="bg-white rounded-[20px] border border-slate-100/50 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.05)] mx-6 mb-6 p-6 flex flex-col">
      <div className="mb-5 flex items-center gap-2">
        <Trophy size={16} className="text-amber-500" />
        <h3 className="text-sm font-medium text-slate-500">Top Users by Experience</h3>
      </div>
      <div className="overflow-x-auto -mx-6 px-6">
        <div className="flex flex-col min-w-full w-max">
          {/* Header */}
          <div className="sticky top-0 z-20 flex items-center bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-widest min-w-full w-max h-9">
            <div className="flex items-center justify-center gap-1 px-4 border-r border-slate-200 h-7 w-[60px] flex-shrink-0">#</div>
            <div className="flex items-center gap-1 px-4 border-r border-slate-200 h-7 w-[160px] flex-shrink-0">User</div>
            <div className="flex items-center justify-center gap-1 px-4 border-r border-slate-200 h-7 w-[100px] flex-shrink-0">Level</div>
            <div className="flex items-center justify-center gap-1 px-4 border-r border-slate-200 h-7 w-[100px] flex-shrink-0">Streak</div>
            <div className="flex items-center justify-center gap-1 px-4 border-r border-slate-200 h-7 w-[120px] flex-shrink-0">Best Streak</div>
            <div className="flex items-center gap-1 px-4 border-r border-slate-200 h-7 w-[160px] flex-shrink-0">Fitness Level</div>
            <div className="flex items-center justify-end gap-1 px-4 border-r border-slate-200 h-7 w-[100px] flex-shrink-0">Coins</div>
            <div className="flex items-center justify-end gap-1 px-4 h-7 flex-1 min-w-[100px]">XP</div>
          </div>

          {/* Body */}
          <div className="flex flex-col divide-y divide-slate-100 min-w-full w-max">
            {users.length > 0 ? (
              users.map((user, idx) => {
                const levelColors = FITNESS_LEVEL_COLORS[user.fitness_level] || { bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-200' };
                return (
                  <div key={user.user_id} className="flex items-center group border-b border-slate-100 hover:bg-slate-50/40 transition-colors bg-white">
                    <div className="px-4 border-r border-slate-200/50 text-[14px] flex items-center justify-center h-14 w-[60px] flex-shrink-0">
                      <span className={`text-xs font-bold ${
                        idx === 0 ? 'text-amber-500' : idx === 1 ? 'text-slate-400' : idx === 2 ? 'text-orange-400' : 'text-slate-300'
                      }`}>
                        {idx + 1}
                      </span>
                    </div>
                    <div className="px-4 border-r border-slate-200/50 text-[14px] flex items-center h-14 w-[160px] flex-shrink-0 font-medium truncate">
                      <Link href={`/users?userId=${user.user_id}`} className="font-medium text-slate-800 hover:text-blue-600 transition-colors">
                        {user.user_name}
                      </Link>
                    </div>
                    <div className="px-4 border-r border-slate-200/50 text-[14px] flex items-center justify-center h-14 w-[100px] flex-shrink-0">
                      <span className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-600">
                        <Star size={12} /> {user.level}
                      </span>
                    </div>
                    <div className="px-4 border-r border-slate-200/50 text-[14px] flex items-center justify-center h-14 w-[100px] flex-shrink-0">
                      <span className="inline-flex items-center gap-1 text-sm font-medium text-orange-600">
                        <Flame size={12} /> {user.streak_current}
                      </span>
                    </div>
                    <div className="px-4 border-r border-slate-200/50 text-[14px] flex items-center justify-center h-14 w-[120px] flex-shrink-0 text-slate-500">
                      {user.streak_longest}
                    </div>
                    <div className="px-4 border-r border-slate-200/50 text-[14px] flex items-center h-14 w-[160px] flex-shrink-0">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${levelColors.bg} ${levelColors.text} ${levelColors.border}`}>
                        {user.fitness_level}
                      </span>
                    </div>
                    <div className="px-4 border-r border-slate-200/50 text-[14px] flex items-center justify-end h-14 w-[100px] flex-shrink-0 text-amber-600 font-medium">
                      {user.coins.toLocaleString()}
                    </div>
                    <div className="px-4 text-[14px] flex items-center justify-end h-14 flex-1 min-w-[100px] font-semibold text-slate-800">
                      {user.experience_points.toLocaleString()}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-8 text-center text-slate-400">
                No user data available.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
