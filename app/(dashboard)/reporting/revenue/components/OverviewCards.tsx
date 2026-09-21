import React from 'react';
import { DollarSign, Dumbbell, Utensils, TrendingUp, RotateCcw, UserCheck } from 'lucide-react';
import type { RevenueKPIs } from '../actions';

function formatCurrency(amount: number): string {
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(1)}L`;
  }
  if (amount >= 1000) {
    return `₹${(amount / 1000).toFixed(1)}K`;
  }
  return `₹${amount.toLocaleString()}`;
}

export function OverviewCards({ kpis }: { kpis: RevenueKPIs }) {
  const cards = [
    {
      title: 'Total Revenue',
      value: formatCurrency(kpis.totalRevenue),
      icon: DollarSign,
      color: 'bg-emerald-50 text-emerald-600',
      description: 'All-time from successful purchases',
    },
    {
      title: 'Workout Revenue',
      value: formatCurrency(kpis.workoutRevenue),
      icon: Dumbbell,
      color: 'bg-sky-50 text-sky-600',
      description: 'From workout plan sales',
    },
    {
      title: 'Meal Revenue',
      value: formatCurrency(kpis.mealRevenue),
      icon: Utensils,
      color: 'bg-pink-50 text-pink-600',
      description: 'From meal plan sales',
    },
    {
      title: 'Purchases (7 Days)',
      value: kpis.recentPurchases.toLocaleString(),
      icon: TrendingUp,
      color: 'bg-indigo-50 text-indigo-600',
      description: 'All purchases this week',
    },
    {
      title: 'Refund Rate',
      value: `${kpis.refundRate}%`,
      icon: RotateCcw,
      color: kpis.refundRate > 5 ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600',
      description: 'Of all-time purchases',
    },
    {
      title: 'Avg. per User',
      value: formatCurrency(kpis.arpu),
      icon: UserCheck,
      color: 'bg-violet-50 text-violet-600',
      description: 'Revenue per paying user',
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
