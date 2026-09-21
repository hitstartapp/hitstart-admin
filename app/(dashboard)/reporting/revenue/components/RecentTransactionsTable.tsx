import React from 'react';
import Link from 'next/link';
import type { RevenueTransaction } from '../actions';

export function RecentTransactionsTable({ transactions }: { transactions: RevenueTransaction[] }) {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const statusColors: Record<string, { bg: string; text: string; dot: string; border: string }> = {
    success: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500', border: 'border-emerald-100' },
    failed: { bg: 'bg-rose-50', text: 'text-rose-700', dot: 'bg-rose-500', border: 'border-rose-100' },
    refunded: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500', border: 'border-amber-100' },
  };

  return (
    <div className="bg-white rounded-[20px] border border-slate-100/50 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.05)] mx-6 mb-6 p-6 flex flex-col">
      <div className="mb-5">
        <h3 className="text-sm font-medium text-slate-500">Recent Transactions</h3>
      </div>
      <div className="overflow-x-auto -mx-6 px-6">
        <div className="flex flex-col min-w-full w-max">
          {/* Header */}
          <div className="sticky top-0 z-20 flex items-center bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-widest min-w-full w-max h-9">
            <div className="flex items-center gap-1 px-4 border-r border-slate-200 h-7 w-[120px] flex-shrink-0">Date</div>
            <div className="flex items-center gap-1 px-4 border-r border-slate-200 h-7 w-[160px] flex-shrink-0">User</div>
            <div className="flex items-center gap-1 px-4 border-r border-slate-200 h-7 w-[100px] flex-shrink-0">Type</div>
            <div className="flex items-center gap-1 px-4 border-r border-slate-200 h-7 w-[180px] flex-shrink-0">Plan</div>
            <div className="flex items-center gap-1 px-4 border-r border-slate-200 h-7 w-[160px] flex-shrink-0">Package</div>
            <div className="flex items-center justify-end gap-1 px-4 border-r border-slate-200 h-7 w-[100px] flex-shrink-0">Amount</div>
            <div className="flex items-center gap-1 px-4 h-7 flex-1 min-w-[140px]">Status</div>
          </div>
          
          {/* Body */}
          <div className="flex flex-col divide-y divide-slate-100 min-w-full w-max">
            {transactions.length > 0 ? (
              transactions.map((t) => {
                const colors = statusColors[t.status] || { bg: 'bg-slate-50', text: 'text-slate-700', dot: 'bg-slate-500', border: 'border-slate-200' };
                return (
                  <div key={t.id} className="flex items-center group border-b border-slate-100 hover:bg-slate-50/40 transition-colors bg-white">
                    <div className="px-4 border-r border-slate-200/50 text-[14px] flex items-center h-14 w-[120px] flex-shrink-0 text-slate-500">
                      {formatDate(t.date)}
                    </div>
                    <div className="px-4 border-r border-slate-200/50 text-[14px] flex items-center h-14 w-[160px] flex-shrink-0 font-medium truncate">
                      <Link href={`/users?userId=${t.user_id || ''}`} className="font-medium text-slate-800 hover:text-blue-600 transition-colors">
                        {t.user_name || (t.user_id ? t.user_id.slice(0, 8) + '...' : 'Unknown')}
                      </Link>
                    </div>
                    <div className="px-4 border-r border-slate-200/50 text-[14px] flex items-center h-14 w-[100px] flex-shrink-0">
                      <span className={`inline-flex items-center text-xs font-medium ${
                        t.type === 'Workout' ? 'text-sky-600' : 'text-pink-600'
                      }`}>
                        {t.type}
                      </span>
                    </div>
                    <div className="px-4 border-r border-slate-200/50 text-[14px] flex items-center h-14 w-[180px] flex-shrink-0 text-slate-600 truncate">
                      {t.planName}
                    </div>
                    <div className="px-4 border-r border-slate-200/50 text-[14px] flex items-center h-14 w-[160px] flex-shrink-0 text-slate-500 truncate">
                      {t.packageLabel}
                    </div>
                    <div className="px-4 border-r border-slate-200/50 text-[14px] flex items-center justify-end h-14 w-[100px] flex-shrink-0">
                      <span className="text-sm font-semibold text-slate-800">₹{t.amount.toLocaleString()}</span>
                    </div>
                    <div className="px-4 text-[14px] flex items-center h-14 flex-1 min-w-[140px]">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${colors.bg} ${colors.text} ${colors.border}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`}></span>
                        {t.status.charAt(0).toUpperCase() + t.status.slice(1)}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-8 text-center text-slate-400">
                No transactions found.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
