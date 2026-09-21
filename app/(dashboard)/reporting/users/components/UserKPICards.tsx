import React from 'react';
import { Users, UserPlus, CreditCard, Percent, Activity, Flame } from 'lucide-react';
import type { UserKPIs } from '../actions';

export function UserKPICards({ kpis }: { kpis: UserKPIs }) {
  const cards = [
    {
      title: 'Total Users',
      value: kpis.totalUsers.toLocaleString(),
      icon: Users,
      color: 'bg-indigo-50 text-indigo-600',
      description: 'All registered users',
    },
    {
      title: 'New Users (30d)',
      value: kpis.newUsers30d.toLocaleString(),
      icon: UserPlus,
      color: 'bg-emerald-50 text-emerald-600',
      description: 'Signups in last 30 days',
    },
    {
      title: 'Paying Users',
      value: kpis.payingUsers.toLocaleString(),
      icon: CreditCard,
      color: 'bg-sky-50 text-sky-600',
      description: 'At least one successful purchase',
    },
    {
      title: 'Conversion Rate',
      value: `${kpis.conversionRate}%`,
      icon: Percent,
      color: kpis.conversionRate > 10 ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600',
      description: 'Users who made a purchase',
    },
    {
      title: 'Active (7 Days)',
      value: kpis.activeUsers7d.toLocaleString(),
      icon: Activity,
      color: 'bg-violet-50 text-violet-600',
      description: 'Workout or water activity',
    },
    {
      title: 'Avg. Streak',
      value: kpis.avgStreak.toLocaleString(),
      icon: Flame,
      color: 'bg-orange-50 text-orange-600',
      description: 'Days of current streak',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 px-6 mb-6 flex-shrink-0">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div key={idx} className="bg-white rounded-[20px] p-5 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.05)] border border-slate-100/50 flex flex-col relative overflow-hidden group hover:shadow-[0_8px_32px_-8px_rgba(0,0,0,0.08)] transition-shadow duration-300">
            <div className="flex justify-between items-start mb-3">
              <p className="text-slate-500 text-xs font-medium">{card.title}</p>
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${card.color}`}>
                <Icon size={14} strokeWidth={2} />
              </div>
            </div>
            <div className="mt-auto">
              <p className="text-2xl font-semibold tracking-tight text-slate-800">{card.value}</p>
              <p className="text-slate-400 text-[11px] mt-1.5">{card.description}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
