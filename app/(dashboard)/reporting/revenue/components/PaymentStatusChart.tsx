'use client';

import React from 'react';
import type { PaymentStatusItem } from '../actions';

const STATUS_COLORS: Record<string, string> = {
  'Success': '#34d399',
  'Failed': '#f87171',
  'Refunded': '#fbbf24',
};

export function PaymentStatusChart({ data }: { data: PaymentStatusItem[] }) {
  const total = data.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="bg-white p-6 rounded-[20px] border border-slate-100/50 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.05)] h-[400px] flex flex-col relative">
      <div className="mb-4">
        <h3 className="text-sm font-medium text-slate-500 mb-1">Payment Status</h3>
        <span className="text-2xl font-semibold text-slate-800">{total.toLocaleString()} <span className="text-sm font-normal text-slate-400">total</span></span>
      </div>

      {data.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-slate-400">
          No data available
        </div>
      ) : (
        <div className="flex-1 flex flex-col gap-4">
          {/* Status bars */}
          <div className="flex flex-col gap-3 flex-1 justify-center">
            {data.map((item) => {
              const percentage = total > 0 ? (item.count / total) * 100 : 0;
              const color = STATUS_COLORS[item.status] || '#94a3b8';
              return (
                <div key={item.status} className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                      <span className="text-sm font-medium text-slate-700">{item.status}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-800">{item.count}</span>
                      <span className="text-xs text-slate-400">({percentage.toFixed(1)}%)</span>
                    </div>
                  </div>
                  <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%`, backgroundColor: color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
